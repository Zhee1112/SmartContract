// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BridgeWithSSTOREGuard.sol";
import "../src/VictimBridge.sol";
import "../src/MonitorMock.sol";

contract OZGuardComparison is Test {
    BridgeWithSSTOREGuard public sstoreBridge;   // SSTORE-based (mirip OZ)
    VictimBridge public eip1153Bridge;            // EIP-1153 TSTORE-based
    MonitorMock public monitor;

    address user = address(0xBEEF);

    function setUp() public {
        monitor = new MonitorMock();
        sstoreBridge = new BridgeWithSSTOREGuard();
        eip1153Bridge = new VictimBridge(address(monitor));

        vm.deal(user, 1000 ether);
        vm.deal(address(sstoreBridge), 1000 ether);
        vm.deal(address(eip1153Bridge), 1000 ether);
    }

    function testGasWithdraw_SSTORE_vs_EIP1153() public {
        // Setup: deposit ke kedua bridge
        vm.startPrank(user);
        sstoreBridge.deposit{value: 10 ether}();
        eip1153Bridge.deposit{value: 10 ether}();
        vm.stopPrank();

        // Benchmark SSTORE Guard (no EWS overhead)
        vm.startPrank(user);
        uint256 g1 = gasleft();
        sstoreBridge.withdraw(1 ether);
        uint256 gasSSTORE = g1 - gasleft();
        vm.stopPrank();

        // Benchmark EIP-1153 (with EWS overhead)
        vm.startPrank(user);
        uint256 g2 = gasleft();
        eip1153Bridge.withdraw(1 ether);
        uint256 gasEIP1153 = g2 - gasleft();
        vm.stopPrank();

        console.log("========================================");
        console.log("  SSTORE GUARD vs EIP-1153 TSTORE      ");
        console.log("========================================");
        console.log("SSTORE Guard  :", gasSSTORE, "gas");
        console.log("EIP-1153 + EWS:", gasEIP1153, "gas");
        if (gasSSTORE > gasEIP1153) {
            console.log("Savings (TSTORE vs SSTORE):", gasSSTORE - gasEIP1153, "gas");
        } else {
            console.log("Overhead (EWS monitoring):", gasEIP1153 - gasSSTORE, "gas");
        }
        console.log("========================================");
        console.log("NOTE: EIP-1153 bridge includes EWS monitoring overhead.");
        console.log("Pure TSTORE/TLOAD cost = 200 gas vs SSTORE cold+warm = ~22,900 gas.");
        console.log("========================================");

        // Both bridges should complete successfully
        assertTrue(gasSSTORE > 0 && gasEIP1153 > 0, "Both benchmarks should produce valid gas values");
    }

    receive() external payable {}
}
