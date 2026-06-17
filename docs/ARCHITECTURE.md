# Arsitektur Sistem

Dokumentasi arsitektur untuk skripsi "Optimalisasi Gas dan Keamanan Smart Contract Bridge Menggunakan EIP-1153 Transient Storage dan Early Warning System".

---

## Class Diagram

```mermaid
classDiagram
    direction TB

    class UnoptimizedBridge {
        <<Tier A: Baseline>>
        -address admin
        -bool isPaused
        -bool locked
        -mapping(address => uint256) balances
        -uint256 reserveETH
        -uint256 reserveToken
        +deposit() payable
        +withdraw(uint256 amount)
        +swapETHForTokens() payable
        +receive() payable
    }

    class BridgeStaticOnly {
        <<Tier B: Static Optimization>>
        -address immutable admin
        -UserBalance userBalances
        -PoolReserves reserves
        +deposit() payable
        +withdraw(uint96 amount)
        +swapETHForTokens(uint96 minTokensOut) payable
        +receive() payable
    }

    class VictimBridge {
        <<Tier C: Dynamic Optimization>>
        -address immutable admin
        -bool paused
        -MonitorMock monitor
        -UserBalance userBalances
        -PoolReserves reserves
        +deposit() payable
        +withdraw(uint96 amount)
        +swapETHForTokens(uint96 minTokensOut) payable
        +pause()
        +unpause()
        +receive() payable
    }

    class MonitorMock {
        <<Early Warning System>>
        -uint256 CALL_DEPTH_SLOT
        -uint256 P_detect
        -uint256 lambda
        -address admin
        -TransactionRecord[] txRecords
        +updateParameters(uint256 _pDetect, uint256 _lambda)
        +recordTransaction(address sender, uint256 amount, uint8 txType)
        +clearRecords()
        +enterCall()
        +exitCall()
        +callDepth() uint256
        +checkAnomaly(address sender, uint256 amount, uint8 txType) (bool, uint256)
        +calculatePenalty(uint256 amount, uint256 anomalyScore) uint256
    }

    class BridgeWithSSTOREGuard {
        <<Benchmark: SSTORE Guard>>
        -UserBalance userBalances
        -uint256 totalDeposits
        -uint256 _NOT_ENTERED
        -uint256 _ENTERED
        -uint256 _status
        +deposit() payable
        +withdraw(uint96 amount) nonReentrant
        +receive() payable
    }

    class Attacker {
        <<Reentrancy Simulator>>
        -UnoptimizedBridge unoptimizedBridge
        -BridgeStaticOnly staticBridge
        -VictimBridge victimBridge
        -LightweightBridge lightweightBridge
        -uint256 attackAmount
        -uint256 attackCount
        -uint8 attackTarget
        +attackUnoptimized() payable
        +attackStatic() payable
        +attackVictim() payable
        +attackLightweight() payable
        +receive() payable
    }

    class LightweightBridge {
        <<Tier D: Lightweight Dynamic>>
        -uint256 constant REENTRANCY_SLOT
        -address immutable admin
        -bool paused
        -LastTx lastTx
        -uint256 lastTxBlock
        -UserBalance userBalances
        -PoolReserves reserves
        +deposit() payable
        +withdraw(uint96 amount)
        +swapETHForTokens(uint96 minTokensOut) payable
        +recordFrontrun(address attacker, uint256 amount)
        +pause()
        +unpause()
        +receive() payable
    }

    class UserBalance {
        <<Struct: 1 Slot>>
        address userAddress
        uint96 balance
    }

    class PoolReserves {
        <<Struct: 1 Slot>>
        uint96 ethReserve
        uint96 tokenReserve
    }

    class TransactionRecord {
        <<Struct>>
        address sender
        uint256 amount
        uint256 blockNumber
        uint8 txType
    }

    class LastTx {
        <<Struct: 1 Slot>>
        address sender
        uint8 txType
    }

    VictimBridge --> MonitorMock : uses EWS
    VictimBridge *-- UserBalance : packed
    VictimBridge *-- PoolReserves : packed
    LightweightBridge *-- UserBalance : packed
    LightweightBridge *-- PoolReserves : packed
    LightweightBridge *-- LastTx : single-slot MEV
    BridgeStaticOnly *-- UserBalance : packed
    BridgeStaticOnly *-- PoolReserves : packed
    MonitorMock *-- TransactionRecord : stores
    Attacker --> UnoptimizedBridge : attacks
    Attacker --> BridgeStaticOnly : attacks
    Attacker --> VictimBridge : attacks
    Attacker --> LightweightBridge : attacks
```

---

## Sequence Diagram: Deposit Normal

```mermaid
sequenceDiagram
    participant User
    participant VB as VictimBridge
    participant EWS as MonitorMock

    User->>VB: deposit() {value: 1 ETH}
    activate VB
    VB->>VB: Check paused == false
    VB->>VB: Validate amount > 0
    VB->>VB: Update UserBalance (packed slot)
    VB-->>User: emit Deposit(user, amount, newBalance)
    VB->>EWS: recordTransaction(user, amount, 1)
    deactivate VB
```

---

## Sequence Diagram: Reentrancy Attack Blocked

```mermaid
sequenceDiagram
    participant Attacker
    participant VB as VictimBridge
    participant EWS as MonitorMock

    Attacker->>VB: deposit() {value: 10 ETH}
    activate VB
    VB->>EWS: recordTransaction(attacker, 10 ETH, 1)
    VB-->>Attacker: emit Deposit
    deactivate VB

    Attacker->>VB: withdraw(10 ETH)
    activate VB
    VB->>EWS: recordTransaction(attacker, 10 ETH, 1)
    VB->>EWS: enterCall()
    Note over EWS: TSTORE: depth = 0 -> 1

    VB->>VB: Check balance >= amount
    VB->>EWS: checkAnomaly(attacker, 10 ETH, 1)
    EWS-->>VB: (false, 0) — first call, no anomaly

    VB->>VB: Update balance (CEI: Effects first)
    VB->>EWS: exitCall()
    Note over EWS: TSTORE: depth = 1 -> 0

    VB->>Attacker: send 10 ETH
    activate Attacker
    Note over Attacker: receive() fallback triggered

    Attacker->>VB: withdraw(10 ETH) [REENTRANCY]
    activate VB
    VB->>EWS: enterCall()
    Note over EWS: TSTORE: depth = 0 -> 1

    VB->>EWS: checkAnomaly(attacker, 10 ETH, 1)
    Note over EWS: detectTa1 pattern: previous tx was frontrun
    EWS-->>VB: (false, 9600) — anomaly detected

    VB->>VB: Calculate penalty (lambda * P_detect)
    VB->>VB: balance already = 0, revert InsufficientBalance
    deactivate VB

    Note over Attacker: Recursive call failed
    deactivate Attacker
    VB-->>Attacker: TransferFailed() reverted
```

---

## Sequence Diagram: MEV Sandwich Detection

```mermaid
sequenceDiagram
    participant Attacker
    participant VB as VictimBridge
    participant EWS as MonitorMock
    participant Victim

    Note over Attacker: Frontrun (Ta1)
    Attacker->>VB: swapETHForTokens(0) {value: 5 ETH}
    activate VB
    VB->>EWS: checkAnomaly(attacker, 5 ETH, 1)
    EWS-->>VB: (false, 0) — no prior tx, OK
    VB->>EWS: recordTransaction(attacker, 5 ETH, 0)
    Note over EWS: txType = 0 (frontrun)
    VB->>VB: Execute swap
    deactivate VB

    Note over Victim: Victim Transaction (Tv)
    Victim->>VB: swapETHForTokens(minOut) {value: 2 ETH}
    activate VB
    VB->>EWS: checkAnomaly(victim, 2 ETH, 1)
    Note over EWS: Detect: lastTx.txType == 0 (frontrun)<br/>and lastTx.blockNumber == block.number
    EWS-->>VB: (false, 9600) — sandwich detected
    VB->>VB: Calculate penalty: 5 ETH * 15000 * 9600 / 100000000
    VB->>EWS: recordTransaction(victim, 2 ETH, 1)
    VB->>VB: Execute swap with reduced amountOut
    VB-->>Victim: emit Swap + AnomalyDetected
    deactivate VB

    Note over Attacker: Backrun (Ta2) — profit reduced
    Attacker->>VB: swapETHForTokens(0) {value: 5 ETH}
    activate VB
    VB->>EWS: checkAnomaly(attacker, 5 ETH, 1)
    EWS-->>VB: (false, 0) — safe for now
    VB->>VB: Execute swap — but victim already got penalized
    deactivate VB
```

---

## Flowchart: Dynamic Rollup Submission Engine

```mermaid
flowchart TD
    Start[New Block] --> TxGen[Generate Random Transactions]
    TxGen --> Mempool[Add to Mempool]
    Mempool --> CalcEffective[Calculate Effective Size:<br/>effective = txCount * 120 * 0.88]

    CalcEffective --> CheckTarget{effective >= 100KB<br/>OR delay >= 25 blocks?}

    CheckTarget -->|No| Wait[Wait for Next Block]
    Wait --> TxGen

    CheckTarget -->|Yes| CompareCost[Calculate Costs:<br/>Calldata = effective * 16 * L1Fee<br/>Blob = 128KB * BlobFee]

    CompareCost --> Decision{Blob Cost<br/>< Calldata Cost?}

    Decision -->|Yes| UseBlob[Submit via BLOB<br/>(EIP-4844)]
    Decision -->|No| UseCalldata[Submit via CALLDATA<br/>(Fallback)]

    UseBlob --> Record[Record Batch in History]
    UseCalldata --> Record

    Record --> ResetMempool[Reset Mempool Counter]
    ResetMempool --> TxGen

    style UseBlob fill:#e6f4ec,stroke:#0d7a3f
    style UseCalldata fill:#fde8e8,stroke:#b91c1c
    style CheckTarget fill:#e8eefb,stroke:#1a56db
    style Decision fill:#fef3cd,stroke:#b45309
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  DYNAMIC ROLLUP ENGINE               │
│  Python: Monte Carlo Simulation (100 runs x 1000 blocks) │
│  Output: 98.21% cost savings (Blob vs Calldata)     │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              SMART CONTRACT BRIDGE                   │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Tier A   │  │ Tier B   │  │ Tier C           │  │
│  │ Baseline │  │ Static   │  │ Dynamic (EIP-1153)│  │
│  │          │  │          │  │ + EWS             │  │
│  │ No guard │  │ CEI      │  │ TSTORE/TLOAD      │  │
│  │ Reentr-  │  │ Packing  │  │ MEV Detection     │  │
│  │ anciable │  │ Safe     │  │ Emergency Pause   │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                    TESTING                           │
│  86 tests: Fuzz, Invariant, Edge Case, Security     │
│  Statistical: t-test, CI 95%, Cohen's d             │
│  Audit: Slither (80 findings, 0 critical)           │
└─────────────────────────────────────────────────────┘
```

---

## EIP-1153 Transient Storage Flow

```mermaid
flowchart LR
    subgraph "Traditional (SSTORE)"
        S1[SSTORE _ENTERED = 2<br/>~20,000 gas cold] --> S2[Execute Function]
        S2 --> S3[SSTORE _NOT_ENTERED = 1<br/>~5,000 gas warm]
    end

    subgraph "EIP-1153 (TSTORE)"
        T1[TSTORE CALL_DEPTH_SLOT = 1<br/>~100 gas] --> T2[Execute Function]
        T2 --> T3[Auto-reset to 0<br/>~0 gas]
    end

    style S1 fill:#fde8e8,stroke:#b91c1c
    style S3 fill:#fde8e8,stroke:#b91c1c
    style T1 fill:#e6f4ec,stroke:#0d7a3f
    style T3 fill:#e6f4ec,stroke:#0d7a3f
```
