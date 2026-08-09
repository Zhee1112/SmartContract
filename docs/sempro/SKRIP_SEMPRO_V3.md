# SKRIP PRESENTASI SEMINAR PROPOSAL (10 MENIT)

## Judul: Optimalisasi Gas dan Keamanan Smart Contract Bridge Berbasis EIP-1153 Transient Storage pada Arsitektur 4-Tier

---

## SLIDE 1: PEMBUKAAN (0,5 menit)

Assalamualaikum warahmatullahi wabarakatuh.

Yang terhormat Bapak/Ibu Dosen, perkenalkan saya Razy Al Farizy, NIM 11220910000063, dari Program Studi Teknik Informatika, Universitas Islam Negeri Syarif Hidayatullah Jakarta.

Pada kesempatan ini, saya akan mempresentasikan proposal penelitian saya yang berjudul "Optimalisasi Gas dan Keamanan Smart Contract Bridge Berbasis EIP-1153 Transient Storage pada Arsitektur 4-Tier."

---

## SLIDE 2: LATAR BELAKANG (1,5 menit)

Bapak/Ibu yang saya hormati,

Blockchain bridge itu seperti jembatan penghubung antardesa. Tanpa jembatan, penduduk di dua desa yang terpisah sungai tidak bisa saling berkunjung. Begitu juga dengan blockchain, bridge memungkinkan transfer aset dari satu jaringan ke jaringan lainnya.

Tapi, seperti jembatan yang kurang kokoh, bridge juga rentan runtuh. Ronin Bridge kehilangan 620 juta dolar, Wormhole Bridge 320 juta dolar, dan Nomad Bridge 190 juta dolar. Total kerugiannya lebih dari 1 miliar dolar.

Dua serangan yang paling berbahaya adalah reentrancy attack dan MEV sandwich attack. Reentrancy itu seperti orang yang mondar-mandir di pintu keluar supermarket, mengambil barang berkali-kali sebelum sempat membayar. Sedangkan MEV sandwich itu seperti bot yang memotong antrian di kasir.

Masalahnya, untuk melindungi bridge dari serangan ini butuh mekanisme keamanan yang mahal. Reentrancy guard konvensional membutuhkan 22.900 gas per transaksi. Bagi bridge dengan volume tinggi, beban ini sangat memberatkan.

Tapi untungnya, Ethereum punya solusi. EIP-1153 memperkenalkan TSTORE dan TLOAD yang hanya butuh 100 gas per operasi. Penghematannya mencapai 98,7 persen.

---

## SLIDE 3: MASALAH & GAP (1 menit)

Setelah ditelusuri, masih ada celah yang belum tertutupi.

Penelitian oleh Zhang dan Debono (2024) menemukan bahwa lebih dari 50 persen kontrak yang sudah pakai EIP-1153 hanya menggunakannya untuk reentrancy guard saja. Padahal, potensi EIP-1153 jauh lebih besar.

Selain itu, banyak pengembang yang menerapkan keamanan melalui external calls ke kontrak terpisah. Ironis, karena pendekatan ini justru menambah biaya gas yang tidak sedikit, padahal tujuan awalnya adalah untuk menghemat.

Belum ada penelitian yang secara spesifik menggabungkan optimasi gas statis dan dinamis secara inline dalam satu arsitektur bridge.

---

## SLIDE 4: METODOLOGI (1,5 menit)

Untuk mengatasi masalah tersebut, saya menggunakan pendekatan studi komparatif kuantitatif.

Saya merancang empat tingkat arsitektur bridge yang saya sebut 4-Tier Architecture.

Tier A adalah baseline tanpa optimasi sama sekali. Tier A merepresentasikan kondisi bridge yang berjalan di Ethereum saat ini tanpa optimasi gas maupun fitur keamanan.

Tier B menggunakan optimasi statis berupa CEI Pattern, variable packing, dan custom errors. Gas-nya rendah namun hanya memiliki 2 dari 8 fitur keamanan.

Tier C menggunakan EIP-1153 transient storage secara penuh melalui kontrak terpisah bernama MonitorMock. Skor keamanannya penuh 8 dari 8, namun gas-nya sangat tinggi karena banyak external calls.

Tier D adalah kontribusi utama penelitian ini. Tier D menggunakan inline dynamic defense, yaitu memindahkan seluruh fitur keamanan Tier C ke dalam kode kontrak utama tanpa external calls. Tier D mencapai skor keamanan 8 dari 8 dengan gas yang jauh lebih rendah dari Tier C.

---

## SLIDE 5: KONTRIBUSI TIER D (1,5 menit)

Inovasi utama dari Tier D adalah pendekatan inline.

Jika dibandingkan dengan Tier C yang memerlukan minimal 5 external calls ke MonitorMock untuk setiap transaksi, Tier D hanya memerlukan 0 external calls. Seluruh logika keamanan diimplementasikan menggunakan inline assembly dengan opcode TSTORE dan TLOAD.

Keunggulan pendekatan inline ini adalah eliminasi risiko cross-contract reentrancy, pengurangan gas overhead dari external calls, serta attack surface yang lebih sempit karena hanya satu kontrak yang perlu di-deploy dan di-audit.

Tier D membuktikan bahwa konsolidasi semua logika keamanan secara inline dapat menghasilkan keamanan yang setara dengan biaya yang jauh lebih rendah.

---

## SLIDE 6: HASIL & VALIDASI (2 menit)

Hasil pengukuran gas menunjukkan bahwa Tier D memiliki efisiensi gas yang jauh lebih baik dibandingkan Tier C.

Untuk operasi deposit, Tier D memerlukan 103.652 gas dibandingkan Tier C yang memerlukan 173.461 gas. Penghematan sebesar 40 persen.

Untuk operasi withdraw, Tier D memerlukan 44.188 gas dibandingkan Tier C yang memerlukan 140.237 gas. Penghematan mencapai 76 persen.

Untuk operasi swap, Tier D memerlukan 84.134 gas dibandingkan Tier C yang memerlukan 154.581 gas. Penghematan sebesar 54 persen.

Validasi statistik menggunakan Welch's t-test menunjukkan p-value sebesar 2,25 kali 10 pangkat minus 222. Angka ini jauh lebih kecil dari threshold 0,05, sehingga perbedaan gas antara Tier C dan Tier D sangat signifikan secara statistik.

Metrik SPG (Security Points per Gas) menunjukkan bahwa Tier D memiliki SPG sebesar 220,1, sedangkan Tier C hanya 65,2. Artinya, Tier D 3,15 kali lebih efisien dalam mengubah biaya gas menjadi perlindungan keamanan.

Seluruh klaim di atas sudah diverifikasi melalui 216 test Foundry yang semuanya PASS, dengan coverage 88,86 persen dan 0 critical vulnerability dari Slither static analysis.

---

## SLIDE 7: PENUTUP (1 menit)

Berdasarkan seluruh hasil penelitian ini, dapat disimpulkan bahwa Tier D merupakan solusi paling optimal yang menggabungkan keamanan maksimal dengan biaya gas yang sangat rendah melalui modifikasi EIP-1153 secara inline.

Kontribusi utama penelitian ini adalah membuktikan bahwa EIP-1153 bisa dimodifikasi dari fungsi tunggal reentrancy guard menjadi platform keamanan multifungsi yang mencakup lima mekanisme pertahanan.

Saran untuk pengembangan selanjutnya adalah integrasi formal verification menggunakan Halmos atau Certora, pengembangan multi-pattern MEV detection, serta pengujian pada multi-chain testnet seperti Sepolia atau Arbitrum.

Sekian presentasi dari saya. Terima kasih atas perhatiannya.

Wassalamualaikum warahmatullahi wabarakatuh.

---

## RINGKASAN WAKTU

| Slide | Judul | Durasi |
|-------|-------|--------|
| 1 | Pembukaan | 0,5 menit |
| 2 | Latar Belakang | 1,5 menit |
| 3 | Masalah & Gap | 1 menit |
| 4 | Metodologi | 1,5 menit |
| 5 | Kontribusi Tier D | 1,5 menit |
| 6 | Hasil & Validasi | 2 menit |
| 7 | Penutup | 1 menit |
| **Total** | | **9 menit** |
| **Sisa** | Q&A | **1 menit** |
