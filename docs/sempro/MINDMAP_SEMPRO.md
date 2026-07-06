# MIND MAP SEMINAR PROPOSAL

## Flowchart Rencana Penelitian

```mermaid
graph TD
    A["PROBLEM DISCOVERY<br/>Bridge blockchain rentan serangan<br/>Gas mahal untuk keamanan"] --> B["ANALISIS MASALAH"]
    
    B --> B1["Reentrancy attack = $1.13M kerugian"]
    B --> B2["MEV sandwich = ancaman struktural"]
    B --> B3["Gas SSTORE = 22,900 per tx"]
    B --> B4["External calls = overhead biaya"]
    
    B1 --> C["GAP PENELITIAN"]
    B2 --> C
    B3 --> C
    B4 --> C
    
    C --> C1["Belum ada framework komparatif"]
    C --> C2["EIP-1153 belum optimal untuk multi-fungsi"]
    C --> C3["Belum ada metrik cost-effectiveness"]
    
    C1 --> D["SOLUSI<br/>4-Tier Architecture"]
    C2 --> D
    C3 --> D
    
    D --> D1["Tier A: Unoptimized<br/>(Baseline)"]
    D --> D2["Tier B: Static Only<br/>(CEI + Variable Packing)"]
    D --> D3["Tier C: Full Dynamic<br/>(EIP-1153 + External Calls)"]
    D --> D4["Tier D: Lightweight<br/>(EIP-1153 Inline)"]
    
    D1 --> E["PENGUKURAN"]
    D2 --> E
    D3 --> E
    D4 --> E
    
    E --> E1["Gas Measurement<br/>100 sampel/operasi<br/>Foundry + gasleft()"]
    E --> E2["Security Test<br/>8 fitur keamanan<br/>Reentrancy + MEV + Pause"]
    E --> E3["Statistical Test<br/>Welch's t-test<br/>Cohen's d"]
    
    E1 --> F["ANALISIS"]
    E2 --> F
    E3 --> F
    
    F --> F1["Statistik Deskriptif<br/>Mean, Min, Max, StdDev"]
    F --> F2["Metrik SPG<br/>Security Points per Gas"]
    F --> F3["Perbandingan Tier<br/>Tier C vs Tier D"]
    
    F1 --> G["KONTRIBUSI"]
    F2 --> G
    F3 --> G
    
    G --> G1["Framework komparatif pertama"]
    G --> G2["Implementasi keamanan inline"]
    G --> G3["Metrik SPG"]
    G --> G4["Validasi statistik"]
    
    G1 --> H["OUTCOME<br/>Tier D: SPG 205 (Terbaik)<br/>7/8 skor keamanan<br/>-72% gas vs Tier C"]
    G2 --> H
    G3 --> H
    G4 --> H

    style A fill:#ff6b6b,color:#fff
    style D fill:#4ecdc4,color:#fff
    style E fill:#45b7d1,color:#fff
    style G fill:#96ceb4,color:#fff
    style H fill:#f9ca24,color:#333
```

## Legenda

| Warna | Keterangan |
|-------|------------|
| Merah | Problem Discovery |
| Hijau | Solusi (4-Tier) |
| Biru | Pengukuran |
| Hijau Muda | Kontribusi |
| Kuning | Outcome |
