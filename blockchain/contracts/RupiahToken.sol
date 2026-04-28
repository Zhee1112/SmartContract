// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RupiahToken (IDRT)
 * @dev Token ERC-20 yang mewakili Rupiah Digital.
 *      1 Token = 1 Rupiah (Rp)
 *      Hanya Owner (Bank/Penerbit) yang bisa mencetak token baru (mint).
 */
contract RupiahToken is ERC20, Ownable {

    // Event untuk mencatat aktivitas minting dan burning
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    /**
     * @dev Constructor: Menginisialisasi token dengan nama dan simbol.
     *      Supply awal dicetak untuk deployer sebagai likuiditas awal.
     * @param initialSupply Jumlah token awal (dalam satuan Rupiah)
     */
    constructor(uint256 initialSupply) ERC20("Rupiah Digital", "IDRT") Ownable(msg.sender) {
        // Mint supply awal ke deployer
        // Contoh: 1_000_000_000 = 1 Miliar Rupiah
        _mint(msg.sender, initialSupply * (10 ** decimals()));
        emit TokensMinted(msg.sender, initialSupply);
    }

    /**
     * @dev Override decimals() menjadi 0 agar 1 Token = 1 Rupiah (tanpa desimal)
     *      Ini memudahkan kalkulasi pajak & gaji dalam angka bulat Rupiah.
     */
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    /**
     * @dev Fungsi Mint: Mencetak token Rupiah baru.
     *      Hanya bisa dipanggil oleh Owner (penerbit resmi).
     * @param to Alamat penerima token baru
     * @param amount Jumlah Rupiah yang dicetak
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "IDRT: Tidak bisa mint ke alamat nol");
        require(amount > 0, "IDRT: Jumlah harus lebih dari 0");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Fungsi Burn: Menghancurkan token (digunakan saat penarikan ke Rupiah fisik).
     * @param amount Jumlah token yang dihancurkan
     */
    function burn(uint256 amount) external {
        require(amount > 0, "IDRT: Jumlah harus lebih dari 0");
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
}
