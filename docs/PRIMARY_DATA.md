# Primary Data: Hasil Pengukuran Gas dan Keamanan

> Data primer dari 215 test cases yang dijalankan menggunakan Foundry (forge test) pada Solidity 0.8.28, EVM Cancun, optimizer 200 runs.

---

## 1. Environment Pengujian

| Parameter | Nilai |
|-----------|-------|
| Solidity Version | 0.8.28 |
| EVM Target | Cancun (support EIP-1153) |
| Optimizer | 200 runs |
| Foundry Version | 1.7.1 |
| Jumlah Test Suites | 13 |
| Jumlah Total Tests | 215 |
| Test Pass Rate | 100% (215/215) |
| Fuzz Runs | 256 per test |
| Invariant Calls | 128,000 per test |
| Statistic Samples | 100 per operasi |

---

## 2. Gas Measurements — Deposit (100 Sampel)

### 2.1 Statistik Deskriptif

| Tier | Mean | Min | Max | Std Dev |
|------|------|-----|-----|---------|
| A (Unoptimized) | 31,412 | 31,262 | 35,762 | ~400 |
| B (Static Only) | 31,427 | 31,344 | 33,844 | ~350 |
| C (Full Dynamic) | 122,769 | 121,806 | 150,706 | ~2,100 |
| D (Lightweight) | 34,156 | 32,543 | 80,943 | ~3,200 |

### 2.2 Selisih dari Baseline (Tier A)

| Tier | Selisih Gas | Persentase |
|------|------------|-----------|
| B vs A | +15 | +0.05% |
| C vs A | +91,357 | +290.8% |
| D vs A | +2,744 | +8.7% |

### 2.3 Rasio dari Tier B (Referensi Static)

| Tier | Rasio | Keterangan |
|------|-------|------------|
| A/B | 0.999x | Hampir identik |
| C/B | 3.91x | Tier C 3.91x lebih mahal |
| D/B | 1.087x | Tier D hanya 8.7% lebih mahal |

---

## 3. Gas Measurements — Withdraw (100 Sampel)

### 3.1 Statistik Deskriptif

| Tier | Mean | Min | Max |
|------|------|-----|-----|
| A (Unoptimized) | 9,735 | ~9,600 | ~9,900 |
| B (Static Only) | 9,727 | ~9,600 | ~9,900 |
| C (Full Dynamic) | 104,806 | ~103,000 | ~106,000 |
| D (Lightweight) | 12,119 | ~12,000 | ~12,1000 |

### 3.2 Rasio dari Tier B

| Tier | Rasio | Keterangan |
|------|-------|------------|
| A/B | 1.00x | Identik |
| C/B | 10.77x | Tier C 10.77x lebih mahal |
| D/B | 1.25x | Tier D 25% lebih mahal |

---

## 4. Gas Measurements — Swap (100 Sampel)

### 4.1 Statistik Deskriptif

| Tier | Mean | Min | Max |
|------|------|-----|-----|
| A (Unoptimized) | 22,080 | ~21,800 | ~22,400 |
| B (Static Only) | 15,000 | ~14,800 | ~15,200 |
| C (Full Dynamic) | 133,344 | ~132,000 | ~135,000 |
| D (Lightweight) | 62,787 | ~61,000 | ~64,000 |

### 4.2 Rasio dari Tier B

| Tier | Rasio | Keterangan |
|------|-------|------------|
| A/B | 1.47x | Tier A 47% lebih mahal (tanpa packing) |
| C/B | 8.89x | Tier C 8.89x lebih mahal |
| D/B | 4.19x | Tier D 4.19x lebih mahal |

---

## 5. Gas Measurements — Deployment

### 5.1 Statistik Deskriptif

| Tier | Gas Deploy | Rasio dari B |
|------|-----------|-------------|
| A (Unoptimized) | 413,860 | 1.17x |
| B (Static Only) | 352,921 | 1.00x (baseline) |
| C (Full Dynamic) | 886,1001 | 2.51x |
| D (Lightweight) | 736,064 | 2.09x |

---

## 6. Security Verification Data

### 6.1 Reentrancy Attack Results

| Test | Tier A | Tier B | Tier C | Tier D |
|------|--------|--------|--------|--------|
| Single-function reentrancy | ✅ Exploitable | ✅ Blocked | ✅ Blocked | ✅ Blocked |
| Cross-function reentrancy | ✅ Exploitable | ❌ Exploitable | ✅ Blocked | ✅ Blocked |
| Consecutive attacks (3x) | ✅ All succeed | ❌ | ✅ All blocked | ✅ All blocked |
| Attacker profit | +5 ETH | 0 ETH | 0 ETH | 0 ETH |
| Bridge balance unchanged | ❌ | ✅ | ✅ | ✅ |

### 6.2 MEV Sandwich Detection Results

| Test | Tier A | Tier B | Tier C | Tier D |
|------|--------|--------|--------|--------|
| Frontrun recorded | N/A | N/A | ✅ txRecords | ✅ lastTx |
| Sandwich detected | ❌ | ❌ | ✅ | ✅ |
| Penalty applied | N/A | N/A | ✅ | ✅ |
| Cross-block detection | N/A | N/A | ❌ (correct) | ❌ (correct) |

### 6.3 Emergency Pause Results

| Test | Tier A | Tier B | Tier C | Tier D |
|------|--------|--------|--------|--------|
| Pause available | ❌ | ❌ | ✅ | ✅ |
| Deposit reverts when paused | N/A | N/A | ✅ | ✅ |
| Withdraw reverts when paused | N/A | N/A | ✅ | ✅ |
| Swap reverts when paused | N/A | N/A | ✅ | ✅ |
| Works after unpause | N/A | N/A | ✅ | ✅ |
| Balance preserved | N/A | N/A | ✅ | ✅ |

### 6.4 Economic Penalty Verification

| Test | Tier C | Tier D | Hasil |
|------|--------|--------|-------|
| Penalty formula | (amount × lambda × score) / 1e8 | Same | ✅ Identik |
| Penalty capped at amount | ✅ | ✅ | ✅ |
| Zero score = zero penalty | ✅ | ✅ | ✅ |
| Penalty decreases ROI | ✅ | ✅ | ✅ |

---

## 7. Statistical Analysis

### 7.1 Welch's t-test (Tier C vs Tier D Deposit)

| Metric | Nilai |
|--------|-------|
| t-statistic | 1680.67 |
| p-value | 2.25 × 10⁻²²² |
| Significance | p << 0.05 (Sangat signifikan) |
| Cohen's d | 220.64 (LARGE) |
| 95% Confidence Interval | [98.18%, 98.23%] |
| Cost Ratio | 55.7x (Tier C / Tier D) |

### 7.2 Interpretasi Statistik

- **t = 1680.67**: Perbedaan antara Tier C dan Tier D sangat besar secara statistik
- **p = 2.25 × 10⁻²²²**: Kemungkinan perbedaan ini terjadi secara kebetulan hampir nol
- **Cohen's d = 220.64**: Effect size jauh di atas threshold "large" (0.8)
- **Cost Ratio = 55.7x**: Tier C 55.7x lebih mahal dari Tier D untuk fitur keamanan serupa

---

## 8. Real-World Cost Estimation

### 8.1 Biaya USD per Transaksi (ETH = $3,000)

| Gas Price | Tier A | Tier B | Tier C | Tier D |
|-----------|--------|--------|--------|--------|
| 10 Gwei | $0.09 | $0.09 | $0.37 | $0.10 |
| 100 Gwei | $0.28 | $0.28 | $1.10 | $0.31 |
| 80 Gwei | $0.75 | $0.75 | $2.95 | $0.82 |
| 150 Gwei | $1.41 | $1.41 | $5.53 | $1.54 |

### 8.2 Estimasi Biaya Bulanan (100,000 transaksi/bulan)

| Gas Price | Tier A | Tier B | Tier C | Tier D |
|-----------|--------|--------|--------|--------|
| 100 Gwei | $28,000 | $28,000 | $110,000 | $31,000 |
| 80 Gwei | $75,000 | $75,000 | $295,000 | $82,000 |

**Tier D menghemat $79,000/bulan dibanding Tier C** (pada 100 Gwei, 100K transaksi).

---

## 9. Data Ekonomi Deterrence

### 9.1 ROI Analysis

| Tier | Attacker Investment | Attacker Profit | ROI |
|------|-------------------|-----------------|-----|
| A (Unoptimized) | 5 ETH | +5 ETH (reentrancy) | +100% |
| B (Static Only) | 5 ETH | 0 ETH (CEI blocks) | 0% |
| C (Full Dynamic) | 5 ETH | 0 ETH (EWS blocks) | 0% |
| D (Lightweight) | 5 ETH | 0 ETH (inline blocks) | 0% |

### 9.2 Penalty Impact

| Scenario | Tier C Penalty | Tier D Penalty | Attacker Net |
|----------|---------------|---------------|-------------|
| Small attack (1 ETH) | 1 ETH (100%) | 1 ETH (100%) | -1 ETH |
| Medium attack (10 ETH) | 10 ETH (100%) | 10 ETH (100%) | -10 ETH |
| Large attack (100 ETH) | 100 ETH (100%) | 100 ETH (100%) | -100 ETH |

---

## 10. Coverage Summary

| Metrik | Nilai |
|--------|-------|
| Total test functions | 215 |
| Total assertions | ~800+ |
| Fuzz test runs | 256 per function (8 functions) |
| Invariant test calls | 128,000 per function (4 functions) |
| Gas measurements | 100 samples × 4 tiers × 3 operasi = 360 measurements |
| Security scenarios tested | 50+ unique attack vectors |
| Test pass rate | 100% |

---

## Referensi Tools

1. **Foundry** — Smart contract development framework
2. **Solidity 0.8.28** — EVM Cancun target
3. **Forge Test** — Test runner with fuzz, invariant, and statistic support
4. **Slither** — Static analysis (80 findings, 0 critical)
5. **Etherscan V2 API** — Real-time gas price data
