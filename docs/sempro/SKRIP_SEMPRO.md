# SKRIP PRESENTASI SEMINAR PROPOSAL

## Optimalisasi Gas dan Keamanan Smart Contract Bridge Berbasis EIP-1153 Transient Storage pada Arsitektur 4-Tier

**Oleh: Razy Al Farizy**
**NIM: 11220910000063**
**Universitas Islam Negeri Syarif Hidayatullah Jakarta**

---

## [1. PEMBUKAAN]

Assalamualaikum warahmatullahi wabarakatuh.

Selamat pagi/siang kepada Bapak/Ibu Dosen yang saya hormati.

Perkenalkan, saya Razy Al Farizy, NIM 11220910000063, dari Program Studi Teknik Informatika, Universitas Islam Negeri Syarif Hidayatullah Jakarta.

Pada kesempatan kali ini, saya akan mempresentasikan proposal penelitian saya yang berjudul:

**"Optimalisasi Gas dan Keamanan Smart Contract Bridge Berbasis EIP-1153 Transient Storage pada Arsitektur 4-Tier"**

Sebelum masuk ke inti penelitian, saya akan menjelaskan dulu konteks dasar dari penelitian ini supaya lebih mudah dipahami.

---

## [2. LATAR BELAKANG]

Jadi, mungkin beberapa Bapak/Ibu sudah familiar dengan istilah DeFi. DeFi itu kependekan dari Decentralized Finance, atau dalam bahasa sederhananya: sistem keuangan tanpa bank. Semua transaksi dilakukan langsung antar pengguna, tanpa perantara lembaga keuangan konvensional.

Nah, di dalam ekosistem DeFi ini, ada satu komponen yang sangat penting tapi seringkali tidak disadari oleh pengguna biasa. Komponen itu adalah **bridge blockchain**.

Bridge blockchain ini fungsinya seperti jembatan penghubung antar desa. Bayangkan ada dua desa yang dipisahkan oleh sungai besar. Untuk berpindah dari desa satu ke desa lainnya, kita butuh jembatan. Begitu juga dengan blockchain, bridge memungkinkan transfer aset dari satu jaringan ke jaringan lainnya, misalnya dari Ethereum ke Arbitrum atau ke Optimism.

Tapi, seperti jembatan yang kurang kokoh, bridge juga punya kelemahan. Dan kelemahan ini sudah membawa kerugian yang tidak sedikit.

Beberapa insiden bridge yang pernah terjadi cukup mencengangkan:
- **Ronin Bridge** kehilangan **$620 juta**
- **Wormhole Bridge** kehilangan **$320 juta**
- **Nomad Bridge** kehilangan **$190 juta**

Jadi total kerugiannya mencapai **miliaran dolar**. Angka yang cukup fantastis, bukan?

Nah, masalah utamanya ada dua. Yang pertama adalah **reentrancy attack**. Ini istilah teknis untuk serangan di mana penyerang bisa memanggil fungsi withdraw secara berulang kali, bayangkan seperti orang yang mondar-mandir di pintu keluar supermarket, mengambil barang berkali-kali sebelum sempat membayar. Serangan ini sudah menelan jutaan dolar dari ekosistem DeFi.

Yang kedua adalah **MEV sandwich attack**. Ini lebih canggih lagi. Bayangkan ada bot yang berdiri di antara transaksi Anda dan tujuannya, lalu bot itu memanfaatkan urutan transaksi untuk mengambil keuntungan dari selisih harga. Seperti ada orang yang memotong antrian di kasir.

Masalahnya, untuk melindungi bridge dari serangan-serangan ini, kita butuh mekanisme keamanan. Dan mekanisme keamanan itu... mahal.

Sebagai contoh, reentrancy guard konvensional dari OpenZeppelin membutuhkan sekitar **22.900 gas**, yaitu biaya transaksi di Ethereum, hanya untuk satu operasi penyimpanan. Bagi bridge dengan volume transaksi tinggi, beban biaya ini jelas sangat memberatkan.

Jadi di sinilah dilemanya: pengembang bridge harus memilih antara **keamanan yang kuat** atau **biaya yang hemat**. Dan selama ini, keduanya sulit untuk didapatkan sekaligus.

Tapi untungnya, Ethereum punya solusi. Pada tahun 2024, Ethereum mengaktifkan **EIP-1153**, yaitu standar baru untuk penyimpanan sementara yang disebut **transient storage**. Teknologi ini memperkenalkan dua instruksi baru: **TSTORE** dan **TLOAD**.

Yang menarik, kedua instruksi ini hanya butuh **100 gas** per operasi. Bandingkan dengan SSTORE konvensional yang butuh **20.000 gas** untuk cold write. Itu artinya, penghematannya mencapai **98,7%**!

Selain itu, data di transient storage otomatis ter-reset di akhir transaksi, jadi tidak perlu repot-repot membersihkan secara manual. Sangat efisien.

---

## [3. IDENTIFIKASI MASALAH]

Nah, setelah memahami konteks di atas, saya mengidentifikasi ada 4 permasalahan utama:

**Pertama**, mekanisme keamanan konvensional menggunakan SSTORE membutuhkan 22.900 gas per transaksi. Ini memberatkan operasional bridge dengan volume transaksi tinggi.

**Kedua**, implementasi keamanan berbasis EIP-1153 yang ada saat ini sebagian besar masih menggunakan **external calls** ke kontrak terpisah. Padahal, pendekatan ini justru menambah biaya gas overhead yang tidak sedikit. Ironis, mengingat tujuan awalnya adalah untuk menghemat.

**Ketiga**, EIP-1153 transient storage belum dimanfaatkan secara optimal untuk implementasi keamanan multi-fungsi secara inline. Berdasarkan studi Zhang dan Debono (2024), lebih dari 50% kontrak yang sudah mengadopsi EIP-1153 hanya menggunakannya untuk reentrancy guard saja.

**Keempat**, belum ada framework komparatif yang secara sistematis membandingkan berbagai tingkat optimasi gas dan keamanan dalam satu arsitektur bridge. Jadi pengembang kesulitan menentukan pendekatan mana yang paling sesuai.

---

## [4. RUMUSAN MASALAH & TUJUAN]

Berdasarkan permasalahan di atas, rumusan masalah penelitian ini adalah:

1. Bagaimana mengoptimalkan biaya gas pada smart contract bridge melalui implementasi optimasi statis dan dinamis berbasis EIP-1153 transient storage, serta seberapa besar penghematan gas yang diperoleh dibandingkan mekanisme SSTORE konvensional?

2. Bagaimana membandingkan arsitektur 4-tier bridge yang mampu memberikan keamanan terhadap reentrancy attack dan MEV sandwich attack dengan biaya gas yang efisien?

3. Bagaimana mengukur cost-effectiveness antara biaya gas dan tingkat keamanan yang dicapai menggunakan metrik SPG (Security Points per Gas)?

Dan tujuan penelitian ini adalah:

1. Mengoptimalkan biaya gas pada smart contract bridge melalui implementasi optimasi statis dan dinamis berbasis EIP-1153 transient storage.

2. Membandingkan arsitektur 4-tier bridge yang mampu memberikan keamanan dengan biaya gas yang efisien.

3. Membuktikan secara empiris bahwa implementasi EIP-1153 transient storage secara inline mampu mengurangi biaya gas secara signifikan dibandingkan mekanisme SSTORE konvensional.

---

## [5. PENELITIAN TERDAHULU]

Sebelum masuk ke metodologi, saya ingin menyampaikan beberapa penelitian terdahulu yang relevan.

Penelitian oleh Zhang dan Debono (2024) menganalisis lebih dari 250 kontrak yang sudah pakai EIP-1153. Hasilnya cukup mengejutkan: lebih dari setengah hanya pakai untuk reentrancy guard saja. Potensi yang belum tergarap masih sangat besar.

Chainsecurity (2023) juga memberikan temuan penting terkait implikasi keamanan EIP-1153. Mereka menunjukkan bahwa TSTORE tidak punya batas gas minimum seperti SSTORE, sehingga mekanisme keamanan lama perlu dievaluasi ulang.

Dari sisi optimasi gas, Di Sorbo et al. (2022) mengidentifikasi 19 code smells pada Solidity yang bikin kontrak jadi boros gas, semacam "penyakit kronis" yang sering kali tidak disadari oleh pengembang.

Nah, yang menarik, dari semua penelitian yang ada, belum ada yang secara spesifik menggabungkan optimasi gas statis dan dinamis dalam satu arsitektur bridge, serta menerapkan keamanan multi-fungsi secara inline dengan pengukuran cost-effectiveness.

Dan di sinilah penelitian saya berusaha mengisi celah tersebut.

---

## [6. METODOLOGI]

Untuk metodologi, penelitian ini menggunakan pendekatan **desain komparatif empiris**. Artinya, saya akan membandingkan beberapa versi bridge dengan tingkat optimasi yang berbeda, lalu mengukur kinerjanya secara empiris.

Pertama, saya mengimplementasikan **empat kontrak bridge** dengan tingkat optimasi yang berbeda, yang saya sebut **4-Tier Architecture**:

- **Tier A (Unoptimized)**: Baseline tanpa optimasi apapun. Ini sebagai pembanding.
- **Tier B (Static Only)**: Hanya menggunakan optimasi statis seperti variable packing, CEI pattern, custom errors.
- **Tier C (Full Dynamic)**: Menggunakan EIP-1153 transient storage secara penuh untuk keamanan, tapi melalui external calls.
- **Tier D (Lightweight Dynamic)**: Menggunakan EIP-1153 secara inline untuk keamanan multi-fungsi.

Keempat tier ini merepresentasikan spektrum optimasi dari yang paling dasar hingga yang paling canggih.

Kedua, untuk **pengukuran gas**, saya menggunakan framework Foundry dengan **100 sampel** per operasi. Jumlah sampel ini dipilih berdasarkan **Central Limit Theorem** yang menyatakan bahwa distribusi mean akan mendekati normal untuk n >= 30. Jadi 100 sampel sudah lebih dari cukup untuk hasil yang akurat.

Ketiga, untuk **evaluasi keamanan**, saya menggunakan delapan fitur keamanan yang dianggap kritis:

1. Reentrancy single-function
2. Reentrancy cross-function
3. Reentrancy consecutive
4. MEV sandwich detection
5. Economic penalty
6. Emergency pause
7. Block tracking
8. Custom errors

Dan keempat, untuk **validasi statistik**, saya menggunakan **Welch's t-test** untuk membandingkan gas cost antara Tier C dan Tier D. Serta **Cohen's d** untuk mengukur effect size atau besarnya perbedaan yang bermakna secara praktis.

---

## [7. EVIDENCE DARI TEST & ANALISIS]

Bukti lengkap hasil test dan analisis keamanan terdapat pada file terpisah:

📄 **[EVIDENCE_TEST.md](EVIDENCE_TEST.md)**

File tersebut berisi:
1. **Evidence 1**: Foundry test logs (216 tests, semua PASS)
2. **Evidence 2**: Slither static analysis (0 critical vulnerabilities)
3. **Evidence 3**: Forge coverage report (88.86% lines, 98.04% functions)
4. **Evidence 4**: Gas report per function (deposit, withdraw, swap)
5. **Evidence 5**: Solhint linting (0 errors, 260 warnings)
6. **Evidence 6**: Summary comparison semua tools

Tools yang digunakan (dari Consensys Ethereum Developer Tools List):
- **Foundry**: Testing framework (216 tests PASS)
- **Slither**: Static security analysis (github.com/crytic/slither)
- **Solhint**: Code linting (github.com/protofire/solhint)
- **forge coverage**: Test coverage measurement
- **forge --gas-report**: Gas profiling per function

---

## [8. MANFAAT & PENUTUP]

Penelitian ini diharapkan memberikan manfaat bagi beberapa pihak:

**Bagi penulis**, sebagai sarana mengimplementasikan ilmu yang dipelajari selama perkuliahan dan meningkatkan pemahaman tentang EIP-1153 transient storage.

**Bagi universitas**, sebagai referensi dan kontribusi ilmiah dalam pengembangan riset blockchain di lingkungan kampus.

**Bagi pengembang dan peneliti**, sebagai bahan referensi bagi pengembang smart contract yang ingin mengoptimalkan biaya gas sekaligus menjaga keamanan bridge.

Yang menjadi **keunggulan utama** penelitian ini adalah:

1. **Pertama**, penelitian ini menggabungkan optimasi gas statis dan dinamis dalam satu framework komparatif, yang belum ada di penelitian sebelumnya.

2. **Kedua**, implementasi keamanan dilakukan secara **inline** dalam satu kontrak, bukan melalui external calls. Ini membuat biaya gas jauh lebih efisien.

3. **Ketiga**, penelitian ini menggunakan **metrik SPG** untuk mengukur cost-effectiveness secara objektif.

4. **Keempat**, validasi statistik menggunakan **Welch's t-test** dan **Cohen's d** memastikan hasil yang diperoleh benar-benar signifikan secara statistik.

Dan yang paling penting, semua klaim di atas sudah **terbukti melalui 216 test Foundry yang semuanya PASS**. Mulai dari test keamanan reentrancy, MEV sandwich, emergency pause, sampai pengukuran gas dengan 100 sampel per operasi.

Demikian presentasi dari saya. Terima kasih atas perhatian Bapak/Ibu Dosen.

Wassalamualaikum warahmatullahi wabarakatuh.
