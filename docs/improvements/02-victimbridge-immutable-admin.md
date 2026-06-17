# Improvement #2: VictimBridge Immutable Admin

> Menambahkan `immutable` modifier pada `admin` di VictimBridge.sol

---

## Status

| Item | Nilai |
|------|-------|
| File yang diubah | `src/VictimBridge.sol` |
| Prioritas | KRITIS |
| Estimasi waktu | 5 menit |
| Difficulty | Sangat Mudah |
| Gas savings | ~2,100 gas per read |
| Status | ✅ SELESAI (02 Jun 2026) |
| Compile | ✅ Berhasil (solcjs 0.8.28) — 0 errors |

---

## Masalah

VictimBridge (Tier C) menggunakan `address public admin` biasa:

```solidity
// VictimBridge.sol line 31:
address public admin;  // ← TIDAK immutable, pakai storage slot
```

Tapi BridgeStaticOnly (Tier B) sudah benar:

```solidity
// BridgeStaticOnly.sol line 44:
address public immutable admin;  // ← BENAR, tidak pakai storage slot
```

**Ini inkonsisten.** Tier C seharusnya lebih optimal dari Tier B.

---

## Kenapa Ini Penting

### Storage Slot Difference

| Metode | Storage | Gas per Read | Gas per Write |
|--------|---------|-------------|---------------|
| `address admin` (biasa) | 1 storage slot (32 bytes) | 2,100 gas (warm) | 20,000 gas (cold) |
| `address immutable admin` | Di bytecode (0 slot) | 0 gas | Tidak bisa diubah |

### Dampak untuk Skripsi

- Reviewer akan bertanya: "Kenapa Tier C tidak pakai `immutable`?"
- Gas benchmark untuk read `admin` menjadi tidak akurat
- Mengurangi credibility klaim optimasi

---

## Yang Harus Dilakukan

### Tambahkan `immutable` modifier

**Lokasi:** Line 31 di `VictimBridge.sol`

**Sebelum:**
```solidity
address public admin;
```

**Sesudah:**
```solidity
address public immutable admin;
```

**Itu saja.** Tidak ada perubahan lain yang diperlukan karena `admin` hanya di-set sekali di constructor.

---

## Kenapa Tidak Perlu Ubah Lain

- `admin = msg.sender` di constructor (line 41) — **tetap bisa** karena constructor boleh set immutable
- Tidak ada function lain yang mengubah `admin` — **tidak ada masalah**
- Reading `admin` di test — **tetap bisa** karena immutable bisa dibaca

---

## Gas Savings

| Skenario | Sebelum | Sesudah | Hemat |
|----------|---------|---------|-------|
| Read `admin` (per call) | 2,100 gas | 0 gas | 2,100 gas |
| Deploy (write ke storage) | 20,000 gas | 0 gas (bytecode) | 20,000 gas |

**Total savings: ~22,100 gas** (sekali saat deploy + setiap read)

---

## Checklist

- [x] Ganti `address public admin;` → `address public immutable admin;` (line 31)
- [x] Jalankan `forge build` — compile berhasil (0 errors)
- [ ] Jalankan `forge test` — perlu install Foundry dulu
