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
Decentralized Finance (DeFi) merupakan sistem keuangan yang beroperasi tanpa perantara. Dalam ekosistem ini, bridge blockchain berfungsi seperti jembatan penghubung antardesa yang memungkinkan transfer aset antar jaringan.

**Data Kerugian:**
- Ronin Bridge: $620 juta
- Wormhole Bridge: $320 juta
- Nomad Bridge: $190 juta
- Total: > $1 miliar

**Dua Serangan Utama:**

| Serangan | Penjelasan |
|----------|------------|
| Reentrancy | Penyerang memanggil fungsi withdraw secara berulang sebelum saldo diperbarui, seperti orang yang mondar-mandir di pintu keluar supermarket mengambil barang berkali-kali sebelum membayar |
| MEV Sandwich | Bot memanipulasi urutan transaksi di mempool, seperti orang yang memotong antrian di kasir |

**Dilema:**
Mekanisme keamanan konvensional menggunakan SSTORE membutuhkan 22.900 gas per transaksi. Bagi bridge dengan volume tinggi, beban ini sangat memberatkan. Pengembang dihadapkan pada pilihan sulit antara keamanan dan efisiensi gas.

**Solusi:**
Ethereum mengaktifkan EIP-1153: Transient Storage Opcodes yang memperkenalkan TSTORE dan TLOAD dengan biaya hanya 100 gas per operasi. Data otomatis ter-reset di akhir transaksi. Penghematan mencapai 98,7 persen dibandingkan SSTORE.

---

## SLIDE 3: IDENTIFIKASI MASALAH

**Permasalahan:**

1. Mekanisme keamanan konvensional menggunakan SSTORE membutuhkan 22.900 gas per transaksi, memberatkan operasional bridge dengan volume tinggi.

2. Implementasi keamanan berbasis EIP-1153 yang ada masih menggunakan external calls ke kontrak terpisah, menambah biaya gas overhead.

3. EIP-1153 belum dimanfaatkan secara optimal. Berdasarkan Zhang dan Debono (2024), lebih dari 50 persen kontrak hanya menggunakannya untuk reentrancy guard saja.

4. Belum ada framework komparatif yang secara sistematis membandingkan berbagai tingkat optimasi gas dan keamanan dalam satu arsitektur bridge.

**Rumusan Masalah:**
Bagaimana mengoptimalkan biaya gas pada smart contract bridge melalui implementasi optimasi statis dan dinamis berbasis EIP-1153 transient storage?

---

## SLIDE 4: PENELITIAN TERDAHULU

**Penelitian Terdahulu:**

| Penulis | Tahun | Fokus | Temuan Utama |
|---------|-------|-------|--------------|
| Zhang & Debono | 2024 | Adopsi EIP-1153 | 50%+ kontrak hanya pakai untuk reentrancy guard |
| Chainsecurity | 2023 | Keamanan EIP-1153 | TSTORE tidak punya batas gas minimum seperti SSTORE |
| Di Sorbo et al. | 2022 | Optimasi gas | 19 code smells pada Solidity yang menyebabkan pemborosan gas |

**Gap Penelitian:**
Berdasarkan kajian literatur, belum ada penelitian yang secara spesifik menggabungkan optimasi gas statis dan dinamis secara inline dalam satu arsitektur bridge dengan pengukuran cost-effectiveness menggunakan metrik SPG.

---

## SLIDE 5: METODOLOGI

**Pendekatan:**
Studi komparatif kuantitatif dengan empirical design.

**4-Tier Architecture:**

| Tier | Kontrak | Karakteristik | Gas | Keamanan |
|------|---------|---------------|-----|----------|
| A | UnoptimizedBridge | Baseline tanpa optimasi | Rendah | 0/8 fitur |
| B | BridgeStaticOnly | Optimasi statis saja (CEI, packing, custom errors) | Rendah | 2/8 fitur |
| C | VictimBridge | Full dynamic (EIP-1153 + MonitorMock via external calls) | Tinggi | 8/8 fitur |
| D | LightweightBridge | Inline dynamic (kontribusi utama) | Rendah | 8/8 fitur |

**Pengukuran:**
- Framework: Foundry dengan EVM Cancun
- Sampel: 100 per operasi (berdasarkan Central Limit Theorem)
- Operasi: deposit, withdraw, swap

**Validasi Statistik:**
- Welch's t-test: Membandingkan signifikansi gas antara Tier C dan Tier D
- Cohen's d: Mengukur effect size atau besarnya perbedaan

**Metrik:**
SPG (Security Points per Gas) = (Skor Keamanan / Gas Deposit) x 1.000.000

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

## CATATAN UNTUK PPT

- **Slide 1:** Judul + identitas (tambah foto/logo)
- **Slide 2:** Gunakan infografis untuk angka kerugian, tabel untuk serangan
- **Slide 3:** Gunakan bullet points dengan numbering
- **Slide 4:** Gunakan tabel
- **Slide 5:** Gunakan diagram flow atau tabel perbandingan
- **Slide 6:** Gunakan 3 kolom dengan ikon
- **Slide 7:** Kesimpulan singkat + terima kasih
