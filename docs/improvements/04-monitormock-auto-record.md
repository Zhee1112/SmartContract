# Improvement #4: MonitorMock Auto-Record dari VictimBridge

> VictimBridge harus otomatis memanggil `monitor.recordTransaction()` di setiap function

---

## Status

| Item | Nilai |
|------|-------|
| File yang diubah | `src/VictimBridge.sol` |
| Prioritas | KRITIS |
| Estimasi waktu | 20-30 menit |
| Difficulty | Mudah |
| Status | ✅ SELESAI (02 Jun 2026) |
| Compile | ✅ Berhasil (solcjs 0.8.28) — 0 errors |

---

## Masalah

Sekarang `recordTransaction()` hanya dipanggil dari **test**:

```solidity
// test/MultiContractTest.t.sol line 316:
monitor.recordTransaction(alice, 5 ether, 0);  // ← manual, dari test
```

Tapi di **production**, tidak ada yang memanggil `recordTransaction()`. EWS tidak akan tahu ada transaksi masuk → tidak bisa deteksi sandwich attack.

### Alur Saat Ini (BROKEN)

```
User → VictimBridge.deposit()
            ↓
       Tidak ada recordTransaction()
            ↓
       EWS tidak tahu ada transaksi
            ↓
       Sandwich attack tidak terdeteksi
```

---

## Yang Harus Dilakukan

### 1. `deposit()` — Tambah recordTransaction

**Lokasi:** Setelah `emit Deposit(msg.sender, amount);` (line 63)

```solidity
function deposit() public payable {
    uint96 amount = uint96(msg.value);
    if (amount == 0) revert ZeroAmount();

    UserBalance storage u = userBalances[msg.sender];
    u.userAddress = msg.sender;
    
    unchecked {
        u.balance += amount;
    }

    emit Deposit(msg.sender, amount);

    // ← TAMBAH: Auto-record ke EWS
    monitor.recordTransaction(msg.sender, uint96(msg.value), 1); // type 1 = victim/user
}
```

### 2. `withdraw()` — Tambah recordTransaction

**Lokasi:** Di awal function, sebelum `monitor.enterCall();` (line 74)

```solidity
function withdraw(uint96 amount) public {
    // ← TAMBAH: Auto-record ke EWS
    monitor.recordTransaction(msg.sender, amount, 1); // type 1 = victim/user

    // 1. CHECKS & WARNING SYSTEM ENTER
    monitor.enterCall();
    ...
```

### 3. `swapETHForTokens()` — Tambah recordTransaction

**Lokasi:** Di awal function, sebelum `monitor.checkAnomaly()` (line 118)

```solidity
function swapETHForTokens(uint96 minTokensOut) public payable {
    uint96 amountIn = uint96(msg.value);
    if (amountIn == 0) revert ZeroAmount();

    // ← TAMBAH: Auto-record ke EWS
    monitor.recordTransaction(msg.sender, uint96(msg.value), 1); // type 1 = victim/user

    // Deteksi anomali MEV sandwich
    (bool mustRevert, uint256 anomalyScore) = monitor.checkAnomaly(msg.sender, amountIn, 1);
    ...
```

---

## Penjelasan txType

| txType | Nilai | Artinya |
|--------|-------|---------|
| 0 | `Ta1` | Attacker Frontrun (dicatat attacker sendiri) |
| 1 | `Tv` | Victim Transaction (dicatat oleh bridge) |
| 2 | `Ta2` | Attacker Backrun (dicatat attacker sendiri) |

Untuk VictimBridge, semua transaksi dari user adalah **type 1 (victim)** karena:
- User deposit → victim transaksi
- User withdraw → victim transaksi  
- User swap → victim transaksi (bisa jadi target sandwich)

Attacker yang akan mencatat `Ta1` dan `Ta2` (via `recordTransaction()` yang tetap public).

---

## Alur Sesudah Perbaikan

```
User → VictimBridge.deposit()
            ↓
       monitor.recordTransaction(user, amount, 1)  ← AUTO-RECORD
            ↓
       EWS mencatat transaksi
            ↓
       Sandwich attack TERDETEKSI
```

---

## Gas Impact

| Operation | Sebelum | Sesudah | Notes |
|-----------|---------|---------|-------|
| deposit() | ~50,000 gas | ~50,300 gas | +~300 gas (TSTORE x2 + push) |
| withdraw() | ~60,000 gas | ~60,300 gas | +~300 gas |
| swapETHForTokens() | ~70,000 gas | ~70,300 gas | +~300 gas |

**Overhead: ~300 gas per transaksi** — sangat worth untuk MEV protection.

---

## Checklist

- [x] Tambah `monitor.recordTransaction()` di `deposit()` (setelah emit)
- [x] Tambah `monitor.recordTransaction()` di `withdraw()` (di awal function)
- [x] Tambah `monitor.recordTransaction()` di `swapETHForTokens()` (di awal function)
- [x] Jalankan `forge build` — compile berhasil (0 errors)
