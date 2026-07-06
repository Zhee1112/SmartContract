# 2. Metodologi penelitian

Metode yang digunakan dalam penelitian ini terbagi atas tiga bagian utama, yaitu desain penelitian, model matematika dan ancaman formal, serta kerangka analisis statistik beserta lingkungan pengujian yang digunakan.

## 2.1 Desain penelitian

### 2.1.1 Pendekatan penelitian:

Penelitian ini menggunakan pendekatan kuantitatif eksperimental dengan desain comparative study [11], [12]. Pendekatan ini dipilih karena penelitian bertujuan mengukur dan membandingkan kinerja gas serta tingkat keamanan pada empat arsitektur bridge yang berbeda secara sistematis dan terkontrol [14].

Desain penelitian terdiri dari tiga tahap utama:

1. **Implementasi**: Pengembangan empat kontrak bridge (Tier A sampai Tier D) dengan tingkat optimasi dan keamanan yang berbeda [18].

2. **Pengukuran**: Pengumpulan data gas menggunakan 100 sampel per operasi (deposit, withdraw, swap) pada lingkungan EVM simulasi, serta pengukuran gas deployment [15].

3. **Analisis**: Perbandingan gas cost, evaluasi keamanan terhadap delapan fitur keamanan, perhitungan cost-effectiveness (SPG), dan validasi statistik menggunakan Welch's t-test [16].

### 2.1.2 Arsitektur penelitian:

Penelitian ini mengimplementasikan empat tier bridge dalam satu arsitektur komparatif:

**Tabel 1. Arsitektur 4-Tier Bridge**

| Tier | Kontrak | Deskripsi | Karakteristik |
|------|---------|-----------|---------------|
| A | `UnoptimizedBridge` | Baseline tanpa optimasi | Gas termurah, 0 keamanan |
| B | `BridgeStaticOnly` | Optimasi statis saja | Gas rendah, 2/8 keamanan |
| C | `VictimBridge` | Full dynamic (EIP-1153 + EWS) | Gas tinggi, 8/8 keamanan |
| D | `LightweightBridge` | Lightweight dynamic (inline) | Gas rendah, 8/8 keamanan |

Tier D merupakan kontribusi utama penelitian, yang membuktikan bahwa semua fitur keamanan Tier C dapat diimplementasikan secara inline tanpa external calls, menghasilkan biaya gas yang jauh lebih rendah.

## 2.2 Model matematika

### 2.2.1 Model biaya gas:

Total biaya gas per transaksi didefinisikan sebagai:

```
G_total = G_fixed + G_storage + G_execution + G_external
```

Di mana:
- `G_fixed` = biaya transaksi dasar (21.000 gas)
- `G_storage` = operasi baca-tulis storage
- `G_execution` = aritmatika, perbandingan, lompatan
- `G_external` = panggilan eksternal (msg.sender.call)

Komponen storage merupakan biaya terbesar dalam bridge contract. Model biaya storage didasarkan pada spesifikasi EVM [4]:

**Tabel 2. Biaya Gas Operasi EVM**

| Operasi | Biaya Gas | Keterangan |
|---------|-----------|------------|
| SSTORE cold write | 20.000 | Penulisan awal ke slot baru |
| SSTORE warm write | 2.900 | Penulisan ke slot yang sudah diakses |
| SLOAD cold read | 2.100 | Pembacaan awal dari slot baru |
| SLOAD warm read | 100 | Pembacaan dari slot yang sudah diakses |
| TSTORE (EIP-1153) | 100 | Penulisan transient storage [11] |
| TLOAD (EIP-1153) | 100 | Pembacaan transient storage [21] |

### 2.2.2 Model penghematan variable packing:

Variable packing mengurangi jumlah slot storage yang digunakan. Penghematan gas dihitung sebagai:

```
ΔG_packing = (N_before - N_after) × SSTORE_cold
```

Di mana `N_before` dan `N_after` masing-masing adalah jumlah slot sebelum dan sesudah packing.

### 2.2.3 Model penghematan EIP-1153:

Perbandingan mekanisme reentrancy guard konvensional dan transient storage:

**Mutex Lock Tradisional (SSTORE):**
```
G_mutex = SSTORE_cold(lock) + SSTORE_warm(unlock)
        = 20.000 + 2.900
        = 22.900 gas
```

**EIP-1153 (TSTORE/TLOAD) [7]:**
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

### 2.2.4 Model keuntungan MEV sandwich attack:

Tanpa Early Warning System (EWS), keuntungan penyerang dihitung sebagai:

```
Profit_a = Ta2.output - Ta1.input
```

Dengan EWS + Penalty:

```
Profit_a' = Ta2.output - Ta1.input - Penalty

Penalty = amount × (λ × P_detect / 100.000.000)
```

### 2.2.5 Model penalti ekonomi:

Penalti ekonomi didefinisikan sebagai:

```
Penalty(amount, anomalyScore) = min(
  amount × λ × anomalyScore / 100.000.000,
  amount
)
```

Di Mana:
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

## 2.3 Model ancaman formal

### 2.3.1 Asumsi aktor:

Penelitian ini mendefinisikan lima tipe aktor dalam model ancaman:

**Tabel 3. Model Aktor**

| Aktor | Deskripsi | Keterangan |
|-------|-----------|------------|
| User | Pengguna bridge | Benign (jujur) |
| Bridge Operator | Pengelola smart contract | Semi-trusted |
| Attacker | Penyerang bridge | Adversarial |
| MEV Bot | Bot sandwich attack | Adversarial |
| Rollup Sequencer | Pengirim batch ke L1 | Semi-trusted |

### 2.3.2 Vektor serangan:

**Reentrancy Attack [10], [13]:**
Attacker melakukan panggilan rekursif ke fungsi withdraw sebelum state balance diperbarui.

Status keamanan:
- Tier A: VULNERABLE (Interactions sebelum Effects)
- Tier B: MITIGATED (CEI pattern)
- Tier C: MITIGATED (CEI + EIP-1153 callDepth guard)
- Tier D: MITIGATED (CEI + inline EIP-1153)

**MEV Sandwich Attack [17], [22]:**
Attacker membungkus transaksi korban dengan frontrun dan backrun.

Status keamanan:
- Tier A: VULNERABLE (tidak ada deteksi)
- Tier B: PARTIAL (minTokensOut statis)
- Tier C: MITIGATED (EWS mendeteksi + penalty)
- Tier D: MITIGATED (inline detection + penalty)

### 2.3.3 Matrix mitigasi ancaman:

**Tabel 4. Matrix Mitigasi Ancaman**

| Ancaman | Probabilitas | Dampak | Mitigasi | Residual Risk |
|---------|-------------|--------|----------|---------------|
| Reentrancy | Medium | Critical | CEI + EIP-1153 | Low |
| MEV Sandwich | High | Medium | EWS + penalty | Low |
| Front-running | High | Low | Monitoring + slippage | Medium |
| Flash loan | Low | High | TWAP + slippage | Low |
| DoS | Low | Medium | Minimum deposit + gas limit | Low |

## 2.4 Desain eksperimental

### 2.4.1 Variabel penelitian:

**Tabel 5. Variabel Penelitian**

| Variabel | Tipe | Deskripsi |
|----------|------|-----------|
| Bridge tier | Independen | Tier A, B, C, D |
| Gas cost | Terikat | Total gas per transaksi |
| Tipe transaksi | Independen | deposit, withdraw, swap |
| Tipe serangan | Independen | reentrancy, MEV sandwich |
| Gas price | Terkontrol | L1 fee, Blob fee |

### 2.4.2 Variabel terkontrol:

Kondisi yang dikontrol selama pengujian:
- Kondisi jaringan: Normal (tidak congested)
- Block gas limit: 30 juta gas
- Ukuran transaksi: 120 byte
- Pool reserves: 100 ETH / 100.000 Token
- Solc version: 0.8.28
- Optimizer: 200 runs
- EVM version: Cancun

### 2.4.3 Replikasi:

Setiap pengukuran gas dilakukan dengan 100 sampel per operasi [15]. Jumlah sampel ini dipilih berdasarkan Central Limit Theorem (CLT) yang menyatakan bahwa distribusi mean akan mendekati normal untuk n ≥ 30 [1], dan diperkuat hingga 100 untuk menghasilkan confidence interval yang lebih sempit dan statistik yang lebih robust [19].

Protokol replikasi:
1. Untuk setiap kombinasi (tier × tipe transaksi), generate 100 alamat unik menggunakan `keccak256(abi.encode(i))`.
2. Setiap alamat melakukan satu transaksi dengan jumlah yang sama (1 ether untuk deposit, 0.1 ether untuk swap).
3. Gas usage dicatat menggunakan `gasleft()` sebelum dan sesudah transaksi.
4. Statistik deskriptif (mean, min, max, std dev, 95% CI) dihitung dari 100 sampel.

### 2.4.4 Prosedur pengukuran gas:

Pengukuran gas dilakukan menggunakan mekanisme bawaan Foundry [5] melalui `gasleft()`. Prosedur pengukuran adalah sebagai berikut:

```
uint256 g = gasleft();
bridge.deposit{value: 1 ether}();
uint256 gasUsed = g - gasleft();
```

## 2.5 Kerangka analisis statistik

### 2.5.1 Uji hipotesis:

**H₀ (Null Hypothesis):** Tidak ada perbedaan bermakna gas cost antara bridge statis dan bridge dinamis.

**H₁ (Alternative):** Bridge dinamis (EWS + EIP-1153) memiliki gas cost yang berbeda dari bridge statis.

**Uji statistik:** Welch's t-test (tidak memerlukan asumsi variansi sama)

Welch's t-test [2] dipilih alih-alih Student's t-test karena tidak memerlukan asumsi homogenitas variansi [2], [15]. Asumsi ini sering tidak terpenuhi dalam pengukuran gas yang memiliki variance berbeda antar tier [11].

Rumus Welch's t-test:

```
t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)
```

### 2.5.2 Confidence interval:

Interval kepercayaan 95% untuk perbedaan mean:

```
CI_95% = (x̄₁ - x̄₂) ± t_α/2 × √(s₁²/n₁ + s₂²/n₂)
```

### 2.5.3 Effect size (Cohen's d):

Untuk mengukur besarnya perbedaan yang bermakna secara praktis [3]:

```
d = (x̄₁ - x̄₂) / s_pooled
```

**Tabel 6. Interpretasi Cohen's d**

| Nilai d | Interpretasi |
|---------|-------------|
| d < 0,2 | Negligible |
| 0,2 ≤ d < 0,5 | Small |
| 0,5 ≤ d < 0,8 | Medium |
| d ≥ 0,8 | Large |

### 2.5.4 Metrik cost-effectiveness (SPG):

SPG (Security Points per Gas) mengukur efisiensi bridge dalam mengubah biaya gas menjadi keamanan:

```
SPG = (Skor Keamanan / Gas Deposit) × 1.000.000
```

Di Mana:
- Skor Keamanan = jumlah fitur keamanan aktif (0-8)
- Gas Deposit = gas yang digunakan untuk operasi deposit

## 2.6 Metrik keamanan

### 2.6.1 Skor keamanan:

Keamanan dinilai berdasarkan delapan fitur keamanan [13], [14]:

**Tabel 7. Skor Keamanan 4-Tier**

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

## 2.7 Tools dan lingkungan pengujian

### 2.7.1 Platform pengembangan:

**Tabel 8. Platform Pengembangan**

| Komponen | Spesifikasi |
|----------|------------|
| IDE | VS Code + opencode CLI |
| OS | Windows 11 + WSL Ubuntu |
| Solidity | 0.8.28 |
| Compiler | Foundry (forge) v1.7.1 |
| EVM Version | Cancun (mendukung EIP-1153) |
| Optimizer | 200 runs |

### 2.7.2 Framework pengujian:

Foundry [5] dipilih sebagai framework pengujian karena mendukung [16], [21]:
- EVM version Cancun (EIP-1153 [7] TSTORE/TLOAD)
- Gas reporting bawaan
- Fuzz testing (property-based testing) [17]
- Invariant testing [18]
- Cheat codes untuk manipulasi state (`vm.deal`, `vm.prank`, `vm.warp`, `vm.roll`)

### 2.7.3 Komposisi sumber daya pengujian:

**Tabel 9. Komposisi Sumber Daya Pengujian**

| Sumber Daya | Fungsi |
|-------------|--------|
| Foundry (forge) [5] | Kompilasi, pengujian, gas reporting |
| Python 3.12 | Analisis statistik, visualisasi data |
| scipy | Welch's t-test, confidence interval |
| matplotlib | Grafik visualisasi |
| Chart.js (CDN) | Dashboard interaktif |
| Etherscan V2 API [6] | Data gas price real-time |
