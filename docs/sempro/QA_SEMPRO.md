# PREDIKSI PERTANYAAN & JAWABAN SEMINAR PROPOSAL

## Kategori A: Pertanyaan Umum (Dosen Belum Awam)

### 1. Apa itu blockchain?

**Jawaban:** Blockchain adalah buku besar digital terdistribusi yang mencatat semua transaksi secara transparan dan tidak bisa diubah. Semua peserta jaringan bisa melihat data yang sama tanpa memerlukan perantara.

### 2. Apa itu smart contract?

**Jawaban:** Smart contract adalah kontrak otomatis berupa kode komputer yang dieksekusi ketika kondisi yang ditentukan terpenuhi. Tidak memerlukan perantara untuk menjalankannya.

### 3. Apa itu DeFi?

**Jawaban:** DeFi adalah sistem keuangan yang beroperasi tanpa bank atau lembaga keuangan konvensional. Semua transaksi dilakukan langsung antar pengguna melalui smart contract.

### 4. Apa itu bridge?

**Jawaban:** Bridge adalah jembatan penghubung antar blockchain. Seperti jembatan penghubung antardesa yang memungkinkan penduduk berpindah dari satu desa ke desa lain, bridge memungkinkan transfer aset dari satu jaringan ke jaringan lainnya.

### 5. Kenapa bridge penting?

**Jawaban:** Karena banyak blockchain yang tidak saling terhubung secara native. Tanpa bridge, aset di satu blockchain tidak bisa dipindahkan ke blockchain lain.

### 6. Apa itu gas?

**Jawaban:** Gas adalah biaya transaksi di Ethereum. Setiap operasi di blockchain membutuhkan biaya yang diukur dalam satuan gas.

### 7. Apa itu reentrancy?

**Jawaban:** Reentrancy adalah serangan di mana penyerang memanggil fungsi withdraw secara berulang kali sebelum saldo benar-benar diperbarui. Bayangkan seperti orang yang mondar-mandir di pintu keluar supermarket, mengambil barang berkali-kali sebelum sempat membayar.

### 8. Apa itu MEV?

**Jawaban:** MEV adalah Maximum Extractable Value, yaitu keuntungan yang bisa didapat dari manipulasi urutan transaksi. Analoginya seperti bot yang berdiri di antara transaksi Anda dan tujuannya, lalu memanfaatkan urutan transaksi untuk mengambil keuntungan dari selisih harga. Seperti ada orang yang memotong antrian di kasir.

### 9. Bedanya EIP-1153 dengan SSTORE?

**Jawaban:** EIP-1153 menggunakan TSTORE yang hanya butuh 100 gas per operasi. Data di transient storage otomatis ter-reset di akhir transaksi, jadi tidak perlu membersihkan secara manual. Sedangkan SSTORE konvensional membutuhkan 20.000 gas. Penghematannya mencapai 98,7 persen.

### 10. Apa yang akan dibuat dalam penelitian ini?

**Jawaban:** Penelitian ini akan membuat 4 versi bridge dengan tingkat optimasi yang berbeda, lalu membandingkan gas dan keamanannya untuk menemukan konfigurasi paling efisien.

---

## Kategori B: Pertanyaan Teknis (Dosen Awam)

### 1. Bagaimana TSTORE mencegah reentrancy?

**Jawaban:** TSTORE menulis nilai ke slot transient yang otomatis ter-reset di akhir transaksi. Jika reentrancy terjadi, TLOAD akan mendeteksi bahwa lock sudah aktif dan transaksi akan ditolak.

### 2. Mengapa menggunakan inline assembly?

**Jawaban:** Karena opcode TSTORE dan TLOAD belum tersedia di Solidity high-level. Untuk mengakses fitur ini, implementasi harus menggunakan inline assembly.

### 3. Apa bedanya Tier C dan Tier D?

**Jawaban:** Tier C menggunakan external calls ke kontrak terpisah (MonitorMock) untuk fitur keamanan. Tier D memindahkan semua fitur keamanan ke dalam kontrak utama secara inline, sehingga tidak ada external calls.

### 4. Bagaimana MEV sandwich dideteksi?

**Jawaban:** Menggunakan single-slot LastTx struct yang menyimpan informasi transaksi sebelumnya. Jika terdeteksi pola frontrun-victim dalam blok yang sama, transaksi akan ditandai sebagai mencurigakan.

### 5. Apa itu SPG?

**Jawaban:** SPG adalah Security Points per Gas, yaitu metrik untuk mengukur efisiensi bridge dalam mengubah biaya gas menjadi keamanan. Rumusnya: (Skor Keamanan / Gas Deposit) x 1.000.000.

### 6. Bagaimana validasi statistik dilakukan?

**Jawaban:** Menggunakan Welch's t-test untuk menentukan signifikansi perbedaan gas antar tier, serta Cohen's d untuk mengukur effect size atau besarnya perbedaan.

### 7. Mengapa menggunakan Welch's t-test?

**Jawaban:** Karena Welch's t-test tidak memerlukan asumsi homogenitas variansi. Lebih robust dan cocok untuk data dengan variansi yang berbeda antar grup.

### 8. Apa itu fuzz testing?

**Jawaban:** Fuzz testing adalah property-based testing dengan input acak. Tujuannya untuk menemukan edge cases atau kondisi batas yang mungkin terlewatkan.

### 9. Bagaimana economic penalty dihitung?

**Jawaban:** Rumusnya: Penalty = Amount x (Lambda x P_detect / 100.000.000). Lambda adalah faktor penalti risiko, P_detect adalah probabilitas deteksi.

### 10. Mengapa memilih 4 tier?

**Jawaban:** Empat tier merepresentasikan spektrum optimasi dari yang paling dasar (tanpa optimasi) hingga yang paling canggih (inline dynamic). Memungkinkan perbandingan yang komprehensif.

---

## Kategori C: Pertanyaan Metodologi

### 1. Mengapa menggunakan 100 sampel?

**Jawaban:** Berdasarkan Central Limit Theorem, distribusi mean akan mendekati normal untuk n >= 30. Jumlah 100 sampel memberikan akurasi yang lebih tinggi dan confidence interval yang lebih sempit.

### 2. Bagaimana gas diukur?

**Jawaban:** Gas diukur menggunakan forge test --gas-report pada environment EVM simulasi dengan Foundry. Setiap operasi diukur 100 kali untuk mendapatkan statistik yang akurat.

### 3. Apakah simulasi sama dengan production?

**Jawaban:** Tidak sama persis, tapi cukup representatif untuk perbandingan relatif antar tier. Yang penting adalah konsistensi pengukuran dalam environment yang sama.

### 4. Mengapa hanya 3 operasi yang diuji?

**Jawaban:** Deposit, withdraw, dan swap adalah operasi utama bridge yang paling representatif untuk mengukur kinerja dan keamanan smart contract bridge.

### 5. Mengapa menggunakan Foundry?

**Jawaban:** Foundry memiliki keunggulan dalam kecepatan eksekusi dan fitur fuzz testing bawaan. Selain itu, Foundry lebih cocok untuk pengukuran gas yang akurat.

### 6. Bagaimana dengan deployment cost?

**Jawaban:** Deployment cost akan diukur untuk setiap tier. Tier D diperkirakan lebih ringan karena tidak ada kontrak terpisah seperti Tier C.

### 7. Berapa jumlah test yang direncanakan?

**Jawaban:** Rencananya lebih dari 200 test cases yang mencakup berbagai metode pengujian: unit test, integration test, fuzz testing, invariant testing, dan attack simulation.

### 8. Apakah sudah ada prototipe?

**Jawaban:** Ya, prototipe 4 kontrak bridge sudah diimplementasikan. Pengujian dan pengukuran akan dilakukan setelah proposal ini disetujui.

---

## Kategori D: Pertanyaan Penelitian Terdahulu

### 1. Siapa saja peneliti yang sudah menulis tentang EIP-1153?

**Jawaban:** Zhang dan Debono (2024) menganalisis adopsi EIP-1153, Chainsecurity (2023) menulis tentang keamanan TSTORE, dan Benedetti et al. (2024) menganalisis gas cost EIP-1153.

### 2. Apa yang menjadi gap dari penelitian sebelumnya?

**Jawaban:** Belum ada penelitian yang menggabungkan optimasi gas statis dan dinamis secara inline dalam satu arsitektur bridge dengan pengukuran cost-effectiveness.

### 3. Apa novelty dari penelitian ini?

**Jawaban:** Implementasi EIP-1153 secara inline untuk 5 mekanisme keamanan sekaligus (bukan hanya reentrancy guard) dalam satu kontrak tanpa external calls.

### 4. Bagaimana penelitian ini berbeda dari OpenZeppelin?

**Jawaban:** OpenZeppelin hanya mengimplementasikan reentrancy guard. Penelitian ini mengembangkan 5 mekanisme keamanan: reentrancy guard, MEV detection, economic penalty, emergency pause, dan block tracking.

### 5. Referensi utama yang digunakan?

**Jawaban:** Zhang & Debono (2024) untuk adopsi EIP-1153, Chainsecurity (2023) untuk keamanan, Di Sorbo et al. (2022) untuk optimasi gas, dan Benedetti et al. (2024) untuk framework komparatif.

---

## Kategori E: Pertanyaan Kritis/Trik

### 1. Apakah penelitian ini hanya mengulang penelitian lain?

**Jawaban:** Tidak. Penelitian ini memiliki novelty dalam pendekatan inline untuk multi-mechanism defense, yang belum ada di penelitian sebelumnya.

### 2. Apakah EIP-1153 sudah stabil?

**Jawaban:** Ya, EIP-1153 sudah diaktifkan di Fork Cancun pada April 2024 dan sudah final di Ethereum.

### 3. Mengapa tidak langsung ke implementasi production?

**Jawaban:** Karena tahapan penelitian yang benar adalah: proposal → implementasi → pengujian → validasi → publikasi. Saat ini masih dalam tahap proposal.

### 4. Apakah ada risiko dari penelitian ini?

**Jawaban:** Risiko utama adalah jika EIP-1153 mengalami perubahan di masa depan. Namun, karena sudah final, risiko ini sangat kecil.

### 5. Bagaimana dengan keterbatasan penelitian?

**Jawaban:** Keterbatasan meliputi: belum formal verification, belum testnet, dan baru simulasi. Semua ini menjadi rencana pengembangan selanjutnya.

---

## Kategori F: Pertanyaan yang Perlu Dijawab dengan Hati-hati

### 1. "Mengapa tidak menggunakan formal verification?"

**Jawaban:** Formal verification memang penting untuk keamanan smart contract. Saat ini masih dalam tahap proposal. Formal verification using Halmos atau Certora menjadi rencana pengembangan selanjutnya.

### 2. "Apakah sudah diuji di testnet?"

**Jawaban:** Belum, ini menjadi rencana pengembangan selanjutnya setelah proposal disetujui. Pengujian akan dilakukan di Sepolia atau Arbitrum testnet.

### 3. "Bagaimana dengan validitas pengukuran?"

**Jawaban:** Pengukuran menggunakan 100 sampel per operasi berdasarkan Central Limit Theorem. Environment simulasi menggunakan Foundry dengan EVM Cancun yang standar.

### 4. "Apakah ada bias dalam penelitian?"

**Jawaban:** Penelitian menggunakan pendekatan komparatif yang mengontrol variabel luar. Semua tier diukur dalam environment yang sama untuk memastikan validitas perbandingan.

### 5. "Mengapa tidak menggunakan Hardhat?"

**Jawaban:** Foundry dipilih karena memiliki keunggulan dalam kecepatan dan fitur fuzz testing bawaan. Selain itu, Foundry lebih cocok untuk pengukuran gas yang akurat.

---

## TIPS MENJAWAB PERTANYAAN

1. **Dengarkan pertanyaan dengan seksama** sebelum menjawab
2. **Jawab secara singkat dan langsung** pada inti pertanyaan
3. **Gunakan analogi** untuk menjelaskan konsep teknis
4. **Akui keterbatasan** dengan jujur dan sebutkan rencana pengembangan
5. **Sebutkan referensi** untuk memperkuat jawaban
6. **Tetap tenang** jika ditanya pertanyaan yang sulit
7. **Siapkan backup data** dari dokumen proposal jika diperlukan
