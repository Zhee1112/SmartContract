# 1. Pendahuluan

## 1.1 Latar belakang

Decentralized Finance (DeFi) di jaringan Ethereum telah berkembang pesat dalam beberapa tahun terakhir. Transaksi lintas rantai yang dulunya dianggap sebagai fitur khusus, kini menjadi kebutuhan pokok bagi pengguna yang ingin memindahkan aset antar jaringan. Bridge blockchain memainkan peran sentral sebagai penghubung transfer aset dan data antar jaringan [1].

Pertumbuhan pesat ini membawa tantangan keamanan baru. Reentrancy attack—di mana penyerang melakukan panggilan rekursif ke fungsi withdraw sebelum saldo diperbarui—telah menggerogoti ekosistem DeFi senilai jutaan dolar [2]. Zheng et al. [3] mencatat bahwa kerugian akibat serangan ini terus meningkat dari tahun ke tahun. Selain itu, MEV sandwich attack—di mana bot memanfaatkan urutan transaksi dalam mempool untuk meraup keuntungan dari selisih harga—menjadi ancaman yang makin merajalela [4], [5].

Beberapa insiden bridge berakhir dengan kerugian skala masif: Ronin Bridge kehilangan $620 juta, Wormhole Bridge $320 juta, dan Nomad Bridge $190 juta [6]. Angka-angka ini mencerminkan kelemahan fundamental dalam desain bridge yang selama ini diandalkan.

Dilema utamanya adalah bagaimana menciptakan bridge yang sekaligus hemat gas dan tangguh secara keamanan. Mekanisme pertahanan konvensional seperti reentrancy guard dari OpenZeppelin memang efektif, namun memerlukan sekitar 22.900 gas hanya untuk operasi SSTORE cold dan warm [7]. Bagi bridge dengan volume transaksi tinggi, beban ini mengurangi profitabilitas secara signifikan [8], [9].

Ethereum menawarkan solusi melalui Fork Cancun pada April 2024 yang mengaktifkan EIP-1153: Transient Storage Opcodes. EIP-1153 memperkenalkan TSTORE dan TLOAD—dua opcode baru dengan biaya hanya 100 gas per operasi, jauh lebih rendah dibandingkan SSTORE cold (20.000 gas) atau SSTORE warm (2.900 gas) [10]. Mekanisme auto-resetnya memastikan data transient storage kembali ke nol di setiap akhir transaksi tanpa biaya reset manual [8].

Namun, tinjauan pustaka mengungkapkan celah yang cukup mencolok: belum ada penelitian yang secara spesifik mengkombinasikan EIP-1153 transient storage untuk reentrancy guard pada smart contract bridge, Early Warning System (EWS) untuk deteksi MEV sandwich attack on-chain, dan Dynamic Rollup Submission Engine yang mengoptimalkan arbitrase harga Blob vs Calldata [14], [13], [15]. Penelitian ini hadir untuk mengisi kekosongan tersebut.

## 1.2 Rumusan masalah

Permasalahan yang menjadi fokus penelitian ini dapat dirumuskan sebagai berikut:

1. Bagaimana mengoptimalkan biaya gas smart contract bridge menggunakan EIP-1153 transient storage (TSTORE/TLOAD) sebagai reentrancy guard yang efisien dibandingkan mekanisme SSTORE konvensional [8], [11]?

2. Bagaimana mendesain Early Warning System (EWS) on-chain yang mampu mendeteksi pola serangan MEV sandwich attack dan menerapkan penalti ekonomi secara otomatis kepada penyerang [16], [6]?

3. Seberapa efektif Dynamic Rollup Submission Engine dalam mengurangi biaya pengiriman data rollup dibandingkan static engine melalui optimasi batching Blob (EIP-4844) vs Calldata berdasarkan fluktuasi harga gas real-time [12], [13]?

4. Bagaimana pengaruh implementasi optimasi statis (variable packing, CEI, unchecked arithmetic) dan dinamis (EIP-1153, EWS) terhadap tingkat keamanan smart contract bridge terhadap serangan reentrancy dan MEV sandwich [17], [3]?

## 1.3 Tujuan penelitian

Berdasarkan rumusan masalah di atas, penelitian ini memiliki empat tujuan utama:

1. Mengimplementasikan optimasi gas statis (variable packing, CEI pattern, unchecked arithmetic, custom errors) dan dinamis (EIP-1153 TSTORE/TLOAD) pada smart contract bridge [8], [9], lalu mengukur penghematan gas yang dicapai dibandingkan baseline tanpa optimasi [18].

2. Mendesain dan mengimplementasikan Early Warning System (EWS) yang memanfaatkan transient storage untuk melacak call depth, mendeteksi pola MEV sandwich attack (Ta1 → Tv), dan menerapkan penalti ekonomi dinamis berdasarkan formula λ × P_detect × amount [19], [20].

3. Mengembangkan Dynamic Rollup Submission Engine yang melakukan optimasi batching secara dinamis, memilih rute termurah antara Blob (EIP-4844) atau Calldata berdasarkan harga gas L1 fee vs Blob fee [12], [21], serta mengukur penghematan biaya dibandingkan static engine.

4. Mengevaluasi efektivitas pendekatan yang diusulkan melalui 215 test cases yang mencakup fuzz testing, invariant testing, edge case analysis, dan benchmark gas [6], serta memvalidasi hasilnya menggunakan Welch's t-test, Confidence Interval 95%, dan Cohen's d effect size [22].

## 1.4 Related work

Bagian ini membahas landasan teoretis yang mendasari penelitian: optimasi gas, mekanisme keamanan smart contract, EIP-1153 Transient Storage, Maximal Extractable Value (MEV), serta EIP-4844 Proto-Danksharding.

### 1.4.1 Optimasi gas pada smart contract

EVM menggunakan model storage berbasis slot 32-byte, di mana operasi SSTORE dan SLOAD merupakan operasi paling mahal [22]. Di Sorbo et al. [9] mengidentifikasi 19 jenis code smells pada Solidity yang berkontribusi terhadap pemborosan gas, termasuk penggunaan storage yang tidak efisien. Variable packing—teknik menggabungkan beberapa variabel ke dalam satu slot—terbukti menghasilkan penghematan signifikan tanpa mengubah logika bisnis [6]. Teknik lain meliputi unchecked arithmetic, custom errors, calldata parameter, dan immutable variables [33].

### 1.4.2 EIP-1153 transient storage

EIP-1153 memperkenalkan TSTORE dan TLOAD—dua opcode baru dengan biaya 100 gas per operasi, jauh lebih rendah dibandingkan SSTORE cold (20.000 gas) [16]. Data transient storage hanya berlaku selama satu transaksi dan direset otomatis (*auto-reset*), sehingga sangat cocok untuk reentrancy guard [17]. Zhang & Debono [19] menemukan bahwa lebih dari 60 kontrak telah di-deploy lintas chain menggunakan transient storage. Penghematan gas dari mekanisme ini mencapai 22.700 gas per transaksi (99.1%) dibandingkan mutex lock konvensional [29].

### 1.4.3 MEV dan sandwich attack

Maximal Extractable Value (MEV) merupakan keuntungan maksimum yang dapat diperoleh oleh validator atau bot melalui kemampuan menyusun transaksi dalam satu blok [12]. Sandwich attack merupakan bentuk MEV yang paling merusak: penyerang menjalankan frontrun sebelum transaksi korban, lalu backrun setelahnya, merealisasikan keuntungan dari selisih harga [5]. Qin et al. membuktikan bahwa sandwich attack merupakan ancaman struktural yang tidak dapat dihilangkan sepenuhnya melalui mekanisme konsensus, sehingga memerlukan solusi pada lapisan aplikasi.

### 1.4.4 Early Warning System on-chain

Early Warning System (EWS) on-chain merupakan mekanisme deteksi anomali yang berjalan langsung dalam lingkungan EVM tanpa single point of failure [40]. Mekanisme ini mendeteksi pola sandwich attack melalui analisis transaksi berurutan dan menerapkan penalti ekonomi secara otomatis. Model penalti dibangun di atas prinsip incentive compatibility—membuat serangan menjadi tidak menguntungkan secara ekonomi [9].

### 1.4.5 Dynamic Rollup Submission Engine

EIP-4844: Proto-Danksharding memperkenalkan Blob transactions yang menawarkan biaya jauh lebih rendah dibandingkan calldata konvensional [21]. Park et al. [30] menganalisis dampak EIP-4844 terhadap dinamika transaksi rollup dan pasar biaya gas blob. Dynamic Rollup Submission Engine mengoptimalkan pengiriman batch dengan melakukan routing dynamic antara blob dan calldata berdasarkan harga gas real-time, memilih rute termurah pada setiap momen pengiriman.
