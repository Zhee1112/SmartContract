# BAB 3: METODOLOGI PENELITIAN

Bab ini menjelaskan desain penelitian, model matematika yang digunakan, model ancaman formal, desain eksperimental, kerangka analisis statistik, serta tools dan lingkungan pengujian yang digunakan dalam penelitian ini.

## 3.1 Desain Penelitian

### 3.1.1 Pendekatan Penelitian

Penelitian ini menggunakan pendekatan kuantitatif eksperimental dengan desain comparative study (Benedetti et al., 2024; Di Sorbo et al., 2021). Pendekatan ini dipilih karena penelitian bertujuan mengukur dan membandingkan kinerja gas serta tingkat keamanan pada empat arsitektur bridge yang berbeda secara sistematis dan terkontrol (Wang et al., 2024).

Desain penelitian terdiri dari tiga tahap utama:

1. **Implementasi**: Pengembangan empat kontrak bridge (Tier A sampai Tier D) dengan tingkat optimasi dan keamanan yang berbeda (Zhang et al., 2022).

2. **Pengukuran**: Pengumpulan data gas menggunakan 100 sampel per operasi (deposit, withdraw, swap) pada lingkungan EVM simulasi, serta pengukuran gas deployment (Lagouvardos et al., 2024).

3. **Analisis**: Perbandingan gas cost, evaluasi keamanan terhadap delapan fitur keamanan, perhitungan cost-effectiveness (SPG), dan validasi statistik menggunakan Welch's t-test (Shou et al., 2023).

### 3.1.2 Arsitektur Penelitian

Penelitian ini mengimplementasikan empat tier bridge dalam satu arsitektur komparatif:

| Tier | Kontrak | Deskripsi | Karakteristik |
|------|---------|-----------|---------------|
| A | `UnoptimizedBridge` | Baseline tanpa optimasi | Gas termurah, 0 keamanan |
| B | `BridgeStaticOnly` | Optimasi statis saja | Gas rendah, 2/8 keamanan |
| C | `VictimBridge` | Full dynamic (EIP-1153 + EWS) | Gas tinggi, 8/8 keamanan |
| D | `LightweightBridge` | Lightweight dynamic (inline) | Gas rendah, 8/8 keamanan |

Tier D merupakan kontribusi utama penelitian, yang membuktikan bahwa semua fitur keamanan Tier C dapat diimplementasikan secara inline tanpa external calls, menghasilkan biaya gas yang jauh lebih rendah.

### 3.1.3 Asumsi Penelitian

Penelitian ini dibangun atas beberapa asumsi yang perlu dinyatakan secara eksplisit:

**Asumsi Jaringan:**
- Ethereum L1 dan L2 beroperasi normal
- Blob transactions (EIP-4844) tersedia pada Cancun fork ke atas
- Gas price berfluktuasi secara normal (10-150 Gwei L1, 1-30 Gwei Blob)
- Block time sekitar 12 detik pada L1

**Asumsi Aktor:**
- User bersifat jujur (benign)
- Bridge operator semi-trusted
- Attacker dan MEV bot bersifat adversarial
- Validator Ethereum adalah rational actor

**Asumsi Keamanan:**
- Smart contract bersifat deterministic dan immutable setelah deployment
- Primitif kriptografi aman secara komputasional
- Model eksekusi EVM tidak berubah selama transaksi berjalan

## 3.2 Model Matematika

### 3.2.1 Model Biaya Gas

Total biaya gas per transaksi didefinisikan sebagai:

```
G_total = G_fixed + G_storage + G_execution + G_external
```

Di mana:
- `G_fixed` = biaya transaksi dasar (21.000 gas)
- `G_storage` = operasi baca-tulis storage
- `G_execution` = aritmatika, perbandingan, lompatan
- `G_external` = panggilan eksternal (msg.sender.call)

Komponen storage merupakan biaya terbesar dalam bridge contract. Model biaya storage didasarkan pada spesifikasi EVM:

| Operasi | Biaya Gas | Keterangan |
|---------|-----------|------------|
| SSTORE cold write | 20.000 | Penulisan awal ke slot baru |
| SSTORE warm write | 2.900 | Penulisan ke slot yang sudah diakses |
| SLOAD cold read | 2.100 | Pembacaan awal dari slot baru |
| SLOAD warm read | 100 | Pembacaan dari slot yang sudah diakses |
| TSTORE (EIP-1153) | 100 | Penulisan transient storage (Benedetti et al., 2024) |
| TLOAD (EIP-1153) | 100 | Pembacaan transient storage (Casale-Brunet, 2024) |

### 3.2.2 Model Penghematan Variable Packing

Variable packing mengurangi jumlah slot storage yang digunakan. Penghematan gas dihitung sebagai:

```
ΔG_packing = (N_before - N_after) × SSTORE_cold
```

Di mana `N_before` dan `N_after` masing-masing adalah jumlah slot sebelum dan sesudah packing.

Pada `UnoptimizedBridge`, variabel dideklarasikan secara terpisah:
- `bool isPaused` = 1 byte (menempati slot 32-byte penuh)
- `uint256 totalDeposits` = 32 byte (1 slot)
- `address admin` = 20 byte (1 slot)
- `uint32 depositNonce` = 4 byte (1 slot)

Total: 5 slot = 100.000 gas (cold write).

Pada `BridgeStaticOnly` dan `VictimBridge`, variabel dikemas dalam struct:
- `UserBalance` = address (20B) + uint96 (12B) = 32B = 1 slot
- `PoolReserves` = uint96 (12B) + uint96 (12B) = 24B = 1 slot

Total: 2 slot = 40.000 gas (cold write).

Penghematan: 60.000 gas (60%) per transaksi deposit pertama.

### 3.2.3 Model Penghematan EIP-1153

Perbandingan mekanisme reentrancy guard konvensional dan transient storage:

**Mutex Lock Tradisional (SSTORE):**
```
G_mutex = SSTORE_cold(lock) + SSTORE_warm(unlock)
        = 20.000 + 2.900
        = 22.900 gas
```

**EIP-1153 (TSTORE/TLOAD):**
```
G_tstore = TSTORE(enter) + TLOAD(check) + TSTORE(exit)
         = 100 + 100 + 100
         = 300 gas
```

**Penghematan:**
```
ΔG_tstore = G_mutex - G_tstore
          = 22.900 - 300
          = 22.600 gas (98,7% savings)
```

Penghematan ini menjadi fondasi bagi efisiensi gas Tier D, di mana semua fitur keamanan diimplementasikan secara inline menggunakan TSTORE/TLOAD.

### 3.2.4 Model Keuntungan MEV Sandwich Attack

Tanpa Early Warning System (EWS), keuntungan penyerang dihitung sebagai:

```
Profit_a = Ta2.output - Ta1.input
```

Untuk model Constant Product (x * y = k), keuntungan dapat disederhanakan:

```
Profit_a ≈ (Δv² × x) / ((reserve_ETH + x)² × reserve_ETH)
```

Di mana:
- `Δv` = jumlah transaksi korban
- `x` = jumlah frontrun penyerang
- `reserve_ETH` = reserve ETH dalam pool

Dengan EWS + Penalty:

```
Profit_a' = Ta2.output - Ta1.input - Penalty

Penalty = amount × (λ × P_detect / 100.000.000)
```

### 3.2.5 Model Biaya Dynamic Rollup Submission

Dynamic engine memilih rute termurah antara blob dan calldata:

```
C_dynamic = min(C_calldata, C_blob)

C_calldata = beff_bytes × 16 × L1_fee
C_blob = BLOB_GAS_SIZE × blob_fee

beff_bytes = tx_count × tx_size × α
BLOB_GAS_SIZE = 131.072 gas
```

Faktor kompresi `α` bergantung pada metode kompresi:
- RLP encoding: α = 0,85 (15% savings)
- ZK proof: α = 0,70 (30% savings)
- Kombinasi: α = 0,88 (12% savings)

### 3.2.6 Model Penalti Ekonomi

Penalti ekonomi didefinisikan sebagai:

```
Penalty(amount, anomalyScore) = min(
  amount × λ × anomalyScore / 100.000.000,
  amount
)
```

Di mana:
- `λ` = faktor penalti risiko (default: 15.000 = 1,5x)
- `anomalyScore` = skor deteksi (0-10.000)

Analisis Incentive Compatibility:

```
U(a) = P(undetected) × Profit - P(detected) × Penalty
     = 0,04 × Profit - 0,96 × Penalty
```

Kondisi agar serangan tidak menguntungkan:
```
Profit > 24 × Penalty (untuk P_detect = 96%)
```

## 3.3 Model Ancaman Formal

### 3.3.1 Asumsi Aktor

Penelitian ini mendefinisikan lima tipe aktor dalam model ancaman:

| Aktor | Deskripsi | Keterangan |
|-------|-----------|------------|
| User | Pengguna bridge | Benign (jujur) |
| Bridge Operator | Pengelola smart contract | Semi-trusted |
| Attacker | Penyerang bridge | Adversarial |
| MEV Bot | Bot sandwich attack | Adversarial |
| Rollup Sequencer | Pengirim batch ke L1 | Semi-trusted |

### 3.3.2 Vektor Serangan

**Reentrancy Attack** (Samreen & Alalfi, 2020; Zheng et al., 2023):
Attacker melakukan panggilan rekursif ke fungsi withdraw sebelum state balance diperbarui (Feng et al., 2023).

```
Attacker.call(withdraw(amount)) → Bridge.transfer(attacker, amount) → attacker.receive() → Attacker.call(withdraw(amount)) [RECURSIVE]
```

Status keamanan:
- Tier A: VULNERABLE (Interactions sebelum Effects)
- Tier B: MITIGATED (CEI pattern)
- Tier C: MITIGATED (CEI + EIP-1153 callDepth guard)
- Tier D: MITIGATED (CEI + inline EIP-1153)

**MEV Sandwich Attack** (Daian et al., 2020; Rodler et al., 2021):
Attacker membungkus transaksi korban dengan frontrun dan backrun (Nassirzadeh et al., 2023).

```
Ta1: Attacker.swap(ETH → Token) di harga rendah
Tv:  Victim.swap(ETH → Token) menaikkan harga
Ta2: Attacker.swap(Token → ETH) di harga tinggi
Profit = Ta2.output - Ta1.input
```

Status keamanan:
- Tier A: VULNERABLE (tidak ada deteksi)
- Tier B: PARTIAL (minTokensOut statis)
- Tier C: MITIGATED (EWS mendeteksi + penalty)
- Tier D: MITIGATED (inline detection + penalty)

### 3.3.3 Sifat Keamanan

**Integrity:**
- Dijamin oleh EVM: state transitions bersifat deterministic
- Dijamin oleh CEI: Effects sebelum Interactions mencegah inconsistent state
- Dijamin oleh EIP-1153: auto-reset mencegah state corruption

**Liveness:**
- Tidak ada mekanisme lock permanen
- EIP-1153: transient storage auto-reset, tidak perlu manual unlock

**Non-repudiation:**
- Dijamin oleh blockchain: semua transaksi tercatat di L1/L2

### 3.3.4 Matrix Mitigasi Ancaman

| Ancaman | Probabilitas | Dampak | Mitigasi | Residual Risk |
|---------|-------------|--------|----------|---------------|
| Reentrancy | Medium | Critical | CEI + EIP-1153 | Low |
| MEV Sandwich | High | Medium | EWS + penalty | Low |
| Front-running | High | Low | Monitoring + slippage | Medium |
| Flash loan | Low | High | TWAP + slippage | Low |
| DoS | Low | Medium | Minimum deposit + gas limit | Low |

## 3.4 Desain Eksperimental

### 3.4.1 Variabel Penelitian

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| Bridge tier | Independen | Tier A, B, C, D |
| Gas cost | Terikat | Total gas per transaksi |
| Tipe transaksi | Independen | deposit, withdraw, swap |
| Tipe serangan | Independen | reentrancy, MEV sandwich |
| Gas price | Terkontrol | L1 fee, Blob fee |

### 3.4.2 Variabel Terkontrol

Kondisi yang dikontrol selama pengujian:
- Kondisi jaringan: Normal (tidak congested)
- Block gas limit: 30 juta gas
- Ukuran transaksi: 120 byte
- Pool reserves: 100 ETH / 100.000 Token
- Solc version: 0.8.28
- Optimizer: 200 runs
- EVM version: Cancun

### 3.4.3 Replikasi

Setiap pengukuran gas dilakukan dengan 100 sampel per operasi (Lagouvardos et al., 2024). Jumlah sampel ini dipilih berdasarkan Central Limit Theorem (CLT) yang menyatakan bahwa distribusi mean akan mendekati normal untuk n ≥ 30 (Cochran, 1977), dan diperkuat hingga 100 untuk menghasilkan confidence interval yang lebih sempit dan statistik yang lebih robust (Li, 2025).

Protokol replikasi:
1. Untuk setiap kombinasi (tier × tipe transaksi), generate 100 alamat unik menggunakan `keccak256(abi.encode(i))`.
2. Setiap alamat melakukan satu transaksi dengan jumlah yang sama (1 ether untuk deposit, 0.1 ether untuk swap).
3. Gas usage dicatat menggunakan `gasleft()` sebelum dan sesudah transaksi.
4. Statistik deskriptif (mean, min, max, std dev, 95% CI) dihitung dari 100 sampel.

### 3.4.4 Prosedur Pengukuran Gas

Pengukuran gas dilakukan menggunakan mekanisme bawaan Foundry melalui `gasleft()`. Prosedur pengukuran adalah sebagai berikut:

```
// Solidity measurement pattern
uint256 g = gasleft();
bridge.deposit{value: 1 ether}();
uint256 gasUsed = g - gasleft();
```

Pengukuran ini mencakup seluruh komponen gas termasuk:
- Biaya transaksi dasar (21.000 gas)
- Operasi storage (SSTORE/SLOAD/TSTORE/TLOAD)
- Eksekusi aritmatika dan perbandingan
- Panggilan eksternal (jika ada)
- Emit event

Untuk pengukuran deployment, gas dihitung dari perbedaan `gasleft()` sebelum dan sesudah `new Contract()`.

## 3.5 Kerangka Analisis Statistik

### 3.5.1 Uji Hipotesis

**H₀ (Null Hypothesis):** Tidak ada perbedaan bermakna gas cost antara bridge statis dan bridge dinamis.

**H₁ (Alternative):** Bridge dinamis (EWS + EIP-1153) memiliki gas cost yang berbeda dari bridge statis.

**Uji statistik:** Welch's t-test (tidak memerlukan asumsi variansi sama)

Welch's t-test dipilih alih-alih Student's t-test karena tidak memerlukan asumsi homogenitas variansi (Welch, 1947; Lagouvardos et al., 2024). Asumsi ini sering tidak terpenuhi dalam pengukuran gas yang memiliki variance berbeda antar tier (Benedetti et al., 2024).

Rumus Welch's t-test:

```
t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)
```

Di mana:
- `x̄₁`, `x̄₂` = rata-rata gas cost masing-masing tier
- `s₁²`, `s₂²` = variansi masing-masing tier
- `n₁`, `n₂` = jumlah sampel (100 per tier)

Derajat kebebasan (df) dihitung menggunakan Welch-Satterthwaite equation:

```
df = (s₁²/n₁ + s₂²/n₂)² / [(s₁²/n₁)²/(n₁-1) + (s₂²/n₂)²/(n₂-1)]
```

### 3.5.2 Confidence Interval

Interval kepercayaan 95% untuk perbedaan mean:

```
CI_95% = (x̄₁ - x̄₂) ± t_α/2 × √(s₁²/n₁ + s₂²/n₂)
```

Di mana `t_α/2` adalah nilai kritis t-tabel untuk α = 0,05 (two-tailed) dengan df yang sesuai.

### 3.5.3 Effect Size (Cohen's d)

Untuk mengukur besarnya perbedaan yang bermakna secara praktis:

```
d = (x̄₁ - x̄₂) / s_pooled
```

Di mana `s_pooled` adalah standard deviation gabungan:

```
s_pooled = √[((n₁-1)s₁² + (n₂-1)s₂²) / (n₁ + n₂ - 2)]
```

Interpretasi Cohen's d:
| Nilai d | Interpretasi |
|---------|-------------|
| d < 0,2 | Negligible |
| 0,2 ≤ d < 0,5 | Small |
| 0,5 ≤ d < 0,8 | Medium |
| d ≥ 0,8 | Large |

### 3.5.4 Metrik Cost-Effectiveness (SPG)

SPG (Security Points per Gas) mengukur efisiensi bridge dalam mengubah biaya gas menjadi keamanan:

```
SPG = (Skor Keamanan / Gas Deposit) × 1.000.000
```

Di mana:
- Skor Keamanan = jumlah fitur keamanan aktif (0-8)
- Gas Deposit = gas yang digunakan untuk operasi deposit

## 3.6 Metrik Keamanan

### 3.6.1 Skor Keamanan

Keamanan dinilai berdasarkan delapan fitur keamanan (Zheng et al., 2023; Wang et al., 2026):

| No | Fitur | A | B | C | D |
|----|-------|---|---|---|---|
| 1 | Reentrancy Single-function | ✗ | ✓ | ✓ | ✓ |
| 2 | Reentrancy Cross-function | ✗ | ✗ | ✓ | ✓ |
| 3 | Reentrancy Consecutive | ✗ | ✗ | ✓ | ✓ |
| 4 | MEV Sandwich Detection | ✗ | ✗ | ✓ | ✓ |
| 5 | Economic Penalty | ✗ | ✗ | ✓ | ✓ |
| 6 | Emergency Pause | ✗ | ✗ | ✓ | ✓ |
| 7 | Block Tracking | ✗ | ✗ | ✓ | ✓ |
| 8 | Custom Errors | ✗ | ✓ | ✓ | ✓ |
| **Total** | | **0/8** | **2/8** | **8/8** | **8/8** |

### 3.6.2 Reentrancy Resistance Score (RRS)

```
RRS = 1 - (successful_reentrancy_attempts / total_withdraw_calls)
```

Nilai ideal: RRS = 1,0 (0% reentrancy berhasil).

### 3.6.3 MEV Protection Score (MPS)

```
MPS = detected_mev_attempts / total_mev_attempts
```

Nilai ideal: MPS ≥ 0,96 (96% deteksi).

### 3.6.4 Gas Efficiency Ratio (GER)

```
GER = G_unoptimized / G_optimized
```

GER > 1: Optimized lebih efisien.

## 3.7 Tools dan Lingkungan Pengujian

### 3.7.1 Platform Pengembangan

| Komponen | Spesifikasi |
|----------|------------|
| IDE | VS Code + opencode CLI |
| OS | Windows 11 + WSL Ubuntu |
| Solidity | 0.8.28 |
| Compiler | Foundry (forge) v1.7.1 |
| EVM Version | Cancun (mendukung EIP-1153) |
| Optimizer | 200 runs |

### 3.7.2 Framework Pengujian

Foundry dipilih sebagai framework pengujian karena mendukung (Shou et al., 2023; Casale-Brunet, 2024):
- EVM version Cancun (EIP-1153 TSTORE/TLOAD)
- Gas reporting bawaan
- Fuzz testing (property-based testing) (Rodler et al., 2021)
- Invariant testing (Zhang et al., 2022)
- Cheat codes untuk manipulasi state (`vm.deal`, `vm.prank`, `vm.warp`, `vm.roll`)

### 3.7.3 Spesifikasi foundry.toml

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.28"
optimizer = true
optimizer_runs = 200
evm_version = "cancun"
gas_reports = ["*"]
```

### 3.7.4 Sumber Data Gas Real-Time

Data gas price real-time diperoleh dari Etherscan V2 API:
- Endpoint: `https://api.etherscan.io/api`
- API Key: `HXVGEWVKM3EZZ6X334B7TUMC1DDZU4HXHM`
- Blok referensi: #25.243.215
- Base Fee: 0,55 Gwei (waktu pengukuran)

### 3.7.5 Komposisi Sumber Daya Pengujian

| Sumber Daya | Fungsi |
|-------------|--------|
| Foundry (forge) | Kompilasi, pengujian, gas reporting |
| Python 3.12 | Analisis statistik, visualisasi data |
| scipy | Welch's t-test, confidence interval |
| matplotlib | Grafik visualisasi |
| Chart.js (CDN) | Dashboard interaktif |
| Etherscan V2 API | Data gas price real-time |

## 3.8 Struktur Sumber Daya Penelitian

### 3.8.1 Hierarki Arsitektur

```
src/
├── UnoptimizedBridge.sol      ← Tier A: Baseline
├── BridgeStaticOnly.sol       ← Tier B: Statis
├── VictimBridge.sol           ← Tier C: Full Dynamic
├── LightweightBridge.sol      ← Tier D: Lightweight Dynamic
├── MonitorMock.sol            ← EWS (Early Warning System)
├── Attacker.sol               ← Kontrak serangan simulasi
└── BridgeWithSSTOREGuard.sol  ← Benchmark SSTORE guard
```

### 3.8.2 Hierarki Pengujian

```
test/
├── TierComparisonTest.t.sol       ← 50 tes: transisi state, event, akses
├── MEVSimulationTest.t.sol        ← 25 tes: sandwich attack
├── EconomicDeterrenceTest.t.sol   ← 25 tes: ROI, boundary, consecutive
├── CostAnalysisTest.t.sol         ← 8 tes: gas per feature
├── SecurityComparisonTest.t.sol   ← 6 tes: verifikasi keamanan
├── MultiContractTest.t.sol        ← 14 tes: benchmark 4-tier
├── EdgeCaseTest.t.sol             ← 41 tes: edge cases Tier D
├── VictimBridgeSecurityTest.t.sol ← 23 tes: keamanan Tier C/D
├── GasStatsTest.t.sol             ← 3 tes: statistik 100 sampel
├── InvariantTest.t.sol            ← 4 tes: invariant properties
├── FuzzTest.t.sol                 ← 8 tes: property-based testing
├── EIP1153Benchmark.t.sol         ← 7 tes: TSTORE vs SSTORE
└── OZGuardComparison.t.sol        ← 1 tes: SSTORE vs EIP-1153
```

Total: 215 tes di 13 test suites.

### 3.8.3 Hierarki Skrip

```
scripts/
├── tier_analysis.py              ← Analisis standalone: Etherscan + security scores
├── generate_dashboard.py         ← Generate data JSON + chart PNG untuk dashboard
└── dynamic_submission_engine.py  ← Monte Carlo simulation (perlu revisi 4-tier)
```

## 3.9 Validitas dan Reliabilitas

### 3.9.1 Validitas Internal

- **Kontrol variabel**: Semua parameter EVM (solc, optimizer, evm_version) dikontrol ketat (Benedetti et al., 2024; Di Sorbo et al., 2021).
- **Isolasi pengukuran**: Setiap pengukuran gas menggunakan alamat unik dan transaksi terisolasi.
- **Replikasi**: 100 sampel per kondisi memastikan kecenderungan sentral yang stabil (Lagouvardos et al., 2024).
- **Fuzz testing**: Property-based testing memvalidasi kebenaran formulasi untuk input arbitrary (Shou et al., 2023).

### 3.9.2 Validitas Eksternal

- **Etherscan data**: Gas price real-time dari Etherscan V2 API memastikan relevansi kondisi pasar aktual.
- **EVM Cancun**: Penggunaan EVM version terbaru memastikan kompatibilitas dengan fitur terkini (Park et al., 2025).
- **EIP-1153**: Implementasi mengikuti spesifikasi resmi dan telah diterapkan oleh OpenZeppelin (Benedetti et al., 2024).

### 3.9.3 Reliabilitas

- **Deterministic**: Semua pengukuran bersifat deterministic (sama untuk input yang sama) (Li, 2025).
- **Automated**: Pengukuran dilakukan secara otomatis melalui Foundry, mengurangi human error (Casale-Brunet, 2024).
- **Versioned**: Semua dependency dikunci versinya (solc 0.8.28, forge v1.7.1).

---

## Referensi Bab 3

[1] Cochran, W. G. (1977). "Sampling Techniques." John Wiley & Sons.

[2] Welch, B. L. (1947). "The Generalization of 'Student's' Problem When Several Different Population Variances are Involved." Biometrika.

[3] Cohen, J. (1988). "Statistical Power Analysis for the Behavioral Sciences." Lawrence Erlbaum Associates.

[4] Ethereum Foundation. "Ethereum Virtual Machine (EVM) Specification."

[5] Foundry Documentation. "Forge Test: Gas Reporting."

[6] Etherscan. "Etherscan V2 API Documentation."

[7] EIP-1153. "Transient Storage Opcodes." Ethereum Improvement Proposals.

[8] OpenZeppelin. "TransientStorageGuard Implementation."

[9] Trail of Bits. "Smart Contract Security Assessment Methodology."

[10] Samreen, N.F. & Alalfi, M.H. (2020). "Reentrancy Vulnerability Identification in Ethereum Smart Contracts." IEEE International Conference on Software Maintenance and Evolution.
