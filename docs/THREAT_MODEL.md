# Formal Threat Model

## 1. Assumptions

### 1.1 Network Assumptions
- Ethereum L1 dan L2 (Arbitrum/Optimism) beroperasi normal
- Blob transactions (EIP-4844) tersedia di Cancun fork ke atas
- Gas price berfluktuasi secara normal (10-150 Gwei L1, 1-30 Gwei Blob)
- Block time ~12 detik (L1)

### 1.2 Actor Model
| Actor | Deskripsi | Keterangan |
|-------|-----------|------------|
| **User** | Pengguna bridge yang melakukan deposit/withdraw/swap | Benih (honest) |
| **Bridge Operator** | Pengelola smart contract bridge | Semi-trusted |
| **Attacker** | Penyerang yang mencoba eksploitasi bridge | Adversarial |
| **MEV Bot** | Bot yang mencari keuntungan dari sandwich attack | Adversarial |
| **Rollup Sequencer** | Operator yang mengirim batch ke L1 | Semi-trusted |

### 1.3 Security Assumptions
- Smart contract code bersifat **deterministic** dan **immutable** setelah deployment
- Cryptographic primitives (hash, signature) aman secara komputasional
- EVM execution model tidak berubah selama transaksi berjalan
- Validator Ethereum adalah rational actor (tidak colluding)

---

## 2. Attack Vectors

### 2.1 Reentrancy Attack

**Deskripsi**: Attacker melakukan panggilan rekursif ke fungsi withdraw sebelum state balance diupdate.

**Formal Definition**:
```
Attacker.call(withdraw(amount)) → Bridge.transfer(attacker, amount) → attacker.receive() → Attacker.call(withdraw(amount)) [RECURSIVE]
```

**Target**:
- [A] UnoptimizedBridge → **VULNERABLE** (Interactions sebelum Effects)
- [B] BridgeStaticOnly → **MITIGATED** (CEI pattern — Effects sebelum Interactions)
- [C] VictimBridge → **MITIGATED** (CEI + EIP-1153 callDepth guard)

**Casus Studi**:
- Ronin Bridge (2022): $620M — Reentrancy pada validator set withdrawal
- Wormhole (2022): $320M — Signature verification bypass

### 2.2 MEV Sandwich Attack

**Deskripsi**: Attacker membungkus transaksi korban dengan frontrun (Ta1) dan backrun (Ta2) untuk mendapatkan keuntungan dari perubahan harga.

**Formal Definition**:
```
Ta1: Attacker.swap(ETH → Token) di harga rendah
Tv:  Victim.swap(ETH → Token) menaikkan harga (slippage)
Ta2: Attacker.swap(Token → ETH) di harga tinggi
Profit = Ta2.output - Ta1.input
```

**Target**:
- [A] UnoptimizedBridge → **VULNERABLE** (Tidak ada deteksi MEV)
- [B] BridgeStaticOnly → **PARTIAL** (Ada minTokensOut, tapi tidak ada deteksi on-chain)
- [C] VictimBridge → **MITIGATED** (EWS mendeteksi pola Ta1→Tv, kenakan penalti)

**Formula Penalti**:
```
Penalty = Amount �, (λ �, P_detect / 100,000,000)

λ = Faktor Penalti Risiko (default: 15000 = 1.5x)
P_detect = Probabilitas Deteksi (default: 9600 = 96%)
```

### 2.3 Front-Running / Back-Running

**Deskripsi**: Attacker melihat transaksi pending di mempool dan menjalankan transaksi sendiri terlebih dahulu.

**Mitigasi**:
- **Commit-reveal scheme** (opsional)
- **Encrypted mempool** (futuristik)
- **On-chain monitoring** (implementasi saat ini via MonitorMock)

### 2.4 Flash Loan Attack

**Deskripsi**: Attacker meminjam dana besar dalam satu transaksi untuk memanipulasi harga.

**Mitigasi**:
- **TWAP (Time-Weighted Average Price)** untuk oracle
- **Slippage protection** (minTokensOut)
- **Rate limiting** (opsional)

### 2.5 Denial of Service (DoS)

**Deskripsi**: Attacker membanjiri bridge dengan transaksi kecil untuk meningkatkan gas cost.

**Mitigasi**:
- **Minimum deposit amount**
- **Gas limit per transaksi**
- **Batch processing**

---

## 3. Security Properties

### 3.1 Confidentiality
- **Tidak dijamin**: Semua transaksi di blockchain bersifat public
- **Partially mitigated**: Encrypted calldata (futuristik)

### 3.2 Integrity
- **Dijamin oleh EVM**: State transitions bersifat deterministic
- **Dijamin oleh CEI**: Effects sebelum Interactions mencegah inconsistent state
- **Dijamin oleh EIP-1153**: Transient storage auto-reset mencegah state corruption

### 3.3 Availability
- **Dijamin oleh Ethereum**: L1/L2 selama beroperasi normal
- **DoS risk**: Minimized oleh minimum deposit + gas limits

### 3.4 Non-repudiation
- **Dijamin oleh blockchain**: Semua transaksi tercatat di L1/L2

### 3.5 Liveness
- **Dijamin**: Tidak ada mekanisme lock permanen
- **EIP-1153 advantage**: Transient storage auto-reset, tidak perlu manual unlock

---

## 4. Defense Mechanisms (Implementation)

### 4.1 Static Defense (Tier B)
| Mekanisme | Fungsi | Gas Cost |
|-----------|--------|----------|
| Variable packing | Mengurangi storage slots | ~11,447 gas/deploy |
| CEI pattern | Mencegah reentrancy | ~0 gas (structural) |
| Unchecked arithmetic | Mengurangi overflow check | ~20 gas/operasi |
| Custom errors | Menggantikan require string | ~50 gas/revert |
| Calldata parameter | Hemat memory copy | ~100 gas/panggilan |
| Immutable admin | Tidak memakan storage | ~0 gas read |

### 4.2 Dynamic Defense (Tier C)
| Mekanisme | Fungsi | Gas Cost |
|-----------|--------|----------|
| EIP-1153 TSTORE | Call depth tracking | ~100 gas/read-write |
| MonitorMock.enterCall() | Increment callDepth | ~200 gas |
| MonitorMock.exitCall() | Decrement callDepth | ~200 gas |
| checkAnomaly() | Deteksi MEV sandwich | ~500 gas |
| calculatePenalty() | Hitung penalti ekonomi | ~200 gas |

### 4.3 Gas Comparison (SSTORE vs TSTORE)
```
SSTORE cold write:  ~20,000 gas
SSTORE warm write:  ~2,900 gas
TSTORE write:       ~100 gas
TLOAD read:         ~100 gas

Savings: ~200x (cold) atau ~29x (warm)
```

---

## 5. Threat Mitigation Matrix

| Threat | Probability | Impact | Mitigation | Residual Risk |
|--------|-------------|--------|------------|---------------|
| Reentrancy | Medium | Critical | CEI + EIP-1153 callDepth | Low |
| MEV Sandwich | High | Medium | EWS detection + penalty | Low |
| Front-running | High | Low | Monitoring + min slippage | Medium |
| Flash loan | Low | High | TWAP + slippage protection | Low |
| DoS | Low | Medium | Minimum deposit + gas limits | Low |
| Oracle manipulation | Low | High | On-chain TWAP | Low |

---

## 6. Formal Verification Goals

### 6.1 Invariant Properties
```
// Invariant 1: Total deposits = sum of all balances
sum(balances[user]) == totalDeposits

// Invariant 2: callDepth >= 0
callDepth >= 0

// Invariant 3: callDepth <= 1 during external call
require(callDepth <= 1) // during withdraw execution

// Invariant 4: balance cannot go negative
balances[user] >= 0 // always
```

### 6.2 Pre/Post Conditions
```
// withdraw(amount)
PRE:  balances[msg.sender] >= amount
POST: balances[msg.sender] == old(balances[msg.sender]) - amount
      totalDeposits == old(totalDeposits) - amount
      msg.sender.balance += amount
```

---

## 7. Assumptions yang Diperlukan untuk Paper

1. **Gas price**: Rata-rata L1 40 Gwei, Blob 5 Gwei (realistis untuk 2024-2026)
2. **Transaction throughput**: 30 tx/blok (realistis untuk L2)
3. **Attack frequency**: 5% dari transaksi adalah MEV probes
4. **Detection probability**: 96% (parameter P_detect)
5. **Penalty factor**: 1.5x (parameter λ)
6. **Compression ratio**: 88% (realistis untuk rollup compression)
