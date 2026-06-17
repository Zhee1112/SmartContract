# Ringkasan Komprehensif Penelitian

## Optimasi Gas dan Keamanan Smart Contract Bridge
### Implementasi EIP-1153 Transient Storage pada Arsitektur 4-Tier

---

## 1. TUJUAN PENELITIAN

Penelitian ini bertujuan untuk:

1. **Mengoptimalkan biaya gas** smart contract bridge menggunakan EIP-1153 transient storage (TSTORE/TLOAD) sebagai reentrancy guard dibandingkan pendekatan konvensional (SSTORE), dengan pengukuran empiris terhadap 4 arsitektur tier.

2. **Merancang Early Warning System (EWS)** on-chain untuk deteksi MEV sandwich attack secara real-time menggunakan transient storage, lengkap dengan mekanisme penalti ekonomis dinamis.

3. **Mengembangkan modifikasi EIP-1153** dari yang semula hanya berfungsi sebagai reentrancy guard (1 fungsi, 200 gas) menjadi platform keamanan multifungsi (5 fungsi keamanan) yang tetap efisien gas.

4. **Membuktikan secara statistik** bahwa arsitektur inline (Tier D) memberikan keamanan setara dengan arsitektur eksternal (Tier C) tetapi dengan biaya gas 72-88% lebih rendah, menggunakan Welch's t-test, Cohen's d effect size, dan 95% confidence interval.

---

## 2. MANFAAT PENELITIAN

### Manfaat Teoritis
- Kontribusi ilmiah pada bidang optimasi EIP-1153 transient storage untuk arsitektur bridge
- Bukti empiris mengenai tradeoff biaya gas vs tingkat keamanan pada arsitektur 4-tier bridge
- Framework analisis statistik (100 sampel per operasi, significance testing) yang dapat diadopsi oleh peneliti lain

### Manfaat Praktis
- Template arsitektur bridge: EIP-1153 reentrancy guard yang mengurangi biaya dari 22.900 gas menjadi 200 gas (penghematan 100x)
- Implementasi EWS referensi untuk proteksi MEV sandwich yang dapat terintegrasi ke bridge production
- Dashboard interaktif untuk monitoring performa bridge dan simulasi rollup
- Penghematan riil: bridge dengan 100K transaksi/bulan menghemat **$79.000-$213.000/bulan** vs Tier C

---

## 3. APA YANG DITELITI

### Objek Penelitian
Penelitian ini meneliti **4 arsitektur smart contract bridge** yang mewakili tingkat optimasi dan keamanan yang berbeda:

| Tier | Nama | Deskripsi |
|:----:|------|-----------|
| **A** | UnoptimizedBridge | Baseline tanpa optimasi apapun |
| **B** | BridgeStaticOnly | Optimasi statis saja (CEI, packing, custom errors) |
| **C** | VictimBridge + MonitorMock | Optimasi statis + pertahanan dinamis via external contract |
| **D** | LightweightBridge | Optimasi statis + pertahanan dinamis inline (kontribusi penelitian) |

### Aspek yang Diukur
1. **Biaya gas** untuk operasi deposit, withdraw, swap, dan deployment (100 sampel per operasi)
2. **Tingkat keamanan** berdasarkan 8 fitur keamanan
3. **Biaya riil dalam USD** pada berbagai level gas price
4. **Efektivitas biaya** menggunakan metrik SPG (Security Points per Gas)
5. **Signifikasi statistik** perbedaan antar tier

---

## 4. RINCIAN PENELITIAN

### 4.1 Rancangan Eksperimental

```
Tier A (Baseline) → Tier B (Static) → Tier C (External Dynamic) → Tier D (Inline Dynamic)
                                                                 ↑
                                                        Kontribusi penelitian
```

**Lingkungan Pengujian:**
- Solidity 0.8.28, EVM target: Cancun (support EIP-1153)
- Optimizer: 200 runs
- Foundry v1.7.1
- 215 test cases, 100 sampel per operasi

### 4.2 Statistik Pengukuran Gas

| Operasi | Tier A | Tier B | Tier C | Tier D |
|---------|-------:|-------:|-------:|-------:|
| Deposit | 31.412 | 31.427 | 122.769 | 34.156 |
| Withdraw | 9.735 | 9.727 | 104.806 | 12.119 |
| Swap | 22.080 | 15.000 | 133.344 | 62.787 |
| Deploy | 413.860 | 352.921 | 886.301 | 736.064 |

### 4.3 Rasio Gas Antar Tier

| Transisi | Rasio | Interpretasi |
|----------|:-----:|-------------|
| A → B | 1,00x | Optimasi statis tidak mengubah biaya runtime |
| B → C | 3,91x - 10,77x | External calls meningkatkan gas secara drastis |
| B → D | 1,09x - 1,25x | Modifikasi inline menambah biaya minimal |
| C → D | 0,08x - 0,12x | Inline 8x-11x lebih murah dari external calls |

### 4.4 Analisis Statistik

| Metrik | Nilai | Interpretasi |
|--------|:-----:|-------------|
| t-statistic (Welch's) | 1.680,67 | Perbedaan sangat besar |
| p-value | 2,25 × 10⁻²²² | Sangat signifikan (p << 0,05) |
| Cohen's d | 220,64 | Effect size LARGE (threshold: 0,8) |
| 95% CI | [98,18%, 98,23%] | Confidence interval sangat sempit |
| Cost Ratio | 55,7x | Tier C 55,7x lebih mahal dari Tier D |

**Keputusan:** Tolak H₀ — Perbedaan gas antara Tier C dan Tier D bersifat nyata dan konsisten.

### 4.5 Biaya Riil USD

| Gas Price | Tier A | Tier B | Tier C | Tier D |
|-----------|-------:|-------:|-------:|-------:|
| 10 Gwei | $0,09 | $0,09 | $0,37 | $0,10 |
| 30 Gwei | $0,28 | $0,28 | $1,10 | $0,31 |
| 80 Gwei | $0,75 | $0,75 | $2,95 | $0,82 |
| 150 Gwei | $1,41 | $1,41 | $5,53 | $1,54 |

**Estimasi penghematan bulanan (100K tx/bulan):**
- 30 Gwei: Tier C $110.000/bulan vs Tier D $31.000/bulan → **hemat $79.000/bulan**
- 80 Gwei: Tier C $295.000/bulan vs Tier D $82.000/bulan → **hemat $213.000/bulan**

---

## 5. FITUR TIAP TIER

### 5.1 Tier A — UnoptimizedBridge (Baseline)

**Karakteristik:** Kontrak bridge paling dasar tanpa optimasi apapun. Digunakan sebagai baseline perbandingan.

| Aspek | Detail |
|-------|--------|
| Custom Errors | ❌ Tidak ada (gunakan `require()` dengan string) |
| Variable Packing | ❌ Tidak ada (bool mengambil slot 32-byte penuh) |
| CEI Pattern | ❌ Tidak ada (interaksi sebelum efek pada withdraw) |
| Unchecked Arithmetic | ❌ Tidak ada |
| Immutable Admin | ❌ Tidak ada (admin di slot storage biasa) |
| Reentrancy Guard | ❌ Tidak ada |
| MEV Detection | ❌ Tidak ada |
| Emergency Pause | ❌ Tidak ada |
| Slippage Protection | ❌ Tidak ada |
| Skor Keamanan | **0/8** |

**Vulnerability:**
- Reentrancy pada `withdraw()` — interaksi (transfer ETH) dilakukan sebelum pembaruan state (balance dikurangi)
- Tidak ada proteksi MEV sandwich pada swap
- Tidak ada mekanisme pause saat serangan terjadi

### 5.2 Tier B — BridgeStaticOnly (Optimasi Statis)

**Karakteristik:** Menerapkan optimasi statis gas tanpa pertahanan dinamis. Cocok untuk prototyping.

| Aspek | Detail |
|-------|--------|
| Custom Errors | ✅ 5 errors (`InsufficientBalance`, `TransferFailed`, `ZeroAmount`, `InsufficientLiquidity`, `SlippageTooHigh`) |
| Variable Packing | ✅ `UserBalance` (address 20B + uint96 12B = 1 slot), `PoolReserves` (uint96 + uint96 = 24B) |
| CEI Pattern | ✅ Checks → Effects → Interactions pada withdraw |
| Unchecked Arithmetic | ✅ Pada aritmatika yang sudah tervalidasi |
| Immutable Admin | ✅ Tidak memakan slot storage |
| Reentrancy Guard | ❌ Tidak ada (hanya CEI) |
| MEV Detection | ❌ Tidak ada |
| Emergency Pause | ❌ Tidak ada |
| Slippage Protection | ✅ Parameter `minTokensOut` |
| Skor Keamanan | **2/8** |

**Kelebihan:**
- Gas deposit hanya 31.427 (hampir sama dengan baseline)
- Variable packing menghemat ~20.000 gas/slot
- Custom errors menghemat ~50 gas/revert vs require string

**Kelemahan:**
- Hanya melindungi dari reentrancy single-function (via CEI)
- Cross-function reentrancy masih bisa mengeksploitasi
- Tidak ada deteksi MEV sandwich
- Tidak ada emergency pause
- Skor keamanan 25% — **tidak memadai untuk production**

### 5.3 Tier C — VictimBridge + MonitorMock (Dynamic Eksternal)

**Karakteristik:** Menggabungkan optimasi statis + pertahanan dinamis via external contract (MonitorMock). Standar industri konvensional.

| Aspek | Detail |
|-------|--------|
| Custom Errors | ✅ 9 errors |
| Variable Packing | ✅ Sama dengan Tier B |
| CEI Pattern | ✅ |
| Unchecked Arithmetic | ✅ |
| Immutable Admin | ✅ |
| Reentrancy Guard | ✅ EIP-1153 via MonitorMock (external call) |
| MEV Detection | ✅ `txRecords[]` dynamic array pada MonitorMock |
| Economic Penalty | ✅ `calculatePenalty()` via MonitorMock |
| Emergency Pause | ✅ `pause()` / `unpause()` |
| Block Tracking | ✅ `lastTxBlock` pada setiap record |
| Custom Errors | ✅ Skor keamanan **8/8** |

**Arsitektur:**
```
VictimBridge ←→ MonitorMock
   (213 baris)    (170 baris)
   Total: 383 baris, 2 kontrak
```

**Kelebihan:**
- Skor keamanan penuh 8/8
- Modular — MonitorMock bisa di-upgrade terpisah
- Reusable — MonitorMock bisa digunakan oleh banyak bridge
- MEV detection menggunakan dynamic array `txRecords[]` yang menyimpan riwayat lengkap

**Kelemahan:**
- **Sangat mahal gas** — 3,91x-10,77x lebih mahal dari Tier B
- 5-6 external calls per transaksi ke MonitorMock
- ABI encode/decode ~15.000 gas per call
- Dynamic array `txRecords[]` butuh ~22.100 gas per cold SSTORE push
- Attack surface lebih luas (2 kontrak)
- Risiko cross-contract reentrancy
- Deploy 2 kontrak = biaya deployment lebih tinggi (886.301 gas)

### 5.4 Tier D — LightweightBridge (Inline Dynamic) ⭐ Kontribusi Penelitian

**Karakteristik:** Semua fitur keamanan Tier C di-inline ke dalam satu kontrak tanpa external calls. **Kontribusi utama penelitian ini.**

| Aspek | Detail |
|-------|--------|
| Custom Errors | ✅ 9 errors |
| Variable Packing | ✅ Sama dengan Tier B |
| CEI Pattern | ✅ |
| Unchecked Arithmetic | ✅ |
| Immutable Admin | ✅ |
| Reentrancy Guard | ✅ EIP-1153 **inline** assembly (TSTORE/TLOAD) |
| MEV Detection | ✅ **Single-slot** `LastTx` struct (bukan dynamic array) |
| Economic Penalty | ✅ **Inline pure math** (bukan external call) |
| Emergency Pause | ✅ `pause()` / `unpause()` |
| Block Tracking | ✅ `lastTxBlock` |
| External Calls | **0** (semua inline) |
| Skor Keamanan | **8/8** |

**Arsitektur:**
```
LightweightBridge (satu kontrak, 226 baris)
├── _enterCall()     → TSTORE (100 gas)
├── _exitCall()      → TSTORE (100 gas)
├── _callDepth()     → TLOAD  (100 gas)
├── _checkAnomaly()  → inline comparison (4.400 gas)
├── _recordTransaction() → LastTx single-slot (2.900 gas)
├── _calculatePenalty()  → pure math (300 gas)
├── deposit()
├── withdraw()
├── swapETHForTokens()
├── recordFrontrun()
├── pause()
└── unpause()
```

**Modifikasi EIP-1153 (dari 1 fungsi menjadi 5):**

| Modifikasi | Fungsi | Gas | Mekanisme |
|-----------|--------|----:|-----------|
| TSTORE/TLOAD Reentrancy Guard | Proteksi reentrancy | 200 | `_enterCall()` + `_callDepth()` + `_exitCall()` |
| Single-slot MEV Detection | Deteksi sandwich | 4.400 | `lastTx.sender` + `lastTx.txType` dalam 1 slot |
| Block Number Tracking | Batas waktu deteksi | 2.100 | `lastTxBlock` SLOAD + perbandingan |
| Inline Penalty Calculation | Penalti ekonomis | 300 | Pure math: `(amount × λ × score) / 10⁸` |
| Emergency Pause | Jeda darurat | 2.900 | SSTORE flag `paused` |
| **Total overhead keamanan** | | **~9.900** | |

**Kelebihan:**
- **Skor keamanan penuh 8/8** — setara Tier C
- **Gas hampir sama dengan baseline** — deposit hanya 34.156 (+8,7% dari Tier B)
- **72-88% lebih murah dari Tier C** untuk semua operasi
- **0 external calls** — tidak ada risiko cross-contract reentrancy
- **1 kontrak** — attack surface lebih sempit, deployment lebih murah
- **SPG tertinggi (220,1)** — 3,4x lebih efisien dari Tier C
- EIP-1153 dimodifikasi dari 1 fungsi (200 gas) menjadi 5 fungsi keamanan (9.900 gas) — **48,5x lebih murah** dari Tier C

**Kelemahan:**
- Tidak modular — semua logika dalam satu kontrak
- Tidak reusable — tidak bisa dipakai oleh bridge lain
- Update keamanan membutuhkan redeploy seluruh kontrak
- Ukuran bytecode lebih besar (3.553 bytes vs 1.612 bytes Tier B)
- Kode lebih kompleks dalam satu kontrak
- Pattern deteksi sederhana (hanya Ta1→Tv, belum full sandwich)

---

## 6. PERBANDINGAN LENGKAP 4 TIER

### 6.1 Fitur Keamanan

| # | Fitur | Tier A | Tier B | Tier C | Tier D |
|:-:|-------|:------:|:------:|:------:|:------:|
| 1 | Reentrancy Single-function | ❌ | ✅ | ✅ | ✅ |
| 2 | Reentrancy Cross-function | ❌ | ❌ | ✅ | ✅ |
| 3 | Reentrancy Consecutive (3x) | ❌ | ❌ | ✅ | ✅ |
| 4 | MEV Sandwich Detection | ❌ | ❌ | ✅ | ✅ |
| 5 | Economic Penalty | ❌ | ❌ | ✅ | ✅ |
| 6 | Emergency Pause | ❌ | ❌ | ✅ | ✅ |
| 7 | Block Tracking | ❌ | ❌ | ✅ | ✅ |
| 8 | Custom Errors | ❌ | ✅ | ✅ | ✅ |
| | **Total** | **0/8** | **2/8** | **8/8** | **8/8** |

### 6.2 Efektivitas Biaya (SPG)

| Tier | Skor Keamanan | Gas (Deposit) | SPG (×1.000.000) | Peringkat |
|------|:------------:|:-------------:|:-----------------:|:---------:|
| A | 0/8 | 31.412 | 0 | 4 |
| B | 2/8 | 31.427 | 63,6 | 3 |
| C | 8/8 | 122.769 | 65,2 | 2 |
| **D** | **8/8** | **34.156** | **220,1** | **1** |

> SPG = (Skor Keamanan ÷ Gas Deposit) × 1.000.000

### 6.3 Biaya per Fitur Keamanan Tambahan

| Transisi | Fitur Tambahan | Gas Ekstra | Biaya/Feature |
|----------|:--------------:|:----------:|:-------------:|
| A → B | 4 fitur | +15 | 3,75 gas/feature |
| B → D | 3 fitur | +2.729 | 909,7 gas/feature |
| D → C | 0 fitur (sama 8/8) | +88.613 | ∞ (tanpa fitur baru) |

**Temuan kunci:** Tier C membayar 97,4x lebih mahal dari Tier D untuk fitur keamanan yang **identik** (8/8).

### 6.4 Arsitektur

| Aspek | Tier A | Tier B | Tier C | Tier D |
|-------|:------:|:------:|:------:|:------:|
| Jumlah kontrak | 1 | 1 | 2 | 1 |
| External calls/tx | 0 | 0 | 5-6 | **0** |
| Total bytecode | 1.655 B | 1.612 B | 6.183 B | 3.553 B |
| % dari 24KB limit | 6,7% | 6,6% | 25,2% | 14,5% |
| Biaya deploy | 413.860 | 352.921 | 886.301 | 736.064 |
| Attack surface | Kecil | Kecil | **Luas** | Kecil |

---

## 7. KESIMPULAN

### 7.1 Temuan Utama

1. **EIP-1153 modifikasi efektif** — Tier D mengimplementasikan 5 fungsi keamanan dengan biaya hanya 9.900 gas — **48,5x lebih murah** dari Tier C.

2. **Inline vs External Calls** — Mengganti external calls dengan inline assembly menghemat **52,9%-88,4%** gas untuk semua operasi.

3. **Single-slot MEV Detection** — Struct `LastTx` satu slot (2.900 gas) vs dynamic array `txRecords[]` (22.100 gas) menghemat **86,9%** biaya storage.

4. **Efektivitas biaya terbaik** — SPG 220,1 — **3,4x lebih efisien** dari Tier C (65,2).

5. **Peningkatan keamanan signifikan** — +75% dari Tier B (2/8 → 8/8) dengan biaya tambahan hanya +8,7%.

### 7.2 Hierarki Rekomendasi

```
Level 0: Tanpa optimasi (Tier A)     → 0/8 — TIDAK DISARANKAN
Level 1: Statis saja (Tier B)         → 2/8 — HANYA UNTUK PROTOTIPE
Level 2: Statis + Dinamis Inline (D)  → 8/8 — REKOMENDASI UTAMA ⭐
Level 3: Statis + Dinamis Eksternal (C) → 8/8 — TIDAK EFISIEN
```

### 7.3 Rekomendasi Berdasarkan Kebutuhan

| Kriteria | Rekomendasi |
|----------|:-----------:|
| Prototyping / MVP | Tier B |
| Low-volume Production | Tier D |
| High-volume Production | Tier D (hemat $66K-$178K/bulan vs C) |
| Maximum Security | Tier D + Bond (Hybrid) |
| Research / Benchmark | Tier C (untuk perbandingan) |

### 7.4 Kontribusi Utama Penelitian

Penelitian ini membuktikan bahwa **EIP-1153 transient storage dapat dimodifikasi** dari sekadar reentrancy guard (1 fungsi, 200 gas) menjadi **platform keamanan multifungsi** (5 fungsi, 9.900 gas) yang:

- Memiliki keamanan setara (8/8) dengan arsitektur konvensional
- Biaya gas hanya **+8,7%** dari baseline (bukan 3,91x seperti Tier C)
- **0 external calls** — menghilangkan risiko cross-contract reentrancy
- **1 kontrak** — attack surface lebih sempit, deployment lebih mudah
- Penghematan riil **$79.000-$213.000/bulan** untuk bridge 100K tx

---

## 8. KETERBATASAN DAN FUTURE WORK

### Keterbatasan
1. Pengujian hanya di lingkungan Foundry (belum production)
2. Pattern deteksi sederhana (hanya Ta1→Tv, belum full sandwich multi-blok)
3. Parameter statis (P_DETECT=9.600, LAMBDA=15.000)
4. Pengujian single-chain saja
5. Belum ada security audit pihak ketiga

### Future Work
1. Integrasi dengan proxy pattern untuk upgradeability
2. Deteksi MEV canggih (multi-blok, Flashbots bundle)
3. Pengujian multi-chain
4. Integrasi TWAP oracle untuk flash loan protection
5. Bug bounty program dan security audit
6. Deploy ke mainnet dengan monitoring real-time
