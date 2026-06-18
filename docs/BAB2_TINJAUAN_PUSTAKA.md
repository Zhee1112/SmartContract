# BAB 2: TINJAUAN PUSTAKA

Bab ini memaparkan konsep-konsep dasar yang menjadi landasan teoretis penelitian, meliputi arsitektur Ethereum dan Ethereum Virtual Machine (EVM), mekanisme keamanan smart contract, optimasi gas, EIP-1153 Transient Storage, Maximal Extractable Value (MEV), serta EIP-4844 Proto-Danksharding. Tinjauan pustaka ini dirancang untuk memberikan fondasi pemahaman yang komprehensif terhadap komponen-komponen yang diintegrasikan dalam arsitektur bridge yang diusulkan.

## 2.1 Arsitektur Ethereum dan Ethereum Virtual Machine (EVM)

### 2.1.1 Fondasi Ethereum

Ethereum merupakan platform blockchain generasi kedua yang memperkenalkan kontrak pintar (*smart contract*) sebagai instrumen eksekusi otomatis berbasis kondisi yang telah ditentukan sebelumnya (Buterin, 2014). Berbeda dengan Bitcoin yang dirancang secara spesifik sebagai sistem uang digital terdesentralisasi, Ethereum menyediakan lingkungan komputasional universal yang memungkinkan pengembang membangun aplikasi terdesentralisasi (*decentralized applications*/dApps) dengan berbagai fungsi logika bisnis.

Arsitektur Ethereum terdiri dari tiga komponen utama: (1) *blockchain* sebagai buku besar distribusi, (2) Ethereum Virtual Machine (EVM) sebagai lingkungan eksekusi *smart contract*, dan (3) mekanisme konsensus Proof-of-Stake (PoS) yang menggantikan Proof-of-Work (PoW) setelah *The Merge* pada September 2022 (Ethereum Foundation, 2022). Setiap transaksi di Ethereum memerlukan biaya gas (*gas fee*) yang dihitung sebagai hasil perkalian antara jumlah gas yang dikonsumsi (*gas units*) dengan harga gas per unit (*gas price* dalam Gwei), yang selanjutnya dikonversi ke nilai ETH (Ethereum Yellow Paper).

### 2.1.2 Ethereum Virtual Machine (EVM)

EVM merupakan mesin virtual berbasis *stack* yang mengeksekusi *bytecode smart contract*. EVM beroperasi sebagai lingkungan runtime terisolasi (*sandboxed*), di mana setiap kontrak memiliki ruang alamat dan *storage* sendiri-sendiri. Model eksekusi EVM bersifat deterministik — input yang sama akan selalu menghasilkan output yang sama, tanpa mempengaruhi keadaan jaringan secara global (Antonopoulos et al., 2018). Lagouvardos et al. (2020) dalam penelitiannya mengenai pemodelan statis *memory* EVM menunjukkan bahwa EVM memiliki tiga area penyimpanan utama: *stack*, *memory*, dan *storage*, di mana *storage* merupakan area yang paling mahal secara gas namun bersifat persisten lintas transaksi.

Arsitektur *storage* EVM merupakan aspek kritis dalam optimasi gas. EVM menggunakan model *storage* berbasis slot 32-*byte* (256-*bit*), di mana setiap variabel *state* menempati satu atau lebih *slot* tergantung pada ukurannya. Operasi baca-tulis pada *storage* (SSTORE dan SLOAD) merupakan operasi paling mahal dalam EVM, dengan biaya gas sebagai berikut (Ethereum StackExchange, 2023):

| Operasi | Biaya Gas | Keterangan |
|---------|-----------|------------|
| SSTORE *cold write* | 20.000 | Penulisan awal ke *slot* baru |
| SSTORE *warm write* | 2.900 | Penulisan ke *slot* yang sudah diakses |
| SLOAD *cold read* | 2.100 | Pembacaan awal dari *slot* baru |
| SLOAD *warm read* | 100 | Pembacaan dari *slot* yang sudah diakses |

Di Sorbo et al. (2022) dalam penelitian profil konsumsi gas pada *smart contract* Solidity mengidentifikasi bahwa operasi SSTORE dan SLOAD merupakan kontributor terbesar terhadap biaya gas eksekusi, yang secara langsung mempengaruhi profitabilitas aplikasi terdesentralisasi. Temuan ini konsisten dengan analisis gas cost pada pola *proxy* dan *diamond* yang dilakukan oleh Benedetti et al., yang menunjukkan bahwa pemilihan pola arsitektural memiliki dampak signifikan terhadap biaya *deployment* dan eksekusi.

Biaya yang signifikan ini menjadi motivasi utama bagi optimasi gas, khususnya melalui teknik *variable packing* yang akan dibahas pada Bagian 2.3.

### 2.1.3 Model Eksekusi Transaksi

Setiap transaksi di Ethereum melewati serangkaian tahapan eksekusi: (1) validasi transaksi, (2) deklarasi gas awal, (3) eksekusi kode kontrak, (4) pembersihan gas yang tidak terpakai (*refund*), dan (5) pembaruan *state*. Pada tahap eksekusi, EVM menjalankan setiap instruksi *opcode* secara berurutan, mengelola *stack*, *memory*, dan *storage* sesuai kebutuhan (Ethereum Foundation, 2022).

Model ini relevan dengan penelitian karena setiap instruksi yang dieksekusi memiliki kontribusi biaya gas yang berbeda. Lagouvardos et al. (2020) menunjukkan bahwa pemodelan statis terhadap *memory* EVM dapat mengidentifikasi pola penggunaan yang redundan, sehingga memungkinkan pengurangan biaya gas melalui eliminasi operasi yang tidak perlu. Optimasi statis berfokus pada pengurangan jumlah instruksi dan penggunaan *slot storage* yang lebih efisien, sedangkan optimasi dinamis memanfaatkan fitur-fitur baru EVM seperti EIP-1153 untuk mengurangi biaya operasi yang berulang.

## 2.2 Smart Contract Security

### 2.2.1 Reentrancy Attack

*Reentrancy attack* merupakan salah satu celah keamanan paling kritis dalam *smart contract*, di mana penyerang melakukan panggilan rekursif ke fungsi *withdraw* sebelum *state balance* diperbarui (Samreen & Alalfi, 2020). Serangan ini pertama kali didokumentasikan secara luas melalui insiden The DAO pada tahun 2016, yang mengakibatkan kerugian sebesar $60 juta ETH (Zheng et al., 2023).

Zheng et al. dalam penelitiannya mengenai deteksi reentrancy pada smart contract menunjukkan bahwa *reentrancy* merupakan salah satu kerentanan paling kritis yang menyebabkan kerugian jutaan dolar. Temuan mereka menunjukkan bahwa deteksi kerentanan memerlukan pendekatan gabungan antara analisis statis dan eksekusi dinamis untuk mencapai cakupan yang komprehensif.

Secara formal, *reentrancy attack* dapat didefinisikan sebagai berikut:

```
Attacker.call(withdraw(amount)) 
  → Bridge.transfer(attacker, amount) 
    → attacker.receive() 
      → Attacker.call(withdraw(amount))  [RECURSIVE CALL]
```

Celah keamanan ini terjadi karena pelanggaran pola *Checks-Effects-Interactions* (CEI), di mana interaksi eksternal (transfer ETH) dilakukan sebelum efek (pembaruan *state*) diterapkan (ConsenSys, 2023). Samreen dan Alalfi dalam penelitiannya mengenai identifikasi kerentanan *reentrancy* pada *smart contract* Ethereum menunjukkan bahwa deteksi serangan ini memerlukan analisis interaksi antar-kontrak melalui spesifikasi *Application Binary Interface* (ABI), karena *reentrancy* modern sering melibatkan panggilan silang antar-kontrak yang kompleks.

Dalam konteks *bridge blockchain*, *reentrancy attack* merupakan ancaman yang sangat serius karena *bridge* menyimpan aset dalam jumlah besar dari banyak pengguna. Zheng et al. (2023) dalam studi skala besar terhadap 230.548 kontrak terverifikasi di Etherscan menemukan bahwa 21.212 kontrak memiliki masalah *reentrancy*, yang menunjukkan bahwa kerentanan ini masih menjadi masalah widespread dalam ekosistem Ethereum.

### 2.2.2 Checks-Effects-Interactions (CEI) Pattern

Pola CEI merupakan metodologi desain keamanan yang direkomendasikan oleh OpenZeppelin dan Ethereum Foundation untuk mencegah *reentrancy attack* (ConsenSys, 2023). Pola ini mengatur urutan eksekusi dalam tiga tahap:

1. **Checks**: Validasi semua kondisi pra-syarat (seperti saldo yang cukup, hak akses, status *pause*).
2. **Effects**: Pembaruan *state* internal kontrak sebelum melakukan interaksi eksternal.
3. **Interactions**: Panggilan eksternal ke kontrak lain atau transfer ETH.

Casale-Brunet dan Mattavelli dalam penelitiannya mengenai pendekatan *secure-by-design* pada *smart contract* berbasis implementasi *dataflow* menekankan pentingnya desain keamanan proaktif yang menerapkan pola CEI sejak tahap perancangan. Pendekatan mereka menunjukkan bahwa kontrak yang dirancang dengan mempertimbangkan aliran data sejak awal memiliki ketahanan yang lebih baik terhadap serangan *reentrancy*.

Penerapan CEI pada *bridge* dapat dilihat pada kontrak `BridgeStaticOnly`, di mana fungsi *withdraw* menerapkan urutan yang benar: validasi saldo (Checks), pengurangan *balance* (Effects), kemudian transfer ETH (Interactions). Pendekatan ini memastikan bahwa bahkan jika penyerang melakukan *reentrancy*, *state* sudah diperbarui sehingga tidak ada dana yang bisa ditarik secara berulang.

Namun, CEI memiliki keterbatasan. Wang et al. (2024a) dalam penelitiannya mengenai deteksi *reentrancy* yang efisien pada kontrak kompleks menunjukkan bahwa pola CEI statis tidak dapat mendeteksi pola serangan yang lebih kompleks seperti *cross-function reentrancy* dan *reentrancy* yang melibatkan interaksi antar-kontrak, yang memerlukan mekanisme deteksi dinamis berbasis pemotongan program (*program slicing*) dan eksekusi simbolis.

### 2.2.3 Studi Kasus Eksploitasi Bridge

Analisis terhadap eksploitasi *bridge* dalam tiga tahun terakhir mengungkapkan pola serangan yang berulang dan mengkhawatirkan (Salzano et al., 2026):

**Ronin Bridge (Maret 2022)**: Eksploitasi ini melibatkan kompromi terhadap *private key validator*, namun juga mengungkapkan kelemahan fundamental dalam mekanisme validasi transaksi *bridge*. Kerugian mencapai $620 juta dalam bentuk ETH dan USDC (Zheng et al., 2023).

**Wormhole Bridge (Februari 2022)**: Serangan ini memanfaatkan celah dalam verifikasi *signature*, memungkinkan penyerang mencetak 120.000 wETH tanpa jaminan yang memadai. Kerugian mencapai $320 juta (Trail of Bits, 2022).

**Nomad Bridge (Agustus 2022)**: Eksploitasi ini terjadi akibat kesalahan konfigurasi pembaruan kontrak, yang memungkinkan siapa saja memverifikasi transaksi palsu. Kerugian mencapai $190 juta (Shou et al., 2023).

Salzano et al. (2026) dalam studi komparatifnya mengenai pendekatan akademik dan pengembang terhadap kerentanan *smart contract* menemukan bahwa hanya 60,55% strategi perbaikan yang diterapkan oleh pengembang sesuai dengan panduan akademik yang ada. Temuan ini mengindikasikan adanya kesenjangan antara teori keamanan dan praktik implementasi, yang menjadi motivasi bagi pendekatan *defense-in-depth* yang diusulkan dalam penelitian ini.

Pola-pola serangan ini menunjukkan bahwa keamanan *bridge* memerlukan pendekatan berlapis (*defense-in-depth*) yang mencakup perlindungan terhadap *reentrancy*, manipulasi *signature*, dan anomali transaksi *on-chain*.

## 2.3 Optimasi Gas: Variable Packing dan Teknik Statis

### 2.3.1 Variable Packing

*Variable packing* merupakan teknik optimasi gas yang memanfaatkan model *storage* 32-*byte* EVM untuk menggabungkan beberapa variabel ke dalam satu *slot*. Dalam model *storage* default, setiap variabel menempati *slot* terpisah terlepas dari ukurannya. Sebagai contoh, variabel `address` (20 *byte*) dan `bool` (1 *byte*) masing-masing menempati satu *slot* 32-*byte* penuh, sehingga menghasilkan pemborosan ruang sebesar 11 *byte* dan 31 *byte* (Ethereum StackExchange, 2023).

Di Sorbo et al. (2022) dalam penelitian profil konsumsi gas mengidentifikasi 19 jenis *code smells* pada Solidity yang berkontribusi terhadap pemborosan gas, termasuk penggunaan *storage* yang tidak efisien. Temuan mereka menunjukkan bahwa optimasi *storage* layout dapat menghasilkan penghematan gas yang signifikan tanpa mengubah logika bisnis kontrak.

Dengan *variable packing*, dua variabel dapat digabungkan ke dalam satu *slot* jika total ukurannya tidak melebihi 32 *byte*. Pada penelitian ini, struct `UserBalance` memaketkan `address` (20 *byte*) dan `uint96` (12 *byte*) ke dalam satu *slot* 32-*byte*, mengurangi jumlah *slot* dari 2 menjadi 1. Penghematan gas yang dihasilkan adalah:

```
ΔG_packing = (N_before - N_after) × SSTORE_cold
            = (2 - 1) × 20.000
            = 20.000 gas per transaksi deposit pertama
```

Benedetti et al. dalam analisis biaya gas pada pola *proxy* dan *diamond* menunjukkan bahwa pemilihan pola arsitektural memiliki dampak signifikan terhadap biaya eksekusi. Mereka merekomendasikan penggunaan *storage packing* sebagai salah satu strategi optimasi utama, terutama untuk kontrak yang berinteraksi dengan banyak *slot* secara频繁.

### 2.3.2 Unchecked Arithmetic

Solidity 0.8.x secara default menerapkan pemeriksaan *overflow/underflow* pada setiap operasi aritmatika. Meskipun ini meningkatkan keamanan, pemeriksaan tersebut menambah biaya gas sekitar 20-50 gas per operasi. Pada situasi di mana *overflow* dapat dipastikan tidak terjadi — misalnya setelah validasi input yang memastikan nilai positif — blok `unchecked` dapat digunakan untuk menghilangkan pemeriksaan ini (Solidity Documentation, 2023).

Benedetti et al. dalam penelitiannya mengenai biaya gas pada smart contract menunjukkan bahwa optimasi gas yang agresif tanpa pertimbangan batas *gas limit* justru dapat menciptakan kerentanan baru. Oleh karena itu, penggunaan blok `unchecked` harus dibatasi pada konteks di mana keamanan aritmatika sudah dijamin melalui mekanisme lain.

Pada penelitian ini, blok `unchecked` diterapkan pada *increment balance* dalam fungsi `deposit` dan *decrement balance* dalam fungsi `withdraw`. Penghematan gas yang dihasilkan sekitar 20 gas per operasi, yang secara kumulatif menjadi signifikan untuk *bridge* dengan volume transaksi tinggi.

### 2.3.3 Custom Errors

Sebelum Solidity 0.8.4, mekanisme *revert* standar menggunakan *string error message*, yang memerlukan encoding ABI dan menambah biaya gas sekitar 200-500 gas per *revert*. *Custom errors*, yang diperkenalkan melalui Solidity 0.8.4, memungkinkan deklarasi *error* tanpa *string*, sehingga mengurangi biaya *revert* sekitar 50 gas per permohonan (Solidity 0.8.4 Release Notes, 2021).

Salzano et al. (2026) dalam studi komparatifnya menemukan bahwa penggunaan *custom errors* merupakan salah satu strategi optimasi yang paling sering diterapkan oleh pengembang, namun implementasinya masih belum konsisten di seluruh ekosistem Solidity.

### 2.3.4 Calldata vs Memory

Parameter fungsi yang hanya dibaca (tidak dimodifikasi) dapat dideklarasikan sebagai `calldata` alih-alih `memory`. *Calldata* merupakan lokasi penyimpanan transien yang tidak memerlukan alokasi *memory*, sehingga menghemat gas sekitar 100 gas per parameter (Solidity Documentation, 2023). Teknik ini diterapkan pada parameter-parameter fungsi yang menerima array atau *string* panjang.

### 2.3.5 Immutable Variables

Variabel `immutable` dideklasikan pada *constructor* dan nilainya ditulis langsung ke *bytecode* kontrak, bukan ke *storage*. Akibatnya, pembacaan variabel `immutable` tidak memerlukan operasi SLOAD, sehingga menghemat gas pada setiap akses (EIP-1967, 2020). Pada penelitian ini, variabel `admin` dideklarasikan sebagai `immutable` pada ketiga kontrak *bridge*, yang menghasilkan penghematan sekitar 2.100 gas per pembacaan dibandingkan *storage* biasa.

Zheng et al. (jurnal_18) dalam penelitiannya mengenai GasAgent, sebuah *multi-agent framework* untuk optimasi gas otomatis menggunakan LLM, menunjukkan bahwa kombinasi teknik optimasi statis seperti *variable packing*, *immutable variables*, dan *custom errors* dapat menghasilkan penghematan gas kumulatif yang signifikan tanpa mengorbankan keamanan atau fungsionalitas kontrak.

## 2.4 EIP-1153: Transient Storage

### 2.4.1 Spesifikasi dan Latar Belakang

EIP-1153 (*Transient Storage Opcodes*) merupakan *Ethereum Improvement Proposal* yang memperkenalkan dua *opcode* baru: TSTORE (*Transient Store*) dan TLOAD (*Transient Load*). Proposal ini diaktifkan melalui *fork Cancun* pada Maret 2024, bersamaan dengan EIP-4844 dan beberapa peningkatan lainnya (EIP-1153, 2021). Solidity Blog (2024) dalam dokumentasi resminya menjelaskan bahwa desain *transient storage* terinspirasi dari kebutuhan akan mekanisme penyimpanan sementara yang efisien gas untuk kasus penggunaan seperti *reentrancy guard* dan *cross-function state tracking*.

*Transient storage* merupakan mekanisme penyimpanan sementara yang berbeda dari *storage* permanen (SSTORE/SLOAD) dalam tiga aspek kritis:

1. **Biaya operasi**: TSTORE dan TLOAD masing-masing berbiaya 100 gas, jauh lebih rendah dibandingkan SSTORE *cold* (20.000 gas) atau SLOAD *cold* (2.100 gas).

2. **Masa aktif**: Data *transient storage* hanya berlaku selama satu transaksi dan direset secara otomatis di akhir transaksi (*auto-reset*), sehingga tidak memerlukan biaya reset manual.

3. **Ruang alamat**: *Transient storage* menggunakan ruang alamat yang sama dengan *storage* permanen (*address* 0x0 sampai 0xFFFF), namun dengan *namespace* terpisah.

### 2.4.2 Analisis Penghematan Gas

Penghematan gas yang dicapai melalui EIP-1153 sangat signifikan. Bandingkan mekanisme *reentrancy guard* konvensional dengan pendekatan *transient storage*:

**Tanpa EIP-1153 (*Mutex Lock* Tradisional):**
```
G_mutex = SSTORE_cold(lock) + SSTORE_warm(unlock)
        = 20.000 + 2.900
        = 22.900 gas
```

**Dengan EIP-1153:**
```
G_tstore = TSTORE(enter) + TSTORE(exit)
         = 100 + 100
         = 200 gas
```

**Penghematan:**
```
ΔG_tstore = G_mutex - G_tstore
          = 22.900 - 200
          = 22.700 gas (99.1% savings)
```

Penghematan ini bersifat eksponensial untuk *bridge* dengan volume transaksi tinggi. Pada 1.000 transaksi per hari, penghematan kumulatif mencapai 22,7 juta gas, yang setara dengan sekitar 0,0227 ETH pada harga gas 10 Gwei (Paradigm, 2023). Benedetti et al. dalam analisis biaya gas pola *proxy* dan *diamond* menunjukkan bahwa penghematan sebesar ini sangat signifikan dalam konteks *upgradeable smart contracts* yang memiliki interaksi *storage* yang intensif.

### 2.4.3 Aplikasi dalam Smart Contract Security

Zhang, A. & Debono (2024) dalam studi dampak EIP-1153 terhadap ekosistem Ethereum menemukan bahwa dari sekitar 250 kontrak yang menggunakan *transient storage*, lebih dari 60 di antaranya merupakan kontrak yang di-*deploy* lintas *chain*. Temuan ini menunjukkan adopsi yang luas meskipun penggunaan *transient storage* masih terbatas pada penggunaan *inline assembly* karena dukungan *compiler* yang baru mulai tersedia.

Solady, *library* Solidity yang dikembangkan oleh Vector Finance, juga menyediakan `TransientStorageLock` yang mengimplementasikan mekanisme serupa (Solady, 2023). Kedua implementasi ini membuktikan bahwa EIP-1153 telah diterima secara luas dalam ekosistem Solidity sebagai standar baru untuk *reentrancy guard*.

### 2.4.4 Keamanan Transient Storage

Model keamanan *transient storage* didasarkan pada properti *auto-reset* yang meyakinkan bahwa data tidak dapat persist lintas transaksi (OpenZeppelin, 2024). Trail of Bits (2024) dalam asesmen keamanannya menyimpulkan bahwa EIP-1153 memperkuat model keamanan *smart contract* dengan mengurangi kompleksitas manajemen *state* sementara.

Namun, terdapat pertimbangan keamanan yang perlu diperhatikan: *transient storage* berbagi ruang alamat dengan *storage* permanen, sehingga kontrak yang menggunakan SSTORE pada alamat yang sama dengan TSTORE pada transaksi sebelumnya dapat mengalami konflik. Dalam penelitian ini, konflik ini dihindari melalui penggunaan slot konstan (`REENTRANCY_SLOT = 1`) yang tidak digunakan untuk *storage* permanen.

## 2.5 MEV (Maximal Extractable Value) dan Sandwich Attack

### 2.5.1 Fondasi MEV

*Maximal Extractable Value* (MEV) merupakan konsep yang menjelaskan keuntungan maksimum yang dapat diperoleh oleh penambang, validator, atau bot transaksi melalui kemampuan mereka untuk menyusun, menunda, atau mengecualikan transaksi dalam satu blok (Daian et al., 2020). Istilah ini pertama kali diperkenalkan oleh Phil Daian dalam makalah "Flash Boys 2.0" yang mendokumentasikan fenomena *frontrunning* di *decentralized exchanges* (DEX).

MEV tidak terbatas pada *sandwich attack*. Bentuk-bentuk MEV lainnya meliputi: *frontrunning* (menjalankan transaksi sebelum transaksi korban), *backrunning* (menjalankan transaksi setelah transaksi korban), *liquidation* (menjalankan *liquidation* pada *protocol lending*), dan arbitrase antar-bursa (Flashbots, 2021). Dalam konteks *bridge*, bentuk MEV yang paling relevan adalah *sandwich attack*, yang akan dibahas secara lebih rinci pada bagian berikutnya.

### 2.5.2 Mekanisme Sandwich Attack

*Sandwich attack* merupakan bentuk MEV yang paling merusak bagi pengguna DEX dan *bridge*. Mekanisme serangan ini melibatkan tiga transaksi yang dijalankan secara berurutan dalam satu blok (Qin et al., 2021):

1. **Frontrun (Ta1)**: Penyerang menjalankan transaksi pembelian (*buy*) sebelum transaksi korban, yang meningkatkan harga token secara artifisial.

2. **Transaksi Korban (Tv)**: Pengguna korban menjalankan transaksi *swap* pada harga yang sudah terpengaruh oleh *frontrun*, menghasilkan *slippage* yang menguntungkan penyerang.

3. **Backrun (Ta2)**: Penyerang menjalankan transaksi penjualan (*sell*) setelah transaksi korban, merealisasikan keuntungan dari selisih harga.

Secara matematis, keuntungan penyerang dapat didefinisikan sebagai:

```
Profit_a = Ta2.output - Ta1.input
```

Di mana:
- `Ta1.input` = jumlah ETH yang diinvestasikan penyerang dalam *frontrun*
- `Ta2.output` = jumlah ETH yang diterima penyerang dalam *backrun*

Untuk model *Constant Product* (x * y = k), keuntungan penyerang dapat disederhanakan menjadi:

```
Profit_a ≈ (Δv² × x) / ((reserve_ETH + x)² × reserve_ETH)
```

Di mana `Δv` adalah jumlah transaksi korban dan `x` adalah jumlah *frontrun* penyerang.

### 2.5.3 Dampak MEV pada Bridge

Dalam konteks *bridge*, *sandwich attack* memiliki dampak yang lebih luas dibandingkan DEX biasa. Pengguna *bridge* tidak hanya kehilangan nilai akibat *slippage*, tetapi juga menghadapi risiko keamanan yang lebih serius. Data dari Flashbots (2021) menunjukkan bahwa MEV bot telah mengumpulkan keuntungan lebih dari $600 juta dalam bentuk ETH dari ekosistem DeFi sejak 2020.

Qin et al. (2021) dalam analisisnya terhadap nilai yang dapat diekstraksi dari blockchain menunjukkan bahwa *sandwich attack* menjadi ancaman struktural yang tidak dapat dihilangkan sepenuhnya melalui mekanisme konsensus. Solusi mitigasi memerlukan pendekatan pada lapisan aplikasi, termasuk: (1) *encrypted mempool* yang mengenkripsi transaksi sampai dieksekusi, (2) *commit-reveal scheme* yang menunda pengungkapan detail transaksi, dan (3) *on-chain monitoring* yang mendeteksi pola serangan secara real-time.

### 2.5.4 Strategi Mitigasi MEV

Flashbots (2021) mengembangkan MEV-Share sebagai mekanisme redistribusi MEV yang mengembalikan sebagian keuntungan MEV kepada pengguna korban. CoW Protocol (2024) mengadopsi *batch auction* yang mengumpulkan transaksi dalam satu batch dan mengeksekusinya pada harga yang sama, sehingga menghilangkan insentif *sandwich attack*.

Uniswap V3 memperkenalkan TWAP (*Time-Weighted Average Price*) *oracle* yang menghitung rata-rata harga tertimbang waktu, sehingga manipulasi harga jangka pendek memiliki dampak yang minimal terhadap harga referensi (Uniswap V3, 2021). Pendekatan ini menjadi inspirasi bagi desain mekanisme deteksi MEV pada penelitian ini, di mana anomali *sandwich* dideteksi berdasarkan pola transaksi *on-chain* alih-alih manipulasi harga.

## 2.6 EIP-4844: Proto-Danksharding dan Blob Transactions

### 2.6.1 Latar Belakang dan Spesifikasi

EIP-4844 (*Shard Blob Transactions*), yang diaktifkan melalui *fork Cancun* pada Maret 2024, memperkenalkan jenis transaksi baru yang membawa "*blob*" — data sementara yang dapat diakses oleh klien *light* tetapi tidak disimpan secara permanen dalam *state* Ethereum (EIP-4844, 2023). Park et al. dalam penelitian komprehensifnya mengenai dampak EIP-4844 terhadap Ethereum menganalisis aspek keamanan konsensus, dinamika transaksi *rollup*, dan pasar biaya gas *blob*, memberikan pemahaman menyeluruh mengenai implikasi teknis dan ekonomis dari implementasi EIP-4844.

Spesifikasi teknis *blob* meliputi:
- Ukuran maksimum per *blob*: 128 KB (131.072 *byte*)
- Biaya gas per *blob*: 131.072 gas
- Jumlah *blob* maksimum per blok: 6 *blob*
- Masa simpan *blob*: sekitar 18 hari (sebelum *pruning* oleh klien)

### 2.6.2 Ekosistem Blob Fee Market

*Blob fee market* beroperasi secara terpisah dari *base fee market* konvensional. Harga *blob* (*blob base fee*) ditentukan oleh mekanisme EIP-1559 yang menyesuaikan harga berdasarkan jumlah *blob* yang diminta dalam blok sebelumnya (Ethereum Foundation, 2024). Park et al. menunjukkan bahwa dinamika pasar biaya gas *blob* memiliki pola fluktuasi yang berbeda dari *base fee market* tradisional, dengan sensitivitas yang lebih tinggi terhadap perubahan demand *rollup*.

Data historis dari Dune Analytics (2024) menunjukkan bahwa *blob base fee* telah mengalami fluktuasi yang signifikan sejak pengaktifan *Cancun*, dengan rata-rata 5-10 Gwei pada kondisi normal dan puncak hingga 40 Gwei pada kondisi *congested*. Perbandingan ini menunjukkan bahwa *blob fee* bisa jauh lebih murah dibandingkan *calldata fee* (16 gas per *byte*) pada kondisi tertentu, namun tidak selalu demikian.

### 2.6.3 Integrasi Blob dengan Rollup

Optimism dan Arbitrum, dua Optimistic Rollup terbesar di Ethereum, telah mengintegrasikan EIP-4844 untuk mengurangi biaya pengiriman data *rollup* (Optimism, 2024; Arbitrum, 2024). Optimism melaporkan penghematan biaya sebesar 10-100x dibandingkan *calldata* konvensional, tergantung pada kondisi *blob fee market*.

Mekanisme integrasi melibatkan pengubahan format data *rollup* dari *calldata* ke *blob*, yang memerlukan modifikasi pada *sequencer rollup* dan *client* Ethereum. Kedua Optimism dan Arbitrum telah menerapkan mekanisme *fallback* yang secara otomatis beralih ke *calldata* ketika *blob fee* lebih mahal, yang menunjukkan pentingnya optimasi *routing* dynamic yang diusulkan dalam penelitian ini.

## 2.7 Layer-2 Rollups

### 2.7.1 Fondasi Rollups

*Rollups* merupakan solusi penskalaan *Layer-2* yang mengoperasikan transaksi di luar rantai (*off-chain*) tetapi menuliskan bukti transaksi ke Ethereum L1 (Buterin, 2021). Prinsip dasar *rollups* adalah mengumpulkan (*roll up*) banyak transaksi ke dalam satu batch, menghitung *status root*, dan mengirimkan data yang diperlukan ke L1 untuk verifikasi dan penyelesaian sengketa.

Ethereum Foundation (2022) mendefinisikan *rollups* berdasarkan dua karakteristik kunci: (1) data transaksi harus tersedia di L1 untuk memungkinkan verifikasi independen, dan (2) *state transition* harus dapat divalidasi secara kriptografi atau melalui mekanisme *challenge period*.

### 2.7.2 Optimistic Rollups

Optimistic Rollups, yang diimplementasikan oleh Optimism dan Arbitrum, mengasumsikan bahwa semua transaksi valid kecuali ada yang membuktikan sebaliknya melalui mekanisme *challenge* (Optimism, 2024; Arbitrum, 2024). Pendekatan ini memungkinkan *throughput* yang tinggi karena tidak memerlukan bukti kriptografi untuk setiap batch, namun memerlukan *challenge period* (biasanya 7 hari) untuk penyelesaian sengketa.

Biaya transaksi Optimistic Rollups terdiri dari: (1) biaya eksekusi L2 yang rendah, (2) biaya pengiriman data ke L1 yang tergantung pada ukuran *calldata* atau *blob*, dan (3) biaya *challenge* yang dibebankan kepada penantang yang gagal membuktikan inkonsistensi.

### 2.7.3 ZK-Rollups

ZK-Rollups menggunakan *zero-knowledge proof* untuk membuktikan validitas *state transition* tanpa mengungkapkan detail transaksi individual (StarkWare, 2023; zkSync, 2024). Pendekatan ini menawarkan *finality* yang lebih cepat dibandingkan Optimistic Rollups karena tidak memerlukan *challenge period*, namun memerlukan komputasi kriptografi yang intensif.

Perbandingan antara Optimistic Rollups dan ZK-Rollups menunjukkan *tradeoff* antara *throughput*, *finality*, dan biaya komputasi. Dalam konteks *bridge*, ZK-Rollups menawarkan keamanan yang lebih kuat namun dengan biaya operasional yang lebih tinggi.

## 2.8 Early Warning System (EWS) On-Chain

### 2.8.1 Konsep EWS

*Early Warning System* (EWS) *on-chain* merupakan mekanisme deteksi anomali transaksi yang berjalan sebagai komponen *smart contract*. Berbeda dari monitoring *off-chain* yang bergantung pada infrastruktur server terpusat, EWS *on-chain* memproses dan mengevaluasi transaksi secara langsung dalam lingkungan EVM, sehingga tidak memiliki *single point of failure* (Trail of Bits, 2024).

Pada penelitian ini, EWS diimplementasikan melalui kontrak `MonitorMock` yang menggunakan EIP-1153 *transient storage* untuk melacak status transaksi, mendeteksi pola *sandwich attack*, dan menerapkan penalti ekonomi secara otomatis. Casale-Brunet dan Mattavelli dalam penelitiannya mengenai pendekatan *secure-by-design* menekankan bahwa mekanisme deteksi yang terintegrasi langsung dalam kontrak memiliki keunggulan dalam hal keandalan dan ketahanan terhadap kegagalan infrastruktur eksternal.

### 2.8.2 Mekanisme Deteksi MEV Sandwich

Deteksi MEV *sandwich* pada EWS didasarkan pada analisis pola transaksi berurutan dalam satu blok. Mekanisme deteksi bekerja sebagai berikut:

1. **Pencatatan transaksi**: Setiap transaksi dicatat dalam *transient storage* dengan tipe transaksi (*frontrun*, *victim*, atau normal).

2. **Analisis pola**: Ketika transaksi baru terdeteksi, EWS memeriksa apakah terdapat pola Ta1→Tv yang mencurigakan, di mana Ta1 merupakan *frontrun* dan Tv merupakan transaksi *victim*.

3. **Penilaian skor anomali**: Jika pola terdeteksi, EWS menghitung skor anomali berdasarkan faktor risiko (λ) dan probabilitas deteksi (P_detect).

4. **Penerapan penalti**: Jika skor anomali melebihi *threshold*, penalti ekonomi diterapkan pada output transaksi *victim*, mengurangi keuntungan yang bisa diperoleh penyerang.

### 2.8.3 Model Penalti Ekonomi

Model penalti ekonomi pada EWS didasarkan pada prinsip *incentive compatibility* — membuat serangan menjadi tidak menguntungkan secara ekonomi. Formula penalti didefinisikan sebagai:

```
Penalty = amount × (λ × P_detect / 100.000.000)
```

Di Mana:
- `amount` = jumlah transaksi yang terdeteksi
- `λ` = faktor penalti risiko (*default*: 15.000 = 1,5x)
- `P_detect` = probabilitas deteksi (*default*: 9.600 = 96%)

Analisis *expected value* menunjukkan bahwa untuk membuat serangan menjadi tidak menguntungkan:

```
E[Profit_a] = P(not detected) × Profit - P(detected) × Penalty
            = 0,04 × Profit - 0,96 × Penalty
```

Kondisi agar serangan tidak menguntungkan:
```
U(a) > 0
Profit > 24 × Penalty (untuk P_detect = 96%)
```

Model ini membuktikan bahwa dengan probabilitas deteksi 96%, penalti hanya perlu menjadi 1/24 dari keuntungan serangan untuk membuat serangan menjadi tidak menguntungkan secara harapan (*expected value*).

## 2.9 Dynamic Rollup Submission Engine

### 2.9.1 Konsep Dynamic Batching

*Dynamic Rollup Submission Engine* merupakan mekanisme yang mengoptimalkan pengiriman batch transaksi *rollup* ke L1 Ethereum dengan melakukan *routing* dynamic antara *blob* (EIP-4844) dan *calldata* konvensional. Berbeda dari *static engine* yang selalu menggunakan satu rute pengiriman, *dynamic engine* mengevaluasi biaya aktual kedua rute pada setiap momen pengiriman dan memilih yang termurah.

Prinsip kerja *dynamic engine* adalah sebagai berikut:

1. **Akumulasi transaksi**: Transaksi L2 dikumpulkan dalam *queue* hingga kondisi pengiriman terpenuhi.

2. **Evaluasi biaya**: Ketika kondisi pengiriman terpenuhi, *engine* menghitung biaya *calldata* dan biaya *blob* berdasarkan harga gas aktual.

3. **Routing dynamic**: *Engine* memilih rute dengan biaya lebih rendah (*blob* atau *calldata*) dan mengirimkan batch melalui rute tersebut.

4. **Monitoring dan adaptasi**: *Engine* secara terus-menerus memantau kondisi pasar dan menyesuaikan parameter akumulasi.

### 2.9.2 Model Biaya Dynamic

Model biaya *dynamic batching* didefinisikan sebagai:

```
C_dynamic = min(C_calldata, C_blob)

C_calldata = beff_bytes × 16 × L1_fee
C_blob = BLOB_GAS_SIZE × blob_fee

beff_bytes = tx_count × tx_size × α (compression factor)
BLOB_GAS_SIZE = 131.072 gas (128 KB)
```

Di mana `α` (*compression factor*) merupakan rasio ukuran data terkompresi terhadap data asli. Untuk *rollup* dengan kompresi RLP, α ≈ 0,85; untuk ZK *proof* compression, α ≈ 0,70; dan untuk kompresi gabungan, α ≈ 0,88.

Park et al. dalam analisis dampak EIP-4844 menunjukkan bahwa optimasi routing dynamic seperti yang diusulkan dalam penelitian ini sangat relevan mengingat fluktuasi harga gas yang signifikan antara *blob fee market* dan *base fee market*.

### 2.9.3 Trigger Conditions

Pengiriman batch dipicu oleh salah satu dari dua kondisi berikut:

1. **Threshold ukuran**: Ketika ukuran batch efektif (*beff_bytes*) mencapai target (TGT = 100.000 *byte* atau 100 KB).

2. **Threshold waktu**: Ketika jumlah blok sejak pengiriman terakhir mencapai batas maksimum (MAX_D = 25 blok, setara 5 menit).

Kondisi kedua memastikan bahwa transaksi tidak tertunda terlalu lama meskipun volume transaksi rendah, yang penting untuk menjaga *liveness* dan UX pengguna.

## 2.10 Studi Komparatif Bridge Existing

### 2.10.1 Hop Protocol

Hop Protocol merupakan *bridge* yang menghubungkan berbagai *rollup* Ethereum melalui mekanisme *liquidity pool* (Hop Protocol, 2024). Arsitektur Hop menggunakan *bonder* yang menyediakan likuiditas di kedua sisi *bridge*, memungkinkan transfer aset antar-*rollup* dalam hitungan menit alih-alih hari.

Keamanan Hop didasarkan pada: (1) *validator set* yang memverifikasi transaksi, (2) *bond* yang dijadikan jaminan oleh *bonder*, dan (3) *fraud proof* untuk transaksi yang tidak valid. Audit keamanan oleh Spearbit (2023) mengidentifikasi beberapa area perbaikan terkait manajemen likuiditas dan verifikasi *signature*.

### 2.10.2 Stargate (LayerZero)

Stargate Finance, yang dibangun di atas protokol LayerZero, menawarkan transfer aset *native* dengan *slippage* rendah dan biaya tetap (LayerZero, 2024). Arsitektur Stargate menggunakan *Unified Liquidity Pool* yang menggabungkan likuiditas dari berbagai *chain*, sehingga mengurangi fragmentasi likuiditas.

Keamanan Stargate bergantung pada: (1) DVN (*Decentralized Verifier Network*) yang memverifikasi transaksi, (2) *oracle* terdesentralisasi untuk pembaruan status, dan (3) *rate limiting* untuk mencegah serangan volume tinggi. Model keamanan ini berbeda dari pendekatan EWS *on-chain* yang diusulkan dalam penelitian ini.

### 2.10.3 Uniswap V3 (Referensi DEX)

Meskipun bukan *bridge*, Uniswap V3 menjadi referensi penting dalam desain MEV *protection* karena implementasi TWAP *oracle* dan *concentrated liquidity* (Adams et al., 2021). TWAP *oracle* menghitung rata-rata harga tertimbang waktu yang mengurangi dampak manipulasi harga jangka pendek.

*Concentrated liquidity* memungkinkan *liquidity provider* (LP) memfokuskan likuiditas pada rentang harga tertentu, yang meningkatkan efisiensi kapital namun juga meningkatkan risiko IL (*Impermanent Loss*). Dalam konteks *bridge*, konsep *concentrated liquidity* dapat diadopsi untuk mengoptimalkan penggunaan likuiditas pool *bridge*.

### 2.10.4 Perbandingan Arsitektural

Tabel berikut merangkum perbandingan arsitektural antara *bridge* yang diteliti dalam penelitian ini dan *bridge* existing:

| Aspek | Hop Protocol | Stargate | Penelitian Ini |
|-------|-------------|----------|----------------|
| Mekanisme | Liquidity pool + bonder | Unified Liquidity | Liquidity pool |
| Keamanan | Validator set + bond | DVN + oracle | EWS on-chain + EIP-1153 |
| MEV Protection | Off-chain | Rate limiting | On-chain detection + penalty |
| Biaya Gas | Tergantung chain | Flat fee | Tiered (A/B/C/D) |
| Rollup Integration | Multi-rollup | LayerZero | EIP-4844 dynamic |

Perbandingan ini menunjukkan bahwa penelitian ini menawarkan pendekatan yang berbeda dalam hal integrasi EIP-1153 untuk keamanan dan *dynamic routing* untuk optimasi biaya *rollup*.

## 2.11 Kerangka Konseptual Penelitian

Berdasarkan tinjauan pustaka yang telah diuraikan, kerangka konseptual penelitian ini mengintegrasikan lima pilar utama:

1. **Optimasi Gas Statis** (Bagian 2.3): *Variable packing*, CEI pattern, *unchecked arithmetic*, *custom errors*, *calldata parameter*, dan *immutable variables* (Di Sorbo et al., 2022; Benedetti et al.; Zheng et al., jurnal_18).

2. **EIP-1153 Transient Storage** (Bagian 2.4): Mekanisme TSTORE/TLOAD untuk *reentrancy guard* yang efisien dan pelacakan status transaksi (Paradigm, 2023; OpenZeppelin, 2024).

3. **MEV Protection On-Chain** (Bagian 2.5): Deteksi pola *sandwich attack* dan penerapan penalti ekonomi melalui EWS (Daian et al., 2020; Qin et al., 2021).

4. **Dynamic Rollup Submission** (Bagian 2.9): *Routing* dynamic antara *blob* dan *calldata* berdasarkan harga gas *real-time* (Park et al.; Ethereum Foundation, 2024).

5. **Arsitektur Bridge 4-Tier** (Bagian 2.10): Hierarki optimasi dari *baseline* (Tier A) hingga *lightweight dynamic* (Tier D) (Samreen & Alalfi; Wang et al., 2024a; Salzano et al., 2026).

Integrasi kelima pilar ini menghasilkan arsitektur *bridge* yang tidak hanya aman terhadap serangan *reentrancy* dan MEV, tetapi juga efisien gas melalui optimasi statis dan dinamis.

---

## Referensi Bab 2

[1] Adams, H. et al. (2021). "Uniswap V3 Core." Uniswap Foundation.

[2] Albert, E. et al. "Running on Fumes: Preventing Out-of-Gas Vulnerabilities in Ethereum Smart Contracts using Static Resource Analysis." *Proceedings of the ACM on Programming Languages*.

[3] Benedetti, M. et al. (2024). "Gas Cost Analysis of EIP-1153 Transient Storage." arXiv preprint.

[4] Samreen, N.F. & Alalfi, M.H. (2020). "Reentrancy Vulnerability Identification in Ethereum Smart Contracts." *IEEE International Conference on Software Maintenance and Evolution*.

[5] Qin, K. et al. (2021). "Quantifying Blockchain Extractable Value: How dark is the forest?" *arXiv preprint*.

[6] Benedetti, A., Henry, T., & Tucci-Piergiovanni, S. "A Comparative Gas Cost Analysis of Proxy and Diamond Patterns in EVM Blockchains for Trusted Smart Contract Engineering."

[7] Buterin, V. (2014). "Ethereum Whitepaper." Ethereum Foundation.

[8] Buterin, V. (2021). "An Incomplete Guide to Rollups." Vitalik.ca.

[9] Casale-Brunet, S. & Mattavelli, M. "Secure-by-design smart contract based on dataflow implementations." *Blockchain Research Lab*.

[10] Shou, C., Tan, S., & Sen, K. (2023). "ItyFuzz: On-chain Auditing of DeFi Projects." *ACM SIGSOFT International Symposium on Software Testing and Analysis*.

[11] CoW Protocol. "Batch Auctions for MEV Protection." CoW Protocol Documentation.

[12] Daian, P. et al. (2020). "Flash Boys 2.0: Frontrunning in Decentralized Exchanges, Miner Extractable Value, and Consensus Instability." *IEEE Symposium on Security and Privacy*.

[13] Di Sorbo, A., Laudanna, S., Vacca, A., Visaggio, C.A., & Canfora, G. (2022). "Profiling Gas Consumption in Solidity Smart Contracts." *University of Sannio*.

[14] Ethereum Foundation. (2022). "Ethereum Documentation: Rollups." ethereum.org.

[15] Ethereum Foundation. (2024). "Blob Fee Market Documentation." ethereum.org.

[16] EIP-1153. (2021). "Transient Storage Opcodes." Ethereum Improvement Proposals. https://eips.ethereum.org/EIPS/eip-1153.

[17] Solidity Blog. (2024). "Transient Storage in Solidity." Solidity Programming Language. https://soliditylang.org/blog/2024/01/26/transient-storage/.

[18] Ethereum Magicians. (2018). "EIP-1153: Transient Storage Opcodes." Fellowship of Ethereum Magicians. https://ethereum-magicians.org/t/eip-1153-transient-storage-opcodes/553.

[19] Zhang, A. & Debono, M. (2024). "Transient Storage in the wild: An impact study on EIP-1153." Dedaub. https://dedaub.com/blog/transient-storage-in-the-wild-an-impact-study-on-eip-1153/.

[17] EIP-1967. (2020). "Standard Proxy Storage Slots." Ethereum Improvement Proposals.

[18] EIP-4844. (2023). "Shard Blob Transactions." Ethereum Improvement Proposals.

[19] Ethereum StackExchange. (2023). "Storage Layout in Solidity." Stack Exchange.

[20] Zheng, Z. et al. (2023). "Turn the Rudder: A Beacon of Reentrancy Detection for Smart Contracts on Ethereum." *IEEE Transactions on Software Engineering*.

[21] Flashbots. (2021). "MEV Research." flashbots.net.

[22] Lagouvardos, S., Grech, N., Tsatiris, I., & Smaragdakis, Y. (2020). "Precise Static Modeling of Ethereum 'Memory'." *Proceedings of the ACM on Programming Languages*, Volume 4, Issue OOPSLA.

[23] LayerZero. "Stargate Finance Documentation." layerzero.network.

[24] OpenZeppelin. (2024). "Transient Storage Security Model." OpenZeppelin Documentation.

[25] Optimism. (2024). "Blob Integration Guide." optimism.io.

[26] Paradigm. (2023). "EIP-1153: Transient Storage Deep Dive." Paradigm Research.

[27] Park, S., Mun, B., Lee, S., Jeong, W., Lee, J., Eom, H., & Jang, H. "Impact of EIP-4844 on Ethereum: Consensus Security, Ethereum Usage, Rollup Transaction Dynamics, and Blob Gas Fee Markets." *Seoul National University*.

[28] Qin, K. et al. (2021). "Quantifying Blockchain Extractable Value." *arXiv preprint*.

[29] Rekt.news. (2024). "Top DeFi Hacks 2020-2024." rekt.news.

[30] Salzano, F., Marchesi, L., Antenucci, C.K., Scalabrino, S., Tonelli, R., Oliveto, R., & Pareschi, R. (2026). "Bridging the gap: a comparative study of academic and developer approaches to smart contract vulnerabilities." *Empirical Software Engineering*, 31:37.

[31] Samreen, N.F. & Alalfi, M.H. "Reentrancy Vulnerability Identification in Ethereum Smart Contracts." *Ryerson University*.

[32] Solady. (2023). "TransientStorageLock." Vector Finance.

[33] Solidity Documentation. (2023). "Unchecked Blocks." docs.soliditylang.org.

[34] Solidity 0.8.4 Release Notes. (2021). "Custom Errors Feature." soliditylang.org.

[35] StarkWare. (2023). "StarkNet Documentation." starkware.co.

[36] Trail of Bits. (2022). "Wormhole Bridge Security Report." trailofbits.com.

[37] Trail of Bits. (2024). "EIP-1153 Security Assessment." trailofbits.com.

[38] Uniswap V3. (2021). "TWAP Oracle." uniswap.org.

[39] Wang, Z., Chen, J., Zheng, Z., Zheng, P., Zhang, Y., & Zhang, W. (2024a). "Unity is Strength: Enhancing Precision in Reentrancy Vulnerability Detection of Smart Contract Analysis Tools." *Sun Yat-sen University*.

[40] Wang, Z., Chen, J., Wang, Y., Zhang, Y., Zhang, W., & Zheng, Z. (2024b). "Efficiently Detecting Reentrancy Vulnerabilities in Complex Smart Contracts." *Sun Yat-sen University*.

[41] Zheng, J., Peng, Z., Liu, Y., Wang, J., Liao, Y., Dong, W., & He, X. "GasAgent: A Multi-Agent Framework for Automated Gas Optimization in Smart Contracts." *Hong Kong University of Science and Technology (Guangzhou)*.

[42] zkSync. (2024). "zkSync Era Architecture." matterlabs.dev.
