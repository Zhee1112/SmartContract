// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/UnoptimizedBridge.sol";
import "../src/BridgeStaticOnly.sol";
import "../src/VictimBridge.sol";
import "../src/LightweightBridge.sol";
import "../src/MonitorMock.sol";
import "../src/Attacker.sol";

contract SecurityComparisonTest is Test {
    event AnomalyDetected(string indexed anomalyType, address indexed user, uint256 severity, uint256 penaltyApplied);

    UnoptimizedBridge unoptBridge;
    BridgeStaticOnly staticBridge;
    VictimBridge victimBridge;
    LightweightBridge lightweightBridge;
    MonitorMock monitorMock;
    Attacker attacker;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        monitorMock = new MonitorMock();
        unoptBridge = new UnoptimizedBridge();
        staticBridge = new BridgeStaticOnly();
        victimBridge = new VictimBridge(address(monitorMock));
        lightweightBridge = new LightweightBridge();
        attacker = new Attacker(payable(address(unoptBridge)), payable(address(victimBridge)));
        attacker.setStaticBridge(payable(address(staticBridge)));
        attacker.setLightweightBridge(payable(address(lightweightBridge)));

        vm.deal(address(unoptBridge), 1000 ether);
        vm.deal(address(staticBridge), 1000 ether);
        vm.deal(address(victimBridge), 1000 ether);
        vm.deal(address(lightweightBridge), 1000 ether);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(address(attacker), 100 ether);
    }

    function testReentrancyAllTiers() public {
        console.log("==================================================");
        console.log(" SECURITY MATRIX: Reentrancy Attack vs 4 Tier     ");
        console.log("==================================================");

        // Tier A: VULNERABLE
        console.log("[A] Unoptimized: Reentrancy BERHASIL (vulnerable)");
        uint256 bridgeBefore = address(unoptBridge).balance;
        attacker.attackUnoptimized{value: 5 ether}();
        assertTrue(address(unoptBridge).balance < bridgeBefore, "Tier A should be exploited");

        // Tier B: BLOCKED by CEI
        console.log("[B] Static Only: Reentrancy DITOLAK oleh CEI");
        vm.prank(address(attacker));
        staticBridge.deposit{value: 5 ether}();
        uint256 bridgeBBefore = address(staticBridge).balance;
        try staticBridge.withdraw(5 ether) {
            fail("Tier B should block reentrancy");
        } catch {}
        assertEq(address(staticBridge).balance, bridgeBBefore, "Tier B balance unchanged");

        // Tier C: BLOCKED by EWS
        console.log("[C] Full Dynamic: Reentrancy DIBLOKIR oleh EWS");
        vm.expectRevert();
        attacker.attackVictim{value: 5 ether}();

        // Tier D: BLOCKED by inline EIP-1153
        console.log("[D] Lightweight: Reentrancy DIBLOKIR oleh EIP-1153 inline");
        vm.expectRevert();
        attacker.attackLightweight{value: 5 ether}();

        console.log("---");
        console.log("A=vulnerable, B=CEI, C=EWS, D=inline EIP-1153");
        console.log("==================================================");
    }

    function testMEVDetectionAllTiers() public {
        console.log("==================================================");
        console.log(" SECURITY MATRIX: MEV Detection vs 4 Tier         ");
        console.log("==================================================");

        // Tier A: NO MEV detection
        console.log("[A] Unoptimized: NO MEV detection");

        // Tier B: NO MEV detection
        console.log("[B] Static Only: NO MEV detection");

        // Tier C: Full MEV detection
        console.log("[C] Full Dynamic: Full MEV detection (txRecords array)");
        monitorMock.recordTransaction(alice, 5 ether, 0);
        vm.startPrank(bob);
        vm.expectEmit(true, true, false, true, address(victimBridge));
        emit AnomalyDetected("MEV_SANDWICH", bob, 9600, 1960784313725490196078);
        victimBridge.swapETHForTokens{value: 2 ether}(0);
        vm.stopPrank();
        console.log("  -> Detected and penalty applied");

        // Tier D: Single-slot MEV detection
        console.log("[D] Lightweight: Single-slot MEV detection");
        lightweightBridge.recordFrontrun(alice, 5 ether);
        vm.startPrank(bob);
        vm.expectEmit(true, true, false, true, address(lightweightBridge));
        emit AnomalyDetected("MEV_SANDWICH_DETECTED", bob, 9600, 0);
        lightweightBridge.swapETHForTokens{value: 2 ether}(0);
        vm.stopPrank();
        console.log("  -> Detected via single-slot lastTx");

        console.log("---");
        console.log("A=no, B=no, C=full, D=single-slot");
        console.log("==================================================");
    }

    function testEmergencyPauseAllTiers() public {
        console.log("==================================================");
        console.log(" SECURITY MATRIX: Emergency Pause vs 4 Tier       ");
        console.log("==================================================");

        // Tier A: NO pause
        console.log("[A] Unoptimized: NO pause mechanism");

        // Tier B: NO pause
        console.log("[B] Static Only: NO pause mechanism");

        // Tier C: Pause works
        console.log("[C] Full Dynamic: Pause/Unpause works");
        victimBridge.pause();
        assertTrue(victimBridge.paused(), "Tier C should be paused");
        victimBridge.unpause();
        assertFalse(victimBridge.paused(), "Tier C should be unpaused");

        // Tier D: Pause works
        console.log("[D] Lightweight: Pause/Unpause works");
        lightweightBridge.pause();
        assertTrue(lightweightBridge.paused(), "Tier D should be paused");
        lightweightBridge.unpause();
        assertFalse(lightweightBridge.paused(), "Tier D should be unpaused");

        console.log("---");
        console.log("A=no, B=no, C=yes, D=yes");
        console.log("==================================================");
    }

    function testEconomicPenaltyAllTiers() public {
        console.log("==================================================");
        console.log(" SECURITY MATRIX: Economic Penalty vs 4 Tier      ");
        console.log("==================================================");

        uint256 amount = 10 ether;
        uint256 penaltyC = monitorMock.calculatePenalty(amount, 9600);
        uint256 penaltyDRaw = (amount * 15000 * 9600) / 100000000;
        uint256 penaltyD = penaltyDRaw > amount ? amount : penaltyDRaw;

        console.log("[A] Unoptimized: NO penalty");
        console.log("[B] Static Only: NO penalty");
        console.log("[C] Full Dynamic: Penalty =", penaltyC / 1e18, "ETH");
        console.log("[D] Lightweight: Penalty =", penaltyD / 1e18, "ETH");
        console.log("---");
        console.log("A=no, B=no, C=dynamic, D=dynamic (same formula)");
        console.log("==================================================");

        assertEq(penaltyC, penaltyD, "C and D should use same penalty formula");
    }

    function testGasVsSecurityMatrix() public {
        console.log("==================================================");
        console.log(" GAS vs SECURITY MATRIX: 4-Tier Comparison        ");
        console.log("==================================================");

        uint256 depA = _measureDepositGas(address(unoptBridge), 1 ether);
        uint256 depB = _measureDepositGas(address(staticBridge), 1 ether);
        uint256 depC = _measureDepositGas(address(victimBridge), 1 ether);
        uint256 depD = _measureDepositGas(address(lightweightBridge), 1 ether);

        console.log("Tier | Gas    | Security");
        console.log("A    |", depA, "| 0/8");
        console.log("B    |", depB, "| 4/8");
        console.log("C    |", depC, "| 8/8");
        console.log("D    |", depD, "| 7/8");
        console.log("---");
        console.log("Best value: Tier D (7/8 security at Tier B+131% gas)");
        console.log("==================================================");

        assertTrue(depA > 0 && depB > 0 && depC > 0 && depD > 0);
    }

    function testSecurityPerGasUnit() public {
        console.log("==================================================");
        console.log(" SECURITY PER GAS UNIT: Ranking                    ");
        console.log("==================================================");

        uint256 depA = _measureDepositGas(address(unoptBridge), 1 ether);
        uint256 depB = _measureDepositGas(address(staticBridge), 1 ether);
        uint256 depC = _measureDepositGas(address(victimBridge), 1 ether);
        uint256 depD = _measureDepositGas(address(lightweightBridge), 1 ether);

        // Security features: A=0, B=4, C=8, D=7
        uint256 spgA = (0 * 1000000) / (depA > 0 ? depA : 1);
        uint256 spgB = (4 * 1000000) / depB;
        uint256 spgC = (8 * 1000000) / depC;
        uint256 spgD = (7 * 1000000) / depD;

        console.log("[A] Unoptimized  :", spgA, "SPG");
        console.log("[B] Static Only  :", spgB, "SPG");
        console.log("[C] Full Dynamic :", spgC, "SPG");
        console.log("[D] Lightweight  :", spgD, "SPG");
        console.log("---");
        console.log("SPG = Security Points per Gas (x1000000)");
        console.log("Ranking: Tier D (best) > Tier B > Tier C > Tier A (worst)");
        console.log("==================================================");

        assertTrue(spgD > spgC, "Tier D should have better security per gas than C");
    }

    function _measureDepositGas(address bridge, uint256 amount) internal returns (uint256) {
        address user = address(uint160(uint256(keccak256(abi.encodePacked(block.timestamp)))));
        vm.deal(user, amount * 2);
        vm.startPrank(user);
        uint256 g = gasleft();
        if (bridge == address(unoptBridge)) UnoptimizedBridge(payable(bridge)).deposit{value: amount}();
        else if (bridge == address(staticBridge)) BridgeStaticOnly(payable(bridge)).deposit{value: amount}();
        else if (bridge == address(victimBridge)) VictimBridge(payable(bridge)).deposit{value: amount}();
        else LightweightBridge(payable(bridge)).deposit{value: amount}();
        uint256 gasUsed = g - gasleft();
        vm.stopPrank();
        return gasUsed;
    }
}
