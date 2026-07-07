# Keterbatasan Penelitian

Dokumen ini mendefinisikan batasan-batasan penelitian yang harus diakui dan dibahas dalam BAB 5 (Hasil & Analisis) dan BAB 6 (Penutup).

---

## 1. Keterbatasan Teknis

### 1.1 Tidak Ada Formal Verification

**Status:** Tidak terimplementasi

**Penjelasan:**
- Penelitian ini menggunakan Foundry (behavioral testing: fuzz, invariant, edge case) sebagai metode validasi
- Tidak menggunakan formal verification tools seperti Certora Prover, Halmos, atau SMTChecker
- Invariant tests bersifat behavioral (menjalankan skenario) bukan formal proof (membuktikan untuk semua kemungkinan state)

**Dampak:**
- Tidak dapat menjamin 100% absence of bugs untuk semua kemungkinan input
- Namun, 86 tests dengan 256 fuzz runs per test memberikan keyakinan tinggi untuk skenario yang diuji

**Mitigasi:**
- Slither static analysis (80 findings, 0 kritis)
- 4 invariant properties yang diuji secara exhaustif
- Edge case coverage yang komprehensif

### 1.2 MonitorMock Adalah Implementasi Mock

**Status:** Prototype, bukan production

**Penjelasan:**
- `MonitorMock` adalah implementasi EWS untuk tujuan riset/benchmark
- Menggunakan hardcoded parameters (P_detect = 9600, lambda = 15000)
- Tidak memiliki fitur production: upgradeability, rate limiting, event indexing yang optimal

**Dampak:**
- Performa EWS di production mungkin berbeda
- Parameter P_detect dan lambda perlu tuning untuk kondisi nyata

**Mitigasi:**
- Parameter dikonfigurasi via admin function (`updateParameters`)
- Formula penalty dapat di-scale sesuai kebutuhan

### 1.3 Tidak Ada Testnet Deployment

**Status:** Dituasikan (wallet 0 ETH)

**Penjelasan:**
- Seluruh pengujian dilakukan di Foundry EVM local
- Tidak ada deployment ke Sepolia/testnet untuk validasi gas nyata
- Gas measurements menggunakan Foundry gas reporter (akurat untuk local EVM)

**Dampak:**
- Gas costs mungkin sedikit berbeda di testnet (network congestion, base fee)
- Tidak ada transaction hash atau contract address untuk verifikasi publik

**Mitigasi:**
- Foundry gas reporter menggunakan EVM implementation yang identik
- Deploy script (`DeploySepolia.s.sol`) sudah siap saat ETH tersedia
- Deploy ke Sepolia direncanakan sebagai future work

### 1.4 Tidak Ada Cross-Chain Integration

**Status:** Single-chain assumption

**Penjelasan:**
- Penelitian ini fokus pada bridge dalam satu chain (Ethereum L1)
- Tidak mengimplementasikan cross-chain message passing (CCMP)
- Tidak ada integrasi dengan L2 (Optimism, Arbitrum, zkSync)

**Dampak:**
- Hasil tidak langsung berlaku untuk bridge cross-chain production
- Optimasi gas Blob (EIP-4844) perlu diuji di konteks L2

**Mitigasi:**
- Arsitektur modular: MonitorMock dapat diintegrasikan ke bridge yang sudah ada
- Fokus riset adalah mekanisme keamanan on-chain, bukan cross-chain protocol

---

## 2. Keterbatasan Metodologis

### 2.1 Pattern Detection Sederhana

**Status:** hanya mendeteksi Ta1 → Tv (frontrun → victim)

**Penjelasan:**
- EWS saat ini hanya mendeteksi pola sandwich dasar: Ta1 (frontrun) → Tv (victim) di blok yang sama
- Tidak mendeteksi:
  - Ta1 → Tv → Ta2 (sandwich lengkap 3 transaksi)
  - Cross-contract sandwich (serangan melalui DEX berbeda)
  - Flash loan sandwich (tanpa modal awal)
  - Time-bandit attack (reorg-based MEV)

**Dampak:**
- MEV bot canggih dapat menghindari deteksi dengan pattern yang lebih kompleks
- Deteksi hanya efektif untuk sandwich sederhana

**Mitigasi:**
- Pattern deteksi dapat diperluas tanpa mengubah arsitektur
- P_detect yang tinggi (96%) tetap memberikan deterrent effect

### 2.2 Model Ekonomi Penalti Sederhana

**Status:** linear scaling (λ �, P_detect �, amount)

**Penjelasan:**
- Formula penalti: `Penalty = amount �, (λ �, P_detect / 100,000,000)`
- Model linear tidak mempertimbangkan:
  - Volume transaksi historical
  - Frequency of suspicious activity
  - Market conditions (gas price volatility)
  - Attacker capital (flash loan vs own capital)

**Dampak:**
- Penalti mungkin terlalu kecil untuk attacker dengan modal besar
- Penalti mungkin terlalu besar untuk false positive

**Mitigasi:**
- Parameter λ dapat di-tuning secara dinamis via admin
- Model dapat di-upgrade ke non-linear scaling

### 2.3 Tidak Ada Flash Loan Protection

**Status:** Tidak terimplementasi

**Penjelasan:**
- EWS tidak membedakan antara transaksi dengan modal sendiri vs flash loan
- Flash loan attacker dapat melakukan sandwich tanpa risiko modal
- Penalti ekonomi kurang efektif jika attacker tidak memiliki capital yang terkunci

**Dampak:**
- Flash loan sandwich tetap berpotensi profitable meskipun ada penalty

**Mitigasi:**
- Flash loan protection memerlukan integration dengan lending protocol
- Bisa diimplementasikan sebagai future work

---

## 3. Keterbatasan Skala

### 3.1 Ukuran Sampel Terbatas

**Status:** 100 sampel per operasi, 100 percobaan Monte Carlo

**Penjelasan:**
- Gas benchmark: 100 sampel per operasi (memenuhi Central Limit Theorem)
- Monte Carlo: 100 runs �, 1000 blocks
- Lebih banyak sampel memberikan keyakinan lebih tinggi

**Dampak:**
- Confidence interval mungkin lebih sempit dengan lebih banyak sampel
- Distribusi gas mungkin tidak normal di kondisi production

**Mitigasi:**
- 100 sampel sudah di atas minimum untuk CLT
- 100 runs Monte Carlo standar untuk riset akademik

### 3.2 Tidak AdaLoad Testing

**Status:** Tidak terimplementasi

**Penjelasan:**
- Tidak ada pengujian dengan banyak concurrent users
- Tidak ada stress testing untuk menentukan throughput maksimum
- Tidak ada pengujian di bawah network congestion

**Dampak:**
- Performa di production mungkin berbeda dari local testing

**Mitigasi:**
- Foundry testing fokus pada correctness, bukan throughput
- Load testing dapat dilakukan sebagai future work

---

## 4. Keterbatasan Keamanan

### 4.1 Centralized Admin

**Status:** Single admin address

**Penjelasan:**
- VictimBridge menggunakan satu admin address untuk pause/unpause
- Tidak ada multi-sig, time-locks, atau governance mechanism
- Admin dapat melakukan pause secara sepihak

**Dampak:**
- Single point of failure jika admin key compromized
- Tidak ada check-and-balance untuk emergency actions

**Mitigasi:**
- Admin adalah immutable address (tidak dapat diubah)
- Design decision untuk riset prototype
- Production bridge harus menggunakan multi-sig

### 4.2 Tidak Ada Upgradeability

**Status:** Immutable contracts

**Penjelasan:**
- Semua kontrak menggunakan standard deployment (tidak ada proxy pattern)
- Tidak ada mekanisme upgrade jika bug ditemukan setelah deployment
- MonitorMock parameters dapat diubah, tapi kode contract tidak dapat diubah

**Dampak:**
- Bug yang ditemukan setelah deployment tidak dapat diperbaiki
- Harus deploy kontrak baru dan migrate state

**Mitigasi:**
- Immutable contracts lebih aman dari storage collision attacks
- Untuk riset prototype, ini acceptable

### 4.3 Tidak Ada Liveness Guarantees

**Status:** Admin-dependent

**Penjelasan:**
- Jika admin tidak aktif, tidak ada mekanisme lain untuk pause/unpause
- Tidak ada fallback mechanism atau emergency multisig
- Bridge dapat terus beroperasi meskipun ada vulnerability yang diketahui

**Dampak:**
- Delay response terhadap zero-day vulnerabilities

**Mitigasi:**
- EWS memberikan early warning sebelum serangan terjadi
- Emergency pause dapat dilakukan dalam satu transaksi

---

## 5. Ringkasan Keterbatasan

| Kategori | Keterbatasan | Dampak | Mitigasi |
|----------|-------------|--------|----------|
| Teknis | Tidak ada formal verification | Tidak 100% proof | 86 tests + Slither |
| Teknis | MonitorMock = prototype | Performance mungkin berbeda | Parameter tunable |
| Teknis | Tidak ada testnet | Gas nyata belum terukur | Foundry akurat |
| Teknis | Single-chain only | Tidak langsung cross-chain | Modular architecture |
| Metodologi | Pattern sederhana | MEV canggih dapat menghindar | Extensible detection |
| Metodologi | Model penalti linear | Tidak adaptif | Tunable parameters |
| Metodologi | Tidak ada flash loan protection | Flash loan tetap berpotensi | Future work |
| Skala | Sampel terbatas | Confidence interval mungkin lebar | Cukup untuk CLT |
| Skala | Tidak ada load testing | Throughput tidak terukur | Future work |
| Keamanan | Centralized admin | Single point of failure | Design decision |
| Keamanan | Tidak ada upgradeability | Bug tidak dapat diperbaiki | Immutable = safer |
| Keamanan | Tidak ada liveness guarantee | Delay response | EWS early warning |

---

## 6. Rekomendasi Future Work

| Prioritas | Item | Effort |
|-----------|------|--------|
| Tinggi | Deploy ke testnet + verifikasi Etherscan | 1 hari |
| Tinggi | Tambahkan flash loan detection | 1 minggu |
| Sedang | Formal verification (Halmos) | 2 minggu |
| Sedang | Multi-pattern MEV detection (Ta1→Tv→Ta2) | 1 minggu |
| Sedang | Load testing dengan concurrent users | 1 minggu |
| Rendah | Non-linear penalty model | 2 minggu |
| Rendah | Multi-sig admin + time-lock | 1 minggu |
| Rendah | Proxy upgradeability pattern | 1 minggu |
