// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title BridgeWithSSTOREGuard
 * @dev Bridge dengan SSTORE-based reentrancy guard (mirip OpenZeppelin ReentrancyGuard).
 *      Digunakan sebagai benchmark untuk membandingkan gas dengan EIP-1153 TSTORE.
 */
contract BridgeWithSSTOREGuard {
    struct UserBalance {
        address userAddress;
        uint96 balance;
    }

    mapping(address => UserBalance) public userBalances;
    uint256 public totalDeposits;

    // SSTORE-based mutex (mirip OZ ReentrancyGuard)
    uint256 private _NOT_ENTERED = 1;
    uint256 private _ENTERED = 2;
    uint256 private _status;

    event Deposit(address indexed user, uint96 amount);
    event Withdraw(address indexed user, uint96 amount);

    error InsufficientBalance();
    error TransferFailed();
    error ReentrancyGuard();

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        if (_status == _ENTERED) revert ReentrancyGuard();
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    function deposit() public payable {
        uint96 amount = uint96(msg.value);
        if (amount == 0) revert();

        UserBalance storage u = userBalances[msg.sender];
        u.userAddress = msg.sender;
        unchecked {
            u.balance += amount;
            totalDeposits += amount;
        }

        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint96 amount) public nonReentrant {
        UserBalance storage u = userBalances[msg.sender];
        if (u.balance < amount) revert InsufficientBalance();

        unchecked {
            u.balance -= amount;
            totalDeposits -= amount;
        }

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdraw(msg.sender, amount);
    }

    receive() external payable {}
}
