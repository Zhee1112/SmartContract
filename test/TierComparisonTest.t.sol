// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/UnoptimizedBridge.sol";
import "../src/BridgeStaticOnly.sol";
import "../src/VictimBridge.sol";
import "../src/LightweightBridge.sol";
import "../src/MonitorMock.sol";

contract TierComparisonTest is Test {
    UnoptimizedBridge unopt;
    BridgeStaticOnly stat;
    VictimBridge victim;
    LightweightBridge light;
    MonitorMock monitor;

    address admin;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address carol = makeAddr("carol");

    function setUp() public {
        admin = address(this);
        monitor = new MonitorMock();
        unopt = new UnoptimizedBridge();
        stat = new BridgeStaticOnly();
        victim = new VictimBridge(address(monitor));
        light = new LightweightBridge();

        vm.deal(alice, 1000 ether);
        vm.deal(bob, 1000 ether);
        vm.deal(carol, 1000 ether);
    }

    // ============================================================
    // CATEGORY 1: STATE TRANSITIONS
    // ============================================================

    function testDeposit_BalanceIncreases_AllTiers() public {
        uint256 amount = 10 ether;

        vm.startPrank(alice);
        unopt.deposit{value: amount}();
        assertEq(address(unopt).balance, amount, "A: bridge balance after deposit");
        assertEq(unopt.balances(alice), amount, "A: user balance after deposit");
        vm.stopPrank();

        vm.startPrank(alice);
        stat.deposit{value: amount}();
        assertEq(address(stat).balance, amount, "B: bridge balance after deposit");
        (, uint96 balB) = stat.userBalances(alice);
        assertEq(balB, amount, "B: user balance after deposit");
        vm.stopPrank();

        vm.startPrank(alice);
        victim.deposit{value: amount}();
        assertEq(address(victim).balance, amount, "C: bridge balance after deposit");
        (, uint96 balC) = victim.userBalances(alice);
        assertEq(balC, amount, "C: user balance after deposit");
        vm.stopPrank();

        vm.startPrank(alice);
        light.deposit{value: amount}();
        assertEq(address(light).balance, amount, "D: bridge balance after deposit");
        (, uint96 balD) = light.userBalances(alice);
        assertEq(balD, amount, "D: user balance after deposit");
        vm.stopPrank();
    }

    function testWithdraw_BalanceDecreases_AllTiers() public {
        uint256 dep = 10 ether;
        uint96 wit = 3 ether;

        _depositAll(alice, dep);

        vm.startPrank(alice);
        unopt.withdraw(wit);
        assertEq(unopt.balances(alice), dep - wit, "A: user balance after withdraw");
        vm.stopPrank();

        vm.startPrank(alice);
        stat.withdraw(wit);
        (, uint96 balB) = stat.userBalances(alice);
        assertEq(balB, dep - wit, "B: user balance after withdraw");
        vm.stopPrank();

        vm.startPrank(alice);
        victim.withdraw(wit);
        (, uint96 balC) = victim.userBalances(alice);
        assertEq(balC, dep - wit, "C: user balance after withdraw");
        vm.stopPrank();

        vm.startPrank(alice);
        light.withdraw(wit);
        (, uint96 balD) = light.userBalances(alice);
        assertEq(balD, dep - wit, "D: user balance after withdraw");
        vm.stopPrank();
    }

    function testSwap_ReservesUpdate_AllTiers() public {
        uint256 amount = 1 ether;

        _depositAll(alice, 50 ether);

        (uint96 ethBefore, uint96 tokenBefore) = stat.reserves();

        vm.startPrank(alice);
        stat.swapETHForTokens{value: amount}(0);
        vm.stopPrank();

        (uint96 ethAfter, uint96 tokenAfter) = stat.reserves();
        assertGt(ethAfter, ethBefore, "B: ETH reserve should increase");
        assertLt(tokenAfter, tokenBefore, "B: Token reserve should decrease");

        (ethBefore, tokenBefore) = victim.reserves();
        vm.startPrank(alice);
        victim.swapETHForTokens{value: amount}(0);
        vm.stopPrank();
        (ethAfter, tokenAfter) = victim.reserves();
        assertGt(ethAfter, ethBefore, "C: ETH reserve should increase");
        assertLt(tokenAfter, tokenBefore, "C: Token reserve should decrease");

        (ethBefore, tokenBefore) = light.reserves();
        vm.startPrank(alice);
        light.swapETHForTokens{value: amount}(0);
        vm.stopPrank();
        (ethAfter, tokenAfter) = light.reserves();
        assertGt(ethAfter, ethBefore, "D: ETH reserve should increase");
        assertLt(tokenAfter, tokenBefore, "D: Token reserve should decrease");
    }

    function testDepositWithdraw_RoundTrip_KeepsBridgeSOLVENCY() public {
        uint256 amount = 10 ether;
        _depositAll(alice, amount);

        uint256 bridgeBefore = address(light).balance;

        vm.startPrank(alice);
        light.withdraw(uint96(amount));
        vm.stopPrank();

        (, uint96 balAfter) = light.userBalances(alice);
        assertEq(balAfter, 0, "D: user balance should be 0");
        assertEq(address(light).balance, bridgeBefore - amount, "D: bridge balance reduced");
    }

    // ============================================================
    // CATEGORY 2: EVENT EMISSION
    // ============================================================

    function testDeposit_EventEmission_AllTiers() public {
        uint256 amount = 5 ether;

        vm.expectEmit(true, false, false, false, address(unopt));
        emit UnoptimizedBridge.Deposit(alice, amount);
        vm.prank(alice);
        unopt.deposit{value: amount}();

        vm.expectEmit(true, false, false, false, address(stat));
        emit BridgeStaticOnly.Deposit(alice, uint96(amount));
        vm.prank(alice);
        stat.deposit{value: amount}();

        vm.expectEmit(true, false, false, false, address(victim));
        emit VictimBridge.Deposit(alice, uint96(amount), uint96(amount));
        vm.prank(alice);
        victim.deposit{value: amount}();

        vm.expectEmit(true, false, false, false, address(light));
        emit LightweightBridge.Deposit(alice, uint96(amount), uint96(amount));
        vm.prank(alice);
        light.deposit{value: amount}();
    }

    function testWithdraw_EventEmission_AllTiers() public {
        uint256 amount = 10 ether;
        uint96 wit = 3 ether;
        _depositAll(alice, amount);

        vm.expectEmit(true, false, false, false, address(unopt));
        emit UnoptimizedBridge.Withdraw(alice, wit);
        vm.prank(alice);
        unopt.withdraw(wit);

        vm.expectEmit(true, false, false, false, address(stat));
        emit BridgeStaticOnly.Withdraw(alice, wit);
        vm.prank(alice);
        stat.withdraw(wit);

        vm.expectEmit(true, false, false, false, address(victim));
        emit VictimBridge.Withdraw(alice, wit, 0, wit, uint96(amount - wit));
        vm.prank(alice);
        victim.withdraw(wit);

        vm.expectEmit(true, false, false, false, address(light));
        emit LightweightBridge.Withdraw(alice, wit, 0, wit, uint96(amount - wit));
        vm.prank(alice);
        light.withdraw(wit);
    }

    function testSwap_EventEmission_AllTiers() public {
        uint96 swapAmount = 1 ether;
        _depositAll(alice, 50 ether);

        vm.prank(alice);
        stat.swapETHForTokens{value: swapAmount}(0);
        (uint96 ethR, uint96 tokenR) = stat.reserves();

        vm.prank(alice);
        victim.swapETHForTokens{value: swapAmount}(0);

        vm.prank(alice);
        light.swapETHForTokens{value: swapAmount}(0);
    }

    function testPause_EmergencyPausedEvent_CandD() public {
        vm.expectEmit(false, true, false, false, address(victim));
        emit VictimBridge.EmergencyPaused(admin);
        victim.pause();

        vm.expectEmit(false, true, false, false, address(light));
        emit LightweightBridge.EmergencyPaused(admin);
        light.pause();
    }

    function testUnpause_EmergencyUnpausedEvent_CandD() public {
        victim.pause();
        light.pause();

        vm.expectEmit(false, true, false, false, address(victim));
        emit VictimBridge.EmergencyUnpaused(admin);
        victim.unpause();

        vm.expectEmit(false, true, false, false, address(light));
        emit LightweightBridge.EmergencyUnpaused(admin);
        light.unpause();
    }

    // ============================================================
    // CATEGORY 3: ACCESS CONTROL
    // ============================================================

    function testPause_OnlyAdmin_C() public {
        vm.prank(alice);
        vm.expectRevert(VictimBridge.NotAdmin.selector);
        victim.pause();
    }

    function testUnpause_OnlyAdmin_C() public {
        victim.pause();
        vm.prank(alice);
        vm.expectRevert(VictimBridge.NotAdmin.selector);
        victim.unpause();
    }

    function testPause_OnlyAdmin_D() public {
        vm.prank(alice);
        vm.expectRevert(LightweightBridge.NotAdmin.selector);
        light.pause();
    }

    function testUnpause_OnlyAdmin_D() public {
        light.pause();
        vm.prank(alice);
        vm.expectRevert(LightweightBridge.NotAdmin.selector);
        light.unpause();
    }

    function testPause_CannotPauseTwice_C() public {
        victim.pause();
        vm.expectRevert(VictimBridge.WhenPaused.selector);
        victim.pause();
    }

    function testUnpause_CannotUnpauseWhenNotPaused_C() public {
        vm.expectRevert(VictimBridge.WhenNotPaused.selector);
        victim.unpause();
    }

    function testPause_CannotPauseTwice_D() public {
        light.pause();
        vm.expectRevert(LightweightBridge.WhenPaused.selector);
        light.pause();
    }

    function testUnpause_CannotUnpauseWhenNotPaused_D() public {
        vm.expectRevert(LightweightBridge.WhenNotPaused.selector);
        light.unpause();
    }

    function testRecordFrontrun_Permissionless_D() public {
        vm.prank(carol);
        light.recordFrontrun(alice, 5 ether);
        (address sender, uint8 txType) = light.lastTx();
        assertEq(sender, alice, "D: lastTx.sender should be alice");
        assertEq(txType, 0, "D: lastTx.txType should be 0 (frontrun)");
    }

    function testConstants_Immutable_D() public {
        assertEq(light.P_DETECT(), 9600, "D: P_DETECT should be 9600");
        assertEq(light.LAMBDA(), 15000, "D: LAMBDA should be 15000");
    }

    function testAdmin_SetToDeployer_AllTiers() public {
        assertEq(unopt.admin(), admin, "A: admin should be deployer");
        assertEq(stat.admin(), admin, "B: admin should be deployer");
        assertEq(victim.admin(), admin, "C: admin should be deployer");
        assertEq(light.admin(), admin, "D: admin should be deployer");
    }

    // ============================================================
    // CATEGORY 4: PAUSE STATE TRANSITIONS
    // ============================================================

    function testDeposit_RevertsWhenPaused_C() public {
        victim.pause();
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert(VictimBridge.WhenPaused.selector);
        victim.deposit{value: 1 ether}();
    }

    function testWithdraw_RevertsWhenPaused_C() public {
        _depositAll(alice, 10 ether);
        victim.pause();
        vm.prank(alice);
        vm.expectRevert(VictimBridge.WhenPaused.selector);
        victim.withdraw(1 ether);
    }

    function testSwap_RevertsWhenPaused_C() public {
        _depositAll(alice, 10 ether);
        victim.pause();
        vm.prank(alice);
        vm.expectRevert(VictimBridge.WhenPaused.selector);
        victim.swapETHForTokens{value: 1 ether}(0);
    }

    function testDeposit_RevertsWhenPaused_D() public {
        light.pause();
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert(LightweightBridge.WhenPaused.selector);
        light.deposit{value: 1 ether}();
    }

    function testWithdraw_RevertsWhenPaused_D() public {
        _depositAll(alice, 10 ether);
        light.pause();
        vm.prank(alice);
        vm.expectRevert(LightweightBridge.WhenPaused.selector);
        light.withdraw(1 ether);
    }

    function testSwap_RevertsWhenPaused_D() public {
        _depositAll(alice, 10 ether);
        light.pause();
        vm.prank(alice);
        vm.expectRevert(LightweightBridge.WhenPaused.selector);
        light.swapETHForTokens{value: 1 ether}(0);
    }

    function testPause_PreservesUserBalances_C() public {
        _depositAll(alice, 10 ether);
        (, uint96 before) = victim.userBalances(alice);
        victim.pause();
        victim.unpause();
        (, uint96 after_) = victim.userBalances(alice);
        assertEq(before, after_, "C: balance should survive pause/unpause");
    }

    function testPause_PreservesUserBalances_D() public {
        _depositAll(alice, 10 ether);
        (, uint96 before) = light.userBalances(alice);
        light.pause();
        light.unpause();
        (, uint96 after_) = light.userBalances(alice);
        assertEq(before, after_, "D: balance should survive pause/unpause");
    }

    function testDeposit_WorksAfterUnpause_C() public {
        victim.pause();
        victim.unpause();
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        victim.deposit{value: 1 ether}();
        (, uint96 bal) = victim.userBalances(alice);
        assertEq(bal, 1 ether, "C: deposit should work after unpause");
    }

    function testDeposit_WorksAfterUnpause_D() public {
        light.pause();
        light.unpause();
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        light.deposit{value: 1 ether}();
        (, uint96 bal) = light.userBalances(alice);
        assertEq(bal, 1 ether, "D: deposit should work after unpause");
    }

    // ============================================================
    // CATEGORY 5: LIGHTWEIGHT-SPECIFIC (lastTx, recordFrontrun)
    // ============================================================

    function testLastTx_UpdatedAfterDeposit_D() public {
        vm.deal(alice, 5 ether);
        vm.prank(alice);
        light.deposit{value: 5 ether}();

        (address sender, uint8 txType) = light.lastTx();
        assertEq(sender, alice, "D: lastTx.sender after deposit");
        assertEq(txType, 1, "D: lastTx.txType=1 (victim tx)");
        assertEq(light.lastTxBlock(), block.number, "D: lastTxBlock = current block");
    }

    function testLastTx_UpdatedAfterWithdraw_D() public {
        _depositAll(alice, 10 ether);
        vm.prank(alice);
        light.withdraw(3 ether);

        (address sender, uint8 txType) = light.lastTx();
        assertEq(sender, alice, "D: lastTx.sender after withdraw");
        assertEq(txType, 1, "D: lastTx.txType=1");
    }

    function testLastTx_UpdatedAfterSwap_D() public {
        _depositAll(alice, 50 ether);
        vm.prank(alice);
        light.swapETHForTokens{value: 1 ether}(0);

        (address sender, uint8 txType) = light.lastTx();
        assertEq(sender, alice, "D: lastTx.sender after swap");
        assertEq(txType, 1, "D: lastTx.txType=1");
    }

    function testRecordFrontrun_UpdatesLastTx_D() public {
        light.recordFrontrun(bob, 5 ether);
        (address sender, uint8 txType) = light.lastTx();
        assertEq(sender, bob, "D: lastTx.sender after frontrun");
        assertEq(txType, 0, "D: lastTx.txType=0 (frontrun)");
        assertEq(light.lastTxBlock(), block.number, "D: lastTxBlock = current block");
    }

    function testRecordFrontrun_CanBeCalledByAnyone_D() public {
        vm.prank(carol);
        light.recordFrontrun(alice, 5 ether);
        (address sender,) = light.lastTx();
        assertEq(sender, alice, "D: anyone can call recordFrontrun");
    }

    function testLastTx_DifferentBlock_NoAnomaly_D() public {
        light.recordFrontrun(alice, 5 ether);
        vm.warp(block.timestamp + 12);
        vm.roll(block.number + 1);

        _depositAll(bob, 50 ether);
        vm.prank(bob);
        light.swapETHForTokens{value: 1 ether}(0);
    }

    // ============================================================
    // CATEGORY 6: MULTI-USER ISOLATION
    // ============================================================

    function testMultiUser_IsolatedBalances_AllTiers() public {
        uint96 amtA = 5 ether;
        uint96 amtB = 8 ether;

        vm.startPrank(alice);
        unopt.deposit{value: amtA}();
        stat.deposit{value: amtA}();
        victim.deposit{value: amtA}();
        light.deposit{value: amtA}();
        vm.stopPrank();

        vm.startPrank(bob);
        unopt.deposit{value: amtB}();
        stat.deposit{value: amtB}();
        victim.deposit{value: amtB}();
        light.deposit{value: amtB}();
        vm.stopPrank();

        assertEq(unopt.balances(alice), amtA, "A: alice balance");
        assertEq(unopt.balances(bob), amtB, "A: bob balance");

        (, uint96 balAliceB) = stat.userBalances(alice);
        (, uint96 balBobB) = stat.userBalances(bob);
        assertEq(balAliceB, amtA, "B: alice balance");
        assertEq(balBobB, amtB, "B: bob balance");

        (, uint96 balAliceC) = victim.userBalances(alice);
        (, uint96 balBobC) = victim.userBalances(bob);
        assertEq(balAliceC, amtA, "C: alice balance");
        assertEq(balBobC, amtB, "C: bob balance");

        (, uint96 balAliceD) = light.userBalances(alice);
        (, uint96 balBobD) = light.userBalances(bob);
        assertEq(balAliceD, amtA, "D: alice balance");
        assertEq(balBobD, amtB, "D: bob balance");
    }

    function testMultiUser_OneWithdraw_DoesNotAffectOther() public {
        uint96 dep = 10 ether;
        _depositAll(alice, dep);
        _depositAll(bob, dep);

        vm.startPrank(alice);
        light.withdraw(3 ether);
        vm.stopPrank();

        (, uint96 aliceBal) = light.userBalances(alice);
        (, uint96 bobBal) = light.userBalances(bob);
        assertEq(aliceBal, dep - 3 ether, "D: alice should have 7 ether");
        assertEq(bobBal, dep, "D: bob should still have 10 ether");
    }

    function testMultiUser_SimultaneousDeposit_SameBlock() public {
        uint96 amt = 5 ether;

        vm.deal(alice, amt);
        vm.deal(bob, amt);
        vm.deal(carol, amt);

        vm.prank(alice);
        light.deposit{value: amt}();
        vm.prank(bob);
        light.deposit{value: amt}();
        vm.prank(carol);
        light.deposit{value: amt}();

        (, uint96 balA) = light.userBalances(alice);
        (, uint96 balB) = light.userBalances(bob);
        (, uint96 balC) = light.userBalances(carol);
        assertEq(balA, amt);
        assertEq(balB, amt);
        assertEq(balC, amt);
        assertEq(address(light).balance, amt * 3, "D: total balance");
    }

    // ============================================================
    // CATEGORY 7: EDGE CASE AMOUNTS
    // ============================================================

    function testDeposit_1Wei_AllTiers() public {
        vm.deal(alice, 100);

        vm.startPrank(alice);
        unopt.deposit{value: 1}();
        assertEq(unopt.balances(alice), 1, "A: 1 wei deposit");

        stat.deposit{value: 1}();
        (, uint96 bB) = stat.userBalances(alice);
        assertEq(bB, 1, "B: 1 wei deposit");

        victim.deposit{value: 1}();
        (, uint96 bC) = victim.userBalances(alice);
        assertEq(bC, 1, "C: 1 wei deposit");

        light.deposit{value: 1}();
        (, uint96 bD) = light.userBalances(alice);
        assertEq(bD, 1, "D: 1 wei deposit");
        vm.stopPrank();
    }

    function testWithdraw_1Wei_AllTiers() public {
        _depositAll(alice, 10 ether);

        vm.startPrank(alice);
        unopt.withdraw(1);
        assertEq(unopt.balances(alice), 10 ether - 1, "A: 1 wei withdraw");

        stat.withdraw(1);
        (, uint96 bB) = stat.userBalances(alice);
        assertEq(bB, 10 ether - 1, "B: 1 wei withdraw");

        victim.withdraw(1);
        (, uint96 bC) = victim.userBalances(alice);
        assertEq(bC, 10 ether - 1, "C: 1 wei withdraw");

        light.withdraw(1);
        (, uint96 bD) = light.userBalances(alice);
        assertEq(bD, 10 ether - 1, "D: 1 wei withdraw");
        vm.stopPrank();
    }

    function testWithdraw_EntireBalance_AllTiers() public {
        uint96 dep = 10 ether;
        _depositAll(alice, dep);

        vm.startPrank(alice);
        unopt.withdraw(dep);
        assertEq(unopt.balances(alice), 0, "A: full withdraw = 0");

        stat.withdraw(dep);
        (, uint96 bB) = stat.userBalances(alice);
        assertEq(bB, 0, "B: full withdraw = 0");

        victim.withdraw(dep);
        (, uint96 bC) = victim.userBalances(alice);
        assertEq(bC, 0, "C: full withdraw = 0");

        light.withdraw(dep);
        (, uint96 bD) = light.userBalances(alice);
        assertEq(bD, 0, "D: full withdraw = 0");
        vm.stopPrank();
    }

    function testDoubleWithdraw_ShouldFail_AllTiers() public {
        uint96 dep = 10 ether;
        _depositAll(alice, dep);

        vm.startPrank(alice);
        unopt.withdraw(dep);

        stat.withdraw(dep);
        vm.expectRevert(BridgeStaticOnly.InsufficientBalance.selector);
        stat.withdraw(1);

        victim.withdraw(dep);
        vm.expectRevert(VictimBridge.InsufficientBalance.selector);
        victim.withdraw(1);

        light.withdraw(dep);
        vm.expectRevert(LightweightBridge.InsufficientBalance.selector);
        light.withdraw(1);
        vm.stopPrank();
    }

    function testWithdraw_NeverDeposited_ShouldFail_AllTiers() public {
        vm.startPrank(alice);
        vm.expectRevert(BridgeStaticOnly.InsufficientBalance.selector);
        stat.withdraw(1 ether);

        vm.expectRevert(VictimBridge.InsufficientBalance.selector);
        victim.withdraw(1 ether);

        vm.expectRevert(LightweightBridge.InsufficientBalance.selector);
        light.withdraw(1 ether);
        vm.stopPrank();
    }

    function testZeroAmount_Deposit_ShouldFail_BCD() public {
        vm.deal(alice, 1 ether);

        vm.startPrank(alice);
        vm.expectRevert(BridgeStaticOnly.ZeroAmount.selector);
        stat.deposit{value: 0}();

        vm.expectRevert(VictimBridge.ZeroAmount.selector);
        victim.deposit{value: 0}();

        vm.expectRevert(LightweightBridge.ZeroAmount.selector);
        light.deposit{value: 0}();
        vm.stopPrank();
    }

    function testZeroAmount_Swap_ShouldFail_BCD() public {
        _depositAll(alice, 10 ether);

        vm.startPrank(alice);
        vm.expectRevert(BridgeStaticOnly.ZeroAmount.selector);
        stat.swapETHForTokens{value: 0}(0);

        vm.expectRevert(VictimBridge.ZeroAmount.selector);
        victim.swapETHForTokens{value: 0}(0);

        vm.expectRevert(LightweightBridge.ZeroAmount.selector);
        light.swapETHForTokens{value: 0}(0);
        vm.stopPrank();
    }

    // ============================================================
    // CATEGORY 8: COMPLETE LIFECYCLE
    // ============================================================

    function testLifecycle_DepositSwapWithdraw_AllTiers() public {
        uint256 dep = 50 ether;
        uint96 wit = 10 ether;
        uint96 swapAmt = 2 ether;

        vm.startPrank(alice);
        unopt.deposit{value: dep}();
        unopt.swapETHForTokens{value: swapAmt}();
        unopt.withdraw(wit);
        vm.stopPrank();

        vm.startPrank(alice);
        stat.deposit{value: dep}();
        stat.swapETHForTokens{value: swapAmt}(0);
        stat.withdraw(wit);
        vm.stopPrank();

        vm.startPrank(alice);
        victim.deposit{value: dep}();
        victim.swapETHForTokens{value: swapAmt}(0);
        victim.withdraw(wit);
        vm.stopPrank();

        vm.startPrank(alice);
        light.deposit{value: dep}();
        light.swapETHForTokens{value: swapAmt}(0);
        light.withdraw(wit);
        vm.stopPrank();
    }

    function testLifecycle_FullPauseUnpauseCycle_D() public {
        uint96 dep = 10 ether;

        vm.startPrank(alice);
        light.deposit{value: dep}();
        vm.stopPrank();

        light.pause();

        vm.deal(bob, 1 ether);
        vm.prank(bob);
        vm.expectRevert(LightweightBridge.WhenPaused.selector);
        light.deposit{value: 1 ether}();

        light.unpause();

        vm.startPrank(bob);
        light.deposit{value: 1 ether}();
        (, uint96 bobBal) = light.userBalances(bob);
        assertEq(bobBal, 1 ether, "D: bob deposit after unpause");
        vm.stopPrank();
    }

    // ============================================================
    // CATEGORY 9: NO-OP ON A AND B
    // ============================================================

    function testNoPauseFunction_B() public {
        (bool success,) = address(stat).call(abi.encodeWithSignature("pause()"));
        assertFalse(success, "B: pause() should not exist");
    }

    function testNoUnpauseFunction_B() public {
        (bool success,) = address(stat).call(abi.encodeWithSignature("unpause()"));
        assertFalse(success, "B: unpause() should not exist");
    }

    // ============================================================
    // HELPERS
    // ============================================================

    function _depositAll(address user, uint256 amount) internal {
        vm.deal(user, amount * 5);
        vm.startPrank(user);
        unopt.deposit{value: amount}();
        stat.deposit{value: amount}();
        victim.deposit{value: amount}();
        light.deposit{value: amount}();
        vm.stopPrank();
    }
}
