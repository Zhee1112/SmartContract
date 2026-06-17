// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/VictimBridge.sol";
import "../src/LightweightBridge.sol";
import "../src/MonitorMock.sol";
import "../src/Attacker.sol";

contract VictimBridgeSecurityTest is Test {
    VictimBridge victimBridge;
    LightweightBridge lightweightBridge;
    MonitorMock monitorMock;
    Attacker attacker;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        monitorMock = new MonitorMock();
        victimBridge = new VictimBridge(address(monitorMock));
        lightweightBridge = new LightweightBridge();
        attacker = new Attacker(payable(address(0xdead)), payable(address(victimBridge)));
        attacker.setLightweightBridge(payable(address(lightweightBridge)));
    }

    function _deposit(address user, uint256 amount) internal {
        vm.deal(user, amount);
        vm.prank(user);
        victimBridge.deposit{value: amount}();
    }

    // ==================== REENTRANCY ====================

    function testReentrancy_AttackRevertsEntireTx() public {
        _deposit(alice, 5 ether);

        vm.deal(address(attacker), 5 ether);

        vm.expectRevert();
        vm.prank(address(attacker));
        attacker.attackVictim{value: 1 ether}();
    }

    function testReentrancy_BridgeBalanceUnchangedAfterAttack() public {
        _deposit(alice, 5 ether);

        vm.deal(address(attacker), 5 ether);
        uint256 bridgeBefore = address(victimBridge).balance;

        vm.expectRevert();
        vm.prank(address(attacker));
        attacker.attackVictim{value: 1 ether}();

        assertEq(address(victimBridge).balance, bridgeBefore, "Bridge balance must not change");
    }

    function testReentrancy_AttackerDoesNotProfit() public {
        _deposit(alice, 10 ether);

        vm.deal(address(attacker), 5 ether);
        uint256 attackerBefore = address(attacker).balance;

        vm.expectRevert();
        vm.prank(address(attacker));
        attacker.attackVictim{value: 2 ether}();

        assertLe(address(attacker).balance, attackerBefore, "Attacker must not profit");
    }

    function testReentrancy_ConsecutiveAttacksAllFail() public {
        _deposit(alice, 20 ether);

        vm.deal(address(attacker), 10 ether);

        vm.expectRevert();
        vm.prank(address(attacker));
        attacker.attackVictim{value: 1 ether}();

        vm.expectRevert();
        vm.prank(address(attacker));
        attacker.attackVictim{value: 1 ether}();

        vm.expectRevert();
        vm.prank(address(attacker));
        attacker.attackVictim{value: 1 ether}();

        assertEq(address(victimBridge).balance, 20 ether, "Bridge must not lose funds after multiple attacks");
    }

    function testReentrancy_CallDepthResetsAfterAttack() public {
        _deposit(alice, 1 ether);

        vm.deal(address(attacker), 5 ether);

        vm.expectRevert();
        vm.prank(address(attacker));
        attacker.attackVictim{value: 1 ether}();

        assertEq(monitorMock.callDepth(), 0, "Call depth must reset to 0");
    }

    // ==================== EMERGENCY PAUSE ====================

    function testPause_OnlyAdminCanPause() public {
        vm.prank(alice);
        vm.expectRevert(VictimBridge.NotAdmin.selector);
        victimBridge.pause();
    }

    function testPause_CannotPauseTwice() public {
        victimBridge.pause();
        vm.expectRevert(VictimBridge.WhenPaused.selector);
        victimBridge.pause();
    }

    function testPause_DepositRevertsWhenPaused() public {
        victimBridge.pause();
        vm.deal(alice, 1 ether);
        vm.expectRevert(VictimBridge.WhenPaused.selector);
        vm.prank(alice);
        victimBridge.deposit{value: 1 ether}();
    }

    function testPause_WithdrawRevertsWhenPaused() public {
        _deposit(alice, 1 ether);
        victimBridge.pause();
        vm.expectRevert(VictimBridge.WhenPaused.selector);
        vm.prank(alice);
        victimBridge.withdraw(1 ether);
    }

    function testPause_SwapRevertsWhenPaused() public {
        _deposit(alice, 10 ether);
        victimBridge.pause();
        vm.expectRevert();
        vm.prank(alice);
        victimBridge.swapETHForTokens{value: 1 ether}(100);
    }

    function testPause_EventEmitted() public {
        vm.expectEmit(true, true, false, false, address(victimBridge));
        emit VictimBridge.EmergencyPaused(address(this));
        victimBridge.pause();
    }

    // ==================== UNPAUSE ====================

    function testUnpause_OnlyAdminCanUnpause() public {
        victimBridge.pause();
        vm.prank(alice);
        vm.expectRevert(VictimBridge.NotAdmin.selector);
        victimBridge.unpause();
    }

    function testUnpause_CannotUnpauseWhenNotPaused() public {
        vm.expectRevert(VictimBridge.WhenNotPaused.selector);
        victimBridge.unpause();
    }

    function testUnpause_DepositWorksAfterUnpause() public {
        victimBridge.pause();
        victimBridge.unpause();

        _deposit(alice, 1 ether);
        assertEq(address(victimBridge).balance, 1 ether, "Deposit must work after unpause");
    }

    function testUnpause_WithdrawWorksAfterUnpause() public {
        _deposit(alice, 2 ether);
        victimBridge.pause();
        victimBridge.unpause();

        vm.prank(alice);
        victimBridge.withdraw(1 ether);

        assertEq(address(victimBridge).balance, 1 ether, "Withdraw must work after unpause");
    }

    function testUnpause_SwapWorksAfterUnpause() public {
        _deposit(alice, 10 ether);
        victimBridge.pause();
        victimBridge.unpause();

        vm.deal(alice, 5 ether);
        vm.prank(alice);
        victimBridge.swapETHForTokens{value: 1 ether}(100);

        assertGt(address(victimBridge).balance, 10 ether, "Swap must work after unpause");
    }

    function testUnpause_EventEmitted() public {
        victimBridge.pause();
        vm.expectEmit(true, true, false, false, address(victimBridge));
        emit VictimBridge.EmergencyUnpaused(address(this));
        victimBridge.unpause();
    }

    // ==================== DEPOSIT/WITHDRAW WORKS NORMALLY ====================

    function testDeposit_NormalWorks() public {
        _deposit(alice, 1 ether);
        assertEq(address(victimBridge).balance, 1 ether);
        (, uint96 bal) = victimBridge.userBalances(alice);
        assertEq(bal, 1 ether);
    }

    function testWithdraw_NormalWorks() public {
        _deposit(alice, 2 ether);

        vm.prank(alice);
        victimBridge.withdraw(1 ether);

        assertEq(address(victimBridge).balance, 1 ether);
        (, uint96 bal2) = victimBridge.userBalances(alice);
        assertEq(bal2, 1 ether);
    }

    // ==================== TIER D [LIGHTWEIGHT] SECURITY TESTS ====================

    function testReentrancy_TierD_AttackReverts() public {
        vm.deal(alice, 10 ether);
        vm.prank(alice);
        lightweightBridge.deposit{value: 10 ether}();

        vm.deal(address(attacker), 10 ether);
        vm.expectRevert();
        attacker.attackLightweight{value: 5 ether}();
    }

    function testReentrancy_TierD_BridgeBalanceUnchanged() public {
        vm.deal(alice, 10 ether);
        vm.prank(alice);
        lightweightBridge.deposit{value: 10 ether}();
        uint256 bridgeBefore = address(lightweightBridge).balance;

        vm.deal(address(attacker), 10 ether);
        vm.expectRevert();
        attacker.attackLightweight{value: 5 ether}();

        assertEq(address(lightweightBridge).balance, bridgeBefore);
    }

    function testPause_TierD_DepositRevertsWhenPaused() public {
        lightweightBridge.pause();

        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        vm.expectRevert(LightweightBridge.WhenPaused.selector);
        lightweightBridge.deposit{value: 1 ether}();
        vm.stopPrank();
    }

    function testPauseUnpause_TierD_Works() public {
        lightweightBridge.pause();

        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        vm.expectRevert(LightweightBridge.WhenPaused.selector);
        lightweightBridge.deposit{value: 1 ether}();
        vm.stopPrank();

        lightweightBridge.unpause();

        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        lightweightBridge.deposit{value: 1 ether}();
        vm.stopPrank();

        (, uint96 bal) = lightweightBridge.userBalances(alice);
        assertEq(bal, 1 ether);
    }
}
