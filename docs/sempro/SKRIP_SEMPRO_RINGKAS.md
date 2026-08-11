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

**Definisi:**
- DeFi: Sistem keuangan tanpa bank
- Bridge: Jembatan penghubung antar blockchain

**Masalah:**
- Ronin Bridge: $620 juta
- Wormhole Bridge: $320 juta
- Nomad Bridge: $190 juta
- Total: > $1 miliar

**Dua Serangan Utama:**
- Reentrancy: Penyerang memanggil withdraw berulang kali
- MEV Sandwich: Bot memanipulasi urutan transaksi

**Dilema:**
- Keamanan SSTORE: 22.900 gas/transaksi
- Pengembang harus memilih: keamanan ATAU biaya

**Solusi:**
- EIP-1153: TSTORE/TLOAD = 100 gas/operasi
- Penghematan: 98,7%

---

## SLIDE 3: IDENTIFIKASI MASALAH

1. SSTORE konvensional mahal (22.900 gas)
2. EIP-1153 masih pakai external calls
3. 50%+ kontrak hanya pakai reentrancy guard
4. Belum ada framework komparatif

**Rumusan Masalah:**
Bagaimana mengoptimalkan biaya gas pada smart contract bridge melalui implementasi optimasi statis dan dinamis berbasis EIP-1153 transient storage?

---

## SLIDE 4: PENELITIAN TERDAHULU

| Penulis | Tahun | Temuan |
|---------|-------|--------|
| Zhang & Debono | 2024 | 50%+ hanya untuk reentrancy guard |
| Chainsecurity | 2023 | TSTORE tanpa batas gas minimum |
| Di Sorbo et al. | 2022 | 19 code smells pada Solidity |

**Gap Penelitian:**
Belum ada yang menggabungkan optimasi statis + dinamis secara inline dalam satu arsitektur bridge.

---

## SLIDE 5: METODOLOGI

**Pendekatan:**
Studi komparatif kuantitatif

**4-Tier Architecture:**

| Tier | Deskripsi | Gas | Keamanan |
|------|-----------|-----|----------|
| A | Baseline (tanpa optimasi) | Rendah | 0/8 |
| B | Statis saja (CEI, packing) | Rendah | 2/8 |
| C | Dynamic (EIP-1153 + MonitorMock) | Tinggi | 8/8 |
| D | Inline Dynamic (kontribusi) | Rendah | 8/8 |

**Pengukuran:**
- 100 sampel per operasi (CLT)
- 3 operasi: deposit, withdraw, swap

**Validasi:**
- Welch's t-test (signifikansi)
- Cohen's d (effect size)

---

## SLIDE 6: MANFAAT PENELITIAN

**Bagi Penulis:**
- Implementasi ilmu perkuliahan
- Pemahaman EIP-1153

**Bagi Universitas:**
- Referensi riset blockchain
- Kontribusi ilmiah

**Bagi Pengembang:**
- Panduan optimasi gas
- Referensi keamanan bridge

---

## SLIDE 7: PENUTUP

**Ringkasan:**
- Penelitian optimasi gas + keamanan bridge
- Menggunakan EIP-1153 transient storage
- Arsitektur 4-tier komparatif

**Harapan:**
Proposal diterima untuk dilanjutkan ke tahap penelitian selanjutnya.

**Terima kasih.**

---

## CATATAN UNTUK PPT

- **Slide 1:** Judul + identitas
- **Slide 2:** Gunakan ikon/infografis untuk angka kerugian
- **Slide 3:** Gunakan bullet points
- **Slide 4:** Gunakan tabel
- **Slide 5:** Gunakan diagram 4-tier
- **Slide 6:** Gunakan 3 kolom
- **Slide 7:** Kesimpulan singkat
