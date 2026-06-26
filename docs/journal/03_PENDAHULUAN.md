I. PENDAHULUAN

Ekosistem Decentralized Finance (DeFi) di jaringan Ethereum tumbuh dengan kecepatan yang sulit dibayangkan beberapa tahun lalu. Transaksi lintas rantai—yang dulu dianggap sebagai fitur khusus—kini menjadi kebutuhan pokok bagi pengguna yang ingin memindahkan aset dari satu jaringan ke jaringan lain. Di sinilah bridge blockchain memainkan peran sentral: ia menjadi jembatan penghubung yang memungkinkan transfer aset dan data antar jaringan berjalan lancar [1].

Namun pertumbuhan pesat ini membawa masalah baru yang tidak kalah serius. Jumlah serangan terhadap bridge meningkat tajam, dan nilainya tidak main-main. Reentrancy attack—di mana penyerang melakukan panggilan rekursif ke fungsi withdraw sebelum saldo benar-benar diperbarui—telah menggerogoti ekosistem DeFi senilai jutaan dolar [2]. Zheng et al. [3] mencatat bahwa kerugian akibat serangan ini terus membelah dari tahun ke tahun. Di sisi lain, MEV sandwich attack—di mana bot memanfaatkan urutan transaksi dalam mempool untuk meraup keuntungan dari selisih harga—menjadi ancaman yang makin merajalela [4], [5].

Yang lebih mengkhawatirkan, beberapa insiden bridge berakhir dengan kerugian dalam skala masif: Ronin Bridge kehilangan $620 juta, Wormhole Bridge $320 juta, dan Nomad Bridge $190 juta [6]. Angka-angka ini bukan sekadar statistik—mereka mencerminkan kelemahan fundamental dalam desain bridge yang selama ini diandalkan.

Di sini letak dilema utamanya: bagaimana menciptakan bridge yang sekaligus hemat gas dan tangguh secara keamanan? Mekanisme pertahanan konvensional seperti reentrancy guard dari OpenZeppelin memang efektif, tapi harganya mahal—setiap transaksi membutuhkan sekitar 22.900 gas hanya untuk operasi SSTORE cold dan warm [7]. Bagi bridge dengan volume transaksi tinggi, beban ini bisa membunuh profitabilitas [8], [9].

Beruntung, Ethereum punya jawaban. Fork Cancun pada April 2024 mengaktifkan EIP-1153: Transient Storage Opcodes, yang memperkenalkan TSTORE dan TLOAD—dua opcode baru yang menyimpan data sementara dengan biaya hanya 100 gas per operasi [10]. Bandingkan dengan SSTORE cold yang membutuhkan 20.000 gas atau SSTORE warm sebesar 2.900 gas. Selisihnya luar biasa. Yang membuat EIP-1153 makin menarik adalah mekanisme auto-reset: transient storage secara otomatis kembali ke nol di setiap akhir transaksi, sehingga tidak perlu ada biaya reset manual [8]. Fitur ini tampaknya memang dirancang khusus untuk reentrancy guard yang efisien gas [11].

Seiring waktu, EIP-4844: Proto-Danksharding juga membawa perubahan besar melalui Blob transactions—mekanisme baru pengiriman data rollup ke Ethereum L1 [12]. Blob menawarkan biaya yang jauh lebih rendah dibandingkan calldata konvensional, membuka peluang optimasi yang selama ini belum sepenuhnya dimanfaatkan [13].

Meskipun demikian, tinjauan pustaka mengungkapkan celah yang cukup mencolok: belum ada penelitian yang secara spesifik mengkombinasikan EIP-1153 transient storage untuk reentrancy guard pada smart contract bridge, Early Warning System (EWS) untuk deteksi MEV sandwich attack on-chain, dan Dynamic Rollup Submission Engine yang mengoptimalkan arbitrase harga Blob vs Calldata [14], [13], [15]. Penelitian ini hadir untuk mengisi kekosongan tersebut.

A. Rumusan Masalah

Permasalahan yang menjadi fokus penelitian ini dapat dirumuskan sebagai berikut:

1) Bagaimana mengoptimalkan biaya gas smart contract bridge menggunakan EIP-1153 transient storage (TSTORE/TLOAD) sebagai reentrancy guard yang efisien dibandingkan mekanisme SSTORE konvensional [8], [11]?

2) Bagaimana mendesain Early Warning System (EWS) on-chain yang mampu mendeteksi pola serangan MEV sandwich attack dan menerapkan penalti ekonomi secara otomatis kepada penyerang [16], [6]?

3) Seberapa efektif Dynamic Rollup Submission Engine dalam mengurangi biaya pengiriman data rollup dibandingkan static engine melalui optimasi batching Blob (EIP-4844) vs Calldata berdasarkan fluktuasi harga gas real-time [12], [13]?

4) Bagaimana pengaruh implementasi optimasi statis (variable packing, CEI, unchecked arithmetic) dan dinamis (EIP-1153, EWS) terhadap tingkat keamanan smart contract bridge terhadap serangan reentrancy dan MEV sandwich [17], [3]?

B. Tujuan Penelitian

Berdasarkan rumusan masalah di atas, penelitian ini memiliki empat tujuan utama:

1) Mengimplementasikan optimasi gas statis (variable packing, CEI pattern, unchecked arithmetic, custom errors) dan dinamis (EIP-1153 TSTORE/TLOAD) pada smart contract bridge [8], [9], lalu mengukur penghematan gas yang dicapai dibandingkan baseline tanpa optimasi [18].

2) Mendesain dan mengimplementasikan Early Warning System (EWS) yang memanfaatkan transient storage untuk melacak call depth, mendeteksi pola MEV sandwich attack (Ta1 → Tv), dan menerapkan penalti ekonomi dinamis berdasarkan formula λ × P_detect × amount [19], [20].

3) Mengembangkan Dynamic Rollup Submission Engine yang melakukan optimasi batching secara dinamis, memilih rute termurah antara Blob (EIP-4844) atau Calldata berdasarkan harga gas L1 fee vs Blob fee [12], [21], serta mengukur penghematan biaya dibandingkan static engine.

4) Mengevaluasi efektivitas pendekatan yang diusulkan melalui 215 test cases yang mencakup fuzz testing, invariant testing, edge case analysis, dan benchmark gas [6], serta memvalidasi hasilnya menggunakan Welch's t-test, Confidence Interval 95%, dan Cohen's d effect size [22].

C. Manfaat Penelitian

1) Manfaat Teoritis: Kontribusi ilmu pengetahuan dalam bidang optimasi gas smart contract menggunakan EIP-1153 transient storage [8], khususnya untuk arsitektur bridge yang memerlukan tingkat keamanan tinggi [11]. Bukti empiris tentang tradeoff antara biaya gas dan tingkat keamanan pada arsitektur bridge 4-tier [8], [9], memberikan landasan empiris bagi pengambil keputusan dalam desain bridge.

2) Manfaat Praktis: Template arsitektur bridge yang aman dan efisien gas bagi pengembang DeFi [20], dengan referensi implementasi EIP-1153 reentrancy guard yang terbukti mengurangi biaya dari 22.900 gas menjadi 200 gas (penghematan 100x lipat). Implementasi referensi Early Warning System untuk proteksi MEV sandwich attack on-chain [16], [6], yang dapat diintegrasikan ke bridge production sebagai lapisan keamanan tambahan.

D. Related Work

Bagian ini membahas landasan teoretis yang mendasari penelitian: optimasi gas, mekanisme keamanan smart contract, EIP-1153 Transient Storage, Maximal Extractable Value (MEV), serta EIP-4844 Proto-Danksharding.

1) Optimasi Gas pada Smart Contract

EVM menggunakan model storage berbasis slot 32-byte, di mana operasi SSTORE dan SLOAD merupakan operasi paling mahal [22]. Di Sorbo et al. [9] mengidentifikasi 19 jenis code smells pada Solidity yang berkontribusi terhadap pemborosan gas, termasuk penggunaan storage yang tidak efisien. Variable packing—teknik menggabungkan beberapa variabel ke dalam satu slot—terbukti menghasilkan penghematan signifikan tanpa mengubah logika bisnis [6]. Teknik lain meliputi unchecked arithmetic, custom errors, calldata parameter, dan immutable variables [33].

2) EIP-1153 Transient Storage

EIP-1153 memperkenalkan TSTORE dan TLOAD—dua opcode baru dengan biaya 100 gas per operasi, jauh lebih rendah dibandingkan SSTORE cold (20.000 gas) [16]. Data transient storage hanya berlaku selama satu transaksi dan direset otomatis (*auto-reset*), sehingga sangat cocok untuk reentrancy guard [17]. Zhang & Debono [19] menemukan bahwa lebih dari 60 kontrak telah di-deploy lintas chain menggunakan transient storage. Penghematan gas dari mekanisme ini mencapai 22.700 gas per transaksi (99.1%) dibandingkan mutex lock konvensional [29].

3) MEV dan Sandwich Attack

Maximal Extractable Value (MEV) merupakan keuntungan maksimum yang dapat diperoleh oleh validator atau bot melalui kemampuan menyusun transaksi dalam satu blok [12]. Sandwich attack merupakan bentuk MEV yang paling merusak: penyerang menjalankan frontrun sebelum transaksi korban, lalu backrun setelahnya, merealisasikan keuntungan dari selisih harga [5]. Qin et al. membuktikan bahwa sandwich attack merupakan ancaman struktural yang tidak dapat dihilangkan sepenuhnya melalui mekanisme konsensus, sehingga memerlukan solusi pada lapisan aplikasi.

4) Early Warning System On-Chain

Early Warning System (EWS) on-chain merupakan mekanisme deteksi anomali yang berjalan langsung dalam lingkungan EVM tanpa single point of failure [40]. Mekanisme ini mendeteksi pola sandwich attack melalui analisis transaksi berurutan dan menerapkan penalti ekonomi secara otomatis. Model penalti dibangun di atas prinsip incentive compatibility—membuat serangan menjadi tidak menguntungkan secara ekonomi [9].

5) Dynamic Rollup Submission Engine

EIP-4844: Proto-Danksharding memperkenalkan Blob transactions yang menawarkan biaya jauh lebih rendah dibandingkan calldata konvensional [21]. Park et al. [30] menganalisis dampak EIP-4844 terhadap dinamika transaksi rollup dan pasar biaya gas blob. Dynamic Rollup Submission Engine mengoptimalkan pengiriman batch dengan melakukan routing dynamic antara blob dan calldata berdasarkan harga gas real-time, memilih rute termurah pada setiap momen pengiriman.

6) Perbandingan dengan Bridge Existing

Tabel berikut merangkum perbandingan arsitektural antara penelitian ini dengan bridge existing:

| Aspek | Hop Protocol | Stargate | Penelitian Ini |
|-------|-------------|----------|----------------|
| Mekanisme | Liquidity pool + bonder | Unified Liquidity | Liquidity pool |
| Keamanan | Validator set + bond | DVN + oracle | EWS on-chain + EIP-1153 |
| MEV Protection | Off-chain | Rate limiting | On-chain detection + penalty |
| Biaya Gas | Tergantung chain | Flat fee | Tiered (A/B/C/D) |
| Rollup Integration | Multi-rollup | LayerZero | EIP-4844 dynamic |

Penelitian ini menawarkan pendekatan berbeda dalam integrasi EIP-1153 untuk keamanan dan dynamic routing untuk optimasi biaya rollup.

7) Kerangka Konseptual

Berdasarkan tinjauan pustaka, kerangka konseptual penelitian ini mengintegrasikan lima pilar: (1) optimasi gas statis—variable packing, CEI pattern, unchecked arithmetic, custom errors [9], [6]; (2) EIP-1153 transient storage untuk reentrancy guard yang efisien [16], [17]; (3) MEV protection on-chain melalui EWS [12], [5]; (4) dynamic rollup submission antara blob dan calldata [30], [21]; dan (5) arsitektur bridge 4-tier dari baseline hingga lightweight dynamic [33]. Integrasi kelima pilar ini menghasilkan arsitektur bridge yang aman terhadap serangan reentrancy dan MEV, sekaligus efisien gas melalui optimasi statis dan dinamis.
