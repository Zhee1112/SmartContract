# 5. Kesimpulan dan saran

## 5.1 Kesimpulan

Penelitian ini mengkaji optimasi gas smart contract bridge menggunakan modifikasi EIP-1153 transient storage pada jaringan Ethereum. Melalui implementasi empat tier arsitektur bridge (Tier A: baseline, Tier B: optimasi statis, Tier C: dynamic penuh, dan Tier D: dynamic ringan) serta pengujian terhadap 215 test cases yang terdistribusi dalam 13 test suites, diperoleh kesimpulan sebagai berikut.

Modifikasi EIP-1153 pada Tier D terbukti mampu mengimplementasikan lima fungsi keamanan (reentrancy guard, MEV sandwich detection, economic penalty, emergency pause, dan block number tracking) dengan biaya gas tambahan hanya 9.900 gas—48,5 kali lipat lebih murah dibandingkan implementasi konvensional pada Tier C yang memerlukan sekitar 74.100 gas melalui external calls ke MonitorMock. Tier D berhasil mempertahankan skor keamanan 8 dari 8 fitur yang dievaluasi—identik dengan Tier C—tanpa pengorbanan biaya gas yang berarti. Metrik Security Points per Gas (SPG) membuktikan bahwa Tier D mencapai efisiensi biaya-keamanan terbaik dengan skor 220,1, 3,4 kali lebih efisien dibandingkan Tier C (65,2).

Penghematan gas yang dicapai Tier D dibandingkan Tier C bersifat konsisten di seluruh operasi bridge: 72,2% untuk deposit, 88,4% untuk withdraw, dan 87,1% untuk swap. Validasi statistik menggunakan Welch's t-test dengan 100 sampel per operasi memperlihatkan perbedaan yang sangat mencolok (p-value: 2,25 × 10⁻²²², Cohen's d: 220,64). Estimasi biaya real-world menunjukkan bahwa untuk bridge dengan volume 100.000 transaksi per bulan, Tier D menghemat antara $79.000 sampai $213.000 per bulan dibandingkan Tier C.

## 5.2 Saran

Berdasarkan temuan dan keterbatasan penelitian ini, berikut disajikan beberapa arah pengembangan yang dapat dieksplorasi dalam penelitian selanjutnya.

### 5.2.1 Penguatan keamanan

Formal verification menggunakan Halmos atau Certora Prover perlu diintegrasikan untuk membuktikan ketiadaan vulnerability secara formal, khususnya pada komponen inline assembly yang kritis. Flash loan protection perlu dikembangkan untuk mendeteksi transaksi yang menggunakan modal flash loan. Multi-pattern MEV detection perlu diperluas untuk mendeteksi pola sandwich yang lebih kompleks, termasuk Ta1→Tv→Ta2 dan cross-contract sandwich.

### 5.2.2 Peningkatan arsitektur

Proxy upgradeability pattern perlu dipertimbangkan untuk memungkinkan pembaruan kode kontrak tanpa migrasi state. Multi-sig admin dan time-locks perlu diintegrasikan untuk menghilangkan single point of failure pada mekanisme emergency pause.

### 5.2.3 Pengujian multi-chain

Pengujian multi-chain pada testnet (Sepolia, Arbitrum Sepolia, Optimism Sepolia) perlu dilakukan untuk memvalidasi gas measurements dalam kondisi jaringan nyata dan mengukur dampak Blob fee fluctuations terhadap dynamic rollup submission engine.
