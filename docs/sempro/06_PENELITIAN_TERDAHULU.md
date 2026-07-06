# BAB II PENELITIAN TERDAHULU YANG RELEVAN

## 2.1 Penelitian Terdahulu

Untuk mendapatkan pemahaman yang cukup tentang topik yang diangkat, berikut disajikan sejumlah penelitian terdahulu yang memiliki keterkaitan dengan optimasi gas dan keamanan smart contract bridge.

**Tabel 1. Daftar Penelitian Terdahulu Terkait Optimalisasi Gas Smart Contract**

| No | Judul | Penulis/Tahun | Permasalahan | Metode/Pendekatan | Hasil Penelitian |
|----|-------|---------------|--------------|-------------------|------------------|
| 1 | Gas Cost Analysis of EIP-1153 Transient Storage | Benedetti et al., 2024 | Biaya gas EIP-1153 belum terukur secara komprehensif | Pengukuran gas komparatif TSTORE vs SSTORE | TSTORE 100 gas, 98,7% lebih hemat dari SSTORE |
| 2 | Profiling Gas Consumption in Solidity Smart Contracts | Di Sorbo et al., 2022 | Pemborosan gas pada kontrak Solidity | Analisis code smells dengan korelasi Spearman | 19 code smells teridentifikasi |
| 3 | Running on Fumes: Preventing Out-of-Gas Vulnerabilities | Albert et al., 2021 | Out-of-gas vulnerability pada kontrak | Static resource analysis | 15% kontrak melebihi block gas limit |
| 4 | Quantifying Blockchain Extractable Value | Qin et al., 2021 | MEV sandwich attack sulit dideteksi | Analisis MEV skala besar | $189M kerugian dari sandwich |
| 5 | Flash Boys 2.0 | Daian et al., 2020 | Frontrunning di DEX | Studi empiris transaksi mempool | Identifikasi MEV sebagai ancaman |
| 6 | Reentrancy Vulnerability Identification | Samreen dan Alalfi, 2020 | Deteksi reentrancy attack | Identification dengan pattern matching | Identifikasi pola reentrancy |
| 7 | Turn the Rudder: Reentrancy Detection | Zheng et al., 2023 | Deteksi reentrancy pada skala besar | Evaluasi large-scale terhadap 139.424 kontrak | 99,8% false positive rate |
| 8 | Transient Storage in the wild | Zhang dan Debono, 2024 | Studi empiris EIP-1153 | Analisis dampak pada 250+ kontrak | 50%+ hanya untuk reentrancy guard |
| 9 | GasAgent: Multi-Agent Gas Optimization | Zheng et al., 2024 | Optimasi gas secara otomatis | Framework multi-agent | 25-40% penghematan gas |
| 10 | Precise Static Modeling of Ethereum Memory | Lagouvardos et al., 2020 | Model statis EVM | Model bytecode statis | Model gas consumption presisi |
| 11 | Transient Storage Security Model | OpenZeppelin, 2024 | Keamanan transient storage | Framework keamanan | Pattern keamanan EIP-1153 |
| 12 | Wormhole Bridge Security Report | Trail of Bits, 2022 | Keamanan bridge | Security assessment | Identifikasi vulnerability |
| 13 | Uniswap V3 Core | Adams et al., 2021 | Efisiensi gas pada DEX | Concentrated Liquidity | Penghematan gas 40-50% |
| 14 | Comparative Gas Cost Analysis of Proxy and Diamond Patterns | Benedetti et al., 2024 | Perbandingan pattern arsitektur | Analisis biaya gas | Tradeoff deployment vs execution |
| 15 | Impact of EIP-4844 on Ethereum | Park et al., 2024 | Dampak EIP-4844 | Pemodelan statistik VAR | Gas -54,53%, fork rate +116,5% |
| 16 | Bridging the gap: smart contract vulnerabilities | Salzano et al., 2026 | Celah keamanan | Studi komparatif sistematis | Perbandingan academic vs developer |
| 17 | ItyFuzz: On-chain Auditing | Shou et al., 2023 | Fuzzing smart contract | Fuzz testing berbasis properti | Deteksi bug otomatis |
| 18 | Unity is Strength: Reentrancy Detection | Wang et al., 2024 | Deteksi reentrancy | Perbandingan multi-tool | F1-score 78,65% |
| 19 | Secure-by-design smart contract | Casale-Brunet, 2022 | Keamanan smart contract | Pendekatan secure-by-design | Implementasi dataflow |
| 20 | Efficiently Detecting Reentrancy Vulnerabilities | Wang et al., 2024 | Deteksi reentrancy kompleks | Analisis statis | Peningkatan efisiensi deteksi |

## 2.2 Tabel Perbandingan

**Tabel 2. Tabel Perbandingan Penelitian Terdahulu**

| No | Penulis/Tahun | Objek Penelitian | Metode | Pendekatan | Metode Evaluasi | Hasil |
|----|---------------|------------------|--------|------------|-----------------|-------|
| 1 | Benedetti et al., 2024 | EIP-1153 | Experimental | Pengukuran gas komparatif | Comparative | 98,7% penghematan |
| 2 | Di Sorbo et al., 2022 | Gas consumption | Statistical | Analisis code smells | Korelasi Spearman | Identifikasi pemborosan gas |
| 3 | Albert et al., 2021 | Smart contract | Static analysis | Resource analysis | Gas bound | Prediksi kebutuhan gas |
| 4 | Qin et al., 2021 | MEV | Empirical | Analisis MEV skala besar | Large-scale | $189M kerugian |
| 5 | Daian et al., 2020 | DEX Ethereum | Empirical | Studi empiris mempool | Quantification | Identifikasi ancaman |
| 6 | Samreen dan Alalfi, 2020 | Reentrancy | Experimental | Pattern matching | Detection rate | Pola reentrancy |
| 7 | Zheng et al., 2023 | Reentrancy | Empirical | Evaluasi large-scale | False positive | 99,8% false positive |
| 8 | Zhang dan Debono, 2024 | EIP-1153 | Empirical | Analisis dampak | Gas savings | 50%+ reentrancy guard |
| 9 | Zheng et al., 2024 | Gas optimization | Multi-agent | Framework multi-agent | Gas reduction | 25-40% penghematan |
| 10 | Lagouvardos et al., 2020 | EVM memory | Static analysis | Model bytecode statis | Precision | Model presisi |
| 11 | OpenZeppelin, 2024 | Transient storage | Framework | Framework keamanan | Audit | Pattern keamanan |
| 12 | Trail of Bits, 2022 | Bridge security | Assessment | Security assessment | Vulnerability ID | Identifikasi celah |
| 13 | Adams et al., 2021 | DEX | Implementation | Concentrated Liquidity | Gas measurement | 40-50% penghematan |
| 14 | Benedetti et al., 2024 | Proxy vs Diamond | Comparative | Analisis biaya gas | Cost analysis | Tradeoff biaya |
| 15 | Park et al., 2024 | EIP-4844 | Statistical | Pemodelan VAR | Pre vs post fork | Gas -54,53% |
| 16 | Salzano et al., 2026 | Vulnerability | Systematic | Studi komparatif | Gap analysis | Perbandingan |
| 17 | Shou et al., 2023 | Bug detection | Property-based | Fuzz testing | Bug detection | Deteksi otomatis |
| 18 | Wang et al., 2024 | Reentrancy | Comparative | Perbandingan multi-tool | F1-score | 78,65% akurasi |
| 19 | Casale-Brunet, 2022 | Smart contract | Formal | Secure-by-design | Security proof | Implementasi dataflow |
| 20 | Wang et al., 2024 | Complex reentrancy | Experimental | Analisis statis | Accuracy | Peningkatan deteksi |
| 21 | Al Farizy, 2025 | Smart contract bridge | Empirical | Optimasi gas statis + dinamis EIP-1153, analisis komparatif 4-tier | Gas measurement, Welch's t-test, SPG | Implementasi inline EIP-1153 mencapai skor keamanan penuh dengan biaya gas yang jauh lebih rendah dibandingkan pendekatan konvensional |

## 2.3 Kesimpulan Perbandingan

Berdasarkan perbandingan terhadap penelitian-penelitian terdahulu, dapat disimpulkan bahwa sebagian besar penelitian sebelumnya dalam bidang optimasi gas dan keamanan smart contract masih berfokus pada satu aspek tertentu—baik optimasi gas maupun keamanan—secara terpisah. Beberapa penelitian telah mulai mengeksplorasi pemanfaatan EIP-1153 transient storage untuk reentrancy guard, namun pendekatan tersebut masih terbatas pada satu fungsi keamanan dan sebagian besar menggunakan external calls ke kontrak terpisah yang justru menambah biaya gas overhead. Belum ada penelitian yang secara spesifik mengkombinasikan optimasi gas statis dan dinamis berbasis EIP-1153 transient storage dalam satu arsitektur bridge, serta menerapkan keamanan multi-fungsi secara inline dengan pengukuran cost-effectiveness menggunakan metrik SPG. Oleh karena itu, penelitian ini bertujuan untuk mengkaji pemanfaatan EIP-1153 transient storage dalam konteks bridge blockchain, serta mengombinasikannya dengan optimasi gas statis dalam sebuah arsitektur 4-tier yang terstruktur. Penelitian ini juga merancang skenario eksperimen dengan membandingkan empat tingkat optimasi berbeda—mulai dari tanpa optimasi (Tier A), optimasi statis saja (Tier B), full dynamic EIP-1153 (Tier C), hingga lightweight dynamic inline (Tier D)—menggunakan dataset pengukuran gas dari 100 sampel per operasi pada lingkungan EVM simulasi.
