# BAB 1: PENDAHULUAN

## 1.1 Latar Belakang

Ekosistem Decentralized Finance (DeFi) di jaringan Ethereum tumbuh dengan kecepatan yang sulit dibayangkan beberapa tahun lalu. Transaksi lintas rantai—yang dulu dianggap sebagai fitur khusus—kini menjadi kebutuhan pokok bagi pengguna yang ingin memindahkan aset dari satu jaringan ke jaringan lain. Di sinilah bridge blockchain memainkan peran sentral: ia menjadi jembatan penghubung yang memungkinkan transfer aset dan data antar jaringan berjalan lancar (Salzano et al., 2026).

Namun pertumbuhan pesat ini membawa masalah baru yang tidak kalah serius. Jumlah serangan terhadap bridge meningkat tajam, dan nilainya tidak main-main. Reentrancy attack—di mana penyerang melakukan panggilan rekursif ke fungsi withdraw sebelum saldo benar-benar diperbarui—telah menggerogoti ekosistem DeFi senilai jutaan dolar (Samreen & Alalfi, 2020). Zheng et al. (2023) mencatat bahwa kerugian akibat serangan ini terus membelah dari tahun ke tahun. Di sisi lain, MEV sandwich attack—di mana bot memanfaatkan urutan transaksi dalam mempool untuk meraup keuntungan dari selisih harga—menjadi ancaman yang makin merajalela (Daian et al., 2020; Qin et al., 2021).

Yang lebih mengkhawatirkan, beberapa insiden bridge berakhir dengan kerugian dalam skala masif: Ronin Bridge kehilangan $620 juta, Wormhole Bridge $320 juta, dan Nomad Bridge $190 juta (Shou et al., 2023). Angka-angka ini bukan sekadar statistik—mereka mencerminkan kelemahan fundamental dalam desain bridge yang selama ini diandalkan.

Di sini letak dilema utamanya: bagaimana menciptakan bridge yang sekaligus hemat gas dan tangguh secara keamanan? Mekanisme pertahanan konvensional seperti reentrancy guard dari OpenZeppelin memang efektif, tapi harganya mahal—setiap transaksi membutuhkan sekitar 22.900 gas hanya untuk operasi SSTORE cold dan warm (OpenZeppelin, 2023). Bagi bridge dengan volume transaksi tinggi, beban ini bisa membunuh profitabilitas (Benedetti et al., 2024; Di Sorbo et al., 2021).

Beruntung, Ethereum punya jawaban. Fork Cancun pada April 2024 mengaktifkan EIP-1153: Transient Storage Opcodes, yang memperkenalkan TSTORE dan TLOAD—dua opcode baru yang menyimpan data sementara dengan biaya hanya 100 gas per operasi (EIP-1153, 2021). Bandingkan dengan SSTORE cold yang membutuhkan 20.000 gas atau SSTORE warm sebesar 2.900 gas. Selisihnya luar biasa. Yang membuat EIP-1153 makin menarik adalah mekanisme auto-reset: transient storage secara otomatis kembali ke nol di setiap akhir transaksi, sehingga tidak perlu ada biaya reset manual (Benedetti et al., 2024). Fitur ini tampaknya memang dirancang khusus untuk reentrancy guard yang efisien gas (Casale-Brunet, 2024).

Seiring waktu, EIP-4844: Proto-Danksharding juga membawa perubahan besar melalui Blob transactions—mekanisme baru pengiriman data rollup ke Ethereum L1 (Park et al., 2025). Blob menawarkan biaya yang jauh lebih rendah dibandingkan calldata konvensional, membuka peluang optimasi yang selama ini belum sepenuhnya dimanfaatkan (Wang et al., 2026).

Meskipun demikian, tinjauan pustaka mengungkapkan celah yang cukup mencolok: belum ada penelitian yang secara spesifik mengkombinasikan EIP-1153 transient storage untuk reentrancy guard pada smart contract bridge, Early Warning System (EWS) untuk deteksi MEV sandwich attack on-chain, dan Dynamic Rollup Submission Engine yang mengoptimalkan arbitrase harga Blob vs Calldata (Pofcher & Ellul, 2025; Wang et al., 2026; Zheng et al., 2025). Penelitian ini hadir untuk mengisi kekosongan tersebut.

## 1.2 Rumusan Masalah

Permasalahan yang menjadi fokus penelitian ini dapat dirumuskan sebagai berikut:

1. Bagaimana mengoptimalkan biaya gas smart contract bridge menggunakan EIP-1153 transient storage (TSTORE/TLOAD) sebagai reentrancy guard yang efisien dibandingkan mekanisme SSTORE konvensional (Benedetti et al., 2024; Casale-Brunet, 2024)?

2. Bagaimana mendesain Early Warning System (EWS) on-chain yang mampu mendeteksi pola serangan MEV sandwich attack dan menerapkan penalti ekonomi secara otomatis kepada penyerang (Rodler et al., 2021; Shou et al., 2023)?

3. Seberapa efektif Dynamic Rollup Submission Engine dalam mengurangi biaya pengiriman data rollup dibandingkan static engine melalui optimasi batching Blob (EIP-4844) vs Calldata berdasarkan fluktuasi harga gas real-time (Park et al., 2025; Wang et al., 2026)?

4. Bagaimana pengaruh implementasi optimasi statis (variable packing, CEI, unchecked arithmetic) dan dinamis (EIP-1153, EWS) terhadap tingkat keamanan smart contract bridge terhadap serangan reentrancy dan MEV sandwich (Zhang et al., 2022; Zheng et al., 2023)?

## 1.3 Tujuan Penelitian

Berdasarkan rumusan masalah di atas, penelitian ini memiliki empat tujuan utama:

1. Mengimplementasikan optimasi gas statis (variable packing, CEI pattern, unchecked arithmetic, custom errors) dan dinamis (EIP-1153 TSTORE/TLOAD) pada smart contract bridge (Benedetti et al., 2024; Di Sorbo et al., 2021), lalu mengukur penghematan gas yang dicapai dibandingkan baseline tanpa optimasi (Wang et al., 2024).

2. Mendesain dan mengimplementasikan Early Warning System (EWS) yang memanfaatkan transient storage untuk melacak call depth, mendeteksi pola MEV sandwich attack (Ta1 → Tv), dan menerapkan penalti ekonomi dinamis berdasarkan formula λ �, P_detect �, amount (Nassirzadeh et al., 2023; Li, 2025).

3. Mengembangkan Dynamic Rollup Submission Engine yang melakukan optimasi batching secara dinamis, memilih rute termurah antara Blob (EIP-4844) atau Calldata berdasarkan harga gas L1 fee vs Blob fee (Park et al., 2025; Zhou et al., 2026), serta mengukur penghematan biaya dibandingkan static engine.

4. Mengevaluasi efektivitas pendekatan yang diusulkan melalui 215 test cases yang mencakup fuzz testing, invariant testing, edge case analysis, dan benchmark gas (Shou et al., 2023), serta memvalidasi hasilnya menggunakan Welch's t-test, Confidence Interval 95%, dan Cohen's d effect size.

## 1.4 Manfaat Penelitian

### 1.4.1 Manfaat Teoritis

1. **Kontribusi ilmu pengetahuan** dalam bidang optimasi gas smart contract menggunakan EIP-1153 transient storage (Benedetti et al., 2024), khususnya untuk arsitektur bridge yang memerlukan tingkat keamanan tinggi (Casale-Brunet, 2024).

2. **Bukti empiris** tentang tradeoff antara biaya gas dan tingkat keamanan pada arsitektur bridge 4-tier (Benedetti et al., 2024; Di Sorbo et al., 2021), memberikan landasan empiris bagi pengambil keputusan dalam desain bridge.

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
