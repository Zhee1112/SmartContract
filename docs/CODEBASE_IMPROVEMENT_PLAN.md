# Codebase Improvement Plan

> Dokumen ini mencatat seluruh gap yang ditemukan dari analisis codebase dan rencana perubahan yang akan dikerjakan.

---

## Status Legend

- ⬜ Belum dikerjakan
- 🔄 Sedang dikerjakan
- ✅ Selesai
- ❌ Dibatalkan

---

## KRITIS — Wajib Diperbaiki

### 1. VictimBridge: Custom Errors

| Item | Detail |
|------|--------|
| File | `src/VictimBridge.sol` |
| Masalah | Masih pakai `require()` string (~50 gas/revert lebih boros dari custom errors) |
| Fix | Ganti semua `require()` dengan custom errors seperti di `BridgeStaticOnly.sol` |
| Baris | 54, 77, 84, 85, 105, 115, 129, 130 |
| Status | ✅ Selesai (02 Jun 2026) |

### 2. VictimBridge: Immutable Admin

| Item | Detail |
|------|--------|
| File | `src/VictimBridge.sol` |
| Masalah | `address public admin` (line 31) tidak `immutable` — BridgeStaticOnly sudah pakai `immutable` |
| Fix | Tambahkan `immutable` modifier |
| Status | ✅ Selesai (02 Jun 2026) |

### 3. MonitorMock: Access Control

| Item | Detail |
|------|--------|
| File | `src/MonitorMock.sol` |
| Masalah | `updateParameters()`, `recordTransaction()`, `clearRecords()` bisa dipanggil siapa saja |
| Fix | Tambahkan `onlyAdmin` modifier + state variable `address public admin` |
| Status | ✅ Selesai (02 Jun 2026) |

### 4. MonitorMock: Auto-Record dari VictimBridge

| Item | Detail |
|------|--------|
| File | `src/MonitorMock.sol` + `src/VictimBridge.sol` |
| Masalah | `recordTransaction()` dipanggil dari luar (test) — VictimBridge tidak auto-record transaksi |
| Fix | VictimBridge harus panggil `monitor.recordTransaction()` otomatis di `deposit()`, `withdraw()`, `swapETHForTokens()` |
| Status | ✅ Selesai (02 Jun 2026) |

### 5. Invariant Tests

| Item | Detail |
|------|--------|
| File | `test/InvariantTest.t.sol` (baru) |
| Masalah | Tidak ada invariant test — 4 invariant di threat model belum dites |
| Fix | Buat invariant tests untuk: `sum(balances) == totalDeposits`, `callDepth >= 0`, `callDepth <= 1`, `balances >= 0` |
| Status | ✅ Selesai (02 Jun 2026) — perlu Foundry untuk test |

### 6. Fuzz Tests

| Item | Detail |
|------|--------|
| File | `test/FuzzTest.t.sol` (baru) |
| Masalah | Tidak ada fuzz test untuk bridge contracts |
| Fix | Buat fuzz tests: `testFuzz_DepositOverflow(uint256)`, `testFuzz_WithdrawExceedsBalance(uint256, uint256)`, `testFuzz_SwapFormulaCorrectness(uint96)`, `testFuzz_PenaltyCalculation(uint256, uint256)` |
| Status | ✅ Selesai (02 Jun 2026) — perlu Foundry untuk test |

### 7. OpenZeppelin ReentrancyGuard Comparison

| Item | Detail |
|------|--------|
| File | `src/BridgeWithSSTOREGuard.sol` (baru) + `test/OZGuardComparison.t.sol` (baru) |
| Masalah | Tidak ada comparison dengan standar industri (OpenZeppelin ReentrancyGuard) |
| Fix | Buat bridge contract yang pakai SSTORE-based guard, bandingkan gas dengan 3-tier |
| Status | ✅ Selesai (02 Jun 2026) — perlu Foundry untuk test |

### 8. Swap Gas Benchmark

| Item | Detail |
|------|--------|
| File | `test/MultiContractTest.t.sol` |
| Masalah | Tidak ada `testGasSwap()` — `swapETHForTokens()` belum di-benchmark |
| Fix | Tambahkan `testGasSwap()` yang membandingkan gas swap di 3-tier |
| Status | ✅ Selesai (02 Jun 2026) — perlu Foundry untuk test |

### 9. 30-Sample Replication

| Item | Detail |
|------|--------|
| File | `test/MultiContractTest.t.sol` |
| Masalah | Setiap gas benchmark hanya jalan 1x — tidak ada statistical significance |
| Fix | Bungkus setiap benchmark dalam loop 30+ iterasi, hitung mean/stddev/min/max |
| Status | ✅ Selesai (02 Jun 2026) — perlu Foundry untuk test |

### 10. Economic Deterrence Test

| Item | Detail |
|------|--------|
| File | `test/MultiContractTest.t.sol` (baru) |
| Masalah | Klaim "penalti membuat attacker rugi" belum dibuktikan dengan test |
| Fix | Test yang hitung expected utility attacker, buktikan `U < 0` untuk range volume |
| Status | ✅ Selesai (02 Jun 2026) — perlu Foundry untuk test |

### 11. Deployment Scripts

| Item | Detail |
|------|--------|
| File | `script/DeploySepolia.s.sol` (baru) |
| Masalah | Tidak ada deployment script — `script/` hanya ada Counter template |
| Fix | Buat script deploy 3-tier + MonitorMock + Attacker dalam satu transaksi |
| Status | ✅ Selesai (04 Jun 2026) |

### 12. Fix `.env`

| Item | Detail |
|------|--------|
| File | `.env` |
| Masalah | Berisi data project lain (IDR Payroll System, Polygon/Mumbai RPC) |
| Fix | Ganti dengan Sepolia RPC + Etherscan API key |
| Status | ✅ Selesai (04 Jun 2026) |

### 13. Testnet Deployment

| Item | Detail |
|------|--------|
| File | — |
| Masalah | Belum ada deployed contract di testnet |
| Fix | Deploy ke Sepolia/Arbitrum Sepolia, verify di Etherscan, dokumentasi tx hash |
| Status | ❌ DITUNDA — wallet 0 ETH, skip untuk sementara |

### 14. README.md

| Item | Detail |
|------|--------|
| File | `README.md` |
| Masalah | Masih template Foundry default — tidak ada info skripsi |
| Fix | Tulis README lengkap: judul, 3-tier architecture, cara run tests, cara run simulation, deployed contracts |
| Status | ✅ Selesai (04 Jun 2026) |

### 15. Hapus Artifacts

| Item | Detail |
|------|--------|
| File | `src/Counter.sol`, `test/Counter.t.sol`, `src/BridgeUnoptimized.sol`, `src/BridgeOptimized.sol` |
| Masalah | Template artifacts + duplicate contracts membingungkan |
| Fix | Hapus semua file ini dari codebase |
| Status | ✅ Selesai (04 Jun 2026) |

---

## TINGGI — Melemahkan Skripsi

### 16. Python: Monte Carlo Simulation

| Item | Detail |
|------|--------|
| File | `scripts/dynamic_submission_engine.py` |
| Masalah | Hanya 1 run — tidak ada statistical validity |
| Fix | Tambah loop 100x, hitung mean/stddev/CI untuk static cost, dynamic cost, savings |
| Status | ✅ Selesai (04 Jun 2026) |

### 17. Python: Real Gas Price Data

| Item | Detail |
|------|--------|
| File | `scripts/fetch_gas_prices.py` (baru) |
| Masalah | Data gas price masih synthetic (`np.random.normal`) |
| Fix | Fetch historis L1 base fee + blob base fee dari Etherscan API, simpan sebagai CSV |
| Status | ✅ Selesai (04 Jun 2026) |

### 18. Python-Dashboard Parameter Sync

| Item | Detail |
|------|--------|
| File | `scripts/generate_dashboard.py` (baru) |
| Masalah | Dashboard pakai `ALPHA_COMPRESSION=0.88`, Python tidak — hasil tidak comparable |
| Fix | Samakan parameter: `ALPHA_COMPRESSION`, `TARGET_BATCH_BYTES`, `MAX_LATENCY` |
| Status | ✅ Selesai (04 Jun 2026) |

### 19. Python: Statistical Output

| Item | Detail |
|------|--------|
| File | `scripts/generate_dashboard.py` + `logs/monte_carlo_statistical_report.txt` |
| Masalah | Output hanya 1 baris — tidak ada mean, std dev, CI |
| Fix | Tambahkan statistical output lengkap + save ke JSON/CSV |
| Status | ✅ Selesai (04 Jun 2026) |

### 20. Dashboard: Bridge Gas Comparison Page

| Item | Detail |
|------|--------|
| File | `logs/bridge_gas_comparison.png` (baru) |
| Masalah | Dashboard hanya visualisasi rollup engine — tidak ada bridge gas comparison |
| Fix | Buat halaman baru: bar chart 3-tier (deposit/withdraw/swap), TSTORE vs SSTORE breakdown |
| Status | ✅ Selesai (04 Jun 2026) |

### 21. Dashboard: Export to PNG/PDF

| Item | Detail |
|------|--------|
| File | `logs/bridge_gas_comparison.png` + `logs/monte_carlo_results.png` |
| Masalah | Tidak ada fitur download grafik untuk laporan |
| Fix | Tambah tombol export PNG per chart (pakai `canvas.toDataURL()`) |
| Status | ✅ Selesai (04 Jun 2026) |

### 22. Dashboard: Statistical Overlay

| Item | Detail |
|------|--------|
| File | `logs/monte_carlo_results.png` |
| Masalah | Tidak ada mean + CI band di chart |
| Fix | Setelah Monte Carlo, tampilkan mean line + shaded 95% CI band |
| Status | ✅ Selesai (04 Jun 2026) |

### 23. Edge Case Tests

| Item | Detail |
|------|--------|
| File | `test/EdgeCaseTest.t.sol` (baru) |
| Masalah | Tidak ada test untuk edge cases |
| Fix | Test: deposit 0, withdraw = balance, withdraw > balance, swap amountIn 0, pool kosong, double deposit, multi-user concurrent |
| Status | ✅ Selesai (04 Jun 2026) |

### 24. EIP-1153 vs SSTORE Mutex Benchmark

| Item | Detail |
|------|--------|
| File | `test/EIP1153Benchmark.t.sol` (baru) |
| Masalah | Klaim TSTORE hemat 22,700 gas vs SSTORE — belum ada test yang mengukur ini |
| Fix | Buat test bandingkan gas withdraw dengan mutex SSTORE vs TSTORE |
| Status | ✅ Selesai (04 Jun 2026) |

### 25. forge snapshot

| Item | Detail |
|------|--------|
| File | `.gas-snapshot` (generated) |
| Masalah | Belum pernah dijalankan — baseline gas tidak reproducible |
| Fix | Jalankan `forge snapshot`, commit hasilnya |
| Status | ✅ Selesai (04 Jun 2026) |

---

## NICE-TO-HAVE

### 26. Slither Analysis

| Item | Detail |
|------|--------|
| File | `docs/SECURITY_AUDIT.md` (baru) |
| Masalah | Tidak ada static analysis |
| Fix | Jalankan Slither pada semua kontrak, simpan hasil di docs |
| Status | ✅ Selesai (04 Jun 2026) — 80 findings |

### 27. Mythril Analysis

| Item | Detail |
|------|--------|
| File | `docs/SECURITY_AUDIT.md` (baru) |
| Masalah | Tidak ada symbolic execution analysis |
| Fix | Jalankan Mythril pada VictimBridge + MonitorMock |
| Status | ⬜ |

### 28. NatSpec Documentation

| Item | Detail |
|------|--------|
| File | Semua `.sol` di `src/` |
| Masalah | Function documentation minim |
| Fix | Tambah `@notice`, `@param`, `@return`, `@dev` pada semua public function |
| Status | ✅ Selesai (04 Jun 2026) |

### 29. CI/CD Pipeline

| Item | Detail |
|------|--------|
| File | `.github/workflows/test.yml` |
| Masalah | Tidak ada GitHub Actions |
| Fix | Buat workflow: `forge test` + `forge build` on push + Python simulation |
| Status | ✅ Selesai (04 Jun 2026) |

### 30. foundry.toml Deployment Profiles

| Item | Detail |
|------|--------|
| File | `foundry.toml` |
| Masalah | Hanya ada `[profile.default]` |
| Fix | Tambah `[profile.sepolia]` dan `[profile.mainnet]` |
| Status | ✅ Selesai (04 Jun 2026) |

---

## Execution Sequence

### Minggu 1: Fix Foundational Issues
1. Hapus artifacts (`Counter.sol`, `Counter.t.sol`, `BridgeUnoptimized.sol`, `BridgeOptimized.sol`)
2. Fix VictimBridge (custom errors + immutable admin)
3. Fix MonitorMock (onlyAdmin + auto-record)
4. Fix `.env`
5. Update README.md

### Minggu 2: Tests
6. Buat invariant tests
7. Buat fuzz tests
8. Buat edge case tests
9. Tambah swap gas benchmark
10. Tambah 30-sample replication

### Minggu 3: Comparisons
11. Buat OpenZeppelin ReentrancyGuard bridge
12. Buat EIP-1153 vs SSTORE benchmark
13. Buat economic deterrence test
14. Jalankan `forge snapshot`

### Minggu 4: Deployment
15. Buat deployment script
16. Deploy ke testnet
17. Verify di Etherscan
18. Dokumentasi tx hash

### Minggu 5-6: Rollup Engine
19. Monte Carlo (n=100)
20. Fetch real gas price data
21. Sync parameters Python-Dashboard
22. Statistical output

### Minggu 7-8: Dashboard
23. Bridge gas comparison dashboard
24. Export to PNG
25. Statistical overlay
26. Deploy dashboard ke GitHub Pages

### Minggu 9+: Polish
27. Slither + Mythril
28. NatSpec documentation
29. CI/CD pipeline
30. Final review

---

## Progress Summary

| Kategori | Total | Completed | Status |
|----------|-------|-----------|--------|
| Kritis | 15 | 14 | 1 deferred (deployment) |
| Tinggi | 10 | 10 | All done |
| Nice-to-have | 5 | 4 | 1 blocked (Mythril) |
| **TOTAL** | **30** | **28** | 1 deferred, 1 blocked |
