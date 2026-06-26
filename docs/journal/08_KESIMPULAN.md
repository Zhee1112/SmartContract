# VI. KESIMPULAN

Penelitian ini telah mengkaji optimasi gas smart contract bridge menggunakan modifikasi EIP-1153 transient storage pada jaringan Ethereum. Melalui implementasi empat tier arsitektur bridge (Tier A: baseline, Tier B: optimasi statis, Tier C: dynamic penuh, dan Tier D: dynamic ringan) serta pengujian terhadap 215 test cases yang terdistribusi dalam 13 test suites, berikut disajikan kesimpulan-kesimpulan yang diperoleh dari seluruh rangkaian penelitian.

## A. Optimasi Gas EIP-1153 Transient Storage

Modifikasi EIP-1153 pada Tier D terbukti secara empiris mampu mengimplementasikan lima fungsi keamanan (reentrancy guard, MEV sandwich detection, economic penalty, emergency pause, dan block number tracking) dengan biaya gas tambahan hanya 9.900 gas. Jumlah ini 48,5 kali lipat lebih murah dibandingkan implementasi konvensional pada Tier C yang memerlukan sekitar 74.100 gas melalui mekanisme external calls ke MonitorMock (lihat BAB 4, Bagian 4.5).

Modifikasi ini dilakukan dengan mengganti pola arsitektural yang bergantung pada panggilan eksternal (CALL opcode) ke kontrak terpisah menjadi implementasi inline menggunakan inline assembly. Konsekuensinya, Tier D mengeliminasi seluruh overhead yang terkait dengan external calls: CALL opcode overhead (500 gas untuk 5 panggilan), ABI encode/decode (~15.000 gas), code loading (~13.000 gas), dan cold SLOAD di kontrak MonitorMock (~10.500 gas). Penghematan bersih yang dihasilkan mencapai sekitar 62.400 gas per transaksi (lihat BAB 4, Bagian 4.4).

## B. Pencapaian Keamanan pada Biaya Minimum

Temuan kritis penelitian ini adalah bahwa Tier D berhasil mempertahankan tingkat keamanan yang identik dengan Tier C tanpa pengorbanan biaya gas yang berarti. Tier D mencapai skor keamanan 8 dari 8 fitur keamanan yang dievaluasi—sama dengan Tier C (lihat BAB 4, Bagian 4.3).

Rincian pencapaian keamanan Tier D adalah sebagai berikut:

- Reentrancy single-function: terlindungi melalui EIP-1153 transient storage dengan biaya 200 gas (lihat BAB 4, Bagian 4.3.1).
- Reentrancy cross-function dan consecutive: terlindungi melalui mekanisme callDepth check yang diimplementasikan secara inline.
- MEV sandwich detection: terlindungi melalui single-slot LastTx struct yang hanya memerlukan 4.400 gas, dibandingkan dynamic array txRecords[] pada Tier C yang memerlukan 22.100 gas per push (lihat BAB 4, Bagian 4.3.2).
- Economic penalty: diimplementasikan sebagai pure math inline sebesar 300 gas, tanpa memerlukan panggilan eksternal.
- Emergency pause: berfungsi identik pada Tier C dan Tier D, masing-masing menggunakan SSTORE sebesar 2.900 gas (lihat BAB 4, Bagian 4.3.3).

Peningkatan keamanan Tier D dibandingkan Tier B (optimasi statis) adalah sebesar 300% (dari 2/8 menjadi 8/8), sementara biaya gas tambahan yang diperlukan hanya 8,7% lebih tinggi dari Tier B. Rasio cost-effectiveness ini menunjukkan bahwa setiap 1% peningkatan biaya menghasilkan 34,5% peningkatan keamanan (lihat SECURITY_IMPROVEMENT_PERCENTAGE.md).

## C. Efisiensi Biaya (Cost-Effectiveness)

Metrik Security Points per Gas (SPG) membuktikan bahwa Tier D mencapai efisiensi biaya-keamanan terbaik di antara seluruh tier yang dievaluasi. Dengan skor SPG sebesar 220,1, Tier D 3,4 kali lebih efisien dibandingkan Tier C yang memiliki SPG 65,2 (lihat BAB 4, Bagian 4.4.1).

| Tier | Skor Keamanan | Gas (Deposit) | SPG (× 1.000.000) | Ranking |
|------|--------------|---------------|---------------------|---------|
| A | 0/8 | 31.412 | 0 | 4 |
| B | 2/8 | 31.427 | 63,6 | 3 |
| C | 8/8 | 122.769 | 65,2 | 2 |
| **D** | **8/8** | **34.156** | **220,1** | **1** |

Analisis biaya per fitur keamanan tambahan memperkuat temuan ini. Transisi dari Tier B ke Tier D (penambahan 6 fitur keamanan) hanya memerlukan 454,8 gas per fitur. Sebaliknya, transisi dari Tier D ke Tier C (tanpa penambahan fitur, keduanya 8/8) memerlukan 88.613 gas tambahan—seluruhnya berasal dari overhead arsitektural external calls (lihat BAB 4, Bagian 4.4.2).

## D. Penghematan Gas Tier D vs Tier C

Penghematan gas yang dicapai Tier D dibandingkan Tier C bersifat konsisten di seluruh operasi bridge yang diuji:

| Operasi | Tier C | Tier D | Penghematan | Persentase |
|---------|--------|--------|-------------|-----------|
| Deposit | 122.769 | 34.156 | 88.613 | 72,2% |
| Withdraw | 104.806 | 12.119 | 92.687 | 88,4% |
| Swap | 133.344 | 62.787 | 70.557 | 52,9% |
| Deploy | 886.301 | 736.064 | 150.237 | 17,0% |

Sementara itu, overhead gas Tier D dibandingkan Tier B (baseline tanpa keamanan dinamis) hanya 8,7% untuk deposit—bukti bahwa implementasi inline EIP-1153 menjaga biaya gas tetap rendah (lihat BAB 4, Bagian 4.2.3).

## E. Validasi Statistik

Hasil pengukuran gas antara Tier C dan Tier D divalidasi secara statistik menggunakan Welch's t-test [9] dengan 100 sampel per operasi. Hasil uji memperlihatkan:

- t-statistic: 1.680,67
- p-value: 2,25 × 10⁻²²² (sangat mencolok, jauh di bawah α = 0,05)
- Cohen's d [8]: 220,64 (effect size LARGE, melebihi ambang 0,8 secara drastis)
- Confidence Interval 95%: [98,18%, 98,23%] (sangat sempit, menunjukkan konsistensi yang tinggi)
- Cost Ratio: 55,7x (Tier C 55,7 kali lebih mahal dari Tier D)

Seluruh 215 test cases yang terdiri dari 13 test suites berhasil dilalui tanpa kegagalan, mencakup fuzz testing (256 fuzz runs per test), invariant testing (128.000 calls per invariant), edge case analysis, dan security verification (lihat BAB 4, Bagian 4.6 dan SECURITY_IMPROVEMENT_PERCENTAGE.md, Bagian 5).

## F. Relevansi Biaya Real-World

Estimasi biaya transaksi pada kondisi pasar aktual (ETH = $3.000, gas price 0,677 Gwei) memperlihatkan bahwa biaya deposit pada Tier D adalah sebesar $0,058, dibandingkan $0,208 pada Tier C. Untuk bridge dengan volume 100.000 transaksi per bulan, Tier D menghemat antara $79.000 sampai $213.000 per bulan dibandingkan Tier C, tergantung pada kondisi gas price (lihat BAB 4, Bagian 4.7).

## G. Kesimpulan Umum

Berdasarkan seluruh temuan di atas, penelitian ini menyimpulkan bahwa modifikasi EIP-1153 transient storage dari fungsi tunggal (reentrancy guard, 200 gas) menjadi multi-fungsi keamanan (9.900 gas) merupakan pendekatan yang efektif dan efisien untuk mengoptimalkan smart contract bridge. Pendekatan ini menyelesaikan tradeoff kritis antara biaya gas dan keamanan yang selama ini menjadi tantangan utama dalam desain bridge.
