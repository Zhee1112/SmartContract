// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title UnoptimizedBridge
 * @dev Kontrak jembatan vault dasar yang rentan reentrancy dan tidak efisien gas.
 * Digunakan sebagai baseline riset perbandingan "sebelum vs sesudah".
 */
contract UnoptimizedBridge {
    // VARIABEL STATE TIDAK TERKEMAS (BOROS GAS)
    address public admin;                 // 20 bytes
    bool public isPaused;                 // 1 byte (mengambil 32-byte slot penuh)
    bool public locked;                   // 1 byte (mengambil 32-byte slot penuh)
    
    mapping(address => uint256) public balances; // Unpacked uint256
    
    // Likuiditas pool swap virtual (vulnerable swap)
    uint256 public reserveETH = 100 ether;
    uint256 public reserveToken = 100000 * 10**18;

    // EVENTS
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Swap(address indexed user, uint256 amountETHIn, uint256 amountTokenOut);

    constructor() {
        admin = msg.sender;
        isPaused = false;
        locked = false;
    }

    // Pendepositan sederhana
    function deposit() public payable {
        require(!isPaused, "Paused");
        require(msg.value > 0, "Must deposit > 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Fungsi withdraw yang rentan reentrancy (Interactions sebelum Effects).
     * Tidak menerapkan pola Checks-Effects-Interactions (CEI).
     */
    function withdraw(uint256 amount) public {
        require(!isPaused, "Paused");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // INTERACTIONS (Panggilan eksternal)
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        // EFFECTS (Pembaruan state dilakukan terlambat)
        unchecked {
            balances[msg.sender] -= amount;
        }

        emit Withdraw(msg.sender, amount);
    }

    /**
     * @dev Fungsi swap sederhana berbasis constant-product.
     * Rentan terhadap sandwich attack karena tidak memiliki verifikasi slippage atau monitoring anomali.
     */
    function swapETHForTokens() public payable {
        require(!isPaused, "Paused");
        uint256 amountIn = msg.value;
        require(amountIn > 0, "Must swap > 0");

        // Constant Product Formula: x * y = k
        uint256 amountOut = (reserveToken * amountIn) / (reserveETH + amountIn);
        require(amountOut < reserveToken, "Insufficient liquidity");

        reserveETH += amountIn;
        reserveToken -= amountOut;

        emit Swap(msg.sender, amountIn, amountOut);
    }

    // Fungsi pembantu untuk mendanai jembatan
    receive() external payable {}
}
