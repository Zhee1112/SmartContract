# Improvement #9: 30-Sample Replication

> Menambahkan statistical replication (30+ samples) ke semua gas benchmark

---

## Status

| Item | Nilai |
|------|-------|
| File yang diubah | `test/MultiContractTest.t.sol` |
| Prioritas | KRITIS |
| Estimasi waktu | 30-45 menit |
| Difficulty | Sedang |
| Status | ✅ SELESAI (02 Jun 2026) |
| File baru | `test/GasStatsTest.t.sol` |
| Compile | ⏳ Perlu Foundry (forge-std dependency) |

---

## Masalah

Sekarang setiap gas benchmark hanya jalan **1 kali**:

```solidity
// SEKARANG (1 sample — tidak valid secara statistik):
uint256 g0 = gasleft();
bridge.deposit{value: 1 ether}();
uint256 gasUsed = g0 - gasleft();  // ← hanya 1 angka
```

Gas bisa bervariasi antar run karena:
- **State warm/cold** — SSTORE pertama lebih mahal
- **Storage layout** — Slot yang baru diakses lebih mahal
- **EVM execution** — Variasi kecil

Untuk skripsi, butuh **minimum 100 sampel** untuk statistical validity yang kuat.

---

## Yang Harus Dilakukan

### Konsep

```solidity
// SESEUDAH (30 samples — valid secara statistik):
uint256[] memory results = new uint256[](30);

for (uint256 i = 0; i < 30; i++) {
    // Setup state (jika perlu)
    ...
    
    uint256 g = gasleft();
    bridge.deposit{value: 1 ether}();
    results[i] = g - gasleft();
    
    // Cleanup state (jika perlu)
    ...
}

// Hitung statistics
uint256 sum = 0;
uint256 min = type(uint256).max;
uint256 max = 0;
for (uint256 i = 0; i < 30; i++) {
    sum += results[i];
    if (results[i] < min) min = results[i];
    if (results[i] > max) max = results[i];
}
uint256 mean = sum / 30;

// Std dev (simplified)
uint256 sumSquaredDiff = 0;
for (uint256 i = 0; i < 30; i++) {
    int256 diff = int256(results[i]) - int256(mean);
    sumSquaredDiff += uint256(diff * diff);
}
// stdDev ≈ sqrt(sumSquaredDiff / 30)
```

---

## Kode: Contoh Implementasi

```solidity
// =========================================================
// BENCHMARK DENGAN 30-SAMPLE REPLICATION
// =========================================================

function testGasDeposit_30Samples() public {
    uint256 NUM_SAMPLES = 30;
    uint256[] memory gasResults = new uint256[](NUM_SAMPLES);
    address[] memory sampleUsers = new address[](NUM_SAMPLES);

    for (uint256 i = 0; i < NUM_SAMPLES; i++) {
        // Buat user unik untuk setiap sample (avoid state conflicts)
        sampleUsers[i] = address(uint160(uint256(keccak256(abi.encode(i)))));
        vm.deal(sampleUsers[i], 10 ether);

        vm.startPrank(sampleUsers[i]);
        uint256 g = gasleft();
        victimBridge.deposit{value: 1 ether}();
        gasResults[i] = g - gasleft();
        vm.stopPrank();
    }

    // Hitung statistics
    uint256 sum = 0;
    uint256 min = type(uint256).max;
    uint256 max = 0;
    for (uint256 i = 0; i < NUM_SAMPLES; i++) {
        sum += gasResults[i];
        if (gasResults[i] < min) min = gasResults[i];
        if (gasResults[i] > max) max = gasResults[i];
    }
    uint256 mean = sum / NUM_SAMPLES;

    console.log("==================================================");
    console.log("  GAS DEPOSIT — 30-SAMPLE REPLICATION             ");
    console.log("==================================================");
    console.log("Mean   :", mean, "gas");
    console.log("Min    :", min, "gas");
    console.log("Max    :", max, "gas");
    console.log("Range  :", max - min, "gas");
    console.log("==================================================");

    assertTrue(mean > 0, "Mean gas should be positive");
}

function testGasWithdraw_30Samples() public {
    uint256 NUM_SAMPLES = 30;
    uint256[] memory gasResults = new uint256[](NUM_SAMPLES);
    address[] memory sampleUsers = new address[](NUM_SAMPLES);

    for (uint256 i = 0; i < NUM_SAMPLES; i++) {
        sampleUsers[i] = address(uint160(uint256(keccak256(abi.encode(i + 1000)))));
        vm.deal(sampleUsers[i], 10 ether);
        vm.deal(address(victimBridge), 100 ether);

        // Setup: deposit dulu
        vm.prank(sampleUsers[i]);
        victimBridge.deposit{value: 5 ether}();

        // Benchmark withdraw
        vm.startPrank(sampleUsers[i]);
        uint256 g = gasleft();
        victimBridge.withdraw(1 ether);
        gasResults[i] = g - gasleft();
        vm.stopPrank();
    }

    // Hitung statistics
    uint256 sum = 0;
    uint256 min = type(uint256).max;
    uint256 max = 0;
    for (uint256 i = 0; i < NUM_SAMPLES; i++) {
        sum += gasResults[i];
        if (gasResults[i] < min) min = gasResults[i];
        if (gasResults[i] > max) max = gasResults[i];
    }
    uint256 mean = sum / NUM_SAMPLES;

    console.log("==================================================");
    console.log("  GAS WITHDRAW — 30-SAMPLE REPLICATION            ");
    console.log("==================================================");
    console.log("Mean   :", mean, "gas");
    console.log("Min    :", min, "gas");
    console.log("Max    :", max, "gas");
    console.log("Range  :", max - min, "gas");
    console.log("==================================================");

    assertTrue(mean > 0, "Mean gas should be positive");
}

function testGasSwap_30Samples() public {
    uint256 NUM_SAMPLES = 30;
    uint256[] memory gasResults = new uint256[](NUM_SAMPLES);
    address[] memory sampleUsers = new address[](NUM_SAMPLES);

    // Fund bridge
    vm.deal(address(victimBridge), 1000 ether);

    for (uint256 i = 0; i < NUM_SAMPLES; i++) {
        sampleUsers[i] = address(uint160(uint256(keccak256(abi.encode(i + 2000)))));
        vm.deal(sampleUsers[i], 10 ether);

        vm.startPrank(sampleUsers[i]);
        uint256 g = gasleft();
        victimBridge.swapETHForTokens{value: 0.1 ether}(0);
        gasResults[i] = g - gasleft();
        vm.stopPrank();
    }

    // Hitung statistics
    uint256 sum = 0;
    uint256 min = type(uint256).max;
    uint256 max = 0;
    for (uint256 i = 0; i < NUM_SAMPLES; i++) {
        sum += gasResults[i];
        if (gasResults[i] < min) min = gasResults[i];
        if (gasResults[i] > max) max = gasResults[i];
    }
    uint256 mean = sum / NUM_SAMPLES;

    console.log("==================================================");
    console.log("  GAS SWAP — 30-SAMPLE REPLICATION                ");
    console.log("==================================================");
    console.log("Mean   :", mean, "gas");
    console.log("Min    :", min, "gas");
    console.log("Max    :", max, "gas");
    console.log("Range  :", max - min, "gas");
    console.log("==================================================");

    assertTrue(mean > 0, "Mean gas should be positive");
}
```

---

## Penjelasan

### Kenapa 30 Sampel?

- **Central Limit Theorem**: Dengan n ≥ 30, distribusi mean mendekati normal
- **Statistical significance**: Bisa hitung confidence interval
- **Industry standard**: Riset gas optimization biasanya pakai 30-100 sampel

### Kenapa User Unik per Sample?

Karena setiap user punya **storage slot sendiri** (mapping `userBalances`). Kalau pakai user yang sama, slot sudah warm → gas lebih murah → hasil tidak representatif.

### Data yang Dihasilkan

Untuk tiap fungsi, data ini bisa dipakai untuk:
1. **Mean gas** → Angka utama di tabel
2. **Min/Max** → Range gas
3. **Std dev** → Variabilitas (bisa dihitung di off-chain)
4. **Confidence interval** → `mean ± 1.96 * std/sqrt(n)`

---

## Perbandingan Sebelum vs Sesudah

| Metode | Samples | Statistical Validity | Skripsi Ready |
|--------|---------|---------------------|---------------|
| Sekarang | 1 | ❌ Tidak valid | ❌ |
| Sesudah | 30 | ✅ Valid | ✅ |

---

## Cara Jalankan

```bash
# Jalankan semua 30-sample test
forge test --match-test "30Samples" -vvv

# Dengan gas report
forge test --match-test "30Samples" --gas-report
```

---

## Checklist

- [x] Buat file `test/GasStatsTest.t.sol` (30-sample tests)
- [x] Implementasi `testGasDeposit_30Samples()`, `testGasWithdraw_30Samples()`, `testGasSwap_30Samples()`
- [ ] Jalankan `forge test --match-test "30Samples" -vvv` — perlu Foundry
- [ ] Catat mean/min/max untuk paper — perlu Foundry
