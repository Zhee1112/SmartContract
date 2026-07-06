# MIND MAP JURNAL

## Flowchart Fokus Kontribusi dan Hasil

```mermaid
graph TD
    A["PROBLEM<br/>Gas mahal untuk keamanan bridge<br/>SSTORE = 22,900 gas"] --> B["SOLUSI<br/>EIP-1153 Transient Storage<br/>TSTORE/TLOAD = 100 gas"]
    
    B --> C["APPROACH<br/>4-Tier Comparative Analysis"]
    
    C --> C1["Tier A: Baseline<br/>0/8 keamanan"]
    C --> C2["Tier B: Static<br/>4/8 keamanan"]
    C --> C3["Tier C: Full Dynamic<br/>8/8 keamanan"]
    C --> C4["Tier D: Lightweight<br/>7/8 keamanan"]
    
    C1 --> D["TESTING<br/>215 Foundry Tests<br/>100 sampel/operasi"]
    C2 --> D
    C3 --> D
    C4 --> D
    
    D --> D1["Gas Measurement"]
    D --> D2["Security Test"]
    D --> D3["Statistical Validation"]
    
    D1 --> E["RESULTS"]
    D2 --> E
    D3 --> E
    
    E --> E1["Tier D = SPG 205<br/>(Cost-Effectiveness #1)"]
    E --> E2["Tier D vs C<br/>-72% gas deposit<br/>-88% gas withdraw<br/>-87% gas swap"]
    E --> E3["Cohen's d = 1.28<br/>(Large effect size)"]
    E --> E4["215/215 tests PASS<br/>Semua fitur berfungsi"]
    
    E1 --> F["CONTRIBUTION"]
    E2 --> F
    E3 --> F
    E4 --> F
    
    F --> F1["Framework komparatif<br/>pertama untuk bridge"]
    F --> F2["Inline EIP-1153<br/>keamanan multi-fungsi"]
    F --> F3["Metrik SPG<br/>cost-effectiveness"]
    F --> F4["Empirical validation<br/>statistically significant"]
    
    F1 --> G["IMPACT<br/>Bridge hemat gas + aman<br/>Tidak perlu tradeoff"]
    F2 --> G
    F3 --> G
    F4 --> G

    style A fill:#ff6b6b,color:#fff
    style B fill:#4ecdc4,color:#fff
    style C fill:#45b7d1,color:#fff
    style D fill:#f9ca24,color:#333
    style E fill:#96ceb4,color:#fff
    style F fill:#ff9ff3,color:#fff
    style G fill:#5f27cd,color:#fff
```

## Flowchart Perbandingan Tier

```mermaid
graph LR
    subgraph "SKOR KEAMANAN"
        SA["Tier A<br/>0/8"] --> SB["Tier B<br/>4/8"]
        SB --> SC["Tier C<br/>8/8"]
        SC --> SD["Tier D<br/>7/8"]
    end
    
    subgraph "GAS (DEPOSIT)"
        GA["Tier A<br/>31,412"] --> GB["Tier B<br/>31,427"]
        GB --> GC["Tier C<br/>122,769"]
        GC --> GD["Tier D<br/>34,156"]
    end
    
    subgraph "SPG (EFISIENSI)"
        SPA["Tier A<br/>0"] --> SPB["Tier B<br/>127"]
        SPB --> SPC["Tier C<br/>65"]
        SPC --> SPD["Tier D<br/>205"]
    end
    
    SA -.-> GA
    SB -.-> GB
    SC -.-> GC
    SD -.-> GD
    
    GA -.-> SPA
    GB -.-> SPB
    GC -.-> SPC
    GD -.-> SPD

    style SA fill:#ff6b6b,color:#fff
    style SB fill:#feca57,color:#333
    style SC fill:#48dbfb,color:#333
    style SD fill:#0abde3,color:#fff
```

## Ringkasan Temuan

| Metrik | Tier A | Tier B | Tier C | Tier D | Winner |
|--------|--------|--------|--------|--------|--------|
| Skor Keamanan | 0/8 | 4/8 | 8/8 | 7/8 | Tier C |
| Gas Deposit | 31,412 | 31,427 | 122,769 | 34,156 | Tier B |
| SPG | 0 | 127 | 65 | **205** | **Tier D** |
| Ranking | 4 | 2 | 3 | **1** | **Tier D** |
