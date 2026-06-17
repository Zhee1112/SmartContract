# Improvement #6: Fuzz Tests

> Membuat fuzz test untuk validasi edge cases di semua bridge contracts

---

## Status

| Item | Nilai |
|------|-------|
| File baru | `test/FuzzTest.t.sol` |
| Prioritas | KRITIS |
| Estimasi waktu | 1-2 jam |
| Difficulty | Sedang |
| Status | ✅ SELESAI (02 Jun 2026) |
| Compile | ⏳ Perlu Foundry (forge-std dependency) |

---

## Apa Itu Fuzz Test?

Fuzz test memberikan **input random** ke function dan memastikan:
1. Function tidak revert yang tidak diharapkan
2. Function revert HANYA untuk kasus yang seharusnya revert
3. Output sesuai expected behavior

Foundry akan otomatis generate ratusan angka random dan cek semua.

---

## Function yang Perlu Di-Fuzz

| Function | Input Random | Yang Dicek |
|----------|-------------|------------|
| `deposit(uint256)` | amount (0 → 2^256) | Revert jika amount > uint96 max |
| `withdraw(uint256)` | amount (0 → 2^256) | Revert jika amount > balance |
| `swapETHForTokens(uint96)` | ethIn (0 → type(uint96).max) | Formula x*y=k terpenuhi |
| `calculatePenalty(uint256, uint256)` | amount, score | Penalty tidak melebihi amount |

---

## Kode: `test/FuzzTest.t.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/VictimBridge.sol";
import "../src/BridgeStaticOnly.sol";
import "../src/UnoptimizedBridge.sol";
import "../src/MonitorMock.sol";

contract FuzzTest is Test {
    VictimBridge public victimBridge;
    BridgeStaticOnly public staticBridge;
    UnoptimizedBridge public unoptBridge;
    MonitorMock public monitor;

    address user = address(0xBEEF);

    function setUp() public {
        monitor = new MonitorMock();
        victimBridge = new VictimBridge(address(monitor));
        staticBridge = new BridgeStaticOnly();
        unoptBridge = new UnoptimizedBridge();

        vm.deal(user, 1000 ether);
        vm.deal(address(victimBridge), 1000 ether);
        vm.deal(address(staticBridge), 1000 ether);
        vm.deal(address(unoptBridge), 1000 ether);
    }

    // =========================================================
    // FUZZ: deposit() — overflow check
    // =========================================================
    function testFuzz_DepositValidAmount(uint96 amount) public {
        vm.assume(amount > 0); // Skip zero

        vm.prank(user);
        victimBridge.deposit{value: amount}();

        (, uint96 balance) = victimBridge.userBalances(user);
        assertEq(balance, amount, "Balance should equal deposited amount");
    }

    function testFuzz_DepositRevertOnZero(uint256 amount) public {
        vm.assume(amount == 0);

        vm.prank(user);
        vm.expectRevert(VictimBridge.ZeroAmount.selector);
        victimBridge.deposit{value: amount}();
    }

    // =========================================================
    // FUZZ: withdraw() — balance exceeded check
    // =========================================================
    function testFuzz_WithdrawCannotExceedBalance(uint96 depositAmount, uint96 withdrawAmount) public {
        vm.assume(depositAmount > 0);
        vm.assume(withdrawAmount > 0);
        vm.assume(depositAmount <= type(uint96).max);

        // Deposit dulu
        vm.prank(user);
        victimBridge.deposit{value: depositAmount}();

        // Coba withdraw
        vm.prank(user);
        if (withdrawAmount > depositAmount) {
            // Harus revert
            vm.expectRevert(VictimBridge.InsufficientBalance.selector);
            victimBridge.withdraw(withdrawAmount);
        } else {
            // Harus berhasil
            victimBridge.withdraw(withdrawAmount);
            (, uint96 remainingBalance) = victimBridge.userBalances(user);
            assertEq(remainingBalance, depositAmount - withdrawAmount, "Remaining balance incorrect");
        }
    }

    // =========================================================
    // FUZZ: swapETHForTokens() — formula correctness
    // =========================================================
    function testFuzz_SwapFormulaCorrectness(uint96 ethIn) public {
        vm.assume(ethIn > 0);
        vm.assume(ethIn <= 10 ether); // Limit untuk menghindari insufficient liquidity

        uint96 ethReserve = 100 ether;
        uint96 tokenReserve = 100000 * 10**18;

        // Hitung expected amountOut
        uint256 expectedOut = (uint256(tokenReserve) * uint256(ethIn)) / (uint256(ethReserve) + uint256(ethIn));

        // Deposit ke bridge dulu
        vm.deal(user, ethIn);
        vm.prank(user);
        victimBridge.deposit{value: ethIn}();

        // Swap
        vm.prank(user);
        victimBridge.swapETHForTokens{value: ethIn}(0);

        // Cek reserves berubah sesuai expected
        (uint96 newEthReserve, uint96 newTokenReserve) = victimBridge.reserves();
        assertEq(newEthReserve, ethReserve + ethIn, "ETH reserve incorrect");
        assertEq(newTokenReserve, tokenReserve - uint96(expectedOut), "Token reserve incorrect");
    }

    // =========================================================
    // FUZZ: calculatePenalty() — penalty <= amount
    // =========================================================
    function testFuzz_PenaltyNeverExceedsAmount(uint256 amount, uint256 score) public {
        vm.assume(amount > 0);
        vm.assume(score <= 10000); // Max anomalyScore

        uint256 penalty = monitor.calculatePenalty(amount, score);
        assertLe(penalty, amount, "Penalty should never exceed amount");
    }

    function testFuzz_PenaltyZeroWhenScoreZero(uint256 amount) public {
        uint256 penalty = monitor.calculatePenalty(amount, 0);
        assertEq(penalty, 0, "Penalty should be 0 when score is 0");
    }

    // =========================================================
    // FUZZ: BridgeStaticOnly deposit/withdraw
    // =========================================================
    function testFuzz_StaticBridge_DepositWithdraw(uint96 depositAmount, uint96 withdrawAmount) public {
        vm.assume(depositAmount > 0);
        vm.assume(withdrawAmount > 0);
        vm.assume(depositAmount <= type(uint96).max);

        vm.prank(user);
        staticBridge.deposit{value: depositAmount}();

        vm.prank(user);
        if (withdrawAmount > depositAmount) {
            vm.expectRevert(BridgeStaticOnly.InsufficientBalance.selector);
            staticBridge.withdraw(withdrawAmount);
        } else {
            staticBridge.withdraw(withdrawAmount);
            (, uint96 remaining) = staticBridge.userBalances(user);
            assertEq(remaining, depositAmount - withdrawAmount);
        }
    }

    // =========================================================
    // FUZZ: UnoptimizedBridge deposit
    // =========================================================
    function testFuzz_UnoptimizedBridge_Deposit(uint256 amount) public {
        vm.assume(amount > 0);

        vm.prank(user);
        unoptBridge.deposit{value: amount}();

        uint256 balance = unoptBridge.balances(user);
        assertEq(balance, amount, "Unoptimized: balance should equal deposit");
    }

    receive() external payable {}
}
```

---

## Penjelasan tiap Fuzz Test

### `testFuzz_DepositValidAmount(uint96 amount)`
- Input: random uint96 (> 0)
- Expected: deposit berhasil, balance = amount
- Menguji: tidak ada overflow di `u.balance += amount`

### `testFuzz_WithdrawCannotExceedBalance(uint96 deposit, uint96 withdraw)`
- Input: random deposit amount, random withdraw amount
- Expected: revert jika withdraw > deposit
- Menguji: check `u.balance < amount` bekerja benar

### `testFuzz_SwapFormulaCorrectness(uint96 ethIn)`
- Input: random ETH amount
- Expected: reserves berubah sesuai formula x*y=k
- Menguji: constant product formula tidak ada bug

### `testFuzz_PenaltyNeverExceedsAmount(uint256 amount, uint256 score)`
- Input: random amount, random score (0-10000)
- Expected: penalty <= amount
- Menguji: `min(penalty, amount)` bekerja benar

---

## Cara Jalankan

```bash
# Jalankan semua fuzz test (default 256 runs per test)
forge test --match-contract FuzzTest -vvv

# Jalankan dengan lebih banyak runs (lebih thorough)
forge test --match-contract FuzzTest --fuzz-runs 1000 -vvv
```

---

## Expected Output

```
[Fuzz] testFuzz_DepositValidAmount(uint96): runs: 256, result: PASS
[Fuzz] testFuzz_DepositRevertOnZero(uint256): runs: 256, result: PASS
[Fuzz] testFuzz_WithdrawCannotExceedBalance(uint96,uint96): runs: 256, result: PASS
[Fuzz] testFuzz_SwapFormulaCorrectness(uint96): runs: 256, result: PASS
[Fuzz] testFuzz_PenaltyNeverExceedsAmount(uint256,uint256): runs: 256, result: PASS
[Fuzz] testFuzz_PenaltyZeroWhenScoreZero(uint256): runs: 256, result: PASS
```

---

## Checklist

- [x] Buat file `test/FuzzTest.t.sol`
- [x] Implementasi semua fuzz test di atas
- [ ] Jalankan `forge test --match-contract FuzzTest -vvv` — perlu Foundry
- [ ] Pastikan semua test PASS (256 runs) — perlu Foundry
