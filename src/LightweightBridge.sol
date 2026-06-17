// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title LightweightBridge
 * @author Skripsi - Optimasi Smart Contract
 * @notice Jembatan vault dengan keamanan Tier D: CEI + EIP-1153 inline + single-slot MEV + inline penalty.
 * @dev Tier D mengimplementasikan semua fitur keamanan Tier C (VictimBridge) tapi di-inline
 *      ke dalam satu kontrak tanpa external calls ke MonitorMock.
 *
 *  Architecture:
 *   - Tier [D]: Static optimizations + Dynamic inline protection
 *   - UserBalance packed into 32-byte slot (address 20B + uint96 12B = 32B)
 *   - PoolReserves packed into 32-byte slot (uint96 + uint96 = 24B)
 *   - EIP-1153 TSTORE/TLOAD inline (reentrancy guard, ~200 gas)
 *   - Single-slot MEV detection (replaces dynamic array, ~5,000 gas)
 *   - Inline economic penalty (pure math, ~300 gas)
 *   - Emergency pause via SSTORE (~100 gas)
 *
 *  Gas Comparison:
 *   - Tier A (Unoptimized): ~37,765 gas deposit
 *   - Tier B (Static Only):  ~35,643 gas deposit
 *   - Tier D (Lightweight):  ~36,500 gas deposit (Tier B + ~5-20%)
 *   - Tier C (Full Dynamic): ~152,352 gas deposit (4.3x Tier B)
 */
contract LightweightBridge {
    error ZeroAmount();
    error InsufficientBalance();
    error TransferFailed();
    error SlippageTooHigh();
    error InsufficientLiquidity();
    error NotAdmin();
    error WhenPaused();
    error WhenNotPaused();
    error ReentrancyDetected();

    uint256 private constant REENTRANCY_SLOT = 1;

    struct UserBalance {
        address userAddress;
        uint96 balance;
    }

    struct PoolReserves {
        uint96 ethReserve;
        uint96 tokenReserve;
    }

    struct LastTx {
        address sender;
        uint8 txType;
    }

    mapping(address => UserBalance) public userBalances;
    PoolReserves public reserves;

    LastTx public lastTx;
    uint256 public lastTxBlock;

    address public immutable admin;
    bool public paused;

    uint256 public constant P_DETECT = 9600;
    uint256 public constant LAMBDA = 15000;

    event Deposit(address indexed user, uint96 amount, uint96 newBalance);
    event Withdraw(address indexed user, uint96 amount, uint96 penalty, uint96 netAmount, uint96 remainingBalance);
    event Swap(address indexed user, uint96 amountETHIn, uint96 amountTokenOut, uint96 newEthReserve, uint96 newTokenReserve);
    event AnomalyDetected(string indexed anomalyType, address indexed user, uint256 severity, uint256 penaltyApplied);
    event AttackPrevented(string indexed attackType, address indexed attacker);
    event EmergencyPaused(address indexed admin);
    event EmergencyUnpaused(address indexed admin);

    constructor() {
        admin = msg.sender;

        reserves = PoolReserves({
            ethReserve: 100 ether,
            tokenReserve: 100000 * 10**18
        });
    }

    function _enterCall() private {
        assembly {
            tstore(REENTRANCY_SLOT, 1)
        }
    }

    function _exitCall() private {
        assembly {
            tstore(REENTRANCY_SLOT, 0)
        }
    }

    function _callDepth() private view returns (uint256 depth) {
        assembly {
            depth := tload(REENTRANCY_SLOT)
        }
    }

    function _checkAnomaly(address sender, uint8 txType) private returns (uint256) {
        if (lastTxBlock != block.number) return 0;
        if (txType != 1 || lastTx.txType != 0) return 0;
        emit AnomalyDetected("MEV_SANDWICH_DETECTED", sender, P_DETECT, 0);
        return P_DETECT;
    }

    function _recordTransaction(address sender, uint8 txType) private {
        lastTx = LastTx({sender: sender, txType: txType});
        lastTxBlock = block.number;
    }

    /**
     * @dev Mencatat transaksi frontrun (txType=0) oleh monitoring service / relayer.
     *      Digunakan oleh EWS off-chain untuk mendeteksi pola MEV sandwich.
     */
    function recordFrontrun(address attacker, uint256 amount) external {
        lastTx = LastTx({sender: attacker, txType: 0});
        lastTxBlock = block.number;
    }

    function _calculatePenalty(uint256 amount, uint256 anomalyScore) private pure returns (uint256) {
        if (anomalyScore == 0) return 0;
        uint256 penalty = (amount * LAMBDA * anomalyScore) / 100000000;
        return penalty > amount ? amount : penalty;
    }

    function deposit() public payable {
        if (paused) revert WhenPaused();
        uint96 amount = uint96(msg.value);
        if (amount == 0) revert ZeroAmount();

        UserBalance storage u = userBalances[msg.sender];
        u.userAddress = msg.sender;

        unchecked {
            u.balance += amount;
        }

        _recordTransaction(msg.sender, 1);

        emit Deposit(msg.sender, amount, u.balance);
    }

    function withdraw(uint96 amount) public {
        if (paused) revert WhenPaused();

        UserBalance storage u = userBalances[msg.sender];
        if (u.balance < amount) revert InsufficientBalance();

        uint256 depth = _callDepth();
        if (depth > 0) revert ReentrancyDetected();
        _enterCall();

        uint256 anomalyScore = _checkAnomaly(msg.sender, 1);

        uint96 penalty = 0;
        if (anomalyScore > 0) {
            penalty = uint96(_calculatePenalty(amount, anomalyScore));
            emit AnomalyDetected("SUSPICIOUS_WITHDRAW", msg.sender, anomalyScore, penalty);
        }

        uint96 netAmount;
        unchecked {
            netAmount = amount - penalty;
            u.balance -= amount;
        }

        (bool success, ) = msg.sender.call{value: netAmount}("");
        if (!success) revert TransferFailed();

        _exitCall();
        _recordTransaction(msg.sender, 1);

        emit Withdraw(msg.sender, amount, penalty, netAmount, u.balance);
    }

    function swapETHForTokens(uint96 minTokensOut) public payable {
        if (paused) revert WhenPaused();
        uint96 amountIn = uint96(msg.value);
        if (amountIn == 0) revert ZeroAmount();

        uint256 depth = _callDepth();
        if (depth > 0) revert ReentrancyDetected();
        _enterCall();

        PoolReserves memory r = reserves;
        uint96 amountOut = uint96((uint256(r.tokenReserve) * uint256(amountIn)) / (uint256(r.ethReserve) + uint256(amountIn)));
        if (amountOut < minTokensOut) revert SlippageTooHigh();
        if (amountOut >= r.tokenReserve) revert InsufficientLiquidity();

        uint256 anomalyScore = _checkAnomaly(msg.sender, 1);
        if (anomalyScore > 0) {
            uint96 penalty = uint96(_calculatePenalty(amountOut, anomalyScore));
            amountOut -= penalty;
            emit AnomalyDetected("MEV_SANDWICH", msg.sender, anomalyScore, penalty);
        }

        unchecked {
            reserves = PoolReserves(r.ethReserve + amountIn, r.tokenReserve - amountOut);
        }

        _exitCall();
        _recordTransaction(msg.sender, 1);

        emit Swap(msg.sender, amountIn, amountOut, r.ethReserve + amountIn, r.tokenReserve - amountOut);
    }

    receive() external payable {}

    function pause() external {
        if (msg.sender != admin) revert NotAdmin();
        if (paused) revert WhenPaused();
        paused = true;
        emit EmergencyPaused(admin);
    }

    function unpause() external {
        if (msg.sender != admin) revert NotAdmin();
        if (!paused) revert WhenNotPaused();
        paused = false;
        emit EmergencyUnpaused(admin);
    }
}
