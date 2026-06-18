# BAB 1: PENDAHULUAN

## 1.1 Latar Belakang

Pertumbuhan Decentralized Finance (DeFi) pada jaringan Ethereum telah menciptakan kebutuhan mendesak akan mekanisme penghubung aset antar blockchain yang aman dan efisien. Bridge blockchain berfungsi sebagai infrastruktur kritis yang memungkinkan transfer aset dan data antar jaringan, mendukung ekosistem multi-chain yang semakin kompleks (Salzano et al., 2026). Namun, pertumbuhan ini diikuti oleh peningkatan signifikan dalam jumlah serangan yang menargetkan celah keamanan bridge.

Data dari Zheng et al. (2023) menunjukkan bahwa serangan reentrancy telah menyebabkan kerugian jutaan dolar dalam ekosistem DeFi, termasuk serangan DAO senilai $150 juta dan berbagai serangan lainnya yang tercatat hingga tahun 2022. Eksploitasi bridge juga mengalami peningkatan signifikan, termasuk serangan terhadap Ronin Bridge ($620 juta), Wormhole Bridge ($320 juta), dan Nomad Bridge ($190 juta) (Shou et al., 2023). Pola serangan yang paling dominan adalah reentrancy attack, di mana penyerang melakukan panggilan rekursif ke fungsi withdraw sebelum state balance diperbarui (Atzei et al., 2017). Feng et al. dalam tinjauannya mengenai pencarian bug pada smart contract mengidentifikasi reentrancy sebagai salah satu kerentanan paling kritis yang paling sering ditemukan dalam kontrak Solidity. Selain itu, Maximal Extractable Value (MEV) sandwich attack menjadi ancaman serius bagi pengguna bridge, di mana bot MEV memanfaatkan urutan transaksi dalam mempool untuk mendapatkan keuntungan dari selisih harga (Daian et al., 2020; Barbereau et al., 2023).

Permasalahan mendasar dalam desain bridge adalah tradeoff antara biaya gas dan tingkat keamanan (Li, 2025; Nassirzadeh et al., 2023). Bridge yang menggunakan mekanisme pertahanan lengkap seperti reentrancy guard konvensional (OpenZeppelin ReentrancyGuard) membutuhkan biaya gas yang signifikan, yaitu sekitar 22.900 gas per transaksi untuk operasi SSTORE cold + warm (OpenZeppelin, 2023). Biaya ini menjadi beban berat bagi bridge dengan volume transaksi tinggi, mengurangi profitabilitas dan skalabilitas operasional (Albert et al., 2021; Di Sorbo et al., 2021).

Pada bulan April 2024, Ethereum mengalami fork Cancun yang mengaktifkan EIP-1153: Transient Storage Opcodes (EIP-1153, 2021). Fitur ini memperkenalkan opcodes TSTORE dan TLOAD yang memungkinkan penyimpanan sementara dengan biaya hanya 100 gas per operasi, jauh lebih rendah dibandingkan SSTORE cold (20.000 gas) atau SSTORE warm (2.900 gas). Keunggulan kritis EIP-1153 adalah mekanisme auto-reset yang mengembalikan transient storage ke nol secara otomatis di setiap akhir transaksi, sehingga tidak memerlukan biaya reset manual (Benedetti et al., 2024). Fitur ini sangat cocok untuk implementasi reentrancy guard yang efisien gas (Casale-Brunet, 2024).

Secara bersamaan, EIP-4844: Proto-Danksharding memperkenalkan Blob transactions sebagai mekanisme baru pengiriman data rollup ke Ethereum L1 (Park et al., 2025). Blob menawarkan biaya yang jauh lebih rendah dibandingkan calldata konvensional, membuka peluang optimasi biaya pengiriman data bagi rollup dan bridge yang mengirimkan batch transaksi secara berkala (Wang et al., 2026).

Namun, tinjauan pustaka mengungkapkan bahwa belum ada penelitian yang secara spesifik mengkombinasikan EIP-1153 transient storage untuk reentrancy guard pada smart contract bridge, Early Warning System (EWS) untuk deteksi MEV sandwich attack on-chain, dan Dynamic Rollup Submission Engine yang mengoptimalkan arbitrase harga Blob vs Calldata (Pofcher & Ellul, 2025; Wang et al., 2026; Zheng et al., 2025). Penelitian ini mengisi celah tersebut dengan mengajukan arsitektur 4-tier yang dibandingkan secara empiris: (A) baseline tanpa optimasi, (B) optimasi statis konvensional, (C) optimasi statis + dinamis menggunakan EIP-1153 dan EWS, dan (D) optimasi inline yang mengkonsolidasikan semua fitur keamanan ke dalam satu kontrak.

Kontribusi utama penelitian ini adalah: (1) hybrid defense model yang menggabungkan CEI statis dengan EIP-1153 dinamis untuk bridge (Samreen & Alalfi, 2020; Zheng et al., 2023), (2) on-chain economic penalty untuk mitigasi MEV sandwich attack (Rodler et al., 2021; Zhou et al., 2026), (3) dynamic rollup submission engine dengan arbitrase harga Blob (EIP-4844) vs Calldata, dan (4) benchmark empiris 4-tier dengan 215 test cases dan analisis statistik rigor (Shou et al., 2023; Lagouvardos et al., 2024).

## 1.2 Rumusan Masalah

Berdasarkan latar belakang yang telah diuraikan, penelitian ini merumuskan masalah sebagai berikut:

1. Bagaimana mengoptimalkan biaya gas smart contract bridge menggunakan EIP-1153 transient storage (TSTORE/TLOAD) sebagai reentrancy guard yang efisien dibandingkan mekanisme SSTORE konvensional (Benedetti et al., 2024; Casale-Brunet, 2024)?

2. Bagaimana mendesain Early Warning System (EWS) on-chain yang mampu mendeteksi pola serangan MEV sandwich attack dan menerapkan penalti ekonomi secara otomatis kepada penyerang (Rodler et al., 2021; Shou et al., 2023)?

3. Seberapa efektif Dynamic Rollup Submission Engine dalam mengurangi biaya pengiriman data rollup dibandingkan static engine melalui optimasi batching Blob (EIP-4844) vs Calldata berdasarkan fluktuasi harga gas real-time (Park et al., 2025; Wang et al., 2026)?

4. Bagaimana pengaruh implementasi optimasi statis (variable packing, CEI, unchecked arithmetic) dan dinamis (EIP-1153, EWS) terhadap tingkat keamanan smart contract bridge terhadap serangan reentrancy dan MEV sandwich (Zhang et al., 2022; Zheng et al., 2023)?

## 1.3 Tujuan Penelitian

Berdasarkan rumusan masalah di atas, tujuan penelitian ini adalah:

1. Mengimplementasikan optimasi gas statis (variable packing, CEI pattern, unchecked arithmetic, custom errors) dan dinamis (EIP-1153 TSTORE/TLOAD) pada smart contract bridge (Albert et al., 2021; Di Sorbo et al., 2021), serta mengukur penghematan gas yang dicapai dibandingkan baseline tanpa optimasi (Yu et al., 2022).

2. Mendesain dan mengimplementasikan Early Warning System (EWS) yang menggunakan transient storage untuk melacak call depth, mendeteksi pola MEV sandwich attack (Ta1 → Tv), dan menerapkan penalti ekonomi dinamis berdasarkan formula λ × P_detect × amount (Nassirzadeh et al., 2023; Li, 2025).

3. Mengembangkan Dynamic Rollup Submission Engine yang melakukan optimasi batching secara dinamis, memilih rute termurah antara Blob (EIP-4844) atau Calldata berdasarkan harga gas L1 fee vs Blob fee (Park et al., 2025; Zhou et al., 2026), serta mengukur penghematan biaya dibandingkan static engine.

4. Mengevaluasi efektivitas pendekatan yang diusulkan melalui 215 test cases yang mencakup fuzz testing, invariant testing, edge case analysis, dan benchmark gas (Shou et al., 2023), serta memvalidasi hasilnya menggunakan Welch's t-test, Confidence Interval 95%, dan Cohen's d effect size.

## 1.4 Manfaat Penelitian

### 1.4.1 Manfaat Teoritis

1. **Kontribusi ilmu pengetahuan** dalam bidang optimasi gas smart contract menggunakan EIP-1153 transient storage (Benedetti et al., 2024), khususnya untuk arsitektur bridge yang memerlukan tingkat keamanan tinggi (Casale-Brunet, 2024).

2. **Bukti empiris** tentang tradeoff antara biaya gas dan tingkat keamanan pada arsitektur bridge 4-tier (Albert et al., 2021; Di Sorbo et al., 2021), memberikan landasan empiris bagi pengambil keputusan dalam desain bridge.

3. **Framework analisis statistik** untuk perbandingan kinerja bridge yang dapat diadopsi oleh peneliti lain (Lagouvardos et al., 2024), termasuk metodologi pengukuran gas menggunakan 100 sampel per operasi dan analisis significance testing.

### 1.4.2 Manfaat Praktis

1. **Template arsitektur bridge** yang aman dan efisien gas bagi pengembang DeFi (Li, 2025), dengan referensi implementasi EIP-1153 reentrancy guard yang terbukti mengurangi biaya dari 22.900 gas menjadi 200 gas (penghematan 100x lipat).

2. **Implementasi referensi Early Warning System** untuk proteksi MEV sandwich attack on-chain (Rodler et al., 2021; Shou et al., 2023), yang dapat diintegrasikan ke bridge production sebagai lapisan keamanan tambahan.

3. **Dashboard interaktif** untuk monitoring bridge performance dan visualisasi hasil simulasi dynamic rollup engine (Wang et al., 2026; Zheng et al., 2025), yang dapat digunakan oleh operator bridge untuk pengambilan keputusan real-time.

4. **Studi kasus komprehensif** yang menggabungkan optimasi gas statis, pertahanan dinamis, dan optimasi rollup dalam satu framework terpadu (Zhou et al., 2026), menjadi referensi bagi penelitian serupa di masa depan.

## 1.5 Sistematika Penelitian

Penelitian ini disusun dalam enam bab dengan sistematika sebagai berikut:

**BAB I: Pendahuluan** berisi latar belakang masalah, rumusan masalah, tujuan penelitian, manfaat penelitian, dan sistematika penelitian.

**BAB II: Tinjauan Pustaka** memaparkan konsep-konsep dasar yang mendasari penelitian, meliputi: arsitektur Ethereum dan EVM, smart contract security (reentrancy, CEI pattern), EIP-1153 transient storage, MEV dan sandwich attack, EIP-4844 Proto-Danksharding, serta studi komparatif dengan bridge existing (Hop, Connext, Stargate).

**BAB III: Metodologi Penelitian** menjelaskan desain penelitian, model matematika (gas cost formula, MEV profit model, dynamic rollup cost model, economic penalty), model ancaman formal, desain eksperimental (variabel, kontrol, replikasi), dan kerangka analisis statistik.

**BAB IV: Hasil Penelitian** menyajikan hasil pengukuran gas 4-tier, benchmark gas, analisis keamanan (reentrancy, MEV), hasil simulasi Monte Carlo (100 runs), dan validasi statistik (Welch's t-test, Cohen's d).

**BAB V: Pembahasan** mendiskusikan hasil-hasil penelitian dalam konteks teori, literatur terdahulu, dan implikasi praktis, meliputi analisis gas cost, evaluasi keamanan, cost-effectiveness, modifikasi EIP-1153, estimasi biaya real-world, perbandingan static vs dynamic, serta keterbatasan dan implikasi praktis.

**BAB VI: Penutup** memuat kesimpulan penelitian, keterbatasan, dan saran untuk penelitian selanjutnya.
