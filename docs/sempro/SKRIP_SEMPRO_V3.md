# SKRIP PRESENTASI SEMINAR PROPOSAL (10 MENIT)

## Judul: Optimalisasi Gas dan Keamanan Smart Contract Bridge Berbasis EIP-1153 Transient Storage pada Arsitektur 4-Tier

---

## SLIDE 1: PEMBUKAAN (0,5 menit)

Assalamualaikum warahmatullahi wabarakatuh.

Yang terhormat Bapak/Ibu Dosen, perkenalkan saya Razy Al Farizy, NIM 11220910000063, dari Program Studi Teknik Informatika, Universitas Islam Negeri Syarif Hidayatullah Jakarta.

Pada kesempatan ini, saya akan mempresentasikan proposal penelitian saya yang berjudul "Optimalisasi Gas dan Keamanan Smart Contract Bridge Berbasis EIP-1153 Transient Storage pada Arsitektur 4-Tier."

---

## SLIDE 2: LATAR BELAKANG (2 menit)

Bapak/Ibu yang saya hormati,

Decentralized Finance, atau yang kerap disebut DeFi, merupakan sistem keuangan yang beroperasi tanpa perantara lembaga konvensional. Dalam ekosistem DeFi, terdapat komponen kritis yang disebut bridge blockchain.

Bayangkan bridge seperti jembatan penghubung antardesa. Tanpa jembatan, penduduk di dua desa yang terpisah sungai tidak bisa saling berkunjung. Begitu pula dengan blockchain, bridge memungkinkan transfer aset dari satu jaringan ke jaringan lainnya, misalnya dari Ethereum ke Arbitrum.

Namun, seperti layaknya jembatan yang kurang kokoh, bridge juga rentan runtuh. Beberapa insiden bridge yang pernah terjadi menunjukkan kerugian yang sangat signifikan: Ronin Bridge kehilangan 620 juta dolar, Wormhole Bridge 320 juta dolar, dan Nomad Bridge 190 juta dolar. Total kerugian mencapai lebih dari 1 miliar dolar.

Dua jenis serangan yang paling berbahaya adalah reentrancy attack dan MEV sandwich attack. Reentrancy attack adalah kondisi di mana penyerang bisa memanggil fungsi withdraw secara berulang kali sebelum saldo benar-benar diperbarui. Bayangkan seperti orang yang mondar-mandir di pintu keluar supermarket, mengambil barang berkali-kali sebelum sempat membayar. Sedangkan MEV sandwich attack melibatkan bot yang berdiri di antara transaksi pengguna dan tujuannya, lalu memanfaatkan urutan transaksi untuk mengambil keuntungan dari selisih harga. Seperti ada orang yang memotong antrian di kasir.

Dilema yang muncul adalah mekanisme keamanan konvensional menggunakan SSTORE membutuhkan 22.900 gas per transaksi. Bagi bridge dengan volume transaksi tinggi, beban biaya ini sangat memberatkan. Akibatnya, pengembang sering kali dihadapkan pada pilihan sulit antara keamanan dan efisiensi gas.

Beruntung, Ethereum merancang sistem penyimpanan sementara yang disebut transient storage melalui EIP-1153. Sistem ini memperkenalkan dua instruksi baru: TSTORE dan TLOAD yang hanya membutuhkan 100 gas per operasi. Setelah melalui proses diskusi dan pengembangan yang cukup panjang sejak diusulkan pada tahun 2021, EIP-1153 akhirnya diresmikan dan diaktifkan di Fork Cancun pada bulan Maret 2024. Keunggulan utamanya adalah data di transient storage otomatis ter-reset di akhir transaksi tanpa memerlukan biaya tambahan. Penghematan yang ditawarkan mencapai 98,7 persen dibandingkan SSTORE konvensional.

---

## SLIDE 3: IDENTIFIKASI MASALAH (1,5 menit)

Berdasarkan pemaparan latar belakang, teridentifikasi beberapa permasalahan sebagai berikut.

Pertama, mekanisme keamanan konvensional menggunakan SSTORE membutuhkan 22.900 gas per transaksi. Biaya ini memberatkan operasional bridge dengan volume transaksi tinggi.

Kedua, implementasi keamanan berbasis EIP-1153 yang ada saat ini sebagian besar masih menggunakan external calls ke kontrak terpisah. Pendekatan ini justru menambah biaya gas overhead yang tidak sedikit.

Ketiga, EIP-1153 transient storage belum dimanfaatkan secara optimal. Berdasarkan studi Zhang dan Debono (2024), lebih dari 50 persen kontrak yang sudah mengadopsi EIP-1153 hanya menggunakannya untuk reentrancy guard saja.

Keempat, belum ada framework komparatif yang secara sistematis membandingkan berbagai tingkat optimasi gas dan keamanan dalam satu arsitektur bridge.

Berdasarkan permasalahan di atas, rumusan masalah penelitian ini adalah: bagaimana mengoptimalkan biaya gas pada smart contract bridge melalui implementasi optimasi statis dan dinamis berbasis EIP-1153 transient storage?

---

## SLIDE 4: PENELITIAN TERDAHULU (1,5 menit)

Untuk mendapatkan pemahaman yang cukup tentang topik yang diangkat, berikut disajikan beberapa penelitian terdahulu yang relevan.

Penelitian oleh Zhang dan Debono (2024) menganalisis lebih dari 250 kontrak yang sudah mengadopsi EIP-1153. Hasilnya cukup mengejutkan: lebih dari setengah hanya menggunakannya untuk reentrancy guard saja. Potensi yang belum tergarap masih sangat besar.

Chainsecurity (2023) memberikan temuan penting terkait implikasi keamanan EIP-1153. Mereka menunjukkan bahwa TSTORE tidak punya batas gas minimum seperti SSTORE, sehingga mekanisme keamanan lama perlu dievaluasi ulang.

Di Sorbo et al. (2022) mengidentifikasi 19 code smells pada Solidity yang menyebabkan kontrak menjadi boros gas. Temuan ini menunjukkan masih banyaknya pemborosan gas yang tidak disadari oleh pengembang.

Berdasarkan kajian literatur, teridentifikasi celah penelitian yang belum tertutupi: belum ada penelitian yang secara spesifik menggabungkan optimasi gas statis dan dinamis secara inline dalam satu arsitektur bridge dengan pengukuran cost-effectiveness.

---

## SLIDE 5: METODOLOGI (2 menit)

Untuk mengatasi permasalahan di atas, penelitian ini menggunakan paradigma empiris-kuantitatif. Pendekatan empiris dipilih karena berfokus pada pengukuran fakta objektif melalui eksperimen terkontrol.

**Mengapa 4-Tier?**

4-Tier dirancang untuk merepresentasikan spektrum optimasi dari yang paling dasar hingga yang paling canggih. Setiap tier merepresentasikan kondisi nyata di lapangan dan memiliki paper yang mewakili.

Tier A (UnoptimizedBridge) representasi bridge tanpa optimasi, rentan reentrancy. Mewakili kondisi bridge yang belum dioptimasi seperti yang diidentifikasi oleh Trail of Bits (2022) pada Wormhole Bridge dan Samreen & Alalfi (2020) dalam identifikasi kerentanan reentrancy. Gas rendah, skor keamanan 0 dari 8 fitur.

Tier B (BridgeStaticOnly) representasi bridge dengan optimasi statis saja: CEI Pattern, variable packing, custom errors. Mewakili pendekatan optimasi gas berbasis code smells yang diidentifikasi oleh Di Sorbo et al. (2022) dan analisis statis oleh Albert et al. (2021). Gas rendah, skor keamanan 2 dari 8 fitur.

Tier C (VictimBridge) representasi bridge dengan dynamic protection via external calls ke kontrak terpisah (MonitorMock). Mewakili framework keamanan EIP-1153 dari OpenZeppelin (2024) dan studi empiris Zhang & Debono (2024) yang menunjukkan 50%+ kontrak hanya untuk reentrancy guard. Gas sangat tinggi karena banyak external calls, skor keamanan 8 dari 8 fitur.

Tier D (LightweightBridge) kontribusi utama penelitian. Menggabungkan optimasi statis (Tier B) + dynamic protection secara inline tanpa external calls. Belum ada paper yang mewakili, ini adalah kontribusi baru. Gas rendah, skor keamanan 8 dari 8 fitur.

Total pengujian yang dilakukan adalah 216 test cases dalam 13 file test menggunakan metode empiris-kuantitatif.

---

## SLIDE 6: MANFAAT PENELITIAN (1 menit)

Penelitian ini diharapkan memberikan manfaat bagi beberapa pihak.

Bagi penulis, sebagai sarana mengimplementasikan ilmu yang sudah dipelajari selama perkuliahan dan meningkatkan pemahaman mengenai penerapan EIP-1153 transient storage dalam optimasi gas dan keamanan smart contract.

Bagi universitas, sebagai referensi dan kontribusi ilmiah dalam pengembangan riset blockchain di lingkungan kampus, khususnya terkait optimalisasi gas dan keamanan smart contract.

Bagi pengembang dan peneliti, sebagai bahan referensi bagi pengembang smart contract yang ingin mengoptimalkan biaya gas sekaligus menjaga keamanan bridge, serta bagi peneliti selanjutnya yang tertarik pada pengembangan arsitektur bridge yang lebih efisien dan aman.

---

## SLIDE 7: PENUTUP (0,5 menit)

Demikian presentasi proposal penelitian saya. Penelitian ini bertujuan untuk mengoptimalkan biaya gas dan keamanan smart contract bridge melalui implementasi EIP-1153 transient storage pada arsitektur 4-tier.

Saya berharap proposal ini dapat diterima untuk dilanjutkan ke tahap penelitian selanjutnya.

Terima kasih atas perhatian Bapak/Ibu Dosen.

Wassalamualaikum warahmatullahi wabarakatuh.

---

## RINGKASAN WAKTU

| Slide | Judul | Durasi |
|-------|-------|--------|
| 1 | Pembukaan | 0,5 menit |
| 2 | Latar Belakang | 2 menit |
| 3 | Identifikasi Masalah | 1,5 menit |
| 4 | Penelitian Terdahulu | 1,5 menit |
| 5 | Metodologi | 2 menit |
| 6 | Manfaat Penelitian | 1 menit |
| 7 | Penutup | 0,5 menit |
| **Total** | | **9 menit** |
| **Sisa** | Q&A | **1 menit** |
