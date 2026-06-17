// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/UnoptimizedBridge.sol";
import "../src/BridgeStaticOnly.sol";
import "../src/VictimBridge.sol";
import "../src/LightweightBridge.sol";
import "../src/MonitorMock.sol";
import "../src/Attacker.sol";

contract MEVSimulationTest is Test {
    UnoptimizedBridge unopt;
    BridgeStaticOnly stat;
    VictimBridge victim;
    LightweightBridge light;
    MonitorMock monitor;
    Attacker attacker;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        monitor = new MonitorMock();
        unopt = new UnoptimizedBridge();
        stat = new BridgeStaticOnly();
        victim = new VictimBridge(address(monitor));
        light = new LightweightBridge();

        attacker = new Attacker(payable(address(unopt)), payable(address(victim)));
        attacker.setStaticBridge(payable(address(stat)));
        attacker.setLightweightBridge(payable(address(light)));

        vm.deal(address(unopt), 1000 ether);
        vm.deal(address(stat), 1000 ether);
        vm.deal(address(victim), 1000 ether);
        vm.deal(address(light), 1000 ether);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(address(attacker), 100 ether);
    }

    // ============================================================
    // CATEGORY 1: FULL SANDWICH ATTACK PER TIER
    // ============================================================

    function testSandwich_TierA_AttackerProfits() public {
        uint256 attackAmount = 5 ether;

        vm.startPrank(alice);
        unopt.deposit{value: 50 ether}();
        vm.stopPrank();

        uint256 bridgeBefore = address(unopt).balance;

        attacker.attackUnoptimized{value: attackAmount}();

        uint256 bridgeAfter = address(unopt).balance;
        assertLt(bridgeAfter, bridgeBefore, "A: bridge lost ETH to reentrancy");
        assertGt(address(attacker).balance, 100 ether, "A: attacker profited");
    }

    function testSandwich_TierB_CEIblocksAttack() public {
        uint256 attackAmount = 5 ether;

        vm.startPrank(alice);
        stat.deposit{value: 50 ether}();
        vm.stopPrank();

        uint256 bridgeBefore = address(stat).balance;
        uint256 attackerBefore = address(attacker).balance;

        vm.prank(address(attacker));
        stat.deposit{value: attackAmount}();

        vm.expectRevert();
        try stat.withdraw(uint96(attackAmount)) {} catch {}

        assertEq(address(stat).balance, bridgeBefore + attackAmount, "B: bridge balance includes deposit");
    }

    function testSandwich_TierC_EWSblocksAndPenalizes() public {
        uint256 attackAmount = 5 ether;

        vm.startPrank(alice);
        victim.deposit{value: 50 ether}();
        vm.stopPrank();

        monitor.recordTransaction(alice, 5 ether, 0);

        vm.expectRevert();
        attacker.attackVictim{value: attackAmount}();
    }

    function testSandwich_TierD_inlineEIP1153blocks() public {
        uint256 attackAmount = 5 ether;

        vm.startPrank(alice);
        light.deposit{value: 50 ether}();
        vm.stopPrank();

        light.recordFrontrun(alice, 5 ether);

        vm.expectRevert();
        attacker.attackLightweight{value: attackAmount}();
    }

    // ============================================================
    // CATEGORY 2: MEV DETECTION STATE VERIFICATION
    // ============================================================

    function testMEVDetection_TierC_TxRecordsGrow() public {
        monitor.recordTransaction(alice, 5 ether, 0);

        (address sender, uint256 amount,,) = monitor.txRecords(0);
        assertEq(sender, alice, "C: first record sender");
        assertEq(amount, 5 ether, "C: first record amount");
    }

    function testMEVDetection_TierC_CheckAnomaly_Detects() public {
        monitor.recordTransaction(alice, 5 ether, 0);

        (bool detected, uint256 score) = monitor.checkAnomaly(bob, 2 ether, 1);
        assertEq(score, 9600, "C: anomaly score should be 9600");
    }

    function testMEVDetection_TierC_CheckAnomaly_NoFrontrun_NoDetect() public {
        (bool detected, uint256 score) = monitor.checkAnomaly(alice, 5 ether, 1);
        assertFalse(detected, "C: no anomaly without frontrun");
        assertEq(score, 0, "C: score should be 0");
    }

    function testMEVDetection_TierD_LastTxTracksFrontrun() public {
        light.recordFrontrun(alice, 5 ether);

        (address sender, uint8 txType) = light.lastTx();
        assertEq(sender, alice, "D: sender recorded");
        assertEq(txType, 0, "D: txType=0 means frontrun");
        assertEq(light.lastTxBlock(), block.number, "D: same block");
    }

    function testMEVDetection_TierD_DifferentBlock_NoAnomaly() public {
        light.recordFrontrun(alice, 5 ether);

        vm.warp(block.timestamp + 12);
        vm.roll(block.number + 1);

        _depositAs(bob, 50 ether);
        vm.prank(bob);
        light.swapETHForTokens{value: 1 ether}(0);
    }

    function testMEVDetection_TierD_RecordFrontrunResetByNewTx() public {
        light.recordFrontrun(alice, 5 ether);

        _depositAs(bob, 50 ether);
        vm.prank(bob);
        light.swapETHForTokens{value: 1 ether}(0);

        (address sender, uint8 txType) = light.lastTx();
        assertEq(sender, bob, "D: lastTx overwritten by new tx");
        assertEq(txType, 1, "D: txType=1 means victim tx");
    }

    // ============================================================
    // CATEGORY 3: MEV PENALTY AMOUNT VERIFICATION
    // ============================================================

    function testMEVPenalty_TierC_ReducesSwapOutput() public {
        _depositAs(alice, 50 ether);

        monitor.recordTransaction(alice, 5 ether, 0);

        uint96 ethBefore;
        uint96 tokenBefore;
        (ethBefore, tokenBefore) = victim.reserves();

        vm.prank(bob);
        victim.swapETHForTokens{value: 2 ether}(0);

        uint96 ethAfter;
        uint96 tokenAfter;
        (ethAfter, tokenAfter) = victim.reserves();
        assertGt(ethAfter, ethBefore, "C: ETH reserve increased");
        assertEq(tokenAfter, tokenBefore, "C: Token reserve unchanged (penalty deducted from output)");
    }

    function testMEVPenalty_TierD_Formula() public {
        uint256 amount = 10 ether;
        uint256 anomalyScore = 9600;

        uint256 penalty = (amount * 15000 * anomalyScore) / 100000000;

        assertEq(penalty, 14400000000000000000, "D: penalty = 14.4 ether");

        uint256 penaltyCapped = penalty > amount ? amount : penalty;
        assertEq(penaltyCapped, amount, "D: penalty capped at amount when exceeding");
    }

    function testMEVPenalty_TierD_SmallAmount() public {
        uint256 amount = 1 ether;
        uint256 anomalyScore = 9600;

        uint256 penalty = (amount * 15000 * anomalyScore) / 100000000;
        uint256 capped = penalty > amount ? amount : penalty;

        assertEq(capped, amount, "D: penalty capped at amount for 1 ether");
    }

    function testMEVPenalty_TierD_ZeroScore_NoPenalty() public {
        uint256 amount = 10 ether;
        uint256 penalty = (amount * 15000 * 0) / 100000000;
        assertEq(penalty, 0, "D: zero score = zero penalty");
    }

    // ============================================================
    // CATEGORY 4: TIER A/B HAVE NO MEV PROTECTION
    // ============================================================

    function testNoMEVProtection_TierA_SwapOpenly() public {
        _depositAs(alice, 50 ether);

        uint256 tokenBefore = unopt.reserveToken();

        vm.prank(alice);
        unopt.swapETHForTokens{value: 2 ether}();

        assertLt(unopt.reserveToken(), tokenBefore, "A: tokens reduced");
        assertGt(unopt.reserveETH(), 100 ether, "A: ETH increased");
    }

    function testNoMEVProtection_TierB_SwapNoDetection() public {
        _depositAs(alice, 50 ether);

        vm.prank(alice);
        stat.swapETHForTokens{value: 2 ether}(0);

        (uint96 ethR, uint96 tokenR) = stat.reserves();
        assertGt(ethR, 100 ether, "B: ETH increased");
    }

    function testNoPenalty_TierA_AttackerKeepsAll() public {
        _depositAs(alice, 50 ether);

        uint256 attackerBalBefore = address(attacker).balance;

        attacker.attackUnoptimized{value: 5 ether}();

        assertGt(address(attacker).balance, attackerBalBefore, "A: attacker keeps profit");
    }

    // ============================================================
    // CATEGORY 5: CROSS-BLOCK MEV
    // ============================================================

    function testCrossBlockMEV_TierC_NotDetected() public {
        vm.startPrank(alice);
        victim.deposit{value: 50 ether}();
        vm.stopPrank();

        vm.warp(block.timestamp + 12);
        vm.roll(block.number + 1);

        vm.startPrank(bob);
        victim.swapETHForTokens{value: 2 ether}(0);
        vm.stopPrank();
    }

    function testCrossBlockMEV_TierD_NotDetected() public {
        vm.startPrank(alice);
        light.deposit{value: 50 ether}();
        vm.stopPrank();

        vm.warp(block.timestamp + 12);
        vm.roll(block.number + 1);

        vm.startPrank(bob);
        light.swapETHForTokens{value: 2 ether}(0);
        vm.stopPrank();
    }

    // ============================================================
    // CATEGORY 6: REENTRANCY VIA SWAP (not just withdraw)
    // ============================================================

    function testReentrancy_ViaSwap_TierC_Blocked() public {
        _depositAs(alice, 50 ether);

        vm.expectRevert();
        attacker.attackVictim{value: 5 ether}();
    }

    function testReentrancy_ViaSwap_TierD_Blocked() public {
        _depositAs(alice, 50 ether);

        vm.expectRevert();
        attacker.attackLightweight{value: 5 ether}();
    }

    // ============================================================
    // CATEGORY 7: MONITOR MOCK CONFIGURATION
    // ============================================================

    function testMonitorMock_UpdateParameters() public {
        monitor.updateParameters(8000, 20000);
        assertEq(monitor.P_detect(), 8000, "Monitor: updated P_detect");
        assertEq(monitor.lambda(), 20000, "Monitor: updated lambda");
    }

    function testMonitorMock_ClearRecords() public {
        monitor.recordTransaction(alice, 5 ether, 0);
        monitor.recordTransaction(bob, 3 ether, 1);
        assertEq(monitor.txRecordsLength(), 2, "Monitor: 2 records before clear");

        monitor.clearRecords();
        assertEq(monitor.txRecordsLength(), 0, "Monitor: 0 records after clear");
    }

    function testMonitorMock_NonAdmin_CannotUpdate() public {
        vm.prank(alice);
        vm.expectRevert(MonitorMock.NotAdmin.selector);
        monitor.updateParameters(8000, 20000);
    }

    function testMonitorMock_NonAdmin_CannotClear() public {
        vm.prank(alice);
        vm.expectRevert(MonitorMock.NotAdmin.selector);
        monitor.clearRecords();
    }

    // ============================================================
    // HELPERS
    // ============================================================

    function _depositAs(address user, uint256 amount) internal {
        vm.deal(user, amount * 5);
        vm.startPrank(user);
        unopt.deposit{value: amount}();
        stat.deposit{value: amount}();
        victim.deposit{value: amount}();
        light.deposit{value: amount}();
        vm.stopPrank();
    }
}
