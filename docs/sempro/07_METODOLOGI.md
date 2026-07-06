# BAB VIII METODOLOGI PENELITIAN

## 8.1 Metode Pengumpulan Data

### 8.1.1 Studi Literatur

Penulis memperoleh informasi yang dibutuhkan melalui kegiatan membaca, merangkum, serta menganalisis data dari berbagai sumber pustaka yang diperoleh dari dokumen tertulis, seperti jurnal, artikel, penelitian terkait, dan sumber daring lainnya. Sumber literatur yang digunakan meliputi penelitian terkait optimasi gas smart contract, keamanan bridge blockchain, EIP-1153 transient storage, dan MEV sandwich attack.

### 8.1.2 Implementasi Kontrak

Penulis mengimplementasikan empat kontrak bridge dengan tingkat optimasi dan keamanan yang berbeda-beda. Implementasi dilakukan menggunakan bahasa pemrograman Solidity 0.8.28 dengan compiler Foundry (forge) v1.7.1 pada lingkungan EVM Cancun yang mendukung EIP-1153 transient storage.

### 8.1.3 Pengukuran Gas

Penulis melakukan pengukuran gas menggunakan mekanisme bawaan Foundry lewat gasleft(). Pengukuran dilakukan untuk setiap kombinasi tier dan tipe transaksi (deposit, withdraw, swap) dengan 100 sampel per operasi pada lingkungan EVM simulasi.

## 8.2 Perancangan Sistem

Penulis menggunakan pendekatan Desain Komparatif Empiris sebagai metode perancangan sistem dalam penelitian ini. Metode ini dipilih karena menyediakan alur yang jelas dari implementasi, pengukuran, analisis, hingga validasi statistik (Park et al., 2024). Metode ini terdiri dari beberapa tahapan utama, yaitu:

### 8.2.1 Analisis Kebutuhan

Pada tahap ini, penulis mengidentifikasi kebutuhan optimasi gas dan keamanan pada smart contract bridge. Analisis dilakukan terhadap mekanisme SSTORE konvensional yang digunakan untuk reentrancy guard, yang memerlukan 22.900 gas per transaksi. Selain itu, dilakukan analisis terhadap potensi EIP-1153 transient storage yang hanya memerlukan 100 gas per operasi.

### 8.2.2 Perancangan Arsitektur 4-Tier

Penulis merancang empat tingkat optimasi bridge yang disebut 4-Tier Architecture:

**Tabel 1. Arsitektur 4-Tier Bridge**

| Tier | Kontrak | Deskripsi | Karakteristik |
|------|---------|-----------|---------------|
| A | UnoptimizedBridge | Baseline tanpa optimasi | Gas termurah, 0 keamanan |
| B | BridgeStaticOnly | Optimasi statis saja | Gas rendah, 2/8 keamanan |
| C | VictimBridge | Full dynamic (EIP-1153 + EWS) | Gas tinggi, 8/8 keamanan |
| D | LightweightBridge | Lightweight dynamic (inline) | Gas rendah, 8/8 keamanan |

### 8.2.3 Implementasi Optimasi Statis

Optimasi statis yang diterapkan meliputi:

1. **Variable Packing**: Menggabungkan variabel kecil ke dalam satu slot storage 32 bytes.
2. **CEI Pattern**: Menerapkan pattern Check-Effects-Interactions untuk mencegah reentrancy.
3. **Custom Errors**: Menggantikan revert string dengan custom errors untuk menghemat gas.
4. **Unchecked Arithmetic**: Menggunakan unchecked block untuk operasi aritmatika yang sudah dijamin aman.

### 8.2.4 Implementasi Optimasi Dinamis (EIP-1153)

Optimasi dinamis berbasis EIP-1153 transient storage diterapkan untuk:

1. **Reentrancy Guard**: Menggunakan TSTORE/TLOAD dengan biaya 100 gas per operasi.
2. **MEV Sandwich Detection**: Mendeteksi pola frontrun-victim secara on-chain.
3. **Economic Penalty**: Menerapkan penalti ekonomi terhadap serangan.
4. **Emergency Pause**: Menyediakan mekanisme pause darurat.
5. **Block Tracking**: Melacak blok transaksi untuk deteksi anomali.

## 8.3 Pengujian Sistem

### 8.3.1 Pengukuran Gas

Setiap operasi bridge (deposit, withdraw, swap) diukur gas-nya menggunakan 100 sampel per operasi. Jumlah sampel ini dipilih berdasarkan Central Limit Theorem (CLT) yang menyatakan bahwa distribusi mean akan mendekati normal untuk n ≥ 30. Statistik deskriptif yang dihitung meliputi mean, minimum, maximum, standar deviasi, dan confidence interval 95%.

### 8.3.2 Pengujian Keamanan

Pengujian keamanan mencakup tiga skenario utama:

1. **Reentrancy Attack**: Single-function, cross-function, dan consecutive reentrancy.
2. **MEV Sandwich Attack**: Deteksi pola frontrun-victim dan penerapan penalti.
3. **Emergency Pause**: Verifikasi fungsi pause dan unpause.

### 8.3.3 Validasi Statistik

Untuk membandingkan gas cost Tier C dan Tier D, digunakan Welch's t-test. Welch's t-test dipilih karena tidak memerlukan asumsi homogenitas variansi. Selain itu, Cohen's d digunakan untuk mengukur effect size atau besarnya perbedaan yang bermakna secara praktis.

## 8.4 Analisis Data

### 8.4.1 Analisis Deskriptif

Data gas cost dianalisis menggunakan statistik deskriptif: mean, minimum, maximum, standar deviasi, dan confidence interval 95%.

### 8.4.2 Metrik Cost-effectiveness

Untuk mengukur efisiensi bridge dalam mengubah biaya gas menjadi keamanan, digunakan metrik SPG (Security Points per Gas):

SPG = (Skor Keamanan / Gas Deposit) x 1.000.000

### 8.4.3 Effect Size (Cohen's d)

Cohen's d digunakan untuk mengukur besarnya perbedaan yang bermakna secara praktis:

d = (x1 - x2) / s_pooled

Interpretasi Cohen's d:
- d < 0,2: Negligible
- 0,2 - 0,5: Small
- 0,5 - 0,8: Medium
- d >= 0,8: Large

## 8.5 Platform Pengembangan

**Tabel 2. Platform Pengembangan**

| Komponen | Spesifikasi |
|----------|------------|
| IDE | VS Code + opencode CLI |
| OS | Windows 11 + WSL Ubuntu |
| Solidity | 0.8.28 |
| Compiler | Foundry (forge) v1.7.1 |
| EVM Version | Cancun (mendukung EIP-1153) |
| Optimizer | 200 runs |
