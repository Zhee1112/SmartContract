# VI. SARAN UNTUK PENELITIAN SELANJUTNYA

Berdasarkan temuan dan keterbatasan penelitian ini, berikut disajikan beberapa arah pengembangan yang dapat dieksplorasi dalam penelitian selanjutnya.

## A. Penguatan Keamanan

**Formal verification** menggunakan tools seperti Halmos atau Certora Prover perlu diintegrasikan untuk membuktikan ketiadaan vulnerability secara formal, khususnya pada komponen inline assembly yang kritis. Pendekatan ini akan meningkatkan keyakinan terhadap keamanan kontrak di luar skenario pengujian behavioral.

**Flash loan protection** perlu dikembangkan untuk mendeteksi transaksi yang menggunakan modal flash loan dan menerapkan penalti yang sesuai. Deteksi ini memerlukan integrasi dengan lending protocol atau analisis trace transaksi untuk mengidentifikasi sumber modal.

**Multi-pattern MEV detection** perlu diperluas untuk mendeteksi pola sandwich yang lebih kompleks, termasuk Ta1→Tv→Ta2 (sandwich lengkap), cross-contract sandwich (serangan melalui DEX berbeda), dan time-bandit attack (reorg-based MEV). Pemluasan ini akan meningkatkan efektivitas EWS terhadap MEV bot canggih.

## B. Peningkatan Arsitektur

**Multi-sig admin dan time-locks** perlu diintegrasikan untuk menghilangkan single point of failure pada mekanisme emergency pause. Governance mechanism yang terdesentralisasi akan meningkatkan kepercayaan dan keamanan operasional bridge.

**Proxy upgradeability pattern** perlu dipertimbangkan untuk memungkinkan pembaruan kode kontrak tanpa migrasi state, sehingga bug yang ditemukan setelah deployment dapat diperbaiki secara cepat.

**Cross-chain integration** perlu dikembangkan untuk menguji efektivitas modifikasi EIP-1153 dalam konteks bridge multi-chain, termasuk integrasi dengan layer-2 rollups dan cross-chain message passing protocols.

## C. Optimasi Biaya

**Non-linear penalty model** perlu dikembangkan untuk menggantikan formula linear yang ada. Model yang lebih adaptif — yang mempertimbangkan volume transaksi historis, kondisi pasar, dan sumber modal penyerang — akan menghasilkan penalti yang lebih proporsional dan efektif.

**Dynamic parameter tuning** untuk P_detect dan lambda perlu diimplementasikan agar parameter EWS menyesuaikan secara otomatis berdasarkan kondisi jaringan aktual, mengurangi risiko false positive sekaligus menjaga efektivitas deteksi.

**Load testing dan stress testing** perlu dilakukan untuk menentukan throughput maksimum arsitektur Tier D dan mengidentifikasi bottleneck di bawah kondisi concurrent users dan network congestion.

## D. Ekspansi Riset

**Pengujian multi-chain** pada testnet (Sepolia, Arbitrum Sepolia, Optimism Sepolia) perlu dilakukan untuk memvalidasi gas measurements dalam kondisi jaringan nyata dan mengukur dampak Blob fee fluctuations terhadap dynamic rollup submission engine.

**Studi komparatif dengan bridge production** seperti Hop Protocol, Stargate, dan Connext perlu diperluas untuk mengidentifikasi peluang integrasi modifikasi EIP-1153 ke dalam arsitektur bridge yang sudah beroperasi.

**Dashboard monitoring real-time** perlu dikembangkan lebih lanjut untuk visualisasi performa bridge, deteksi anomali, dan pengambilan keputusan operasional secara real-time oleh operator bridge.
