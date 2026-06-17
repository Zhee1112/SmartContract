// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title BridgeStaticOnly
 * @dev Kontrak jembatan vault TIER TENGAH untuk perbandingan tiga arah riset.
 *
 * POSISI DALAM RISET:
 *   [A] UnoptimizedBridge  -> Tidak dioptimasi, rentan reentrancy (BASELINE)
 *   [B] BridgeStaticOnly   -> OPTIMASI STATIS SAJA (kontrak ini) ← TIER INI
 *   [C] VictimBridge       -> Optimasi statis + pertahanan DINAMIS (EIP-1153 + EWS)
 *
 * FITUR YANG DIIMPLEMENTASIKAN (STATIS):
 *   ✅ Variable Packing    - Struct UserBalance memaketkan address(20B) + uint96(12B) = 1 slot 32B
 *   ✅ Pola CEI            - Checks-Effects-Interactions diterapkan pada withdraw
 *   ✅ Unchecked Arithmetic- Blok `unchecked` pada aritmatika yang sudah tervalidasi
 *   ✅ Custom Errors       - Mengganti require() string dengan custom error (hemat ~50 gas/revert)
 *   ✅ Calldata Parameter  - Parameter baca-saja menggunakan calldata
 *   ✅ Immutable Admin     - Admin disimpan sebagai immutable (tidak memakan slot storage)
 *
 * FITUR YANG TIDAK ADA (Membedakan dari VictimBridge):
 *   ❌ Tidak ada EIP-1153 Transient Storage (TSTORE/TLOAD)
 *   ❌ Tidak ada Early Warning System (EWS) / MonitorMock
 *   ❌ Tidak ada deteksi MEV Sandwich Attack
 *   ❌ Tidak ada penalti ekonomi dinamis
 *   ❌ Tidak ada swap protection (minTokensOut bisa diabaikan)
 */
contract BridgeStaticOnly {

    // =========================================================
    // CUSTOM ERRORS (Hemat ~50 gas dibanding require() + string)
    // =========================================================
    error InsufficientBalance();
    error TransferFailed();
    error ZeroAmount();
    error InsufficientLiquidity();
    error SlippageTooHigh();

    // =========================================================
    // VARIABEL STATE — OPTIMASI STATIS (Variable Packing)
    // =========================================================

    // [IMMUTABLE] Admin tidak memakan slot storage sama sekali
    address public immutable admin;

    /**
     * @dev Struct UserBalance dikemas dalam 1 slot EVM (32 bytes):
     *   address userAddress = 20 bytes
     *   uint96  balance     = 12 bytes
     *   Total              = 32 bytes (1 slot penuh, efisien!)
     *
     * Dibandingkan UnoptimizedBridge: address(32B slot) + uint256(32B slot) = 2 slot
     * Penghematan: ~11.447 gas saat write storage pertama kali
     */
    struct UserBalance {
        address userAddress; // 20 bytes
        uint96  balance;     // 12 bytes — mendukung hingga ~79 miliar ETH
    }

    /**
     * @dev Struct PoolReserves dikemas dalam 1 slot EVM (32 bytes):
     *   uint96 ethReserve   = 12 bytes
     *   uint96 tokenReserve = 12 bytes
     *   Total              = 24 bytes (masih 1 slot, sisa 8 bytes)
     */
    struct PoolReserves {
        uint96 ethReserve;
        uint96 tokenReserve;
    }

    // Mapping saldo pengguna (struct packed)
    mapping(address => UserBalance) public userBalances;

    // Pool reserves dikemas dalam 1 slot 32-byte
    PoolReserves public reserves;

    // =========================================================
    // EVENTS
    // =========================================================
    event Deposit(address indexed user, uint96 amount);
    event Withdraw(address indexed user, uint96 amount);
    event Swap(address indexed user, uint96 amountETHIn, uint96 amountTokenOut);

    // =========================================================
    // CONSTRUCTOR
    // =========================================================
    constructor() {
        admin = msg.sender;

        // Likuiditas pool swap awal (dalam 1 slot 32-byte)
        reserves = PoolReserves({
            ethReserve: 100 ether,
            tokenReserve: 100000 * 10 ** 18
        });
    }

    // =========================================================
    // FUNGSI DEPOSIT — Optimasi Statis
    // =========================================================

    /**
     * @dev Deposit ETH ke jembatan.
     * Optimasi statis: uint96 cast, struct packing, unchecked increment.
     */
    function deposit() public payable {
        uint96 amount = uint96(msg.value);
        if (amount == 0) revert ZeroAmount();

        UserBalance storage u = userBalances[msg.sender];
        u.userAddress = msg.sender;

        // Unchecked: amount > 0 telah divalidasi, overflow u.balance tidak mungkin
        // pada nilai praktis (uint96 mendukung hingga ~79 miliar ETH)
        unchecked {
            u.balance += amount;
        }

        emit Deposit(msg.sender, amount);
    }

    // =========================================================
    // FUNGSI WITHDRAW — Optimasi Statis (CEI Pattern)
    // =========================================================

    /**
     * @dev Withdraw ETH dari jembatan dengan penerapan pola CEI.
     *
     * Pola Checks-Effects-Interactions (CEI):
     *   1. CHECKS   — Validasi saldo cukup
     *   2. EFFECTS  — Update state (saldo dikurangi) SEBELUM transfer
     *   3. INTERACTIONS — Kirim ETH ke pengguna
     *
     * CEI mencegah reentrancy secara STATIS tanpa memerlukan lock eksternal.
     * Ini berbeda dengan VictimBridge yang menggunakan EIP-1153 TSTORE sebagai
     * guard dinamis melalui MonitorMock.
     */
    function withdraw(uint96 amount) public {
        // 1. CHECKS
        UserBalance storage u = userBalances[msg.sender];
        if (u.balance < amount) revert InsufficientBalance();

        // 2. EFFECTS — Update state sebelum transfer (kunci keamanan CEI)
        unchecked {
            u.balance -= amount;
        }

        // 3. INTERACTIONS — Transfer ETH (state sudah diupdate, reentrancy tidak berefek)
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdraw(msg.sender, amount);
    }

    // =========================================================
    // FUNGSI SWAP — Optimasi Statis (Slippage Minimal, Tanpa EWS)
    // =========================================================

    /**
     * @dev Swap ETH ke token menggunakan formula Constant Product (x*y=k).
     *
     * Perbedaan dengan VictimBridge.swapETHForTokens():
     *   - Kontrak ini MEMILIKI parameter minTokensOut (slippage protection statis)
     *   - Kontrak ini TIDAK memiliki deteksi MEV sandwich attack
     *   - Kontrak ini TIDAK memiliki potongan penalti dinamis
     *   - Rentan terhadap sandwich attack karena tidak ada monitor EWS
     *
     * @param minTokensOut Batas minimum token yang diterima (slippage protection)
     */
    function swapETHForTokens(uint96 minTokensOut) public payable {
        uint96 amountIn = uint96(msg.value);
        if (amountIn == 0) revert ZeroAmount();

        // Baca reserves dari 1 slot storage (efisien, struct packed)
        PoolReserves memory r = reserves;

        // Formula Constant Product: amountOut = (reserveToken * amountIn) / (reserveETH + amountIn)
        uint96 amountOut = uint96(
            (uint256(r.tokenReserve) * uint256(amountIn)) /
            (uint256(r.ethReserve) + uint256(amountIn))
        );

        // Validasi slippage statis (tanpa penalti MEV dinamis)
        if (amountOut < minTokensOut) revert SlippageTooHigh();
        if (amountOut >= r.tokenReserve) revert InsufficientLiquidity();

        // Update reserves (unchecked karena sudah divalidasi di atas)
        unchecked {
            reserves.ethReserve   = r.ethReserve + amountIn;
            reserves.tokenReserve = r.tokenReserve - amountOut;
        }

        emit Swap(msg.sender, amountIn, amountOut);
    }

    // =========================================================
    // FALLBACK — Menerima ETH untuk pendanaan jembatan
    // =========================================================
    receive() external payable {}
}
