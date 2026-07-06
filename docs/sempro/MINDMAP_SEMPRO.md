# MIND MAP SEMPRO

## Alur Penelitian: Dari Masalah Sampai Solusi

```mermaid
graph TD
    START["Awal: Mengapa Penelitian Ini Ada?"] --> MASALAH
    
    subgraph MASALAH["FAKTA DI LAPANGAN"]
        M1["Bridge blockchain sering diserang<br/>contoh: Ronin $620M, Wormhole $320M"]
        M2["Gas SSTORE mahal = 22,900 gas<br/>untuk setiap operasi keamanan"]
        M3["EIP-1153 (TSTORE) hanya dipakai<br/>untuk reentrancy guard saja"]
    end
    
    MASALAH --> GAP
    
    subgraph GAP["YANG BELUM ADA"]
        G1["Tidak ada framework komparatif<br/>untuk bandingkan pendekatan bridge"]
        G2["Tidak ada metrik cost-effectiveness<br/>untuk ukur efisiensi gas vs keamanan"]
        G3["EIP-1153 belum dimanfaatkan<br/>untuk multi-fungsi keamanan"]
    end
    
    GAP --> SOLUSI
    
    subgraph SOLUSI["RANCANGAN PENELITIAN"]
        S1["Buat 4 arsitektur bridge<br/>Tier A/B/C/D"]
        S2["Uji semua dengan<br/>216 test Foundry"]
        S3["Ukur gas 100 sampel<br/>per operasi"]
    end
    
    SOLUSI --> METODE
    
    subgraph BAB3["BAB III: METODOLOGI"]
        direction TB
        MTD1["Paradigma: Empiris-kuantitatif<br/>Fakta diukur, bukan opini"]
        MTD2["Data: Gas measurement<br/>+ Security test"]
        MTD3["Alat: Foundry + Solidity 0.8.28"]
        MTD4["Analisis: Statistik deskriptif<br/>+ SPG metric"]
    end
    
    METODE --> HASIL
    HASIL --> KESIMPULAN
    
    subgraph HASIL["HASIL YANG DITEMUKAN"]
        H1["Tier D = 8/8 security<br/>seperti Tier C"]
        H2["Tier D gas 72% lebih murah<br/>dari Tier C"]
        H3["SPG Tier D = 220.1<br/>paling efisien"]
    end
    
    subgraph KESIMPULAN["KESIMPULAN"]
        K1["EIP-1153 inline bisa<br/>multi-fungsi keamanan"]
        K2["Tidak perlu tradeoff<br/>gas vs keamanan"]
    end
    
    START --> MASALAH

    style START fill:#ff6b6b,color:#fff
    style MASALAH fill:#feca57,color:#333
    style GAP fill:#ff9ff3,color:#333
    style SOLUSI fill:#48dbfb,color:#333
    style BAB3 fill:#0abde3,color:#fff
    style HASIL fill:#10ac84,color:#fff
    style KESIMPULAN fill:#5f27cd,color:#fff
```

## Penjelasan Alur

### Step 1: MASALAH (BAB I)
> "Mengapa penelitian ini penting?"
- Bridge sering diserang (miliaran dollar hilang)
- Gas untuk keamanan mahal
- EIP-1153 belum optimal

### Step 2: GAP (BAB I → BAB II)
> "Apa yang belum diteliti orang lain?"
- Tidak ada yang membandingkan 4 arsitektur bridge
- Tidak ada metrik untuk ukur gas vs keamanan
- EIP-1153 hanya dipakai untuk 1 fungsi

### Step 3: SOLUSI (BAB III)
> "Bagaimana cara membuktikan?"
- Rancang 4 tier bridge (A/B/C/D)
- Uji dengan Foundry (216 test)
- Ukur gas (100 sampel)
- Bandingkan hasilnya

### Step 4: HASIL (BAB IV)
> "Apa yang ditemukan?"
- Tier D: keamanan sama (8/8), gas 72% lebih murah
- SPG Tier D paling tinggi (220.1)

### Step 5: KESIMPULAN (BAB V)
> "Apa artinya?"
- EIP-1153 bisa jadi platform keamanan multi-fungsi
- Tidak perlu pilih antara gas murah atau keamanan

---

## Struktur Penulisan

```
BAB I: PENDAHULUAN (1.1 - 1.6)
├── 1.1 Latar Belakang → Fakta masalah
├── 1.2 Identifikasi Masalah → 4 masalah
├── 1.3 Rumusan Masalah → 3 pertanyaan
├── 1.4 Batasan Masalah → Fokus EIP-1153
├── 1.5 Tujuan Penelitian → 3 tujuan
└── 1.6 Manfaat Penelitian → Akademis + Industri

BAB II: TINJAUAN PUSTAKA (2.1 - 2.3)
├── 2.1 Penelitian Terdahulu → 20 paper
├── 2.2 Tabel Perbandingan → Gap analysis
└── 2.3 Kesimpulan Perbandingan → Belum ada framework

BAB III: METODOLOGI (3.1 - 3.5)
├── 3.1 Paradigma → Empiris-kuantitatif
├── 3.2 Data → Gas + Security
├── 3.3 Alat → Foundry
├── 3.4 Rancangan → 4-Tier
└── 3.5 Analisis → Statistik + SPG
```
