// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./MonitorMock.sol";

/**
 * @title VictimBridge
 * @author Skripsi - Optimasi Smart Contract
 * @notice Jembatan vault dengan optimasi statis (gas packing) dan dinamis (Early Warning System).
 * @dev Mengimplementasikan CEI pattern, variable packing, unchecked math, custom errors,
 *      dan integrasi EWS (MonitorMock) menggunakan EIP-1153 transient storage.
 *
 *  Architecture:
 *   - Tier [C]: Static optimizations + Dynamic EWS protection
 *   - UserBalance packed into 32-byte slot (address 20B + uint96 12B = 32B)
 *   - PoolReserves packed into 32-byte slot (uint96 + uint96 = 24B)
 *   - EWS integration: MEV sandwich detection + economic penalty
 *   - Reentrancy protection via EIP-1153 TSTORE/TLOAD (auto-reset per tx)
 */
contract VictimBridge {
    // CUSTOM ERRORS (Hemat ~50 gas dibanding require + string)
    error ZeroAmount();
    error InsufficientBalance();
    error TransferFailed();
    error SlippageTooHigh();
    error InsufficientLiquidity();
    error BridgeSecurityBlocked(string reason);
    error NotAdmin();
    error WhenPaused();
    error WhenNotPaused();

    // 1. VARIABLE PACKING STRUCT (Slot-efficient)
    struct UserBalance {
        address userAddress; // 20 bytes
        uint96 balance;      // 12 bytes (Dapat menampung hingga 79 miliar ETH)
    }

    struct PoolReserves {
        uint96 ethReserve;   // 12 bytes
        uint96 tokenReserve; // 12 bytes
    }

    // Pemetaan saldo terkompresi (menghemat ~11,447 gas saat deployment dan modifikasi)
    mapping(address => UserBalance) public userBalances;
    
    // Pool reserves dikemas dalam 1 slot 32-byte
    PoolReserves public reserves;

    // EWS Monitor Contract
    MonitorMock public monitor;
    address public immutable admin;
    bool public paused;

    // EVENTS
    event Deposit(address indexed user, uint96 amount, uint96 newBalance);
    event Withdraw(address indexed user, uint96 amount, uint96 penalty, uint96 netAmount, uint96 remainingBalance);
    event Swap(address indexed user, uint96 amountETHIn, uint96 amountTokenOut, uint96 newEthReserve, uint96 newTokenReserve);
    event AnomalyDetected(string indexed anomalyType, address indexed user, uint256 severity, uint256 penaltyApplied);
    event AttackPrevented(string indexed attackType, address indexed attacker);
    event EmergencyPaused(address indexed admin);
    event EmergencyUnpaused(address indexed admin);

    constructor(address _monitor) {
        admin = msg.sender;
        monitor = MonitorMock(_monitor);
        
        // Likuiditas pool swap virtual terkemas dalam slot 32-byte
        reserves = PoolReserves({
            ethReserve: 100 ether,
            tokenReserve: 100000 * 10**18
        });
    }

    /**
     * @notice Deposit ETH ke jembatan dan catat ke EWS.
     * @dev Menggunakan unchecked increment (amount > 0 sudah divalidasi).
     *      UserBalance dipacking ke 1 slot untuk hemat gas.
     * @dev Auto-record ke MonitorMock untuk pelacakan sandwich attack.
     */
    function deposit() public payable {
        if (paused) revert WhenPaused();
        uint96 amount = uint96(msg.value);
        if (amount == 0) revert ZeroAmount();

        UserBalance storage u = userBalances[msg.sender];
        u.userAddress = msg.sender;
        
        unchecked {
            u.balance += amount;
        }

        emit Deposit(msg.sender, amount, u.balance);

        // Auto-record ke EWS (type 1 = victim transaction)
        monitor.recordTransaction(msg.sender, amount, 1);
    }

    /**
     * @dev Fungsi withdraw teroptimasi statis & dinamis.
     * 1. Menggunakan pola Checks-Effects-Interactions (CEI).
     * 2. Terintegrasi ke MonitorMock untuk deteksi reentrancy & penalti.
     * 3. Aritmatika menggunakan blok `unchecked` yang aman.
     */
    function withdraw(uint96 amount) public {
        if (paused) revert WhenPaused();
        // Auto-record ke EWS (type 1 = victim transaction)
        monitor.recordTransaction(msg.sender, amount, 1);

        // 1. CHECKS & WARNING SYSTEM ENTER
        monitor.enterCall();

        UserBalance storage u = userBalances[msg.sender];
        if (u.balance < amount) revert InsufficientBalance();

        // Evaluasi ancaman keamanan secara dinamis
        // checkAnomaly returns: (mustRevert, anomalyScore)
        (bool mustRevert, uint256 anomalyScore) = monitor.checkAnomaly(msg.sender, amount, 1);
        if (mustRevert) {
            monitor.exitCall();
            emit AttackPrevented("REENTRANCY_ATTACK", msg.sender);
            revert BridgeSecurityBlocked("REENTRANCY");
        }

        // Terapkan penalti ekonomi jika terdeteksi aktivitas mencurigakan
        uint96 penalty = 0;
        if (anomalyScore > 0) {
            penalty = uint96(monitor.calculatePenalty(amount, anomalyScore));
            emit AnomalyDetected("SUSPICIOUS_WITHDRAW", msg.sender, anomalyScore, penalty);
        }

        // 2. EFFECTS (State diupdate sebelum transfer eksternal - mematuhi CEI)
        uint96 netAmount;
        unchecked {
            netAmount = amount - penalty;
            u.balance -= amount; // Kurangi total saldo asli
        }

        // 3. INTERACTIONS (Kurangi call depth dan lakukan transfer)
        monitor.exitCall();

        (bool success, ) = msg.sender.call{value: netAmount}("");
        if (!success) revert TransferFailed();

        emit Withdraw(msg.sender, amount, penalty, netAmount, u.balance);
    }

    /**
     * @dev Swap teroptimasi dengan perlindungan slippage & penalti MEV dinamis.
     */
    function swapETHForTokens(uint96 minTokensOut) public payable {
        if (paused) revert WhenPaused();
        uint96 amountIn = uint96(msg.value);
        if (amountIn == 0) revert ZeroAmount();

        // Deteksi anomali MEV sandwich SEBELUM record (agar last tx adalah frontrun)
        (bool mustRevert, uint256 anomalyScore) = monitor.checkAnomaly(msg.sender, amountIn, 1);
        if (mustRevert) {
            emit AttackPrevented("MEV_SANDWICH", msg.sender);
            revert BridgeSecurityBlocked("MEV_SANDWICH");
        }

        // Auto-record ke EWS (type 1 = victim transaction) - SETELAH deteksi
        monitor.recordTransaction(msg.sender, amountIn, 1);

        // Membaca reserve pool terkompresi
        PoolReserves memory r = reserves;

        // Constant Product Formula: x * y = k
        uint96 amountOut = uint96((uint256(r.tokenReserve) * uint256(amountIn)) / (uint256(r.ethReserve) + uint256(amountIn)));
        if (amountOut < minTokensOut) revert SlippageTooHigh();
        if (amountOut >= r.tokenReserve) revert InsufficientLiquidity();

        // Jika terdeteksi sandwich, potong keuntungan penyerang (penalti ekonomi)
        if (anomalyScore > 0) {
            uint96 penalty = uint96(monitor.calculatePenalty(amountOut, anomalyScore));
            amountOut -= penalty;
            emit AnomalyDetected("MEV_SANDWICH", msg.sender, anomalyScore, penalty);
        }

        // Simpan kembali reserve terkompresi
        unchecked {
            reserves.ethReserve = r.ethReserve + amountIn;
            reserves.tokenReserve = r.tokenReserve - amountOut;
        }

        emit Swap(msg.sender, amountIn, amountOut, reserves.ethReserve, reserves.tokenReserve);
    }

    // Membantu mendanai jembatan
    receive() external payable {}

    /**
     * @notice Pause semua operasi bridge (emergency stop).
     * @dev Hanya admin yang dapat melakukan pause.
     */
    function pause() external {
        if (msg.sender != admin) revert NotAdmin();
        if (paused) revert WhenPaused();
        paused = true;
        emit EmergencyPaused(admin);
    }

    /**
     * @notice Unpause operasi bridge.
     * @dev Hanya admin yang dapat melakukan unpause.
     */
    function unpause() external {
        if (msg.sender != admin) revert NotAdmin();
        if (!paused) revert WhenNotPaused();
        paused = false;
        emit EmergencyUnpaused(admin);
    }
}
