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

    // FUZZ: deposit() -- valid amount
    function testFuzz_DepositValidAmount(uint96 amount) public {
        vm.assume(amount > 0);
        vm.assume(amount <= 100 ether);

        vm.deal(user, amount);
        vm.prank(user);
        victimBridge.deposit{value: amount}();

        (, uint96 balance) = victimBridge.userBalances(user);
        assertEq(balance, amount, "Balance should equal deposited amount");
    }

    // FUZZ: deposit() -- revert on zero
    function testFuzz_DepositRevertOnZero(uint256 amount) public {
        vm.assume(amount == 0);

        vm.prank(user);
        vm.expectRevert(VictimBridge.ZeroAmount.selector);
        victimBridge.deposit{value: amount}();
    }

    // FUZZ: withdraw() -- cannot exceed balance
    function testFuzz_WithdrawCannotExceedBalance(uint96 depositAmount, uint96 withdrawAmount) public {
        vm.assume(depositAmount > 0);
        vm.assume(depositAmount <= 100 ether);
        vm.assume(withdrawAmount > 0);

        vm.deal(user, depositAmount);
        vm.prank(user);
        victimBridge.deposit{value: depositAmount}();

        vm.prank(user);
        if (withdrawAmount > depositAmount) {
            vm.expectRevert(VictimBridge.InsufficientBalance.selector);
            victimBridge.withdraw(withdrawAmount);
        } else {
            victimBridge.withdraw(withdrawAmount);
            (, uint96 remainingBalance) = victimBridge.userBalances(user);
            assertEq(remainingBalance, depositAmount - withdrawAmount, "Remaining balance incorrect");
        }
    }

    // FUZZ: swapETHForTokens() -- formula correctness
    function testFuzz_SwapFormulaCorrectness(uint96 ethIn) public {
        vm.assume(ethIn > 0.001 ether);
        vm.assume(ethIn <= 10 ether);

        uint96 ethReserve = 100 ether;
        uint96 tokenReserve = 100000 * 10**18;

        uint256 expectedOut = (uint256(tokenReserve) * uint256(ethIn)) / (uint256(ethReserve) + uint256(ethIn));

        vm.deal(user, 2 * ethIn);
        vm.prank(user);
        victimBridge.deposit{value: ethIn}();

        vm.prank(user);
        victimBridge.swapETHForTokens{value: ethIn}(0);

        (uint96 newEthReserve, uint96 newTokenReserve) = victimBridge.reserves();
        assertEq(newEthReserve, ethReserve + ethIn, "ETH reserve incorrect");
        assertEq(newTokenReserve, tokenReserve - uint96(expectedOut), "Token reserve incorrect");
    }

    // FUZZ: calculatePenalty() -- penalty <= amount
    function testFuzz_PenaltyNeverExceedsAmount(uint256 amount, uint256 score) public {
        vm.assume(amount > 0);
        vm.assume(amount <= type(uint96).max);
        vm.assume(score <= 10000);

        uint256 penalty = monitor.calculatePenalty(amount, score);
        assertLe(penalty, amount, "Penalty should never exceed amount");
    }

    // FUZZ: calculatePenalty() — zero when score zero
    function testFuzz_PenaltyZeroWhenScoreZero(uint256 amount) public {
        uint256 penalty = monitor.calculatePenalty(amount, 0);
        assertEq(penalty, 0, "Penalty should be 0 when score is 0");
    }

    // FUZZ: BridgeStaticOnly deposit/withdraw
    function testFuzz_StaticBridge_DepositWithdraw(uint96 depositAmount, uint96 withdrawAmount) public {
        vm.assume(depositAmount > 0);
        vm.assume(depositAmount <= 100 ether);
        vm.assume(withdrawAmount > 0);

        vm.deal(user, depositAmount);
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

    // FUZZ: UnoptimizedBridge deposit
    function testFuzz_UnoptimizedBridge_Deposit(uint256 amount) public {
        vm.assume(amount > 0);
        vm.assume(amount <= 100 ether);

        vm.deal(user, amount);
        vm.prank(user);
        unoptBridge.deposit{value: amount}();

        uint256 balance = unoptBridge.balances(user);
        assertEq(balance, amount, "Unoptimized: balance should equal deposit");
    }

    receive() external payable {}
}
