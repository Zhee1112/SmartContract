# Mathematical Framework & Methodology

## 1. Gas Cost Models

### 1.1 Static Gas Cost Formula (Bridge Contract)

**Total Gas Cost per Transaksi:**

```
G_total = G_fixed + G_storage + G_execution + G_external

G_fixed    = Base transaction cost (21,000 gas)
G_storage  = Storage read/write operations
G_execution = Arithmetic, comparisons, jumps
G_external = External calls (msg.sender.call)
```

**Storage Cost Breakdown:**

```
G_storage = Σ (SSTORE_i + SLOAD_i)

SSTORE cold = 20,000 gas (slot baru)
SSTORE warm = 2,900 gas  (slot sudah diakses)
SLOAD cold  = 2,100 gas  (slot baru)
SLOAD warm  = 100 gas    (slot sudah diakses)
TSTORE      = 100 gas    (EIP-1153, auto-reset)
TLOAD       = 100 gas    (EIP-1153, auto-reset)
```

### 1.2 Variable Packing Savings

**Tanpa Packing (UnoptimizedBridge):**
```
slot_0: bool isPaused      (1 byte, tapi pakai 32-byte slot)
slot_1: uint256 totalDeposits (32 bytes)
slot_2: address admin      (20 bytes)
slot_3: uint32 depositNonce (4 bytes, pakai slot sendiri)
slot_4: uint256 padding     (32 bytes)
Total: 5 slots = 5 × SSTORE = 100,000 gas (cold)
```

**Dengan Packing (BridgeStaticOnly/VictimBridge):**
```
slot_0: UserBalance struct (address 20B + uint96 12B = 32B)
slot_1: PoolReserves struct (uint96 12B + uint96 12B = 24B)
Total: 2 slots = 2 × SSTORE = 40,000 gas (cold)

Savings: 60,000 gas (60%)
```

**Formula Penghematan:**
```
ΔG_packing = (N_before - N_after) × SSTORE_cold
            = (5 - 2) × 20,000
            = 60,000 gas
```

### 1.3 EIP-1153 Transient Storage Savings

**Tanpa EIP-1153 (Mutex Lock Tradisional):**
```
G_mutex = SSTORE_cold(lock) + SSTORE_warm(unlock)
        = 20,000 + 2,900
        = 22,900 gas
```

**Dengan EIP-1153:**
```
G_tstore = TSTORE(enter) + TSTORE(exit)
         = 100 + 100
         = 200 gas
```

**Formula Penghematan:**
```
ΔG_tstore = G_mutex - G_tstore
          = 22,900 - 200
          = 22,700 gas (99.1% savings)
```

---

## 2. MEV Sandwich Attack Profit Model

### 2.1 Attacker Profit (Tanpa EWS)

```
Profit_a = Ta2.output - Ta1.input

Dimana:
Ta1.input  = x ETH (frontrun buy)
Ta2.output = y ETH (backrun sell)
x = amountIn (frontrun)
y = (reserve_token × x) / (reserve_ETH + x) × (reserve_ETH) / (reserve_token + Δv)

Δv = victim.amountIn (transaksi korban)
```

**Simplified (Constant Product):**
```
Profit_a ≈ (Δv² × x) / ((reserve_ETH + x)² × reserve_ETH)
```

### 2.2 Attacker Profit (Dengan EWS + Penalty)

```
Profit_a' = Ta2.output - Ta1.input - Penalty

Penalty = Victim.amountOut × (λ × P_detect / 100,000,000)

Dimana:
λ = 15000 (faktor penalti 1.5x)
P_detect = 9600 (probabilitas deteksi 96%)
```

### 2.3 Expected Value Analysis

```
E[Profit_a] = P(not detected) × Profit_a + P(detected) × Profit_a'

P(not detected) = 1 - P_detect/10000 = 0.04 (4%)
P(detected) = P_detect/10000 = 0.96 (96%)

E[Profit_a] = 0.04 × Profit_a + 0.96 × (Profit_a - Penalty)
            = Profit_a - 0.96 × Penalty
```

**Kondisi Profitable:**
```
Profit_a > Penalty
(Δv² × x) / ((reserve_ETH + x)² × reserve_ETH) > Δv × (λ × P_detect / 100,000,000)

Jika λ = 1.5 dan P_detect = 0.96:
Profit_a > Δv × 1.44 × 10⁻⁵
```

---

## 3. Dynamic Rollup Submission Cost Model

### 3.1 Static Batching (Calldata)

```
C_static = Σ (batch_bytes × 16 × L1_fee)

Dimana:
batch_bytes = tx_count × tx_size (tanpa kompresi)
L1_fee = L1 base fee (Gwei)
```

### 3.2 Dynamic Batching (Blob vs Calldata)

```
C_dynamic = min(C_calldata, C_blob)

C_calldata = beff_bytes × 16 × L1_fee
C_blob = BLOB_GAS_SIZE × blob_fee

beff_bytes = tx_count × tx_size × α (compression factor)
BLOB_GAS_SIZE = 131,072 gas (128 KB)
```

### 3.3 Compression Factor (α)

```
α = 1 - compression_ratio

Untuk rollup:
α_RLP = 0.85 (RLP encoding, 15% savings)
α_ZK  = 0.70 (ZK proof compression, 30% savings)
α_combined = 0.88 (combined, 12% savings) ← Digunakan dalam simulasi
```

### 3.4 Batch Trigger Conditions

```
Trigger WHEN:
  beff_bytes ≥ TARGET_BATCH_BYTES (100 KB)
  OR blocks_since_last_batch ≥ MAX_DELAY (25 blok)

Dimana:
beff_bytes = pending_txs × TX_SIZE × α
```

---

## 4. Economic Penalty Model

### 4.1 Penalty Formula

```
Penalty(amount, anomalyScore) = min(
  amount × λ × anomalyScore / 100,000,000,
  amount
)

λ = 15000 (faktor risiko)
anomalyScore = 0 - 10000 (skor deteksi)
```

### 4.2 Penalty Analysis

| anomalyScore | λ | Penalty Rate | Penalty (100 ETH) |
|--------------|---|--------------|---------------------|
| 0 | 15000 | 0% | 0 ETH |
| 5000 | 15000 | 0.75% | 0.75 ETH |
| 9600 | 15000 | 1.44% | 1.44 ETH |
| 10000 | 15000 | 1.50% | 1.50 ETH |

### 4.3 Incentive Compatibility

```
Attacker utility = Expected profit - Expected penalty

U(a) = P(undetected) × Profit - P(detected) × Penalty
     = 0.04 × Profit - 0.96 × Penalty

Attacker profitable IFF:
U(a) > 0
Profit > 24 × Penalty (untuk P_detect = 96%)
```

---

## 5. Statistical Framework

### 5.1 Hypothesis Testing

**H₀ (Null Hypothesis):** Tidak ada perbedaan signifikan gas cost antara bridge statis dan bridge dinamis.

**H₁ (Alternative):** Bridge dinamis (EWS + EIP-1153) menghemat gas secara signifikan dibanding bridge statis.

**Test:** Paired t-test (n ≥ 100 sampel)

```
t = (x̄_static - x̄_dynamic) / (s_d / √n)

Dimana:
x̄_static = rata-rata gas cost bridge statis
x̄_dynamic = rata-rata gas cost bridge dinamis
s_d = standard deviation dari selisih
n = jumlah sampel
```

### 5.2 Confidence Interval

```
CI_95% = (x̄_diff - t_α/2 × s_d/√n, x̄_diff + t_α/2 × s_d/√n)
```

### 5.3 Effect Size (Cohen's d)

```
d = (x̄_static - x̄_dynamic) / s_pooled

Interpretasi:
d < 0.2: Negligible
0.2 ≤ d < 0.5: Small
0.5 ≤ d < 0.8: Medium
d ≥ 0.8: Large
```

---

## 6. Security Metrics

### 6.1 Reentrancy Resistance Score

```
RRS = 1 - (successful_reentrancy_attempts / total_withdraw_calls)

Ideal: RRS = 1.0 (0% successful reentrancy)
```

### 6.2 MEV Protection Score

```
MPS = detected_mev_attempts / total_mev_attempts

Ideal: MPS ≥ 0.96 (96% detection rate)
```

### 6.3 Gas Efficiency Ratio

```
GER = G_unoptimized / G_optimized

GER > 1: Optimized lebih efisien
GER = 1: Sama
GER < 1: Optimized lebih boros
```

---

## 7. Experimental Design

### 7.1 Variables

| Variable | Type | Description |
|----------|------|-------------|
| Bridge tier | Independent | [A] Unoptimized, [B] Static, [C] Dynamic |
| Gas cost | Dependent | Total gas per transaksi |
| Transaction type | Independent | deposit, withdraw, swap |
| Attack type | Independent | reentrancy, MEV sandwich |
| Gas price | Controlled | L1 fee, Blob fee |

### 7.2 Control Variables
- Network condition: Normal (tidak congested)
- Block gas limit: 30M gas
- Transaction size: 120 bytes
- Pool reserves: 100 ETH / 100,000 Token

### 7.3 Replication
- Minimum 100 sampel per kondisi
- Run 10x untuk Monte Carlo simulation
- Report mean, median, std dev, min, max
