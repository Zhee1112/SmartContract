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
