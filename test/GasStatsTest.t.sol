// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/VictimBridge.sol";
import "../src/MonitorMock.sol";

contract GasStatsTest is Test {
    VictimBridge public victimBridge;
    MonitorMock public monitor;

    function setUp() public {
        monitor = new MonitorMock();
        victimBridge = new VictimBridge(address(monitor));
        vm.deal(address(victimBridge), 10000 ether);
    }

    function testGasDeposit_100Samples() public {
        uint256 NUM_SAMPLES = 100;
        uint256[] memory gasResults = new uint256[](NUM_SAMPLES);

        for (uint256 i = 0; i < NUM_SAMPLES; i++) {
            address user = address(uint160(uint256(keccak256(abi.encode(i)))));
            vm.deal(user, 10 ether);

            vm.startPrank(user);
            uint256 g = gasleft();
            victimBridge.deposit{value: 1 ether}();
            gasResults[i] = g - gasleft();
            vm.stopPrank();
        }

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
        console.log("  GAS DEPOSIT - 100-SAMPLE REPLICATION            ");
        console.log("==================================================");
        console.log("Mean   :", mean, "gas");
        console.log("Min    :", min, "gas");
        console.log("Max    :", max, "gas");
        console.log("Range  :", max - min, "gas");
        console.log("==================================================");

        assertTrue(mean > 0, "Mean gas should be positive");
    }

    function testGasWithdraw_100Samples() public {
        uint256 NUM_SAMPLES = 100;
        uint256[] memory gasResults = new uint256[](NUM_SAMPLES);

        for (uint256 i = 0; i < NUM_SAMPLES; i++) {
            address user = address(uint160(uint256(keccak256(abi.encode(i + 1000)))));
            vm.deal(user, 10 ether);

            vm.prank(user);
            victimBridge.deposit{value: 5 ether}();

            vm.startPrank(user);
            uint256 g = gasleft();
            victimBridge.withdraw(1 ether);
            gasResults[i] = g - gasleft();
            vm.stopPrank();
        }

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
        console.log("  GAS WITHDRAW - 100-SAMPLE REPLICATION           ");
        console.log("==================================================");
        console.log("Mean   :", mean, "gas");
        console.log("Min    :", min, "gas");
        console.log("Max    :", max, "gas");
        console.log("Range  :", max - min, "gas");
        console.log("==================================================");

        assertTrue(mean > 0, "Mean gas should be positive");
    }

    function testGasSwap_100Samples() public {
        uint256 NUM_SAMPLES = 100;
        uint256[] memory gasResults = new uint256[](NUM_SAMPLES);

        for (uint256 i = 0; i < NUM_SAMPLES; i++) {
            address user = address(uint160(uint256(keccak256(abi.encode(i + 2000)))));
            vm.deal(user, 10 ether);

            vm.startPrank(user);
            uint256 g = gasleft();
            victimBridge.swapETHForTokens{value: 0.1 ether}(0);
            gasResults[i] = g - gasleft();
            vm.stopPrank();
        }

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
        console.log("  GAS SWAP - 100-SAMPLE REPLICATION               ");
        console.log("==================================================");
        console.log("Mean   :", mean, "gas");
        console.log("Min    :", min, "gas");
        console.log("Max    :", max, "gas");
        console.log("Range  :", max - min, "gas");
        console.log("==================================================");

        assertTrue(mean > 0, "Mean gas should be positive");
    }
}
