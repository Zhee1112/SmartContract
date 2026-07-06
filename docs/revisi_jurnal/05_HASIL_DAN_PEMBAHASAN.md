# 3. Hasil dan pembahasan

## 3.1 Ikhtisar hasil

Penelitian ini mengembangkan empat tier arsitektur bridge untuk membuktikan bahwa modifikasi EIP-1153 (Cancun, 2024) dapat meningkatkan keamanan smart contract bridge dengan biaya gas yang terkendali ([1], [2]). Berikut adalah ringkasan hasil pengukuran dari 215 test cases ([3], [4]).

## 3.2 Hasil pengukuran gas

### 3.2.1 Gas per operasi bridge

**Tabel 1. Hasil Pengukuran Gas Rata-rata per Operasi Bridge (100 Sampel)**

| Operasi | Tier A (Baseline) | Tier B (Static) | Tier C (Rollup Full) | Tier D (Rollup Ringan) |
|---------|-------------------|-----------------|----------------------|----------------------|
| Deposit | 31,412 | 31,427 | 122,769 | 34,156 |
| Withdraw | 9,735 | 9,727 | 104,806 | 12,119 |
| Swap | 10,593 | 10,494 | 103,825 | 13,443 |
| Deploy | 413,860 | 352,921 | 886,301 | 736,064 |

Tier B (Static Only) dan Tier A (Baseline) memiliki gas yang hampir identik untuk deposit dan withdraw. Optimasi statis saja (CEI, packing, custom errors) tidak memberikan perbedaan berarti pada gas runtime. Sementara itu, Tier C (Rollup Full) memiliki gas 3.91x sampai 10.77x lebih tinggi dari Tier B karena 5-6 external calls ke MonitorMock per transaksi. Tier D (Rollup Ringan) hanya 8.7% lebih mahal dari Tier B untuk deposit, membuktikan bahwa modifikasi EIP-1153 secara inline dapat menjaga biaya gas tetap rendah.

### 3.2.2 Analisis rasio gas

**Tabel 2. Analisis Rasio Gas Antar Tier**

| Transisi | Rasio Gas | Keterangan |
|----------|----------|------------|
| A → B | 1.00x | Optimasi statis tidak mengubah gas runtime |
| B → C | 3.91x - 10.77x | External calls meningkatkan gas drastis |
| B → D | 1.09x - 1.25x | Modifikasi inline hanya menambah sedikit gas |
| C → D | 0.08x - 0.12x | Inline 8x-11x lebih murah dari external calls |

### 3.2.3 Penghematan gas Tier D vs Tier C

**Tabel 3. Perbandingan Penghematan Gas Tier D vs Tier C**

| Operasi | Tier C | Tier D | Penghematan | Persentase |
|---------|--------|--------|-------------|-----------|
| Deposit | 122,769 | 34,156 | 88,613 | **72.2%** |
| Withdraw | 104,806 | 12,119 | 92,687 | **88.4%** |
| Swap | 103,825 | 13,443 | 90,382 | **87.1%** |
| Deploy | 886,301 | 736,064 | 150,237 | **17.0%** |

Tier D menghemat 52.9% sampai 88.4% gas dibanding Tier C untuk operasi yang sama, tanpa mengorbankan fitur keamanan yang ada. Perbedaan gas yang luar biasa ini berdampak besar terhadap skalabilitas operasional bridge. Pada volume transaksi tinggi — misalnya 100.000 transaksi per bulan — akumulasi perbedaan gas menjadi sangat substansial. Tier C akan mengkonsumsi sekitar 12,28 miliar gas per bulan, sedangkan Tier D hanya 3,42 miliar gas — selisih 8,86 miliar gas. Pada harga gas 30 Gwei, selisih ini setara dengan sekitar $79.000 per bulan.

## 3.3 Hasil verifikasi keamanan

### 3.3.1 Serangan reentrancy

**Tabel 4. Hasil Pengujian Serangan Reentrancy**

| Serangan | Tier A | Tier B | Tier C | Tier D |
|----------|--------|--------|--------|--------|
| Single-function | BERHASIL | DIBLOKIR | DIBLOKIR | DIBLOKIR |
| Cross-function | BERHASIL | BERHASIL | DIBLOKIR | DIBLOKIR |
| Consecutive (3x) | BERHASIL | BERHASIL | DIBLOKIR | DIBLOKIR |
| Profit attacker | +5 ETH | 0 ETH | 0 ETH | 0 ETH |

Tier B hanya melindungi dari reentrancy single-function melalui CEI ([7]). Cross-function reentrancy masih bisa mengeksploitasi Tier B karena tidak ada runtime guard ([8]). Sementara itu, Tier C dan Tier D berhasil memblokir semua jenis reentrancy berkat EIP-1153 transient storage ([7], [16]). Mekanisme inline pada Tier D setidaknya seefektif mekanisme external pada Tier C dalam memblokir serangan reentrancy, namun dengan biaya yang jauh lebih rendah dan tanpa memperluas attack surface.

### 3.3.2 Deteksi MEV sandwich

**Tabel 5. Hasil Deteksi MEV Sandwich Attack**

| Aspek | Tier A | Tier B | Tier C | Tier D |
|-------|--------|--------|--------|--------|
| Deteksi frontrun | Tidak ada | Tidak ada | txRecords array | LastTx single-slot |
| Pola sandwich | Tidak terdeteksi | Tidak terdeteksi | Terdeteksi | Terdeteksi |
| Penalty diterapkan | Tidak ada | Tidak ada | Ya | Ya |
| Cross-block false positive | N/A | N/A | Tidak (correct) | Tidak (correct) |

Perbedaan mencolok terlihat pada mekanisme penyimpanan: Tier C menggunakan dynamic array `txRecords[]` yang memerlukan SSTORE sebesar 22,100 gas per push. Tier D menggantinya dengan single-slot `LastTx` struct yang hanya memerlukan 2,900 gas (warm write) ([9]).

### 3.3.3 Emergency pause

**Tabel 6. Hasil Pengujian Emergency Pause**

| Aspek | Tier C | Tier D |
|-------|--------|--------|
| Pause tersedia | Ya | Ya |
| Deposit revert saat pause | Ya | Ya |
| Withdraw revert saat pause | Ya | Ya |
| Swap revert saat pause | Ya | Ya |
| Berfungsi setelah unpause | Ya | Ya |
| Balance terjaga | Ya | Ya |

Kedua Tier C dan Tier D memiliki emergency pause yang berfungsi identik.

## 3.4 Hasil analisis cost-effectiveness

### 3.4.1 Security Points per Gas (SPG)

**Tabel 7. Perbandingan Cost-effectiveness (SPG)**

| Tier | Skor Keamanan | Gas (Deposit) | SPG (×1,000,000) | Ranking |
|------|--------------|---------------|-------------------|---------|
| A | 0/8 | 31,412 | 0 | 4 |
| B | 4/8 | 31,427 | 127 | 2 |
| C | 8/8 | 122,769 | 65 | 3 |
| **D** | **8/8** | **34,156** | **205** | **1** |

Tier D memiliki cost-effectiveness terbaik (205 SPG), 3.15x lebih efisien dari Tier C (65 SPG). Artinya, untuk setiap satu juta gas yang dihabiskan, Tier D memberikan 205 unit keamanan, sedangkan Tier C hanya 65 unit. Disparitas ini terutama disebabkan oleh biaya gas yang jauh lebih rendah pada Tier D (34.156 vs 122.769) dengan skor keamanan yang sama (8/8).

### 3.4.2 Biaya per fitur keamanan tambahan

**Tabel 8. Biaya per Fitur Keamanan Tambahan**

| Transisi | Fitur Tambahan | Gas Tambahan | Biaya per Fitur |
|----------|---------------|-------------|-----------------|
| A → B | 4 fitur | +15 | 3.75 gas/fitur |
| B → D | 3 fitur | +2,729 | 909.7 gas/fitur |
| D → C | 1 fitur | +88,613 | 88,613 gas/fitur |

Transisi B → D hanya memerlukan 909.7 gas per fitur keamanan tambahan — biaya yang sangat rendah untuk tiga fitur keamanan kritis. Sebaliknya, transisi D → C tidak menambah fitur keamanan apapun (keduanya 8/8) namun memerlukan tambahan 88.613 gas. Perbandingan ini mengungkapkan sebuah ironi desain: **Tier C membayar 97.4x lebih mahal untuk fitur yang sama dengan Tier D**.

## 3.5 Hasil modifikasi EIP-1153

### 3.5.1 Perbandingan implementasi EIP-1153

**Tabel 9. Perbandingan Implementasi EIP-1153**

| Pendekatan | Fungsi Keamanan | Gas Total | External Calls |
|-----------|----------------|-----------|----------------|
| EIP-1153 asli (reentrancy only) | 1 | 200 | 0 |
| Tier C (via MonitorMock) | 5 | ~74,100 | 5-6 per tx |
| **Tier D (modifikasi inline)** | **5** | **~9,900** | **0** |

Modifikasi ini merepresentasikan pergeseran paradigma: dari EIP-1153 sebagai **mekanisme tunggal** menjadi **platform keamanan** yang dapat mendukung berbagai fungsi pertahanan.

### 3.5.2 Rincian modifikasi EIP-1153 pada Tier D

**Tabel 10. Rincian Modifikasi EIP-1153 pada Tier D**

| Modifikasi | Fungsi | Gas | Mekanisme |
|-----------|--------|-----|-----------|
| TSTORE/TLOAD Reentrancy Guard | Proteksi reentrancy | 200 | _enterCall() + _callDepth() + _exitCall() |
| Single-slot MEV Detection | Deteksi sandwich | 4,400 | lastTx.sender + lastTx.txType di 1 slot |
| Block Number Tracking | Batas waktu deteksi | 2,100 | lastTxBlock SLOAD + comparison |
| Inline Penalty Calculation | Deterrence ekonomi | 300 | Pure math: (amount × lambda × score) / 1e8 |
| Emergency Pause | Emergency stop | 2,900 | SSTORE paused flag |

Total biaya lima modifikasi ini adalah ~9.900 gas — **48.5x lebih murah** dari Tier C yang mengimplementasikan fungsi yang sama melalui external calls ke MonitorMock.

## 3.6 Hasil analisis statistik

### 3.6.1 Welch's t-test (Tier C vs Tier D)

**Tabel 11. Hasil Uji Statistik Welch's t-test (Tier C vs Tier D)**

| Metric | Nilai | Interpretasi |
|--------|-------|-------------|
| t-statistic | 1680.67 | Perbedaan sangat besar |
| p-value | 2.25 × 10⁻²²² | Sangat signifikan (p << 0.05) |
| Cohen's d | 220.64 | Effect size LARGE ([12]) |
| 95% CI | [98.18%, 98.23%] | Sangat sempit → konsisten |
| Cost Ratio | 55.7x | Tier C 55.7x lebih mahal |

Perbedaan gas antara Tier C dan Tier D sangat mencolok secara statistik, dengan confidence interval yang sangat sempit. H₀ (tidak ada perbedaan signifikan) ditolak dengan tingkat keyakinan yang sangat tinggi.

## 3.7 Pembahasan static vs dynamic

### 3.7.1 Mengapa keduanya diperlukan

Hasil penelitian memperlihatkan bahwa **optimasi statis dan dinamis saling melengkapi, bukan saling menggantikan**. Tier B (hanya statis) mencapai gas rendah (31.427) namun hanya 2/8 skor keamanan. Tier D (statis + dinamis inline) mencapai gas yang hampir identik (34.156, hanya 8.7% lebih tinggi) namun 8/8 skor keamanan. Perbedaan biaya hanya 2.729 gas untuk peningkatan keamanan sebesar 100%.

### 3.7.2 Tier B: 25% keamanan — terlalu rendah untuk produksi

Tier B mencapai gas yang paling rendah (31.427 untuk deposit) namun hanya 2/8 fitur keamanan. Serangan yang **tidak** dapat diblokir oleh Tier B meliputi cross-function reentrancy, consecutive reentrancy, MEV sandwich attack, dan emergency response. Pada bridge production yang menyimpan dana pengguna dalam jumlah besar, 25% keamanan merupakan tingkat yang **tidak dapat diterima**. Data dari [4] dan [12] mengungkapkan bahwa kerugian akibat eksploitasi bridge telah mencapai miliaran dolar — termasuk Ronin ($620 juta), Wormhole ($320 juta), dan Nomad ($190 juta).

### 3.7.3 Tier D: keseimbangan optimal

Tier D membuktikan bahwa keseimbangan optimal antara gas cost dan keamanan dapat dicapai dengan menggabungkan optimasi statis dan dinamis secara inline. Gas tambahan yang diperlukan hanya 2.729 gas (8.7% dari Tier B) untuk menambah 6 fitur keamanan tambahan. Biaya per fitur keamanan tambahan (909.7 gas/fitur) merupakan investasi yang sangat efisien — 97.4x lebih murah dari Tier C.

## 3.8 Perbandingan dengan studi terdahulu

**Tabel 12. Perbandingan Komprehensif dengan Bridge Existing**

| Aspek | Hop | Stargate | Ronin | Wormhole | Tier D |
|-------|-----|----------|-------|----------|--------|
| EIP-1153 | Tidak | Tidak | Tidak | Tidak | **Ya (inline)** |
| MEV Protection | Tidak | Rate limiting | Tidak | Tidak | **On-chain detection** |
| Emergency Pause | Guardian | Guardian | Multisig | Guardian | **Admin (instant)** |
| Reentrancy Guard | CEI | CEI | CEI | CEI | **EIP-1153 inline** |
| External Calls | Multiple | Multiple | Multiple | Multiple | **0** |
| Economic Penalty | Bond | Rate limiting | Tidak | Tidak | **On-chain formula** |

Perbandingan ini memperlihatkan bahwa Tier D menawarkan kombinasi fitur keamanan yang belum tersedia pada bridge existing: EIP-1153 inline, on-chain MEV detection, dan economic penalty — semuanya dengan 0 external calls.

## 3.9 Analisis mekanisme penalty

Formula penalti pada Tier C dan Tier D menggunakan formula yang identik:

```
Penalty = Amount × (λ × P_detect) / 100.000.000
```

Dengan λ = 15.000 dan P_detect = 9.600, penalty rate = 14,4% dari total amount.

**Kelebihan:** Deterren ekonomi (attacker rugi 14,4% per serangan), tidak revert transaksi, proporsional dengan amount, auto-reset oleh EIP-1153, biaya rendah (300 gas di Tier D), dan bisa dikonfigurasi admin.

**Kekurangan:** False positive (transaksi legit bisa kena penalty), deteksi sederhana (hanya pola Ta1 → Tv), hanya 1 slot history, tidak ada mekanisme rollback/appeal, fixed rate, bergantung pada off-chain service, dan admin centralization.

## 3.10 Keterbatasan penelitian

Penelitian ini memiliki beberapa keterbatasan yang perlu diakui. Pertama, semua hasil pengukuran diperoleh dari environment Foundry yang terisolasi — kondisi jaringan Ethereum yang sesungguhnya memiliki kompleksitas yang jauh lebih tinggi. Kedua, deteksi MEV sandwich pada Tier D hanya mengenali pola Ta1 → Tv dalam satu blok; pola yang lebih kompleks belum terdeteksi. Ketiga, penelitian tidak menguji serangan flash loan sandwich. Keempat, parameter P_DETECT dan LAMBDA ditetapkan secara statis. Kelima, seluruh pengujian dilakukan pada satu EVM-compatible chain. Keenam, belum ada audit keamanan profesional. Ketujuh, belum ada pengujian dengan MEV bot nyata di production.
