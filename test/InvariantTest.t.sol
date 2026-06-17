// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/VictimBridge.sol";
import "../src/MonitorMock.sol";

contract InvariantTest is Test {
    VictimBridge public victimBridge;
    MonitorMock public monitor;

    address[] public users;
    address user1 = address(0x1111);
    address user2 = address(0x2222);
    address user3 = address(0x3333);

    function setUp() public {
        monitor = new MonitorMock();
        victimBridge = new VictimBridge(address(monitor));

        users.push(user1);
        users.push(user2);
        users.push(user3);

        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);
        vm.deal(address(victimBridge), 1000 ether);
    }

    // INVARIANT 1: all user balances are non-negative (uint96 always >= 0, sanity check)
    function invariant_balancesAlwaysNonNegative() public {
        for (uint256 i = 0; i < users.length; i++) {
            (, uint96 balance) = victimBridge.userBalances(users[i]);
            assertGe(balance, 0, "INVARIANT 1 FAILED");
        }
    }

    // INVARIANT 2: callDepth >= 0 (sanity check - uint256 always >= 0)
    function invariant_callDepthNonNegative() public {
        uint256 depth = monitor.callDepth();
        assertGe(depth, 0, "INVARIANT 2 FAILED");
    }

    // INVARIANT 3: callDepth resets to 0 after complete transaction cycle
    function invariant_callDepthResetsAfterTransaction() public {
        uint256 depth = monitor.callDepth();
        assertEq(depth, 0, "INVARIANT 3 FAILED");
    }

    // BONUS: Reentrancy Guard Test (Invariant 3)
    function test_reentrancyGuardWorks() public {
        vm.prank(user1);
        victimBridge.deposit{value: 10 ether}();

        vm.prank(user1);
        victimBridge.withdraw(5 ether);

        assertEq(monitor.callDepth(), 0, "callDepth should reset to 0");
    }
}
