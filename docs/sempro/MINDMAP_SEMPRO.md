# MIND MAP SEMPRO (BAB 1-3)

## Alur Penelitian: Dari Masalah Sampai Metodologi

```mermaid
graph TD
    JUDUL["JUDUL: Optimalisasi Gas dan Keamanan<br/>Smart Contract Bridge<br/>Berbasis EIP-1153 Transient Storage<br/>pada Arsitektur 4-Tier"]

    JUDUL --> BAB1
    JUDUL --> BAB2
    JUDUL --> BAB3

    subgraph BAB1["BAB I: PENDAHULUAN"]
        B1A["1.1 Latar Belakang<br/>DeFi growth + bridge attacks"]
        B1B["1.2 Identifikasi Masalah<br/>4 permasalahan"]
        B1C["1.3 Rumusan Masalah<br/>3 pertanyaan penelitian"]
        B1D["1.4 Batasan Masalah<br/>Metode + Tools + Proses"]
        B1E["1.5 Tujuan Penelitian<br/>4 tujuan"]
        B1F["1.6 Manfaat Penelitian<br/>Akademis + Industri"]
    end

    subgraph BAB2["BAB II: TINJAUAN PUSTAKA"]
        B2A["2.1 Penelitian Terdahulu<br/>20 paper"]
        B2B["2.2 Tabel Perbandingan<br/>Gap analysis"]
        B2C["2.3 Kesimpulan<br/>Belum ada framework"]
    end

    subgraph BAB3["BAB III: METODOLOGI"]
        B3A["3.1 Paradigma<br/>Empiris-kuantitatif"]
        B3B["3.2 Data<br/>Primer + Sekunder"]
        B3C["3.3 Perancangan Sistem<br/>4-Tier Architecture"]
        B3D["3.4 Platform<br/>Foundry + Solidity"]
        B3E["3.5 Metode Pengujian<br/>10 metode, 216 tests"]
        B3F["3.6 Pengukuran Gas<br/>100 sampel/operasi"]
        B3G["3.7 Pengujian Keamanan<br/>8 fitur keamanan"]
        B3H["3.8 Validasi Statistik<br/>Welch + Cohen's d"]
        B3I["3.9 Analisis Data<br/>SPG + ROI"]
    end

    BAB1 --> OUTPUT
    BAB2 --> OUTPUT
    BAB3 --> OUTPUT

    OUTPUT["OUTPUT: Proposal Sempro<br/>BAB 1-3 Selesai"]

    style JUDUL fill:#2c3e50,color:#fff
    style BAB1 fill:#e74c3c,color:#fff
    style BAB2 fill:#f39c12,color:#fff
    style BAB3 fill:#3498db,color:#fff
    style OUTPUT fill:#1abc9c,color:#fff
```

---

## Detail Isi Setiap BAB

### BAB I: PENDAHULUAN

| Sub-bab | Isi Utama |
|---------|-----------|
| 1.1 Latar Belakang | DeFi growth, bridge attacks ($1.13B), gas SSTORE 22.900, EIP-1153 solusi |
| 1.2 Identifikasi Masalah | 4 masalah: gas tinggi, external calls, belum ada framework, EIP-1153 belum optimal |
| 1.3 Rumusan Masalah | 3 pertanyaan: optimasi gas, arsitektur 4-tier, penghematan EIP-1153 |
| 1.4 Batasan Masalah | Metode (7 poin), Tools (10 poin), Proses (7 poin) |
| 1.5 Tujuan Penelitian | 4 tujuan: optimasi, rancang, buktikan, ukur SPG |
| 1.6 Manfaat Penelitian | Penulis, Universitas, Pengembang + Peneliti |

### BAB II: TINJAUAN PUSTAKA

| Sub-bab | Isi Utama |
|---------|-----------|
| 2.1 Penelitian Terdahulu | 20 paper: gas optimization, security, EIP-1153, bridge |
| 2.2 Tabel Perbandingan | Gap analysis: belum ada framework komparatif |
| 2.3 Kesimpulan | Belum ada yang menggabungkan optimasi gas + keamanan inline |

### BAB III: METODOLOGI

| Sub-bab | Isi Utama |
|---------|-----------|
| 3.1 Paradigma | Empiris-kuantitatif (ukur fakta) |
| 3.2 Data | Primer (gas + security) + Sekunder (literatur) |
| 3.3 Perancangan | 4-Tier: A (baseline), B (statis), C (dynamic eksternal), D (dynamic inline) |
| 3.4 Platform | Solidity 0.8.28, Foundry v1.7.1, EVM Cancun |
| 3.5 Metode Pengujian | 10 metode: unit, integration, fuzz, invariant, gas benchmark, statistical, attack sim, economic sim, state machine, edge case |
| 3.6 Pengukuran Gas | 100 sampel/operasi, statistik deskriptif, CI 95% |
| 3.7 Pengujian Keamanan | 8 fitur: reentrancy, MEV, penalty, pause, block tracking, cross-function, consecutive, custom errors |
| 3.8 Validasi Statistik | Welch's t-test + Cohen's d effect size |
| 3.9 Analisis Data | SPG (Security Points per Gas) + ROI serangan |

---

## Tools yang Digunakan

| Kategori | Tools | Fungsi |
|----------|-------|--------|
| Development | Solidity 0.8.28 | Bahasa pemrograman |
| Compiler | Foundry v1.7.1 | Kompilasi + testing |
| EVM | Cancun | Mendukung EIP-1153 |
| Static Analysis | Slither v0.11.5 | Deteksi vulnerability |
| Linting | Solhint | Validasi best practices |
| Coverage | forge coverage | Ukur kode teruji (88.86%) |
| Gas Profiling | forge --gas-report | Gas detail per fungsi |

---

## Flow Logika Penulisan

```
BAB I: "Mengapa penelitian ini ada?" (Masalah)
  ↓
BAB II: "Apa yang sudah dilakukan orang lain?" (Literatur)
  ↓
BAB III: "Bagaimana cara membuktikan?" (Metode)
  ↓
OUTPUT: Proposal Sempro (BAB 1-3)
```
