// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title MonitorMock
 * @author Skripsi - Optimasi Smart Contract
 * @notice Early Warning System (EWS) untuk mendeteksi anomali sandwich attack.
 * @dev Menggunakan EIP-1153 transient storage (TSTORE/TLOAD) untuk call depth tracking.
 *      Biaya: ~200 gas (2x TSTORE) vs ~22,900 gas (SSTORE cold + warm) sebelumnya.
 *      Auto-reset callDepth ke 0 setiap akhir transaksi (fitur EIP-1153).
 *
 *  Key Features:
 *   - MEV Sandwich Detection (Ta1 -> Tv -> Ta2 pattern)
 *   - Economic Penalty Calculation (Lambda * P_detect basis points)
 *   - EIP-1153 Transient Storage for gas-efficient reentrancy guard
 *   - Admin access control for parameter updates
 */
contract MonitorMock {
    // =========================================================
    // EIP-1153: TRANSIENT STORAGE SLOT untuk Call Depth Tracking
    // Slot 2 dipilih agar tidak konflik dengan slot VictimBridge (slot 1)
    // Reset OTOMATIS tiap akhir transaksi - tidak perlu SSTORE reset
    // =========================================================
    uint256 private constant CALL_DEPTH_SLOT = 2;

    // PARAMETER EKONOMI PERTAHANAN DINAMIS (Skala Basis Poin: 10000 = 100%)
    uint256 public P_detect; // Probabilitas Deteksi (e.g. 9600 = 96%)
    uint256 public lambda;   // Faktor Penalti Risiko (e.g. 15000 = 1.5)

    // ACCESS CONTROL
    error NotAdmin();
    address public admin;

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    // Riwayat Transaksi untuk simulasi MEV
    struct TransactionRecord {
        address sender;
        uint256 amount;
        uint256 blockNumber;
        uint8 txType; // 0 = Attacker Frontrun (Ta1), 1 = Victim (Tv), 2 = Attacker Backrun (Ta2)
    }

    TransactionRecord[] public txRecords;

    // EVENTS
    event AlertTriggered(string message, address indexed suspect, uint256 severity);
    event ParameterUpdated(uint256 newPDetect, uint256 newLambda);

    constructor() {
        admin = msg.sender;
        P_detect = 9600; // Target akurasi >96%
        lambda = 15000;  // Multiplier penalti 1.5
    }

    /**
     * @notice Update parameter EWS (hanya admin).
     * @param _pDetect Probabilitas deteksi dalam basis poin (10000 = 100%).
     * @param _lambda Faktor penalti risiko dalam basis poin (15000 = 1.5x).
     */
    function updateParameters(uint256 _pDetect, uint256 _lambda) external onlyAdmin {
        P_detect = _pDetect;
        lambda = _lambda;
        emit ParameterUpdated(_pDetect, _lambda);
    }

    /**
     * @dev Mencatat transaksi ke EWS untuk pelacakan sandwich attack.
     */
    function recordTransaction(address sender, uint256 amount, uint8 txType) external {
        txRecords.push(TransactionRecord({
            sender: sender,
            amount: amount,
            blockNumber: block.number,
            txType: txType
        }));
    }

    /**
     * @dev Membersihkan riwayat transaksi untuk simulasi baru.
     */
    function clearRecords() external onlyAdmin {
        delete txRecords;
    }

    /**
     * @dev Menaikkan call depth via TSTORE (EIP-1153).
     * Biaya: ~100 gas (TSTORE) vs ~20,000 gas (SSTORE cold) sebelumnya.
     */
    function enterCall() external {
        assembly {
            // TLOAD: baca call depth saat ini (100 gas)
            let depth := tload(CALL_DEPTH_SLOT)
            // TSTORE: simpan depth+1 (100 gas)
            tstore(CALL_DEPTH_SLOT, add(depth, 1))
        }
    }

    /**
     * @dev Menurunkan call depth via TSTORE (EIP-1153).
     * Biaya: ~100 gas (TSTORE) vs ~2,900 gas (SSTORE warm) sebelumnya.
     */
    function exitCall() external {
        assembly {
            // TLOAD: baca call depth saat ini (100 gas)
            let depth := tload(CALL_DEPTH_SLOT)
            // Hanya kurangi jika > 0
            if gt(depth, 0) {
                // TSTORE: simpan depth-1 (100 gas)
                tstore(CALL_DEPTH_SLOT, sub(depth, 1))
            }
        }
    }

    /**
     * @dev Getter call depth dari transient storage.
     * callDepth otomatis reset ke 0 setiap akhir transaksi (fitur EIP-1153).
     * @return depth Nilai call depth saat ini dari transient storage.
     */
    function callDepth() public view returns (uint256 depth) {
        assembly {
            depth := tload(CALL_DEPTH_SLOT)
        }
    }

    /**
     * @dev Fungsi pengecekan anomali dinamis — fokus pada deteksi MEV Sandwich.
     * Catatan: Deteksi reentrancy kini ditangani oleh VictimBridge.nonReentrantTransient
     *          menggunakan TSTORE/TLOAD (EIP-1153) secara langsung dan lebih efisien.
     *
     * @return mustRevert Apakah transaksi harus dibatalkan (true = revert).
     * @return anomalyScore Skor keparahan anomali dalam basis poin (0-10000, 0 = aman).
     */
    function checkAnomaly(address sender, uint256 amount, uint8 txType) external returns (bool, uint256) {
        // DETEKSI MEV / SANDWICH ATTACK (Ta1 -> Tv -> Ta2)
        // Periksa riwayat transaksi pada blok yang sama
        uint256 length = txRecords.length;
        if (length > 0 && txType == 1) { // Jika ini adalah transaksi Korban (Tv)
            TransactionRecord memory lastTx = txRecords[length - 1];

            // Periksa jika transaksi sebelumnya adalah Frontrun (Ta1) di blok yang sama
            if (lastTx.blockNumber == block.number && lastTx.txType == 0) {
                emit AlertTriggered("WARNING: Speculative MEV Sandwich Detected (Ta1 -> Tv)!", sender, P_detect);
                return (false, P_detect); // Kembalikan probabilitas deteksi (96%)
            }
        }

        return (false, 0); // Aman
    }

    /**
     * @dev Menghitung penalti ekonomi dinamis berdasarkan formula:
     * Penalty = Amount * (lambda * P_detect / 100,000,000)
     * @param amount Nilai transaksi yang dikenakan penalti.
     * @param anomalyScore Skor anomali dalam basis poin (0-10000).
     * @return penalty Nilai penalti dalam wei (dibatasi maksimal = amount).
     */
    function calculatePenalty(uint256 amount, uint256 anomalyScore) public view returns (uint256) {
        if (anomalyScore == 0) return 0;
        uint256 penalty = (amount * lambda * anomalyScore) / 100000000;
        return penalty > amount ? amount : penalty;
    }

    function txRecordsLength() external view returns (uint256) {
        return txRecords.length;
    }
}
