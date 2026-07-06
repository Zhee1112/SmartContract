# BAB I PENDAHULUAN

## 1.1 Latar Belakang

Decentralized Finance, atau yang kerap disapa DeFi, belakangan ini boleh dibilang sedang naik daun. Dalam waktu relatif singkat, DeFi berhasil mengubah cara pandang banyak orang terhadap keuangan—transaksi bisa dilakukan tanpa harus melalui bank atau lembaga keuangan konvensional (Buterin, 2014). Nah, di balik pesatnya perkembangan itu, ada satu komponen yang seringkali luput dari perhatian tapi punya peran krusial: bridge blockchain. Bayangkan bridge seperti jembatan penghubung antardesa—tanpa jembatan, penduduk di dua desa yang terpisah sungai nggak bisa saling berkunjung. Begitu pula dengan blockchain, bridge memungkinkan transfer aset dan data antar jaringan yang sebelumnya terisolasi (Adams et al., 2021).

Tapi, seperti layaknya jembatan yang kurang kokoh, bridge juga rentan runtuh. Reentrancy attack—istilah teknis untuk keadaan di mana penyerang bisa memanggil fungsi withdraw secara berulang sebelum saldo benar-benar diperbarui—sudah menggerogoti jutaan dolar dari ekosistem DeFi (Samreen dan Alalfi, 2020). Zheng et al. (2023) bahkan mencatat bahwa kasus serangan ini terus meningkat dari tahun ke tahun. Belum lagi MEV sandwich attack, di mana bot-bot jahat memanfaatkan urutan transaksi di mempool untuk mengeruk keuntungan dari selisih harga (Daian et al., 2020). Qin et al. (2021) membuktikan bahwa sandwich attack ini bukan sekadar masalah teknis biasa—ia sudah menjadi ancaman struktural yang mustahil dihilangkan hanya dengan mengandalkan mekanisme konsensus.

Beberapa kejadian bridge yang mengalami kegagalan benar-benar menyita perhatian publik. Ronin Bridge kehilangan $620 juta, Wormhole Bridge $320 juta, dan Nomad Bridge $190 juta (Trail of Bits, 2022). Jumlah yang tidak sedikit, bukan? Lebih dari sekadar kerugian finansial, kejadian-kejadian semacam ini sempat membuat banyak pengguna menjadi ragu—bahkan takut—untuk menggunakan infrastruktur blockchain.

Di sinilah muncul dilema yang cukup pelik. Pengembang bridge dituntut untuk menciptakan sistem yang hemat biaya sekaligus tangguh secara keamanan. Masalahnya, mekanisme keamanan konvensional seperti reentrancy guard dari OpenZeppelin memang ampuh, tapi biayanya cukup merogoh kocek—sekitar 22.900 gas hanya untuk satu operasi SSTORE (OpenZeppelin, 2024). Bagi bridge dengan volume transaksi tinggi, beban biaya ini jelas memberatkan (Di Sorbo et al., 2022). Alhasil, pengembang sering kali dihadapkan pada pilihan sulit: mengutamakan keamanan atau menghemat biaya. Seperti pepatah lama, "ada harga, ada rupa"—tapi apakah selalu harus demikian?

Beruntung, Ethereum menawarkan solusi lewat Fork Cancun yang mengaktifkan EIP-1153: Transient Storage Opcodes. Fitur baru ini memperkenalkan TSTORE dan TLOAD, dua instruksi baru yang cuma butuh 100 gas per operasi—jauh lebih ringan dari SSTORE cold yang membutuhkan 20.000 gas (EIP-1153, 2021). Yang menarik, data di transient storage otomatis ter-reset di akhir transaksi, jadi tidak perlu repot-repot membersihkan secara manual (Solidity Blog, 2024). Penghematan yang ditawarkan mencapai 98,7% jika dibandingkan dengan mekanisme SSTORE konvensional. Angka yang cukup fantastis, bukan?

Sayangnya, setelah ditelusuri lebih dalam, masih ada celah yang belum tertutupi. Zhang dan Debono (2024) menemukan bahwa lebih dari 50% kontrak yang sudah mengadopsi EIP-1153 hanya menggunakannya untuk reentrancy guard—fitur keamanan multi-fungsi masih belum tersentuh. Chainsecurity (2023) juga mengungkapkan bahwa TSTORE tidak punya batas gas minimum seperti SSTORE, sehingga transfer() yang dulu dianggap aman ternyata rentan terhadap reentrancy. Di sisi lain, banyak pengembang yang memilih menerapkan keamanan melalui external calls ke kontrak terpisah. Sayangnya, pendekatan ini justru menambah biaya gas yang tidak sedikit—ironis, mengingat tujuan awalnya adalah untuk menghemat.

Berdasarkan pengamatan penulis terhadap bridge yang berjalan di Ethereum, mayoritas masih mengandalkan SSTORE konvensional untuk reentrancy guard. Artinya, setiap transaksi masih dikenakan beban 22.900 gas untuk komponen keamanan saja. Biaya ini pada akhirnya dibebankan kepada pengguna akhir melalui gas fee yang lebih tinggi. Cukup disayangkan, mengingat sudah ada alternatif yang jauh lebih efisien.

Permasalahan di atas menunjukkan bahwa diperlukan pendekatan yang lebih sistematis untuk mengoptimalkan gas sekaligus menjaga keamanan bridge. Seperti yang dikemukakan oleh Benedetti et al. (2024), pengembang butuh kerangka kerja yang bisa membantu mereka mencapai keseimbangan antara biaya dan keamanan—bukan yang satu dikorbankan demi yang lain.

Ada beberapa pendekatan yang sudah tersedia untuk mengatasi masalah optimasi gas. Di sisi statis, ada teknik seperti variable packing, CEI pattern, custom errors, dan unchecked arithmetic (Di Sorbo et al., 2022). Di sisi dinamis, EIP-1153 transient storage menawarkan potensi penghematan yang jauh lebih besar. Namun sayangnya, penelitian yang ada masih terpecah-pecah. Ada yang hanya fokus pada optimasi gas, ada yang hanya membahas keamanan, tapi jarang yang menggabungkan keduanya dalam satu kajian. Belum lagi banyak yang masih menggunakan external calls untuk menerapkan keamanan berbasis EIP-1153, padahal biaya gas-nya cukup tinggi.

Salah satu pendekatan yang bisa digunakan untuk menangani masalah ini adalah gas cost analysis—ilmu yang berfokus pada pengukuran dan pengoptimalan konsumsi gas pada smart contract (Lagouvardos et al., 2020). Pendekatan ini membantu pengembang mengidentifikasi mana komponen yang paling boros gas, lalu menentukan strategi optimasi yang paling pas. Ibarat dokter yang mendiagnosis pasien sebelum meresepkan obat, gas cost analysis memungkinkan pengembang untuk "melihat" ke dalam kontrak mereka sebelum memutuskan langkah optimasi yang tepat.

Dalam gas cost analysis, ada juga analisis komparatif yang membandingkan kinerja beberapa arsitektur dalam kondisi yang terkontrol. Pendekatan ini berguna untuk mengevaluasi seberapa efisien sebuah bridge dalam mengubah biaya gas menjadi keamanan (Albert et al., 2021). Metrik yang dikembangkan dari konsep ini adalah Security Points per Gas (SPG)—makin tinggi nilainya, makin efisien bridge tersebut (Benedetti et al., 2024).

Beberapa penelitian terdahulu sudah mulai menyentuh topik ini. Di Sorbo et al. (2022) misalnya, mereka mengidentifikasi 19 code smells pada Solidity yang bikin kontrak jadi boros gas—semacam "penyakit kronis" yang sering kali tidak disadari oleh pengembang. Benedetti et al. (2024) membandingkan gas cost antara proxy pattern dan diamond pattern, dan menemukan bahwa masing-masing punya kelebihan dan kekurangan. Sementara itu, Zhang dan Debono (2024) menganalisis lebih dari 250 kontrak yang sudah pakai EIP-1153, dan hasilnya cukup mengejutkan: lebih dari setengah hanya pakai untuk reentrancy guard saja. Potensi yang belum tergarap masih sangat besar.

Chainsecurity (2023) juga memberikan temuan penting terkait implikasi keamanan EIP-1153. Mereka menunjukkan bahwa TSTORE tidak punya batas gas minimum, sehingga mekanisme keamanan lama perlu dievaluasi ulang. OpenZeppelin (2024) kemudian merespons dengan mengembangkan TransientStorageGuard yang memanfaatkan TSTORE/TLOAD untuk reentrancy guard dengan biaya hanya 200 gas. Solidity Blog (2024) juga sudah mendokumentasikan cara implementasi EIP-1153 di Solidity 0.8.24.

Dari sisi optimasi gas, Albert et al. (2021) pernah menganalisis sekitar 15% kontrak di Ethereum dan menemukan banyak yang berpotensi mengalami out-of-gas vulnerability. Mereka mengembangkan pendekatan static resource analysis yang bisa memprediksi kebutuhan gas dengan cukup akurat. Meskipun begitu, pendekatan statis punya kelemahan: kurang bisa mengakomodasi kondisi runtime yang dinamis. Makanya, perlu dilengkapi dengan pengukuran empiris—supaya hasilnya benar-benar bisa dipertanggungjawabkan.

Jadi, bisa dibilang optimasi statis dan dinamis itu saling melengkapi. Yang statis bekerja di level compile-time untuk mengurangi biaya gas, sementara yang dinamis berbasis EIP-1153 memberikan proteksi keamanan saat runtime dengan biaya yang sangat ringan. Kombinasi keduanya ibarat "silet dan pisau"—masing-masing punya kegunaan tersendiri, dan paling efektif jika digunakan secara bersamaan.

Guna memastikan bahwa sistem yang dikembangkan bisa diukur secara objektif, penelitian ini menggunakan framework komparatif yang disebut 4-Tier Architecture. Framework ini memungkinkan perbandingan berbagai tingkat optimasi dari yang paling dasar hingga yang paling canggih (Benedetti et al., 2024).

Metode yang digunakan dalam penelitian ini adalah desain komparatif empiris. Pendekatan ini sudah terbukti handal dalam penelitian rekayasa perangkat lunak blockchain karena menyediakan alur yang jelas: implementasi, pengukuran, analisis, sampai validasi statistik (Park et al., 2024).

## 1.2 Identifikasi Masalah

Berdasarkan pemaparan latar belakang yang telah dipaparkan, maka dapat diidentifikasikan permasalahan yang ada sebagai berikut:

1. Biaya gas untuk reentrancy guard menggunakan SSTORE konvensional masih cukup tinggi—sekitar 22.900 gas per transaksi—yang memberatkan operasional bridge dengan volume transaksi tinggi.
2. Pendekatan keamanan berbasis EIP-1153 transient storage yang ada saat ini sebagian besar masih menggunakan external calls ke kontrak terpisah, sehingga menambah biaya gas overhead yang tidak sedikit.
3. Belum ada framework komparatif yang secara sistematis membandingkan berbagai tingkat optimasi gas dan keamanan dalam satu arsitektur bridge, sehingga pengembang kesulitan menentukan pendekatan mana yang paling sesuai dengan kebutuhan mereka.
4. EIP-1153 transient storage belum dimanfaatkan secara optimal untuk implementasi keamanan multi-fungsi secara inline—lebih dari 50% kontrak yang sudah mengadopsi EIP-1153 hanya menggunakannya untuk reentrancy guard saja.

## 1.3 Rumusan Masalah

Berdasarkan permasalahan yang telah dikemukakan pada latar belakang di atas, rumusan masalah pada penelitian ini, yaitu:

1. Bagaimana mengoptimalkan biaya gas pada smart contract bridge melalui implementasi optimasi statis (variable packing, CEI pattern, custom errors, unchecked arithmetic) dan optimasi dinamis berbasis EIP-1153 transient storage?
2. Bagaimana merancang arsitektur 4-tier bridge yang mampu memberikan keamanan terhadap reentrancy attack dan MEV sandwich attack dengan biaya gas yang efisien?
3. Seberapa besar penghematan gas yang diperoleh dari implementasi EIP-1153 transient storage dibandingkan dengan mekanisme SSTORE konvensional pada reentrancy guard?
4. Bagaimana mengukur cost-effectiveness antara biaya gas dan tingkat keamanan yang dicapai menggunakan metrik Security Points per Gas (SPG)?

## 1.4 Batasan Masalah

Dengan mempertimbangkan rumusan masalah di atas, penulis membatasi topik penelitian untuk memenuhi tujuan penelitian sebagai berikut:

a. Metode

1. Optimasi statis mencakup variable packing, CEI pattern, custom errors, dan unchecked arithmetic pada bahasa pemrograman Solidity.
2. Optimasi dinamis berbasis EIP-1153 transient storage menggunakan opcode TSTORE dan TLOAD dengan biaya 100 gas per operasi.
3. Implementasi keamanan dilakukan secara inline dalam satu kontrak, bukan melalui external calls ke kontrak terpisah.
4. Keamanan yang diimplementasikan mencakup reentrancy guard (single-function, cross-function, consecutive), MEV sandwich detection, economic penalty, emergency pause, dan block tracking.
5. Pengukuran gas dilakukan menggunakan framework Foundry dengan 100 sampel per operasi pada lingkungan EVM simulasi.
6. Evaluasi keamanan dilakukan berdasarkan delapan fitur keamanan yang telah ditentukan.
7. Validasi statistik menggunakan Welch's t-test dan Cohen's d effect size.

b. Tools

1. Bahasa pemrograman yang digunakan adalah Solidity 0.8.28.
2. Compiler yang digunakan adalah Foundry (forge) v1.7.1 dengan EVM version Cancun.
3. Optimizer diatur pada 200 runs.
4. Sistem operasi yang digunakan adalah Windows 11 dengan WSL Ubuntu.
5. IDE yang digunakan adalah VS Code dengan opencode CLI.
6. EIP-1153 transient storage hanya bisa dijalankan pada EVM Cancun ke atas.

c. Proses

1. Implementasi empat kontrak bridge dengan tingkat optimasi yang berbeda: Unoptimized (Tier A), Static Only (Tier B), Full Dynamic EIP-1153 (Tier C), dan Lightweight Dynamic (Tier D).
2. Pengukuran gas dilakukan untuk tiga jenis transaksi: deposit, withdraw, dan swap.
3. Analisis gas cost menggunakan statistik deskriptif: mean, minimum, maximum, standar deviasi, dan confidence interval 95%.
4. Perbandingan antara Tier C dan Tier D dilakukan menggunakan Welch's t-test untuk menentukan signifikansi statistik.
5. Metrik SPG digunakan untuk mengevaluasi efisiensi konversi gas menjadi keamanan.
6. Semua pengujian dilakukan pada lingkungan EVM simulasi menggunakan Foundry.

## 1.5 Tujuan Penelitian

Adapun tujuan yang ingin dicapai melalui penelitian ini, yaitu:

1. Mengoptimalkan biaya gas pada smart contract bridge melalui implementasi optimasi statis dan dinamis berbasis EIP-1153 transient storage.
2. Merancang arsitektur 4-tier bridge yang mampu memberikan keamanan terhadap reentrancy attack dan MEV sandwich attack dengan biaya gas yang efisien.
3. Membuktikan secara empiris bahwa implementasi EIP-1153 transient storage secara inline mampu mengurangi biaya gas hingga 98,7% dibandingkan mekanisme SSTORE konvensional.
4. Mengukur cost-effectiveness antara biaya gas dan tingkat keamanan yang dicapai menggunakan metrik Security Points per Gas (SPG).

## 1.6 Manfaat Penelitian

a. Bagi Penulis

Bagi penulis, manfaat penelitian ini yaitu sebagai sarana dalam mengimplementasikan ilmu yang sudah dipelajari selama perkuliahan dan meningkatkan pemahaman penulis mengenai penerapan EIP-1153 transient storage dalam optimasi gas dan keamanan smart contract bridge, serta melatih kemampuan penulis dalam merancang dan mengimplementasikan sistem berbasis blockchain sesuai kebutuhan nyata di lapangan.

b. Bagi Universitas

Bagi universitas, hasil penelitian ini diharapkan dapat menjadi referensi dan kontribusi ilmiah dalam pengembangan riset blockchain di lingkungan kampus, khususnya terkait optimalisasi gas dan keamanan smart contract yang dapat diterapkan pada berbagai proyek berbasis Ethereum.

c. Bagi Pengembang dan Peneliti

Bagi pengembang dan peneliti, penelitian ini diharapkan dapat menjadi bahan referensi bagi pengembang smart contract yang ingin mengoptimalkan biaya gas sekaligus menjaga keamanan bridge, serta bagi peneliti selanjutnya yang tertarik pada pengembangan arsitektur bridge yang lebih efisien dan aman.
