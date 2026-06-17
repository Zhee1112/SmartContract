# Implementation Checklist

## Status Legend
- ⬜ Belum dikerjakan / Dikerjakan sendiri oleh penulis
- ✅ Selesai
- ❌ Dibatalkan / Blocked
- ⏸️ Ditunda (membutuhkan resource eksternal)

---

## Phase 1: Fondasi Akademik

| # | Task | Output | Status |
|---|------|--------|--------|
| 1.1 | Baca EIP-1153 specification | Pemahaman TSTORE/TLOAD | ✅ |
| 1.2 | Baca EIP-4844 specification | Pemahaman Blob transactions | ✅ |
| 1.3 | Kumpulkan 30+ paper relevan | Folder referensi (81 refs) | ✅ |
| 1.4 | Buat outline skripsi | `SKRIPSI_PLAN.md` | ✅ |
| 1.5 | Tulis formal threat model | `docs/THREAT_MODEL.md` | ✅ |
| 1.6 | Buat mathematical framework | `docs/METHODOLOGY.md` | ✅ |
| 1.7 | Identifikasi 3 bridge protocols | Data comparison | ✅ |
| 1.8 | Buat threat matrix | Mitigation matrix in THREAT_MODEL.md | ✅ |
| 1.9 | Buat baseline comparison table | Gas cost comparison | ✅ |
| 1.10 | Formalisasi invariant properties | 4 invariant tests | ✅ |
| 1.11 | Tulis experimental design | Variables, controls, replication | ✅ |
| 1.12 | Review literature dengan dosen | 21 jurnal + 81 referensi | ✅ |

---

## Phase 2: Smart Contract Enhancement

| # | Task | Output | Status |
|---|------|--------|--------|
| 2.1 | Install Slither | `slither --version` | ✅ |
| 2.2 | Jalankan Slither pada semua kontrak | `slither_results.json` + `SECURITY_AUDIT.md` | ✅ |
| 2.3 | Install Mythril | `myth version` | ❌ BLOCKED (coincurve build failure Windows) |
| 2.4 | Jalankan Mythril analysis | Laporan security | ❌ BLOCKED |
| 2.5 | Buat invariant tests (forge) | `InvariantTest.t.sol` (4 tests) | ✅ |
| 2.6 | Bandingkan dengan OpenZeppelin ReentrancyGuard | `OZGuardComparison.t.sol` | ✅ |
| 2.7 | Buat fuzz tests | `FuzzTest.t.sol` (8 tests, 256 runs) | ✅ |
| 2.8 | Generate gas report | `.gas-snapshot` + `GasStatsTest.t.sol` | ✅ |
| 2.9 | Deploy ke Sepolia testnet | Verified contract | ⏸️ DITUNDA (wallet 0 ETH) |
| 2.10 | Deploy ke Arbitrum Sepolia | Verified contract | ⏸️ DITUNDA |
| 2.11 | Dokumentasi deployment | Tx hash + address | ⏸️ DITUNDA |
| 2.12 | Gas report final (testnet) | Tabel final | ⏸️ DITUNDA |

---

## Phase 3: Dynamic Engine Enhancement

| # | Task | Output | Status |
|---|------|--------|--------|
| 3.1 | Ambil historis gas price dari Etherscan | `fetch_gas_prices.py` | ✅ |
| 3.2 | Update Python script dengan real data | `dynamic_submission_engine.py` | ✅ |
| 3.3 | Implementasi Monte Carlo (n=100) | Statistical results | ✅ |
| 3.4 | Hitung mean, std dev, confidence interval | Welch's t-test, Cohen's d = 220.64 | ✅ |
| 3.5 | Analisis inclusion delay | Formula + grafik | ✅ |
| 3.6 | Hitung MEV profit sebelum/sesudah EWS | `deteksi_dan_ekonomi.py` | ✅ |
| 3.7 | Update dashboard dengan real data | `index.html` | ✅ |
| 3.8 | Tambahkan statistical overlay | Mean + CI band | ✅ |
| 3.9 | Tambahkan export to PNG | `logs/*.png` | ✅ |
| 3.10 | Validasi hasil simulasi | Cross-check Python vs Dashboard | ✅ |

---

## Phase 4: Dashboard & Visualization

| # | Task | Output | Status |
|---|------|--------|--------|
| 4.1 | Buat bridge comparison dashboard | `index.html` (2 tabs) | ✅ |
| 4.2 | Tambahkan export to PDF | Fitur download | ⬜ |
| 4.3 | Tambahkan real-time cost tracking | Live simulation | ✅ |
| 4.4 | Screenshot untuk laporan | `logs/*.png` | ✅ |
| 4.5 | Buat flow diagram | `docs/ARCHITECTURE.md` | ✅ |
| 4.6 | Buat UML diagram | `docs/ARCHITECTURE.md` (Mermaid) | ✅ |

---

## Phase 5: Testing & Validation

| # | Task | Output | Status |
|---|------|--------|--------|
| 5.1 | Testnet walkthrough: deposit | Tx hash | ⏸️ DITUNDA |
| 5.2 | Testnet walkthrough: withdraw | Tx hash | ⏸️ DITUNDA |
| 5.3 | Testnet walkthrough: swap | Tx hash | ⏸️ DITUNDA |
| 5.4 | Video dokumentasi testnet | Video MP4 | ⏸️ DITUNDA |
| 5.5 | Attack simulation: reentrancy | 5 tests (VictimBridgeSecurityTest) | ✅ |
| 5.6 | Attack simulation: MEV sandwich | `testMEV_SandwichDetectedVictim` | ✅ |
| 5.7 | Dokumentasi serangan | 86 tests documented | ✅ |
| 5.8 | Paired t-test (n>=30) | t = 1680.67, p = 2.25e-222 | ✅ |
| 5.9 | Confidence interval 95% | [98.18%, 98.23%] | ✅ |
| 5.10 | Effect size (Cohen's d) | d = 220.64 (LARGE) | ✅ |
| 5.11 | Reject/fail to reject H0 | REJECT H0 | ✅ |

---

## Phase 6: Paper Writing

| # | Task | Output | Status |
|---|------|--------|--------|
| 6.1-6.4 | Bab 1: Pendahuluan | ~4 halaman | ⬜ Dikerjakan sendiri |
| 6.5-6.8 | Bab 2: Tinjauan Pustaka | ~7 halaman | ⬜ Dikerjakan sendiri |
| 6.9-6.11 | Bab 3: Metodologi | ~6 halaman | ⬜ Dikerjakan sendiri |
| 6.12-6.15 | Bab 4: Implementasi | ~8 halaman | ⬜ Dikerjakan sendiri |
| 6.16-6.20 | Bab 5: Hasil & Analisis | ~8 halaman | ⬜ Dikerjakan sendiri |
| 6.21-6.23 | Bab 6: Penutup | ~2 halaman | ⬜ Dikerjakan sendiri |
| 6.24-6.27 | Finalisasi | Siap submit | ⬜ Dikerjakan sendiri |

---

## Progress Tracker

| Phase | Total | Selesai | Blocked/Ditunda | Progress |
|-------|-------|---------|-----------------|----------|
| Phase 1: Fondasi Akademik | 12 | 12/12 | 0 | 100% |
| Phase 2: Smart Contract | 12 | 8/12 | 4 (2 Mythril + 2 Deploy) | 67% |
| Phase 3: Dynamic Engine | 10 | 10/10 | 0 | 100% |
| Phase 4: Dashboard | 6 | 5/6 | 0 | 83% |
| Phase 5: Testing | 11 | 7/11 | 4 (Testnet) | 64% |
| Phase 6: Paper Writing | 27 | 0/27 | 0 (mandiri) | 0% |
| **TOTAL (Technical)** | **51** | **42/51** | **8** | **82%** |

> Catatan: Phase 6 (Paper Writing) dikerjakan secara mandiri oleh penulis skripsi.
> Phase 2.3-2.4 (Mythril) blocked di Windows karena build failure coincurve.
> Phase 2.9-2.12 & 5.1-5.4 (Testnet) ditunda karena wallet belum memiliki ETH.
