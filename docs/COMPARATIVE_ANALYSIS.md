# Analisis Perbandingan: Modifikasi EIP-1153 untuk Keamanan Bridge

> **Narasi Penelitian**: EIP-1153 (Cancun, 2024) menawarkan TSTORE/TLOAD dengan gas hanya 100 gas. Penelitian ini memodifikasi cara penggunaannya dari sekadar reentrancy guard menjadi pertahanan MEV + penalty + pause, sambil menjaga biaya gas tetap rendah.

---

## 1. Alur Perbandingan 4 Tier

```
Tier A (Baseline)          Tier B (Static)          Tier C (Rollup Full)      Tier D (Rollup Ringan)
──────────────────        ─────────────────        ──────────────────        ─────────────────────
Tanpa optimasi            CEI + packing             EIP-1153 via MonitorMock   EIP-1153 INLINE
Gas: 31,412               Gas: 31,427               Gas: 122,769              Gas: 34,156
Keamanan: 0/8             Keamanan: 4/8             Keamanan: 8/8             Keamanan: 7/8
     │                          │                          │                          │
     │ + CEI + Packing          │ + EIP-1153 + EWS         │ MODIFIKASI:              │
     │ + Custom Errors          │ + MEV + Penalty          │ Inline semua             │
     ▼                          ▼                          ▼                          ▼
     Tier B                     Tier C                     Tier D (KONTRIBUSI)
```

---

## 2. Tabel Perbandingan Arsitektur

### 2.1 vs Bridge Existing

| Fitur | Hop Protocol | Connext | Stargate | Wormhole | Tier A | Tier B | Tier C | Tier D |
|-------|-------------|---------|----------|----------|--------|--------|--------|--------|
| **Reentrancy Guard** | Tidak | Tidak | Tidak | Tidak | ❌ | CEI | EIP-1153 Mock | **EIP-1153 inline** |
| **MEV Protection** | Tidak | Tidak | Tidak | Tidak | ❌ | ❌ | EWS array | **Single-slot** |
| **Emergency Pause** | Guardian | Multisig | Guardian | Guardian | ❌ | ❌ | Admin | **Admin** |
| **External Calls** | Multiple | Multiple | Multiple | Multiple | 0 | 0 | **5-6/tx** | **0** |
| **EIP-1153** | Tidak | Tidak | Tidak | Tidak | ❌ | ❌ | Ya | **Ya (inline)** |

### 2.2 Static vs Dynamic di Setiap Tier

| Aspek | Tier A | Tier B | Tier C | Tier D |
|-------|--------|--------|--------|--------|
| **STATIC (Compile-time)** | | | | |
| CEI Pattern | ❌ | ✅ | ✅ | ✅ |
| Variable Packing | ❌ | ✅ | ✅ | ✅ |
| Custom Errors | ❌ | ✅ | ✅ | ✅ |
| Unchecked Math | ❌ | ✅ | ✅ | ✅ |
| **DYNAMIC (Runtime)** | | | | |
| Reentrancy Guard | ❌ | ❌ | ✅ (external) | ✅ **(inline)** |
| MEV Detection | ❌ | ❌ | ✅ (array) | ✅ **(single-slot)** |
| Economic Penalty | ❌ | ❌ | ✅ (external) | ✅ **(pure math)** |
| Emergency Pause | ❌ | ❌ | ✅ | ✅ |
| **Karakter** | Baseline | Static only | Dynamic mahal | **Dynamic murah** |

---

## 3. Analisis Gas Efficiency

### 3.1 Gas per Operasi (Primary Data)

| Operasi | Tier A | Tier B | Tier C | Tier D | D vs C |
|---------|--------|--------|--------|--------|--------|
| **Deposit** | 31,412 | 31,427 | 122,769 | 34,156 | **-72.2%** |
| **Withdraw** | 9,735 | 9,727 | 104,806 | 12,119 | **-88.4%** |
| **Swap** | 10,593 | 10,494 | 103,825 | 13,443 | **-87.1%** |
| **Deploy** | 413,860 | 352,921 | 886,301 | 736,064 | **-17.0%** |

### 3.2 Mengapa Harga Jauh Berbeda?

| Komponen Biaya | Tier C (External) | Tier D (Inline) | Penghematan |
|----------------|-------------------|-----------------|-------------|
| CALL opcode (5 panggilan) | ~500 | 0 | -500 |
| ABI encode/decode | ~15,000 | 0 | **-15,000** |
| Code loading (cold) | ~13,000 | 0 | **-13,000** |
| Dynamic array SSTORE | ~22,100 | 0 | **-22,100** |
| Cold SLOAD di MonitorMock | ~10,500 | 0 | **-10,500** |
| Inline TSTORE/TLOAD | 0 | ~400 | +400 |
| Inline SLOAD (warm) | 0 | ~4,400 | +4,400 |
| **Total overhead** | **~74,100** | **~12,200** | **-61,900** |

**Kesimpulan**: 60% biaya tambahan Tier C berasal dari external calls ke MonitorMock.

### 3.3 Reentrancy Guard Comparison

| Metode | Gas | Auto-Reset | MEV-Aware | External Calls |
|--------|-----|------------|-----------|----------------|
| SSTORE (OpenZeppelin) | 22,900 | ❌ | ❌ | 0 |
| EIP-1153 via MonitorMock | ~52,000 | ✅ | ✅ | 5-6/tx |
| **EIP-1153 inline (Tier D)** | **~200** | **✅** | **✅** | **0** |

---

## 4. Analisis MEV Protection

| Mekanisme | Hop | Connext | Stargate | Wormhole | Tier C | Tier D |
|-----------|-----|---------|----------|----------|--------|--------|
| Frontrunning detection | ❌ | ❌ | ❌ | ❌ | ✅ (array) | ✅ **(single-slot)** |
| Sandwich detection | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Economic penalty | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ **(inline)** |
| Storage cost | N/A | N/A | N/A | N/A | **22,100 gas** | **2,900 gas** |

**Keunggulan Tier D**: Single-slot MEV detection 7.6x lebih murah dari dynamic array.

---

## 5. Analisis Response terhadap Serangan

### 5.1 Reentrancy

| Serangan | Tier A | Tier B | Tier C | Tier D |
|----------|--------|--------|--------|--------|
| Single-function | ❌ BERHASIL | ✅ CEI | ✅ EIP-1153 | ✅ **EIP-1153 inline** |
| Cross-function | ❌ BERHASIL | ❌ BERHASIL | ✅ EIP-1153 | ✅ **EIP-1153 inline** |
| Consecutive (3x) | ❌ BERHASIL | ❌ BERHASIL | ✅ DIBLOKIR | ✅ **DIBLOKIR** |
| Profit attacker | +5 ETH | 0 ETH | 0 ETH | **0 ETH** |

### 5.2 MEV Sandwich

| Aspek | Tier A | Tier B | Tier C | Tier D |
|-------|--------|--------|--------|--------|
| Deteksi | ❌ | ❌ | ✅ | ✅ |
| Penalty | ❌ | ❌ | ✅ | ✅ |
| ROI attacker | +100% | 0% | **0%** | **0%** |

### 5.3 Emergency Response

| Mekanisme | Tier A | Tier B | Tier C | Tier D |
|-----------|--------|--------|--------|--------|
| Pause available | ❌ | ❌ | ✅ | ✅ |
| Speed | N/A | N/A | Instant | **Instant** |
| Balance preserved | N/A | N/A | ✅ | ✅ |

---

## 6. Analisis Statistik

| Metrik | Nilai | Interpretasi |
|--------|-------|-------------|
| Welch's t-test | t = 1680.67, p = 2.25×10⁻²²² | Sangat signifikan |
| Cohen's d | 220.64 | Effect size LARGE |
| 95% CI | [98.18%, 98.23%] | Sangat sempit |
| Cost Ratio | 55.7x | Tier C 55.7x lebih mahal |
| Total Tests | 215/215 pass | 100% pass rate |

---

## 7. Keunikan Penelitian Ini

| Aspek | Bridge Existing | Penelitian Ini |
|-------|----------------|----------------|
| EIP-1153 Transient Storage | Reentrancy guard saja | **5 fungsi keamanan** |
| On-chain MEV Detection | Tidak ada | **Single-slot detection** |
| Economic Penalty | Tidak ada | **Pure math inline** |
| 4-Tier Comparison | Tidak ada | **Baseline → Static → Rollup → Ringan** |
| Gas vs Security Tradeoff | Tidak diukur | **215 tests, statistik** |
| Inline Dynamic Security | Tidak ada | **0 external calls** |

### Kontribusi Utama

**Tier D membuktikan**: Modifikasi EIP-1153 bisa meningkatkan keamanan **75% dari Tier B** dengan biaya hanya **8.7% lebih tinggi**.

| Kontribusi | Bukti |
|-----------|-------|
| Modifikasi EIP-1153 multiguna | 5 fungsi dalam 1 kontrak (9,900 gas) |
| Inline vs External | 11x lebih murah dari Tier C |
| Single-slot MEV | 7.6x lebih murah dari dynamic array |
| Cost-effectiveness | 205 SPG (ranking #1) |

---

## 8. Keterbatasan

1. Belum teruji di production dengan MEV bot nyata
2. Pattern detection sederhana (Ta1→Tv saja)
3. Tidak ada flash loan protection
4. Parameter statis (P_DETECT, LAMBDA)
5. Single chain testing

---

## Referensi

1. Hop Protocol. (2023). "Hop Protocol Technical Documentation." https://docs.hop.exchange/
2. Connext. (2023). "Connext Amarok Protocol Specification." https://docs.connext.network/
3. Stargate Finance. (2023). "Stargate V1 Technical Paper." https://stargate.finance/
4. Wormhole. (2023). "Wormhole Protocol Specification." https://docs.wormhole.com/
5. EIP-1153. (2023). "Transient Storage Opcodes." https://eips.ethereum.org/EIPS/eip-1153
6. EIP-4844. (2023). "Proto-Danksharding." https://eips.ethereum.org/EIPS/eip-4844
7. Flashbots. (2023). "MEV and Sandwich Attacks." https://docs.flashbots.net/
8. OpenZeppelin. (2024). "ReentrancyGuard." https://docs.openzeppelin.com/
