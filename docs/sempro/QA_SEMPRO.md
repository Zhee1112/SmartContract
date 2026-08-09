# PREDIKSI PERTANYAAN & JAWABAN SEMINAR PROPOSAL

## Kategori A: Pertanyaan Umum (Dosen Belum Awam)

### 1. Apa itu blockchain?

**Jawaban:** Blockchain itu seperti buku besar digital yang bisa dilihat oleh semua orang tapi tidak bisa diubah. Semua transaksi tercatat secara transparan dan permanen.

### 2. Apa itu smart contract?

**Jawaban:** Smart contract itu kontrak otomatis berupa kode komputer. Jika kondisi yang ditentukan terpenuhi, kode langsung dieksekusi tanpa perlu perantara.

### 3. Apa itu DeFi?

**Jawaban:** DeFi adalah keuangan tanpa bank. Semua transaksi dilakukan langsung antar pengguna, tanpa melalui lembaga keuangan konvensional.

### 4. Apa itu bridge?

**Jawaban:** Bridge itu jembatan penghubung antar blockchain. Bridge memungkinkan transfer aset dari satu jaringan ke jaringan lainnya, misalnya dari Ethereum ke Arbitrum.

### 5. Kenapa bridge penting?

**Jawaban:** Karena banyak blockchain yang tidak saling terhubung secara native. Tanpa bridge, aset di satu blockchain tidak bisa dipindahkan ke blockchain lain.

### 6. Apa itu gas?

**Jawaban:** Gas itu biaya transaksi di Ethereum. Setiap operasi di blockchain membutuhkan biaya yang dibayarkan dalam bentuk gas.

### 7. Apa itu reentrancy?

**Jawaban:** Reentrancy itu serangan di mana penyerang memanggil fungsi withdraw secara berulang kali sebelum saldo benar-benar diperbarui. Seperti orang yang mondar-mandir di pintu keluar supermarket, mengambil barang berkali-kali sebelum sempat membayar.

### 8. Apa itu MEV?

**Jawaban:** MEV adalah Maximum Extractable Value. Ini adalah keuntungan yang bisa didapat dari manipulasi urutan transaksi di mempool. Contohnya, bot yang memotong antrian di kasir.

### 9. Bedanya EIP-1153 dengan SSTORE?

**Jawaban:** EIP-1153 menggunakan TSTORE yang hanya butuh 100 gas per operasi. Sedangkan SSTORE konvensional membutuhkan 20.000 gas. Penghematannya mencapai 98,7 persen.

### 10. Apa yang dibuat dalam penelitian ini?

**Jawaban:** Saya membuat 4 versi bridge dengan tingkat optimasi yang berbeda, lalu membandingkan gas dan keamanannya. Tujuannya untuk menemukan konfigurasi paling efisien.

---

## Kategori B: Pertanyaan Teknis (Dosen Awam)

### 1. Bagaimana TSTORE mencegah reentrancy?

**Jawaban:** TSTORE menulis nilai ke slot transient yang otomatis ter-reset di akhir transaksi. Jika reentrancy terjadi, TLOAD akan mendeteksi bahwa lock sudah aktif dan transaksi akan ditolak.

### 2. Mengapa menggunakan inline assembly?

**Jawaban:** Karena opcode TSTORE dan TLOAD belum tersedia di Solidity high-level. Untuk mengakses fitur ini, kita harus menggunakan inline assembly.

### 3. Apa bedanya Tier C dan Tier D?

**Jawaban:** Tier C menggunakan external calls ke kontrak terpisah (MonitorMock) untuk fitur keamanan. Tier D memindahkan semua fitur keamanan ke dalam kontrak utama secara inline, sehingga tidak ada external calls.

### 4. Bagaimana MEV sandwich dideteksi?

**Jawaban:** Saya menggunakan single-slot LastTx struct yang menyimpan informasi transaksi sebelumnya. Jika terdeteksi pola frontrun-victim dalam blok yang sama, transaksi akan ditandai sebagai mencurigakan.

### 5. Apa itu SPG?

**Jawaban:** SPG adalah Security Points per Gas. Rumusnya: (Skor Keamanan / Gas Deposit) x 1.000.000. Makin tinggi nilainya, makin efisien bridge tersebut dalam mengubah biaya gas menjadi keamanan.

### 6. Bagaimana validasi statistik dilakukan?

**Jawaban:** Saya menggunakan Welch's t-test untuk menentukan signifikansi perbedaan gas antara Tier C dan Tier D. Serta Cohen's d untuk mengukur effect size atau besarnya perbedaan.

### 7. Mengapa menggunakan Welch's t-test bukan t-test biasa?

**Jawaban:** Karena Welch's t-test tidak memerlukan asumsi homogenitas variansi. Ini lebih robust dan cocok untuk data yang variansinya berbeda antar grup.

### 8. Apa itu fuzz testing?

**Jawaban:** Fuzz testing adalah property-based testing dengan input acak. Tujuannya untuk menemukan edge cases atau kondisi batas yang mungkin terlewatkan oleh test biasa.

### 9. Bagaimana economic penalty dihitung?

**Jawaban:** Rumusnya: Penalty = Amount x (Lambda x P_detect / 100.000.000). Lambda adalah faktor penalti risiko (15.000 = 1,5), P_detect adalah probabilitas deteksi (9.600 = 96%).

### 10. Apa yang terjadi jika serangan terdeteksi?

**Jawaban:** Penyerang akan dikenai penalti ekonomi secara otomatis sebesar 14,4 persen dari jumlah transaksi. Penalti ini membuat serangan menjadi tidak menguntungkan secara ekonomi.

---

## Kategori C: Pertanyaan Metodologi

### 1. Mengapa menggunakan 100 sampel?

**Jawaban:** Berdasarkan Central Limit Theorem, distribusi mean akan mendekati normal untuk n >= 30. Jumlah 100 sampel memberikan akurasi yang lebih tinggi untuk pengukuran gas.

### 2. Bagaimana gas diukur?

**Jawaban:** Gas diukur menggunakan forge test --gas-report pada environment EVM simulasi. Setiap operasi diukur 100 kali untuk mendapatkan statistik yang akurat.

### 3. Apakah simulasi sama dengan production?

**Jawaban:** Tidak sama persis, tapi cukup representatif untuk perbandingan relatif. Yang penting adalah perbandingan antar tier, bukan nilai absolutnya.

### 4. Mengapa hanya 3 operasi yang diuji?

**Jawaban:** Deposit, withdraw, dan swap adalah operasi utama bridge. Ketiga operasi ini paling representatif untuk mengukur kinerja bridge.

### 5. Mengapa menggunakan Foundry bukan Hardhat?

**Jawaban:** Foundry memiliki keunggulan dalam kecepatan dan fitur fuzz testing bawaan. Selain itu, Foundry lebih cocok untuk pengukuran gas yang akurat.

### 6. Bagaimana dengan deployment cost?

**Jawaban:** Tier D membutuhkan 829.116 gas untuk deploy, sedangkan Tier C membutuhkan 971.051 gas. Tier D lebih ringan karena tidak ada kontrak terpisah.

### 7. Apakah 216 test sudah cukup?

**Jawaban:** Cukup. 216 test mencakup 10 metode pengujian berbeda dengan coverage 88,86 persen untuk line dan 98,04 persen untuk fungsi.

### 8. Apakah sudah diuji di testnet?

**Jawaban:** Belum, ini menjadi rencana pengembangan selanjutnya. Pengujian akan dilakukan di Sepolia atau Arbitrum testnet.

---

## Kategori D: Pertanyaan Hasil

### 1. Berapa penghematan gas Tier D vs Tier C?

**Jawaban:** Deposit: 40 persen, Withdraw: 76 persen, Swap: 54 persen. Rata-rata penghematan sekitar 57 persen.

### 2. Apakah hasilnya signifikan?

**Jawaban:** Ya, sangat signifikan. P-value sebesar 2,25 kali 10 pangkat minus 222, jauh lebih kecil dari threshold 0,05.

### 3. Apa arti Cohen's d = 220,64?

**Jawaban:** Effect size yang sangat besar. Artinya, distribusi gas Tier C dan Tier D sama sekali tidak tumpang tindih. Seluruh sampel Tier D memiliki gas yang lebih rendah dari Tier C.

### 4. Mengapa Tier D lebih hemat dari Tier C?

**Jawaban:** Karena Tier D tidak menggunakan external calls. Semua logika keamanan di-inline di dalam kontrak utama, sehingga tidak ada overhead gas dari panggilan antar kontrak.

### 5. Apakah Tier D bisa dipakai di production?

**Jawaban:** Bisa, tapi perlu beberapa tahap lagi. Formal verification untuk membuktikan kebenaran kode, dan audit keamanan dari pihak ketiga.

### 6. Bagaimana dengan scalability?

**Jawaban:** Tier D lebih scalable karena tidak ada dependency ke kontrak lain. Cukup deploy satu kontrak, semua fitur keamanan sudah terintegrasi.

### 7. Apakah ada kelemahan Tier D?

**Jawaban:** Code size lebih besar karena semua logika di-inline. Selain itu, upgrade lebih sulit karena semua kode ada di satu kontrak.

### 8. Berapa SPG Tier D?

**Jawaban:** 220,1. Sedangkan Tier C hanya 65,2. Artinya, Tier D 3,15 kali lebih efisien dalam mengubah biaya gas menjadi perlindungan keamanan.

### 9. Apakah ada manfaat ekonomi?

**Jawaban:** Untuk bridge dengan 100.000 transaksi per bulan, penghematan biaya operasional mencapai 79.000 hingga 213.000 dolar per bulan.

### 10. Bagaimana dengan keamanan Tier D?

**Jawaban:** Tier D mencapai skor keamanan penuh 8 dari 8 fitur. Slither static analysis menunjukkan 0 critical vulnerability.

---

## Kategori E: Pertanyaan Kritis/Trik

### 1. Apakah ini hanya mengulang penelitian OpenZeppelin?

**Jawaban:** Tidak. OpenZeppelin hanya mengimplementasikan reentrancy guard menggunakan EIP-1153. Penelitian ini mengembangkan 5 mekanisme keamanan sekaligus secara inline: reentrancy guard, MEV detection, economic penalty, emergency pause, dan block tracking.

### 2. Apakah EIP-1153 sudah di-production?

**Jawaban:** Sudah. EIP-1153 diaktifkan di Fork Cancun pada bulan April 2024. Saat ini sudah banyak kontrak yang mengadopsi fitur ini.

### 3. Mengapa tidak menggunakan SSTORE2?

**Jawaban:** SSTORE2 dirancang untuk menyimpan data yang sangat besar. Untuk reentrancy guard yang hanya membutuhkan satu slot, TSTORE jauh lebih efisien.

### 4. Apakah ada risiko keamanan dari inline assembly?

**Jawaban:** Ada potensi risiko, tapi sudah diverifikasi menggunakan Slither static analysis yang menunjukkan 0 critical vulnerability. Selain itu, 216 test cases sudah membuktikan bahwa semua fitur keamanan bekerja dengan benar.

### 5. Bagaimana jika EIP-1153 di-deprecate di masa depan?

**Jawaban:** Kemungkinan kecil karena EIP-1153 sudah final di Cancun fork. Namun, jika terjadi perubahan, kode bisa di-migrate ke mekanisme baru.

### 6. Apakah ini hanya teori atau sudah diuji?

**Jawaban:** Sudah diuji secara empiris dengan 216 test cases yang semuanya PASS. Pengujian meliputi unit test, integration test, fuzz testing, invariant testing, dan attack simulation.

### 7. Mengapa tidak langsung deploy ke mainnet?

**Jawaban:** Deploy ke mainnet membutuhkan keamanan yang sangat ketat. Diperlukan formal verification dan audit keamanan dari pihak ketiga sebelum bisa digunakan secara production.

### 8. Apakah ada penelitian kompetitor yang serupa?

**Jawaban:** Belum ada yang secara spesifik menggabungkan optimasi gas statis dan dinamis secara inline dalam satu arsitektur bridge dengan pengukuran cost-effectiveness menggunakan metrik SPG.

### 9. Bagaimana dengan volatilitas gas?

**Jawaban:** Pengukuran dilakukan dalam environment terkontrol menggunakan Foundry. Hasilnya relatif stabil karena tidak dipengaruhi oleh kondisi jaringan yang berubah-ubah.

### 10. Apa kontribusi utama penelitian ini?

**Jawaban:** Membuktikan bahwa EIP-1153 bisa dimodifikasi dari fungsi tunggal reentrancy guard menjadi platform keamanan multifungsi yang mencakup lima mekanisme pertahanan dengan biaya gas yang jauh lebih rendah.

---

## Kategori F: Pertanyaan yang Perlu Dijawab dengan Hati-hati

### 1. "Mengapa tidak menggunakan formal verification?"

**Jawaban:** Formal verification memang sangat penting untuk keamanan smart contract. Saat ini saya masih dalam tahap pengembangan prototype. Formal verification using Halmos atau Certora menjadi rencana pengembangan selanjutnya setelah proposal ini disetujui.

### 2. "Apakah sudah diuji di testnet?"

**Jawaban:** Belum, ini memang menjadi keterbatasan penelitian saat ini. Pengujian di testnet seperti Sepolia atau Arbitrum menjadi rencana pengembangan selanjutnya untuk memvalidasi kinerja di lingkungan yang lebih realistis.

### 3. "Bagaimana dengan overhead deployment?"

**Jawaban:** Tier D membutuhkan 829.116 gas untuk deploy, sedangkan Tier C membutuhkan 971.051 gas. Artinya, Tier D lebih ringan sekitar 14,6 persen dari Tier C karena tidak ada kontrak terpisah.

### 4. "Apakah ada bias dalam pengukuran?"

**Jawaban:** Pengukuran menggunakan 100 sampel per operasi berdasarkan Central Limit Theorem. Environment simulasi menggunakan Foundry dengan EVM Cancun yang standar. Meskipun ada perbedaan dengan production, perbandingan antar tier tetap valid.

### 5. "Mengapa tidak menggunakan Hardhat?"

**Jawaban:** Foundry dipilih karena memiliki keunggulan dalam kecepatan eksekusi dan fitur fuzz testing bawaan. Selain itu, Foundry lebih cocok untuk pengukuran gas yang akurat karena menggunakan EVM simulasi langsung.

---

## TIPS MENJAWAB PERTANYAAN

1. **Dengarkan pertanyaan dengan seksama** sebelum menjawab
2. **Jawab secara singkat dan langsung** pada inti pertanyaan
3. **Gunakan analogi** untuk menjelaskan konsep teknis kepada dosen yang belum awam
4. **Akui keterbatasan** dengan jujur dan sebutkan rencana pengembangan
5. **Tunjukkan data** untuk memperkuat jawaban (angka, statistik, test results)
6. **Tetap tenang** jika ditanya pertanyaan yang sulit
7. **Siapkan backup data** dari EVIDENCE_TEST.md jika diperlukan
