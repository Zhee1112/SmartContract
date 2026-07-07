# BAB III METODOLOGI PENELITIAN

## 3.1 Paradigma Penelitian

Penelitian ini menggunakan paradigma empiris-kuantitatif. Pendekatan empiris dipilih karena penelitian berfokus pada pengukuran fakta objektif melalui eksperimen terkontrol, bukan opini atau interpretasi subjektif. Semua data diperoleh dari pengukuran langsung terhadap implementasi kontrak bridge pada lingkungan EVM simulasi.

## 3.2 Data dan Sumber Data

### 3.2.1 Data Primer

Data primer diperoleh dari pengukuran gas dan pengujian keamanan pada empat kontrak bridge:

1. **Data Gas**: Pengukuran konsumsi gas untuk tiga jenis transaksi (deposit, withdraw, swap) pada empat tier arsitektur dengan 100 sampel per operasi.
2. **Data Keamanan**: Hasil pengujian delapan fitur keamanan pada setiap tier.
3. **Data Statistik**: Hasil analisis Welch's t-test dan Cohen's d effect size.

### 3.2.2 Data Sekunder

Data sekunder diperoleh dari studi literatur meliputi 20 penelitian terdahulu terkait optimasi gas, keamanan bridge, dan pemanfaatan EIP-1153 transient storage.

## 3.3 Perancangan Sistem

### 3.3.1 Arsitektur 4-Tier

Penulis merancang empat tingkat optimasi bridge yang disebut 4-Tier Architecture:

**Tabel 1. Arsitektur 4-Tier Bridge**

| Tier | Kontrak | Deskripsi | Karakteristik |
|------|---------|-----------|---------------|
| A | UnoptimizedBridge | Baseline tanpa optimasi | Gas termurah, 0/8 keamanan |
| B | BridgeStaticOnly | Optimasi statis saja | Gas rendah, 2/8 keamanan |
| C | VictimBridge | Full dynamic (EIP-1153 + EWS) | Gas tinggi, 8/8 keamanan |
| D | LightweightBridge | Lightweight dynamic (inline) | Gas rendah, 8/8 keamanan |

### 3.3.2 Implementasi Optimasi Statis

Optimasi statis yang diterapkan meliputi:

1. **Variable Packing**: Menggabungkan variabel kecil ke dalam satu slot storage 32 bytes.
2. **CEI Pattern**: Menerapkan pattern Check-Effects-Interactions untuk mencegah reentrancy.
3. **Custom Errors**: Menggantikan revert string dengan custom errors untuk menghemat gas.
4. **Unchecked Arithmetic**: Menggunakan unchecked block untuk operasi aritmatika yang sudah dijamin aman.

### 3.3.3 Implementasi Optimasi Dinamis (EIP-1153)

Optimasi dinamis berbasis EIP-1153 transient storage diterapkan untuk:

1. **Reentrancy Guard**: Menggunakan TSTORE/TLOAD dengan biaya 100 gas per operasi.
2. **MEV Sandwich Detection**: Mendeteksi pola frontrun-victim secara on-chain.
3. **Economic Penalty**: Menerapkan penalti ekonomi terhadap serangan.
4. **Emergency Pause**: Menyediakan mekanisme pause darurat.
5. **Block Tracking**: Melacak blok transaksi untuk deteksi anomali.

## 3.4 Platform Pengembangan

**Tabel 2. Platform Pengembangan**

| Komponen | Spesifikasi |
|----------|------------|
| IDE | VS Code + opencode CLI |
| OS | Windows 11 + WSL Ubuntu |
| Solidity | 0.8.28 |
| Compiler | Foundry (forge) v1.7.1 |
| EVM Version | Cancun (mendukung EIP-1153) |
| Optimizer | 200 runs |
| Testing Framework | Foundry (forge-std) |

## 3.5 Metode Pengujian

Penelitian ini menggunakan 13 file test dengan total 216 test cases yang mencakup berbagai metode pengujian komprehensif.

**Tabel 3. Metode Pengujian yang Digunakan**

| No | Metode Pengujian | Jumlah Test | File Test | Deskripsi |
|----|------------------|-------------|-----------|-----------|
| 1 | Unit Test | ~100 | Semua file | Pengujian fungsi individual pada setiap tier |
| 2 | Integration Test | ~50 | MultiContractTest, MEVSimulationTest, SecurityComparisonTest | Pengujian interaksi antar komponen |
| 3 | Fuzz Testing | 8 | FuzzTest.t.sol | Property-based testing dengan input acak |
| 4 | Invariant Testing | 3 | InvariantTest.t.sol | Verifikasi properti sistem yang harus selalu benar |
| 5 | Gas Benchmark | ~25 | CostAnalysisTest, GasStatsTest, EIP1153Benchmark, OZGuardComparison | Pengukuran gas detail |
| 6 | Statistical Analysis | 100 sampel | CostAnalysisTest, GasStatsTest | Analisis statistik deskriptif |
| 7 | Attack Simulation | ~30 | EconomicDeterrenceTest, MEVSimulationTest, VictimBridgeSecurityTest | Simulasi serangan nyata |
| 8 | Economic Simulation | ~8 | EconomicDeterrenceTest | Analisis profitabilitas serangan |
| 9 | State Machine Testing | 14 | TierComparisonTest | Pengujian transisi state pause/unpause |
| 10 | Edge Case Testing | 28 | EdgeCaseTest.t.sol | Pengujian kondisi batas dan error handling |

### 3.5.1 Unit Test

Unit test menguji fungsi individual pada setiap tier bridge (deposit, withdraw, swap) untuk memastikan setiap fungsi bekerja sesuai spesifikasi. Pengujian mencakup verifikasi state transition, event emission, dan access control.

### 3.5.2 Integration Test

Integration test menguji interaksi antar komponen dalam satu skenario lengkap. Contohnya, pengujian MEV sandwich attack melibatkan interaksi antara attacker, victim, dan monitor dalam satu transaksi.

### 3.5.3 Fuzz Testing

Fuzz testing menggunakan Foundry fuzzer untuk menghasilkan input acak dan memverifikasi properti sistem. Properti yang diuji meliputi:

- Deposit dengan amount valid selalu berhasil
- Withdraw tidak pernah melebihi balance
- Formula swap selalu benar (constant product)
- Penalty tidak pernah melebihi deposited amount
- Penalty = 0 ketika anomaly score = 0

### 3.5.4 Invariant Testing

Invariant testing memverifikasi properti sistem yang harus selalu benar di semua transisi state:

- User balance selalu non-negatif
- Call depth selalu non-negatif
- Call depth reset ke 0 setelah transaksi selesai

### 3.5.5 Gas Benchmark

Gas benchmark mengukur konsumsi gas secara detail menggunakan beberapa pendekatan:

1. **100-Sample Statistical Analysis**: 100 pengulangan per operasi dengan perhitungan mean, min, max, standar deviasi, dan confidence interval 95%.
2. **Opcode-Level Micro-Benchmark**: Perbandingan murni TSTORE/TLOAD vs SSTORE/SLOAD tanpa overhead bridge logic.
3. **Deployment Cost**: Pengukuran biaya deploy untuk setiap kontrak.

### 3.5.6 Attack Simulation

Attack simulation menguji skenario serangan nyata pada setiap tier:

1. **Reentrancy Attack**: Single-function, cross-function, dan consecutive reentrancy.
2. **MEV Sandwich Attack**: Simulasi frontrun-victim-backrun dalam satu blok.
3. **Cross-Block MEV**: Serangan lintas blok.
4. **Reentrancy via Swap**: Reentrancy yang dieksekusi melalui path swap.
5. **Consecutive Attacks**: Serangan beruntun untuk menguji state reset.

### 3.5.7 Economic Simulation

Economic simulation menganalisis profitabilitas serangan menggunakan expected utility formula:

E[utility] = P(tidak terdeteksi) x profit - P(terdeteksi) x penalty

Jika E[utility] < 0, maka serangan tidak menguntungkan secara ekonomi.

### 3.5.8 State Machine Testing

State machine testing memverifikasi transisi state pause/unpause:

- Pause hanya bisa dilakukan oleh admin
- Unpause hanya bisa dilakukan oleh admin
- Tidak bisa pause dua kali berturut-turut
- Deposit/withdraw/swap revert saat paused
- Semua fungsi bekerja normal setelah unpause

### 3.5.9 Edge Case Testing

Edge case testing menguji kondisi batas dan error handling:

- Zero amount deposit/withdraw/swap
- Withdraw melebihi balance (overflow)
- Unauthorized access (non-admin)
- Reentrancy pada semua tier
- Swap melebihi liquidity
- Slippage terlalu tinggi
- Multi-user isolation

## 3.6 Pengukuran Gas

Setiap operasi bridge (deposit, withdraw, swap) diukur gas-nya menggunakan 100 sampel per operasi. Jumlah sampel ini dipilih berdasarkan Central Limit Theorem (CLT) yang menyatakan bahwa distribusi mean akan mendekati normal untuk n >= 30.

Statistik deskriptif yang dihitung meliputi:

- Mean (rata-rata)
- Minimum
- Maximum
- Standar deviasi
- Confidence interval 95%

## 3.7 Pengujian Keamanan

### 3.7.1 Fitur Keamanan yang Diuji

**Tabel 4. Fitur Keamanan yang Diuji**

| No | Fitur Keamanan | Tier A | Tier B | Tier C | Tier D |
|----|----------------|--------|--------|--------|--------|
| 1 | Reentrancy Guard | Tidak ada | CEI Pattern | EWS (MonitorMock) | Inline EIP-1153 |
| 2 | MEV Sandwich Detection | Tidak ada | Tidak ada | Full (txRecords) | Single-slot (lastTx) |
| 3 | Economic Penalty | Tidak ada | Tidak ada | Dynamic (MonitorMock) | Dynamic (inline) |
| 4 | Emergency Pause | Tidak ada | Tidak ada | Admin-only | Admin-only |
| 5 | Block Tracking | Tidak ada | Tidak ada | External array | Single struct |
| 6 | Cross-function Reentrancy | Tidak ada | Tidak ada | Tersedia | Tersedia |
| 7 | Consecutive Reentrancy | Tidak ada | Tidak ada | Tersedia | Tersedia |
| 8 | MEV Cross-block | Tidak ada | Tidak ada | Tidak terdeteksi | Tidak terdeteksi |

### 3.7.2 Skor Keamanan

**Tabel 5. Skor Keamanan per Tier**

| Tier | Skor Keamanan | Persentase | Keterangan |
|------|---------------|------------|------------|
| A | 0/8 | 0% | Tidak aman, tidak direkomendasikan |
| B | 2/8 | 25% | Hanya untuk prototipe |
| C | 8/8 | 100% | Aman, tapi gas sangat tinggi |
| D | 8/8 | 100% | Aman, gas optimal (rekomendasi) |

## 3.8 Validasi Statistik

### 3.8.1 Welch's t-test

Untuk membandingkan gas cost Tier C dan Tier D, digunakan Welch's t-test. Welch's t-test dipilih karena tidak memerlukan asumsi homogenitas variansi. Hipotesis:

- H0: Tidak ada perbedaan signifikan antara gas Tier C dan Tier D
- H1: Ada perbedaan signifikan antara gas Tier C dan Tier D

Tingkat signifikansi yang digunakan adalah alpha = 0,05.

### 3.8.2 Effect Size (Cohen's d)

Cohen's d digunakan untuk mengukur besarnya perbedaan yang bermakna secara praktis:

d = (x1 - x2) / s_pooled

Interpretasi Cohen's d:

- d < 0,2: Negligible
- 0,2 - 0,5: Small
- 0,5 - 0,8: Medium
- d >= 0,8: Large

## 3.9 Analisis Data

### 3.9.1 Analisis Deskriptif

Data gas cost dianalisis menggunakan statistik deskriptif: mean, minimum, maximum, standar deviasi, dan confidence interval 95%.

### 3.9.2 Metrik Cost-effectiveness

Untuk mengukur efisiensi bridge dalam mengubah biaya gas menjadi keamanan, digunakan metrik SPG (Security Points per Gas):

SPG = (Skor Keamanan / Gas Deposit) x 1.000.000

**Tabel 6. Metrik SPG per Tier**

| Tier | Gas Deposit | Skor Keamanan | SPG | Ranking |
|------|-------------|---------------|-----|---------|
| A | 58.829 | 0 | 0 | 4 |
| B | 56.707 | 2 | 63,6 | 3 |
| C | 173.461 | 8 | 65,2 | 2 |
| D | 103.652 | 8 | 220,1 | 1 |

### 3.9.3 Analisis ROI Serangan

Analisis Return on Investment (ROI) serangan digunakan untuk menentukan apakah serangan menguntungkan secara ekonomi:

ROI = (Profit - Penalty - Gas Cost) / Gas Cost x 100%

Jika ROI < 0%, maka serangan tidak menguntungkan.
