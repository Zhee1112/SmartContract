# Improvement #7: OpenZeppelin ReentrancyGuard Comparison

> Membandingkan gas EIP-1153 TSTORE vs OpenZeppelin SSTORE-based ReentrancyGuard

---

## Status

| Item | Nilai |
|------|-------|
| File baru | `src/BridgeWithSSTOREGuard.sol` + `test/OZGuardComparison.t.sol` |
| Prioritas | KRITIS |
| Estimasi waktu | 30-45 menit |
| Difficulty | Mudah-Sedang |
| Status | ✅ SELESAI (02 Jun 2026) |
| Compile | ⏳ Perlu Foundry (forge-std dependency) |
| Catatan | Menggunakan SSTORE-based guard standalone (tanpa import OZ) |

---

## Masalah

Skripsi mengklaim EIP-1153 TSTORE lebih hemat gas dari SSTORE-based mutex. Tapi **tidak ada bukti perbandingan** dengan standar industri (OpenZeppelin `ReentrancyGuard`).

Reviewer akan tanya: "Kenapa tidak pakai OZ ReentrancyGuard yang sudah proven?"

---

## Yang Harus Dilakukan

### Langkah 1: Install OpenZeppelin

```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

### Langkah 2: Buat `src/BridgeWithOZGuard.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BridgeWithOZGuard
 * @dev Bridge yang menggunakan OpenZeppelin ReentrancyGuard (SSTORE-based).
 * Digunakan sebagai benchmark untuk membandingkan gas dengan EIP-1153.
 */
contract BridgeWithOZGuard is ReentrancyGuard {
    struct UserBalance {
        address userAddress;
        uint96 balance;
    }

    mapping(address => UserBalance) public userBalances;
    uint256 public totalDeposits;

    event Deposit(address indexed user, uint96 amount);
    event Withdraw(address indexed user, uint96 amount);

    function deposit() public payable {
        uint96 amount = uint96(msg.value);
        require(amount > 0, "Zero amount");

        UserBalance storage u = userBalances[msg.sender];
        u.userAddress = msg.sender;
        unchecked {
            u.balance += amount;
            totalDeposits += amount;
        }

        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint96 amount) public nonReentrant {
        UserBalance storage u = userBalances[msg.sender];
        require(u.balance >= amount, "Insufficient balance");

        unchecked {
            u.balance -= amount;
            totalDeposits -= amount;
        }

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdraw(msg.sender, amount);
    }

    receive() external payable {}
}
```

### Langkah 3: Buat `test/OZGuardComparison.t.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BridgeWithOZGuard.sol";
import "../src/VictimBridge.sol";
import "../src/MonitorMock.sol";

contract OZGuardComparison is Test {
    BridgeWithOZGuard public ozBridge;      // OpenZeppelin (SSTORE-based)
    VictimBridge public eip1153Bridge;      // EIP-1153 (TSTORE-based)
    MonitorMock public monitor;

    address user = address(0xBEEF);

    function setUp() public {
        monitor = new MonitorMock();
        ozBridge = new BridgeWithOZGuard();
        eip1153Bridge = new VictimBridge(address(monitor));

        vm.deal(user, 1000 ether);
        vm.deal(address(ozBridge), 1000 ether);
        vm.deal(address(eip1153Bridge), 1000 ether);
    }

    // =========================================================
    // BENCHMARK: Withdraw Gas Comparison
    // =========================================================
    function testGasWithdraw_OZ_vs_EIP1153() public {
        // Setup: deposit ke kedua bridge
        vm.startPrank(user);
        ozBridge.deposit{value: 10 ether}();
        eip1153Bridge.deposit{value: 10 ether}();
        vm.stopPrank();

        // Benchmark OZ Guard (SSTORE-based)
        vm.startPrank(user);
        uint256 g1 = gasleft();
        ozBridge.withdraw(1 ether);
        uint256 gasOZ = g1 - gasleft();
        vm.stopPrank();

        // Benchmark EIP-1153 (TSTORE-based)
        vm.startPrank(user);
        uint256 g2 = gasleft();
        eip1153Bridge.withdraw(1 ether);
        uint256 gasEIP1153 = g2 - gasleft();
        vm.stopPrank();

        // Output
        console.log("========================================");
        console.log("  OZ REENTRANCY GUARD vs EIP-1153      ");
        console.log("========================================");
        console.log("OZ Guard (SSTORE)  :", gasOZ, "gas");
        console.log("EIP-1153 (TSTORE)  :", gasEIP1153, "gas");
        console.log("Savings (EIP-1153) :", gasOZ - gasEIP1153, "gas");
        console.log("Savings percentage  :", ((gasOZ - gasEIP1153) * 100) / gasOZ, "%");
        console.log("========================================");

        // EIP-1153 harus lebih hemat
        assertTrue(gasEIP1153 < gasOZ, "EIP-1153 should be cheaper than OZ Guard");
    }

    // =========================================================
    // BENCHMARK: Deposit Gas Comparison (Control)
    // =========================================================
    function testGasDeposit_OZ_vs_EIP1153() public {
        // Benchmark OZ
        vm.startPrank(user);
        uint256 g1 = gasleft();
        ozBridge.deposit{value: 5 ether}();
        uint256 gasOZ = g1 - gasleft();
        vm.stopPrank();

        // Benchmark EIP-1153
        vm.startPrank(user);
        uint256 g2 = gasleft();
        eip1153Bridge.deposit{value: 5 ether}();
        uint256 gasEIP1153 = g2 - gasleft();
        vm.stopPrank();

        console.log("DEPOSIT OZ:", gasOZ, "gas | EIP-1153:", gasEIP1153, "gas");

        // Deposit tidak pakai reentrancy guard, harusnya mirip
        // Tapi mungkin sedikit beda karena struct packing berbeda
        assertTrue(gasOZ > 0 && gasEIP1153 > 0);
    }

    receive() external payable {}
}
```

---

## Penjelasan

### Kenapa `withdraw()` yang di-Benchmark?

Karena `withdraw()` adalah function yang menggunakan **reentrancy guard**:
- OZ: `nonReentrant` modifier → SSTORE (lock + unlock) → ~22,900 gas
- EIP-1153: `monitor.enterCall()` + `monitor.exitCall()` → TSTORE x2 → ~200 gas

`deposit()` TIDAK menggunakan reentrancy guard → gas harusnya mirip (control).

### Expected Gas Difference

| Operation | OZ Guard (SSTORE) | EIP-1153 (TSTORE) | Savings |
|-----------|-------------------|-------------------|---------|
| Lock (write) | ~20,000 gas | ~100 gas | ~19,900 gas |
| Unlock (write) | ~2,900 gas | ~100 gas | ~2,800 gas |
| **Total guard** | **~22,900 gas** | **~200 gas** | **~22,700 gas (99.1%)** |

---

## Cara Jalankan

```bash
# Install OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Jalankan comparison
forge test --match-contract OZGuardComparison -vvv
```

---

## Expected Output

```
========================================
  OZ REENTRANCY GUARD vs EIP-1153      
========================================
OZ Guard (SSTORE)  : 25XXX gas
EIP-1153 (TSTORE)  : 2XXX gas
Savings (EIP-1153) : 22XXX gas
Savings percentage  : 9X%
========================================
[PASS] testGasWithdraw_OZ_vs_EIP1153()
```

---

## Checklist

- [x] Buat `src/BridgeWithSSTOREGuard.sol` (SSTORE-based guard standalone)
- [x] Buat `test/OZGuardComparison.t.sol`
- [ ] Jalankan `forge test --match-contract OZGuardComparison -vvv` — perlu Foundry
- [ ] Pastikan EIP-1153 lebih hemat gas dari SSTORE guard — perlu Foundry
- [ ] Catat angka gas untuk paper — perlu Foundry
