# -*- coding: utf-8 -*-
"""
SmartContract Bridge Dashboard - Streamlit App
Gas Optimization & Security Analysis using EIP-1153 Transient Storage

Main path untuk Streamlit deployment.
"""

import streamlit as st
import numpy as np
import matplotlib.pyplot as plt
import json
import os
import time
import urllib.request

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="SmartContract Bridge Dashboard",
    page_icon="",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ============================================================
# DATA CONSTANTS (dari Foundry tests - 100 samples per operasi)
# ============================================================
BRIDGE_GAS = {
    "UnoptimizedBridge": {
        "deposit": 31412, "withdraw": 9735, "swap": 22080, "deployment": 413860,
        "label": "[A] Baseline", "security_score": 0, "spg": 0,
    },
    "BridgeStaticOnly": {
        "deposit": 31427, "withdraw": 9727, "swap": 15000, "deployment": 352921,
        "label": "[B] Static", "security_score": 2, "spg": 64,
    },
    "VictimBridge": {
        "deposit": 122769, "withdraw": 104806, "swap": 133344, "deployment": 886301,
        "label": "[C] Full Dynamic", "security_score": 8, "spg": 65,
    },
    "LightweightBridge": {
        "deposit": 34156, "withdraw": 12119, "swap": 62787, "deployment": 736064,
        "label": "[D] Lightweight", "security_score": 8, "spg": 220,
    },
}

SECURITY_FEATURES = {
    "Reentrancy Single-function": {"A": False, "B": True, "C": True, "D": True},
    "Reentrancy Cross-function":  {"A": False, "B": False, "C": True, "D": True},
    "Reentrancy Consecutive 3x":  {"A": False, "B": False, "C": True, "D": True},
    "MEV Sandwich Detection":     {"A": False, "B": False, "C": True, "D": True},
    "Economic Penalty":           {"A": False, "B": False, "C": True, "D": True},
    "Emergency Pause":            {"A": False, "B": False, "C": True, "D": True},
    "Block Tracking":             {"A": False, "B": False, "C": True, "D": True},
    "Custom Errors":              {"A": False, "B": True, "C": True, "D": True},
}

TIER_COLORS = {
    "[A] Baseline":      {"bar": "#ff3366", "light": "#ffe0e8"},
    "[B] Static":        {"bar": "#4facfe", "light": "#e0f0ff"},
    "[C] Full Dynamic":  {"bar": "#00ff87", "light": "#e0fff0"},
    "[D] Lightweight":   {"bar": "#ff9f43", "light": "#fff3e0"},
}

# ============================================================
# SIDEBAR
# ============================================================
st.sidebar.title("SmartContract Bridge")
st.sidebar.markdown("Gas Optimization & Security Analysis")
st.sidebar.divider()
eth_price = st.sidebar.number_input("ETH Price (USD)", value=2500, step=100)
st.sidebar.markdown("---")
st.sidebar.caption("Data from Foundry tests (100 samples)")
st.sidebar.caption("Gas prices from Etherscan V2 API")

# ============================================================
# TABS
# ============================================================
tab1, tab2, tab3 = st.tabs(["Gas & Security Comparison", "Rollup Simulation", "Real-World Cost Analysis"])

# ============================================================
# TAB 1: GAS & SECURITY COMPARISON
# ============================================================
with tab1:
    st.title("Gas & Security Comparison")
    st.markdown("4-Tier architecture analysis based on Foundry test results (100 samples per operation)")

    # --- Section 1: Gas Comparison Chart ---
    st.subheader("1. Gas Cost Comparison")
    fig, ax = plt.subplots(figsize=(12, 6))

    tiers = list(BRIDGE_GAS.keys())
    labels = [BRIDGE_GAS[t]["label"] for t in tiers]
    colors = [TIER_COLORS[BRIDGE_GAS[t]["label"]]["bar"] for t in tiers]
    ops = ["deposit", "withdraw", "swap"]

    x = np.arange(len(ops))
    width = 0.2

    for i, tier in enumerate(tiers):
        values = [BRIDGE_GAS[tier][op] for op in ops]
        bars = ax.bar(x + i * width, values, width, label=BRIDGE_GAS[tier]["label"], color=colors[i], edgecolor="white")
        for bar, val in zip(bars, values):
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1000, f"{val:,}", ha="center", va="bottom", fontsize=8, fontweight="bold")

    ax.set_xlabel("Operation")
    ax.set_ylabel("Gas Units")
    ax.set_title("Bridge Gas Comparison: 4-Tier Architecture")
    ax.set_xticks(x + width * 1.5)
    ax.set_xticklabels(ops)
    ax.legend()
    ax.grid(axis="y", alpha=0.3)
    st.pyplot(fig)
    plt.close()

    col1, col2 = st.columns(2)
    with col1:
        st.info("Source: GasStatsTest (100 samples per tier)")
    with col2:
        st.info("Tier D saves 52.9%-88.4% gas vs Tier C")

    st.divider()

    # --- Section 2: Security Score ---
    st.subheader("2. Security Score (8 Features)")
    scores = {}
    for tier_key in ["A", "B", "C", "D"]:
        scores[tier_key] = sum(1 for f in SECURITY_FEATURES.values() if f[tier_key])

    col1, col2, col3, col4 = st.columns(4)
    score_colors = {"A": "red", "B": "orange", "C": "green", "D": "blue"}
    score_labels = {"A": "Tier A (Baseline)", "B": "Tier B (Static)", "C": "Tier C (Full Dynamic)", "D": "Tier D (Lightweight)"}

    for col, tier in zip([col1, col2, col3, col4], ["A", "B", "C", "D"]):
        with col:
            st.metric(label=score_labels[tier], value=f"{scores[tier]}/8", delta=f"{scores[tier]/8*100:.0f}%")

    # Security Features Table
    st.subheader("Security Features Detail")
    feature_data = []
    for feature, tiers in SECURITY_FEATURES.items():
        feature_data.append({
            "Feature": feature,
            "Tier A": "YES" if tiers["A"] else "NO",
            "Tier B": "YES" if tiers["B"] else "NO",
            "Tier C": "YES" if tiers["C"] else "NO",
            "Tier D": "YES" if tiers["D"] else "NO",
        })
    st.table(feature_data)

    st.divider()

    # --- Section 3: SPG Ranking ---
    st.subheader("3. Cost-Effectiveness (SPG)")
    st.markdown("SPG = (Security Score / Gas Deposit) x 1,000,000")

    spg_data = []
    for tier in ["A", "B", "C", "D"]:
        tier_name = f"Tier {tier}"
        gas = BRIDGE_GAS[[k for k in BRIDGE_GAS if BRIDGE_GAS[k]["label"].startswith(f"[{tier}]")][0]]["deposit"]
        score = scores[tier]
        spg = (score / gas * 1_000_000) if gas > 0 else 0
        spg_data.append({"Tier": tier_name, "Security Score": score, "Gas Deposit": f"{gas:,}", "SPG": f"{spg:.1f}"})

    st.table(spg_data)

    # SPG Chart
    fig, ax = plt.subplots(figsize=(8, 4))
    tier_labels = [f"Tier {t}" for t in ["A", "B", "C", "D"]]
    spg_values = []
    for tier in ["A", "B", "C", "D"]:
        gas = BRIDGE_GAS[[k for k in BRIDGE_GAS if BRIDGE_GAS[k]["label"].startswith(f"[{tier}]")][0]]["deposit"]
        score = scores[tier]
        spg_values.append(score / gas * 1_000_000 if gas > 0 else 0)

    bars = ax.bar(tier_labels, spg_values, color=["#ff3366", "#4facfe", "#00ff87", "#ff9f43"])
    for bar, val in zip(bars, spg_values):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 2, f"{val:.1f}", ha="center", va="bottom", fontweight="bold")
    ax.set_ylabel("SPG (Security Points per Gas)")
    ax.set_title("Cost-Effectiveness Ranking")
    ax.grid(axis="y", alpha=0.3)
    st.pyplot(fig)
    plt.close()

# ============================================================
# TAB 2: ROLLUP SIMULATION (Monte Carlo)
# ============================================================
with tab2:
    st.title("Dynamic Rollup Submission Engine")
    st.markdown("Monte Carlo simulation: Static Engine (Calldata) vs Dynamic Engine (Blob + Compression)")

    # Simulation Parameters
    col1, col2, col3 = st.columns(3)
    with col1:
        num_runs = st.slider("Monte Carlo Runs", 10, 500, 100)
    with col2:
        num_blocks = st.slider("Blocks per Run", 100, 5000, 1000)
    with col3:
        st.metric("Total Simulations", f"{num_runs * num_blocks:,}")

    if st.button("Run Simulation", type="primary"):
        # --- Simulation Classes ---
        TX_SIZE = 120
        CALLDATA_GAS = 16
        BLOB_SIZE = 131072
        GWEI_ETH = 1e-9
        MAX_LATENCY = 25
        TARGET_BATCH = 100000

        class SimEnv:
            def __init__(self):
                self.l1_fees = np.clip(np.random.normal(40, 15, num_blocks).cumsum() * 0.1 + 30, 10, 150)
                self.blob_fees = np.clip(np.random.normal(5, 2, num_blocks).cumsum() * 0.05 + 5, 1, 30)
                self.incoming = np.random.poisson(30, num_blocks)

        class StaticEngine:
            def __init__(self):
                self.total = 0
                self.history = []
                self.pending = 0

            def run(self, env):
                for b in range(num_blocks):
                    self.pending += env.incoming[b]
                    if b % 10 == 0 and self.pending > 0:
                        cost = (self.pending * TX_SIZE * CALLDATA_GAS) * env.l1_fees[b] * GWEI_ETH
                        self.total += cost
                        self.history.append((b, cost))
                        self.pending = 0

        class DynamicEngine:
            def __init__(self):
                self.total = 0
                self.history = []
                self.pending = 0
                self.blocks_since = 0
                self.blob_count = 0
                self.calldata_count = 0

            def run(self, env):
                for b in range(num_blocks):
                    self.pending += env.incoming[b]
                    self.blocks_since += 1
                    batch = self.pending * TX_SIZE
                    if self.blocks_since >= MAX_LATENCY or batch >= TARGET_BATCH:
                        if self.pending == 0:
                            continue
                        c_calldata = (batch * CALLDATA_GAS) * env.l1_fees[b] * GWEI_ETH
                        c_blob = BLOB_SIZE * env.blob_fees[b] * GWEI_ETH
                        if c_blob < c_calldata:
                            self.total += c_blob
                            self.history.append((b, c_blob, "Blob"))
                            self.blob_count += 1
                        else:
                            self.total += c_calldata
                            self.history.append((b, c_calldata, "Calldata"))
                            self.calldata_count += 1
                        self.pending = 0
                        self.blocks_since = 0

        # --- Run Monte Carlo ---
        progress = st.progress(0)
        static_costs = []
        dynamic_costs = []
        savings_list = []
        blob_ratios = []

        for i in range(num_runs):
            env = SimEnv()
            s = StaticEngine()
            s.run(env)
            d = DynamicEngine()
            d.run(env)

            saving_pct = ((s.total - d.total) / s.total * 100) if s.total > 0 else 0
            total_batches = d.blob_count + d.calldata_count
            blob_pct = (d.blob_count / total_batches * 100) if total_batches > 0 else 0

            static_costs.append(s.total)
            dynamic_costs.append(d.total)
            savings_list.append(saving_pct)
            blob_ratios.append(blob_pct)

            if (i + 1) % 10 == 0:
                progress.progress((i + 1) / num_runs)

        progress.progress(1.0)

        # --- Display Results ---
        st.subheader("Simulation Results")
        static_arr = np.array(static_costs)
        dynamic_arr = np.array(dynamic_costs)
        savings_arr = np.array(savings_list)

        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Mean Savings", f"{np.mean(savings_arr):.2f}%")
        with col2:
            st.metric("Static Cost (ETH)", f"{np.mean(static_arr):.4f}")
        with col3:
            st.metric("Dynamic Cost (ETH)", f"{np.mean(dynamic_arr):.4f}")
        with col4:
            st.metric("Blob Usage", f"{np.mean(blob_ratios):.1f}%")

        # --- Charts ---
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))

        # Plot 1: Cost Distribution
        axes[0, 0].hist(static_arr, bins=20, alpha=0.6, label="Static", color="orange")
        axes[0, 0].hist(dynamic_arr, bins=20, alpha=0.6, label="Dynamic", color="green")
        axes[0, 0].set_title("Distribution of Total Cost (ETH)")
        axes[0, 0].set_xlabel("ETH")
        axes[0, 0].set_ylabel("Frequency")
        axes[0, 0].legend()
        axes[0, 0].grid(True, alpha=0.3)

        # Plot 2: Savings Distribution
        axes[0, 1].hist(savings_arr, bins=20, color="teal", alpha=0.7, edgecolor="black")
        axes[0, 1].axvline(x=np.mean(savings_arr), color="red", linestyle="--", label=f"Mean: {np.mean(savings_arr):.1f}%")
        axes[0, 1].set_title("Distribution of Gas Savings (%)")
        axes[0, 1].set_xlabel("Savings (%)")
        axes[0, 1].set_ylabel("Frequency")
        axes[0, 1].legend()
        axes[0, 1].grid(True, alpha=0.3)

        # Plot 3: Single Run Example
        env_ex = SimEnv()
        s_ex = StaticEngine()
        s_ex.run(env_ex)
        d_ex = DynamicEngine()
        d_ex.run(env_ex)

        sb = [x[0] for x in s_ex.history]
        sc = np.cumsum([x[1] for x in s_ex.history])
        db = [x[0] for x in d_ex.history]
        dc = np.cumsum([x[1] for x in d_ex.history])

        axes[1, 0].step(sb, sc, where="post", label="Static (Calldata)", color="orange")
        axes[1, 0].step(db, dc, where="post", label="Dynamic (Blob/Calldata)", color="green")
        axes[1, 0].set_title("Example Run: Cumulative Cost")
        axes[1, 0].set_xlabel("Block")
        axes[1, 0].set_ylabel("Cumulative Cost (ETH)")
        axes[1, 0].legend()
        axes[1, 0].grid(True, alpha=0.3)

        # Plot 4: Gas Price Fluctuation
        axes[1, 1].plot(env_ex.l1_fees, label="L1 Base Fee", color="red", alpha=0.7)
        axes[1, 1].plot(env_ex.blob_fees, label="Blob Base Fee", color="blue", alpha=0.7)
        axes[1, 1].set_title("Example Run: Gas Price Fluctuation")
        axes[1, 1].set_xlabel("Block")
        axes[1, 1].set_ylabel("Fee (Gwei)")
        axes[1, 1].legend()
        axes[1, 1].grid(True, alpha=0.3)

        plt.suptitle(f"Monte Carlo Simulation: {num_runs} Runs x {num_blocks} Blocks", fontsize=14, fontweight="bold")
        plt.tight_layout()
        st.pyplot(fig)
        plt.close()

        # --- Statistics ---
        st.subheader("Statistical Summary")
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("**Static Engine (Calldata)**")
            st.write(f"- Mean: {np.mean(static_arr):.4f} ETH")
            st.write(f"- Std: {np.std(static_arr):.4f} ETH")
            st.write(f"- Min/Max: {np.min(static_arr):.4f} / {np.max(static_arr):.4f} ETH")
        with col2:
            st.markdown("**Dynamic Engine (Blob/Calldata)**")
            st.write(f"- Mean: {np.mean(dynamic_arr):.4f} ETH")
            st.write(f"- Std: {np.std(dynamic_arr):.4f} ETH")
            st.write(f"- Min/Max: {np.min(dynamic_arr):.4f} / {np.max(dynamic_arr):.4f} ETH")

        ci_lower = np.percentile(savings_arr, 2.5)
        ci_upper = np.percentile(savings_arr, 97.5)
        st.success(f"95% Confidence Interval: [{ci_lower:.2f}%, {ci_upper:.2f}%]")

# ============================================================
# TAB 3: REAL-WORLD COST ANALYSIS
# ============================================================
with tab3:
    st.title("Real-World Cost Analysis")
    st.markdown("Calculate actual USD costs using Foundry gas data + Etherscan real-time gas prices")

    # Fetch Gas from Etherscan
    API_KEY = st.text_input("Etherscan API Key (optional)", value="", type="password")
    use_api = st.button("Fetch Live Gas Prices from Etherscan")

    real_gas = None
    if use_api and API_KEY:
        try:
            url = f"https://api.etherscan.io/v2/api?chainid=1&module=gastracker&action=gasoracle&apikey={API_KEY}"
            resp = urllib.request.urlopen(url, timeout=10)
            data = json.loads(resp.read().decode())
            if data.get("status") == "1":
                real_gas = {
                    "base_fee": float(data["result"]["suggestBaseFee"]),
                    "safe": float(data["result"]["SafeGasPrice"]),
                    "fast": float(data["result"]["FastGasPrice"]),
                    "block": data["result"]["LastBlock"],
                }
                st.success(f"Gas fetched! Block #{real_gas['block']}, Base Fee: {real_gas['base_fee']:.4f} Gwei")
        except Exception as e:
            st.error(f"Error fetching gas: {e}")

    # Gas Price Scenarios
    st.subheader("Gas Price Scenarios")
    scenarios = [
        {"label": "Current (Etherscan)", "gwei": real_gas["base_fee"] if real_gas else 0.55},
        {"label": "Low (5 Gwei)", "gwei": 5.0},
        {"label": "Normal (10 Gwei)", "gwei": 10.0},
        {"label": "Busy (30 Gwei)", "gwei": 30.0},
        {"label": "Very Busy (80 Gwei)", "gwei": 80.0},
        {"label": "Peak (150 Gwei)", "gwei": 150.0},
    ]

    # Cost Table
    st.subheader("USD Cost per Operation")
    cost_data = []
    for scenario in scenarios:
        gwei = scenario["gwei"]
        for tier_key in ["A", "B", "C", "D"]:
            tier_data = BRIDGE_GAS[[k for k in BRIDGE_GAS if BRIDGE_GAS[k]["label"].startswith(f"[{tier_key}]")][0]]
            deposit_usd = tier_data["deposit"] * gwei * 1e-9 * eth_price
            withdraw_usd = tier_data["withdraw"] * gwei * 1e-9 * eth_price
            swap_usd = tier_data["swap"] * gwei * 1e-9 * eth_price
            cost_data.append({
                "Scenario": scenario["label"],
                "Gas (Gwei)": f"{gwei:.2f}",
                "Tier": f"Tier {tier_key}",
                "Deposit ($)": f"${deposit_usd:.4f}",
                "Withdraw ($)": f"${withdraw_usd:.4f}",
                "Swap ($)": f"${swap_usd:.4f}",
            })
    st.table(cost_data)

    # Chart: Cost Comparison
    st.subheader("Cost Comparison Chart")
    fig, ax = plt.subplots(figsize=(12, 6))

    tier_keys = ["A", "B", "C", "D"]
    tier_labels = [f"Tier {t}" for t in tier_keys]
    tier_colors = ["#ff3366", "#4facfe", "#00ff87", "#ff9f43"]

    for scenario in scenarios:
        gwei = scenario["gwei"]
        deposit_costs = []
        for tier_key in tier_keys:
            gas = BRIDGE_GAS[[k for k in BRIDGE_GAS if BRIDGE_GAS[k]["label"].startswith(f"[{tier_key}]")][0]]["deposit"]
            deposit_costs.append(gas * gwei * 1e-9 * eth_price)
        ax.plot(tier_labels, deposit_costs, marker="o", label=f"{scenario['label']} ({gwei} Gwei)")

    ax.set_ylabel("USD Cost (Deposit)")
    ax.set_title(f"Deposit Cost Comparison (ETH = ${eth_price:,})")
    ax.legend()
    ax.grid(True, alpha=0.3)
    st.pyplot(fig)
    plt.close()

    # Key Findings
    st.subheader("Key Findings")
    st.success("Tier D achieves 100% security (8/8 features) with only 8.7% gas overhead vs Tier B")
    st.info("Tier D saves 72% on deposit, 88% on withdraw, and 53% on swap compared to Tier C")
    st.warning("215/215 tests pass across 13 test suites")

# ============================================================
# FOOTER
# ============================================================
st.divider()
st.caption("Data from Foundry tests (100 samples per operation) | Gas prices from Etherscan V2 API")
st.caption("GitHub: https://github.com/Zhee1112/SmartContract")
