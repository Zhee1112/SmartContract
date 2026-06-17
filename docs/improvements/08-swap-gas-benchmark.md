# Improvement #8: Swap Gas Benchmark

> Menambahkan gas benchmark untuk `swapETHForTokens()` di 3-tier bridge

---

## Status

| Item | Nilai |
|------|-------|
| File yang diubah | `test/MultiContractTest.t.sol` |
| Prioritas | KRITIS |
| Estimasi waktu | 20-30 menit |
| Difficulty | Mudah |
| Status | ✅ SELESAI (02 Jun 2026) |
| Compile | ⏳ Perlu Foundry (forge-std dependency) |

---

## Masalah

Sekarang hanya **deposit** dan **withdraw** yang di-benchmark. Tapi `swapETHForTokens()` adalah function **paling penting** karena:
- Menggunakan MEV penalty logic (EWS)
- Menggunakan constant product formula
- Menggunakan struct packing untuk reserves
- Tempat sandwich attack terjadi

---

## Yang Harus Dilakukan

Tambahkan `testGasSwap()` di `test/MultiContractTest.t.sol`:

```solidity
// =========================================================
// PENGUJIAN 8: Benchmark Gas Swap — Tiga Arah
// =========================================================

/**
 * @dev Membandingkan konsumsi gas fungsi swapETHForTokens() pada ketiga kontrak.
 *      [A] Tanpa slippage protection, tanpa EWS
 *      [B] Dengan slippage protection, tanpa EWS
 *      [C] Dengan slippage protection + EWS + penalty
 */
function testGasSwap() public {
    console.log("==================================================");
    console.log("       BENCHMARK 8: GAS SWAP FUNGSI              ");
    console.log("==================================================");

    // Setup: fund bridge pools
    vm.deal(address(unoptBridge), 1000 ether);
    vm.deal(address(staticBridge), 1000 ether);
    vm.deal(address(victimBridge), 1000 ether);

    // [A] Unoptimized — tanpa slippage, tanpa EWS
    vm.startPrank(bob);
    uint256 g0 = gasleft();
    unoptBridge.swapETHForTokens{value: 1 ether}();  // Tidak ada param
    uint256 gasA = g0 - gasleft();
    vm.stopPrank();

    // [B] Static — dengan slippage protection, tanpa EWS
    vm.startPrank(bob);
    uint256 g1 = gasleft();
    staticBridge.swapETHForTokens{value: 1 ether}(0);  // minTokensOut = 0
    uint256 gasB = g1 - gasleft();
    vm.stopPrank();

    // [C] Dynamic — dengan slippage + EWS + penalty
    vm.startPrank(bob);
    uint256 g2 = gasleft();
    victimBridge.swapETHForTokens{value: 1 ether}(0);  // minTokensOut = 0
    uint256 gasC = g2 - gasleft();
    vm.stopPrank();

    console.log("[A] Unoptimized     :", gasA, "gas");
    console.log("[B] Static Only     :", gasB, "gas");
    console.log("[C] Dynamic (EWS)   :", gasC, "gas");
    console.log("--- Selisih A vs B  :", gasB > gasA ? gasB - gasA : gasA - gasB, gasB > gasA ? "gas overhead (slippage)" : "gas hemat");
    console.log("--- Selisih B vs C  :", gasC > gasB ? gasC - gasB : gasB - gasC, gasC > gasB ? "gas overhead (EWS)" : "gas hemat");
    console.log("--- Overhead EWS    :", gasC - gasA, "gas (EWS cost)");
    console.log("==================================================");

    assertTrue(gasA > 0 && gasB > 0 && gasC > 0);
}
```

---

## Penjelasan

### Kenapa `minTokensOut = 0`?

Karena kita ingin mengisolasi **gas overhead EWS**, bukan testing slippage protection. Dengan `minTokensOut = 0`, swap selalu berhasil (tidak revert karena slippage).

### Expected Gas Difference

| Bridge | Slippage Check | EWS Check | Penalty | Expected |
|--------|---------------|-----------|---------|----------|
| [A] Unoptimized | Tidak ada | Tidak ada | Tidak ada | Paling rendah |
| [B] Static | Ada (if check) | Tidak ada | Tidak ada | Sedikit lebih tinggi |
| [C] Dynamic | Ada (if check) | Ada (checkAnomaly + enterCall/exitCall) | Ada (calculatePenalty) | Paling tinggi |

**Overhead EWS = gasC - gasA** → Ini adalah biaya nyata EIP-1153 + MonitorMock.

### Data yang Dihasilkan

Untuk skripsi, data ini bisa dipakai untuk:
1. **Tabel perbandingan gas** di Bab 4 (Implementasi)
2. **Analisis overhead** EWS vs manfaat keamanan
3. **Cost-benefit analysis** — berapa gas yang diorbankan untuk proteksi MEV

---

## Tambahan: Benchmark dengan MEV Detection Active

Untuk skenario yang lebih realistis (ada MEV detection):

```solidity
function testGasSwap_WithMEVDetection() public {
    // Fund bridge
    vm.deal(address(victimBridge), 1000 ether);
    vm.deal(bob, 100 ether);

    // Rekor transaksi frontrun (simulasi attacker)
    monitor.recordTransaction(alice, 5 ether, 0);  // Ta1

    // Bob swap (victim)
    vm.startPrank(bob);
    uint256 g = gasleft();
    victimBridge.swapETHForTokens{value: 1 ether}(0);
    uint256 gasWithMEV = g - gasleft();
    vm.stopPrank();

    console.log("[C] Swap dengan MEV detection :", gasWithMEV, "gas");

    // Bandingkan tanpa MEV detection
    monitor.clearRecords();

    vm.startPrank(bob);
    uint256 g2 = gasleft();
    victimBridge.swapETHForTokens{value: 1 ether}(0);
    uint256 gasNoMEV = g2 - gasleft();
    vm.stopPrank();

    console.log("[C] Swap tanpa MEV detection  :", gasNoMEV, "gas");
    console.log("--- MEV detection overhead    :", gasWithMEV - gasNoMEV, "gas");
}
```

---

## Cara Jalankan

```bash
# Jalankan semua test di MultiContractTest
forge test --match-contract MultiContractTest -vvv

# Hanya testGasSwap
forge test --match-test testGasSwap -vvv

# Dengan gas report
forge test --match-test testGasSwap --gas-report
```

---

## Checklist

- [x] Tambah `testGasSwap()` di `MultiContractTest.t.sol`
- [ ] Jalankan `forge test --match-test testGasSwap -vvv` — perlu Foundry
- [ ] Catat angka gas untuk paper — perlu Foundry
