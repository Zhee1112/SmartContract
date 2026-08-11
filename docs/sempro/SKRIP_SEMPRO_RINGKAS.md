# RINGKASAN SKRIP UNTUK PPT (7 Slide)

---

## SLIDE 1: JUDUL

**Judul:**
Optimalisasi Gas dan Keamanan Smart Contract Bridge Berbasis EIP-1153 Transient Storage pada Arsitektur 4-Tier

**Oleh:**
Razy Al Farizy
NIM: 11220910000063
Universitas Islam Negeri Syarif Hidayatullah Jakarta

---

## SLIDE 2: LATAR BELAKANG

**Apa itu Bridge?**
Jembatan penghubung antar blockchain, seperti jembatan penghubung antardesa (Adams et al., 2021).

**Masalah:**
- Ronin: $620 juta, Wormhole: $320 juta, Nomad: $190 juta (Trail of Bits, 2022)
- Reentrancy: penyerang memanggil withdraw berulang kali (Samreen & Alalfi, 2020)
- MEV Sandwich: bot memanipulasi urutan transaksi (Daian et al., 2020)
- SSTORE konvensional: 22.900 gas/transaksi (OpenZeppelin, 2024)

**Solusi:**
EIP-1153 dirancang sejak 2021, diresmikan di Fork Cancun Maret 2024. TSTORE/TLOAD hanya 100 gas, penghematan 98,7% (EIP-1153, 2021).

---

## SLIDE 3: IDENTIFIKASI MASALAH

1. SSTORE konvensional mahal (22.900 gas)
2. EIP-1153 masih pakai external calls
3. 50%+ kontrak hanya pakai reentrancy guard (Zhang & Debono, 2024)
4. Belum ada framework komparatif

**Rumusan Masalah:**
Bagaimana mengoptimalkan biaya gas pada smart contract bridge melalui implementasi EIP-1153 transient storage?

---

## SLIDE 4: PENELITIAN TERDAHULU

**Zhang & Debono (2024)**
50%+ kontrak EIP-1153 hanya untuk reentrancy guard.

**Chainsecurity (2023)**
TSTORE tanpa batas gas minimum, mekanisme lama perlu evaluasi.

**Di Sorbo et al. (2022)**
19 code smells pada Solidity penyebab pemborosan gas.

**Gap:**
Belum ada yang menggabungkan optimasi statis + dinamis inline dengan SPG (Benedetti et al., 2024).

---

## SLIDE 5: METODOLOGI

**Pendekatan:** Studi komparatif kuantitatif

**4-Tier:**
- *Tier A*: Baseline, tanpa optimasi, keamanan 0/8
- *Tier B*: Optimasi statis, keamanan 2/8
- *Tier C*: Dynamic + external calls, keamanan 8/8, gas tinggi
- *Tier D*: Inline dynamic, keamanan 8/8, gas rendah (kontribusi)

**Pengukuran:** 100 sampel/operasi (Cochran, 1977)

**Validasi:** Welch's t-test (Welch, 1947), Cohen's d (Cohen, 1988)

**Metrik:** SPG = (Skor/Gas) x 1.000.000 (Benedetti et al., 2024)

---

## SLIDE 6: MANFAAT

**Penulis:** Implementasi ilmu + pemahaman EIP-1153

**Universitas:** Referensi riset blockchain

**Pengembang:** Panduan optimasi gas + keamanan

---

## SLIDE 7: PENUTUP

Proposal optimasi gas + keamanan bridge dengan EIP-1153 pada arsitektur 4-tier.

Harapan diterima untuk dilanjutkan ke tahap penelitian.

**Terima kasih.**

---

## CATATAN PPT

- Slide 1: Judul + identitas
- Slide 2: Infografis angka kerugian
- Slide 3: Bullet points
- Slide 4: Per peneliti
- Slide 5: Per tier
- Slide 6: 3 kolom
- Slide 7: Kesimpulan
