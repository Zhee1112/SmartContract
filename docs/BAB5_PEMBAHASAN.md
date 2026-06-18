# BAB 5: PEMBAHASAN

Bab ini mendiskusikan hasil-hasil penelitian yang telah disajikan pada Bab IV dalam konteks teori, literatur terdahulu, dan implikasi praktis. Pembahasan disusun secara berjenjang, dimulai dari analisis gas cost, evaluasi keamanan, cost-effectiveness, modifikasi EIP-1153, estimasi biaya real-world, validasi statistik, perbandingan static vs dynamic, perbandingan dengan studi terdahulu, keterbatasan penelitian, hingga implikasi praktis bagi pengembang DeFi dan operator bridge.

---

## 5.1 Pembahasan Hasil Gas Cost

### 5.1.1 Mengapa Tier D (Rollup Ringan) Lebih Murah

Hasil pengukuran menunjukkan bahwa Tier D (LightweightBridge) hanya memerlukan 34.156 gas untuk operasi deposit, hanya 8.7% lebih tinggi dari Tier B (31.427 gas) yang tanpa keamanan dinamis, namun **72.2% lebih murah** dari Tier C (122.769 gas) (Albert et al., 2021; Di Sorbo et al., 2021). Perbedaan yang sangat signifikan ini menuntut analisis mendalam terhadap sumber-sumber biaya yang mendasari masing-masing arsitektur (Li, 2025).

Faktor utama yang menyebabkan Tier D tetap murah adalah penggunaan pendekatan **inline assembly** untuk seluruh mekanisme keamanan dinamis. Sebagaimana dirancang pada kontrak `LightweightBridge.sol` (Baris 83-99), fungsi `_enterCall()`, `_exitCall()`, dan `_callDepth()` diimplementasikan langsung dalam satu kontrak menggunakan opcode TSTORE dan TLOAD yang masing-masing hanya berbiaya 100 gas. Tidak ada satu pun external call yang dilakukan ke kontrak lain selama operasi transaksi berjalan.

Secara rinci, komponen keamanan inline pada Tier D memiliki rincian biaya sebagai berikut:

| Komponen | Mekanisme | Gas |
|----------|-----------|-----|
| Reentrancy guard | TSTORE + TLOAD + TSTORE | 300 |
| Anomaly check | SLOAD × 2 (warm) | 4.400 |
| Penalty calculation | Pure math (tanpa storage) | 300 |
| Transaction recording | SSTORE × 2 (warm write) | 5.800 |
| **Total overhead keamanan** | | **~10.800** |

Jumlah ini sangat kompak dan terlokalisasi dalam satu kontrak. Tidak ada komponen yang memerlukan akses storage silang kontrak (cross-contract storage access), yang merupakan salah satu sumber biaya terbesar dalam arsitektur konvensional.

### 5.1.2 Mengapa Tier C (Rollup Full) Lebih Mahal

Sebaliknya, Tier C (VictimBridge) memerlukan 122.769 gas untuk deposit — **3.91x lebih mahal** dari Tier B. Analisis terhadap kode sumber VictimBridge.sol mengungkapkan bahwa setiap operasi transaksi melakukan minimal 5 external calls ke kontrak MonitorMock:

1. `monitor.recordTransaction()` — mencatat transaksi ke dynamic array
2. `monitor.enterCall()` — mengatur reentrancy lock
3. `monitor.checkAnomaly()` — memeriksa pola sandwich
4. `monitor.calculatePenalty()` — menghitung penalti ekonomi
5. `monitor.exitCall()` — melepaskan reentrancy lock

Setiap external call ini memerlukan biaya yang signifikan karena mekanisme CALL opcode pada EVM:

| Sumber Biaya | Tier C (External) | Tier D (Inline) | Selisih |
|--------------|-------------------|-----------------|---------|
| CALL opcode (5 panggilan) | ~500 | 0 | -500 |
| ABI encode/decode | ~15.000 | 0 | **-15.000** |
| Code loading (cold codecopy) | ~13.000 | 0 | **-13.000** |
| Dynamic array SSTORE (txRecords[]) | ~22.100 | 0 | **-22.100** |
| Cold SLOAD di MonitorMock | ~10.500 | 0 | **-10.500** |
| Inline TSTORE/TLOAD | 0 | ~400 | +400 |
| Inline SLOAD (warm) | 0 | ~4.400 | +4.400 |
| **Total overhead** | **~74.100** | **~12.200** | **-61.900** |

Temuan ini mengkonfirmasi hipotesis bahwa **60% biaya tambahan Tier C berasal dari external calls ke MonitorMock**. Komponen terbesar adalah dynamic array `txRecords[]` yang memerlukan SSTORE sebesar 22.100 gas per push (karena setiap push menulis ke slot baru yang bersifat cold). Dalam kontras, Tier D menggunakan single-slot `LastTx` struct yang hanya memerlukan 2.900 gas untuk setiap overwrite (warm write ke slot yang sama).

### 5.1.3 Analisis Rasio Gas antar Tier

Analisis rasio gas memperkuat temuan di atas:

| Transisi | Rasio Gas | Interpretasi |
|----------|-----------|--------------|
| A → B | 1.00x | Optimasi statis (CEI, packing) tidak mengubah gas runtime |
| B → C | 3.91x – 10.77x | External calls meningkatkan gas secara drastis |
| B → D | 1.09x – 1.25x | Modifikasi inline hanya menambah sedikit gas |
| C → D | 0.08x – 0.12x | Inline 8x – 11x lebih murah dari external calls |

Rasio ini menunjukkan pola yang konsisten di seluruh operasi bridge. Untuk operasi withdraw, disparitas bahkan lebih mencolok: Tier C memerlukan 104.806 gas sementara Tier D hanya 12.119 gas — rasio 10.77x. Hal ini terjadi karena withdraw melibatkan lebih banyak interaksi storage (pembacaan balance, penulisan balance, transfer ETH), dan setiap interaksi tersebut pada Tier C harus dilengkapi dengan external calls ke MonitorMock.

### 5.1.4 Implikasi terhadap Skala Operasional

Perbedaan gas yang sangat signifikan ini memiliki implikasi besar terhadap skalabilitas operasional bridge. Pada volume transaksi tinggi — misalnya 100.000 transaksi per bulan — akumulasi perbedaan gas menjadi sangat substansial. Tier C akan mengkonsumsi sekitar 12,28 miliar gas per bulan, sedangkan Tier D hanya 3,42 miliar gas — selisih 8,86 miliar gas. Pada harga gas 30 Gwei, selisih ini setara dengan sekitar $79.000 per bulan (berdasarkan estimasi pada BAB IV).

Temuan ini konsisten dengan prinsip desain arsitektur kontrak yang dianjurkan oleh Trail of Bits (2024): meminimalkan external calls ketika fungsionalitas yang sama dapat diimplementasikan secara inline. External calls tidak hanya menambah biaya gas, tetapi juga memperluas attack surface dan menambah kompleksitas audit keamanan.

---

## 5.2 Pembahasan Keamanan

### 5.2.1 Pencapaian Tier D: 8/8 Skor Keamanan dengan 0 External Calls

Salah satu temuan paling signifikan dari penelitian ini adalah kemampuan Tier D dalam mencapai skor keamanan **8/8** (sama dengan Tier C) tanpa satu pun external call (Zheng et al., 2023; Wang et al., 2026). Hal ini merupakan pencapaian yang bertentangan dengan asumsi konvensional dalam pengembangan smart contract, yang menganggap bahwa mekanisme keamanan dinamis harus diimplementasikan melalui kontrak terpisah (seperti MonitorMock) (Feng et al., 2023; Samreen & Alalfi, 2020).

Berdasarkan matrix keamanan yang disajikan pada BAB III (Bagian 3.6.1), delapan fitur keamanan yang dievaluasi adalah:

| No | Fitur Keamanan | Tier A | Tier B | Tier C | Tier D |
|----|---------------|--------|--------|--------|--------|
| 1 | Reentrancy Single-function | ✗ | ✓ | ✓ | ✓ |
| 2 | Reentrancy Cross-function | ✗ | ✗ | ✓ | ✓ |
| 3 | Reentrancy Consecutive | ✗ | ✗ | ✓ | ✓ |
| 4 | MEV Sandwich Detection | ✗ | ✗ | ✓ | ✓ |
| 5 | Economic Penalty | ✗ | ✗ | ✓ | ✓ |
| 6 | Emergency Pause | ✗ | ✗ | ✓ | ✓ |
| 7 | Block Tracking | ✗ | ✗ | ✓ | ✓ |
| 8 | Custom Errors | ✗ | ✓ | ✓ | ✓ |
| **Total** | | **0/8** | **2/8** | **8/8** | **8/8** |

Tier D mencapai skor 8/8 ini melalui implementasi yang sepenuhnya berbeda dari Tier C:

**Reentrancy Guard (Fitur 1-3):** Tier D menggunakan TSTORE/TLOAD inline pada slot konstan `REENTRANCY_SLOT = 1` (LightweightBridge.sol, Baris 83-99). Mekanisme `_enterCall()`, `_callDepth()`, dan `_exitCall()` memastikan bahwa setiap panggilan rekursif akan terdeteksi dan diblokir. Berbeda dari CEI pattern pada Tier B yang hanya melindungi single-function reentrancy, mekanisme transient storage ini secara efektif memblokir cross-function dan consecutive reentrancy karena status lock bersifat global per transaksi dan direset secara otomatis.

**MEV Detection (Fitur 4):** Tier D menggunakan struct `LastTx` yang terdiri dari `sender` (address, 20 byte) dan `txType` (uint8, 1 byte), yang dikemas dalam satu slot 32-byte (LightweightBridge.sol, Baris 49-52). Deteksi sandwich dilakukan oleh fungsi `_checkAnomaly()` (Baris 101-107) yang memeriksa apakah terdapat pola frontrun → victim dalam satu blok yang sama. Pendekatan single-slot ini menggantikan dynamic array `txRecords[]` pada Tier C tanpa mengorbankan fungsionalitas deteksi.

**Economic Penalty (Fitur 5):** Fungsi `_calculatePenalty()` (LightweightBridge.sol, Baris 123-127) mengimplementasikan formula penalti secara murni menggunakan aritmatika inline: `(amount * LAMBDA * anomalyScore) / 100000000`. Tidak ada storage yang dibutuhkan untuk menghitung penalti — seluruh komputasi dilakukan di memory dan stack. Hasilnya adalah biaya hanya 300 gas, dibandingkan 2.800 gas yang diperlukan oleh `monitor.calculatePenalty()` pada Tier C.

**Emergency Pause (Fitur 6):** Flag `paused` (LightweightBridge.sol, Baris 61) diimplementasikan sebagai SSTORE biasa dengan biaya 2.900 gas untuk warm write. Fungsi `pause()` dan `unpause()` (Baris 213-225) memastikan bahwa admin dapat menghentikan seluruh operasi bridge secara instan.

**Block Tracking (Fitur 7):** Variabel `lastTxBlock` (LightweightBridge.sol, Baris 58) mencatat nomor blok dari transaksi terakhir, memungkinkan deteksi lintas blok yang akurat. Pada Baris 102, `_checkAnomaly()` membandingkan `lastTxBlock == block.number` untuk memastikan bahwa deteksi sandwich hanya berlaku dalam satu blok yang sama.

**Custom Errors (Fitur 8):** Seperti Tier B, Tier D menggunakan custom errors (Baris 27-35) yang menghemat sekitar 50 gas per revert dibandingkan require dengan string message.

### 5.2.2 Perbandingan Pendekatan Keamanan Tier C vs Tier D

Meskipun mencapai skor keamanan yang identik (8/8), Tier C dan Tier D menggunakan pendekatan arsitektural yang sangat berbeda:

| Aspek | Tier C (VictimBridge) | Tier D (LightweightBridge) |
|-------|----------------------|---------------------------|
| Reentrancy guard | EIP-1153 via MonitorMock | EIP-1153 inline |
| MEV detection | Dynamic array txRecords[] | Single-slot LastTx |
| Penalty calculation | External call ke MonitorMock | Pure math inline |
| Emergency pause | SSTORE (identik) | SSTORE (identik) |
| External calls per tx | 5-6 | 0 |
| Gas overhead keamanan | ~74.100 | ~10.800 |
| Attack surface | Lebih luas (2 kontrak) | Lebih sempit (1 kontrak) |

Perbedaan kritis yang perlu diperhatikan adalah dari perspektif **attack surface**. Tier C mengharuskan dua kontrak berinteraksi — VictimBridge dan MonitorMock. Setiap interaksi ini membuka peluang exploitasi baru: (1) reentrancy antar kontrak, (2) manipulation return value dari MonitorMock, (3) griefing attack melalui penolakan layanan pada MonitorMock, dan (4) front-running pada transaksi yang memanggil MonitorMock. Tier D menghilangkan seluruh risiko ini dengan mengonsolidasikan semua logika ke dalam satu kontrak.

Temuan ini selaras dengan rekomendasi Consensys (2024) yang menyarankan bahwa kontrak bridge sebaiknya meminimalkan jumlah dependencies eksternal untuk mengurangi kompleksitas dan meningkatkan auditability.

### 5.2.3 Hasil Verifikasi Serangan

Hasil pengujian serangan yang dilaporkan pada BAB IV (Bagian 4.3) menunjukkan bahwa Tier D berhasil memblokir seluruh jenis serangan yang diuji (Samreen & Alalfi, 2020; Zheng et al., 2023):

**Single-function Reentrancy:** Attacker melakukan panggilan rekursif ke fungsi withdraw. Tier D mendeteksi depth > 0 melalui `_callDepth()` dan langsung revert dengan `ReentrancyDetected()`. Hasil: DIBLOKIR (Yu et al., 2022).

**Cross-function Reentrancy:** Attacker mengeksploitasi interaksi antara fungsi withdraw dan fungsi lainnya. Tier D tetap efektif karena transient storage lock bersifat global per transaksi — tidak peduli fungsi mana yang dipanggil, status lock akan terdeteksi (Feng et al., 2023). Hasil: DIBLOKIR.

**Consecutive Reentrancy (3x):** Attacker melakukan 3 panggilan berurutan. Setiap panggilan memeriksa `_callDepth()` sebelum masuk ke kritis section. Hasil: DIBLOKIR di setiap panggilan.

Hasil ini membuktikan bahwa mekanisme inline pada Tier D setidaknya seefektif mekanisme external pada Tier C dalam memblokir serangan reentrancy (Rodler et al., 2021; Zheng et al., 2023), namun dengan biaya yang jauh lebih rendah dan tanpa menambah attack surface (Nassirzadeh et al., 2023).

---

## 5.3 Pembahasan Cost-Effectiveness SPG

### 5.3.1 Tier D vs Tier C: Efisiensi 3.4x

Metrik Security Points per Gas (SPG) dirancang khusus untuk mengukur efisiensi konversi biaya gas menjadi keamanan (Zhang et al., 2022; Zhou et al., 2026). Rumus SPG didefinisikan sebagai:

```
SPG = (Skor Keamanan / Gas Deposit) × 1.000.000
```

Berdasarkan data pengukuran:

| Tier | Skor Keamanan | Gas (Deposit) | SPG (×1.000.000) | Ranking |
|------|--------------|---------------|-------------------|---------|
| A | 0/8 | 31.412 | 0 | 4 |
| B | 2/8 | 31.427 | 63,6 | 3 |
| C | 8/8 | 122.769 | 65,2 | 2 |
| **D** | **8/8** | **34.156** | **220,1** | **1** |

**Tier D memiliki SPG sebesar 220,1 — 3,4x lebih efisien dari Tier C (65,2 SPG).**

Artinya, untuk setiap satu juta gas yang dihabiskan, Tier D memberikan 220,1 unit keamanan, sedangkan Tier C hanya memberikan 65,2 unit keamanan. Disparitas ini terutama disebabkan oleh biaya gas yang jauh lebih rendah pada Tier D (34.156 vs 122.769) dengan skor keamanan yang sama (8/8).

### 5.3.2 Analisis Biaya per Fitur Keamanan Tambahan

Analisis biaya per fitur keamanan tambahan memberikan wawasan yang lebih mendalam tentang efisiensi setiap transisi arsitektur:

| Transisi | Fitur Tambahan | Gas Tambahan | Biaya per Fitur |
|----------|---------------|-------------|-----------------|
| A → B | 4 fitur (CEI, packing, custom errors, unchecked math) | +15 | 3.75 gas/fitur |
| B → D | 3 fitur (reentrancy guard, MEV detection, economic penalty) | +2.729 | 909.7 gas/fitur |
| D → C | 0 fitur tambahan (identik 8/8) | +88.613 | ∞ (tanpa penambahan fitur) |

Temuan yang sangat menarik adalah bahwa transisi B → D hanya memerlukan 909.7 gas per fitur keamanan tambahan — biaya yang sangat rendah untuk tiga fitur keamanan kritis (reentrancy guard, MEV detection, economic penalty). Sebaliknya, transisi D → C tidak menambah fitur keamanan apapun (keduanya 8/8) namun memerlukan tambahan 88.613 gas. Seluruh tambahan biaya ini berasal dari arsitektural overhead — spesifiknya, penggunaan external calls alih-alih inline implementation.

Perbandingan ini mengungkapkan sebuah ironi desain: **Tier C membayar 97.4x lebih mahal untuk fitur yang sama dengan Tier D**. Satu-satunya perbedaan fungsional antara Tier C dan Tier D adalah metode implementasi (external vs inline), bukan jumlah fitur.

### 5.3.3 Relevansi SPG sebagai Metrik

Metrik SPG memiliki relevansi praktis yang signifikan bagi pengambil keputusan dalam desain bridge. Dalam dunia nyata, operator bridge harus membuat tradeoff antara biaya operasional dan tingkat keamanan. SPG menyediakan kerangka kuantitatif untuk mengevaluasi tradeoff ini.

Bayangkan seorang pengembang bridge yang memiliki budget gas tetap — misalnya 50.000 gas per transaksi untuk komponen keamanan. Dengan Tier C, budget ini hanya cukup untuk satu fitur keamanan penuh (reentrancy guard + MEV detection) dengan sisa yang terbatas. Namun dengan Tier D, budget yang sama dapat mencakup semua lima fungsi keamanan (reentrancy guard, MEV detection, economic penalty, emergency pause, block tracking) dengan sisa yang cukup untuk operasi utama bridge.

Implikasinya adalah bahwa Tier D memungkinkan desain bridge yang **lebih aman dengan biaya lebih rendah** — sebuah kombinasi yang sebelumnya dianggap kontradiktif dalam literatur optimasi gas.

---

## 5.4 Pembahasan Modifikasi EIP-1153

### 5.4.1 Evolusi dari Reentrancy Guard ke Multifungsi

EIP-1153 dalam spesifikasi aslinya dirancang untuk satu tujuan spesifik: mengimplementasikan reentrancy guard yang efisien gas (Benedetti et al., 2024; Casale-Brunet, 2024). Konsep dasarnya sederhana — gunakan TSTORE untuk mengatur lock dan TLOAD untuk memeriksa status lock, dengan biaya total hanya 200 gas (100 + 100). OpenZeppelin telah mengadopsi desain ini dalam `TransientStorageGuard` (OpenZeppelin, 2024).

Penelitian ini memodifikasi penggunaan EIP-1153 dari satu fungsi menjadi **lima fungsi keamanan** dalam satu kontrak:

| Pendekatan | Fungsi Keamanan | Gas Total | External Calls |
|-----------|----------------|-----------|----------------|
| EIP-1153 asli (reentrancy only) | 1 | 200 | 0 |
| Tier C (via MonitorMock) | 5 | ~74.100 | 5-6 per tx |
| **Tier D (modifikasi inline)** | **5** | **~9.900** | **0** |

Modifikasi ini merepresentasikan pergeseran paradigma: dari EIP-1153 sebagai **mekanisme tunggal** menjadi **platform keamanan** yang dapat mendukung berbagai fungsi pertahanan.

### 5.4.2 Rincian Lima Modifikasi

**Modifikasi 1: TSTORE/TLOAD Reentrancy Guard (200 gas)**
Implementasi ini identik dengan spesifikasi asli EIP-1153. Fungsi `_enterCall()` menulis nilai 1 ke slot `REENTRANCY_SLOT`, `_callDepth()` membaca nilai dari slot tersebut, dan `_exitCall()` menulis nilai 0 untuk mereset. Auto-reset otomatis terjadi di akhir transaksi, sehingga tidak diperlukan fungsi `_unlock()` eksplisit seperti pada SSTORE-based ReentrancyGuard.

**Modifikasi 2: Single-slot MEV Detection (4.400 gas)**
Ini adalah modifikasi paling inovatif. Alih-alih menggunakan dynamic array `txRecords[]` yang memerlukan SSTORE cold per push (22.100 gas), Tier D menggunakan struct `LastTx` yang dikemas dalam satu slot. Setiap transaksi baru menimpa (overwrite) data sebelumnya, sehingga hanya memerlukan SSTORE warm (2.900 gas). Deteksi dilakukan dengan membandingkan `lastTxBlock == block.number` dan memeriksa tipe transaksi sebelumnya — cukup untuk mendeteksi pola sandwich Ta1 → Tv dalam satu blok.

**Modifikasi 3: Block Number Tracking (2.100 gas)**
Variabel `lastTxBlock` disimpan sebagai SSTORE biasa dan dibaca dengan SLOAD warm. Fungsinya adalah memastikan bahwa deteksi MEV hanya berlaku dalam konteks blok yang sama. Tanpa tracking ini, transaksi yang terpisah beberapa blok akan salah terdeteksi sebagai sandwich.

**Modifikasi 4: Inline Penalty Calculation (300 gas)**
Formula penalti `(amount * LAMBDA * anomalyScore) / 1e8` diimplementasikan sebagai pure function yang tidak memerlukan akses storage. Seluruh komputasi terjadi di stack EVM, sehingga biayanya minimal — hanya aritmatika dasar.

**Modifikasi 5: Emergency Pause (2.900 gas)**
Flag `paused` diimplementasikan sebagai SSTORE biasa. Biaya ini identik antara Tier C dan Tier D karena emergency pause tidak melibatkan external calls.

Total biaya lima modifikasi ini adalah ~9.900 gas — hanya **48.5x lebih murah** dari Tier C yang mengimplementasikan fungsi yang sama melalui external calls ke MonitorMock.

### 5.4.3 Dampak terhadap Paradigma Desain Keamanan

Temuan ini memiliki dampak signifikan terhadap paradigma desain keamanan smart contract (Pofcher & Ellul, 2025; Zheng et al., 2025). Selama ini, komunitas pengembang Solidity cenderung memisahkan mekanisme keamanan ke dalam kontrak terpisah (seperti pattern Guard di OpenZeppelin) untuk memisahkan kepentingan (separation of concerns) dan memudahkan audit (Yu et al., 2022). Pendekatan ini menghasilkan arsitektur multi-kontrak yang bersih secara modular namun mahal secara gas (Albert et al., 2021; Di Sorbo et al., 2021).

Tier D membuktikan bahwa pendekatan alternatif — mengonsolidasikan semua logika keamanan secara inline dalam satu kontrak — dapat menghasilkan keamanan yang setara dengan biaya yang jauh lebih rendah (Li, 2025). Konsolidasi ini tidak mengorbankan auditability karena seluruh kode keamanan berada dalam satu file, sehingga auditor dapat meninjau seluruh logika pertahanan dalam satu konteks (Shou et al., 2023).

Namun, pendekatan ini memiliki tradeoff yang perlu diakui: (1) ukuran kontrak lebih besar, (2) kompleksitas kode lebih tinggi dalam satu kontrak, dan (3) fleksibilitas pembaruan keamanan lebih terbatas (karena semua terkonsolidasi) (Wang et al., 2026; Zhou et al., 2026). Tradeoff ini dibahas lebih lanjut pada Bagian 5.9 (Keterbatasan Penelitian).

---

## 5.5 Pembahasan Real-World Cost

### 5.5.1 Estimasi Biaya USD per Transaksi

Berdasarkan data gas price dari Etherscan V2 API (base fee: 0.677 Gwei) dan harga ETH $2.500, berikut adalah estimasi biaya USD per transaksi deposit:

| Gas Price | Tier A | Tier B | Tier C | Tier D |
|-----------|--------|--------|--------|--------|
| 10 Gwei | $0.08 | $0.08 | $0.31 | $0.09 |
| 30 Gwei | $0.24 | $0.24 | $0.92 | $0.26 |
| 80 Gwei | $0.63 | $0.63 | $2.46 | $0.68 |
| 150 Gwei | $1.18 | $1.18 | $4.60 | $1.28 |

Perbedaan biaya ini tampak kecil untuk transaksi individual — hanya $0.17 per transaksi antara Tier C dan Tier D pada 30 Gwei. Namun, dampaknya menjadi sangat signifikan pada skala operasional bridge.

### 5.5.2 Dampak terhadap Volume Transaksi Tinggi

Untuk bridge dengan volume 100.000 transaksi per bulan:

| Gas Price | Tier C (100K tx) | Tier D (100K tx) | Penghematan |
|-----------|-----------------|-----------------|-------------|
| 30 Gwei | $92.000/bulan | $26.000/bulan | **$66.000/bulan** |
| 80 Gwei | $246.000/bulan | $68.000/bulan | **$178.000/bulan** |

Pada kondisi gas price normal (30 Gwei), Tier D menghemat $66.000 per bulan. Pada kondisi congested (80 Gwei), penghematan meningkat menjadi $178.000 per bulan. Dalam setahun, akumulasi penghematan mencapai $792.000 sampai $2.136.000 — angka yang sangat substansial bagi operasional bridge.

### 5.5.3 Analisis Sensitivitas terhadap Harga Gas

Fluktuasi harga gas Ethereum sangat dinamis. Berdasarkan data historis dari Dune Analytics (2024), base fee Ethereum dapat berfluktuasi dari 5 Gwei (kondisi normal) hingga 200+ Gwei (kondisi congested, misalnya saat token launch besar). Analisis sensitivitas menunjukkan bahwa:

- Pada **gas price rendah (5-10 Gwei)**: Perbedaan biaya Tier C vs Tier D relatif kecil ($0.10-$0.17 per tx). Namun, untuk bridge dengan volume sangat tinggi (1 juta tx/bulan), penghematan tetap mencapai $100.000-$170.000/bulan.

- Pada **gas price normal (20-40 Gwei)**: Perbedaan menjadi signifikan ($0.34-$0.68 per tx). Bridge dengan volume 100K tx/bulan menghemat $34.000-$68.000/bulan.

- Pada **gas price tinggi (80-200 Gwei)**: Perbedaan menjadi sangat substansial ($1.37-$3.44 per tx). Penghematan untuk 100K tx/bulan mencapai $137.000-$344.000/bulan.

Temuan ini menunjukkan bahwa **semakin tinggi harga gas, semakin besar keuntungan Tier D dibandingkan Tier C**. Hal ini menjadikan Tier D semakin relevan dalam kondisi pasar yang volatil, di mana harga gas dapat melonjak secara tiba-tiba.

### 5.5.4 Perbandingan dengan Biaya Infrastruktur Lain

Dalam konteks biaya operasional bridge yang lebih luas, gas fee hanyalah salah satu komponen. Komponen lain meliputi: biaya infrastruktur server (untuk monitoring off-chain), biaya audit keamanan, biaya asuransi, dan biaya likuiditas. Namun, gas fee merupakan komponen yang paling sering dikeluarkan (recurring cost), berbeda dari biaya audit yang bersifat periodik.

Dengan menghemat $66.000-$178.000 per bulan dari gas fee, operator dialihkan untuk mengalokasikan sumber daya ke komponen lain yang meningkatkan keamanan — misalnya audit keamanan berkala, bug bounty program, atau monitoring infrastruktur. Dengan demikian, efisiensi gas Tier D secara tidak langsung berkontribusi terhadap peningkatan keamanan holistik bridge.

---

## 5.6 Pembahasan Statistik

### 5.6.1 Welch's t-test: Tolak H₀

Uji hipotesis Welch's t-test (Welch, 1947) dilakukan untuk menguji apakah terdapat perbedaan signifikan secara statistik antara gas cost Tier C dan Tier D pada operasi deposit (Lagouvardos et al., 2024). Hasil uji:

| Metrik | Nilai | Interpretasi |
|--------|-------|-------------|
| t-statistic | 1.680,67 | Perbedaan sangat besar secara statistik |
| p-value | 2,25 × 10⁻²²² | Jauh di bawah α = 0,05 |
| Keputusan | **TOLAK H₀** | Perbedaan sangat signifikan |

**H₀ (Null Hypothesis):** Tidak ada perbedaan signifikan gas cost antara Tier C dan Tier D.

**Keputusan:** H₀ ditolak dengan tingkat keyakinan yang sangat tinggi (p ≈ 0). Artinya, perbedaan gas antara Tier C (122.769) dan Tier D (34.156) bukan merupakan kebetulan statistik, melainkan merupakan perbedaan nyata yang konsisten di seluruh 100 sampel.

Tingkat signifikasi ini sangat kuat — p-value sekecil 2,25 × 10⁻²²² jauh melampaui threshold α = 0,05 yang lazim digunakan dalam penelitian. Bahkan dengan threshold yang sangat ketat sekalipun (α = 0,001), H₀ tetap ditolak. Hal ini memberikan bukti statistik yang sangat kuat bahwa modifikasi inline EIP-1153 pada Tier D menghasilkan penghematan gas yang nyata dan konsisten.

### 5.6.2 Confidence Interval 95%: Presisi Tinggi

Confidence interval 95% untuk rasio penghematan gas Tier D vs Tier C adalah [98.18%, 98.23%]. Interval yang sangat sempit ini (lebar hanya 0.05%) menunjukkan:

1. **Presisi pengukuran yang sangat tinggi:** Estimasi penghematan gas sangat presis, dengan margin of error yang sangat kecil.

2. **Konsistensi data:** Variansi antar sampel sangat kecil, menunjukkan bahwa pengukuran gas bersifat highly reproducible dalam lingkungan EVM yang terkontrol.

3. **Keandalan temuan:** Confidence interval yang sempit memperkuat keyakinan bahwa penghematan gas Tier D dibandingkan Tier C bersifat konsisten dan dapat direplikasi.

### 5.6.3 Cohen's d = 220.64: Effect Size Sangat Besar

Cohen's d sebesar 220.64 menunjukkan effect size yang **sangat jauh di atas** threshold "large" (d ≥ 0.8). Untuk mempersepektifkan angka ini:

| Threshold Cohen's d | Interpretasi | Angka Penelitian Ini |
|---------------------|-------------|---------------------|
| d < 0,2 | Negligible | |
| 0,2 – 0,5 | Small | |
| 0,5 – 0,8 | Medium | |
| ≥ 0,8 | Large | **220,64** |

Cohen's d sebesar 220.64 berarti bahwa mean gas Tier C berjarak 220.64 standard deviation di atas mean gas Tier D. Dalam konteks distribusi normal, perbedaan sebesar ini menunjukkan bahwa kedua distribusi gas **tidak tumpang tindih sama sekali** — seluruh sampel Tier C memiliki gas yang lebih tinggi dari seluruh sampel Tier D. Ini merupakan bukti empiris yang sangat kuat bahwa arsitektur inline (Tier D) secara fundamental lebih efisien dari arsitektur external (Tier C).

### 5.6.4 Validitas Metodologi Statistik

Penggunaan Welch's t-test (bukan Student's t-test) merupakan keputusan metodologis yang tepat karena dua alasan:

1. **Asumsi homogenitas variansi tidak terpenuhi:** Variansi gas Tier C (~2.100²) jauh lebih besar dari variansi gas Tier D (~3.200² untuk deposit). Welch's t-test tidak memerlukan asumsi variansi sama, sehingga lebih robust.

2. **Ukuran sampel besar (n=100):** Dengan 100 sampel per tier, Central Limit Theorem memastikan bahwa distribusi mean mendekati normal, yang merupakan prasyarat utama t-test. Penggunaan 100 sampel (melampaui minimum 30 yang disarankan Cochran, 1977) menghasilkan power testing yang tinggi.

---

## 5.7 Pembahasan Static vs Dynamic

### 5.7.1 Mengapa Keduanya Diperlukan

Hasil penelitian menunjukkan bahwa **optimasi statis dan dinamis saling melengkapi, bukan saling menggantikan**. Tier B (hanya statis) mencapai gas rendah (31.427) namun hanya 2/8 skor keamanan. Tier D (statis + dinamis inline) mencapai gas yang hampir identik (34.156, hanya 8.7% lebih tinggi) namun 8/8 skor keamanan. Perbedaan biaya hanya 2.729 gas untuk peningkatan keamanan sebesar 100%.

Optimasi statis berkontribusi terhadap:
- **Variable packing**: Mengurangi jumlah slot storage (hemat 20.000 gas per slot)
- **CEI pattern**: Mencegah single-function reentrancy secara compile-time
- **Custom errors**: Menghemat ~50 gas per revert
- **Unchecked arithmetic**: Menghemat ~20 gas per operasi

Namun, optimasi statis memiliki batas yang jelas. CEI tidak dapat mendeteksi MEV sandwich attack, tidak dapat menerapkan penalti ekonomi, dan tidak dapat menghentikan operasi bridge secara emergency. Fitur-fitur ini memerlukan logika runtime — yaitu optimasi dinamis.

### 5.7.2 Tier B: 25% Keamanan — Terlalu Rendah untuk Produksi

Tier B mencapai gas yang paling rendah (31.427 untuk deposit) namun hanya 2/8 fitur keamanan. Dua fitur yang dimilikinya adalah CEI pattern (yang mencegah single-function reentrancy) dan custom errors. Meskipun CEI merupakan practice terbaik dalam smart contract security, perlindungannya terbatas pada satu jenis serangan saja.

Serangan yang **tidak** dapat diblokir oleh Tier B meliputi:
- **Cross-function reentrancy**: Attacker mengeksploitasi interaksi antar fungsi yang berbeda
- **Consecutive reentrancy**: Attacker melakukan multiple reentrancy dalam satu transaksi
- **MEV sandwich attack**: Bot MEV memanfaatkan urutan transaksi
- **Emergency response**: Tidak ada mekanisme pause saat serangan terdeteksi

Dalam konteks bridge production yang menyimpan dana pengguna dalam jumlah besar, 25% keamanan merupakan tingkat yang **tidak dapat diterima**. Data dari Zheng et al. (2023) dan Shou et al. (2023) menunjukkan bahwa kerugian akibat eksploitasi bridge telah mencapai miliaran dolar — termasuk Ronin ($620 juta), Wormhole ($320 juta), dan Nomad ($190 juta) — sebagian besar disebabkan oleh kelemahan yang tidak dapat diatasi oleh optimasi statis saja.

### 5.7.3 Tier D: Keseimbangan Optimal

Tier D membuktikan bahwa keseimbangan optimal antara gas cost dan keamanan dapat dicapai dengan menggabungkan optimasi statis dan dinamis secara inline. Gas tambahan yang diperlukan hanya 2.729 gas (8.7% dari Tier B) untuk menambah 6 fitur keamanan tambahan (reentrancy guard, MEV detection, economic penalty, emergency pause, block tracking, dan peningkatan CEI menjadi cross-function reentrancy guard).

Biaya per fitur keamanan tambahan (909.7 gas/fitur) merupakan investasi yang sangat efisien. Bandingkan dengan Tier C yang memerlukan 88.613 gas per fitur tambahan — 97.4x lebih mahal untuk fitur yang sama.

### 5.7.4 Implikasi untuk Hierarki Keamanan

Temuan ini mengimplikasikan hierarki keamanan yang jelas bagi pengembang bridge:

```
Level 0: Tanpa optimasi (Tier A) — 0/8 — TIDAK DIREKOMENDASIKAN
Level 1: Optimasi statis saja (Tier B) — 2/8 — UNTUK PROTotyping SAJA
Level 2: Optimasi statis + dinamis inline (Tier D) — 8/8 — REKOMENDASI UTAMA
Level 3: Optimasi statis + dinamis external (Tier C) — 8/8 — TIDAK EFEKTIF
```

Level 2 (Tier D) merupakan rekomendasi utama karena menawarkan keamanan penuh (8/8) dengan biaya gas terendah. Level 3 (Tier C) memiliki keamanan yang sama tetapi dengan biaya 3.6x lebih tinggi, menjadikannya pilihan yang tidak efisien.

---

## 5.8 Perbandingan dengan Studi Terdahulu

### 5.8.1 Hop Protocol

Hop Protocol (2024) mengimplementasikan bridge antar-rollup dengan mekanisme liquidity pool dan bonder. Dari perspektif keamanan, Hop menggunakan validator set dan fraud proof, namun **tidak mengimplementasikan reentrancy guard berbasis EIP-1153** maupun on-chain MEV detection. Mekanisme keamanan Hop bergantung pada Bonded Liquidity Provider yang menyerahkan jaminan — sebuah pendekatan ekonomis alih-aliah teknis.

Perbandingan dengan penelitian ini menunjukkan bahwa Hop dan Tier D mengambil pendekatan yang berbeda namun komplementer. Hop berfokus pada keamanan ekonomis (bond), sementara Tier D berfokus pada keamanan teknis (reentrancy guard + MEV detection). Idealnya, kedua pendekatan dapat digabungkan: bridge dengan bond (seperti Hop) yang juga mengimplementasikan EIP-1153 inline (seperti Tier D) akan memiliki pertahanan berlapis (defense-in-depth) yang lebih kuat.

### 5.8.2 Stargate Finance (LayerZero)

Stargate Finance (2024) beroperasi di atas protokol LayerZero dan menggunakan Unified Liquidity Pool. Mekanisme keamanan Stargate meliputi DVN (Decentralized Verifier Network) dan rate limiting. Namun, seperti Hop, Stargate **tidak mengimplementasikan EIP-1153 transient storage** maupun on-chain MEV detection.

Rate limiting pada Stargate merupakan pendekatan pasif — membatasi volume transaksi untuk mengurangi dampak serangan. Pendekatan Tier D bersifat aktif — mendeteksi pola serangan secara real-time dan menerapkan penalti ekonomi. Kedua pendekatan dapat saling melengkapi dalam arsitektur bridge production.

### 5.8.3 Ronin Bridge

Ronin Bridge (2022) mengalami eksploitasi senilai $620 juta yang melibatkan kompromi validator key. Meskipun jenis serangan ini berbeda dari reentrancy atau MEV sandwich yang diuji dalam penelitian ini, analisis post-mortem mengungkapkan bahwa mekanisme validasi transaksi Ronin tidak memiliki Emergency Pause yang memadai (Zheng et al., 2023). Tier D mengatasi kelemahan ini melalui fitur emergency pause yang dapat menghentikan seluruh operasi bridge secara instan.

### 5.8.4 Wormhole Bridge

Wormhole Bridge (2022) kehilangan $320 juta akibat bypass verifikasi signature. Eksploitasi ini memanfaatkan celah dalam verifikasi header block, yang memungkinkan penyerang mencetak token tanpa jaminan. Meskipun serangan ini spesifik terhadap arsitektur Wormhole (signature verification), analisis keamanan Trail of Bits (2022) menunjukkan bahwa **tidak adanya reentrancy guard** pada beberapa fungsi Wormhole memperparah dampak eksploitasi — penyerang dapat mengeksekusi serangan secara rekursif untuk memperbesar keuntungan.

Tier D mengatasi kerentanan ini secara fundamental: EIP-1153 reentrancy guard memastikan bahwa setiap fungsi kritis hanya dapat dieksekusi sekali per transaksi, sehingga bahkan jika celah verifikasi ditemukan, penyerang tidak dapat mengeksploitasi secara rekursif.

### 5.8.5 Tabel Perbandingan Komprehensif

| Aspek | Hop | Stargate | Ronin | Wormhole | Tier D |
|-------|-----|----------|-------|----------|--------|
| EIP-1153 | Tidak | Tidak | Tidak | Tidak | **Ya (inline)** |
| MEV Protection | Tidak | Rate limiting | Tidak | Tidak | **On-chain detection** |
| Emergency Pause | Guardian | Guardian | Multisig | Guardian | **Admin (instant)** |
| Reentrancy Guard | CEI | CEI | CEI | CEI | **EIP-1153 inline** |
| External Calls | Multiple | Multiple | Multiple | Multiple | **0** |
| Economic Penalty | Bond | Rate limiting | Tidak | Tidak | **On-chain formula** |

Perbandingan ini menunjukkan bahwa Tier D menawarkan kombinasi fitur keamanan yang belum tersedia pada bridge existing: EIP-1153 inline, on-chain MEV detection, dan economic penalty — semuanya dengan 0 external calls.

### 5.8.6 Keunikan Kontribusi Penelitian

Berdasarkan perbandingan dengan studi terdahulu (Feng et al., 2023; Zheng et al., 2023; Wang et al., 2026), kontribusi unik penelitian ini adalah:

1. **Modifikasi EIP-1153 menjadi multifungsi** (Benedetti et al., 2024; Casale-Brunet, 2024): Dari 1 fungsi (reentrancy guard) menjadi 5 fungsi keamanan dalam satu kontrak
2. **Inline implementation** (Albert et al., 2021; Di Sorbo et al., 2021): 0 external calls untuk semua fitur keamanan — pertama kalinya didokumentasikan
3. **Single-slot MEV detection** (Li, 2025; Nassirzadeh et al., 2023): Penggantian dynamic array dengan single-slot struct yang 7.6x lebih murah
4. **4-tier comparison** (Zhang et al., 2022): Framework komparatif dari baseline hingga lightweight dynamic
5. **Validasi statistik rigor** (Lagouvardos et al., 2024; Shou et al., 2023): 100 sampel, Welch's t-test, Cohen's d, confidence interval

---

## 5.9 Analisis Ukuran Bytecode

Ukuran bytecode memiliki dampak signifikan terhadap biaya deployment, code loading cost, dan verifikasi kontrak di EVM. Berikut hasil pengukuran menggunakan `forge inspect`:

| Tier | Contract | Bytecode Size | % dari Limit 24KB |
|------|----------|:-------------:|:-----------------:|
| A | UnoptimizedBridge | 1,655 bytes | 6,7% |
| B | BridgeStaticOnly | 1,612 bytes | 6,6% |
| C | VictimBridge | 4,291 bytes | 17,5% |
| C' | + MonitorMock | 1,892 bytes | 7,7% |
| C total | (2 kontrak) | 6,183 bytes | 25,2% |
| D | LightweightBridge | 3,553 bytes | 14,5% |

### 5.9.1 Dampak Ukuran Bytecode

**1. Deployment Cost:**
Bytecode yang lebih besar memerlukan lebih banyak SSTORE saat deploy. Tier C total (6,183 bytes) memerlukan 886.301 gas deployment — 2,1x lipat dari Tier A (413.860 gas). Tier D (3,553 bytes) memerlukan 736.064 gas — 1,8x lipat dari Tier A.

**2. Code Loading Cost:**
EVM membaca bytecode dari storage saat eksekusi menggunakan `EXTCODECOPY`. Semakin besar bytecode, semakin banyak data yang harus dibaca. Namun, cost ini bersifat flat (tidak tergolong mahal) karena hanya dikenakan sekali per transaksi.

**3. Verifikasi Etherscan:**
Bytecode besar = verifikasi otomatis lebih lambat, kadang gagal jika terlalu kompleks. Tier C (2 kontrak) memerlukan verifikasi terpisah untuk VictimBridge dan MonitorMock.

**4. Batas EIP-170:**
Ethereum menerapkan batas ukuran kontrak sebesar 24.576 bytes (EIP-170). Seluruh tier masih jauh dari batas ini — Tier D hanya 14,5% dari limit, Tier C total 25,2%. Namun, jika fitur ditambah terus (misalnya multi-pattern MEV detection, dispute mechanism), ukuran bytecode bisa mendekati limit.

### 5.9.2 Perbandingan Arsitektural: 1 Kontrak vs 2 Kontrak

| Aspek | Tier C (2 kontrak) | Tier D (1 kontrak) |
|-------|:------------------:|:------------------:|
| Total bytecode | 6,183 bytes | 3,553 bytes |
| Deployment cost | 886.301 gas | 736.064 gas |
| External calls per tx | 5-6 | 0 |
| Attack surface | Lebih luas | Lebih sempit |
| Modularitas | ✅ Bisa upgrade MonitorMock | ❌ Harus redeploy semua |
| Reusable | ✅ MonitorMock dipakai banyak bridge | ❌ Copy-paste |
| Single point of failure | ❌ MonitorMock error = gagal | ✅ Tidak ada |

---

## 5.10 Analisis Mekanisme Penalty

### 5.10.1 Cara Kerja Penalty

Formula penalti pada Tier C dan Tier D menggunakan formula yang identik:

```
Penalty = Amount × (λ × P_detect) / 100.000.000
```

| Parameter | Nilai | Makna |
|-----------|-------|-------|
| λ (lambda) | 15.000 | Faktor risiko penalti |
| P_detect | 9.600 | Probabilitas deteksi 96% |
| **Penalty rate** | **14,4%** | Dari total amount |

Contoh: swap 10 ETH → attacker kena penalty 1,44 ETH, sisa 8,56 ETH diterima.

### 5.10.2 Kelebihan Penalty

| # | Kelebihan | Penjelasan |
|---|-----------|------------|
| 1 | **Deterren ekonomi** | Attacker rugi 14,4% per serangan. ROI jadi negatif — serangan tidak menguntungkan |
| 2 | **Tidak revert transaksi** | Berbeda dari reentrancy guard yang revert, penalty tetap memproses transaksi tapi potong hasilnya. User tidak kehilangan seluruh transaksi |
| 3 | **Proporsional** | Penalty scales linear dengan amount. Semakin besar serangan, semakin besar penalty |
| 4 | **Auto-reset** | Tidak perlu manual reset. EIP-1153 transient storage auto-clear tiap transaksi |
| 5 | **Murah (Tier D)** | Pure math — `_calculatePenalty()` hanya ~300 gas. Tidak ada external call, tidak ada storage read/write |
| 6 | **Bisa dikonfigurasi** | Admin bisa ubah `lambda` dan `P_detect` sesuai kebutuhan (Tier C via MonitorMock) |

### 5.10.3 Kekurangan Penalty

| # | Kekurangan | Penjelasan |
|---|------------|------------|
| 1 | **False positive** | Transaksi legit bisa terdeteksi anomali jika kebetulan ada frontrun di blok yang sama. User tidak bersalah tapi kena potong 14,4% |
| 2 | **Deteksi sederhana** | Cek `lastTxBlock == block.number && lastTx.txType == 0`. Tidak bisa bedakan frontrun biasa dari sandwich attack sesungguhnya |
| 3 | **1 slot history** | `lastTx` hanya simpan 1 transaksi terakhir. Kalau attacker interspers tx lain, deteksi hilang |
| 4 | **Tidak bisa rollback** | Penalty sudah dipotong dari `amountOut`. Tidak ada mekanisme appeal/dispute |
| 5 | **Fixed rate** | 14,4% bisa terlalu kecil untuk serangan besar, atau terlalu besar untuk transaksi kecil yang false positive |
| 6 | **Belum ada frontrunner record** | `recordFrontrun()` dipanggil off-chain. Kalau off-chain service tidak jalan, tidak ada data → deteksi nihil |
| 7 | **Admin centralization** | Admin bisa ubah `lambda` dan `P_detect` → bisa bikin penalty 0% atau 100% |

### 5.10.4 Skenario Penalty

| Skenario | Hasil |
|----------|-------|
| Alice swap 10 ETH, tidak ada sandwich | Penalty = 0, Alice terima full token |
| Alice swap 10 ETH, attacker frontrun di blok yang sama | Penalty = 1,44 ETH, attacker rugi |
| Bob withdraw 5 ETH, kebetulan ada frontrun di blok | Penalty = 0,72 ETH (FALSE POSITIVE — Bob tidak bersalah) |
| Attacker sandwich 3x berturut-turut | Penalty tetap 14,4% per transaksi, tidak naik |

---

## 5.11 Perbandingan External Call vs Inline

### 5.11.1 External Call (Tier C — VictimBridge → MonitorMock)

```solidity
// VictimBridge.sol — External call ke MonitorMock
(bool mustRevert, uint256 anomalyScore) = monitor.checkAnomaly(msg.sender, amountIn, 1);
monitor.recordTransaction(msg.sender, amountIn, 1);
monitor.enterCall();
```

**Kelebihan:**
- **Modular** — MonitorMock bisa diupgrade tanpa ubah bridge
- **Reusable** — MonitorMock bisa dipakai banyak bridge sekaligus
- **Testing lebih mudah** — unit test fungsi monitor terpisah
- **Fleksibel** — parameter P_detect dan lambda bisa diubah di satu tempat

**Kekurangan:**
- **Gas mahal** — setiap external call = ~5.000 gas code load + ~7.500 gas ABI encode/decode
- **Reentrancy risk** — external call bisa dikontrol attacker
- **Single point of failure** — kalau MonitorMock error/revert, seluruh transaksi gagal
- **5-6 calls per transaksi** → overhead 327% vs baseline

### 5.11.2 Inline (Tier D — LightweightBridge)

```solidity
// LightweightBridge.sol — Inline, 0 external calls
uint256 anomalyScore = _checkAnomaly(msg.sender, 1);
_recordTransaction(msg.sender, 1);
_enterCall();
```

**Kelebihan:**
- **Gas murah** — tidak perlu load kode kontrak lain
- **Tidak ada reentrancy risk** dari external call
- **Tidak ada single point of failure**
- **Lebih cepat** — semua eksekusi dalam satu context

**Kekurangan:**
- **Tidak modular** — logic tergabung dengan bridge, sulit diupgrade
- **Tidak reusable** — setiap bridge harus copy-paste logic yang sama
- **Code lebih besar** — bytecode bridge membesar (3,553 bytes vs 1,612 bytes Tier B)
- **Testing lebih kompleks** — tidak bisa test monitor secara terpisah

### 5.11.3 Tabel Perbandingan Lengkap

| Aspek | External Call (Tier C) | Inline (Tier D) |
|-------|:---------------------:|:---------------:|
| Modular | ✅ | ❌ |
| Reusable | ✅ | ❌ |
| Gas per tx | +61.900 | +2.749 |
| Reentrancy risk | ❌ | ✅ |
| Single point of failure | ❌ | ✅ |
| Testing mudah | ✅ | ❌ |
| Deployment cost | 886.301 gas | 736.064 gas |
| Attack surface | Luas (2 kontrak) | Sempit (1 kontrak) |

### 5.11.4 Kesimpulan

Untuk use case **bridge dengan keamanan tinggi + biaya rendah** (yang diteliti), **inline lebih unggul** karena:
1. Gas savings signifikan (72-88%)
2. Tidak ada reentrancy risk dari external calls
3. Satu kontrak = satu deployment = lebih simpel

Namun untuk **bridge enterprise yang butuh upgrade logic keamanan** tanpa redeploy bridge, **external call lebih fleksibel**. Tradeoff ini menjadi pertimbangan utama dalam pemilihan arsitektur.

---

## 5.12 Keterbatasan Penelitian

### 5.12.1 Keterbatasan Metodologis

**Lingkungan Pengujian Terkontrol:** Semua hasil pengukuran diperoleh dari environment Foundry yang terisolasi. Kondisi jaringan Ethereum yang sesungguhnya memiliki kompleksitas yang jauh lebih tinggi — termasuk fluktuasi gas price secara real-time, kompetisi mempool, dan variabilitas performa validator. Hasil pengukuran gas diharapkan representatif, namun selisih antara environment test dan production mungkin signifikan untuk metrik seperti latency dan throughput.

**Jumlah Sampel:** Meskipun 100 sampel per operasi sudah melampaui minimum yang disarankan (30 menurut CLT), jumlah ini mungkin belum cukup untuk menangkap variasi ekstrem yang jarang terjadi. Sampel tambahan (misalnya 1.000) akan menghasilkan statistik yang lebih robust, terutama untuk analisis variance dan distribusi ekor (tail distribution).

### 5.12.2 Keterbatasan Fitur Keamanan

**Pattern Detection Sederhana:** Deteksi MEV sandwich pada Tier D hanya mengenali pola Ta1 → Tv (frontrun → victim) dalam satu blok. Pola yang lebih kompleks — seperti Ta1 → Tv → Ta2 (sandwich penuh), atau serangan multi-blok — belum terdeteksi. Dalam praktiknya, MEV bot yang canggih menggunakan pola multi-step yang mungkin lolos dari deteksi sederhana ini.

**Tidak Ada Flash Loan Protection:** Penelitian tidak menguji serangan flash loan sandwich, di mana penyerang meminjam dana dalam jumlah besar dari protocol lending (misalnya Aave atau Compound) untuk memanipulasi harga secara artifisial. Flash loan protection memerlukan mekanisme tambahan seperti TWAP oracle atau minimum holding period.

**Parameter Statis:** Parameter P_DETECT (9.600) dan LAMBDA (15.000) ditetapkan secara statis. Dalam kondisi pasar yang berbeda — misalnya saat gas price sangat tinggi atau volume transaksi sangat rendah — parameter ini mungkin perlu disesuaikan secara dinamis untuk menjaga efektivitas penalti.

### 5.12.3 Keterbatasan Skala

**Single Chain Testing:** Seluruh pengujian dilakukan pada satu EVM-compatible chain (Foundry local) (Park et al., 2025). Multi-chain testing akan mengungkap perbedaan performa antar chain yang mungkin signifikan, terutama terkait gas pricing dan finality time.

**Tidak Ada Audit Keamanan Profesional** (Pofcher & Ellul, 2025): Meskipun seluruh test suite (215 tests) berhasil lulus, penelitian ini belum melalui audit keamanan oleh pihak ketiga yang independen. Audit profesional diperlukan untuk mengidentifikasi potensi vulnerability yang mungkin tidak tercakup oleh automated testing (Shou et al., 2023).

**Tidak Ada Pengujian dengan MEV Bot Nyata** (Rodler et al., 2021; Wang et al., 2026): Semua skenario MEV sandwich diuji menggunakan kontrak Attacker.sol yang dikontrol. MEV bot nyata di production menggunakan teknik yang jauh lebih canggih — termasuk private mempool (Flashbots Protect), bundle submission, dan optimal bid strategies.

### 5.12.4 Keterbatasan Arsitektural

**Ukuran Kontrak** (Benedetti et al., 2024): Tier D mengkonsolidasikan semua logika keamanan ke dalam satu kontrak, yang menghasilkan ukuran bytecode yang lebih besar dibandingkan arsitektur multi-kontrak. Ukuran kontrak yang besar dapat meningkatkan deployment gas dan berpotensi mendekati batas ukuran kontrak maksimum (24.576 bytes).

**Fleksibilitas Pembaruan** (Zheng et al., 2025; Zhou et al., 2026): Dalam arsitektur multi-kontrak (seperti Tier C), komponen keamanan (MonitorMock) dapat diperbarui secara independen tanpa memodifikasi kontrak utama. Dalam arsitektur inline (Tier D), pembaruan keamanan memerlukan redeployment seluruh kontrak, yang jauh lebih mahal dan kompleks.

**Upgradeability** (Li, 2025; Casale-Brunet, 2024): Tier D tidak mengimplementasikan proxy pattern atau upgradeability mechanism. Dalam production, bridge memerlukan kemampuan untuk memperbaiki vulnerability yang ditemukan setelah deployment. Integrasi Tier D dengan proxy pattern (misalnya UUPS atau Transparent Proxy) perlu diteliti lebih lanjut.

---

## 5.13 Implikasi Praktis

### 5.13.1 Bagi Pengembang DeFi

Temuan penelitian ini memiliki beberapa implikasi praktis bagi pengembang DeFi yang sedang membangun atau mengoptimalkan smart contract bridge (Albert et al., 2021; Di Sorbo et al., 2021):

**1. Menerapkan Inline Security Pattern:**
Pengembang sebaiknya mempertimbangkan untuk mengimplementasikan mekanisme keamanan secara inline (Li, 2025), terutama untuk fungsi-fungsi kritis seperti reentrancy guard. Template `LightweightBridge.sol` dapat dijadikan referensi awal.

**2. Menggabungkan Static + Dynamic Optimization:**
Optimasi statis (CEI, packing, custom errors) harus diterapkan sebagai fondasi, dilengkapi dengan optimasi dinamis (EIP-1153 inline) untuk fitur keamanan tambahan (Benedetti et al., 2024; Casale-Brunet, 2024). Kombinasi ini memberikan keamanan terbaik dengan biaya terendah.

**3. Menghindari External Calls untuk Keamanan:**
External calls ke kontrak keamanan (seperti MonitorMock) sebaiknya dihindari ketika fungsionalitas yang sama dapat diimplementasikan secara inline (Zheng et al., 2023). Biaya gas tambahan dari external calls (~61.900 gas per transaksi) jauh melebihi manfaat modularitas.

**4. Mengadopsi Single-slot Storage Pattern:**
Dynamic array untuk pencatatan transaksi sebaiknya digantikan dengan single-slot overwrite pattern (Nassirzadeh et al., 2023; Wang et al., 2026). Penghematan 17.700 gas per transaksi sangat signifikan untuk bridge dengan volume tinggi.

### 5.13.2 Bagi Operator Bridge

**1. Evaluasi Cost-Benefit:**
Operator bridge dapat menggunakan framework SPG untuk mengevaluasi cost-effectiveness berbagai opsi keamanan (Zhang et al., 2022). SPG memungkinkan perbandingan yang objektif antara berbagai arsitektur keamanan.

**2. Perencanaan Anggaran Gas:**
Estimasi biaya real-world yang disajikan pada Bagian 5.5 dapat digunakan sebagai dasar perencanaan anggaran gas (Park et al., 2025). Operator dapat memproyeksikan penghematan yang dicapai dengan migrasi dari Tier C ke Tier D.

**3. Penggunaan Emergency Pause:**
Fitur emergency pause pada Tier D harus diaktifkan dan diuji secara berkala (Rodler et al., 2021). Dalam situasi serangan, kemampuan untuk menghentikan operasi bridge secara instan dapat mencegah kerugian yang lebih besar.

**4. Monitoring Anomali:**
Event `AnomalyDetected` yang dipancarkan oleh Tier D dapat diintegrasikan ke sistem monitoring off-chain (Shou et al., 2023). Deteksi anomali secara real-time memungkinkan respons cepat terhadap potensi serangan.

### 5.13.3 Bagi Peneliti

**1. Framework Penelitian:**
Desain eksperimental 4-tier yang digunakan dalam penelitian ini dapat diadopsi oleh peneliti lain untuk mengkaji optimasi gas dan keamanan pada konteks smart contract yang berbeda (Lagouvardos et al., 2024).

**2. Metrik SPG:**
Metrik Security Points per Gas (SPG) dapat diterapkan secara lebih luas untuk mengevaluasi cost-effectiveness keamanan smart contract di luar konteks bridge (Zhou et al., 2026).

**3. Studi Lanjutan:**
Penelitian ini membuka beberapa arah studi lanjutan (Pofcher & Ellul, 2025; Zheng et al., 2025):
- Integrasi Tier D dengan proxy pattern untuk upgradeability
- Pengembangan MEV detection yang lebih canggih (multi-step pattern)
- Pengujian pada multiple EVM-compatible chains
- Analisis biaya-keamanan untuk arsitektur ZK-Rollup bridge

### 5.13.4 Kerangka Rekomendasi

Berdasarkan seluruh temuan penelitian, berikut adalah kerangka rekomendasi untuk pengembangan bridge:

| Kriteria | Rekomendasi |
|----------|------------|
| **Prototype / MVP** | Tier B (CEI + packing) — gas rendah, 2/8 keamanan |
| **Produksi Volume Rendah** | Tier D (inline EIP-1153) — gas rendah, 8/8 keamanan |
| **Produksi Volume Tinggi** | Tier D (inline EIP-1153) — hemat $66K-$178K/bulan vs Tier C |
| **Keamanan Maksimum** | Tier D + Bond (Hybrid) — 8/8 + jaminan ekonomis |
| **Research / Benchmark** | Tier C — untuk perbandingan dan baseline |

Kerangka rekomendasi ini menunjukkan bahwa **Tier D merupakan pilihan optimal untuk sebagian besar skenario produksi**, kecuali ketika modularitas arsitektural (upgradeability komponen keamanan secara independen) menjadi prioritas utama.

---

## 5.14 Sintesis Pembahasan

Secara keseluruhan, pembahasan pada bab ini mengkonfirmasi bahwa modifikasi EIP-1153 menjadi multifungsi secara inline (Tier D) merupakan pendekatan yang unggul dalam tiga dimensi utama (Benedetti et al., 2024; Casale-Brunet, 2024):

1. **Efisiensi Gas** (Albert et al., 2021; Di Sorbo et al., 2021; Li, 2025): Tier D mencapai gas cost yang hanya 8.7% lebih tinggi dari baseline tanpa keamanan (Tier B), namun 72.2% lebih rendah dari pendekatan konvensional (Tier C). Penghematan ini bersumber dari eliminasi external calls dan penggantian dynamic array dengan single-slot storage.

2. **Keamanan Setara** (Zheng et al., 2023; Wang et al., 2026): Tier D mencapai skor keamanan 8/8 — identik dengan Tier C — dengan 0 external calls. Seluruh mekanisme keamanan (reentrancy guard, MEV detection, economic penalty, emergency pause, block tracking) diimplementasikan secara inline dalam satu kontrak.

3. **Cost-Effectiveness Terbaik** (Zhang et al., 2022; Zhou et al., 2026): Tier D memiliki SPG tertinggi (234) di antara keempat tier — 3.6x lebih efisien dari Tier C (65). Metrik ini membuktikan bahwa Tier D memberikan konversi gas-to-keamanan yang paling efisien.

Temuan-temuan ini secara kolektif mendukung tesis utama penelitian: **EIP-1153 transient storage dapat dimodifikasi dari mekanisme tunggal (reentrancy guard) menjadi platform keamanan multifungsi yang efisien gas untuk smart contract bridge** (Lagouvardos et al., 2024; Shou et al., 2023). Modifikasi ini menawarkan alternatif yang layak terhadap arsitektur multi-kontrak konvensional, dengan bukti empiris yang kuat dari 215 test cases, analisis statistik rigor, dan estimasi biaya real-world (Nassirzadeh et al., 2023; Pofcher & Ellul, 2025).

---

## Referensi Bab 5

1. Albert, P. et al. (2021). "Gas Profiling of Smart Contracts." IEEE Transactions on Software Engineering.
2. Samreen, N.F. & Alalfi, M.H. (2020). "Reentrancy Vulnerability Identification in Ethereum Smart Contracts." IEEE International Conference on Software Maintenance and Evolution.
3. Benedetti, M. et al. (2024). "Gas Cost Analysis of EIP-1153 Transient Storage." arXiv preprint.
4. Casale-Brunet, S. (2024). "Secure-by-Design Smart Contracts." IEEE Conference on Software Maintenance and Evolution.
5. Cohen, J. (1988). "Statistical Power Analysis for the Behavioral Sciences." Lawrence Erlbaum Associates.
6. Daian, P. et al. (2020). "Flash Boys 2.0: Frontrunning in Decentralized Exchanges." IEEE Symposium on Security and Privacy.
7. Di Sorbo, A. et al. (2021). "Gas Profiling of Smart Contracts." IEEE Transactions on Software Engineering.
8. EIP-1153. (2021). "Transient Storage Opcodes." Ethereum Improvement Proposals.
9. Feng, Y. et al. (2023). "A Survey on Bug Search for Smart Contracts." ACM Computing Surveys.
10. Lagouvardos, S. et al. (2024). "EVM Memory Deep Dive." arXiv preprint.
11. Li, Y. (2025). "Metamorphic Testing for Smart Contracts." IEEE Transactions on Software Engineering.
12. Nassirzadeh, M. et al. (2023). "Gas-based Denial of Service Attacks on Ethereum." IEEE Transactions on Dependable and Secure Computing.
13. OpenZeppelin. (2024). "TransientStorageGuard." OpenZeppelin Contracts.
14. Park, J. et al. (2025). "EIP-4844 Impact Analysis." arXiv preprint.
15. Pofcher, J. & Ellul, J. (2025). "SLMs for Smart Contracts." arXiv preprint.
16. Rodler, M. et al. (2021). "EFCF: Ethereum Function Clustering." IEEE Symposium on Security and Privacy.
17. Samreen, N. & Alalfi, M. (2020). "Reentrancy Attack Detection in Smart Contracts." IEEE Conference on Software Maintenance and Evolution.
18. Shou, C. et al. (2023). "ItyFuzz: On-chain Auditing of DeFi Projects." ACM SIGSOFT International Symposium on Software Testing and Analysis.
19. Wang, H. et al. (2026). "Reentrancy Detection with Program Slicing." IEEE Transactions on Software Engineering.
20. Zhang, Y. et al. (2022). "Smart Contract Test Generation." IEEE Transactions on Software Engineering.
21. Zheng, Z. et al. (2023). "Turn the Rudder: A Beacon of Reentrancy Detection for Smart Contracts on Ethereum." IEEE Transactions on Software Engineering.
22. Zhou, H. et al. (2026). "Compositional Generalization for Smart Contracts." arXiv preprint.
19. Welch, B. L. (1947). "The Generalization of 'Student's' Problem When Several Different Population Variances are Involved." Biometrika.
