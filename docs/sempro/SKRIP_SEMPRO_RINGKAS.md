# RINGKASAN SKRIP UNTUK PPT (7 Slide)

---

## SLIDE 1: JUDUL

**Judul:**
Optimalisasi Gas dan Keamanan Smart Contract Bridge Berbasis EIP-1153 Transient Storage pada Arsitektur 4-Tier

**Oleh:**
Razy Al Farizy
NIM: 11220910000063
Program Studi Teknik Informatika
Universitas Islam Negeri Syarif Hidayatullah Jakarta

---

## SLIDE 2: LATAR BELAKANG

**Konteks:**
Decentralized Finance (DeFi) merupakan sistem keuangan yang beroperasi tanpa perantara (Buterin, 2014). Dalam ekosistem ini, bridge blockchain berfungsi seperti jembatan penghubung antardesa yang memungkinkan transfer aset antar jaringan (Adams et al., 2021).

**Data Kerugian:**
- Ronin Bridge: $620 juta
- Wormhole Bridge: $320 juta
- Nomad Bridge: $190 juta
- Total: > $1 miliar (Trail of Bits, 2022)

**Dua Serangan Utama:**

*Reentrancy Attack*
Penyerang memanggil fungsi withdraw secara berulang sebelum saldo diperbarui. Analoginya seperti orang yang mondar-mandir di pintu keluar supermarket mengambil barang berkali-kali sebelum membayar (Samreen dan Alalfi, 2020).

*MEV Sandwich Attack*
Bot memanipulasi urutan transaksi di mempool. Analoginya seperti orang yang memotong antrian di kasir (Daian et al., 2020).

**Dilema:**
Mekanisme keamanan konvensional menggunakan SSTORE membutuhkan 22.900 gas per transaksi (OpenZeppelin, 2024). Bagi bridge dengan volume tinggi, beban ini sangat memberatkan (Di Sorbo et al., 2022). Pengembang dihadapkan pada pilihan sulit antara keamanan dan efisiensi gas.

**Solusi:**
Ethereum merancang sistem penyimpanan sementara yang disebut transient storage melalui EIP-1153. Sistem ini memperkenalkan dua instruksi baru: TSTORE dan TLOAD yang hanya membutuhkan 100 gas per operasi. Setelah melalui proses diskusi dan pengembangan yang cukup panjang sejak diusulkan pada tahun 2021, EIP-1153 akhirnya diresmikan dan diaktifkan di Fork Cancun pada bulan Maret 2024. Keunggulan utamanya adalah data di transient storage otomatis ter-reset di akhir transaksi tanpa memerlukan biaya tambahan. Penghematan yang ditawarkan mencapai 98,7 persen dibandingkan SSTORE konvensional.

---

## SLIDE 3: IDENTIFIKASI MASALAH

**Permasalahan:**

1. Mekanisme keamanan konvensional menggunakan SSTORE membutuhkan 22.900 gas per transaksi, memberatkan operasional bridge dengan volume tinggi (OpenZeppelin, 2024).

2. Implementasi keamanan berbasis EIP-1153 yang ada masih menggunakan external calls ke kontrak terpisah, menambah biaya gas overhead (Benedetti et al., 2024).

3. EIP-1153 belum dimanfaatkan secara optimal. Berdasarkan Zhang dan Debono (2024), lebih dari 50 persen kontrak hanya menggunakannya untuk reentrancy guard saja.

4. Belum ada framework komparatif yang secara sistematis membandingkan berbagai tingkat optimasi gas dan keamanan dalam satu arsitektur bridge (Benedetti et al., 2024).

**Rumusan Masalah:**
Bagaimana mengoptimalkan biaya gas pada smart contract bridge melalui implementasi optimasi statis dan dinamis berbasis EIP-1153 transient storage?

---

## SLIDE 4: PENELITIAN TERDAHULU

**Zhang & Debono (2024)**
Menganalisis lebih dari 250 kontrak yang sudah mengadopsi EIP-1153. Hasilnya: lebih dari 50 persen hanya menggunakannya untuk reentrancy guard saja. Potensi yang belum tergarap masih sangat besar.

**Chainsecurity (2023)**
Menunjukkan bahwa TSTORE tidak punya batas gas minimum seperti SSTORE. Mekanisme keamanan lama perlu dievaluasi ulang.

**Di Sorbo et al. (2022)**
Mengidentifikasi 19 code smells pada Solidity yang menyebabkan kontrak menjadi boros gas. Temuan ini menunjukkan masih banyaknya pemborosan gas yang tidak disadari pengembang.

**Gap Penelitian:**
Belum ada penelitian yang secara spesifik menggabungkan optimasi gas statis dan dinamis secara inline dalam satu arsitektur bridge dengan pengukuran cost-effectiveness menggunakan metrik SPG (Benedetti et al., 2024).

---

## SLIDE 5: METODOLOGI

**Pendekatan:**
Studi komparatif kuantitatif dengan empirical design (Park et al., 2024).

**4-Tier Architecture:**

*Tier A (UnoptimizedBridge)*
Baseline tanpa optimasi sama sekali. Gas rendah, skor keamanan 0 dari 8 fitur.

*Tier B (BridgeStaticOnly)*
Optimasi statis saja: CEI Pattern, variable packing, custom errors (Di Sorbo et al., 2022). Gas rendah, skor keamanan 2 dari 8 fitur.

*Tier C (VictimBridge)*
Full dynamic: EIP-1153 + MonitorMock via external calls. Gas sangat tinggi, skor keamanan penuh 8 dari 8 fitur.

*Tier D (LightweightBridge)*
Inline dynamic: kontribusi utama penelitian. Gas rendah, skor keamanan penuh 8 dari 8 fitur.

**Pengukuran:**
- Framework: Foundry dengan EVM Cancun
- Sampel: 100 per operasi berdasarkan Central Limit Theorem (Cochran, 1977)
- Operasi: deposit, withdraw, swap

**Validasi Statistik:**
- Welch's t-test: Membandingkan signifikansi gas antara Tier C dan Tier D (Welch, 1947)
- Cohen's d: Mengukur effect size atau besarnya perbedaan (Cohen, 1988)

**Metrik:**
SPG (Security Points per Gas) = (Skor Keamanan / Gas Deposit) x 1.000.000 (Benedetti et al., 2024)

---

## SLIDE 6: MANFAAT PENELITIAN

**Bagi Penulis:**
- Sarana implementasi ilmu perkuliahan
- Peningkatan pemahaman EIP-1153 transient storage
- Pengalaman riset blockchain

**Bagi Universitas:**
- Referensi dan kontribusi ilmiah
- Pengembangan riset blockchain di lingkungan kampus

**Bagi Pengembang dan Peneliti:**
- Panduan optimasi gas smart contract
- Referensi keamanan bridge
- Dasar penelitian selanjutnya

---

## SLIDE 7: PENUTUP

**Ringkasan:**
Penelitian ini bertujuan untuk mengoptimalkan biaya gas dan keamanan smart contract bridge melalui implementasi EIP-1153 transient storage pada arsitektur 4-tier dengan menggunakan pendekatan studi komparatif kuantitatif.

**Harapan:**
Proposal ini dapat diterima untuk dilanjutkan ke tahap penelitian selanjutnya, yaitu implementasi, pengukuran, dan validasi empiris.

**Terima kasih atas perhatian Bapak/Ibu Dosen.**

---

## DAFTAR PUSTAKA

- Adams, H. et al. (2021). Uniswap V3 Core. Uniswap Foundation.
- Benedetti, M. et al. (2024). Gas Cost Analysis of EIP-1153 Transient Storage. arXiv.
- Benedetti, A. et al. (2024). A Comparative Gas Cost Analysis of Proxy and Diamond Patterns. IEEE.
- Buterin, V. (2014). Ethereum Whitepaper. Ethereum Foundation.
- Chainsecurity. (2023). TSTORE Low Gas Reentrancy. ChainSecurity Blog.
- Cochran, W. G. (1977). Sampling Techniques. Wiley.
- Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences. Lawrence Erlbaum.
- Daian, P. et al. (2020). Flash Boys 2.0. Proc. IEEE Symposium on Security and Privacy.
- Di Sorbo, A. et al. (2022). Profiling Gas Consumption in Solidity. Proc. IEEE ICSME.
- EIP-1153. (2021). Transient Storage Opcodes. Ethereum Improvement Proposals.
- OpenZeppelin. (2024). Transient Storage Security Model. OpenZeppelin Documentation.
- Park, S. et al. (2024). Impact of EIP-4844 on Ethereum. Seoul National University.
- Qin, K. et al. (2021). Quantifying Blockchain Extractable Value. arXiv.
- Samreen, N. F. dan Alalfi, M. H. (2020). Reentrancy Vulnerability Identification. Proc. IEEE ICSME.
- Solidity Blog. (2024). Transient Storage in Solidity. Solidity Programming Language.
- Trail of Bits. (2022). Wormhole Bridge Security Report. trailofbits.com.
- Welch, B. L. (1947). The Generalization of Student's Problem when Several Different Variances Are Involved. Biometrika.
- Zhang, A. dan Debono, M. (2024). Transient Storage in the wild. Dedaub.

---

## CATATAN UNTUK PPT

- **Slide 1:** Judul + identitas (tambah foto/logo)
- **Slide 2:** Gunakan infografis untuk angka kerugian
- **Slide 3:** Gunakan bullet points dengan numbering
- **Slide 4:** Gunakan bullet points per peneliti
- **Slide 5:** Gunakan bullet points per tier
- **Slide 6:** Gunakan 3 kolom dengan ikon
- **Slide 7:** Kesimpulan singkat + terima kasih
