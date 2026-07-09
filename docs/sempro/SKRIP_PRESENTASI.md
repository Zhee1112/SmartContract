# SKRIP PRESENTASI TUGAS AKHIR

## Judul: Optimalisasi Gas dan Keamanan Smart Contract Bridge Berbasis EIP-1153 Transient Storage pada Arsitektur 4-Tier

---

## SLIDE 1: JUDUL & IDENTITAS

Assalamualaikum warahmatullahi wabarakatuh.

Yang terhormat Bapak/Ibu Dosen Pembimbing, dan rekan-rekan sekalian yang saya hormati.

Perkenalkan, saya Razy Al Farizy, mahasiswa Universitas Islam Negeri Syarif Hidayatullah Jakarta. Pada kesempatan ini, saya akan mempresentasikan tugas akhir saya yang berjudul "Optimalisasi Gas dan Keamanan Smart Contract Bridge Berbasis EIP-1153 Transient Storage pada Arsitektur 4-Tier."

Penelitian ini membahas bagaimana cara mengoptimalkan biaya gas sekaligus menjaga keamanan pada smart contract bridge menggunakan teknologi terbaru dari Ethereum yaitu EIP-1153 Transient Storage.

---

## SLIDE 2: LATAR BELAKANG (THE BRIDGE CRISIS)

Bapak/Ibu dan rekan-rekan yang saya hormati,

Masalah utama yang mendasari penelitian ini adalah krisis keamanan pada bridge blockchain. Dalam beberapa tahun terakhir, berbagai serangan terhadap bridge telah menyebabkan kerugian yang sangat besar. Ronin Bridge kehilangan 620 juta dolar, Wormhole Bridge 320 juta dolar, dan Nomad Bridge 190 juta dolar. Total kerugian mencapai lebih dari 1,13 miliar dolar.

Dua jenis serangan yang paling berbahaya adalah reentrancy attack dan MEV sandwich attack. Reentrancy attack terjadi ketika penyerang bisa memanggil fungsi withdraw secara berulang sebelum saldo benar-benar diperbarui, sehingga saldo bisa terkuras habis. Sedangkan MEV sandwich attack terjadi ketika bot memanipulasi harga dengan membungkus transaksi korban menggunakan frontrun dan backrun.

Yang menjadi dilema adalah mekanisme pertahanan konvensional menggunakan SSTORE sangat mahal, yaitu sekitar 22.900 gas per transaksi. Bagi bridge dengan volume transaksi tinggi, beban biaya ini sangat memberatkan. Akibatnya, banyak pengembang yang memilih mengorbankan keamanan demi efisiensi gas.

---

## SLIDE 3: SOLUSI TEKNOLOGI: EIP-1153

Untuk mengatasi masalah tersebut, Ethereum menawarkan solusi melalui EIP-1153: Transient Storage Opcodes yang diaktifkan pada Fork Cancun bulan April 2024.

EIP-1153 memperkenalkan dua opcode baru yaitu TSTORE dan TLOAD. Kedua opcode ini hanya membutuhkan 100 gas per operasi, jauh lebih murah dibandingkan SSTORE yang membutuhkan 20.000 gas untuk cold write. Artinya, ada penghematan gas sebesar 98,7 persen.

Keunggulan lain dari EIP-1153 adalah mekanisme auto-reset. Data di transient storage otomatis ter-reset ke nol di akhir transaksi tanpa memerlukan biaya reset manual. Ini sangat cocok untuk mekanisme keamanan seperti reentrancy guard.

Yang menarik, EIP-1153 sebelumnya hanya digunakan untuk reentrancy guard saja. Penelitian ini membuktikan bahwa EIP-1153 bisa dimodifikasi menjadi platform keamanan multifungsi yang mencakup lima mekanisme pertahanan sekaligus.

---

## SLIDE 4: METODOLOGI: MEMBANDINGKAN ARSITEKTUR 4-TIER

Dalam penelitian ini, saya menggunakan pendekatan studi komparatif kuantitatif eksperimental. Saya merancang empat tingkat arsitektur bridge yang disebut 4-Tier Architecture.

Tier A adalah baseline tanpa optimasi sama sekali. Tier A merepresentasikan kondisi kontrak bridge yang berjalan di Ethereum saat ini tanpa optimasi gas maupun fitur keamanan.

Tier B menggunakan optimasi statis berupa CEI Pattern, variable packing, dan custom errors. Tier B mencapai gas yang rendah namun hanya memiliki 2 dari 8 fitur keamanan.

Tier C menggunakan dinamis eksternal melalui kontrak terpisah bernama MonitorMock. Tier C mencapai skor keamanan penuh 8 dari 8 fitur, namun gas-nya sangat tinggi karena menggunakan external calls.

Tier D adalah kontribusi utama penelitian ini. Tier D menggunakan inline dynamic defense, yaitu memindahkan seluruh fitur keamanan Tier C ke dalam kode kontrak utama tanpa external calls. Tier D mencapai skor keamanan 8 dari 8 fitur dengan gas yang jauh lebih rendah dari Tier C.

---

## SLIDE 5: KONTRIBUSI UTAMA: TIER D (INLINE DYNAMIC)

Inovasi utama dari Tier D adalah pendekatan inline, yaitu memindahkan seluruh logika keamanan ke dalam satu kontrak tunggal tanpa panggilan ke kontrak luar atau external calls.

Jika dibandingkan dengan Tier C yang memerlukan minimal 5 external calls ke MonitorMock untuk setiap transaksi, Tier D hanya memerlukan 0 external calls. Seluruh logika keamanan diimplementasikan menggunakan inline assembly dengan opcode TSTORE dan TLOAD.

Mekanisme kerja Tier D menggunakan EIP-1153 untuk mengelola status keamanan secara internal. Misalnya, untuk reentrancy guard, Tier D menggunakan TSTORE untuk mengatur lock dan TLOAD untuk memeriksa status lock dengan biaya total hanya 200 gas.

Untuk MEV sandwich detection, Tier D menggunakan single-slot LastTx struct yang menyimpan informasi transaksi sebelumnya. Setiap transaksi baru menimpa data sebelumnya, sehingga hanya memerlukan SSTORE warm sebesar 2.900 gas dibandingkan dynamic array pada Tier C yang memerlukan 22.100 gas per push.

---

## SLIDE 6: ANALISIS KEAMANAN (SKOR 8/8)

Tier D berhasil mencapai skor keamanan penuh 8 dari 8 fitur yang dievaluasi, sama dengan Tier C.

Fitur pertama adalah proteksi reentrancy. Tier D memblokir semua jenis reentrancy attack yaitu single-function, cross-function, dan consecutive reentrancy. Mekanismenya menggunakan TSTORE untuk mengatur lock dan TLOAD untuk memeriksa status lock. Jika callDepth lebih dari 0, transaksi akan langsung ditolak.

Fitur kedua adalah deteksi MEV sandwich. Tier D menggunakan Early Warning System atau EWS yang terintegrasi secara inline. Sistem ini mendeteksi pola frontrun-victim dalam satu blok dengan probabilitas deteksi sebesar 96 persen.

Fitur ketiga adalah economic penalty. Jika serangan terdeteksi, penyerang akan dikenai penalti ekonomi secara otomatis sebesar 14,4 persen dari jumlah transaksi. Formula penalti diimplementasikan sebagai pure function tanpa akses storage, sehingga biayanya minimal.

Fitur tambahan lainnya adalah emergency pause yang memungkinkan admin untuk menghentikan operasi bridge secara darurat, serta block tracking untuk melacak blok transaksi guna deteksi anomali.

---

## SLIDE 7: HASIL EKSPERIMEN: EFISIENSI GAS

Hasil pengukuran gas menunjukkan bahwa Tier D memiliki efisiensi gas yang jauh lebih baik dibandingkan Tier C.

Untuk operasi deposit, Tier D hanya memerlukan 103.652 gas dibandingkan Tier C yang memerlukan 173.461 gas. Artinya, ada penghematan sebesar 72,2 persen.

Untuk operasi withdraw, Tier D memerlukan 44.188 gas dibandingkan Tier C yang memerlukan 140.237 gas. Penghematan mencapai 88,4 persen.

Untuk operasi swap, Tier D memerlukan 84.134 gas dibandingkan Tier C yang memerlukan 154.581 gas. Penghematan sebesar 87,1 persen.

Validasi statistik menggunakan Welch's t-test menunjukkan p-value sebesar 2,25 kali 10 pangkat minus 222. Angka ini jauh lebih kecil dari threshold 0,05, sehingga perbedaan gas antara Tier C dan Tier D sangat signifikan secara statistik.

Cohen's d effect size sebesar 220,64 mengindikasikan bahwa kedua distribusi gas tidak tumpang tindih sama sekali. Seluruh sampel Tier C memiliki gas yang lebih tinggi dari seluruh sampel Tier D.

Dari sisi estimasi industri, untuk bridge dengan 100.000 transaksi per bulan, penghematan biaya operasional mencapai 79.000 hingga 213.000 dolar per bulan.

---

## SLIDE 8: COST-EFFECTIVENESS (METRIK SPG)

Untuk mengukur efisiensi bridge dalam mengubah biaya gas menjadi keamanan, saya menggunakan metrik Security Points per Gas atau SPG.

 Rumus SPG adalah: Skor Keamanan dibagi Gas Deposit, dikalikan 1 juta.

Hasil perhitungan menunjukkan bahwa Tier C memiliki SPG sebesar 65, sedangkan Tier D memiliki SPG sebesar 220,1.

Artinya, Tier D 3,15 kali lebih efisien dalam mengubah biaya gas menjadi perlindungan keamanan dibandingkan Tier C. Tier D mencapai skor keamanan penuh 8 dari 8 fitur dengan biaya gas yang jauh lebih rendah.

Metrik SPG ini membuktikan bahwa tidak selalu harus ada tradeoff antara gas dan keamanan. Tier D menunjukkan bahwa kedua hal tersebut bisa dicapai secara bersamaan tanpa mengorbankan yang satu demi yang lain.

---

## SLIDE 9: KESIMPULAN & SARAN

Berdasarkan seluruh hasil penelitian ini, dapat disimpulkan bahwa Tier D merupakan solusi paling optimal yang menggabungkan keamanan maksimal dengan biaya gas yang sangat rendah melalui modifikasi EIP-1153 secara inline.

Kontribusi utama penelitian ini adalah membuktikan bahwa EIP-1153 bisa dimodifikasi dari fungsi tunggal reentrancy guard menjadi platform keamanan multifungsi yang mencakup lima mekanisme pertahanan. Tier D mencapai skor keamanan 8 dari 8 fitur dengan penghematan gas 72 hingga 88 persen dibandingkan Tier C.

Saran untuk pengembangan selanjutnya adalah pertama, integrasi formal verification menggunakan tools seperti Halmos atau Certora untuk membuktikan kebenaran kode secara matematis. Kedua, pengembangan multi-pattern MEV detection yang bisa mendeteksi berbagai pola serangan yang lebih kompleks. Ketiga, pengujian pada multi-chain testnet seperti Sepolia atau Arbitrum untuk memvalidasi kinerja di lingkungan nyata.

Sekian presentasi dari saya. Terima kasih atas perhatiannya. Wassalamualaikum warahmatullahi wabarakatuh.

---

## RINGKASAN WAKTU PRESENTASI

| Slide | Judul | Durasi |
|-------|-------|--------|
| 1 | Judul & Identitas | 2 menit |
| 2 | Latar Belakang | 3 menit |
| 3 | EIP-1153 | 2 menit |
| 4 | Metodologi | 3 menit |
| 5 | Kontribusi Tier D | 2 menit |
| 6 | Analisis Keamanan | 3 menit |
| 7 | Hasil Gas | 3 menit |
| 8 | SPG | 2 menit |
| 9 | Kesimpulan | 2 menit |
| **Total** | | **22 menit** |
