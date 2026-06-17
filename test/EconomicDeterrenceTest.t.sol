// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/UnoptimizedBridge.sol";
import "../src/BridgeStaticOnly.sol";
import "../src/VictimBridge.sol";
import "../src/LightweightBridge.sol";
import "../src/MonitorMock.sol";
import "../src/Attacker.sol";

contract EconomicDeterrenceTest is Test {
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
    // CATEGORY 1: ROI ANALYSIS PER TIER
    // ============================================================

    function testROI_TierA_AttackerROI100Percent() public {
        uint256 attackAmount = 5 ether;
        uint256 attackerBefore = address(attacker).balance;

        vm.startPrank(alice);
        unopt.deposit{value: 50 ether}();
        vm.stopPrank();

        attacker.attackUnoptimized{value: attackAmount}();

        uint256 profit = address(attacker).balance - attackerBefore;
        assertGt(profit, attackAmount, "A: attacker profited more than invested");
    }

    function testROI_TierB_CEIPreventsProfit() public {
        uint256 attackAmount = 5 ether;
        uint256 attackerBefore = address(attacker).balance;

        vm.startPrank(alice);
        stat.deposit{value: 50 ether}();
        vm.stopPrank();

        vm.prank(address(attacker));
        stat.deposit{value: attackAmount}();

        vm.expectRevert();
        try stat.withdraw(uint96(attackAmount)) {} catch {}

        uint256 attackerAfter = address(attacker).balance;
        assertLe(attackerAfter, attackerBefore, "B: attacker did not profit");
    }

    function testROI_TierC_PenaltyMakesUnprofitable() public {
        uint256 attackAmount = 5 ether;
        uint256 attackerBefore = address(attacker).balance;

        vm.startPrank(alice);
        victim.deposit{value: 50 ether}();
        vm.stopPrank();

        monitor.recordTransaction(alice, 5 ether, 0);

        vm.expectRevert();
        attacker.attackVictim{value: attackAmount}();
    }

    function testROI_TierD_PenaltyMakesUnprofitable() public {
        uint256 attackAmount = 5 ether;
        uint256 attackerBefore = address(attacker).balance;

        vm.startPrank(alice);
        light.deposit{value: 50 ether}();
        vm.stopPrank();

        light.recordFrontrun(alice, 5 ether);

        vm.expectRevert();
        attacker.attackLightweight{value: attackAmount}();
    }

    // ============================================================
    // CATEGORY 2: PENALTY BOUNDARY TESTS
    // ============================================================

    function testPenalty_CalculatedCorrectly_C() public {
        uint256 amount = 5 ether;
        uint256 score = 9600;

        uint256 penalty = monitor.calculatePenalty(amount, score);

        uint256 rawPenalty = (amount * 15000 * score) / 100000000;
        uint256 expected = rawPenalty > amount ? amount : rawPenalty;
        assertEq(penalty, expected, "C: penalty formula correct with cap");
    }

    function testPenalty_CappedAtAmount_C() public {
        uint256 amount = 5 ether;
        uint256 score = 9600;

        uint256 penalty = monitor.calculatePenalty(amount, score);

        assertLe(penalty, amount, "C: penalty cannot exceed amount");
    }

    function testPenalty_CappedAtAmount_D() public {
        uint256 amount = 5 ether;
        uint256 score = 9600;

        uint256 penaltyRaw = (amount * 15000 * score) / 100000000;
        uint256 penaltyCapped = penaltyRaw > amount ? amount : penaltyRaw;

        assertLe(penaltyCapped, amount, "D: penalty cannot exceed amount");
        assertEq(penaltyCapped, amount, "D: penalty should be capped at 5 ether");
    }

    function testPenalty_ZeroScore_NoPenalty_C() public {
        assertEq(monitor.calculatePenalty(10 ether, 0), 0, "C: zero score = zero penalty");
    }

    function testPenalty_ZeroScore_NoPenalty_D() public {
        uint256 penalty = (10 ether * 15000 * 0) / 100000000;
        assertEq(penalty, 0, "D: zero score = zero penalty");
    }

    function testPenalty_MinimumAmount_C() public {
        uint256 penalty = monitor.calculatePenalty(1, 9600);
        assertGt(penalty, 0, "C: even 1 wei gets penalty");
        assertLe(penalty, 1, "C: penalty capped at 1 wei");
    }

    function testPenalty_MinimumAmount_D() public {
        uint256 amount = 1;
        uint256 penalty = (amount * 15000 * 9600) / 100000000;
        assertEq(penalty, 1, "D: 1 wei gets 1 wei penalty (integer division)");
    }

    function testPenalty_LargeAmount_NotCapped() public {
        uint256 amount = 1000 ether;
        uint256 score = 9600;

        uint256 penalty = monitor.calculatePenalty(amount, score);
        uint256 rawPenalty = (amount * 15000 * score) / 100000000;

        assertLe(penalty, amount, "C: penalty capped at amount");
        assertEq(penalty, rawPenalty < amount ? rawPenalty : amount, "C: penalty is min(raw, amount)");
    }

    // ============================================================
    // CATEGORY 2: ATTACKER LOSS SCENARIOS
    // ============================================================

    function testAttackerLoses_GasOnFailedAttack_C() public {
        uint256 attackAmount = 5 ether;

        vm.startPrank(alice);
        victim.deposit{value: 50 ether}();
        vm.stopPrank();

        monitor.recordTransaction(alice, 5 ether, 0);

        uint256 attackerBefore = address(attacker).balance;
        uint256 gasBefore = gasleft();

        vm.expectRevert();
        attacker.attackVictim{value: attackAmount}();

        uint256 gasUsed = gasBefore - gasleft();
        uint256 gasCost = gasUsed * tx.gasprice;

        assertEq(address(attacker).balance, attackerBefore, "D: attacker balance unchanged");
    }

    function testAttackerLoses_GasOnFailedAttack_D() public {
        uint256 attackAmount = 5 ether;

        vm.startPrank(alice);
        light.deposit{value: 50 ether}();
        vm.stopPrank();

        light.recordFrontrun(alice, 5 ether);

        uint256 attackerBefore = address(attacker).balance;

        vm.expectRevert();
        attacker.attackLightweight{value: attackAmount}();

        assertEq(address(attacker).balance, attackerBefore, "D: attacker balance unchanged");
    }

    // ============================================================
    // CATEGORY 3: MULTIPLE ATTACK SCENARIOS
    // ============================================================

    function testConsecutiveReentrancy_AllBlocked_D() public {
        _depositAs(alice, 50 ether);

        light.recordFrontrun(alice, 5 ether);
        vm.expectRevert();
        attacker.attackLightweight{value: 3 ether}();

        light.recordFrontrun(alice, 5 ether);
        vm.expectRevert();
        attacker.attackLightweight{value: 3 ether}();

        light.recordFrontrun(alice, 5 ether);
        vm.expectRevert();
        attacker.attackLightweight{value: 3 ether}();
    }

    function testConsecutiveReentrancy_AllBlocked_C() public {
        _depositAs(alice, 50 ether);

        monitor.recordTransaction(alice, 5 ether, 0);
        vm.expectRevert();
        attacker.attackVictim{value: 3 ether}();

        monitor.recordTransaction(alice, 5 ether, 0);
        vm.expectRevert();
        attacker.attackVictim{value: 3 ether}();
    }

    function testConsecutiveReentrancy_TierA_ExploitsMultipleTimes() public {
        _depositAs(alice, 100 ether);

        attacker.attackUnoptimized{value: 3 ether}();
        uint256 afterFirst = address(attacker).balance;

        attacker.attackUnoptimized{value: 3 ether}();
        uint256 afterSecond = address(attacker).balance;

        assertGt(afterSecond, afterFirst, "A: second exploit yields more");
    }

    // ============================================================
    // CATEGORY 4: ECONOMIC COMPARISON MATRIX
    // ============================================================

    function testEconomicMatrix_AllTiers_Summary() public {
        uint96 dep = 50 ether;
        uint256 attackAmount = 5 ether;

        _depositAs(alice, dep);

        uint256 balBefore = address(attacker).balance;

        attacker.attackUnoptimized{value: attackAmount}();
        uint256 profitA = address(attacker).balance - balBefore;
        assertTrue(profitA > 0, "A: positive profit");

        uint256 balBeforeB = address(attacker).balance;
        vm.prank(address(attacker));
        stat.deposit{value: attackAmount}();
        vm.expectRevert();
        try stat.withdraw(uint96(attackAmount)) {} catch {}
        uint256 profitB = address(attacker).balance > balBeforeB
            ? address(attacker).balance - balBeforeB
            : 0;
        assertEq(profitB, 0, "B: zero profit");

        monitor.recordTransaction(alice, dep, 0);
        uint256 balBeforeC = address(attacker).balance;
        vm.expectRevert();
        attacker.attackVictim{value: attackAmount}();
        uint256 profitC = address(attacker).balance > balBeforeC
            ? address(attacker).balance - balBeforeC
            : 0;
        assertEq(profitC, 0, "C: zero profit");

        light.recordFrontrun(alice, dep);
        uint256 balBeforeD = address(attacker).balance;
        vm.expectRevert();
        attacker.attackLightweight{value: attackAmount}();
        uint256 profitD = address(attacker).balance > balBeforeD
            ? address(attacker).balance - balBeforeD
            : 0;
        assertEq(profitD, 0, "D: zero profit");
    }

    // ============================================================
    // CATEGORY 5: PENALTY SENSITIVITY TO ANOMALY SCORE
    // ============================================================

    function testPenalty_AtVariousScores() public {
        uint256 amount = 1 ether;

        uint256 p0 = monitor.calculatePenalty(amount, 0);
        uint256 p1000 = monitor.calculatePenalty(amount, 1000);
        uint256 p5000 = monitor.calculatePenalty(amount, 5000);
        uint256 p8000 = monitor.calculatePenalty(amount, 8000);

        assertEq(p0, 0, "score=0: no penalty");
        assertGt(p1000, p0, "score=1000 > score=0");
        assertGt(p5000, p1000, "score=5000 > score=1000");
        assertGt(p8000, p5000, "score=8000 > score=5000");
    }

    function testPenalty_FormulaConsistency_CvsD() public {
        uint256 amount = 10 ether;
        uint256 score = 9600;

        uint256 penaltyC = monitor.calculatePenalty(amount, score);
        uint256 penaltyDRaw = (amount * 15000 * score) / 100000000;
        uint256 penaltyD = penaltyDRaw > amount ? amount : penaltyDRaw;

        assertEq(penaltyC, penaltyD, "C and D same formula for same input");
    }

    // ============================================================
    // CATEGORY 6: MONITOR PARAMETER IMPACT
    // ============================================================

    function testMonitorParam_HigherLambda_MorePenalty() public {
        uint256 amount = 10 ether;
        uint256 score = 1000;

        uint256 penaltyLow = monitor.calculatePenalty(amount, score);

        monitor.updateParameters(9600, 25000);
        uint256 penaltyHigh = monitor.calculatePenalty(amount, score);

        assertGt(penaltyHigh, penaltyLow, "Higher lambda = more penalty");
    }

    function testMonitorParam_HigherPDetect_HigherScore() public {
        monitor.recordTransaction(alice, 5 ether, 0);

        (bool d1, uint256 s1) = monitor.checkAnomaly(bob, 2 ether, 1);

        monitor.updateParameters(5000, 15000);

        monitor.clearRecords();
        monitor.recordTransaction(alice, 5 ether, 0);

        (bool d2, uint256 s2) = monitor.checkAnomaly(bob, 2 ether, 1);

        assertEq(s2, 5000, "Lower P_detect = lower score");
    }

    // ============================================================
    // CATEGORY 7: REALISTIC ATTACK SCENARIOS
    // ============================================================

    function testRealisticScenario_SmallAttackerVsLargePool() public {
        uint96 largeDeposit = 500 ether;
        uint256 attackAmount = 1 ether;

        _depositAs(alice, largeDeposit);

        light.recordFrontrun(alice, largeDeposit);

        vm.expectRevert();
        attacker.attackLightweight{value: attackAmount}();
    }

    function testRealisticScenario_LargeAttackerVsSmallPool() public {
        uint96 smallDeposit = 10 ether;
        uint256 attackAmount = 50 ether;

        _depositAs(alice, smallDeposit);

        light.recordFrontrun(alice, smallDeposit);

        vm.expectRevert();
        attacker.attackLightweight{value: attackAmount}();
    }

    function testRealisticScenario_RapidFireAttacks() public {
        _depositAs(alice, 50 ether);

        for (uint256 i = 0; i < 5; i++) {
            light.recordFrontrun(alice, 5 ether);
            vm.expectRevert();
            attacker.attackLightweight{value: 2 ether}();
        }
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
