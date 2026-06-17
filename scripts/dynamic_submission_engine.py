# -*- coding: utf-8 -*-
"""
Python Dynamic Rollup Submission Engine Simulator
Mensimulasikan penghematan gas dengan dynamic batching & Blob (EIP-4844) vs Calldata.
"""

import os
import numpy as np
import matplotlib.pyplot as plt

# Pastikan folder logs ada
os.makedirs("logs", exist_ok=True)

# PARAMETER SIMULASI
NUM_BLOCKS = 1000 # Jumlah blok simulasi (waktu)
BLOCK_TIME = 12 # Detik per blok L1
TX_SIZE_BYTES = 120 # Rata-rata ukuran 1 tx dalam bytes

# BIAYA GAS
CALLDATA_GAS_PER_BYTE = 16
BLOB_GAS_SIZE = 131072 # 128 KB
GWEI_TO_ETH = 1e-9

# THRESHOLDS ENGINE DINAMIS
MAX_LATENCY_BLOCKS = 25 # Maksimal antre sebelum dipaksa kirim (25 blok = ~5 menit)
TARGET_BATCH_BYTES = 100000 # ~100 KB target batch optimal

class SimulationEnvironment:
    def __init__(self):
        # Generate random walk untuk harga gas L1 (10-150 Gwei)
        self.l1_base_fees = np.clip(np.random.normal(40, 15, NUM_BLOCKS).cumsum() * 0.1 + 30, 10, 150)
        # Generate random walk untuk harga Blob (1-20 Gwei, biasanya lebih stabil dan murah)
        self.blob_base_fees = np.clip(np.random.normal(5, 2, NUM_BLOCKS).cumsum() * 0.05 + 5, 1, 30)
        
        # Aliran transaksi masuk per blok (distribusi Poisson, rata-rata 30 tx/blok)
        self.incoming_txs = np.random.poisson(30, NUM_BLOCKS)

class StaticEngine:
    """Mengirim batch secara statis setiap 10 blok menggunakan Calldata."""
    def __init__(self):
        self.total_cost_eth = 0
        self.batch_history = []
        self.pending_txs = 0

    def run(self, env):
        for block in range(NUM_BLOCKS):
            self.pending_txs += env.incoming_txs[block]
            
            # Statis: Kirim setiap 10 blok
            if block % 10 == 0 and self.pending_txs > 0:
                batch_size_bytes = self.pending_txs * TX_SIZE_BYTES
                gas_used = batch_size_bytes * CALLDATA_GAS_PER_BYTE
                cost_eth = gas_used * env.l1_base_fees[block] * GWEI_TO_ETH
                
                self.total_cost_eth += cost_eth
                self.batch_history.append((block, cost_eth, 'Calldata'))
                self.pending_txs = 0

class DynamicEngine:
    """Mengirim batch secara dinamis berdasarkan kepadatan dan arbitrase harga Blob vs Calldata."""
    def __init__(self):
        self.total_cost_eth = 0
        self.batch_history = []
        self.pending_txs = 0
        self.blocks_since_last_batch = 0
        self.calldata_count = 0
        self.blob_count = 0

    def run(self, env):
        for block in range(NUM_BLOCKS):
            self.pending_txs += env.incoming_txs[block]
            self.blocks_since_last_batch += 1
            
            current_batch_bytes = self.pending_txs * TX_SIZE_BYTES
            
            # KONDISI PENGIRIMAN: Latency max tercapai ATAU ukuran batch optimal tercapai
            if self.blocks_since_last_batch >= MAX_LATENCY_BLOCKS or current_batch_bytes >= TARGET_BATCH_BYTES:
                if self.pending_txs == 0:
                    continue
                
                # ARBITRASE MEDIUM: Bandingkan harga
                cost_calldata = (current_batch_bytes * CALLDATA_GAS_PER_BYTE) * env.l1_base_fees[block] * GWEI_TO_ETH
                cost_blob = BLOB_GAS_SIZE * env.blob_base_fees[block] * GWEI_TO_ETH
                
                if cost_blob < cost_calldata:
                    # Blob lebih murah (EIP-4844)
                    self.total_cost_eth += cost_blob
                    self.batch_history.append((block, cost_blob, 'Blob'))
                    self.blob_count += 1
                else:
                    # Calldata lebih murah (Fallback)
                    self.total_cost_eth += cost_calldata
                    self.batch_history.append((block, cost_calldata, 'Calldata'))
                    self.calldata_count += 1
                
                # Reset
                self.pending_txs = 0
                self.blocks_since_last_batch = 0

def plot_results(env, static_history, dynamic_history, static_cost, dynamic_cost):
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
    
    # PLOT 1: Fluktuasi Harga Gas
    ax1.plot(env.l1_base_fees, label='L1 Base Fee (Gwei)', color='red', alpha=0.7)
    ax1.plot(env.blob_base_fees, label='Blob Base Fee (Gwei)', color='blue', alpha=0.7)
    ax1.set_title('Simulasi Fluktuasi Harga Gas L1 & Blob (EIP-4844)')
    ax1.set_ylabel('Harga (Gwei)')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # PLOT 2: Pengeluaran Biaya Kumulatif
    static_blocks = [x[0] for x in static_history]
    static_costs = np.cumsum([x[1] for x in static_history])
    
    dynamic_blocks = [x[0] for x in dynamic_history]
    dynamic_costs = np.cumsum([x[1] for x in dynamic_history])
    
    ax2.step(static_blocks, static_costs, label=f'Static Engine (Calldata)\nTotal: {static_cost:.2f} ETH', color='orange', where='post')
    ax2.step(dynamic_blocks, dynamic_costs, label=f'Dynamic Engine (Blob/Calldata)\nTotal: {dynamic_cost:.2f} ETH', color='green', where='post')
    
    # Tandai titik di mana Blob vs Calldata digunakan oleh Dynamic Engine
    blob_x = [x[0] for x in dynamic_history if x[2] == 'Blob']
    blob_y = [dynamic_costs[dynamic_blocks.index(b)] for b in blob_x]
    
    calldata_x = [x[0] for x in dynamic_history if x[2] == 'Calldata']
    calldata_y = [dynamic_costs[dynamic_blocks.index(c)] for c in calldata_x]
    
    ax2.scatter(blob_x, blob_y, color='blue', marker='o', s=30, label='Pengiriman Blob', zorder=5)
    ax2.scatter(calldata_x, calldata_y, color='red', marker='x', s=30, label='Pengiriman Calldata (Fallback)', zorder=5)
    
    ax2.set_title('Perbandingan Kumulatif Biaya Pengiriman Batch L2 ke L1')
    ax2.set_xlabel('Blok')
    ax2.set_ylabel('Biaya Kumulatif (ETH)')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('logs/dynamic_simulation.png')
    print("Grafik hasil simulasi telah disimpan di logs/dynamic_simulation.png")

if __name__ == "__main__":
    import json

    NUM_RUNS = 100  # Monte Carlo iterations

    print("=" * 60)
    print(" MONTE CARLO SIMULATION: DYNAMIC ROLLUP SUBMISSION ENGINE")
    print(f" {NUM_RUNS} runs x {NUM_BLOCKS} blocks each")
    print("=" * 60)

    static_costs = []
    dynamic_costs = []
    savings_list = []
    blob_ratios = []

    for i in range(NUM_RUNS):
        env = SimulationEnvironment()

        static = StaticEngine()
        static.run(env)

        dynamic = DynamicEngine()
        dynamic.run(env)

        s = static.total_cost_eth
        d = dynamic.total_cost_eth
        saving = s - d
        pct = (saving / s * 100) if s > 0 else 0
        total_batches = dynamic.blob_count + dynamic.calldata_count
        blob_ratio = (dynamic.blob_count / total_batches * 100) if total_batches > 0 else 0

        static_costs.append(s)
        dynamic_costs.append(d)
        savings_list.append(pct)
        blob_ratios.append(blob_ratio)

    # ── Statistics ──
    static_arr = np.array(static_costs)
    dynamic_arr = np.array(dynamic_costs)
    savings_arr = np.array(savings_list)

    stats = {
        "num_runs": NUM_RUNS,
        "blocks_per_run": NUM_BLOCKS,
        "static": {
            "mean_eth": float(np.mean(static_arr)),
            "std_eth": float(np.std(static_arr)),
            "min_eth": float(np.min(static_arr)),
            "max_eth": float(np.max(static_arr)),
            "median_eth": float(np.median(static_arr)),
        },
        "dynamic": {
            "mean_eth": float(np.mean(dynamic_arr)),
            "std_eth": float(np.std(dynamic_arr)),
            "min_eth": float(np.min(dynamic_arr)),
            "max_eth": float(np.max(dynamic_arr)),
            "median_eth": float(np.median(dynamic_arr)),
        },
        "savings_pct": {
            "mean": float(np.mean(savings_arr)),
            "std": float(np.std(savings_arr)),
            "min": float(np.min(savings_arr)),
            "max": float(np.max(savings_arr)),
            "median": float(np.median(savings_arr)),
            "ci_95_lower": float(np.percentile(savings_arr, 2.5)),
            "ci_95_upper": float(np.percentile(savings_arr, 97.5)),
        },
        "blob_usage_pct": float(np.mean(blob_ratios)),
    }

    os.makedirs("logs", exist_ok=True)
    with open("logs/monte_carlo_results.json", "w") as f:
        json.dump(stats, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"  MONTE CARLO RESULTS ({NUM_RUNS} runs)")
    print(f"{'=' * 60}")
    print(f"  Static Engine (Calldata):")
    print(f"    Mean   : {stats['static']['mean_eth']:.4f} ETH")
    print(f"    Std    : {stats['static']['std_eth']:.4f} ETH")
    print(f"    Min/Max: {stats['static']['min_eth']:.4f} / {stats['static']['max_eth']:.4f} ETH")
    print(f"  Dynamic Engine (Blob/Calldata):")
    print(f"    Mean   : {stats['dynamic']['mean_eth']:.4f} ETH")
    print(f"    Std    : {stats['dynamic']['std_eth']:.4f} ETH")
    print(f"    Min/Max: {stats['dynamic']['min_eth']:.4f} / {stats['dynamic']['max_eth']:.4f} ETH")
    print(f"  Savings:")
    print(f"    Mean   : {stats['savings_pct']['mean']:.2f}%")
    print(f"    95% CI : [{stats['savings_pct']['ci_95_lower']:.2f}%, {stats['savings_pct']['ci_95_upper']:.2f}%]")
    print(f"    Std    : {stats['savings_pct']['std']:.2f}%")
    print(f"  Blob Usage: {stats['blob_usage_pct']:.1f}% of batches")
    print(f"{'=' * 60}")

    # ── Plots ──
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))

    # Plot 1: Cost distribution
    axes[0, 0].hist(static_arr, bins=20, alpha=0.6, label="Static", color="orange")
    axes[0, 0].hist(dynamic_arr, bins=20, alpha=0.6, label="Dynamic", color="green")
    axes[0, 0].set_title("Distribution of Total Cost (ETH)")
    axes[0, 0].set_xlabel("ETH")
    axes[0, 0].set_ylabel("Frequency")
    axes[0, 0].legend()
    axes[0, 0].grid(True, alpha=0.3)

    # Plot 2: Savings distribution
    axes[0, 1].hist(savings_arr, bins=20, color="teal", alpha=0.7, edgecolor="black")
    axes[0, 1].axvline(x=np.mean(savings_arr), color="red", linestyle="--", label=f"Mean: {np.mean(savings_arr):.1f}%")
    axes[0, 1].set_title("Distribution of Gas Savings (%)")
    axes[0, 1].set_xlabel("Savings (%)")
    axes[0, 1].set_ylabel("Frequency")
    axes[0, 1].legend()
    axes[0, 1].grid(True, alpha=0.3)

    # Plot 3: Single run example
    env_example = SimulationEnvironment()
    static_ex = StaticEngine()
    static_ex.run(env_example)
    dynamic_ex = DynamicEngine()
    dynamic_ex.run(env_example)

    sb = [x[0] for x in static_ex.batch_history]
    sc = np.cumsum([x[1] for x in static_ex.batch_history])
    db = [x[0] for x in dynamic_ex.batch_history]
    dc = np.cumsum([x[1] for x in dynamic_ex.batch_history])

    axes[1, 0].step(sb, sc, where="post", label="Static (Calldata)", color="orange")
    axes[1, 0].step(db, dc, where="post", label="Dynamic (Blob/Calldata)", color="green")
    axes[1, 0].set_title("Example Run: Cumulative Cost")
    axes[1, 0].set_xlabel("Block")
    axes[1, 0].set_ylabel("Cumulative Cost (ETH)")
    axes[1, 0].legend()
    axes[1, 0].grid(True, alpha=0.3)

    # Plot 4: Gas price example
    axes[1, 1].plot(env_example.l1_base_fees, label="L1 Base Fee", color="red", alpha=0.7)
    axes[1, 1].plot(env_example.blob_base_fees, label="Blob Base Fee", color="blue", alpha=0.7)
    axes[1, 1].set_title("Example Run: Gas Price Fluctuation")
    axes[1, 1].set_xlabel("Block")
    axes[1, 1].set_ylabel("Fee (Gwei)")
    axes[1, 1].legend()
    axes[1, 1].grid(True, alpha=0.3)

    plt.suptitle(f"Monte Carlo Simulation: {NUM_RUNS} Runs x {NUM_BLOCKS} Blocks", fontsize=14, fontweight="bold")
    plt.tight_layout()
    plt.savefig("logs/monte_carlo_results.png", dpi=150)
    print("\nPlot saved to logs/monte_carlo_results.png")
    print("Statistics saved to logs/monte_carlo_results.json")
