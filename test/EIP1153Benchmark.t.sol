// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

/**
 * @title EIP1153Benchmark
 * @dev Pure gas comparison: TSTORE/TLOAD (EIP-1153) vs SSTORE/SLOAD (legacy).
 *      Isolates the opcode cost without any bridge logic overhead.
 */
contract EIP1153Benchmark is Test {
    uint256 private constant SLOT_TSTORE = 1;
    uint256 private constant SLOT_SSTORE = 2;

    // SSTORE-based lock
    uint256 private _sstoreStatus;

    function setUp() public {
        _sstoreStatus = 1; // NOT_ENTERED
        vm.deal(address(this), 100 ether);
    }

    // --- TSTORE-based lock ---
    modifier tstoreLocked() {
        assembly {
            if tload(SLOT_TSTORE) {
                mstore(0x00, 0xe1745f83) // ReentrancyGuardReentrantCall()
                revert(0x1c, 0x04)
            }
            tstore(SLOT_TSTORE, 1)
        }
        _;
        assembly {
            tstore(SLOT_TSTORE, 0)
        }
    }

    // --- SSTORE-based lock ---
    modifier sstoreLocked() {
        require(_sstoreStatus != 2, "ReentrancyGuard: reentrant call");
        _sstoreStatus = 2;
        _;
        _sstoreStatus = 1;
    }

    // --- TSTORE functions ---
    function tstore_setAndClear() public tstoreLocked {
        // Lock acquired and released in modifier
    }

    function tstore_read() public view {
        assembly {
            let val := tload(SLOT_TSTORE)
        }
    }

    function tstore_readWrite() public {
        assembly {
            let val := tload(SLOT_TSTORE)
            tstore(SLOT_TSTORE, add(val, 1))
        }
    }

    // --- SSTORE functions ---
    function sstore_setAndClear() public sstoreLocked {
        // Lock acquired and released in modifier
    }

    function sstore_read() public view {
        uint256 val = _sstoreStatus;
    }

    function sstore_readWrite() public {
        _sstoreStatus = _sstoreStatus + 1;
    }

    // --- Benchmark Tests ---
    function testTSTORE_SetAndClear() public {
        uint256 g = gasleft();
        tstore_setAndClear();
        uint256 gasUsed = g - gasleft();
        console.log("TSTORE lock/unlock:", gasUsed, "gas");
    }

    function testSSTORE_SetAndClear() public {
        uint256 g = gasleft();
        sstore_setAndClear();
        uint256 gasUsed = g - gasleft();
        console.log("SSTORE lock/unlock:", gasUsed, "gas");
    }

    function testTSTORE_Read() public {
        uint256 g = gasleft();
        tstore_read();
        uint256 gasUsed = g - gasleft();
        console.log("TLOAD single read:", gasUsed, "gas");
    }

    function testSSTORE_Read() public {
        uint256 g = gasleft();
        sstore_read();
        uint256 gasUsed = g - gasleft();
        console.log("SLOAD single read:", gasUsed, "gas");
    }

    function testTSTORE_ReadWrite() public {
        uint256 g = gasleft();
        tstore_readWrite();
        uint256 gasUsed = g - gasleft();
        console.log("TLOAD+TSTORE:", gasUsed, "gas");
    }

    function testSSTORE_ReadWrite() public {
        uint256 g = gasleft();
        sstore_readWrite();
        uint256 gasUsed = g - gasleft();
        console.log("SLOAD+SSTORE:", gasUsed, "gas");
    }

    function testComparison_30Samples() public {
        uint256 N = 30;
        uint256 sumTSTORE = 0;
        uint256 sumSSTORE = 0;

        for (uint256 i = 0; i < N; i++) {
            // TSTORE: 2 opcodes x 100 gas = 200 gas
            uint256 g1 = gasleft();
            assembly {
                tstore(SLOT_TSTORE, 1)
                tstore(SLOT_TSTORE, 0)
            }
            uint256 after1 = gasleft();
            if (g1 >= after1) {
                sumTSTORE += g1 - after1;
            }

            // SSTORE: warm slot, 2 opcodes x 100 gas = ~200 gas
            uint256 g2 = gasleft();
            _sstoreStatus = 2;
            _sstoreStatus = 1;
            uint256 after2 = gasleft();
            if (g2 >= after2) {
                sumSSTORE += g2 - after2;
            }
        }

        uint256 avgTSTORE = sumTSTORE / N;
        uint256 avgSSTORE = sumSSTORE / N;

        console.log("========================================");
        console.log("  WARM SLOT COMPARISON (30 samples)    ");
        console.log("========================================");
        console.log("Avg TSTORE write+clear:", avgTSTORE, "gas");
        console.log("Avg SSTORE write+clear:", avgSSTORE, "gas");
        console.log("========================================");
        console.log("NOTE: Both cost ~100 gas per opcode when warm.");
        console.log("Real savings come from COLD access:");
        console.log("  SSTORE cold: 20,000 gas (first write)");
        console.log("  TSTORE cold: 100 gas (always warm)");
        console.log("========================================");
        console.log("For full bridge comparison, see OZGuardComparison");
        console.log("and MultiContractTest (3-way gas benchmarks).");
        console.log("========================================");

        // Both should complete successfully
        assertTrue(avgTSTORE > 0 && avgSSTORE > 0, "Both benchmarks should produce valid gas values");
    }
}
