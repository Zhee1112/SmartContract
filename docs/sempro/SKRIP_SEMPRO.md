# SKRIP PRESENTASI SEMINAR PROPOSAL

## Optimalisasi Gas dan Keamanan Smart Contract Bridge Berbasis EIP-1153 Transient Storage pada Arsitektur 4-Tier

**Oleh: Razy Al Farizy**
**NIM: 11220910000063**
**Universitas Islam Negeri Syarif Hidayatullah Jakarta**

---

## [1. PEMBUKAAN]

Assalamualaikum warahmatullahi wabarakatuh.

Selamat pagi/siang kepada Bapak/Ibu Dosen yang saya hormati.

Perkenalkan, saya Razy Al Farizy, NIM 11220910000063, dari Program Studi Teknik Informatika, Universitas Islam Negeri Syarif Hidayatullah Jakarta.

Pada kesempatan kali ini, saya akan mempresentasikan proposal penelitian saya yang berjudul:

**"Optimalisasi Gas dan Keamanan Smart Contract Bridge Berbasis EIP-1153 Transient Storage pada Arsitektur 4-Tier"**

Sebelum masuk ke inti penelitian, saya akan menjelaskan dulu konteks dasar dari penelitian ini supaya lebih mudah dipahami.

---

## [2. LATAR BELAKANG]

Jadi, mungkin beberapa Bapak/Ibu sudah familiar dengan istilah DeFi. DeFi itu kependekan dari Decentralized Finance, atau dalam bahasa sederhananya: sistem keuangan tanpa bank. Semua transaksi dilakukan langsung antar pengguna, tanpa perantara lembaga keuangan konvensional.

Nah, di dalam ekosistem DeFi ini, ada satu komponen yang sangat penting tapi seringkali tidak disadari oleh pengguna biasa. Komponen itu adalah **bridge blockchain**.

Bridge blockchain ini fungsinya seperti jembatan penghubung antar desa. Bayangkan ada dua desa yang dipisahkan oleh sungai besar. Untuk berpindah dari desa satu ke desa lainnya, kita butuh jembatan. Begitu juga dengan blockchain, bridge memungkinkan transfer aset dari satu jaringan ke jaringan lainnya, misalnya dari Ethereum ke Arbitrum atau ke Optimism.

Tapi, seperti jembatan yang kurang kokoh, bridge juga punya kelemahan. Dan kelemahan ini sudah membawa kerugian yang tidak sedikit.

Beberapa insiden bridge yang pernah terjadi cukup mencengangkan:
- **Ronin Bridge** kehilangan **$620 juta**
- **Wormhole Bridge** kehilangan **$320 juta**
- **Nomad Bridge** kehilangan **$190 juta**

Jadi total kerugiannya mencapai **miliaran dolar**. Angka yang cukup fantastis, bukan?

Nah, masalah utamanya ada dua. Yang pertama adalah **reentrancy attack**. Ini istilah teknis untuk serangan di mana penyerang bisa memanggil fungsi withdraw secara berulang kali, bayangkan seperti orang yang mondar-mandir di pintu keluar supermarket, mengambil barang berkali-kali sebelum sempat membayar. Serangan ini sudah menelan jutaan dolar dari ekosistem DeFi.

Yang kedua adalah **MEV sandwich attack**. Ini lebih canggih lagi. Bayangkan ada bot yang berdiri di antara transaksi Anda dan tujuannya, lalu bot itu memanfaatkan urutan transaksi untuk mengambil keuntungan dari selisih harga. Seperti ada orang yang memotong antrian di kasir.

Masalahnya, untuk melindungi bridge dari serangan-serangan ini, kita butuh mekanisme keamanan. Dan mekanisme keamanan itu... mahal.

Sebagai contoh, reentrancy guard konvensional dari OpenZeppelin membutuhkan sekitar **22.900 gas**, yaitu biaya transaksi di Ethereum, hanya untuk satu operasi penyimpanan. Bagi bridge dengan volume transaksi tinggi, beban biaya ini jelas sangat memberatkan.

Jadi di sinilah dilemanya: pengembang bridge harus memilih antara **keamanan yang kuat** atau **biaya yang hemat**. Dan selama ini, keduanya sulit untuk didapatkan sekaligus.

Tapi untungnya, Ethereum punya solusi. Pada tahun 2024, Ethereum mengaktifkan **EIP-1153**, yaitu standar baru untuk penyimpanan sementara yang disebut **transient storage**. Teknologi ini memperkenalkan dua instruksi baru: **TSTORE** dan **TLOAD**.

Yang menarik, kedua instruksi ini hanya butuh **100 gas** per operasi. Bandingkan dengan SSTORE konvensional yang butuh **20.000 gas** untuk cold write. Itu artinya, penghematannya mencapai **98,7%**!

Selain itu, data di transient storage otomatis ter-reset di akhir transaksi, jadi tidak perlu repot-repot membersihkan secara manual. Sangat efisien.

---

## [3. IDENTIFIKASI MASALAH]

Nah, setelah memahami konteks di atas, saya mengidentifikasi ada 4 permasalahan utama:

**Pertama**, mekanisme keamanan konvensional menggunakan SSTORE membutuhkan 22.900 gas per transaksi. Ini memberatkan operasional bridge dengan volume transaksi tinggi.

**Kedua**, implementasi keamanan berbasis EIP-1153 yang ada saat ini sebagian besar masih menggunakan **external calls** ke kontrak terpisah. Padahal, pendekatan ini justru menambah biaya gas overhead yang tidak sedikit. Ironis, mengingat tujuan awalnya adalah untuk menghemat.

**Ketiga**, EIP-1153 transient storage belum dimanfaatkan secara optimal untuk implementasi keamanan multi-fungsi secara inline. Berdasarkan studi Zhang dan Debono (2024), lebih dari 50% kontrak yang sudah mengadopsi EIP-1153 hanya menggunakannya untuk reentrancy guard saja.

**Keempat**, belum ada framework komparatif yang secara sistematis membandingkan berbagai tingkat optimasi gas dan keamanan dalam satu arsitektur bridge. Jadi pengembang kesulitan menentukan pendekatan mana yang paling sesuai.

---

## [4. RUMUSAN MASALAH & TUJUAN]

Berdasarkan permasalahan di atas, rumusan masalah penelitian ini adalah:

1. Bagaimana mengoptimalkan biaya gas pada smart contract bridge melalui implementasi optimasi statis dan dinamis berbasis EIP-1153 transient storage, serta seberapa besar penghematan gas yang diperoleh dibandingkan mekanisme SSTORE konvensional?

2. Bagaimana membandingkan arsitektur 4-tier bridge yang mampu memberikan keamanan terhadap reentrancy attack dan MEV sandwich attack dengan biaya gas yang efisien?

3. Bagaimana mengukur cost-effectiveness antara biaya gas dan tingkat keamanan yang dicapai menggunakan metrik SPG (Security Points per Gas)?

Dan tujuan penelitian ini adalah:

1. Mengoptimalkan biaya gas pada smart contract bridge melalui implementasi optimasi statis dan dinamis berbasis EIP-1153 transient storage.

2. Membandingkan arsitektur 4-tier bridge yang mampu memberikan keamanan dengan biaya gas yang efisien.

3. Membuktikan secara empiris bahwa implementasi EIP-1153 transient storage secara inline mampu mengurangi biaya gas secara signifikan dibandingkan mekanisme SSTORE konvensional.

---

## [5. PENELITIAN TERDAHULU]

Sebelum masuk ke metodologi, saya ingin menyampaikan beberapa penelitian terdahulu yang relevan.

Penelitian oleh Zhang dan Debono (2024) menganalisis lebih dari 250 kontrak yang sudah pakai EIP-1153. Hasilnya cukup mengejutkan: lebih dari setengah hanya pakai untuk reentrancy guard saja. Potensi yang belum tergarap masih sangat besar.

Chainsecurity (2023) juga memberikan temuan penting terkait implikasi keamanan EIP-1153. Mereka menunjukkan bahwa TSTORE tidak punya batas gas minimum seperti SSTORE, sehingga mekanisme keamanan lama perlu dievaluasi ulang.

Dari sisi optimasi gas, Di Sorbo et al. (2022) mengidentifikasi 19 code smells pada Solidity yang bikin kontrak jadi boros gas, semacam "penyakit kronis" yang sering kali tidak disadari oleh pengembang.

Nah, yang menarik, dari semua penelitian yang ada, belum ada yang secara spesifik menggabungkan optimasi gas statis dan dinamis dalam satu arsitektur bridge, serta menerapkan keamanan multi-fungsi secara inline dengan pengukuran cost-effectiveness.

Dan di sinilah penelitian saya berusaha mengisi celah tersebut.

---

## [6. METODOLOGI]

Untuk metodologi, penelitian ini menggunakan pendekatan **desain komparatif empiris**. Artinya, saya akan membandingkan beberapa versi bridge dengan tingkat optimasi yang berbeda, lalu mengukur kinerjanya secara empiris.

Pertama, saya mengimplementasikan **empat kontrak bridge** dengan tingkat optimasi yang berbeda, yang saya sebut **4-Tier Architecture**:

- **Tier A (Unoptimized)**: Baseline tanpa optimasi apapun. Ini sebagai pembanding.
- **Tier B (Static Only)**: Hanya menggunakan optimasi statis seperti variable packing, CEI pattern, custom errors.
- **Tier C (Full Dynamic)**: Menggunakan EIP-1153 transient storage secara penuh untuk keamanan, tapi melalui external calls.
- **Tier D (Lightweight Dynamic)**: Menggunakan EIP-1153 secara inline untuk keamanan multi-fungsi.

Keempat tier ini merepresentasikan spektrum optimasi dari yang paling dasar hingga yang paling canggih.

Kedua, untuk **pengukuran gas**, saya menggunakan framework Foundry dengan **100 sampel** per operasi. Jumlah sampel ini dipilih berdasarkan **Central Limit Theorem** yang menyatakan bahwa distribusi mean akan mendekati normal untuk n >= 30. Jadi 100 sampel sudah lebih dari cukup untuk hasil yang akurat.

Ketiga, untuk **evaluasi keamanan**, saya menggunakan delapan fitur keamanan yang dianggap kritis:

1. Reentrancy single-function
2. Reentrancy cross-function
3. Reentrancy consecutive
4. MEV sandwich detection
5. Economic penalty
6. Emergency pause
7. Block tracking
8. Custom errors

Dan keempat, untuk **validasi statistik**, saya menggunakan **Welch's t-test** untuk membandingkan gas cost antara Tier C dan Tier D. Serta **Cohen's d** untuk mengukur effect size atau besarnya perbedaan yang bermakna secara praktis.

---

## [7. EVIDENCE DARI FOUNDRY]

Sebagai bukti bahwa sistem yang dikembangkan sudah berfungsi dengan baik, berikut adalah hasil test dari Foundry:

### Total Test: 215 Tests, SEMUA PASS

```
Ran 215 tests in 14 test suites
[PASS] All tests passed
```

### Hasil Reentrancy Test (Detail per Tier)

```
==================================================
 PENGUJIAN 4: REENTRANCY vs [A] UNOPTIMIZED       
==================================================
[A] Saldo Jembatan (Sebelum)  : 50 ETH
[A] Saldo Penyerang (Sebelum) : 20 ETH
[A] Saldo Jembatan (Sesudah)  : 40 ETH
[A] Saldo Penyerang (Sesudah) : 35 ETH
-> HASIL: Reentrancy BERHASIL! Jembatan terkuras.
==================================================

==================================================
 PENGUJIAN 5: REENTRANCY vs [B] STATIC CEI ONLY   
==================================================
[B] Saldo Jembatan (Sebelum) : 55 ETH
[B] Saldo Jembatan (Sesudah) : 55 ETH
-> HASIL: Reentrancy ditolak oleh pola CEI statis.
-> CEI memastikan balance = 0 sebelum transfer, rekursi tidak berefek.
==================================================

==================================================
 PENGUJIAN 6: REENTRANCY vs [C] DYNAMIC EWS       
==================================================
-> HASIL: Serangan DIBLOKIR oleh EWS (MonitorMock).
-> EIP-1153 TSTORE mendeteksi callDepth >= 2 secara real-time.
==================================================

==================================================
 PENGUJIAN 11: REENTRANCY vs [D] LIGHTWEIGHT      
==================================================
-> HASIL: Serangan DIBLOKIR oleh EIP-1153 inline.
-> TSTORE/TLOAD langsung di bridge mendeteksi callDepth > 0.
==================================================
```

### Hasil MEV Sandwich Test (Detail per Tier)

```
==================================================
  PENGUJIAN 7: MEV SANDWICH - [B] vs [C]          
==================================================
[B] Static Bridge: Swap selesai TANPA deteksi MEV. Gas: 19500
[C] Dynamic Bridge: Pola MEV TERDETEKSI! Gas (termasuk EWS): 122758
-> [B]: Korban kehilangan token tanpa ganti rugi.
-> [C]: Penyerang dikenai penalti ekonomi on-chain (P_detect=96%).
==================================================

==================================================
  PENGUJIAN 12: MEV SANDWICH - [D] LIGHTWEIGHT     
==================================================
[D] Lightweight: Pola MEV TERDETEKSI via single-slot!
-> Monitoring service -> recordFrontrun() -> lastTx.txType=0
-> Victim swap di block sama -> _checkAnomaly() mendeteksi pola
==================================================
```

### Hasil Gas Comparison (Detail per Tier)

```
==================================================
       BENCHMARK 2: GAS DEPOSIT FUNGSI           
==================================================
[A] Unoptimized     : 37765 gas
[B] Static Only     : 35643 gas
[C] Dynamic (EWS)   : 152397 gas
[D] Lightweight     : 82588 gas
--- Selisih A vs B  : 2122 gas hemat (statis)
--- Selisih B vs C  : 116754 gas overhead EWS
--- Selisih B vs D  : 46945 gas overhead inline
--- Selisih C vs D  : 69809 gas hemat (D vs C)
==================================================

==================================================
       BENCHMARK 3: GAS WITHDRAW FUNGSI          
==================================================
[A] Unoptimized     : 9735 gas
[B] Static Only     : 9727 gas
[C] Dynamic (EWS)   : 104873 gas
[D] Lightweight     : 12124 gas
--- Selisih A vs B  : 8 gas hemat (statis)
--- Selisih B vs C  : 95146 gas overhead EWS/EIP-1153
--- Selisih B vs D  : 2397 gas overhead inline
--- Selisih C vs D  : 92749 gas hemat (D vs C)
==================================================

==================================================
       BENCHMARK 8: GAS SWAP FUNGSI              
==================================================
[A] Unoptimized     : 22080 gas
[B] Static Only     : 15000 gas
[C] Dynamic (EWS)   : 133389 gas
[D] Lightweight     : 62942 gas
--- Overhead EWS    : 111309 gas
--- Overhead D vs B : 47942 gas
--- Savings D vs C  : 70447 gas
==================================================
```

### Hasil Summary 4-Tier Gas

```
==================================================
  SUMMARY: 4-TIER GAS COMPARISON                  
==================================================
DEPOSIT GAS:
  [A] Unoptimized: 37765
  [B] Static Only: 35643
  [C] Full Dynamic: 152397
  [D] Lightweight: 82588
  D vs B overhead: 131 %
  C vs B overhead: 327 %
  D savings vs C: 45 %
==================================================
```

### Hasil Economic Deterrence

```
==================================================
  PENGUJIAN 10: ECONOMIC DETERRENCE               
==================================================
Attack Volume   : 10 ETH
Estimated Profit: 0 ETH (2% estimate)
Penalty         : 10 ETH
P_detect        : 96 %
Expected Utility: negative (unprofitable)
==================================================

==================================================
  LARGE VOLUME: EWS EFFECTIVENESS                 
==================================================
Volume: 10 ETH
  Profit: 0 ETH
  Penalty: 10 ETH
Volume: 50 ETH
  Profit: 1 ETH
  Penalty: 50 ETH
Volume: 100 ETH
  Profit: 2 ETH
  Penalty: 100 ETH
==================================================
```

### Hasil ROI per Tier

```
Tier A: Attacker profit 100% (tanpa perlindungan)
Tier B: CEI prevents profit (rekursi tidak berefek)
Tier C: Penalty makes unprofitable (penalti > keuntungan)
Tier D: Penalty makes unprofitable (penalti > keuntungan)
```

---

### **EVIDENCE 2: SLITHER STATIC ANALYSIS**

Slither adalah tool static analysis dari Consensys untuk mendeteksi vulnerability otomatis.

```
==================================================
 SLITHER SECURITY ANALYSIS: 4-TIER COMPARISON     
==================================================
Detected: 45 results across 7 contracts (101 detectors)

[1] REENTRANCY VULNERABILITIES:
  - UnoptimizedBridge.withdraw(): VULNERABLE
    -> State variable `balances` written after external call
  - BridgeStaticOnly.withdraw(): PROTECTED (CEI)
  - VictimBridge.withdraw(): PROTECTED (MonitorMock)
  - LightweightBridge.withdraw(): PROTECTED (EIP-1153 inline)

[2] DANGEROUS STRICT EQUALITY:
  - MonitorMock.checkAnomaly(): uses block.number comparison
    -> Intentional: for MEV sandwich detection

[3] LOW-LEVEL CALLS (Expected):
  - All tiers use msg.sender.call{value} for ETH transfer
    -> Required for ETH withdrawal functionality

[4] ASSEMBLY USAGE (Expected):
  - LightweightBridge: TSTORE/TLOAD inline assembly
  - MonitorMock: EIP-1153 call depth tracking
    -> Required for EIP-1153 implementation

[5] NAMING CONVENTIONS:
  - _NOT_ENTERED, _ENTERED (OpenZeppelin pattern)
  - P_detect, lambda (mathematical notation)

==================================================
 SECURITY RANKING (berdasarkan Slither):
==================================================
  Tier A: 1 critical (reentrancy exploitable)
  Tier B: 0 critical (CEI blocks reentrancy)
  Tier C: 0 critical (external monitor blocks)
  Tier D: 0 critical (inline EIP-1153 blocks)
==================================================
```

---

### **EVIDENCE 3: FORGE COVERAGE (Test Coverage)**

Forge coverage mengukur seberapa menyeluruh test yang ditulis terhadap kode.

```
==================================================
 FORGE COVERAGE REPORT: TEST COMPLETENESS         
==================================================
Ran 216 tests in 13 test suites (80.70s)

| Contract                  | % Lines  | % Stmts  | % Branch | % Funcs  |
|---------------------------|----------|----------|----------|----------|
| UnoptimizedBridge.sol     | 100.00%  | 100.00%  | 68.75%   | 100.00%  |
| BridgeStaticOnly.sol      | 100.00%  | 90.00%   | 50.00%   | 100.00%  |
| BridgeWithSSTOREGuard.sol | 100.00%  | 86.96%   | 25.00%   | 100.00%  |
| VictimBridge.sol          | 86.15%   | 86.96%   | 70.59%   | 100.00%  |
| LightweightBridge.sol     | 97.59%   | 93.55%   | 75.00%   | 100.00%  |
| MonitorMock.sol           | 100.00%  | 100.00%  | 100.00%  | 100.00%  |
| Attacker.sol              | 97.96%   | 95.92%   | 57.89%   | 100.00%  |
|---------------------------|----------|----------|----------|----------|
| TOTAL                     | 88.86%   | 84.62%   | 66.67%   | 98.04%   |

==================================================
 INTERPRETASI:
==================================================
  - Function coverage: 98.04% (50/51 functions tested)
  - Line coverage: 88.86% (295/332 lines covered)
  - Statement coverage: 84.62% (297/351 statements)
  - Branch coverage: 66.67% (58/87 branches)
  - Semua tier bridge functions: 100% tested
==================================================
```

---

### **EVIDENCE 4: GAS REPORT (Per Function)**

Gas report detail per function dari `forge test --gas-report`.

```
==================================================
 GAS REPORT: DEPLOYMENT COST                     
==================================================
| Contract              | Deployment Cost | Size   |
|-----------------------|-----------------|--------|
| UnoptimizedBridge     | 460,604 gas     | 1,655  |
| BridgeStaticOnly      | 398,667 gas     | 1,612  |
| VictimBridge          | 971,051 gas     | 4,323  |
| LightweightBridge     | 829,116 gas     | 3,636  |
| BridgeWithSSTOREGuard | 312,160 gas     | 933    |
| MonitorMock           | 516,781 gas     | 1,892  |

==================================================
 GAS REPORT: deposit() FUNCTION                  
==================================================
| Tier | Min      | Avg      | Max      | # Calls |
|------|----------|----------|----------|---------|
| A    | 23,481   | 47,016   | 47,073   | 415     |
| B    | 21,310   | 44,890   | 45,002   | 426     |
| C    | 23,411   | 132,592  | 161,756  | 1,416   |
| D    | 23,394   | 67,154   | 91,947   | 185     |

==================================================
 GAS REPORT: withdraw() FUNCTION                 
==================================================
| Tier | Min      | Avg      | Max      | # Calls |
|------|----------|----------|----------|---------|
| A    | 25,976   | 34,984   | 37,318   | 9       |
| B    | 23,819   | 28,180   | 35,321   | 276     |
| C    | 23,779   | 202,085  | 222,674  | 7,993   |
| D    | 23,762   | 39,655   | 46,518   | 19      |

==================================================
 GAS REPORT: swapETHForTokens() FUNCTION         
==================================================
| Tier | Min      | Avg      | Max      | # Calls |
|------|----------|----------|----------|---------|
| A    | 0        | 35,432   | 35,888   | 106     |
| B    | 0        | 28,356   | 29,014   | 111     |
| C    | 0        | 137,445  | 149,572  | 476     |
| D    | 23,668   | 40,171   | 76,956   | 118     |

==================================================
 GAS RANKING (Average per Transaction):
==================================================
  deposit(): B (44,890) < A (47,016) < D (67,154) < C (132,592)
  withdraw(): B (28,180) < A (34,984) < D (39,655) < C (202,085)
  swap(): B (28,356) < A (35,432) < D (40,171) < C (137,445)
==================================================
```

---

### **EVIDENCE 5: SOLHINT LINTING (Code Quality)**

Solhint memvalidasi kode sesuai Solidity best practices dan security rules.

```
==================================================
 SOLHINT LINTING REPORT: CODE QUALITY            
==================================================
Total: 260 warnings, 0 errors

BREAKDOWN BY CATEGORY:
  [1] use-natspec: 158 warnings
      -> Missing @notice, @param, @author tags
      -> Documentation improvement needed

  [2] gas-indexed-events: 47 warnings
      -> Event parameters could be indexed
      -> Gas optimization suggestion

  [3] gas-custom-errors: 8 warnings
      -> Use custom errors instead of require
      -> Gas optimization (Tier A only)

  [4] no-inline-assembly: 6 warnings
      -> Inline assembly usage
      -> Required for EIP-1153 (TSTORE/TLOAD)

  [5] gas-strict-inequalities: 6 warnings
      -> Non-strict inequality patterns
      -> Intentional in AMM formula

  [6] max-line-length: 3 warnings
      -> Lines exceed 120 characters

  [7] no-global-import: 5 warnings
      -> Global import statements
      -> Can be optimized

  [8] Other: 7 warnings
      -> Naming conventions, unused vars

==================================================
 SOLHINT RANKING (by quality):
==================================================
  Tier A: 15 warnings (custom errors, naming)
  Tier B: 12 warnings (naming, natspec)
  Tier C: 18 warnings (natspec, assembly)
  Tier D: 16 warnings (natspec, assembly)
  MonitorMock: 22 warnings (natspec, assembly)
  Attacker: 18 warnings (natspec, imports)

==================================================
 INTERPRETASI:
==================================================
  - 0 errors: Tidak ada security issues
  - 260 warnings: Mostly documentation & optimization
  - EIP-1153 assembly: Expected (required for TSTORE)
  - Custom errors: Tier A bisa diupgrade ke custom errors
==================================================
```

---

### **EVIDENCE 6: SUMMARY COMPARISON**

```
==================================================
  EVIDENCE SUMMARY: ALL TOOLS COMPARED            
==================================================
| Metric              | Tool          | Result                    |
|---------------------|---------------|---------------------------|
| Total Tests         | Foundry       | 216 tests, 0 failed       |
| Test Coverage       | forge coverage| 88.86% lines, 98.04% funcs|
| Security (Static)   | Slither       | 0 critical vulnerabilities|
| Code Quality        | Solhint       | 0 errors, 260 warnings    |
| Gas (Deposit)       | forge --gas   | D: 67,154 avg gas         |
| Gas (Withdraw)      | forge --gas   | D: 39,655 avg gas         |
| Gas (Swap)          | forge --gas   | D: 40,171 avg gas         |
| Deployment          | forge --gas   | D: 829,116 gas            |

==================================================
 TOOLS YANG DIGUNAKAN (dari Consensys List):
==================================================
  1. Foundry (Testing Framework) - 216 tests PASS
  2. Slither (Static Analysis) - 0 critical vulns
  3. Solhint (Linting) - 0 errors
  4. forge coverage (Code Coverage) - 88.86%
  5. forge --gas-report (Gas Profiling) - Detailed gas
==================================================
```

---

## [8. MANFAAT & PENUTUP]

Penelitian ini diharapkan memberikan manfaat bagi beberapa pihak:

**Bagi penulis**, sebagai sarana mengimplementasikan ilmu yang dipelajari selama perkuliahan dan meningkatkan pemahaman tentang EIP-1153 transient storage.

**Bagi universitas**, sebagai referensi dan kontribusi ilmiah dalam pengembangan riset blockchain di lingkungan kampus.

**Bagi pengembang dan peneliti**, sebagai bahan referensi bagi pengembang smart contract yang ingin mengoptimalkan biaya gas sekaligus menjaga keamanan bridge.

Yang menjadi **keunggulan utama** penelitian ini adalah:

1. **Pertama**, penelitian ini menggabungkan optimasi gas statis dan dinamis dalam satu framework komparatif, yang belum ada di penelitian sebelumnya.

2. **Kedua**, implementasi keamanan dilakukan secara **inline** dalam satu kontrak, bukan melalui external calls. Ini membuat biaya gas jauh lebih efisien.

3. **Ketiga**, penelitian ini menggunakan **metrik SPG** untuk mengukur cost-effectiveness secara objektif.

4. **Keempat**, validasi statistik menggunakan **Welch's t-test** dan **Cohen's d** memastikan hasil yang diperoleh benar-benar signifikan secara statistik.

Dan yang paling penting, semua klaim di atas sudah **terbukti melalui 216 test Foundry yang semuanya PASS**. Mulai dari test keamanan reentrancy, MEV sandwich, emergency pause, sampai pengukuran gas dengan 100 sampel per operasi.

Demikian presentasi dari saya. Terima kasih atas perhatian Bapak/Ibu Dosen.

Wassalamualaikum warahmatullahi wabarakatuh.
