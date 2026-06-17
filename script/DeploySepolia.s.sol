// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/MonitorMock.sol";
import "../src/VictimBridge.sol";
import "../src/LightweightBridge.sol";
import "../src/BridgeStaticOnly.sol";
import "../src/BridgeWithSSTOREGuard.sol";
import "../src/UnoptimizedBridge.sol";

/**
 * @title DeployAll
 * @dev Deployment script untuk 4 tier jembatan ke Sepolia testnet.
 *
 * Usage:
 *   forge script script/DeploySepolia.s.sol:DeployAll \
 *     --rpc-url $SEPOLIA_RPC_URL \
 *     --private-key $PRIVATE_KEY \
 *     --broadcast \
 *     --verify \
 *     --etherscan-api-key $ETHERSCAN_API_KEY
 */
contract DeployAll is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // [C] Deploy EWS Monitor + Dynamic Bridge
        MonitorMock monitor = new MonitorMock();
        VictimBridge victimBridge = new VictimBridge(address(monitor));
        console.log("[C] MonitorMock   :", address(monitor));
        console.log("[C] VictimBridge  :", address(victimBridge));

        // [D] Deploy Lightweight Bridge (inline EIP-1153)
        LightweightBridge lightBridge = new LightweightBridge();
        console.log("[D] LightweightBridge:", address(lightBridge));

        // [B] Deploy Static Bridge
        BridgeStaticOnly staticBridge = new BridgeStaticOnly();
        console.log("[B] BridgeStaticOnly:", address(staticBridge));

        // SSTORE Guard Benchmark
        BridgeWithSSTOREGuard sstoreGuard = new BridgeWithSSTOREGuard();
        console.log("[S] BridgeWithSSTOREGuard:", address(sstoreGuard));

        // [A] Deploy Unoptimized Bridge
        UnoptimizedBridge unoptBridge = new UnoptimizedBridge();
        console.log("[A] UnoptimizedBridge:", address(unoptBridge));

        vm.stopBroadcast();

        console.log("==================================================");
        console.log("  DEPLOYMENT COMPLETE - SEPOLIA TESTNET");
        console.log("==================================================");
        console.log("Tier [A] Unoptimized    :", address(unoptBridge));
        console.log("Tier [B] Static Only    :", address(staticBridge));
        console.log("Tier [C] Dynamic (EWS)  :", address(victimBridge));
        console.log("Tier [D] Lightweight    :", address(lightBridge));
        console.log("SSTORE Guard Benchmark  :", address(sstoreGuard));
        console.log("==================================================");
    }
}
