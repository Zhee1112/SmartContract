

## Quantifying Blockchain Extractable Value:
How dark is the forest?
## Kaihua Qin
## Imperial College London
kaihua.qin@imperial.ac.uk
## Liyi Zhou
## Imperial College London
liyi.zhou@imperial.ac.uk
## Arthur Gervais
## Imperial College London
a.gervais@imperial.ac.uk
Abstract—Permissionless   blockchains   such   as   Bitcoin   have
excelled  at  financial  services.  Yet,  opportunistic  traders  extract
monetary  value  from  the  mesh  of  decentralized  finance  (DeFi)
smart  contracts  through  so-called  blockchain  extractable  value
(BEV). The recent emergence of centralized BEV relayer portrays
BEV  as  a  positive  additional  revenue  source.  Because  BEV  was
quantitatively shown to deteriorate the blockchain’s consensus se-
curity, BEV relayers endanger the ledger security by incentivizing
rational miners to fork the chain. For example, a rational miner
with  a10%  hashrate  will  fork  Ethereum  if  a  BEV  opportunity
exceeds4�,the  block  reward.
However,  related  work  is  currently  missing  quantitative  in-
sights  on  past  BEV  extraction  to  assess  the  practical  risks  of
BEV  objectively.  In  this  work,  we  allow  to  quantify  the  BEV
danger  by  deriving  the  USD  extracted  from  sandwich  attacks,
liquidations, and decentralized exchange arbitrage. We estimate
that over32months, BEV yielded540.54M USD in profit, divided
among11,289addresses when capturing49,691cryptocurrencies
and60,830on-chain markets. The highest BEV instance we find
amounts  to4.1M  USD,616.6�,the  Ethereum  block  reward.
Moreover,  while  the  practitioner’s  community  has  discussed
the  existence  of  generalized  trading  bots,  we  are,  to  our  knowl-
edge, the first to provide a concrete algorithm. Our algorithm can
replace unconfirmed transactions without the need to understand
the  victim  transactions’  underlying  logic,  which  we  estimate
to   have   yielded   a   profit   of57,037.32ETH   (35.37M   USD)
over32months  of  past  blockchain  data.
Finally, we formalize and analyze emerging BEV relay systems,
where  miners  accept  BEV  transactions  from  a  centralized  relay
server  instead  of  the  peer-to-peer  (P2P)  network.  We  find  that
such  relay  systems  aggravate  the  consensus  layer  attacks  and
therefore  further  endanger  blockchain  security.
## I.  INTRODUCTION
With  a  locked  value  of  over90B  USD  in  Decentralized
Finance (DeFi), distributed ledgers have shown their strength
in mediating trustlessly among financial actors exchanging daily
hundreds of millions of USD. DeFi traders rely on immutable
smart  contracts  encoding  the  rules  by  which,  for  instance,
automated market maker (AMM) exchanges [1] operate. DeFi
on permissionless blockchains operates surprisingly transparent
compared to the traditional finance. All transactions, sender,
receiver  and  amounts  are  publicly  visible  on  a  global  P2P
network,  prior  to  being  committed  by  miners  to  the  ledger.
Miners herein retain the privilege to control single-handedly
the  transaction  order  of  their  mined  blocks,  an  information
asymmetry which is being exploited for financial gain [2].
Besides  miners,  blockchain  value  extracting  traders  have
specialized in maximizing financial revenue through ongoing
market participation. Similar to the traditional finance, DeFi is
## Transaction Replay
## Potentially Extractable
188,365 transactions
## 35.37M USD
(Section V)
## Blockchain Extractable Value
## Liquidation
## Arbitrage
## Extracted
31,057 transactions
## 89.18M USD
(Section IV.B)
## Extracted
1,151,448 transactions
## 277.02M USD
(Section IV.C)
## Extracted
750,529 attacks
## 174.34M USD
(Section IV.A)
## Sandwich Attack
443 replayable liquidations
## 20.44K USD
1,268 replayable arbitrages
## 165.38K USD
240,053 privately relayed sandwich attacks
## 81.04M USD
1,956 privately relayed liquidations
## 10.69M USD
110,026 privately relayed arbitrages
## 82.75M USD
6,685 privately relayed replayable transactions
## 3.63M USD
Fig. 1: Overview of various sources of blockchain extractable
value. We find that sandwich attacks, liquidations and arbitrage
yield540.54M USD of BEV over32months. We further eval-
uate a novel application-agnostic transaction replay algorithm,
which could have extended BEV by35.18M USD.
being  plagued  by  predatory  traders,  showcasing  a  plethora
of  creative  market  manipulation  techniques,  such  as  high-
frequency  attacks  [2],  pump  and  dump  schemes  [3]  and
wash trading [4]. Akin to how Eskandiret al.[5] beautifully
distill the state of open and decentralized ledgers: we observe
a  distributed  network  of  transparent  dishonesty  —  once  a
user broadcasts a profitable transaction, seemingly automated
trading-bots attempt to appropriate the trading opportunity by
front-running their victim with higher transaction fees [6] to
extractblockchain extractable value(BEV).
The  existence  of  BEV  appears  to  radically  transform  the
distributed ledger incentive structure. Previous studies [7], [8]
suggest,  and  show,  that  miners  are  incentivized  to  extract
value by deliberately forking a chain, endangering blockchain
security.  To  the  best  of  our  knowledge,  no  work  has  yet
comprehensively measured and studied the real-world severity
of BEV. Quantifying the status quo of BEV, however, is crucial
to understand the risks that blockchain users are exposed to.
In this work we capture a variety of BEV sources, including
sandwich attacks, liquidations, and arbitrage (cf. Fig. 1 and Sec-
tion IV). We moreover present the first generalized transaction
replay algorithm, which allows to clone and front-run a victim
transaction without the need to understand the underlying victim
transaction logic (cf. Section V). The potential extractable value
from transaction replay attacks can significantly extend the total
BEV (cf. Fig. 1), further endangering the blockchain security.
More  worryingly,  we  observe  the  recent  emergence  of
## 1
arXiv:2101.05511v5  [cs.CR]  10 Dec 2021

centralized BEV relayer (e.g., flashbots). A BEV relayer acts
as a proxy between BEV traders and miners, filtering the trades
that are forwarded to the miners. The goal of a BEV relayer
is to maximize BEV, and hence in expectation, increases the
number of blockchain forks and chain reorganizations [8].
Summarizing, our main contributions are as follows.
•We are the first to comprehensively measure the breadth
of  BEV  from  known  trading  activities  (i.e.,  sandwich
attacks,  liquidations,  and  arbitrages).  Although  related
works have studied sandwich attacks in isolation, there is
a lack of quantitative data from real-world exploitation to
objectively assess their severity.
•We  are  the  first  to  propose  and  empirically  evaluate  a
transaction replay algorithm, which could have resulted
in35.37M USD of BEV. Our algorithm extends the total
captured BEV by35.18M USD, while intersecting with
only1.43% of the liquidation and0.11% of the arbitrage
transactions (cf. Fig. 1).
•We are the first to formalize the BEV relay concept as
an  extension  of  the  P2P  transaction  fee  auction  model.
Contrary to the suggestions of the practitioner community,
we find that a BEV relayer does not substantially reduce
the P2P network overhead from competitive trading.
## II.  BACKGROUND
A.  Blockchain and Smart Contracts
Permissionless blockchains are span by a network of globally
distributed  P2P  nodes  [9].  If  a  user  wishes  to  execute  a
transaction on the blockchain (which in essence is a distributed
database),  the  user  broadcasts  the  transaction  to  its  P2P
neighbors. These neighbors then forward that transaction until
the transaction eventually reaches a miner. A miner constructs a
block to append data to the blockchain and decides unilaterally
on  the  transactions  execution  order.  A  transaction  that  is
included  in  at  least  one  blockchain  block  (i.e.,  the  chain
with  most  “Proof  of  Work”)  is  considered  confirmed  (i.e.,
a  one-confirmation)  by  the  network.  Blockchains  differ  in
confirmation latencies, ranging from hours in Bitcoin [9] to
minutes  in  Ethereum  [10],  while  offering  distinct  security
trade-offs  [11].  Generally,  there  is  an  inherenttime  delay,
between the publicbroadcastof a transaction and its execution.
Blockchain  nodes  store  unconfirmed  transactions  within  the
so-calledmempool. For a more thorough background, we refer
the reader to helpful SoKs [12], [13], [14].
We proceed to outline the required background of Ethereum.
Beyond simple value transfers, Etherum is a smart contract-
enabled blockchain [10], which allows the construction of DeFi
protocols.  Smart  contracts  execute  within  a  virtual  machine
called  Ethereum  Virtual  Machine  (EVM).  In  this  paper,  we
differentiate  among  user  addresses  (i.e.,  owned  by  a  private
key) and smart contract addresses. In Ethereum, blocks can be
indexed  by the  block  number,  an  incremental  integer,  while
transactions  are  often  indexed  by  the  transaction  hash,  the
Keccak-256  hash  value  of  a  transaction.  ETH  is  the  native
cryptocurrency in Ethereum, which can be used to, for example,
pay transaction fees. The transaction fee is calculated withgas
(measuring the amount computations consumed in a transaction)
timesgas price(the amount that the transaction issuer is willing
to  pay  for  each  unit  of  gas).  The  smallest  unit  of  ETH  is
Wei, equivalent to10
## −18
ETH. Transaction fees are commonly
denominated in GWei (i.e.,10
## 9
Wei). In addition to a chain’s
native cryptocurrency, smart contracts allow to create on-chain
assets, so-called tokens. At the time of writing, ERC20 is the
most widely adopted token standard.
## B.  Decentralized Finance
DeFi is a subset of finance-focused decentralized protocols
that  operate  autonomously  on  blockchain-based  smart  con-
tracts  [15].  After  excluding  the  DeFi  systems’  endogenous
assets, the total value locked in DeFi amounts to90B USD
at  the  time  of  writing.  Relevant  DeFi  platforms  are  for
instance automated market maker exchanges [1], [16], lending
platforms [17], [18], [19], [20] and margin trading systems [21].
AMM   Exchanges:Traditional  limit  order-book-based  ex-
changes  maintain  a  list  of  bids  and  asks  for  an  asset  pair.
AMM  exchanges,  however,  maintain  a  pool  of  capital  (i.e.,
a  liquidity  pool)  with  at  least  two  assets.  A  smart  contract
governs the rules by which traders can purchase and sell assets
from the liquidity pool. The most common AMM mechanism
is the constant product rule in a pair-asset market. This rule
stipulates that the product of an assetxand assetyin a pool
remains a constantk. Uniswap, with over8B USD total value
locked (TVL), one of the biggest AMM exchanges at the time
of writing, follows a constant product AMM model [1].
## Slippage:
When performing a trade on an AMM, a trader is
exposed to an expected slippage depending on the available
liquidity in the AMM (i.e., the price gets worse as the trading
volume increases). Furthermore, the expected execution price
may differ from the real execution price (i.e., an unexpected
slippage). That is because the expected price is derived upon
a  past  blockchain  state,  which  may  change  between  the
transaction  creation  and  its  execution  —  e.g.,  due  to  front-
running  transactions  [2].  Therefore,  a  trader  typically  sets  a
slippage  tolerance  (i.e.,  the  maximum  acceptable  slippage)
when issuing an AMM trading transaction.
Lending  Systems:Debt  is  an  essential  tool  in  traditional
finance  [22],  and  the  same  applies  to  DeFi.  DeFi  lending
typically requires over-collateralization [23]. Hence, a borrower
must collateralize, i.e., lock, for instance,150% of the value
that the borrower wishes to lend out. The collateral acts as a
security fund to the lender if the borrower does not pay back the
debt. If the collateral value decreases and the collateralization
ratio decreases below150%, the collateral can be freed up for
liquidation. Liquidators can then purchase the collateral at a
discount  to  repay  the  debt.  At  the  time  of  writing,  lending
systems on the Ethereum blockchain have accumulated a TVL
of40B USD [17], [18], [19], [20].
## III.  PRELIMINARIES
In this section, we outline our security and threat model. We
discuss how the blockchain transaction order relates to BEV
and proceed with a blockchain transaction ordering taxonomy.
## 2

A.  System and Threat Model
We  consider  a  permissionless  blockchain  system  on  top
of  a  P2P  network.  We  assume  the  existence  of  a  traderV
conducting  at  least  one  blockchain  transactionT
## V
## (given
a  public/private  key-pair)  by,  e.g.,  trading  assets  on  AMM
exchanges or interacting with a lending platform. The trader
is free to specify its slippage tolerance, transaction fees, and
choice of platform. We refer to the trader as a victim if other
traders attack the trader (e.g., in a sandwich attack). We further
assume the existence of a set of miners that may or may not
engage in extracting blockchain extractable value. The miners
can choose to order transactions according to internal policies
or may follow the transaction fee distribution.
Our threat model captures a financially rational adversary
Athat  is  well-connected  in  the  network  layer  to  observe
unconfirmed  transactions  in  the  memory  pool.Aholds  at
least one private key for a blockchain account from which it
can  issue  an  authenticated  transactionT
## A
.  We  also  assume
thatAowns a sufficient balance of the native cryptocurrency
(e.g., ETH on Ethereum) to perform actions required byT
## A
## ,
e.g., paying transaction fees or trading assets. IfAis a mining
entity,  thenAcan  unilaterally  decide  which  and  in  which
order transactions figure within its mined blocks. WhenAis a
non-mining entity,Aattempts to extract value by adjusting the
transaction fees or resorting to BEV relayers (cf. SectionVI-A).
B.  Transaction Ordering and Blockchain Extractable Value
Compared to traditional financial systems (e.g., centralized
exchanges),  we  identify  that  the  value  extraction  game  on
blockchains presents two fundamental properties.
## Atomicity:
Multiple actions fit into one transaction and execute
in an all-or-nothing sequence [24], [25]. If a single action of
an atomic transaction fails, all previously executed actions are
reverted without permeating a blockchain state change.
Determinacy:Given  a  blockchain  state,  the  execution  of  a
transaction  is  deterministic.  Trader  can  hence  simulate  or
“predict” the execution result before a transaction is mined.
These two properties are decisive for the value extraction
game.  An  adversary  attempts  to  manipulate  the  transaction
order,  such  that  the  adversarial  transactions  execute  on  a
blockchain  state  which  maximizes  the  adversarial  revenue.
The order manipulation may prioritize adversarial transactions
or  attempt  to  move  a  victim  transaction  to  execute  on  an
unfavorable blockchain state. We provide a detailed transaction
ordering taxonomy in Section III-C.
Previous  works  have  shown  how  trading  bots  engage  in
competitive transaction fee bidding contests [7], [2]. Besides
exchange trading, front-running was observed on blockchain
games,  crypto-collectibles,  gambling,  ICOs,  and  name  ser-
vices [5]. Miner Extractable Value, first introduced by Daian
et  al.[7],  captures  the  blockchain  extractable  value  from
miners. However, non-mining traders can also capture BEV by
adjusting, for example, their transaction fees, and we observe
MEV as a subset of the blockchain extractable value.
## Destructive
Front-Running
## No Manipulation
## Tolerant
Front-Running
## Clogging
Back-Running
Block GeneratedPending Transactions (Mempool)
Execution order/
Accumulative gas used
Fig. 2: Visualization of four adversarial transaction ordering
strategies.T
## V
is the victim andT
## A
the adversarial transaction.
## T
## 1
toT
## 4
, are included in that sequence in the next block.
## C.  Transaction Ordering Taxonomy
In light of the decisive pertinence of the transaction order
on blockchain value extraction, we provide in the following a
transaction ordering taxonomy which extends the three front-
running categories discussed in related work [5]. We explicitly
add a fourth category, which captures the act of back-running
a  transaction  (cf.  Fig.  2).  We  moreover  highlight  the  subtle
but essential impact of an adversarial front-running transaction
on the subsequent victim transaction: eitherT
## A
provokes the
victim transaction to fail, or the adversary takes care to avoid
thatT
## V
reverts after a successful front-running.
Destructive Front-Running:IfT
## A
front-runsT
## V
, and causes
the  execution  ofT
## V
to  fail  (i.e.,  the  EVM  reverts  the  trans-
action state changes), we classify the act of front-running as
destructive. The front-running adversary, therefore, bears no
considerations about its impact on subsequent transactions.
Tolerating  Front-Running:
Front-running is “tolerating”, if
the adversary ensures thatT
## V
executes successfully. Tolerating
front-running is necessary for, e.g., sandwich attacks [2]. An
adversary would not be able to profit from sandwich attacks
with destructive front-running.
Back-Running:
ExecutingT
## A
afterT
## V
is called back-running,
a  technique  which  can  be  applied  after,  e.g.,  oracle  update
transactions [26], [27] and within sandwich attacks [2]. Back-
running is, in expectation, cheaper than front-running, as the
trader does not engage in a fee bidding contest.
Clogging:An adversary may clog, or jam the blockchain with
transactions, to prevent users and bots from issuing transactions
(i.e.,  suppression  [5]).  Deadline-based  smart  contracts  may
create an incentive to clog the blockchain.
TABLE I: Attack surface for non-mining adversaries. Sandwich
attacks and transaction replay occur on the network state.
Use  CaseBlock  StateMempool/Network  State
Sandwich Attack-X
LiquidationXX(back-running oracles)
ArbitrageXX
Transaction Replay-X
## 3

## $1
## $10
## $100
## $1K
## $10K
## $100K
## $1M
## $10M
## $100M
## Monthly Profit
## (USD)
## Total
## Bancor
UniswapV1
UniswapV2
## Sushiswap
UniswapV3
18-1219-0119-0219-0319-0419-0519-0619-0719-0819-0919-1019-1119-1220-0120-0220-0320-0420-0520-0620-0720-0820-0920-1020-1120-1221-0121-0221-0321-0421-0521-0621-0721-08
Year-Month
## 10
## 100
## 1,000
## 10,000
## 100,000
## # Sandwich Attacks
Uniswap V2 launchSushiswap launchUniswap V3 launch
Fig. 3: Sandwich attacks, from block 6803256   (1st of December, 2018) to 12965000   (5th of August, 2021).
Transaction ordering may occur on different blockchain state
representations. We differentiate in this paper between a block
state and a mempool/network state (cf. Table I). A block state
corresponds to the last confirmed main-chain head, while the
mempool state is a more volatile and local state of a blockchain
P2P node. We notice that sandwich attacks (cf. SectionIV-A)
and transaction replay (cf. Section V) can only occur on the
network layer (unless a miner forks the blockchain).
## IV.  MEASURING THEEXTRACTEDBLOCKCHAINVALUE
In the following, we investigate to what extent traders have
extracted financial value from the Ethereum blockchain over a
time frame of32months (from the 1st of December, 2018 to
the 5th of August, 2021). While it is challenging to capture all
possible revenue strategies, we do not claim completeness and
choose to focus on sandwich attacks, liquidations, and arbitrage
trading. For the sandwich and arbitrage, we inspect all the trades
performed on Uniswap V1/V2/V3, Sushiswap, Curve, Swerve,
1inch,  and  Bancor,  spanning  over49,691cryptocurrencies
and60,830on-chain markets. For liquidations, we collect every
liquidation event settled on Aave V1/V2, Compound, and dYdX.
Throughout  our  measurement,  we  identify  transactions  with
zero gas price as privately relayed transactions
## 1
## .
## A.  Sandwich Attacks
Sandwich attacks, wherein a trader wraps a victim transaction
within  two  adversarial  transactions,  is  a  classic  predatory
trading  strategy  [2].  To  perform  a  sandwich,  the  adversary
A, which can be a miner or trader, listens on the P2P network
for pending transactions. The adversary attacks, if the market
price of an asset is expected to rise/fall after the execution of
a “large” pending transaction (T
## V
). The attack is then carried
out in two-steps:(i)AissuesT
## A1
totolerating front-runT
## V
## ,
by purchasing/selling the same asset beforeT
## V
changes the
market price;(ii)Athen issuesT
## A2
toback-runT
## V
to close
the trading position opened byT
## A1
.Amust perform tolerating
front-running to ensure thatT
## V
’s slippage protection does not
trigger a transaction revert.
## 1
Transactions  with  zero  gas  price  are  not  propagating  on  the  Ethereum
P2P  network  due  to  DoS  concerns.  Miners,  however,  might  receive  these
transactions from, for example, BEV relayers (cf. Section VI-A).
1)  Heuristics:We apply the following heuristics to identify
potentially successful sandwich attacks from the AMM trades.
•Heuristic  1:The  transactionsT
## A1
## ,T
## V
andT
## A2
must  be
included in the same block and in this exact order.
•Heuristic  2:Every  front-running  transactionT
## A1
maps
toone  and  only  oneback-running  transactionT
## A2
## .  This
heuristic is necessary to avoid double counting revenues.
•Heuristic  3:BothT
## A1
andT
## V
transact from assetXtoY.
## T
## A2
transacts in the reverse direction from assetYtoX.
•Heuristic 4:Either the same user address sends transactions
## T
## A1
andT
## A2
, or two different user addresses sendT
## A1
and
## T
## A2
to the same smart contract.
•Heuristic 5:The amount of asset sold inT
## A2
must be within
90%∼110%of the amount bought inT
## A1
. If the sandwich
attack is perfectly executed without interference from other
market  participants,  the  amount  sold  inT
## A2
should  be
precisely equal to the amount purchased inT
## A1
## . According
to our empirical data603,431(80.4%) sandwich attacks we
detect are “perfect”. We further relax this constraint to cover
±10%slippage,  thus  finding147,098(19.6%)  additional
imperfect profitable sandwich attacks.
2)  Empirical Results:In total, we identify2,419Ethereum
user addresses and1,069smart contracts performing750,529
sandwich  attacks  on  Uniswap  V1/V2/V3,  Sushiswap,  and
Bancor, with a total profit of174.34M USD (cf. Fig. 3). Our
heuristics do not find sandwich attacks on Curve, Swerve, and
1inch. Curve/Swerve are specialized in correlated, i.e., pegged-
coins  with  minimal  slippage.  Despite  the  small  market  cap.
(<1%of Bitcoin), SHIB is the most sandwich attack-prone
ERC20 token with an adversarial profit of6.84M USD.
We  notice  that240,053sandwich  attacks  (31.98%)  are
privately relayed to miners (i.e., zero gas price), accumulating
a profit of81.04M USD. Sandwich attackers therefore actively
leverage  BEV  relay  systems  (cf.  SectionVI-A)  to  extract
value. We also observe that17.57%of the attacks use different
accounts to issue the front- and back-running transactions.
## Sandwich  Transaction  Positions:
A  sandwich  attack  adver-
sary  typically  attempts  to  position  its  transactions  relatively
close to the victim transaction. In practice, we observe multiple
profitable  sandwich  attacks  where  the  involved  transactions
are separated by more than200intermediate transactions (cf.
## 4

18-1219-0119-0219-0319-0419-0519-0619-0719-0819-0919-1019-1119-1220-0120-0220-0320-0420-0520-0620-0720-0820-0920-1020-1120-1221-0121-0221-0321-0421-0521-0621-0721-08
Year-Month
## 10
## 100
## 1,000
## # Addresses
Smart contracts
User addresses
(a) Number of active adversarial sandwich user addresses and smart
contracts detected over time.
BancorUniswapV1UniswapV2SushiswapUniswapV3
## −400
## −200
## 0
## 200
## 400
## # Intermediate Transactions
How many transactionsT
## A1
is ahead ofT
## V
How many transactionsT
## A2
is behind ofT
## V
(b) Relative position of sandwich transactions for profitable attacks.
Fig. 4: Extracted sandwich attacks, from block 6803256   (1st
of December, 2018) to block 12965000  (5th of August, 2021).
Fig.  4b),  while  no  intermediate  transaction  (i.e.,  the  front-
running, victim, and back-running transactions are positioned
one  by  one)  is  detected  in99.59%of  the  privately  relayed
sandwich attacks. We present the sandwich attack gas price
distribution and adversarial strategies in Appendix A-A.
Extractable  Profit:Zhouet  al.[2]  estimate  that  under  the
optimal setting, the adversary can attack7,793Uniswap V1
transactions, and realize98.15ETH of revenue from block 8M
to  9M.  Based  on  our  data,  we  estimate  that  only63.30%
(62.13ETH) of the available extractable value was extracted.
## B.  Fixed Spread Liquidations
We  observe  two  widely  adopted  liquidation  mechanisms
in  the  current  DeFi  ecosystem  [23].  First,  the  fixed  spread
liquidation,  used  by  Aave,  Compound,  and  dYdX,  allows  a
liquidator  to  purchase  collateral  at  a  fixed  discount  when
repaying  debt.  Second,  the  auction  liquidation,  allows  a
liquidator  to  start  an  auction  that  lasts  for  a  pre-configured
period (e.g.,6hours [19]). Competing liquidators bid on the
(lowest possible) collateral price. In this section, we focus on
the fixed spread liquidation, which allows to extract value in a
single, atomic transaction. To perform a fixed spread liquidation,
a liquidatorAcan adopt the following two strategies.
•Block  State  Liquidation:Adetects a liquidation opportu-
nity  at  blockB
i
(i.e.,  after  the  execution  ofB
i
).Athen
issues a liquidation transactionT
## A
, which is expected to be
mined in the next blockB
i+1
.Aattempts todestructively
front-runcompeting liquidators withT
## A
## .
•Network  State  Liquidation:Aobserves a transactionT
## V
## ,
which will create a liquidation opportunity (e.g., an oracle
price update that renders a collateralized debt liquidatable).
Athenback-runsT
## V
with a liquidation transactionT
## A
## .
## 8000000
(Jun-21-2019)
## 9000000
(Nov-25-2019)
## 10000000
(May-04-2020)
## 11000000
(Oct-06-2020)
## 12000000
(Mar-08-2021)
## 12965000
(Aug-05-2021)
Block (Date)
## $0
## $20M
## $40M
## $60M
## $80M
Accumulative Profit (USD)
## Total
## Aave V2
## Aave V1
## Compound
dYdX
(a) Accumulative profit of fixed spread liquidations.
19-0419-0519-0619-0719-0819-0919-1019-1119-1220-0120-0220-0320-0420-0520-0620-0720-0820-0920-1020-1120-1221-0121-0221-0321-0421-0521-0621-0721-08
Year-Month
## 0
## 500
## 1,000
## 1,500
## 2,000
## 2,500
## 3,000
## 3,500
## # Liquidation Events
## Aave V2
## Aave V1
## Compound
dYdX
(b) The monthly number of fixed spread liquidation events.
Fig. 5: The number of liquidations increase in months where
the ETH price collapses, e.g., in March, 2020 and May, 2021.
Empirical Results:We collect all liquidation events on
Aave  (Version1and2),  Compound,  and  dYdX  from  their
inception  until  block  12965000   (5th  of  August,  2021).  We
observe  a  total  of31,057liquidations,  yielding  a  collective
profit  of89.18M  USD  over28months  (cf.  Fig.  5a  and  5b).
Note that we use the prices provided by the price oracles of
the liquidation platforms to convert the profits to USD at the
moment of the liquidation.
Ordering Strategies:To distinguish between a front- or back-
running liquidation, we observe that a front-running liquidation
at  blockB
i
necessarily  requires  a  borrowing  position  to  be
liquidatable  at  blockB
i−1
.  If  the  borrowing  position  is  not
liquidatable at blockB
i−1
, the liquidator is acting after a price
oracle update in blocki, which corresponds to a back-running
liquidation. Therefore, for each of the31,057liquidations that
we observe on blockB
i
, we test whether the borrowing position
was liquidatable at blockB
i−1
. If this test resolves to true, we
classify  the  liquidation  as  front-,  otherwise  as  back-running
(cf.  Table  II).  Given31,057liquidations,  we  find  that  front-
TABLE  II:  Extracting  strategies  of  liquidators.  Liquidators
either back-run the price oracle updates, or front-run competing
liquidation attempts. Most liquidations perform front-running.
## Liquidation  Platform
Front-runningBack-runningTotal
## Aave V24,0852,3476,432
## Aave V14,3316014,932
## Compound6,1193,1689,287
dYdX8,6031,80310,406
## Total23,1387,91931,057
## 5

Aave V2Aave V1CompounddYdX
## 1
## 10
## 100
## 1,000
## 10,000
## 100,000
Gas Price (GWei)
## Front-running
## Back-running
Fig. 6: Transaction fee distributions of front- and back-running
liquidations  (transactions  with  zero  gas  price  are  excluded).
The back-running liquidations pay a higher average gas price,
due to the internal back-running concept.
running is the dominating strategy accounting for74.50%of all
liquidations. Among the31,057liquidations, we identify2,742
unique liquidators by address. We find that1,758liquidators
follow  the  front-,442back-running  and  the  remaining542
liquidators adopt a mixed strategy.
## Liquidation   Gas   Prices:
We  identify1,956transactions
(6.3%)  with  zero  gas  price  out  of  the31,057liquidation
events, implying that liquidators relay liquidation transactions to
miners privately without using the P2P network. These privately
relayed transactions yield a total profit of10.69M USD. We
visualize  the  gas  price  distributions  in  Fig.  6.  Surprisingly,
we notice that the back-running liquidations pay a higher gas
prices on average. We find that this is because the liquidators
tend to wrap the price oracle update action and liquidation into
one (high-priority) transaction, which we term aninternal back-
running  transaction.  The  internal  back-running  transactions
are typically set with a high gas price to prevent them from
being front-run by competing liquidators.
## C.  Arbitrage
Arbitrage  describes  the  process  of  simultaneously  selling
and buying assets in different markets in order to profit from
the market price differences. Arbitrage helps to promote market
efficiency and is typically considered benign. To perform an
arbitrage, DeFi traders/miners monitor new blockchain state
changes and execute an arbitrage if the expected revenue of
synchronizing the prices on two markets exceeds the expected
transaction costs. An arbitrage trader can choose among the
following strategies to perform arbitrage:
•Block  State  Arbitrage:The arbitrage trader can choose to
only monitor the confirmed blockchain states. Once a new
blockB
i
is  received,  the  trader  attempts  to  destructively
front-run all other market participants atB
i+1
## .
•Network   State   Arbitrage:
A  trader  can  listen  on  the
network  layer  to  detect  a  “large”  pending  trade,  which  is
likely to “greatly” change the asset price on one exchange.
The trader then attempts to back-run this exchange transaction
with an arbitrage transaction.
1)  Heuristics:We usesto denote a swap action which
sellsin(s)amount of the input assetIN(s)to purchaseout(s)
amount of the output assetOUT(s). We apply the following
TABLE  III:  Statistics  of  the  profitable  arbitrage  trades  we
detect. Over90%synchronize the prices across2or3markets.
#  markets
#  platforms
123≥4Total
## 28,220(0.7%)452,148(39.3%)N/AN/A460,368(40.0%)
## 3333,039(28.9%)235,878(20.5%)16,431(1.4%)N/A585,348(50.8%)
## 442,816(3.7%)28,963(2.5%)7,497(0.7%)16(0%)79,292(6.9%)
## 5
## 9,460(0.8%)6,996(0.6%)588(0.1%)70(0%)17,114(1.5%)
## ≥62,693(0.2%)5,292(0.5%)1,308(0.1%)33(0%)9,326(0.8%)
## Total396,228(34.4%)729,277(63.3%)25,824(2.2%)119(0%)1,151,448(100%)
heuristics to find extracted arbitrages on Uniswap V1/V2/V3,
Sushiswap, Curve, Swerve, 1inch, and Bancor.
•Heuristic  1:All  swap  actions  of  an  arbitrage  must  be
included  in  a  single  transaction,  implicitly  assuming  that
the arbitrageur minimizes its risk through atomic arbitrage.
•Heuristic 2:Arbitrage must have more than one swap action.
•Heuristic  3:Thenswap actionss
## 1
## ,...,s
n
of an arbitrage
must form a loop. The input asset of any swap action must
be  the  output  asset  of  the  previous  action,  i.e.,IN(s
i
## ) =
OUT(s
i−1
). The first swap’s input asset must be the same as
the last swap action’s output asset, i.e.,IN(s
## 0
) =OUT(s
n
## ).
•Heuristic  4:The  input  amount  of  any  swap  action  must
be less than or equal to the output amount of the previous
action, i.e.,in(s
i
## )≤out(s
i−1
## ).
2)  Empirical Results:From the 1st of December, 2018 to
the  5th  of  August,  2021,  we  identify6,753user  addresses
and2,016smart  contracts  performing1,151,448arbitrage
trades  on  Uniswap  V1/V2/V3,  Sushiswap,  Curve,  Swerve,
1inch, and Bancor, amounting to a total profit of277.02M USD.
We find that110,026arbitrage transactions (9.6%) are privately
relayed to miners, representing82.75M USD of extracted value.
All detected arbitrage trades are executed using smart contracts.
Arbitrage  statistics:To gain more insights on arbitrage, we
classify the transactions according to the number of platforms
and  markets  involved  (cf.  Table  III).  Most  traders  prefer
simple strategies that only involve2or3markets (aka. two-
point arbitrage and triangular arbitrage). Less than3%of the
transactions execute strategies with more than four markets. We,
for example, find that one transaction combines two arbitrage
into one to save gas costs
## 2
. Such optimizations may yield a
higher profit while riskier because the more markets involved,
the more competitors must be front-run. ETH, USDC, USDT,
and DAI are involved in99.91%of the detected arbitrages.
Arbitrage transaction positions:By visualizing the arbitrage
transaction  positions  in  blocks  (cf.  Fig.  8),  we  find  that  a
large number of profitable trades are surprisingly positioned
at  the  end  of  the  blocks.  We  would  have  expected  that  the
arbitrage transactions are competitive and perform destructive
front-running with higher gas prices. For example, one of the
most profitable arbitrage transactions
## 3
we detect is positioned
at index141out of162transactions in this block. Our data
## 2
In the transaction 0x0772..be87, the trader executes the following arbitrage:
WETH→BOXT→UNI→USDT→USDN→UNI→WETH.  This
strategy consists of two triangular arbitrages:(i)WETH→BOXT→UNI
→WETH;(ii)UNI→USDT→USDN→UNI
## 3
In the transaction 0x2c79..81a5, the trader first swaps400ETH for1040
COMP on Uniswap v2, then swaps1040COMP for476ETH on Sushiswap,
realizing a revenue of76ETH.
## 6

## $10
## $100
## $1K
## $10K
## $100K
## $1M
## $10M
## $100M
Monthly Profit (USD)
## Total
## Bancor
UniswapV1
## Curve
UniswapV2
## 1inch
## Sushiswap
## Swerve
UniswapV3
18-1219-0119-0219-0319-0419-0519-0619-0719-0819-0919-1019-1119-1220-0120-0220-0320-0420-0520-0620-0720-0820-0920-1020-1120-1221-0121-0221-0321-0421-0521-0621-0721-08
Year-Month
## 10
## 100
## 1,000
## 10,000
## 100,000
## # Arbitrages
Curve launch
Uniswap V2 launch
Sushiswap, 1inch launch
Swerve launch
Uniswap V3 launch
Fig. 7: Monthly arbitrage statistics from block 6803256   (1st of December, 2018) to block 12965000   (5th of August, 2021).
## 1-10
## 11-2021-3031-4041-5051-6061-7071-8081-90
## 91-100
101-110111-120121-130131-140141-150151-160161-170171-180181-190191-200201-210211-220221-230231-240241-250251-260261-270271-280281-290291-300301-310311-320321-330331-340341-350351-360361-370371-380381-390391-400401-410411-420421-430431-440441-450451-460461-470471-480481-490491-500501-510511-520521-530531-540541-550551-560561-570571-580581-590591-600601-610611-620621-630631-640641-650651-660661-670671-680681-690
Total Transactions in Block
## 0
## 100
## 200
## 300
## 400
## 500
## 600
## 700
## Transaction Index
Fig. 8: Transaction index distribution of all arbitrages we detect.
hence supports the hypothesis that arbitrageurs are performing
back-running  on  the  network  layer.  To  further  confirm  this
hypothesis, we re-execute all arbitrage transactions at the top
of blocks (i.e., upon the previous block state). If a transaction
is  a  block  state  arbitrage,  then  the  execution  should  remain
profitable. We find that44.02%of the arbitrage transactions
are no longer profitable, which indicates that these transactions
perform back-running because the arbitrage opportunity appears
in the same block as the arbitrage transaction.
## D.  Clogging
We observe the practice of blockchain clogging by issuing
simultaneously many transactions to intermediately increase the
costs of writing to the blockchain. We identify various apparent
purposes, such as attacking gambling protocols and mass token
transfers (cf. Appendix A-B for quantitative details).
## E.  Limitations
We proceed to outline the main limitations of our measure-
ments. Notably, as we focus on sandwich attacks, liquidations,
and  arbitrage,  we  do  not  capture  all  possible  sources  of
BEV.  We,  however,  believe  that  our  methodology  can  be
applied  to  other  BEV  sources.  Then,  for  each  BEV  source,
given that we apply custom heuristics, those heuristics have
limitations themselves, which may result in false negatives. For
instance, Heuristic1from the sandwich attacks assumes, that
all transactions must be mined in the same block. There may
exist successful sandwich attacks across multiple blocks, which
(1) observe a potential
victim transaction
(4) attempt to front-run
with
(2) construct replay
transaction
(3) execute
locally to verify the
profitability
Fig. 9: Overview of the transaction replay attack.
we  do  not  capture  and  which  may  result  in  false  negatives.
Also, it could be that by chance two transactions are executed
right before and after a supposed victim transaction. Yet, this
is  not  necessarily  an  attack.  As  such,  heuristics  may  also
introduce  false  positives  into  our  findings.  To  reduce  the
potential inaccuracies of our heuristics, we attempt to tighten
the heuristics to avoid overly reporting revenues. Summarizing,
we  do  not  have  access  to  ground  truth,  which  forces  us  to
present our results as estimates only.
## V.  GENERALIZEDFRONT-RUNNING: TRANSACTIONREPLAY
We proceed to present an application-agnostic method for
an  adversaryAto  extract  value  by  copying  and  replaying
the execution logic of an unconfirmed victim transaction (cf.
Fig. 9). The high-level operations are as follows.
1)Aobserves a victim transaction on the network layer;
2)Aconstructs one or more replay transaction(s) to copy the
execution logic of the victim transaction while diverting
the revenue to an adversary-controlled account;
3)Aperforms concrete validation of the constructed replay
transaction(s) locally to emulate the execution result;
## 4)
if  the  local  execution  yields  a  profit,Aattempts  to
destructively  front-runthe victim transaction.
We  classify  a  replay  transactionT
replay
as  profitable,  if
the native cryptocurrency (e.g., ETH) balance ofAincreases
after the execution ofT
replay
, discounting the transaction fees.
To  measure  profitability,  we  assume  thatAconverts  all  the
received assets (i.e., tokens) within an atomic transaction to
the native cryptocurrency following the replay action.
## 7

1pragma solidityˆ0.6.0;
## 2
3contractMoneymaker {
4functionTransferRevenueToSender()public{
## 5uintprofit;
6// profiting logic omitted for brevity
## 7msg.sender.transfer(profit);
## 8}
## 9
10functionSpecifyBeneficiary(address payable
beneficiary)public{
## 11uintprofit;
12// profiting logic omitted for brevity
## 13beneficiary.transfer(profit);
## 14}
## 15}
Listing 1: Examples of the transaction replay algorithm patterns.
## A.  Algorithm
Traders  frequently  implement  profit-generating  strategies
(e.g.,  arbitrage)  within  smart  contracts  to  perform  complex
operations atomically [25]. We however show that the following
programming patterns expose a transaction to be replayable.
•Sender Benefits:The generated revenue is transferred to the
transaction sender (cf.TransferRevenueToSenderin
Listing 1) without authentication.
•Controllable   Input:The   sender   address   is   specified
in   the   transaction   input   to   receive   the   revenue   (cf.
SpecifyBeneficiaryin Listing 1).
Replay Algorithm:Generally, in a transactionTon a smart-
contract-enabled blockchain (cf. Eq. 1),senderrepresents the
issuer ofT,valuethe amount of native cryptocurrency sent in
T, andinputcontrols the contracts’ execution
## 4
.senderis an
authenticated field verified through the signature, andinputis
arbitrarily amendable.
## T={sender,value,input}(1)
We outline the replay logic in Algorithm 1. When observing
a previously unknown transaction, the adversary constructs the
replay transaction(s) by duplicating all the fields of the potential
victim transaction but substitutes the original transaction sender
address in the input data field with the adversarial address. An
address in an Ethereum transaction input is encoded as a20-
byte array
## 5
. Substitution is therefore efficient through a string
replacement algorithm. The adversary then executes the replay
transaction(s) locally upon the currently highest block. If the
victim  transaction  conforms  to  the  applicable  patterns  (i.e.,
sender benefits and controllable input), the execution of the
replay transaction may yield a positive profit for the adversary,
which can proceed with front-running the victim transaction.
## B.  Replay Evaluation
We apply Algorithm 1 to all the Ethereum transactions from
block 6803256   (1st of December, 2018) to block 12965000
## 4
We ignore irrelevant fields (e.g., nonce).
## 5
According to the Ethereum contract ABI specification [28], an address in
the transaction data is left padded to32bytes. However, the adversary is only
concerned with the effective20bytes when performing the substitution.
Algorithm  1:Transaction Replay Algorithm.
Input:The current highest blockB
i
; the potential victim
transactionT
## V
; the adversarial account addressA.
FunctionConstructReplay(T
## V
## ,A):
T.sender←A
T.value←T
## V
## .value
T.input←substitutingT
## V
.senderinT
## V
.inputwithA
returnT
end
AlgorithmTransactionReplay(T
## V
## ,A):
## T
replay
←ConstructReplay(T
## V
## ,A)
Concretely ExecuteT
replay
upon blockB
i
ifT
replay
is profitablethen
Front-runT
## V
withT
replay
end
end
(5th of August, 2021) capturing a total of883,023,232trans-
actions over32months. We execute every constructed replay
transaction at the position of the potential victim transaction
and verify the profitability. Except for ETH, we consider all
ERC20 tokens earned in the replay transactions as revenues.
When a replay transaction yields a token revenue, we enforce
an exchange transaction that converts the received token to ETH
via on-chain Uniswap markets [1]. We, therefore, measure the
profitability entirely in ETH without the need for an external
price oracle. For simplicity of our analysis, we assume that the
adversary pays1Wei more than the victim transaction for the
gas price of the replay and the potential exchange transaction
(i.e., the minimal cost for a non-mining adversary to front-run).
When  measuring  the  profitability,  we  count  the  replay  and
exchange transaction fees as cost.
We  perform  our  evaluation  on  a  Ubuntu20.04.1LTS
machine  with  AMD  Ryzen  Threadripper3990X(64-core,
2.9GHz),256GB  of  RAM  and4�,2TB  NVMe  SSD  in
Raid0configuration. To execute a replay transaction in a past
block, we download the blockchain state from an Ethereum
full archive node running on the same machine. On average,
generating a replay transaction and verifying its profitability
takes0.18±0.29seconds  (i.e.,  the  time  from  observing  a
victim transaction to broadcasting the replay transaction). We
remark that an adversary can achieve better performance by
running the real-time replay attack inside an Ethereum client
without downloading blockchain states from external sources.
Results:We find188,365profitable transactions (0.02%)
that could have been replayed, accumulating to an estimated
profit of57,037.32ETH (35.37M USD). The most profitable
replay transaction yields a profit of16,736.9ETH. Apart from
ETH,  there  are1,213ERC20  tokens  contributing  a  revenue
of179,843.52ETH  in128,200transactions.  Note  that  the
ERC20 token revenue is higher than the total profit, because
ETH  is  being  used  to  purchase  the  ERC20  token  in  some
transactions (recall that profit equals income minus expenses).
Among  all  replayable  transactions,171,219transactions  fol-
low  thesender  benefitspattern,  while  the  remaining17,146
transactions fall into thecontrollable inputcategory.
## 8

## 7000000
(Jan-02-2019)
## 9000000
(Nov-25-2019)
## 11000000
(Oct-06-2020)
## 12965000
(Aug-05-2021)
Block (Date)
## $0
## $5M
## $10M
## $15M
## $20M
## $25M
## $30M
## $35M
## Accumulative Profit
## (USD)
(a) Accumulative profit that can be extracted by replay attacks.
18-1219-0119-0219-0319-0419-0519-0619-0719-0819-0919-1019-1119-1220-0120-0220-0320-0420-0520-0620-0720-0820-0920-1020-1120-1221-0121-0221-0321-0421-0521-0621-0721-08
Year-Month
## 0
## 2500
## 5000
## 7500
## 10000
## 12500
## 15000
## 17500
## 20000
## # Replayable Transactions
(b) Monthly number of replayable transactions.
Fig.  10:  Replay  attacks  amount  to  a  profit  of35.37M  USD.
We detect19,825replayable transactions in June, 2021 alone.
We show the accumulative profit of the transaction replay
attack in Fig. 10a along with the monthly number of replayable
transactions  in  Fig.  10b.  Notably,  from  block  10954411
to  10954419,  three  transactions,  which  seem  to  exploit  a
smart  contract  vulnerability  [29],  generate  a  total  profit  of
over 41,529 ETH. We also observe a general uptrend in the
number of replayable transactions since January, 2020.
In Table IV, we show the distribution of the upfront ETH
capital  (i.e.,  the  transaction  value)  required  by  the  replay
transactions, and outline the average profit. We find that83.2%
of the replay transactions do not require upfront ETH, except
the  transaction  fees.  We  notice  that  the  replay  profit  is  not
directly  correlated  to  the  transaction  value.1,926replay
transactions  yield  a  profit  of  more  than  one  ETH,  out  of
which1,007transactions are of zero-value.
We find6,685replayable transactions with zero gas price,
representing  a  total  value  of3.63M  USD.  These  privately
relayed  transactions  hence  are  only  replayable  by  mining
adversaries or relay operators. For the other transactions with
positive  gas  price,  in  our  evaluation,  we  assume  that  these
transactions are at some point, prior to being mined, visible in
the mempool. However, from the 22nd of December, 2020 to
the 29th of December, 2020 (in prior to the emergence of BEV
relay systems), we do not find13out of the1,156replayable
transactions  in  our  mempool  (cf.  Appendix  C).  Our  replay
results may hence overestimate the replay potential by1.12%.
TABLE IV: Required upfront ETH and average profit of replay.
Required  upfront  capitalr(ETH)#  replay  transactionsAverage  profit  (ETH)
100< r1362.48±8.05
10< r≤1002,1450.86±2.97
0< r≤1029,3720.21±3.93
r= 0156,7120.31±63.01
C.  Real-Time Detection
Our previous replay results make use of historical on-chain
data, and we extend this analysis with an investigation where
we locally replay transactions in real-time from block 12926988
(30th of July, 2021) to block 12965000   (5th of August, 2021).
To this end, we modify a go-ethereum client which connects
to at most200peers. Following Algorithm 1, our client tests
whether every received transaction from the P2P network is
replayable. To avoid any doubt, our experiments remain local
as we do not attempt to share our replay transactions.
Results:From  a  total  of8,206,977tested  transactions,
our real-time investigation find166unique and non-conflicting
transactions  that  are  locally  replayable.  If  we  compare  that
number  to  the  replayable  candidates  from  on-chain  data,
within  the  same  time-frame,  we  find576unique  (and  non-
conflicting) replayable transactions with a positive gas price.
The  discrepancy  of  those  numbers  indicates,  that  our  node
is  insufficiently  connected  in  the  P2P  network,  and  hence
misses relevant replayable victims. We would welcome future
work to use this metric as a success indicator of P2P network
connectivity of an adversarial node.
The on-chain data moreover exposes89replayable transac-
tions with zero gas price. These transactions were likely mined
through private agreements or a BEV relayer, and our real-time
node naturally has no means to capture these transactions.
## D.  Understanding Replayable Transactions
The replay algorithm may act on any unconfirmed transaction
without  understanding  its  logic.  To  shed  light  on  the  nature
of the replayable transactions, we cross-compare the188,365
replayable  transactions  with  the  data  from  Section  IV.  We
detect443fixed  spread  liquidations  (cf.  SectionIV-B)  con-
tributing a total profit of20.44K USD, and1,268arbitrages
(cf. SectionIV-C) contributing a total profit of165.38K USD.
These  results  suggest  that  the  replay  transactions  capture  a
different set of profit-generating transactions than liquidations
and arbitrage. In AppendixB-A, we provide a case study of
replayable  transactions.  We  find  that  two  DeFi  attacks  are
replayable, the Eminence exploit [29] and the bZx attack [25].
## E.  Naive Replay Protection
We  proceed  to  present  two  simple  methods  that  protect
profitable transactions from being replayed by Algorithm 1.
(Insecure) Authentication:
Authentication schemes are widely
adopted in on-chain asset custody, e.g., when depositing assets
into a smart contract wallet that can only be redeemed by an
owner. Such schemes can also help to prevent simple replay
attacks (cf.Authenticationin Listing 2, AppendixB-B).
When  the  authentication-enabled  contract  is  invoked  with
an  unauthorized  address,  the  replay  transaction  execution  is
reverted. Such authentication method, however, does not remain
secure against a more sophisticated replay algorithm.
Beneficiary  Provision:To  avoid  a  replay,  the  beneficiary
address  should  not  be  specified  in  the  transaction  input  and
can instead be stored, for example, in the contract storage (cf.
MoveBeneficiaryin Listing 2, Appendix B-B).
## 9

The  aforementioned  methods  mitigate  the  simple  replay
attacks.  However,  an  adversary  could  go  further  in  locally
emulating a victim transaction, extract all emitted events and at-
tempt to reconstruct its application layer logic. Specifically, the
adversary can verify (e.g., given the heuristics of Section IV),
if  a  transaction  is  an  arbitrage  or  liquidation.  A  profitable
transaction  can  then  be  constructed  following  the  extracted
application  logic  and  parameters.  We  however  remark  that
this replay method requires prior understanding of the specific
application and therefore does not generalize further.
## F.  Advanced Replay Protection
A  more  robust  replay  protection  mechanism  requires  that
(i)no entity besides the issuer can inspect the transaction and,
(ii)the miner can validate, but not view, the transaction.
Ironically, under strong trust assumptions, a BEV relayer,
which  we  further  discuss  in  the  next  section,  may  help  to
protect against replay attacks. The relayer, however, needs to
be trusted and the miner must not perform replay attacks.
Fair  ordering  techniques  [30]  (as  further  outline  in  Sec-
tionVII-B)  may  also  help  to  grant  the  original  transaction
issuer priority access to the blockchain. Unfortunately, state-of-
the-art fair ordering techniques for permissionless blockchains
are still vulnerable to well connected network layer adversaries.
A more elaborate alternative replay protection mechanism
could  be  constructed  with  trusted  hardware  modules  such
as  Intel  SGX  [31].  Let’s  assume  that  miners  are  operating
SGX  enclaves  ordering  transactions  within  mined  blocks.
Traders  could  perform  remote  attestation  to  verify  that  the
ordering enclave is following transparently outlined rules of
inclusion. The trader can then establish an end-to-end encrypted
TLS  connection  towards  the  miner  enclave,  and  provide  its
transactions privately. The trader would be required to establish
direct E2E-encrypted channels to all major miners/pools and
concurrently send its transaction as in to avoid a replay attack.
Unfortunately, in part due to DoS concerns, it is unclear whether
miners would be willing to broadly open up their transaction
ordering mining nodes to the public internet.
Also  note  that  the  approaches  above  are  not  immune  to
blockchain fork and reorganization attacks (which unfortunately
are incentivised through BEV revenue, cf. Section VII), as a
transaction becomes public once its block is broadcasted.
## VI.  BEV RELAYER ANDAUCTIONS
Miners  by  default  choose  transactions  from  the  mempool
in  a  descending  transaction  fee  order  (e.g.,  gas  price).  The
emerging BEV relayer, however, provide an additional transac-
tion “salesroom”: an trader propagates transactions to miners
through a centralized relay system and shares the transaction
profit with miners directly instead of paying transaction fees.
In the following, we formalize an abstract BEV auction game
capturing the P2P and the centralized BEV relayer model. We
then quantitatively analyze how the introduction of BEV relayer
impacts the P2P network and the consensus layer.
BEV Relayer
## Searchers
BEV transaction(s)
## Miners
BEV transaction(s)
Block with the most
profitable transaction(s)
in the first position(s)
May mitigate DoS but has full visibility
of profit generating transactions.
Can censor and reorder transactions.
Fig.  11:  Architecture  of  a  BEV  relay  mechanism,  where
a  centralized  and  trusted  server  mediates  between  traders
discovering BEV-extracting opportunities and miners.
A.  BEV Relayer
BEV relayers are centralized entities that provide a mediation
service  between  traders  seeking  to  extract  BEV  (so-called
“searchers”) and miners (cf. Fig. 11). The relayer is a server,
to  which  searchers  submit  one  or  multiple  transactions  (a
bundle) that are then forwarded to the miners peered with the
relayer. We observe that searchers perform sandwich attacks
(cf.  SectionIV-A)  by  packing  the  victim  transaction  and
attack transactions into one bundle. The bundle fee mechanism
guarantees that no transaction fee is paid if the transactions
would fail. Miners operate an augmented client, which filters
and positions the most profitable bundle(s) at the top of the next
mined block. The BEV relay service is advertised to provide the
following benefits:(i)The relayer claims not to publish BEV
transactions.(ii)Searchers do not pay for failed transactions.
(iii)Miners receive a share from the bundle revenue.(iv)P2P
network congestion is claimed to be reduced.(v)Blockchain
transaction fees are claimed to be reduced.
B.  BEV Auction Modeling
We  assume  that  a  set  ofnplayers{P
## 0
## ,P
## 1
## ,...,P
n−1
## }
compete  for  a  BEV  opportunityO,  which  can  be  extracted
through front- or back-running (cf. SectionIII-C). We assume
that if extracted,Oyields a revenue ofR
i
(O)for playerP
i
## .
Players may extract different values from the same opportunity
depending on the extraction execution (e.g., the arbitrage paths
and potentially sub-optimal parameters).
We  call  miners  adopting  the  BEV  relayer  system  “relay
miners” and assume that relay miners control a hash-rateαof
the total mining power. The remaining miners are denoted as
“P2P miners”. In this section, we assume that the BEV relayer
honestly relays the transactions from players (i.e., searchers in
SectionVI-A) without censoring or reordering transactions. We
further assume that the relayer neither joins the BEV auction
nor reveals any transaction to other players. The relay miners
only pick the most profitable transactions(s) from the relayer
system.  We  assume  that  the  remaining  block  space  is  filled
with the transactions from the P2P network sorted by the paid
transaction fee. The P2P miners pick transactions solely from
the P2P network in transaction fee descending order.
Every playerP
i
can participate in two optional auctions to
extractO. In the P2P auction,P
i
broadcasts transactions in
the P2P network.P
i
places a publicly readable bid in the form
of transaction fees. In the second auction, the relay auction,P
i
does not broadcast transactions. Instead,P
i
forwards crafted
transactions to a centralized BEV relayer which forwards the
## 10

transactions  to  relay  miners.  The  relay  miner  is  promised  a
share of the revenue ofR
i
(O), freely configurable by the player.
We assume that players are rational, i.e.,P
i
participates in an
auctioniffthe expected payoff is positive. In the following,
we use the term player and bidder interchangeably.
P2P  Auction  (PA):The  P2P  auction  is  a  first-price  all-pay
auction [32], where the bidder only realizes a profit when its
transaction is executed in the intended future block position.
If  the  bidder’s  transaction  does  not  execute  at  the  intended
position, upon block inclusion the bidder remains liable to a
pay a transaction fee, or may realize a sub-optimal revenue.
We assume thatP
i
adopts the strategyS
i
in the P2P auction,
which  provides  a  winning  probability  ofPr
## PA
## (O,S
i
## ).  We
further assume thatS
i
andPr
## PA
## (O,S
i
)are prior knowledge of
## P
i
obtained from past experience. We formalize the expected
payoff of a P2P auction participation in Eq. 2.
## E
## [
u
## PA
i
## |α
## ]
## = (1−α) Pr
## PA
## (O,S
i
## )R
i
(O)−b
## PA
i
## (O,S
i
## )(2)
b
## PA
i
## (O,S
i
## )
is  the  transaction  feeP
i
is  willing  to  pay  to  the
miners. Note that we ignore that the transaction execution result
may impact the transaction fee. In a front-running competition,
## P
i
might issue multiple transactions to increase the transaction
fee  bid,b
## PA
i
## (O,S
i
)denotes  the  last  bid.  Eq.  2  shows  that
the existence of BEV relayers (i.e.,α) decreases the players’
expected payoff in the P2P auction. Players may hence refrain
from broadcasting the BEV transactions. We further analyze
the network layer impact of BEV relayers in Section VI-D.
Relay  auction  (RA):
A  BEV  relay  auction  is  a  first-price
sealed-bid auction [33] as bidders do not pay transaction fees
unless they win. Eq. 3 outlines the payoff forP
i
in the relay
auction, when a replay miner produces the next block.
u
## RA
i
## =
## {
## R
i
(O)−b
## RA
i
(O)ifP
i
wins the auction
## 0otherwise
## (3)
b
## RA
i
(O)is  the  rebate  bidders  pay  to  the  miner.  Note  that  a
rational bidder would only pay a fee inferior to the revenue
thatOyields, i.e.,b
## RA
i
## (O)<R
i
## (O).
C.  Incentive Compatibility of the Relay auction Participation
Under  a  rational  setting,  the  relay  auction  payoff  forP
i
is  non-negative  (cf.  Eq.  3).  This  result  implies  that  players
are  always  encouraged  to  participate  in  the  relay  auction,
regardless of the mining power of relay miners or other players’
strategies.  [7]  proposes  a  discouragement  hypothesis  that  in
the  P2P  front-running  competition,  players  are  discouraged
by  the  market  leaders  and  hence  exit  the  game.  We  claim
that this discouragement hypothesis never stands in the relay
auction due to the risk-free nature of the relay auction (under
the  honest  relayer  assumption).  Therefore,  given  the  same
BEV  opportunity,  the  relay  auction  leads  to  a  more  intense
competition than the P2P auction.
## Increasingb
## RA
i
(O)rendersP
i
more  likely  to  win,  but
provides less payoff to the player. In a first-price auction,P
i
does not have a dominant strategy (a strategy that maximizes
the payoff) without knowing the other players’ strategies [33],
which  makes  it  challenging  to  reason  about  howP
i
should
bid. We hence simplify and assume that the rewardR
i
(O)is
independently drawn from the same uniform distribution, i.e.,
## R
i
## (O)∼U(0,R
max
). We assume thatnandU(0,R
max
## )are
prior knowledge ofP
i
## 6
. Under this simplifying assumption, the
Bayesian Nash equilibrium strategy ofP
i
is shown in Eq. 4,
with  the  expected  revenue  of  the  miner  provided  in  Eq.  5.
Proofs for Eq. 4 and 5 can be found in [33].
b
## PA
i
## (O,S
i
## ) =
n−1
n
## R
i
## (O)(4)
## E
## [
max
i
b
## PA
i
## (O,S
i
## )
## ]
## =
n−1
n+ 1
## R
max
## (5)
Eq. 4 implies that a player should bid more (i.e., pay higher
fees) when the number of players increases. Therefore, the relay
miners earn more revenue under a Bayesian Nash equilibrium
when there are more relay auction bidders (cf. Eq. 5). We have
shown that a first-price setting ensures a non-negative payoff,
which incentivises participation. We can conclude that the first-
price relay auction leans toward allocating the vast majority
of BEV to relay miners, which we callrevenue concentration.
This concentration then aggravates the incentivizes miners have
to perform attacks on the consensus layer, which endangers
the blockchain security (cf. Section VII).
D.  Network Impact of the BEV Relayer
BEV  relayers  advertise  to  reduce  the  P2P  network  layer
congestion  from  competitive  trading  bots.  In  this  section,
we  proceed  to  analyze  when  players  actually  refrain  from
broadcasting BEV transactions on the P2P network due to the
availability of BEV relayer. We first define the concept of a
protogenetic opportunity(cf. Definition VI.1).
Definition  VI.1.(Protogenetic  Opportunity)  A  BEV  oppor-
tunityOis  protogenetic  for  a  playerP
i
,  ifE
## [
u
## PA
i
## |0
## ]
## >0,
i.e., the expected reward is positive when the mining power
adopting BEV relayers is zero.
Protogenetic opportunities represent the transactions thatP
i
would broadcast to the P2P network, when there is no BEV
relayer. To quantify the impact of BEV relayers on the P2P
network, we empirically measure how many protogenetic BEV
transactions could have been prevented from propagating in
the P2P network due to the introduction of BEV relayers.
Given BEV relayers,P
i
participates in the P2P auction only
whenE
## [
u
## PA
i
## |α
## ]
>0.  Following  Eq.  2  and  Def.  VI.1,  we
claim that the BEV relayers preventP
i
from broadcasting a
transaction extractingOwhen satisfying Eq. 6.
## 1
## Pr
## PA
## (O,S
i
## )
## <
## R
i
## (O)
b
## PA
i
## (O,S
i
## )
## ︸
## ︷︷︸
revenue-fee ratio
## <
## 1
## (1−α) Pr
## PA
## (O,S
i
## )
## (6)
Intuitively, for an opportunityO, if the revenue-fee ratio is
too low, a rational playerP
i
will not broadcast the transaction,
no matter whether a BEV relayer exists or not. If the revenue-
fee ratio is high,P
i
may still want to take a risk and participate
## 6
In practice,P
i
can approximateU(0,R
max
)or any other hypothetical
distribution from all the P2P auction transactions, which are public, andn
from the success rate of the previous relay auctions.
## 11

## 0%10%20%30%40%50%60%70%80%90%
## Relay Miners
## 0%
## 10%
## 20%
## 30%
## 40%
## 50%
## Network Overhead Reduction
Fig.  12:  The  percentage  of  the  arbitrage  transactions  (cf.
SectionIV-C) that could have been prevented from broadcasting
on the P2P network due to the introduction of BEV relayers.
in the P2P auction. Therefore, the BEV relay system only helps
to discourage the propagation when the transaction revenue-fee
ratio falls into the middle-range specified in Eq. 6, given the
mining power of relay miners (i.e.,α).
Results:We measure the network impact of BEV relayers
given the1,041,422arbitrages with positive transaction fees in
SectionIV-C. Specifically, we calculate the revenue-fee ratio
of every transaction and check if the ratio satisfies Eq. 6. We
are unaware of the winning probability of the players in the
P2P auction (i.e.,Pr
## PA
## (O,S
i
)). Hence, for every transaction,
we draw the value ofPr
## PA
## (O,S
i
)from a uniform distribution
ranging from10%to90%, i.e.,Pr
## PA
## (O,S
i
)∼U(0.1,0.9). We
present the results under different relay mining power values in
Fig. 12. Under10%relay miners, only5.5%of the arbitrage
transactions would be prevented from propagating in the P2P
network. We show that even when90%of the miners adopt
BEV  relayer  systems,  there  are  still56.1%of  the  arbitrage
transactions that would propagate in the P2P network.
## E.  Privately Relayed Transactions
Transactions that are mined without appearing in the P2P net-
work are referred to as privately relayed transactions. Besides
BEV  relayers,  we  notice  that  miners  also  reach  agreements,
e.g., with exchanges to mine privately propagated transactions.
From  the  22nd  December,  2020  to  29th  December,  2020
(prior to the emergence of BEV relayers), we identify136,143
privately  relayed  transactions  out  of  a  total  of8,285,218
(1.64%). Detailed results are shown in Appendix C.
F.  BEV Relayer Remarks
Summarizing, our analysis provides the following novel and
generic insights for smart contract enabled blockchains:
•BEV relayers aggravate consensus layer attacks by rendering
MEV more competitive, yielding higher MEV opportunities
and further incentivising miners to fork over MEV [8].
## •
Contrary to the suggestions of the practitioners community
(e.g., https://github.com/flashbots), our results suggest that
BEV relay mechanisms do not substantially reduce the P2P
network overhead. That is despite the fact that a BEV relayer
introduces an intermediary which increases the centralization
of a permissionless blockchain.
## 0.5�,1�,2�,4�,8�,16�,32�,64�,128�,256�,512�,
BEV / Block Reward
## 0%
## 10%
## 20%
## 30%
## 40%
## 50%
## Mining Power
BEV Forking Threshold
## 1242513
## 10672
## 4508
## 2035
## 1108
## 488
## 397
## 390
## 17
## 4
## 2
## 1
# BEV Opportunities
Fig. 13: Minimum mining power on Ethereum that is incen-
tivized to fork the chain to extract a BEV opportunity ofx�,
the block reward (i.e., BEV forking threshold). We present the
number of historical BEV opportunities per reward multiplier.
## VII.  SECURITYINSIGHTS OFBEV
Previous studies [7] have shown that the blockchain consen-
sus is prone to time-bandit attacks, where miners deliberately
fork and overwrite the main chain attempting to extract MEV
(a subset of BEV). Zhouet al.[8] point out that the time-bandit
attacks are essentially equivalent to double-spending attacks,
which  can  be  captured  by  an  MDP  framework  [11].  When
BEV is four times higher than the block reward, a financially
rational miner with10%mining power is incentivized to fork
the blockchain instead of performing honest mining.
Our measurements show that from the 1st of December, 2018
to the 5th of August, 2021 at least2,407blocks expose a BEV
value  of  over  four  times  the  block  reward  plus  transaction
fees. The highest single-block BEV we find is8,453.9ETH
(4.1M USD) in block 11333037 (616.6times the block reward
plus  transaction  fees).  This  BEV  opportunity  could  have
incentivized  a  miner  with  only0.1%mining  power  to  fork,
which portrays the danger of drastic forking competition among
BEV aware miners. To further understand empirically how the
past BEV opportunities could have endangered the blockchain
consensus security, we follow the MDP framework in [11] and
similar to Zhouet al.[8] derive theBEV forking threshold(cf.
Fig. 13). The BEV forking threshold captures the minimum
mining  power  that  is  incentivized  to  fork  the  blockchain
to  extract  a  BEV  opportunity  ofx�,block  reward.  Fig.  13
further classifies each empirically identified BEV opportunity
depending on its size with respect to the block reward.
BEV  moreover  provides  miners  an  additional  financial
resources to perform bribery [34] and undercutting attacks [35],
where adversarial miners deliberately offer financial rewards
(e.g., extractable BEV and transaction fee) on a forked chain to
attract mining power. The revenue concentration objective of
a BEV relayer further escalates the potential value that miners
can extract, intensifying the risks of consensus layer forks.
BEV also causes congestion on the P2P network layer by
attracting traders to heavily use the P2P network through many
front- or back-running transactions. A congested P2P network,
however, reduces communication throughput and latency, which
was  shown  to  increase  the  stale  block  rate,  which  in  turn
negatively affects consensus security [11].
## 12

BEV  relayer  threats:Throughout our analysis in Section VI,
we assume that BEV relayers and relay miners behave honestly.
However,  in  reality,  a  relayer  or  miner  may  analyze  and
sell trader strategies in private. BEV relayer and miners can
moreover replay profiting transactions (cf. Section V). In a relay
auction, all bids (i.e., the amounts of rebate that players pay to
the miner) are visible to the relayer who can also manipulate
the auction process. Knowing the highest bid, the relayer can
for instance choose to bid a higher amount and win the auction.
Through  the  use  of  multiple  pseudonymous  addresses,  the
relayer  could  deliberately  pretend  to  lose  auctions  to  deter
manipulation  detection.  Such  manipulation  would  lower  the
success  rate  of  bidders  and  provide  an  illusion  of  a  fierce
competition, forcing bidders to raise their bids, aggravating the
revenue concentration problem (cf. SectionVI-C). Finally, to
the financial detriment of DeFi users, BEV relayers provide a
risk-free approach to perform, for example, sandwich attacks.
A.  DeFi’s Impact on BEV
DeFi is one of the most promising applications of permission-
less blockchains. However, our empirical data from Section IV),
intuitively suggests that the amount of extracted BEV grew with
the overall DeFi TVL, hence clearly deteriorating blockchain
security. Various DeFi attacks, including economic exploits [25]
and sandwich attacks [2], are threatening DeFi users.
While BEV sources may appear benign from an application
layer  perspective  (e.g.,  arbitrage  synchronizes  prices  across
different markets and liquidations help to secure debt), we claim
that BEV should never be considered a desired “feature”, and
rather a design flaw. That is because BEV triggers transaction
overhead  and  erodes  the  blockchain  incentive  mechanisms
underpinned by the block reward and transaction fees.
B.  BEV Mitigation
As  long  as  the  transaction  executions  remain  transparent
and the transaction order is unilaterally manipulable, the BEV
challenge is likely to remain. Nevertheless, we observe several
promising avenues towards reducing or mitigating BEV.
Fair Ordering:Kelkaret al.[36] formally define the concept
of order-fairness and propose permissionedAequitasprotocols
to order transactions fairly and were applied to DeFi [30]. A
variant ofAequitas[37] extends order fairness for permission-
less blockchains, yet a powerful network adversary retains an
information asymmetry advantage to front-run slower victims.
Application-Specific  BEV  Mitigation:Previous  works  [2]
show that sandwich attacks can be mitigated if traders keep
the trade sizes under the so-called minimum profitable victim
input. Zhouet al.[38] propose the idea of exploiting a BEV
opportunity atomically in the same transaction. For instance,
when a trader performs an exchange on one market, an arbitrage
opportunity might be created on another market. The trader
can immediately execute an arbitrage following the exchange,
which  may  yield  an  additional  financial  profit.  Due  to  the
atomicity of blockchain transactions, no adversary can extract
the arbitrage profit. We can further imagine how BEV can be
mitigated in lending protocols, if a price oracle update would
atomically liquidate unhealthy debt position while paying out
the liquidation revenue to a shared liquidity pool.
## VIII.  RELATEDWORK
Eskandiret  al.[5]  are  the  first  to  introduce  a  front-
running  taxonomy  for  blockchains.  While  the  authors  focus
on displacement, insertion and suppression front-running, we
explicitly highlight the different side effects of adversarial front-
running  transactions,  which  therefore  allows  to  differentiate
between destructive or tolerating front-running. We moreover
introduce  the  concept  of  back-running  and  show  how  these
ordering strategies are used to extract value. We further identify
the  concept  of  an  internal  back-running  transaction,  where
a  transaction  is  atomically  prepended  with  a  “high-priority”
transactions, such as a price oracle update.
Bonneau  [34]  is  the  first  to  study  bribery  attacks  in  the
context of Bitcoin-style consensus. With their seminal work,
Daianet al.[7] then introduce the concept of Miner Extractable
Value, a specific financial source of bribing revenue. Through
elaborate  empirical  data  of  the  network  layer,  the  authors
show  how  competitive  trading  bots  engage  in  front-running
price gas auctions on the network layer. In this work, we offer
quantifyable insights into the monetary value which traders have
extracted through BEV, by analysing the historical blockchain
data. We further capture regular and internal back-running, and
propose the first practical transaction replay algorithm. Finally,
we also model BEV relayer, which converts part of the public
bidding game into a private relay auction.
Zhouet al.[2] focus on the problem of sandwich attacks
on  AMM  exchanges.  The  authors  simulate,  based  on  past
blockchain data, how much revenue an adversary could have
yielded theoretically from sandwich attacks. In this work, we
measure the actual value extracted by sandwich adversaries,
based  on  past  blockchain  data.  Our  data  in  SectionIV-A
suggests,  that  only63.30%(62.13ETH)  of  the  available
extracted sandwich attack value was extracted.
Related   work   captures   extensively   blockchain   security
through various models and quantification efforts. The most
commonly  captured  attacks  are  selfish  mining  [39],  double-
spending [11], bribery [34], and undercutting attacks [35]. Zhou
et al.[8] quantify the value threshold at which MEV would
incentivize  miners  to  fork  the  blockchain  based  on  optimal
adversarial strategies given by an MDP. Based on this model,
we  empirically  show  the  extent  to  which  BEV  could  have
endangered the blockchain consensus layer.
## IX.  CONCLUSION
In this paper we shed light on the practices of obscure and
predatory traders on blockchains. We provide empirical data
for the state-of-the-art BEV, by notably studying past sandwich
attacks  and  arbitrage  on  seven  decentralized  exchanges  as
well as liquidations on three lending platforms. To the best of
our knowledge, we are the first to provide a generalized real-
time replay trading algorithm. We alarmingly observe that the
emerging BEV relayer endanger the blockchains’ security. We
hope that our work provides insights into the current practices,
and further helps to improve DeFi and blockchain security.
## 13

## REFERENCES
[1]  “https://uniswap.org,” https://uniswap.org/.
## [2]
L. Zhou, K. Qin, C. F. Torres, D. V. Le, and A. Gervais, “High-frequency
trading on decentralized on-chain exchanges,” in2021 IEEE Symposium
on Security and Privacy (SP).    IEEE, 2021, pp. 428–445.
## [3]
J. Xu and B. Livshits, “The anatomy of a cryptocurrency pump-and-dump
scheme,” in28th USENIX Security Symposium (USENIX Security 19),
2019, pp. 1609–1625.
[4]F. Victor and A. M. Weintraud, “Detecting and quantifying wash trading
on decentralized cryptocurrency exchanges,” inProceedings of the Web
Conference 2021, 2021, pp. 23–32.
[5]S. Eskandari, S. Moosavi, and J. Clark, “Sok: Transparent dishonesty:
front-running  attacks  on  blockchain,”  inInternational  Conference  on
Financial Cryptography and Data Security.   Springer, 2019, pp. 170–189.
[6]D. Robinson and G. Konstantopoulos, “Ethereum is a dark forest,” https:
## //medium.com/@danrobinson/ethereum-is-a-dark-forest-ecc5f0505dff.
[7]P. Daian, S. Goldfeder, T. Kell, Y. Li, X. Zhao, I. Bentov, L. Breidenbach,
and A. Juels, “Flash boys 2.0: Frontrunning in decentralized exchanges,
miner  extractable  value,  and  consensus  instability,”  in2020  IEEE
Symposium on Security and Privacy (SP).    IEEE, 2020, pp. 910–927.
[8]L. Zhou, K. Qin, A. Cully, B. Livshits, and A. Gervais, “On the just-
in-time discovery of profit-generating transactions in defi protocols,” in
2021 IEEE Symposium on Security and Privacy (SP), 2021, pp. 919–936.
[9]  S. Nakamoto, “Bitcoin: A peer-to-peer electronic cash system,” 2008.
[10]G. Woodet al., “Ethereum: A secure decentralised generalised transaction
ledger,”Ethereum project yellow paper, vol. 151, no. 2014, pp. 1–32,
## 2014.
[11]A.  Gervais,  G.  O.  Karame,  K.  W
## ̈
ust,  V.  Glykantzis,  H.  Ritzdorf,
and  S.  Capkun,  “On  the  security  and  performance  of  proof  of  work
blockchains,” inProceedings of the 2016 ACM SIGSAC Conference on
Computer and Communications Security.    ACM, 2016, pp. 3–16.
## [12]
J. Bonneau, A. Miller, J. Clark, A. Narayanan, J. A. Kroll, and E. W.
Felten,  “Sok:  Research  perspectives  and  challenges  for  bitcoin  and
cryptocurrencies,” inSecurity and Privacy (SP), 2015 IEEE Symposium
on.    IEEE, 2015, pp. 104–121.
[13]N. Atzei, M. Bartoletti, and T. Cimoli, “A survey of attacks on ethereum
smart  contracts  (sok),”  inInternational  conference  on  principles  of
security and trust.    Springer, 2017, pp. 164–186.
## [14]
S. Bano, A. Sonnino, M. Al-Bassam, S. Azouvi, P. McCorry, S. Meik-
lejohn,  and  G.  Danezis,  “Sok:  Consensus  in  the  age  of  blockchains,”
inProceedings of the 1st ACM Conference on Advances in Financial
Technologies, 2019, pp. 183–198.
[15]K.  Qin,  L.  Zhou,  Y.  Afonin,  L.  Lazzaretti,  and  A.  Gervais,  “Cefi  vs.
defi–comparing  centralized  to  decentralized  finance,”  in2021  Crypto
Valley Conference on Blockchain Technology (CVCBT).    IEEE, 2021.
## [16]
E. Hertzog, G. Benartzi, and G. Benartzi, “Bancor Protocol Continuous
Liquidity  for  Cryptographic  Tokens  through  their  Smart  Contracts,”
Tech. Rep., 2018. [Online]. Available: https://storage.googleapis.com/w
ebsite-bancor/2018/04/01ba8253-bancorprotocolwhitepaperen.pdf
[17]  Aave, “Aave Protocol,” https://github.com/aave/aave-protocol, 2020.
[18]  dYdX, “dYdX,” https://dydx.exchange/, 2020.
[19]  T. M. Foundation, “Makerdao,” https://makerdao.com/en/, 2019.
[20]C.  Finance,  “Compound  finance,”  2019.  [Online].  Available:  https:
## //compound.finance/
[21]  “Bzx network,” 2020. [Online]. Available: http://bzx.network
[22]R.  Dalio,  “How  the  economic  machine  works,”Economic  Principles,
## 2012.
[23]K.  Qin,  L.  Zhou,  P.  Gamito,  P.  Jovanovic,  and  A.  Gervais,  “An
empirical study of defi liquidations: Incentives, risks, and instabilities,” in
Proceedings of the 21st ACM Internet Measurement Conference.    ACM,
2021, p. 336–350.
[24]S.  Allen,  S.
## ˇ
## Capkun,  I.  Eyal,  G.  Fanti,  B.  A.  Ford,  J.  Grimmelmann,
A. Juels, K. Kostiainen, S. Meiklejohn, A. Milleret al., “Design choices
for central bank digital currency: Policy and technical considerations,”
National Bureau of Economic Research, Tech. Rep., 2020.
## [25]
K.  Qin,  L.  Zhou,  B.  Livshits,  and  A.  Gervais,  “Attacking  the  defi
ecosystem with flash loans for fun and profit,” inInternational Conference
on Financial Cryptography and Data Security.   Springer, 2021, pp. 3–32.
[26]B. Liu and P. Szalachowski, “A first look into defi oracles,”arXiv preprint
arXiv:2005.04377, 2020.
## [27]
S. Eskandari, M. Salehi, W. C. Gu, and J. Clark, “Sok: Oracles from the
ground truth to market manipulation,”arXiv preprint arXiv:2106.00667,
## 2021.
## [28]
“Contract abi specification — solidity 0.8.1 documentation,” https://docs
## .soliditylang.org/en/latest/abi-spec.html.
## [29]
“Defi degens hit by eminence exploit recover some losses - coindesk,”
https://www.coindesk.com/eminence-exploit-defi-compensated.
[30]“Fair  sequencing  services:  Enabling  a  provably  fair  defi  ecosystem,”
https://blog.chain.link/chainlink-fair-sequencing-services-enabling-a-pr
ovably-fair-defi-ecosystem/.
[31]V.  Costan  and  S.  Devadas,  “Intel  SGX  Explained.”IACR  Cryptology
ePrint Archive, vol. 2016, no. 086, pp. 1–118, 2016.
[32]M. R. Baye, D. Kovenock, and C. G. De Vries, “The all-pay auction with
complete  information,”Economic  Theory,  vol.  8,  no.  2,  pp.  291–305,
## 1996.
[33]D. Easley, J. Kleinberget al., “Networks, crowds, and markets: Reasoning
about a highly connected world,”Significance, vol. 9, no. 1, pp. 43–44,
## 2012.
[34]J. Bonneau, “Why buy when you can rent?” inInternational Conference
on  Financial  Cryptography  and  Data  Security.Springer,  2016,  pp.
## 19–26.
[35]M.  Carlsten,  H.  Kalodner,  S.  M.  Weinberg,  and  A.  Narayanan,  “On
the instability of bitcoin without the block reward,” inProceedings of
the 2016 ACM SIGSAC Conference on Computer and Communications
Security, 2016, pp. 154–167.
[36]M.  Kelkar,  F.  Zhang,  S.  Goldfeder,  and  A.  Juels,  “Order-fairness  for
byzantine consensus,” inAnnual International Cryptology Conference.
Springer, 2020, pp. 451–480.
[37]M.  Kelkar,  S.  Deb,  and  S.  Kannan,  “Order-fair  consensus  in  the
permissionless setting.”IACR Cryptol. ePrint Arch., vol. 2021, p. 139,
## 2021.
[38]L. Zhou, K. Qin, and A. Gervais, “A2mm: Mitigating frontrunning, trans-
action reordering and consensus instability in decentralized exchanges,”
arXiv preprint arXiv:2106.07371, 2021.
[39]I.  Eyal  and  E.  G.  Sirer,  “Majority  is  not  enough:  Bitcoin  mining  is
vulnerable,” inFinancial Cryptography and Data Security.    Springer,
2014, pp. 436–454.
[40]  “Fomo3d wiki,” https://fomo3d.hostedwiki.co/.
[41]  “Ethereum lottery,” https://ethex.bet/.
[42]M.  Shubik,  “The  dollar  auction  game:  A  paradox  in  noncooperative
behavior and escalation,”Journal of conflict Resolution, vol. 15, no. 1,
pp. 109–111, 1971.
[43]Bitinfocharts,   “Ethereum   block   time.”   [Online].   Available:   https:
## //bitinfocharts.com/comparison/confirmationtime-eth-std7.html
[44]“The  first  blockchain  fishing  game  ”crypto  fishing”  hits  hot,”  https:
## //www.prnewswire.com/news-releases/the-first-blockchain-fishing-gam
e-crypto-fishing-hits-hot-300752695.html.
## [45]
S.  K.  Kim,  Z.  Ma,  S.  Murali,  J.  Mason,  A.  Miller,  and  M.  Bailey,
“Measuring  Ethereum  network  peers,”  inProceedings  of  the  Internet
Measurement Conference 2018.    ACM, 2018, pp. 91–104.
## [46]
A.  Gervais,  H.  Ritzdorf,  G.  O.  Karame,  and  S.  Capkun,  “Tampering
with the delivery of blocks and transactions in bitcoin,” inConference
on Computer and Communications Security.    ACM, 2015, pp. 692–705.
[47]  “Ethereum (eth) blockchain explorer,” https://etherscan.io/.
## APPENDIXA
## ADDITIONAL EMPIRICAL DATA
A.  Sandwich attack
1)  Monthly Statistics:Table V shows the detailed monthly
statistics of the sandwich attacks on Ethereum. We observe an
increase in the number of attacks and the number of adversarial
addresses (user/smart contract) from2020. In April2021, we
find94,956attacks, of which96.5%occur on Uniswap V2.
2)  Sandwich Gas Prices:We observe that80.02%of the
back-running transactions (T
## A2
) pay only0to1GWei less than
## T
## V
’s gas price (cf. Table VII)
## 7
. Intuitively, the closerT
## A2
and
## T
## V
are, the higher the attacks’ success rate due to a chance of
other transaction interference. For the front-running transaction
## (T
## A1
), the adversary must also consider the competing sandwich
attacker.  Given  a  multi-adversary  game,  Daianet  al.[7]
have outlined two primary gas-bidding adversarial strategies:
## 7
Note that we only consider the510,476sandwich attacks with positive
adversarial gas price.
## 14

TABLE V: Monthly statistics of the sandwich attacks on Ethereum.
Total18-1219-0119-0219-0319-0419-0519-0619-0719-0819-0919-1019-1119-1220-0120-0220-0320-0420-0520-0620-0720-0820-0920-1020-1120-1221-0121-0221-0321-0421-0521-0621-0721-08
Num. of smart contracts1069268466336334811195985572740175626410697938197129115978548
0.2%0.6%0.7%0.4%0.6%0.6%0.3%0.3%0.6%0.3%0.3%0.4%0.7%1.0%1.8%5.5%8.0%5.3%2.5%3.7%16.4%5.8%6.0%9.9%9.1%8.7%7.6%9.1%12.1%10.8%9.1%8.0%4.5%
Num. of user addresses2419811144649585451615286386733173955134143193254215152190285327290377147
0.3%0.5%0.6%0.2%0.2%0.2%0.4%0.2%0.3%0.2%0.2%0.2%0.7%0.6%1.2%2.6%3.6%3.0%1.3%3.0%39.5%5.5%5.9%8.0%10.5%8.9%6.3%7.9%11.8%13.5%12.0%15.6%6.1%
Num. of detected attacks75052952756495229365745896589375184295479621211713379621052313859911252723393343065498041659487483599644513712189495685095901528097711331
0.0%0.1%0.1%0.0%0.0%0.1%0.1%0.1%0.0%0.0%0.0%0.1%0.1%0.3%0.2%0.1%0.1%0.4%0.8%1.7%3.1%4.6%7.3%5.6%6.5%4.8%5.9%9.5%12.7%11.3%12.0%10.8%1.5%
## Bancor206152756459672242373425116679491328491482318110000000000
0.3%100.0%100.0%92.7%2.6%1.9%0.3%27.0%6.3%9.1%1.1%1.7%0.2%26.7%3.7%3.7%1.4%2.7%1.6%0.2%0.1%0.1%0.1%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%
Uniswap V1143040036223358743654552341182290478455203812889491024307911213171391200100460140
1.9%0.0%0.0%7.3%97.4%98.1%99.7%73.0%93.7%90.9%98.9%98.3%99.8%73.3%96.3%96.3%98.6%97.3%98.1%18.7%2.5%0.6%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%
Uniswap V268846600000000000000000104856122022323134057548824155948534342144310568861916528029779639626878680
91.7%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.3%81.1%97.4%99.3%99.3%99.8%99.8%99.6%95.0%96.8%96.7%96.5%94.4%88.3%77.4%76.6%
Sushiswap attacks272430000000000000000000002306710021317821408235332984185588465491174
3.6%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.7%0.1%0.2%0.4%5.0%3.2%3.3%3.5%4.9%6.5%8.1%10.4%
## Uniswap V318455000000000000000000000000000006134628117371477
2.5%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.0%0.7%5.1%14.5%13.0%
TABLE VI: The gas price paid by the adversaries for the front-
running sandwich transactionT
## A1
. A previous study suggests
that79%of the miners (using geth) configure a price bump
percentage  of10%to  replace  an  existing  transaction  from
the  mempool,  while16%of  the  miners  (using  parity)  set
12.5%as replacement threshold [2]. Assuming a price bump
percentage  of10%,  we  estimate  that  at  least19.11%of  the
attacks experienced more than5counter-reactive bids [7].
r=
GasP rice
## T
## A1
GasP rice
## T
## V
CountPercentageEstimated  Bids
r≤180,39215.75%1
1< r≤1.1265,33051.98%1
1.1< r≤1.1
## 2
## 39,9637.83%2
## 1.1
## 2
< r≤1.1
## 3
## 17,0143.33%3
## 1.1
## 3
< r≤1.1
## 4
## 10,2232.00%4
## 1.1
## 4
< r97,55419.11%>= 5
total510,476100.00%None
reactive  counter-biddingandblind  raising.  Under  reactive
counter-bidding, an adversary only increases its gas price when
another competing transaction pays a higher gas price. In blind
raising, the adversary raises the gas price of its transaction in
anticipation of a raise of its competitors, without necessarily
observing  competing  transactions  yet.  Recall  that  geth  only
accepts an increase of the gas price by at least10%.
When assuming that all attackers adopt the reactive counter-
bidding  strategy,  based  on  the  past  sandwich  attacks,  we
estimate that at least19.11%of the sandwiches went through
more than five rounds of bidding (cf. Table VI). This is because
the firstT
## A1
bid only needs to add1Wei toT
## V
’s gas price, then
each subsequential bid must raise the gas price by10%. After
five rounds of bidding, the adversary needs to pay a gas price
of at least(110%)
## 4
�,(GasPrice
## V
+1)Wei. Fig. 4a visualizes
the number of adversarial sandwich attack smart contracts we
detected. In particular, from the 10th to the 11th of August 2020
(Block 10630000-10640000), we identified49smart contract
addresses attempting to extract value simultaneously.
## B.  Clogging
Eskandiret al.[5] have observed smart contract games which
follow  theThe  War  of  Attrition[40],  [41].  In  such  a  game,
players can bid into a pool of money. Each bid resets a timeout,
which, once expired, grants the last bidder the entirety of the
amassed money. Economists and evolutionary biologists have
studied such games for decades [42], and shown that humans
overbid  significantly.  To  participate  in  such  contests,  users
are likely to construct dedicated bidding bots. Those bots are
then configured with a specific budget to pay for transaction
TABLE  VII:  Adversarial  gas  prices  for  the  back-running
sandwich  transactionT
## A2
.80.02%of  the  transactions  pay
only0to1GWei less thanT
## V
## .
d=GasPrice
## T
## V
−GasPrice
## T
## A2
CountPercentage
d <0GWei14,1622.77%
0GWei≤d <1GWei408,52280.03%
1GWei≤d <10GWei6,8131.33%
10GWei≤d <100GWei43,1948.46%
100GWei≤d37,7857.40%
## Total510,476100.00%
fees.  If  an  adversary  manages  to  clog  the  blockchain,  such
that  those  bots  run  out  of  funding,  the  attacker  can  win  the
bidding  game.  This  is  what  appears  to  have  happened  with
the infamous Fomo3D game, where an adversary realized a
profit of10,469ETH by conducting a clogging attack over66
consecutive blocks (from block 6191962 to 6191896).
The throughput of permissionless blockchains is typically
limited to about7-14transactions per second, and transaction
fee bidding contests have shown to raise the average transaction
fees  well  above50USD.  Aclogging  attackis,  therefore,
a  malicious  attempt  to  consume  block  space  to  prevent  the
timely inclusion of other transactions. To perform a clogging
attack,  the  adversary  needs  to  find  an  opportunity  (e.g.,  a
liquidation, gambling, etc.) which does not immediately allow
to  extract  monetary  value.  The  adversary  then  broadcasts
transactions with high fees and computational usage to congest
the pending transaction queue. Clogging attacks on Ethereum
can be successful because79% of the miners order transactions
according to the gas price [2].
1)  Heuristics:To identify past clogging period, we apply
the following heuristics.
•Heuristic  1:The  same  address  (user/smart  contract)  con-
sumes more than80%of the available gas in every block
during the clogging period.
•Heuristic  2:The  clogging  period  lasts  for  at  least  five
consecutive blocks. Empirical data suggests that the average
block time is13.5±0.12seconds [43], a clogging period
of five blocks, therefore, lasts around1minute.
2)  Empirical Results:We identify333clogging periods
from block 6803256   to 12965000 , where10user addresses
and75smart  contracts  are  involved  (cf.  Table  VIII).  While
the  longest  clogging  period  lasts  for5minutes  (24blocks),
most of the clogging periods (83.18%) account for less than2
minutes (10blocks).
Case  Studies:While  our  heuristics  can  successfully  detect
## 15

TABLE VIII: Detected clogging periods.
DurationClogging DetectedAvg. Gas UsedAvg. Cost
5∼9blocks (1∼2mins)270504139698 ETH (12K USD)
10∼14blocks (2∼3mins)3813769797254 ETH (117K USD)
15∼19blocks (3∼4mins)1019950788190 ETH (188K USD)
20∼24blocks (4∼5mins)9278092700143 ETH (326K USD)
25∼29blocks (5∼6mins)3348737828369 ETH (854K USD)
30∼34blocks (6∼7mins)2458057340250 ETH (551K USD)
35∼39blocks (7∼8mins)1528647491  297ETH (739K USD)
TABLE IX: Selected clogging events.
## Address
## Start
## Block
## Duration
(Blocks)
## Avg.  Gas
## Consumed
## Avg.  Gas
## Price
## Cost
## (ETH)
## Usage
0x0996..2747129534433795.38%547297.16NFT
0xD4d8..706e129103803494.48%790388.16NFT
0x004f..66CA128851773193.99%252112.37NFT
0x18Df..7da5129343032690.35%1,477517.47NFT
0x3a87..bB5f127178452595.85%364130.61NFT
0x18c7..410b129111562590.05%1,358459.93NFT
0x3a87..bB5f127178932492.62%503168.03NFT
0x6670..3A4a70911222491.22%315.48Incentivised clogging
0xdAC1..1ec7101307722196.09%408.05Mass USDT transfers
0xA869..0AB182595061592.59%263.14ETH CAT Attack
0x67a6..21d277880211593.21%323.72ERD (E) Attack
0xA869..0AB182600631494.48%262.98ETH CAT Attack
0xdAC1..1ec785094811189.27%282.27Mass USDT transfers
0xA869..0AB182600511197.28%262.41ETH CAT Attack
blockchain  clogging,  they  do  explain  their  motivation  and
we  hence  manually  inspect14selected  clogging  events  (cf.
Table IX). We find that the top7longest clogging events are
related  to  the  non-fungible  tokens  (NFT),  while  it’s  unclear
how the adversaries might profit from these events.
Incentivised clogging:
We detect a gambling contract “Lucky
Star” clogging, where203addresses perform387transactions.
This game draws the winners, when the cumulative lottery tick-
ets sold exceeds a pre-configured threshold. For every30,000
ETH of lottery tickets sold, the accumulated prize is split among
the last50purchasers, the protocol, therefore, incentivizes its
users to congest the network at the fictive deadline.
Attacks  on  gambling  protocols:We also find four clogging
events related to two FoMo3D games, namely ETH CAT (cf.
0x42ce..0ebb) and ERD (E) (cf. 0x2c58..e769). The rules of
these  gambling  protocols  is  similar  to  FoMo3D.  If  no  user
address purchases a lottery ticket within a fixed time period,
the last participant wins the jackpot. We identify two contracts
involved  in  these  four  clogging  events.  To  ensure  that  the
winner is not already drawn, both contracts have a function to
check the current round’s status in the corresponding gambling
smart contract before they start to spam transactions. These two
contracts are deployed by the same address (cf. 0xfefe..aa5c).
Mass USDT transfers:We find that two clogging events per-
form a large number of USDT transfers, wherein2,462/1,868
Ethereum addresses made2,463/2,032transactions, consum-
ing96.07%/89.27%of  the  gas  respectively.  Although  these
activities appear abnormal, we cannot seem to figure out the
reason for such behavior.
## APPENDIXB
## TRANSACTIONREPLAYEXTENSIONS
## A.  Replayable Transactions Case Study
In Table X, we present the top15replayable transactions
that produce more than100ETH and manually classify their
TABLE X: Case studies of the top15non-reverted replayable
transactions that yield a profit of more than100ETH.
## Transaction
hash
## Profit
## (ETH)
Required  upfront
capital  (ETH)
## Motive
0x045b..0b2a16,736.90Eminence exploit [29]
0x3503..8ad816,393.30Eminence exploit [29]
0x4f0f..03178,555.80Eminence exploit [29]
## 0xa85b..9a83448.10.036—
## 0x148f..533f224.00.036—
0xbab8..e372183.68.0Arbitrage
0x4021..1f89153.22.0Arbitrage
0xe772..d496153.22.0Arbitrage
0x475a..cd8f152.50DSSLeverage
0xfa5f..bb03144.30DSSLeverage
0x2e27..ee45136.30DSSLeverage
0x7ca2..0765129.89.0Arbitrage
0xd46c..b091118.05.0Crypto Fishing [44]
## 0xc2f3..cac8112.00.036—
0x9f4b..ec7e106.30.80609Arbitrage
1pragma solidityˆ0.6.0;
## 2
3contractReplayProtections {
## 4addressowner;
## 5
## 6constructor() {
## 7owner = 0x00..33;
## 8}
## 9
10functionAuthentication()public{
11require(msg.sender== owner);
## 12uintprofit;
13// profiting logic omitted for brevity
## 14msg.sender.transfer(profit);
## 15}
## 16
17functionMoveBeneficiary()public{
## 18addressbeneficiary = 0x01..89;
## 19uintprofit;
20// profiting logic omitted for brevity
## 21beneficiary.transfer(profit);
## 22}
## 23}
Listing 2: Protection from the transaction replay attack.
motive.  We  notice3replayable  transactions  associated  with
a previous DeFi attack, the Eminence exploit [29]. It appears
that  the  attacker(s)  did  not  consider  the  threat  of  replay
transactions. Except for the Eminence exploit, we notice that
the bZx attack [25] transaction is also replayable. We further
find3replayable transactions that invoke the sameDSSLeverage
smart  contract  (cf.  0x4c14..bCA2).  From  the  DSSLeverage
source code, we find that it allows any address to close the
contract’s  position  in  MakerDAO  and  retrieve  its  balance.
This  coding  pattern  matches  thesender  benefitspattern  (cf.
SectionV-A). We also discover one on-chain game transaction
(Crypto Fishing [44]) and five arbitrage transactions. For three
of the top15replayable transactions, we find that the trader is
purchasing ERC20 tokens at a favorable price (i.e., arbitrage),
as we convert the gained assets back to ETH for our evaluation.
## B.  Replay Protection
Listing  2  presents  the  solidity  snippets  that  mitigates  the
transaction replay attack (cf. Section V-A).
## 16

## 20-12-2320-12-2420-12-2520-12-2620-12-2720-12-2820-12-29
Year-Month-Day
## 0
## 200
## 400
## 600
## 800
## 1,000
## # Connections
Fig. 14: Number of connections of our modified geth node while
listening for transactions on the P2P network. The default geth
configuration maintains 50 connections. The more connections
a  node  manages,  the  earlier  this  node  receives  block  and
transactions from neighboring peers.
## APPENDIXC
## PRIVATELYRELAYEDTRANSACTIONMEASUREMENT
A.  Identifying Non-Broadcast Transactions
To measure the fraction of transactions that are mined, but not
broadcast on the P2P network, we set up a well connected geth
client with at most1,000connections in the Ethereum network
## (cf. Fig. 14)
## 8
. The client records any new incoming transaction,
before  it  is  added  to  the  memory  pool,  or  written  to  the
blockchain. The number of connections of the Ethereum client
are important as in to(i)receive data as early as possible [46]
and(ii)to maximize an all encompassing view of the network
layer. Once we stored all visible transactions, we compare this
network layer dataset with the resulting confirmed blockchain
transactions to identify the transactions that were mined, but
not broadcast.
## B.  Empirical Results
When  observing  the  Ethereum  P2P  network  over45,669
blocks   (1   week)   from   block   11503300   (22nd   Decem-
ber,  2020)  to  11548969  (29th  December,  2020),  the  chain
recorded8,285,218transactions. When comparing those with
the  transactions  we  observed  on  the  network  layer,  we  find
that136,143mined  transactions  were  not  broadcast  prior
to  being  mined.  We  hence  can  conclude  that1.64%of  the
transactions are privately relayed. We manually verify100trans-
actions at random from our dataset with the data provided by
Etherscan [47], and can confirm that our methodology matches
the privately relayed transactions reported. We notice that parts
of the detected private transactions are payout transactions from
mining pool operators to miners. By excluding the transactions
that  consume21,000gas,  we  find11,374(8.35%)  private
transactions invoking smart contracts (cf. Table XI).21,000is
the minimum gas cost of an Ethereum transaction, i.e., a simple
transfer costs21,000gas.
Private  1inch  Trades:By observing privately relayed trans-
actions, we identify with which miners 1inch reached private
## 8
A default geth client connects to a maximum of50peers. We remark that
our mass-connection client can cover a wide range of peers. This is because
peerings  in  Ethereum  are  primarily  influenced  by  the  distance  of  the  peer
nodes’ ID hashes[45], rather than the physical location, although location does
influence latency.
TABLE  XI:  Distribution  of  the  number  of  privately  relayed
transactions  per  miner  coinbase  address  over45,669blocks
(1 week). Data measured from the P2P network with a geth
client which consistently maintains over800P2P connections
(cf. Fig. 14). We measure the hashrate based on the number
of blocks found during measurement by the respective miner.
Miner  address
Private  transactions
(contract  invoking)
NameHashrate
0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8104,674 (7,310)Ethermine20.81%
0x829BD824B016326A401d083B33D092293333A83019,560 (329)F2Pool9.59%
0x99C85bb64564D9eF9A99621301f22C9993Cb89E35,926 (19)BeePool2.11%
0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c3,256 (2,775)Spark Pool23.50%
0xB3b7874F13387D44a3398D298B075B7A3505D8d4980 (568)Babel Pool4.83%
0xD224cA0c819e8E97ba0136B3b95ceFf503B79f53697 (191)UUPool3.46%
0x5921c6a53c2cD0987Ae111b59F2E5dDaAf275b60360 (0)-0.45%
0x04668Ec2f57cC15c381b461B9fEDaB5D451c8F7F303 (1)zhizhu.top/SpiderPool7.76%
0x314653F5933FC25D0A428424f5A645B2bcc37483142 (135)-0.11%
0x3EcEf08D0e2DaD803847E052249bb4F8bFf2D5bB59 (5)MiningPoolHub1.75%
0x52f13E25754D822A3550D0B68FDefe9304D27ae859 (1)EthashPool 20.1%
0xAEe98861388af1D6323B95F78ADF3DDA102a276C58 (2)-0.21%
0x00192Fb10dF37c9FB26829eb2CC623cd1BF599E825 (22)2Miners: PPLNS2.01%
0xB35c1055aAE02DA8497E9Dd866e27C86be16CFEF22 (0)-0.06%
0x002e08000acbbaE2155Fab7AC01929564949070d7 (7)Hiveon Pool0.95%
0x1aD91ee08f21bE3dE0BA2ba6918E714dA6B458367 (1)2Miners: SOLO4.01%
0x35F61DFB08ada13eBA64Bf156B80Df3D5B3a738d4 (4)firepool0.62%
0x45a36a8e118C37e4c47eF4Ab827A7C9e579E11E21 (1)-0.11%
0x8595Dd9e0438640b5E1254f9DF579aC12a86865F1 (1)EzilPool 20.68%
0xF541C3CD1D2df407fB9Bb52b3489Fc2aaeEDd97E1 (1)-0.32%
0x2A0eEe948fBe9bd4B661AdEDba57425f753EA0f61 (1)-0.56%
## Total136,143 (11,374)-84.00%
peering agreements. We for instance found two privately relayed
1inch transactions (cf. 0xa026..b15b and 0xaa45..c66f) from
the Spark Pool (23.50% hashrate), one (cf. 0xe4d4..86b5) from
the Babel Pool (4.83% hashrate) and one (cf. 0x4340..aeb5)
from the F2Pool (9.59% hashrate).
Mining Pools Engaging in Private Transactions:In Table XI
we provide the distribution of miners engaging in mining non-
broadcast transactions. Over the course of45,669blocks (1
week), we identified81miners, of which21(26%) mine trans-
actions privately. We notice that the number of privately relayed
transactions  does  not  necessarily  correspond  to  the  hashing
power  of  the  miner.  TheEthermineminer  positions  private
transactions (e.g., benign mining payouts) at the block start with
apparent low gas prices. TheSparkPool, however, seemingly
trying to disguise its private transactions as ordinary instances
by paying regular gas prices. We identified for example the
following transaction hashes: 0x4e17..29cd, 0xa67e..4725. In
particular, we noticed the contract 0x0000..a4c4, for which all
interacting transactions are mined by the SparkPool and not
broadcast on the P2P network. Based on the available EVM
byte code and engaging transactions, this contract appears to
be involved in trading, strongly indicating that the SparkPool
is engaging in MEV before the emergency of BEV relayers.
PrivateValueExtractingTransactions:
From    block
11503300  to  11548969,  we  discover340liquidation  trans-
actions on Aave, Compound and dYdX (cf. SectionIV-B) out
of which we identify18private transactions. We also detect5
private transactions among the1,067arbitrage transactions.
## Private  Replayable  Transactions:
We  find  that1,156of
the8,285,218transactions are replayable following the method-
ology of SectionV-B. Out of these replayable transactions, we
identify13private transactions yielding a profit of0.59ETH.
Through manually inspection, we find that these13transactions
are 1inch exchange trades. We recall that private transactions
cannot be replayed by non-miners.
## 17