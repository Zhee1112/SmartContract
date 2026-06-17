// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/UnoptimizedBridge.sol";
import "../src/BridgeStaticOnly.sol";
import "../src/VictimBridge.sol";
import "../src/LightweightBridge.sol";
import "../src/BridgeWithSSTOREGuard.sol";
import "../src/MonitorMock.sol";

contract CostAnalysisTest is Test {
    UnoptimizedBridge unoptBridge;
    BridgeStaticOnly staticBridge;
    VictimBridge victimBridge;
    LightweightBridge lightweightBridge;
    BridgeWithSSTOREGuard sstoreGuardBridge;
    MonitorMock monitorMock;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        monitorMock = new MonitorMock();
        unoptBridge = new UnoptimizedBridge();
        staticBridge = new BridgeStaticOnly();
        victimBridge = new VictimBridge(address(monitorMock));
        lightweightBridge = new LightweightBridge();
        sstoreGuardBridge = new BridgeWithSSTOREGuard();

        vm.deal(address(unoptBridge), 1000 ether);
        vm.deal(address(staticBridge), 1000 ether);
        vm.deal(address(victimBridge), 1000 ether);
        vm.deal(address(lightweightBridge), 1000 ether);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function testCostPerSecurityFeature() public {
        console.log("==================================================");
        console.log(" COST ANALYSIS: Gas per Security Feature          ");
        console.log("==================================================");

        uint256 avgA = _avg(_measureDepositGas(address(unoptBridge), 1 ether, 3));
        uint256 avgB = _avg(_measureDepositGas(address(staticBridge), 1 ether, 3));
        uint256 avgC = _avg(_measureDepositGas(address(victimBridge), 1 ether, 3));
        uint256 avgD = _avg(_measureDepositGas(address(lightweightBridge), 1 ether, 3));

        console.log("[A] Unoptimized  :", avgA, "gas");
        console.log("[B] Static Only  :", avgB, "gas");
        console.log("[C] Full Dynamic :", avgC, "gas");
        console.log("[D] Lightweight  :", avgD, "gas");
        console.log("---");
        console.log("CEI+Packing (B)   :", avgA > avgB ? avgA - avgB : 0, "gas savings");
        console.log("Full EWS overhead  :", avgC - avgB, "gas");
        console.log("Inline EWS overhead:", avgD - avgB, "gas");
        console.log("D saves vs C       :", avgC - avgD, "gas");
        console.log("==================================================");

        assertTrue(avgA > 0 && avgB > 0 && avgC > 0 && avgD > 0);
    }

    function testCostTierDvsTierCDelta() public {
        console.log("==================================================");
        console.log(" COST DELTA: Tier D vs Tier C                     ");
        console.log("==================================================");

        uint256 depC = _measureOneDeposit(address(victimBridge), 1 ether);
        uint256 depD = _measureOneDeposit(address(lightweightBridge), 1 ether);

        _depositTo(address(victimBridge), 5 ether);
        _depositTo(address(lightweightBridge), 5 ether);
        uint256 witC = _measureOneWithdraw(address(victimBridge), 1 ether);
        uint256 witD = _measureOneWithdraw(address(lightweightBridge), 1 ether);

        uint256 swpC = _measureOneSwap(address(victimBridge), 0.1 ether);
        uint256 swpD = _measureOneSwap(address(lightweightBridge), 0.1 ether);

        console.log("OPERASI     | Tier C   | Tier D   | Selisih");
        console.log("Deposit     |", depC, "|", depD);
        console.log("Withdraw    |", witC, "|", witD);
        console.log("Swap        |", swpC, "|", swpD);
        console.log("Selisih     :", depC - depD, witC - witD, swpC - swpD);
        console.log("Deposit saves:", (depC - depD) * 100 / depC, "%");
        console.log("==================================================");

        assertTrue(depD < depC, "Tier D deposit should be cheaper");
        assertTrue(witD < witC, "Tier D withdraw should be cheaper");
        assertTrue(swpD < swpC, "Tier D swap should be cheaper");
    }

    function testCostEffectiveness() public {
        console.log("==================================================");
        console.log(" COST EFFECTIVENESS: Security per Gas             ");
        console.log("==================================================");

        uint256 depA = _measureOneDeposit(address(unoptBridge), 1 ether);
        uint256 depB = _measureOneDeposit(address(staticBridge), 1 ether);
        uint256 depC = _measureOneDeposit(address(victimBridge), 1 ether);
        uint256 depD = _measureOneDeposit(address(lightweightBridge), 1 ether);

        uint256 scoreA = 0;
        uint256 scoreB = 4;
        uint256 scoreC = 8;
        uint256 scoreD = 7;

        uint256 ceA = (scoreA * 1000000) / (depA > 0 ? depA : 1);
        uint256 ceB = (scoreB * 1000000) / depB;
        uint256 ceC = (scoreC * 1000000) / depC;
        uint256 ceD = (scoreD * 1000000) / depD;

        console.log("[A] Unoptimized  : Score=0, Gas=", depA, ", CE=", ceA);
        console.log("[B] Static Only  : Score=4, Gas=", depB, ", CE=", ceB);
        console.log("[C] Full Dynamic : Score=8, Gas=", depC, ", CE=", ceC);
        console.log("[D] Lightweight  : Score=7, Gas=", depD, ", CE=", ceD);
        console.log("---");
        console.log("Ranking: D > B > C > A (higher CE = better)");
        console.log("==================================================");

        assertTrue(ceD > ceC, "Tier D more cost-effective than C");
    }

    function testDeploymentCostComparison() public {
        console.log("==================================================");
        console.log(" DEPLOYMENT COST: 4-Tier Comparison               ");
        console.log("==================================================");

        uint256 g0 = gasleft();
        new UnoptimizedBridge();
        uint256 deployA = g0 - gasleft();

        uint256 g1 = gasleft();
        new BridgeStaticOnly();
        uint256 deployB = g1 - gasleft();

        uint256 g2 = gasleft();
        new VictimBridge(address(monitorMock));
        uint256 deployC = g2 - gasleft();

        uint256 g3 = gasleft();
        new LightweightBridge();
        uint256 deployD = g3 - gasleft();

        console.log("[A] Unoptimized  :", deployA, "gas");
        console.log("[B] Static Only  :", deployB, "gas");
        console.log("[C] Full Dynamic :", deployC, "gas");
        console.log("[D] Lightweight  :", deployD, "gas");
        console.log("B vs A savings   :", (deployA - deployB) * 100 / deployA, "%");
        console.log("C vs A overhead  :", (deployC - deployA) * 100 / deployA, "%");
        console.log("D vs A overhead  :", (deployD - deployA) * 100 / deployA, "%");
        console.log("D saves vs C     :", (deployC - deployD) * 100 / deployC, "%");
        console.log("==================================================");

        assertTrue(deployA > 0 && deployB > 0 && deployC > 0 && deployD > 0);
    }

    function testGasCostSummaryForThesis() public {
        console.log("==================================================");
        console.log(" THESIS DATA: 4-Tier Gas Cost Summary             ");
        console.log("==================================================");

        uint256 depA = _measureOneDeposit(address(unoptBridge), 1 ether);
        uint256 depB = _measureOneDeposit(address(staticBridge), 1 ether);
        uint256 depC = _measureOneDeposit(address(victimBridge), 1 ether);
        uint256 depD = _measureOneDeposit(address(lightweightBridge), 1 ether);

        _depositTo(address(unoptBridge), 5 ether);
        _depositTo(address(staticBridge), 5 ether);
        _depositTo(address(victimBridge), 5 ether);
        _depositTo(address(lightweightBridge), 5 ether);

        uint256 witA = _measureOneWithdraw(address(unoptBridge), 1 ether);
        uint256 witB = _measureOneWithdraw(address(staticBridge), 1 ether);
        uint256 witC = _measureOneWithdraw(address(victimBridge), 1 ether);
        uint256 witD = _measureOneWithdraw(address(lightweightBridge), 1 ether);

        uint256 swpA = _measureOneSwap(address(unoptBridge), 0.1 ether);
        uint256 swpB = _measureOneSwap(address(staticBridge), 0.1 ether);
        uint256 swpC = _measureOneSwap(address(victimBridge), 0.1 ether);
        uint256 swpD = _measureOneSwap(address(lightweightBridge), 0.1 ether);

        console.log("Dep gas: A=", depA, "B=", depB);
        console.log("Dep gas: C=", depC, "D=", depD);
        console.log("Wit gas: A=", witA, "B=", witB);
        console.log("Wit gas: C=", witC, "D=", witD);
        console.log("Swp gas: A=", swpA, "B=", swpB);
        console.log("Swp gas: C=", swpC, "D=", swpD);

        console.log("Tier C/B ratio  :", depC / depB, "x");
        console.log("Tier D/B ratio  :", depD / depB, "x");
        console.log("D saves vs C    :", (depC - depD) * 100 / depC, "%");
        console.log("==================================================");

        assertTrue(depA > 0 && depB > 0 && depC > 0 && depD > 0);
    }

    function testRealWorldCostEstimation() public {
        console.log("==================================================");
        console.log(" REAL-WORLD COST: USD per Transaction              ");
        console.log("==================================================");

        uint256 depD = _measureOneDeposit(address(lightweightBridge), 1 ether);
        _depositTo(address(lightweightBridge), 5 ether);
        uint256 witD = _measureOneWithdraw(address(lightweightBridge), 1 ether);
        uint256 depC = _measureOneDeposit(address(victimBridge), 1 ether);

        uint256 ethPriceUSD = 3000;
        uint256[] memory gasPrices = new uint256[](4);
        gasPrices[0] = 10;
        gasPrices[1] = 30;
        gasPrices[2] = 80;
        gasPrices[3] = 150;

        for (uint256 i = 0; i < 4; i++) {
            uint256 price = gasPrices[i];
            uint256 costD = depD * price * ethPriceUSD / 1e9;
            uint256 costC = depC * price * ethPriceUSD / 1e9;
            console.log("Gas=", price, "Gwei: C=$", costC / 1e6);
            console.log("Gas=", price, "Gwei: D=$", costD / 1e6);
        }
        console.log("==================================================");

        assertTrue(depD > 0);
    }

    function testGasCost100SampleStat() public {
        console.log("==================================================");
        console.log(" 100-SAMPLE GAS STATISTICS: 4-TIER DEPOSIT        ");
        console.log("==================================================");

        uint256 N = 100;
        uint256[] memory gA = _measureDepositGas(address(unoptBridge), 1 ether, N);
        uint256[] memory gB = _measureDepositGas(address(staticBridge), 1 ether, N);
        uint256[] memory gC = _measureDepositGas(address(victimBridge), 1 ether, N);
        uint256[] memory gD = _measureDepositGas(address(lightweightBridge), 1 ether, N);

        console.log("N =", N, "samples per tier");
        console.log("[A] Mean:", _avg(gA), "Min:", _min(gA));
        console.log("[A] Max:", _max(gA), "StdDev:", _stddev(gA));
        console.log("[B] Mean:", _avg(gB), "Min:", _min(gB));
        console.log("[B] Max:", _max(gB), "StdDev:", _stddev(gB));
        console.log("[C] Mean:", _avg(gC), "Min:", _min(gC));
        console.log("[C] Max:", _max(gC), "StdDev:", _stddev(gC));
        console.log("[D] Mean:", _avg(gD), "Min:", _min(gD));
        console.log("[D] Max:", _max(gD), "StdDev:", _stddev(gD));
        console.log("---");
        console.log("95% CI A:", _avg(gA), "+/-", _margin_of_error(gA));
        console.log("95% CI B:", _avg(gB), "+/-", _margin_of_error(gB));
        console.log("95% CI C:", _avg(gC), "+/-", _margin_of_error(gC));
        console.log("95% CI D:", _avg(gD), "+/-", _margin_of_error(gD));
        console.log("==================================================");

        assertTrue(_avg(gA) > 0 && _avg(gD) > 0);
    }

    function testGasPriceSensitivity() public {
        console.log("==================================================");
        console.log(" SENSITIVITY: Cost at Different Gas Prices         ");
        console.log("==================================================");

        uint256 depB = _measureOneDeposit(address(staticBridge), 1 ether);
        uint256 depC = _measureOneDeposit(address(victimBridge), 1 ether);
        uint256 depD = _measureOneDeposit(address(lightweightBridge), 1 ether);

        uint256[] memory prices = new uint256[](4);
        prices[0] = 10; prices[1] = 30; prices[2] = 80; prices[3] = 150;

        for (uint256 i = 0; i < 4; i++) {
            uint256 p = prices[i];
            console.log("Gas=", p, "Gwei -> B:", depB * p / 1e9);
            console.log("Gas=", p, "wei -> C:", depC * p / 1e9);
            console.log("Gas=", p, "wei -> D:", depD * p / 1e9);
        }
        console.log("==================================================");

        assertTrue(depB > 0);
    }

    function _measureDepositGas(address bridge, uint256 amount, uint256 samples) internal returns (uint256[] memory) {
        uint256[] memory results = new uint256[](samples);
        for (uint256 i = 0; i < samples; i++) {
            address user = address(uint160(uint256(keccak256(abi.encodePacked(i)))));
            vm.deal(user, amount * 2);
            vm.startPrank(user);
            uint256 g = gasleft();
            _doDeposit(bridge, amount);
            results[i] = g - gasleft();
            vm.stopPrank();
        }
        return results;
    }

    function _measureOneDeposit(address bridge, uint256 amount) internal returns (uint256) {
        address user = address(uint160(uint256(keccak256(abi.encodePacked(block.timestamp)))));
        vm.deal(user, amount * 2);
        vm.startPrank(user);
        uint256 g = gasleft();
        _doDeposit(bridge, amount);
        uint256 gasUsed = g - gasleft();
        vm.stopPrank();
        return gasUsed;
    }

    function _measureOneWithdraw(address bridge, uint256 amount) internal returns (uint256) {
        vm.startPrank(alice);
        uint256 g = gasleft();
        _doWithdraw(bridge, amount);
        uint256 gasUsed = g - gasleft();
        vm.stopPrank();
        return gasUsed;
    }

    function _measureOneSwap(address bridge, uint256 amount) internal returns (uint256) {
        address user = address(uint160(uint256(keccak256(abi.encodePacked(block.timestamp + 1)))));
        vm.deal(user, amount * 2);
        vm.startPrank(user);
        uint256 g = gasleft();
        _doSwap(bridge, amount);
        uint256 gasUsed = g - gasleft();
        vm.stopPrank();
        return gasUsed;
    }

    function _doDeposit(address bridge, uint256 amount) internal {
        if (bridge == address(unoptBridge)) UnoptimizedBridge(payable(bridge)).deposit{value: amount}();
        else if (bridge == address(staticBridge)) BridgeStaticOnly(payable(bridge)).deposit{value: amount}();
        else if (bridge == address(victimBridge)) VictimBridge(payable(bridge)).deposit{value: amount}();
        else LightweightBridge(payable(bridge)).deposit{value: amount}();
    }

    function _doWithdraw(address bridge, uint256 amount) internal {
        if (bridge == address(unoptBridge)) UnoptimizedBridge(payable(bridge)).withdraw(amount);
        else if (bridge == address(staticBridge)) BridgeStaticOnly(payable(bridge)).withdraw(uint96(amount));
        else if (bridge == address(victimBridge)) VictimBridge(payable(bridge)).withdraw(uint96(amount));
        else LightweightBridge(payable(bridge)).withdraw(uint96(amount));
    }

    function _doSwap(address bridge, uint256 amount) internal {
        if (bridge == address(unoptBridge)) UnoptimizedBridge(payable(bridge)).swapETHForTokens{value: amount}();
        else if (bridge == address(staticBridge)) BridgeStaticOnly(payable(bridge)).swapETHForTokens{value: amount}(uint96(0));
        else if (bridge == address(victimBridge)) VictimBridge(payable(bridge)).swapETHForTokens{value: amount}(uint96(0));
        else LightweightBridge(payable(bridge)).swapETHForTokens{value: amount}(uint96(0));
    }

    function _depositTo(address bridge, uint256 amount) internal {
        vm.deal(alice, amount);
        vm.startPrank(alice);
        if (bridge == address(unoptBridge)) UnoptimizedBridge(payable(bridge)).deposit{value: amount}();
        else if (bridge == address(staticBridge)) BridgeStaticOnly(payable(bridge)).deposit{value: amount}();
        else if (bridge == address(victimBridge)) VictimBridge(payable(bridge)).deposit{value: amount}();
        else LightweightBridge(payable(bridge)).deposit{value: amount}();
        vm.stopPrank();
    }

    function _avg(uint256[] memory arr) internal pure returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < arr.length; i++) sum += arr[i];
        return sum / arr.length;
    }

    function _min(uint256[] memory arr) internal pure returns (uint256) {
        uint256 m = type(uint256).max;
        for (uint256 i = 0; i < arr.length; i++) if (arr[i] < m) m = arr[i];
        return m;
    }

    function _max(uint256[] memory arr) internal pure returns (uint256) {
        uint256 m = 0;
        for (uint256 i = 0; i < arr.length; i++) if (arr[i] > m) m = arr[i];
        return m;
    }

    function _stddev(uint256[] memory arr) internal pure returns (uint256) {
        uint256 mean = _avg(arr);
        uint256 sumSqDiff = 0;
        for (uint256 i = 0; i < arr.length; i++) {
            uint256 diff = arr[i] > mean ? arr[i] - mean : mean - arr[i];
            sumSqDiff += diff * diff;
        }
        uint256 variance = sumSqDiff / arr.length;
        return _sqrt(variance);
    }

    function _sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function _margin_of_error(uint256[] memory arr) internal pure returns (uint256) {
        uint256 sd = _stddev(arr);
        uint256 n = arr.length;
        uint256 se = sd / _sqrt(n);
        return se * 196 / 100;
    }

    function _measureSwapGas(address bridge, uint256 amount, uint256 samples) internal returns (uint256[] memory) {
        uint256[] memory results = new uint256[](samples);
        for (uint256 i = 0; i < samples; i++) {
            address user = address(uint160(uint256(keccak256(abi.encodePacked(i + 5000)))));
            vm.deal(user, amount * 2);
            vm.deal(bridge, 1000 ether);
            vm.startPrank(user);
            uint256 g = gasleft();
            _doSwap(bridge, amount);
            results[i] = g - gasleft();
            vm.stopPrank();
        }
        return results;
    }

    function testGasSwap100Sample_4Tiers() public {
        console.log("==================================================");
        console.log(" 100-SAMPLE GAS SWAP: 4-TIER COMPARISON          ");
        console.log("==================================================");

        uint256 N = 100;
        uint256 amount = 0.1 ether;
        uint256[] memory gA = _measureSwapGas(address(unoptBridge), amount, N);
        uint256[] memory gB = _measureSwapGas(address(staticBridge), amount, N);
        uint256[] memory gC = _measureSwapGas(address(victimBridge), amount, N);
        uint256[] memory gD = _measureSwapGas(address(lightweightBridge), amount, N);

        console.log("N =", N, "samples per tier");
        console.log("[A] Mean:", _avg(gA));
        console.log("[A] Min:", _min(gA), "Max:", _max(gA));
        console.log("[B] Mean:", _avg(gB));
        console.log("[B] Min:", _min(gB), "Max:", _max(gB));
        console.log("[C] Mean:", _avg(gC));
        console.log("[C] Min:", _min(gC), "Max:", _max(gC));
        console.log("[D] Mean:", _avg(gD));
        console.log("[D] Min:", _min(gD), "Max:", _max(gD));
        console.log("D vs B overhead:", _avg(gD) > _avg(gB) ? _avg(gD) - _avg(gB) : 0, "gas");
        console.log("D vs C savings :", _avg(gC) > _avg(gD) ? _avg(gC) - _avg(gD) : 0, "gas");
        console.log("==================================================");

        assertTrue(_avg(gA) > 0 && _avg(gD) > 0);
    }
}
