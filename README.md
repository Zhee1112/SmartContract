# Gas Optimization and Security of Smart Contract Bridge Based on EIP-1153 Transient Storage in 4-Tier Architecture

## Arsitektur 4-Tier

```
[Tier A] UnoptimizedBridge    -> Baseline, tidak dioptimasi, rentan reentrancy
[Tier B] BridgeStaticOnly     -> Optimasi statis (struct packing, CEI, custom errors, immutable)
[Tier C] VictimBridge         -> Optimasi statis + dinamis (EIP-1153 TSTORE + EWS MonitorMock)
[Tier D] LightweightBridge    -> Optimasi inline (EIP-1153 tanpa external calls)
```

## Fitur Utama

| Fitur | Tier A | Tier B | Tier C | Tier D |
|-------|--------|--------|--------|--------|
| Variable Packing | - | ✅ | ✅ | ✅ |
| Pola CEI | - | ✅ | ✅ | ✅ |
| Unchecked Arithmetic | - | ✅ | ✅ | ✅ |
| Custom Errors | - | ✅ | ✅ | ✅ |
| Immutable Admin | - | ✅ | ✅ | ✅ |
| EIP-1153 TSTORE/TLOAD | - | - | ✅ | ✅ (inline) |
| Early Warning System | - | - | ✅ | ✅ (inline) |
| Deteksi MEV Sandwich | - | - | ✅ | ✅ |
| Penalti Ekonomi Dinamis | - | - | ✅ | ✅ |
| Emergency Pause | - | - | ✅ | ✅ |

## Setup

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Build
forge build

# Test
forge test

# Test dengan verbose output
forge test -v

# Gas snapshot
forge snapshot
```

## Struktur Project

```
src/
  UnoptimizedBridge.sol    -> Tier A (baseline)
  BridgeStaticOnly.sol     -> Tier B (static optimization)
  VictimBridge.sol         -> Tier C (dynamic optimization)
  MonitorMock.sol          -> Early Warning System (EWS)
  Attacker.sol             -> Reentrancy attack simulator
  BridgeWithSSTOREGuard.sol -> SSTORE-based guard (untuk perbandingan gas)

test/
  MultiContractTest.t.sol     -> 3-way comparison (gas, reentrancy, MEV, economic deterrence)
  FuzzTest.t.sol              -> Fuzz tests untuk semua tier
  InvariantTest.t.sol         -> Invariant tests
  GasStatsTest.t.sol          -> 30-sample statistical replication
  OZGuardComparison.t.sol     -> SSTORE vs EIP-1153 gas comparison
  EIP1153Benchmark.t.sol      -> Pure opcode gas benchmarks
  EdgeCaseTest.t.sol          -> 33 edge case tests
  VictimBridgeSecurityTest.t.sol -> 19 dedicated security tests

scripts/
  dynamic_submission_engine.py  -> Dynamic Rollup Submission Engine (Blob vs Calldata)
  deteksi_dan_ekonomi.py        -> MEV Detection Simulator

docs/
  SKRIPSI_PLAN.md          -> Master plan skripsi
  THREAT_MODEL.md          -> Formal threat model
  METHODOLOGY.md           -> Mathematical framework
  LITERATURE_REVIEW.md     -> 62+ references
  IMPLEMENTATION_CHECKLIST.md -> 78 tasks
  CODEBASE_IMPROVEMENT_PLAN.md -> 30 improvement items
```

## Jalankan Simulation Python

```bash
# Dynamic Rollup Engine
python scripts/dynamic_submission_engine.py

# MEV Detection
python scripts/deteksi_dan_ekonomi.py
```

## Dashboard

Buka `index.html` di browser untuk visualisasi hasil penelitian dan simulasi rollup engine.

## Environment Variables

Copy `.env.example` ke `.env` dan isi dengan data Anda:

```bash
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=your_api_key_here
PRIVATE_KEY=your_private_key_here
```

## License

MIT
