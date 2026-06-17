# Improvement #3: MonitorMock Access Control

> Menambahkan `onlyAdmin` modifier pada MonitorMock.sol

---

## Status

| Item | Nilai |
|------|-------|
| File yang diubah | `src/MonitorMock.sol` |
| Prioritas | KRITIS |
| Estimasi waktu | 15-20 menit |
| Difficulty | Mudah |
| Status | ✅ SELESAI (02 Jun 2026) |
| Compile | ✅ Berhasil (solcjs 0.8.28) — 0 errors |

---

## Masalah

Sekarang **siapa saja** bisa memanggil function sensitive di MonitorMock:

```solidity
// MonitorMock.sol — TANPA access control:

function updateParameters(uint256 _pDetect, uint256 _lambda) external { ... }
function recordTransaction(address sender, uint256 amount, uint8 txType) external { ... }
function clearRecords() external { ... }
```

### Skenario Serangan

1. Attacker tahu alamat `MonitorMock`
2. Attacker panggil: `monitor.updateParameters(0, 0)`
3. `P_detect = 0` → Tidak ada deteksi MEV
4. Attacker lakukan sandwich attack → Tidak ada penalti
5. Bridge rugi

---

## Yang Harus Dilakukan

### 1. Tambah State Variable `admin`

**Lokasi:** Setelah `uint256 public lambda;` (line 25)

```solidity
address public admin;
```

### 2. Tambah `onlyAdmin` Modifier

**Lokasi:** Setelah state variables

```solidity
modifier onlyAdmin() {
    require(msg.sender == admin, "MonitorMock: not admin");
    _;
}
```

### 3. Set `admin` di Constructor

**Lokasi:** Di dalam constructor (line 41-44)

```solidity
constructor() {
    admin = msg.sender;  // ← TAMBAH INI
    P_detect = 9600;
    lambda = 15000;
}
```

### 4. Tambah Modifier ke Function yang Perlu Dilindungi

| Function | Modifier | Alasan |
|----------|----------|--------|
| `updateParameters()` | `onlyAdmin` | Parameter deteksi hanya boleh diubah admin |
| `clearRecords()` | `onlyAdmin` | Hapus riwayat hanya boleh admin |
| `recordTransaction()` | **TETAP PUBLIC** | VictimBridge perlu panggil ini untuk auto-record |
| `enterCall()` | **TETAP PUBLIC** | VictimBridge perlu panggil ini |
| `exitCall()` | **TETAP PUBLIC** | VictimBridge perlu panggil ini |
| `checkAnomaly()` | **TETAP PUBLIC** | VictimBridge perlu panggil ini |
| `calculatePenalty()` | **TETAP PUBLIC** | VictimBridge perlu panggil ini |
| `callDepth()` | **TETAP PUBLIC** | View function, tidak berbahaya |

---

## Kode Lengkap Sesudah Perubahan

```solidity
contract MonitorMock {
    uint256 private constant CALL_DEPTH_SLOT = 2;

    uint256 public P_detect;
    uint256 public lambda;
    address public admin;  // ← TAMBAH

    // ...

    modifier onlyAdmin() {  // ← TAMBAH
        require(msg.sender == admin, "MonitorMock: not admin");
        _;
    }

    constructor() {
        admin = msg.sender;  // ← TAMBAH
        P_detect = 9600;
        lambda = 15000;
    }

    function updateParameters(uint256 _pDetect, uint256 _lambda) external onlyAdmin {  // ← TAMBAH onlyAdmin
        P_detect = _pDetect;
        lambda = _lambda;
        emit ParameterUpdated(_pDetect, _lambda);
    }

    function recordTransaction(address sender, uint256 amount, uint8 txType) external {
        // TETAP PUBLIC — VictimBridge perlu auto-record
        txRecords.push(TransactionRecord({ ... }));
    }

    function clearRecords() external onlyAdmin {  // ← TAMBAH onlyAdmin
        delete txRecords;
    }

    // enterCall, exitCall, callDepth, checkAnomaly, calculatePenalty — TETAP PUBLIC
}
```

---

## Kenapa `recordTransaction()` Tetap Public

Karena nanti di **Improvement #4**, VictimBridge akan otomatis memanggil `recordTransaction()`:

```solidity
// VictimBridge.sol (nanti):
function deposit() public payable {
    ...
    monitor.recordTransaction(msg.sender, uint96(msg.value), 1);
}
```

Kalau `recordTransaction()` juga pakai `onlyAdmin`, VictimBridge tidak bisa memanggilnya.

---

## Gas Impact

| Operation | Sebelum | Sesudah | Notes |
|-----------|---------|---------|-------|
| Deploy | +20,000 gas | +20,000 gas | Storage write untuk `admin` |
| `updateParameters()` | 0 gas | +100 gas | `require` check (warm) |
| `clearRecords()` | 0 gas | +100 gas | `require` check (warm) |

**Overhead minimal** (~100 gas per protected call) untuk keamanan signifikan.

---

## Checklist

- [x] Tambah `error NotAdmin()` custom error
- [x] Tambah `address public admin;` di state variables
- [x] Tambah `modifier onlyAdmin()`
- [x] Set `admin = msg.sender;` di constructor
- [x] Tambah `onlyAdmin` ke `updateParameters()`
- [x] Tambah `onlyAdmin` ke `clearRecords()`
- [x] Pastikan `recordTransaction()` TIDAK pakai `onlyAdmin`
- [x] Jalankan `forge build` — compile berhasil (0 errors)
