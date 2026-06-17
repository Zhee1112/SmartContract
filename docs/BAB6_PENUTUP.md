# BAB 6: PENUTUP

## 6.1 Kesimpulan

Penelitian ini telah mengkaji optimasi gas smart contract bridge menggunakan modifikasi EIP-1153 transient storage pada jaringan Ethereum. Melalui implementasi empat tier arsitektur bridge (Tier A: baseline, Tier B: optimasi statis, Tier C: dynamic penuh, dan Tier D: dynamic ringan) serta pengujian terhadap 215 test cases yang terdistribusi dalam 13 test suites, berikut disajikan kesimpulan-kesimpulan yang diperoleh dari seluruh rangkaian penelitian.

### 6.1.1 Optimasi Gas EIP-1153 Transient Storage

Modifikasi EIP-1153 pada Tier D terbukti secara empiris mampu mengimplementasikan lima fungsi keamanan (reentrancy guard, MEV sandwich detection, economic penalty, emergency pause, dan block number tracking) dengan biaya gas tambahan hanya 9.900 gas. Jumlah ini representasikan 48,5 kali lipat lebih murah dibandingkan implementasi konvensional pada Tier C yang memerlukan sekitar 74.100 gas melalui mekanisme external calls ke MonitorMock (lihat BAB 4, Bagian 4.5).

Modifikasi ini dilakukan dengan mengganti pola arsitektural yang bergantung pada panggilan eksternal (CALL opcode) ke kontrak terpisah menjadi implementasi inline menggunakan inline assembly. Konsekuensinya, Tier D mengeliminasi seluruh overhead yang terkait dengan external calls, meliputi: CALL opcode overhead (500 gas untuk 5 panggilan), ABI encode/decode (~15.000 gas), code loading (~13.000 gas), dan cold SLOAD di kontrak MonitorMock (~10.500 gas). Penghematan bersih yang dihasilkan mencapai sekitar 62.400 gas per transaksi (lihat BAB 4, Bagian 4.4).

### 6.1.2 Pencapaian Keamanan pada Biaya Minimum

Temuan kritis penelitian ini adalah bahwa Tier D berhasil mempertahankan tingkat keamanan yang identik dengan Tier C tanpa pengorbanan biaya gas yang berarti. Tier D mencapai skor keamanan 8 dari 8 fitur keamanan yang dievaluasi — sama dengan Tier C yang mencapai 8/8 (lihat BAB 4, Bagian 4.3).

Rincian pencapaian keamanan Tier D adalah sebagai berikut:

- Reentrancy single-function: terlindungi melalui EIP-1153 transient storage dengan biaya 200 gas (lihat BAB 4, Bagian 4.3.1).
- Reentrancy cross-function dan consecutive: terlindungi melalui mekanisme callDepth check yang diimplementasikan secara inline.
- MEV sandwich detection: terlindungi melalui single-slot LastTx struct yang hanya memerlukan 4.400 gas, dibandingkan dynamic array txRecords[] pada Tier C yang memerlukan 22.100 gas per push (lihat BAB 4, Bagian 4.3.2).
- Economic penalty: diimplementasikan sebagai pure math inline sebesar 300 gas, tanpa memerlukan panggilan eksternal.
- Emergency pause: berfungsi identik pada Tier C dan Tier D, masing-masing menggunakan SSTORE sebesar 2.900 gas (lihat BAB 4, Bagian 4.3.3).

Peningkatan keamanan Tier D dibandingkan Tier B (optimasi statis) adalah sebesar 300% (dari 2/8 menjadi 8/8), sementara biaya gas tambahan yang diperlukan hanya 8,7% lebih tinggi dari Tier B. Rasio cost-effectiveness ini menunjukkan bahwa setiap 1% peningkatan biaya menghasilkan 34,5% peningkatan keamanan (lihat SECURITY_IMPROVEMENT_PERCENTAGE.md).

### 6.1.3 Efisiensi Biaya (Cost-Effectiveness)

Metrik Security Points per Gas (SPG) membuktikan bahwa Tier D mencapai efisiensi biaya-keamanan terbaik di antara seluruh tier yang dievaluasi. Dengan skor SPG sebesar 220,1, Tier D 3,4 kali lebih efisien dibandingkan Tier C yang memiliki SPG 65,2 (lihat BAB 4, Bagian 4.4.1). Perbandingan lengkap SPG keempat tier adalah sebagai berikut:

| Tier | Skor Keamanan | Gas (Deposit) | SPG (× 1.000.000) | Ranking |
|------|--------------|---------------|---------------------|---------|
| A | 0/8 | 31.412 | 0 | 4 |
| B | 2/8 | 31.427 | 63,6 | 3 |
| C | 8/8 | 122.769 | 65,2 | 2 |
| **D** | **8/8** | **34.156** | **220,1** | **1** |

Analisis biaya per fitur keamanan tambahan memperkuat temuan ini. Transisi dari Tier B ke Tier D (penambahan 6 fitur keamanan) hanya memerlukan 454,8 gas per fitur. Sebaliknya, transisi dari Tier D ke Tier C (tanpa penambahan fitur, keduanya 8/8) memerlukan 88.613 gas tambahan — seluruhnya berasal dari overhead arsitektural external calls (lihat BAB 4, Bagian 4.4.2).

### 6.1.4 Penghematan Gas Tier D vs Tier C

Penghematan gas yang dicapai Tier D dibandingkan Tier C bersifat konsisten di seluruh operasi bridge yang diuji:

| Operasi | Tier C | Tier D | Penghematan | Persentase |
|---------|--------|--------|-------------|-----------|
| Deposit | 122.769 | 34.156 | 88.613 | 72,2% |
| Withdraw | 104.806 | 12.119 | 92.687 | 88,4% |
| Swap | 133.344 | 62.787 | 70.557 | 52,9% |
| Deploy | 886.301 | 736.064 | 150.237 | 17,0% |

Sementara itu, overhead gas Tier D dibandingkan Tier B (baseline tanpa keamanan dinamis) hanya 8,7% untuk deposit — bukti bahwa implementasi inline EIP-1153 menjaga biaya gas tetap rendah (lihat BAB 4, Bagian 4.2.3).

### 6.1.5 Validasi Statistik

Hasil pengukuran gas antara Tier C dan Tier D divalidasi secara statistik menggunakan Welch's t-test dengan 100 sampel per operasi. Hasil uji menunjukkan:

- t-statistic: 1.680,67
- p-value: 2,25 × 10⁻²²² (sangat signifikan, jauh di bawah α = 0,05)
- Cohen's d: 220,64 (effect size LARGE, melebihi ambang 0,8 secara drastis)
- Confidence Interval 95%: [98,18%, 98,23%] (sangat sempit, menunjukkan konsistensi yang tinggi)
- Cost Ratio: 55,7x (Tier C 55,7 kali lebih mahal dari Tier D)

Seluruh 215 test cases yang terdiri dari 13 test suites berhasil dilalui tanpa kegagalan, mencakup fuzz testing (256 fuzz runs per test), invariant testing (128.000 calls per invariant), edge case analysis, dan security verification (lihat BAB 4, Bagian 4.6 dan SECURITY_IMPROVEMENT_PERCENTAGE.md, Bagian 5).

### 6.1.6 Relevansi Biaya Real-World

Estimasi biaya transaksi pada kondisi pasar aktual (ETH = $3.000, gas price 0,677 Gwei) menunjukkan bahwa biaya deposit pada Tier D adalah sebesar $0,058, dibandingkan $0,208 pada Tier C. Untuk bridge dengan volume 100.000 transaksi per bulan, Tier D menghemat antara $79.000 sampai $213.000 per bulan dibandingkan Tier C, tergantung pada kondisi gas price (lihat BAB 4, Bagian 4.7).

### 6.1.7 Kesimpulan Umum

Berdasarkan seluruh temuan di atas, penelitian ini menyimpulkan bahwa modifikasi EIP-1153 transient storage dari fungsi tunggal (reentrancy guard, 200 gas) menjadi multi-fungsi keamanan (9.900 gas) merupakan pendekatan yang efektif dan efisien untuk mengoptimalkan smart contract bridge. Pendekatan ini menyelesaikan tradeoff kritis antara biaya gas dan keamanan yang selama ini menjadi tantangan utama dalam desain bridge, tanpa mengorbankan fitur keamanan yang signifikan.

## 6.2 Kontribusi Penelitian

Penelitian ini memberikan kontribusi terhadap pengembangan ilmu pengetahuan dan praktik pengembangan smart contract dalam beberapa aspek berikut.

### 6.2.1 Kontribusi Teoritis

**Pertama**, penelitian ini memperluas pemahaman tentang fleksibilitas EIP-1153 transient storage di luar fungsi aslinya sebagai reentrancy guard. Modifikasi dari satu fungsi menjadi lima fungsi keamanan (reentrancy guard, MEV detection, economic penalty, block tracking, dan emergency pause) membuktikan bahwa TSTORE/TLOAD dapat dimanfaatkan sebagai infrastruktur keamanan multiguna yang jauh lebih efisien dibandingkan pola arsitektural konvensional berbasis external calls.

**Kedua**, penelitian ini mengembangkan kerangka perbandingan empat tier (A/B/C/D) yang sistematis untuk mengevaluasi tradeoff antara optimasi gas statis, keamanan dinamis, dan biaya operasional. Kerangka ini memberikan landasan empiris bagi pengambil keputusan dalam desain arsitektur bridge yang menyeimbangkan efisiensi biaya dengan tingkat keamanan.

**Ketiga**, penelitian ini memperkenalkan metrik Security Points per Gas (SPG) sebagai instrumen pengukuran cost-effectiveness yang dapat diadopsi secara luas dalam penelitian optimasi gas smart contract. Metrik ini memungkinkan perbandingan objektif antar arsitektur yang memiliki profil gas dan keamanan yang berbeda.

### 6.2.2 Kontribusi Praktis

**Pertama**, penelitian ini menyediakan implementasi referensi modifikasi EIP-1153 secara inline yang telah teruji melalui 215 test cases. Implementasi ini dapat diadopsi oleh pengembang bridge production sebagai template untuk mengoptimalkan biaya gas tanpa mengorbankan keamanan.

**Kedua**, arsitektur Tier D membuktikan bahwa pola inline assembly untuk keamanan on-chain (reentrancy guard + MEV detection + economic penalty) dapat menghemat 72-88% gas dibandingkan pola external calls konvensional, dengan overhead hanya 8,7% dari baseline tanpa keamanan dinamis.

**Ketiga**, hasil benchmark gas yang komprehensif terhadap empat tier arsitektur bridge memberikan data empiris yang berguna bagi operator bridge dalam mengoptimalkan biaya operasional, khususnya dalam konteks estimasi penghematan bulanan sebesar $79.000 sampai $213.000 untuk volume 100.000 transaksi per bulan.

## 6.3 Keterbatasan Penelitian

Meskipun penelitian ini telah memberikan kontribusi yang signifikan, terdapat beberapa keterbatasan yang perlu diakui dan menjadi pertimbangan bagi pengembangan penelitian lebih lanjut.

### 6.3.1 Keterbatasan Teknis

Penelitian ini tidak mengimplementasikan formal verification menggunakan tools seperti Certora Prover, Halmos, atau SMTChecker. Validasi dilakukan seluruhnya melalui behavioral testing (fuzz testing, invariant testing, edge case analysis) yang bersifat skenarional. Meskipun 215 test cases memberikan keyakinan tinggi terhadap skenario yang diuji, tidak dapat ditjamin ketiadaan bug untuk seluruh kemungkinan input (lihat LIMITATIONS.md, Bagian 1.1).

Selain itu, seluruh pengujian dilakukan di lingkungan Foundry EVM local tanpa deployment ke testnet atau mainnet. Gas measurements menggunakan Foundry gas reporter yang akurat untuk local EVM, namun kondisi jaringan nyata (network congestion, base fee fluctuations) dapat menghasilkan sedikit perbedaan (lihat LIMITATIONS.md, Bagian 1.3).

### 6.3.2 Keterbatasan Metodologis

Early Warning System (EWS) yang diimplementasikan dalam penelitian ini menggunakan MonitorMock sebagai prototipe riset, bukan implementasi production. Parameter P_detect (9.600) dan lambda (15.000) bersifat statis dan belum di-tune secara dinamis berdasarkan kondisi pasar aktual (lihat LIMITATIONS.md, Bagian 1.2).

Pattern detection MEV pada EWS terbatas pada pola sandwich dasar Ta1→Tv (frontrun → victim) dalam satu blok. Pola serangan yang lebih kompleks — seperti Ta1→Tv→Ta2 (sandwich lengkap), cross-contract sandwich, flash loan sandwich, dan time-bandit attack — belum terdeteksi oleh mekanisme yang diusulkan (lihat LIMITATIONS.md, Bagian 2.1).

Model penalti ekonomi menggunakan formula linear (λ × P_detect × amount) yang tidak mempertimbangkan faktor-faktor kontekstual seperti volume transaksi historis, kondisi pasar, atau sumber modal penyerang (flash loan vs modal sendiri). Hal ini mengakibatkan penalti mungkin kurang efektif bagi penyerang dengan modal besar atau terlalu besar untuk false positive (lihat LIMITATIONS.md, Bagian 2.2).

### 6.3.3 Keterbatasan Skala

Penelitian ini dilakukan pada satu chain (Ethereum L1) tanpa integrasi cross-chain. Arsitektur bridge yang diuji belum mencakup mekanisme cross-chain message passing (CCMP) atau integrasi dengan layer-2 rollups seperti Optimism, Arbitrum, atau zkSync. Oleh karena itu, hasil optimasi gas Blob (EIP-4844) belum teruji dalam konteks L2 yang sesungguhnya (lihat LIMITATIONS.md, Bagian 1.4).

Ukuran sampel pengukuran gas sebanyak 100 sampel per operasi, meskipun telah memenuhi syarat Central Limit Theorem (CLT), masih terbatas dibandingkan dengan pengujian skala besar (load testing) yang melibatkan concurrent users dan kondisi network congestion (lihat LIMITATIONS.md, Bagian 3.1).

### 6.3.4 Keterbatasan Keamanan

Kontrak bridge dalam penelitian ini menggunakan satu admin address (centralized admin) tanpa mekanisme multi-sig, time-locks, atau governance. Hal ini menciptakan single point of failure jika admin key terkompromi. Selain itu, kontrak bersifat immutable tanpa proxy upgradeability, sehingga bug yang ditemukan setelah deployment tidak dapat diperbaiki tanpa deploy kontrak baru dan migrasi state (lihat LIMITATIONS.md, Bagian 4.1 dan 4.2).

## 6.4 Saran untuk Penelitian Selanjutnya

Berdasarkan temuan dan keterbatasan penelitian ini, berikut disajikan beberapa arah pengembangan yang dapat dieksplorasi dalam penelitian selanjutnya.

### 6.4.1 Penguatan Keamanan

**Formal verification** menggunakan tools seperti Halmos atau Certora Prover perlu diintegrasikan untuk membuktikan ketiadaan vulnerability secara formal, khususnya pada komponen inline assembly yang kritis. Pendekatan ini akan meningkatkan keyakinan terhadap keamanan kontrak di luar skenario pengujian behavioral.

**Flash loan protection** perlu dikembangkan untuk mendeteksi transaksi yang menggunakan modal flash loan dan menerapkan penalti yang sesuai. Deteksi ini memerlukan integrasi dengan lending protocol atau analisis trace transaksi untuk mengidentifikasi sumber modal.

**Multi-pattern MEV detection** perlu diperluas untuk mendeteksi pola sandwich yang lebih kompleks, termasuk Ta1→Tv→Ta2 (sandwich lengkap), cross-contract sandwich (serangan melalui DEX berbeda), dan time-bandit attack (reorg-based MEV). Pemluasan ini akan meningkatkan efektivitas EWS terhadap MEV bot canggih.

### 6.4.2 Peningkatan Arsitektur

**Multi-sig admin dan time-locks** perlu diintegrasikan untuk menghilangkan single point of failure pada mekanisme emergency pause. Governance mechanism yang terdesentralisasi akan meningkatkan kepercayaan dan keamanan operasional bridge.

**Proxy upgradeability pattern** perlu dipertimbangkan untuk memungkinkan pembaruan kode kontrak tanpa migrasi state, sehingga bug yang ditemukan setelah deployment dapat diperbaiki secara cepat.

**Cross-chain integration** perlu dikembangkan untuk menguji efektivitas modifikasi EIP-1153 dalam konteks bridge multi-chain, termasuk integrasi dengan layer-2 rollups dan cross-chain message passing protocols.

### 6.4.3 Optimasi Biaya

**Non-linear penalty model** perlu dikembangkan untuk menggantikan formula linear yang ada. Model yang lebih adaptif — yang mempertimbangkan volume transaksi historis, kondisi pasar, dan sumber modal penyerang — akan menghasilkan penalti yang lebih proporsional dan efektif.

**Dynamic parameter tuning** untuk P_detect dan lambda perlu diimplementasikan agar parameter EWS menyesuaikan secara otomatis berdasarkan kondisi jaringan aktual, mengurangi risiko false positive sekaligus menjaga efektivitas deteksi.

**Load testing dan stress testing** perlu dilakukan untuk menentukan throughput maksimum arsitektur Tier D dan mengidentifikasi bottleneck di bawah kondisi concurrent users dan network congestion.

### 6.4.4 Ekspansi Riset

**Pengujian multi-chain** pada testnet (Sepolia, Arbitrum Sepolia, Optimism Sepolia) perlu dilakukan untuk memvalidasi gas measurements dalam kondisi jaringan nyata dan mengukur dampak Blob fee fluctuations terhadap dynamic rollup submission engine.

**Studi komparatif dengan bridge production** seperti Hop Protocol, Stargate, dan Connext perlu diperluas untuk mengidentifikasi peluang integrasi modifikasi EIP-1153 ke dalam arsitektur bridge yang sudah beroperasi.

**Dashboard monitoring real-time** perlu dikembangkan lebih lanjut untuk visualisasi performa bridge, deteksi anomali, dan pengambilan keputusan operasional secara real-time oleh operator bridge.

---

## Referensi Bab 6

1. Ethereum Foundation. (2023). "EIP-1153: Transient Storage Opcodes." https://eips.ethereum.org/EIPS/eip-1153
2. OpenZeppelin. (2024). "TransientStorageGuard." https://docs.openzeppelin.com/contracts/5.x/api/security#ReentrancyGuard
3. Trail of Bits. (2023). "Smart Contract Security Best Practices." https://trailofbits.github.io/
4. Consensys. (2024). "Ethereum Smart Contract Security Best Practices." https://consensys.github.io/
5. Flashbots. (2023). "MEV and Sandwich Attacks." https://docs.flashbots.net/
6. Ethereum Foundation. (2022). "Ethereum Virtual Machine (EVM) Specification."
7. Foundry Documentation. "Forge Test: Gas Reporting." https://book.getfoundry.sh/
8. Cohen, J. (1988). "Statistical Power Analysis for the Behavioral Sciences." Lawrence Erlbaum Associates.
9. Welch, B. L. (1947). "The Generalization of 'Student's' Problem When Several Different Population Variances are Involved." Biometrika.
10. Cochran, W. G. (1977). "Sampling Techniques." John Wiley & Sons.
