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

**Apa itu Bridge?**
Bridge blockchain berfungsi seperti jembatan penghubung antardesa. Tanpa jembatan, penduduk di dua desa yang terpisah sungai tidak bisa saling berkunjung. Begitu pula dengan blockchain, bridge memungkinkan transfer aset dari satu jaringan ke jaringan lainnya (Adams et al., 2021).

**Data Kerugian:**
- Ronin Bridge: $620 juta
- Wormhole Bridge: $320 juta
- Nomad Bridge: $190 juta
- Total: > $1 miliar (Trail of Bits, 2022)

**Dua Serangan Utama:**

Reentrancy Attack adalah kondisi di mana penyerang memanggil fungsi withdraw secara berulang kali sebelum saldo diperbarui. Bayangkan seperti orang yang mondar-mandir di pintu keluar supermarket mengambil barang berkali-kali sebelum membayar (Samreen & Alalfi, 2020).

MEV Sandwich Attack melibatkan bot yang memanipulasi urutan transaksi di mempool. Seperti orang yang memotong antrian di kasir (Daian et al., 2020).

**Dilema:**
Mekanisme keamanan konvensional menggunakan SSTORE membutuhkan 22.900 gas per transaksi (OpenZeppelin, 2024). Pengembang dihadapkan pada pilihan sulit antara keamanan dan efisiensi gas.

**Solusi:**
Ethereum merancang sistem transient storage melalui EIP-1153 sejak 2021, diresmikan di Fork Cancun Maret 2024. TSTORE dan TLOAD hanya membutuhkan 100 gas per operasi, penghematan 98,7% dibandingkan SSTORE (EIP-1153, 2021).

---

## SLIDE 3: IDENTIFIKASI MASALAH

**Permasalahan:**

1. SSTORE konvensional membutuhkan 22.900 gas per transaksi, memberatkan bridge dengan volume tinggi (OpenZeppelin, 2024).

2. Implementasi EIP-1153 yang ada masih menggunakan external calls ke kontrak terpisah, menambah biaya gas overhead (Benedetti et al., 2024).

3. Lebih dari 50% kontrak yang mengadopsi EIP-1153 hanya menggunakannya untuk reentrancy guard saja (Zhang & Debono, 2024).

4. Belum ada framework komparatif yang membandingkan berbagai tingkat optimasi gas dan keamanan dalam satu arsitektur bridge.

**Rumusan Masalah:**
Bagaimana mengoptimalkan biaya gas pada smart contract bridge melalui implementasi optimasi statis dan dinamis berbasis EIP-1153 transient storage?

---

## SLIDE 4: PENELITIAN TERDAHULU

**Zhang & Debono (2024)**
Menganalisis lebih dari 250 kontrak EIP-1153. Hasilnya: lebih dari 50 persen hanya untuk reentrancy guard. Potensi belum tergarap masih besar.

**Chainsecurity (2023)**
TSHOW tidak punya batas gas minimum seperti SSTORE. Mekanisme keamanan lama perlu evaluasi ulang.

**Di Sorbo et al. (2022)**
Mengidentifikasi 19 code smells pada Solidity yang menyebabkan kontrak boros gas.

**Gap Penelitian:**
Belum ada yang menggabungkan optimasi gas statis dan dinamis secara inline dalam satu arsitektur bridge dengan pengukuran cost-effectiveness menggunakan metrik SPG (Benedetti et al., 2024).

---

## SLIDE 5: METODOLOGI

**Mengapa 4-Tier?**

4-Tier dirancang untuk merepresentasikan spektrum optimasi dari yang paling dasar hingga yang paling canggih. Setiap tier merepresentasikan kondisi nyata di lapangan dan memiliki paper yang mewakili.

**Tier A: UnoptimizedBridge**
Representasi bridge tanpa optimasi, rentan reentrancy. Mewakili kondisi bridge yang belum dioptimasi seperti yang diidentifikasi oleh Trail of Bits (2022) pada Wormhole Bridge dan Samreen & Alalfi (2020) dalam identifikasi kerentanan reentrancy. Gas rendah, skor keamanan 0 dari 8 fitur.

**Tier B: BridgeStaticOnly**
Representasi bridge dengan optimasi statis saja: CEI Pattern, variable packing, custom errors. Mewakili pendekatan optimasi gas berbasis code smells yang diidentifikasi oleh Di Sorbo et al. (2022) dan analisis statis oleh Albert et al. (2021). Gas rendah, skor keamanan 2 dari 8 fitur.

**Tier C: VictimBridge**
Representasi bridge dengan dynamic protection via external calls ke kontrak terpisah (MonitorMock). Mewakili framework keamanan EIP-1153 dari OpenZeppelin (2024) dan studi empiris Zhang & Debono (2024) yang menunjukkan 50%+ kontrak hanya untuk reentrancy guard. Gas sangat tinggi karena banyak external calls, skor keamanan 8 dari 8 fitur.

**Tier D: LightweightBridge**
Kontribusi utama penelitian. Menggabungkan optimasi statis (Tier B) + dynamic protection secara inline tanpa external calls. Belum ada paper yang mewakili, ini adalah kontribusi baru. Gas rendah, skor keamanan 8 dari 8 fitur.

**Total Pengujian:**
216 test cases dalam 13 file test menggunakan metode empiris-kuantitatif.

**Metrik:**
SPG = (Skor Keamanan / Gas Deposit) x 1.000.000 (Benedetti et al., 2024)

---

## SLIDE 6: MANFAAT PENELITIAN

**Bagi Penulis:**
- Implementasi ilmu perkuliahan
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
Penelitian ini bertujuan untuk mengoptimalkan biaya gas dan keamanan smart contract bridge melalui implementasi EIP-1153 transient storage pada arsitektur 4-tier dengan pendekatan studi komparatif kuantitatif.

**Harapan:**
Proposal ini dapat diterima untuk dilanjutkan ke tahap penelitian selanjutnya, yaitu implementasi, pengukuran, dan validasi empiris.

**Terima kasih atas perhatian Bapak/Ibu Dosen.**

---

## DAFTAR PUSTAKA

- Adams, H. et al. (2021). Uniswap V3 Core.
- Benedetti, M. et al. (2024). Gas Cost Analysis of EIP-1153.
- Buterin, V. (2014). Ethereum Whitepaper.
- Chainsecurity. (2023). TSTORE Low Gas Reentrancy.
- Cochran, W. G. (1977). Sampling Techniques.
- Cohen, J. (1988). Statistical Power Analysis.
- Daian, P. et al. (2020). Flash Boys 2.0.
- Di Sorbo, A. et al. (2022). Profiling Gas Consumption.
- EIP-1153. (2021). Transient Storage Opcodes.
- OpenZeppelin. (2024). Transient Storage Security Model.
- Park, S. et al. (2024). Impact of EIP-4844.
- Samreen, N. F. & Alalfi, M. H. (2020). Reentrancy Vulnerability.
- Solidity Blog. (2024). Transient Storage in Solidity.
- Trail of Bits. (2022). Wormhole Bridge Security Report.
- Welch, B. L. (1947). Generalization of Student's Problem.
- Zhang, A. & Debono, M. (2024). Transient Storage in the wild.

---

## CATATAN PPT

- Slide 1: Judul + identitas
- Slide 2: Infografis angka kerugian + analogi
- Slide 3: Bullet points numbering
- Slide 4: Per peneliti
- Slide 5: Per tier + metode
- Slide 6: 3 kolom manfaat
- Slide 7: Kesimpulan + terima kasih
