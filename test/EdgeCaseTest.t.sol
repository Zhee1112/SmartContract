// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/VictimBridge.sol";
import "../src/BridgeStaticOnly.sol";
import "../src/BridgeWithSSTOREGuard.sol";
import "../src/UnoptimizedBridge.sol";
import "../src/LightweightBridge.sol";
import "../src/MonitorMock.sol";
import "../src/Attacker.sol";

contract EdgeCaseTest is Test {
    VictimBridge victimBridge;
    BridgeStaticOnly staticBridge;
    BridgeWithSSTOREGuard sstoreGuardBridge;
    UnoptimizedBridge unoptBridge;
    LightweightBridge lightweightBridge;
    MonitorMock monitorMock;
    Attacker attacker;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        monitorMock = new MonitorMock();
        victimBridge = new VictimBridge(address(monitorMock));
        staticBridge = new BridgeStaticOnly();
        sstoreGuardBridge = new BridgeWithSSTOREGuard();
        unoptBridge = new UnoptimizedBridge();
        lightweightBridge = new LightweightBridge();
        attacker = new Attacker(payable(address(unoptBridge)), payable(address(victimBridge)));
    }

    function _depositVictim(address user, uint256 amount) internal {
        vm.deal(user, amount);
        vm.prank(user);
        victimBridge.deposit{value: amount}();
    }

    function _depositStatic(address user, uint256 amount) internal {
        vm.deal(user, amount);
        vm.prank(user);
        staticBridge.deposit{value: amount}();
    }

    // ==================== ZERO AMOUNT ====================

    function testZeroAmount_DepositVictimReverts() public {
        vm.deal(alice, 1 ether);
        vm.expectRevert(VictimBridge.ZeroAmount.selector);
        vm.prank(alice);
        victimBridge.deposit{value: 0}();
    }

    function testZeroAmount_SwapVictimReverts() public {
        _depositVictim(alice, 1 ether);
        vm.expectRevert(VictimBridge.ZeroAmount.selector);
        vm.prank(alice);
        victimBridge.swapETHForTokens{value: 0}(100);
    }

    function testZeroAmount_WithdrawVictimReverts() public {
        _depositVictim(alice, 1 ether);
        vm.prank(alice);
        victimBridge.withdraw(0);
    }

    function testZeroAmount_WithdrawStaticReverts() public {
        _depositStatic(alice, 1 ether);
        vm.prank(alice);
        staticBridge.withdraw(0);
    }

    function testZeroAmount_DepositStaticReverts() public {
        vm.deal(alice, 1 ether);
        vm.expectRevert(BridgeStaticOnly.ZeroAmount.selector);
        vm.prank(alice);
        staticBridge.deposit{value: 0}();
    }

    function testZeroAmount_SwapStaticReverts() public {
        _depositStatic(alice, 1 ether);
        vm.expectRevert(BridgeStaticOnly.ZeroAmount.selector);
        vm.prank(alice);
        staticBridge.swapETHForTokens{value: 0}(100);
    }

    function testZeroAmount_DepositUnoptReverts() public {
        vm.deal(alice, 1 ether);
        vm.expectRevert("Must deposit > 0");
        vm.prank(alice);
        unoptBridge.deposit{value: 0}();
    }

    function testZeroAmount_SwapUnoptReverts() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        unoptBridge.deposit{value: 1 ether}();
        vm.expectRevert("Must swap > 0");
        vm.prank(alice);
        unoptBridge.swapETHForTokens{value: 0}();
    }

    // ==================== OVERFLOW / INSUFFICIENT BALANCE ====================

    function testOverflow_WithdrawExceedsBalanceVictim() public {
        _depositVictim(alice, 1 ether);
        vm.expectRevert(VictimBridge.InsufficientBalance.selector);
        vm.prank(alice);
        victimBridge.withdraw(2 ether);
    }

    function testOverflow_WithdrawExceedsBalanceStatic() public {
        _depositStatic(alice, 1 ether);
        vm.expectRevert(BridgeStaticOnly.InsufficientBalance.selector);
        vm.prank(alice);
        staticBridge.withdraw(2 ether);
    }

    function testOverflow_WithdrawExceedsBalanceSSTORE() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        sstoreGuardBridge.deposit{value: 1 ether}();
        vm.expectRevert(BridgeWithSSTOREGuard.InsufficientBalance.selector);
        vm.prank(alice);
        sstoreGuardBridge.withdraw(2 ether);
    }

    function testOverflow_WithdrawExceedsBalanceUnopt() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        unoptBridge.deposit{value: 1 ether}();
        vm.expectRevert("Insufficient balance");
        vm.prank(alice);
        unoptBridge.withdraw(2 ether);
    }

    // ==================== ACCESS CONTROL ====================

    function testUnauthorized_NonAdminCannotUpdateMonitor() public {
        vm.prank(alice);
        vm.expectRevert(MonitorMock.NotAdmin.selector);
        monitorMock.updateParameters(3, 5000);
    }

    function testUnauthorized_NonAdminCannotClearRecords() public {
        vm.prank(alice);
        vm.expectRevert(MonitorMock.NotAdmin.selector);
        monitorMock.clearRecords();
    }

    function testAdmin_CanUpdateMonitor() public {
        monitorMock.updateParameters(3, 5000);
        assertEq(monitorMock.P_detect(), 3);
        assertEq(monitorMock.lambda(), 5000);
    }

    function testAdmin_CanClearRecords() public {
        _depositVictim(alice, 1 ether);
        monitorMock.clearRecords();
    }

    // ==================== REENTRANCY ====================

    function testReentrancy_Unoptimized_Exploitable() public {
        vm.deal(address(attacker), 10 ether);
        attacker.attackUnoptimized{value: 1 ether}();
        assertTrue(address(attacker).balance > 1 ether, "Attacker should profit from reentrancy");
    }

    function testReentrancy_StaticBridge_Blocked() public {
        attacker.setStaticBridge(payable(address(staticBridge)));
        vm.deal(address(attacker), 10 ether);
        uint256 bridgeBefore = address(staticBridge).balance;
        attacker.attackStatic{value: 1 ether}();
        uint256 bridgeAfter = address(staticBridge).balance;
        assertEq(bridgeAfter, bridgeBefore, "Static bridge should not lose funds to reentrancy");
    }

    function testReentrancy_VictimBridge_Blocked() public {
        vm.deal(address(attacker), 10 ether);
        uint256 bridgeBefore = address(victimBridge).balance;
        attacker.attackVictim{value: 1 ether}();
        uint256 bridgeAfter = address(victimBridge).balance;
        assertEq(bridgeAfter, bridgeBefore, "Victim bridge should not lose funds to reentrancy");
    }

    function testReentrancy_SSTOREGuard_NormalWithdrawWorks() public {
        vm.deal(alice, 2 ether);
        vm.prank(alice);
        sstoreGuardBridge.deposit{value: 1 ether}();
        assertEq(sstoreGuardBridge.totalDeposits(), 1 ether);

        vm.prank(alice);
        sstoreGuardBridge.withdraw(1 ether);
        assertEq(sstoreGuardBridge.totalDeposits(), 0);
    }

    // ==================== SWAP EDGE CASES ====================

    function testSwap_ExceedsLiquidityVictim() public {
        _depositVictim(alice, 100 ether);
        vm.expectRevert();
        vm.prank(alice);
        victimBridge.swapETHForTokens{value: 100 ether}(100);
    }

    function testSwap_SlippageTooHighVictim() public {
        _depositVictim(alice, 10 ether);
        vm.expectRevert();
        vm.prank(alice);
        victimBridge.swapETHForTokens{value: 1 ether}(999999);
    }

    function testSwap_ExceedsLiquidityStatic() public {
        _depositStatic(alice, 100 ether);
        vm.expectRevert();
        vm.prank(alice);
        staticBridge.swapETHForTokens{value: 100 ether}(100);
    }

    function testSwap_SlippageTooHighStatic() public {
        _depositStatic(alice, 10 ether);
        vm.expectRevert();
        vm.prank(alice);
        staticBridge.swapETHForTokens{value: 1 ether}(999999);
    }

    function testSwap_ExceedsLiquidityUnopt() public {
        vm.deal(alice, 100 ether);
        vm.prank(alice);
        unoptBridge.deposit{value: 100 ether}();
        vm.expectRevert();
        vm.prank(alice);
        unoptBridge.swapETHForTokens{value: 100 ether}();
    }

    // ==================== MULTIPLE USERS ====================

    function testMultiUser_DepositAndWithdrawVictim() public {
        vm.deal(alice, 5 ether);
        vm.deal(bob, 5 ether);

        vm.prank(alice);
        victimBridge.deposit{value: 2 ether}();
        vm.prank(bob);
        victimBridge.deposit{value: 3 ether}();

        vm.prank(alice);
        victimBridge.withdraw(1 ether);

        vm.prank(bob);
        victimBridge.withdraw(2 ether);
    }

    function testMultiUser_DepositAndWithdrawStatic() public {
        vm.deal(alice, 5 ether);
        vm.deal(bob, 5 ether);

        vm.prank(alice);
        staticBridge.deposit{value: 2 ether}();
        vm.prank(bob);
        staticBridge.deposit{value: 3 ether}();

        vm.prank(alice);
        staticBridge.withdraw(1 ether);

        vm.prank(bob);
        staticBridge.withdraw(2 ether);
    }

    function testMultiUser_DepositAndWithdrawSSTORE() public {
        vm.deal(alice, 5 ether);
        vm.deal(bob, 5 ether);

        vm.prank(alice);
        sstoreGuardBridge.deposit{value: 2 ether}();
        vm.prank(bob);
        sstoreGuardBridge.deposit{value: 3 ether}();
        assertEq(sstoreGuardBridge.totalDeposits(), 5 ether);

        vm.prank(alice);
        sstoreGuardBridge.withdraw(1 ether);
        assertEq(sstoreGuardBridge.totalDeposits(), 4 ether);

        vm.prank(bob);
        sstoreGuardBridge.withdraw(2 ether);
        assertEq(sstoreGuardBridge.totalDeposits(), 2 ether);
    }

    // ==================== MEV / FRENTRUNNING ====================

    function testMEV_SandwichDetectedVictim() public {
        _depositVictim(alice, 10 ether);

        vm.deal(address(attacker), 10 ether);

        vm.prank(address(attacker));
        victimBridge.swapETHForTokens{value: 1 ether}(100);

        vm.prank(alice);
        vm.expectRevert();
        victimBridge.swapETHForTokens{value: 1 ether}(100);
    }

    // ==================== SSTORE GUARD ====================

    function testSSTOREGuard_DepositAndWithdraw() public {
        vm.deal(alice, 2 ether);
        vm.prank(alice);
        sstoreGuardBridge.deposit{value: 1 ether}();
        assertEq(sstoreGuardBridge.totalDeposits(), 1 ether);

        vm.prank(alice);
        sstoreGuardBridge.withdraw(1 ether);
        assertEq(sstoreGuardBridge.totalDeposits(), 0);
    }

    function testSSTOREGuard_MultipleDeposits() public {
        vm.deal(alice, 5 ether);
        vm.prank(alice);
        sstoreGuardBridge.deposit{value: 1 ether}();
        vm.prank(alice);
        sstoreGuardBridge.deposit{value: 2 ether}();
        assertEq(sstoreGuardBridge.totalDeposits(), 3 ether);
    }

    function testSSTOREGuard_WithdrawAll() public {
        vm.deal(alice, 2 ether);
        vm.prank(alice);
        sstoreGuardBridge.deposit{value: 2 ether}();
        assertEq(sstoreGuardBridge.totalDeposits(), 2 ether);

        vm.prank(alice);
        sstoreGuardBridge.withdraw(2 ether);
        assertEq(sstoreGuardBridge.totalDeposits(), 0);
    }

    function testSSTOREGuard_TotalDepositsTracking() public {
        vm.deal(alice, 5 ether);
        vm.deal(bob, 3 ether);

        vm.prank(alice);
        sstoreGuardBridge.deposit{value: 2 ether}();
        assertEq(sstoreGuardBridge.totalDeposits(), 2 ether);

        vm.prank(bob);
        sstoreGuardBridge.deposit{value: 3 ether}();
        assertEq(sstoreGuardBridge.totalDeposits(), 5 ether);

        vm.prank(alice);
        sstoreGuardBridge.withdraw(1 ether);
        assertEq(sstoreGuardBridge.totalDeposits(), 4 ether);
    }

    // =========================================================
    // TIER D [LIGHTWEIGHT] EDGE CASE TESTS
    // =========================================================

    function testZeroAmount_DepositLightweightReverts() public {
        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        vm.expectRevert(LightweightBridge.ZeroAmount.selector);
        lightweightBridge.deposit{value: 0}();
        vm.stopPrank();
    }

    function testZeroAmount_WithdrawLightweightReverts() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        lightweightBridge.deposit{value: 1 ether}();

        vm.startPrank(alice);
        lightweightBridge.withdraw(0);
        vm.stopPrank();

        (, uint96 bal) = lightweightBridge.userBalances(alice);
        assertEq(bal, 1 ether, "Balance should not change on zero withdraw");
    }

    function testZeroAmount_SwapLightweightReverts() public {
        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        vm.expectRevert(LightweightBridge.ZeroAmount.selector);
        lightweightBridge.swapETHForTokens{value: 0}(0);
        vm.stopPrank();
    }

    function testOverflow_WithdrawExceedsBalanceLightweight() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        lightweightBridge.deposit{value: 1 ether}();

        vm.startPrank(alice);
        vm.expectRevert(LightweightBridge.InsufficientBalance.selector);
        lightweightBridge.withdraw(2 ether);
        vm.stopPrank();
    }

    function testReentrancy_LightweightBridge_Blocked() public {
        vm.deal(alice, 10 ether);
        vm.prank(alice);
        lightweightBridge.deposit{value: 5 ether}();

        vm.deal(address(attacker), 10 ether);
        vm.expectRevert();
        attacker.attackLightweight{value: 5 ether}();
    }

    function testMultiUser_DepositAndWithdrawLightweight() public {
        vm.deal(alice, 5 ether);
        vm.deal(bob, 3 ether);

        vm.prank(alice);
        lightweightBridge.deposit{value: 2 ether}();
        assertEq(address(lightweightBridge).balance, 2 ether);

        vm.prank(bob);
        lightweightBridge.deposit{value: 3 ether}();
        assertEq(address(lightweightBridge).balance, 5 ether);

        vm.prank(alice);
        lightweightBridge.withdraw(1 ether);
        assertEq(address(lightweightBridge).balance, 4 ether);
    }

    function testSwap_SlippageTooHighLightweight() public {
        vm.deal(alice, 100 ether);
        vm.prank(alice);
        lightweightBridge.deposit{value: 100 ether}();

        vm.deal(bob, 10 ether);
        vm.startPrank(bob);
        vm.expectRevert(LightweightBridge.SlippageTooHigh.selector);
        lightweightBridge.swapETHForTokens{value: 10 ether}(99999 ether);
        vm.stopPrank();
    }

    function testSwap_ExceedsLiquidityLightweight() public {
        vm.deal(alice, 100 ether);
        vm.prank(alice);
        lightweightBridge.deposit{value: 100 ether}();

        vm.deal(bob, 200 ether);
        vm.startPrank(bob);
        lightweightBridge.swapETHForTokens{value: 200 ether}(0);
        vm.stopPrank();

        (, uint96 tokenReserve) = lightweightBridge.reserves();
        assertEq(tokenReserve > 0, true, "Token reserve should remain positive");
    }
}
