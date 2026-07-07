1
# Unity is Strength: Enhancing Precision in
# Reentrancy Vulnerability Detection of Smart
# Contract Analysis Tools
Zexu Wang, Jiachi Chen, Zibin Zheng, Fellow, IEEE, Peilin Zheng, Yu Zhang, Weizhe Zhang
Abstract—Reentrancy is one of the most notorious vulnerabilities in smart contracts, resulting in significant digital asset losses. However,
many previous works indicate that current Reentrancy detection tools suffer from high false positive rates. Even worse, recent years have
witnessed the emergence of new Reentrancy attack patterns fueled by intricate and diverse vulnerability exploit mechanisms.
Unfortunately, current tools face a significant limitation in their capacity to adapt and detect these evolving Reentrancy patterns.
Consequently, ensuring precise and highly extensible Reentrancy vulnerability detection remains critical challenges for existing tools.
To address this issue, we propose a tool named ReEP, designed to reduce the false positives for Reentrancy vulnerability detection.
Additionally, ReEP can integrate multiple tools, expanding its capacity for vulnerability detection. It evaluates results from existing tools to
verify vulnerability likelihood and reduce false positives. ReEP also offers excellent extensibility, enabling the integration of different
detection tools to enhance precision and cover different vulnerability attack patterns. We perform ReEP to eight existing state-of-the-art
Reentrancy detection tools. The average precision of these eight tools increased from the original 0.5% to 73% without sacrificing recall.
Furthermore, ReEP exhibits robust extensibility. By integrating multiple tools, the precision further improved to a maximum of 83.6%.
These results demonstrate that ReEP effectively unites the strengths of existing works, enhances the precision of Reentrancy
vulnerability detection tools.
Index Terms—Reentrancy Detection, Symbolic Execution, Path Pruning, Smart Contracts
✦
1 INTRODUCTION
# S
MART contracts offer several unique features that
distinguish them from traditional software programs,
especially in finance and permission management scenar-
ios [1], [2]. Numerous smart contract vulnerabilities have
been discovered through real-world attacks or theoretical
analysis, including the Reentrancy vulnerability [3], [4].
Since the DAO attack in 2016, which resulted in the theft
of approximately 150 million dollars in digital assets, the
Reentrancy vulnerability has caused significant asset losses.
Reentrancy vulnerabilities arise when external (malicious)
contracts exploit reentrant function characteristics to bypass
permission control checks [5]. This allows external contracts
to enter the same function multiple times, manipulate
contract logic, and steal assets. A variety of technologies have
been developed to detect Reentrancy vulnerabilities in smart
contracts, which can be broadly divided into two categories,
i.e., static analysis [6]–[8] and dynamic analysis [9]–[12].
Static analysis techniques often collect incomplete program
state information, which can lead to false positives due to
• Zexu Wang, Jiachi Chen, Zibin Zheng, Peilin Zheng are with School of
Software Engineering, Sun Yat-sen University, China.
E-mail: {wangzx97, zhengpl3}@mail2.sysu.edu.cn
E-mail: {chenjch86, zhzibin}@mail.sysu.edu.cn
• Weizhe Zhang, Yu Zhang are with School of Computer Science and
Technology, Harbin Institute of Technology, China.
E-mail: {yuzhang, wzzhang}@hit.edu.cn
• Zexu Wang, Yu Zhang and Weizhe Zhang are also affiliated with Peng
Cheng Laboratory, China.
• Zibin Zheng is the corresponding author.
Manuscript received ; revised
the loss of the state in contract interactions. Conversely,
dynamic vulnerability detection models frequently struggle
with deep-state search and comprehensive state analysis
in cross-contract vulnerability scenarios. Zheng et al. [5]
conducted a large-scale empirical study on existing popular
Reentrancy vulnerability detection tools and found that these
tools produced false positives as high as 99.8%, with 55%
caused by incorrect permission control verification and 41%
due to the lack of external contract function analysis. Accurate
permission control checks and cross-contract state analysis
continue to challenge existing detection tools. Consequently,
reducing the false positives of Reentrancy vulnerability
detection remains a major topic in smart contract security
research.
Despite significant research efforts directed toward de-
tecting reentrancy vulnerabilities, the constant evolution
of exploitation mechanisms has led to the emergence of
new Reentrancy attack patterns in recent years. This com-
plexity and variability necessitate a continuous expansion
of vulnerability detection patterns within existing tools
to ensure reliable detection of Reentrancy vulnerabilities.
Unfortunately, many existing tools (such as Oyente [9], Osiris
[13], Manticore [10], etc.) have long struggled to effectively
detect Reentrancy vulnerabilities in real-world contracts due
to their outdated detection patterns.
To address the above challenges, we introduce ReEP,
a tool designed to reduce false positives for Reentrancy
vulnerability detection. ReEP evaluates results from existing
tools and validates vulnerability likelihood to reduce false
positives. When new vulnerability patterns emerge, ReEP
integrates the corresponding detection tools to cover different
## arXiv:2402.09094v2 [cs.CR] 15 Feb 2024

---

2
vulnerability patterns. ReEP consists of two phases: target
state search and symbolic execution verification. In the target
state search phase, ReEP uses program analysis to assist
in pruning paths. ReEP performs program dependency
analysis on the vulnerability functions provided by Origin
Tools, generating function sequences related to vulnerability
triggering to guide the symbol execution. Origin Tools refer
to existing tools, such as Mythril [14], and Slither [15].
Meanwhile, ReEP utilizes CFG Pruner to construct SMC-
CFG (State Maximal Correlation CFG), which can optimize
path traversal. In the symbolic execution verification phase,
ReEP implements program instrumentation to collect and
analyze path constraints, enabling cross-contract symbolic
execution analysis. By utilizing symbolic execution to verify
the reachability of these paths, we can reduce the false
positives and enhance the precision of vulnerability detection
for the Origin Tool. Moreover, ReEP boosts strong extensibility
by integrating new detection tools to expand the coverage
of vulnerability detection patterns, thereby enhancing its
capability to detect Reentrancy vulnerabilities.
We evaluated the effectiveness of ReEP by examing its
ability to improve the detection precision of Origin Tools,
its capability to integrate multiple tools, and understanding
the impact of each stage within the ReEP framework. The
experimental results showed that when integrated with
ReEP, the average precision of Origin Tools increased from
0.5% to 73%, significantly improving precision without
sacrificing recall. Furthermore, ReEP is able to merge multiple
Reentrancy detection tools to enhance its capabilities. By
integrating six tools, ReEP achieves a peak precision of
83.6%, while the best performance of the current state-of-the-
art tools is only 31.8%, demonstrating its effectiveness and
extensibility in improving detection precision. In addition,
we conducted ablation experiments to understand how each
stage within ReEP affects overall effectiveness. In general,
ReEP provides a robust solution for improving the ability to
detect Reentrancy vulnerabilities in smart contracts.
The main contributions of our work are as follows:
• We designed a tool called ReEP to reduce the false
positives for Reentrancy vulnerability detection. At
the same time, it has strong extensibility in merging
multiple tools to expand its capacity for vulnerability
detection.
• We propose an approach that uses symbolic execution
for verifying vulnerability path reachability. It com-
bines program dependency analysis to guide path
pruning, achieving efficient Reentrancy vulnerability
verification.
• We applied ReEP to eight state-of-the-art Reentrancy
vulnerability detection tools, experimental results
show that it can significantly reduce the false positive
rates and improve the precision of existing tools.
• We publicize the ReEP’s source code and the
experimental dataset at https://github.com/ReEP-
SC/ReEP.
This paper is organized as follows. In Section 2, we de-
scribe some necessary background and explain the challenges
faced in Reentrancy vulnerabilities through motivation ex-
amples. In Section 3, we introduce the workflow of our
proposed method and delve into the technical details of
ReEP. In Section 4, we evaluate the performance of ReEP. We
discuss threats to validity in Section 5 and summarize the
related work in Section 6. In Section 7, we conclude the paper
and outline future works.
2 BACKGROUND AND MOTIVATION
In this section, we provide background knowledge and the
motivation behind the design of the ReEP tool. Additionally,
we summarize the challenges faced in Reentrancy vulnera-
bility detection.
2.1 Reentrancy
Since the DAO attack in 2016, detecting Reentrancy vulnera-
bilities has been a critical research topic in smart contract se-
curity. Attackers often exploit Reentrancy attacks to illegally
acquire substantial amounts of digital assets, especially in
DeFi applications where smart contracts manage significant
volumes of digital assets. A Reentrancy attack is a type of
malicious behavior that exploits a vulnerability in smart
contracts, in which permission controls are inadequately
checked when called by an external (malicious) contract.
In such attacks, the attacker repeatedly enters the function
through one function call to obtain considerable profit.
1 function withdraw(uint _amount) public {
2 require(balance[msg.sender] >= _amount);
3 (bool success, ) = msg.sender.call.value(_amount
)("");
4 require(success);
5 balance[msg.sender] -= _amount;
6 }
Fig. 1. Simple example of Reentrancy
Figure 1 shows a function named withdraw that contains
a Reentrancy vulnerability. In the withdraw function, the
contract first checks whether the caller (represented by
msg.sender) has a sufficient balance (in L2). It then transfers
the requested ether to the caller (in L3) and deducts the
transferred amount from the caller’s balance recorded in the
user balance variable (in L5). However, Solidity introduces a
special mechanism called the fallback function, which can be
used to execute code when the contract receives ether from
other addresses. The fallback function provides an opportunity
for exploiting the Reentrancy vulnerability. In Figure 1, the
call.value() (in L3) automatically invokes the fallback function
of the caller contract, allowing the caller to take control of
the control flow. Attackers can deploy malicious code in the
fallback function to repeatedly call the withdraw() function.
Note that in the second invocation of withdraw(), the code
in L5 has not been executed since the invocation begins at
the call.value() in L3, and thus the user balance has not been
changed at this time. As a result, the condition check (in
L2) of the second invocation passes, and the victim contract
will repeatedly transfer ether to the caller until the contract’s
balance is drained.
2.2 Motivation
We use the following example to illustrate practical appli-
cations and key contributions of ReEP to smart contract
development.

---

3
Alice, a smart contract developer, rigorously assesses
her contracts for potential Reentrancy vulnerabilities before
deploying them on Ethereum. To ensure a comprehensive
analysis, she employs a variety of detection tools. However,
different tools often report different vulnerability locations,
compelling Alice to engage in thorough manual verification
(as studies indicate that existing tools produce false positives
as high as 99.8% [5]). Furthermore, with the emergence of
new Reentrancy attack patterns and corresponding tools,
Alice needs to add them to her detection toolkit. However,
the incorporation of these new tools may also generate new
false positives, further increasing her workload.
Detection
Results
ReEP
Origin Tool 1Origin Tool 1
Origin Tool 1
Origin Tool 1Origin Tool 1
Origin Tool N
Origin Tool 1Origin Tool 1
Smart
Contracts
New Tool Detection
Results
Precision
Detection
Results
...Alice
New Reentrancy Attack Patterns
Fig. 2. The use case of ReEP
At this stage, Alice can employ ReEP to efficiently reduce
the false positives while consistently addressing the detection
of new Reentrancy attack patterns, ultimately lightening her
workload. ReEP is an automated verification tool, designed
to validate the results of Reentrancy vulnerability detections
from existing tools. It evaluates findings from multiple tools
(Origin Tools), verifying vulnerability likelihood to reduce
false positives, thus enhancing precision. Moreover, ReEP
has excellent extensibility. When new vulnerability patterns
emerge, by incorporating the corresponding detection tools
(New Tools), Alice can further enhance Reentrancy vulnerabil-
ity detection capabilities, ensuring broader coverage.
ReEP alleviates the manual verification of false pos-
itives, significantly cutting down Alice’s workload. This
underscores ReEP’s practicality in streamlining audits and
enhancing precision, suitable for large-scale smart contract
detection tasks.
2.3 Challenges
In this section, we investigate cases to uncover the main
causes of false positives in current Reentrancy detection
tools, and outline the related challenges.
2.3.1 Lack of permission control check
1 modifier onlyOwner{
2 require(msg.sender == owner);
3 _;
4 }
5 ...
6 function execute( address _to, uint _value, bytes
_data) external onlyOwner {
7 ...
8 _to.call.value(_value)(data);
9 }
Fig. 3. Lack of permission control check
Figure 3 shows a code snippet that leads to false positives
in many detection tools. The main reason is that lacking of
checks on the msg.sender’s permission control. Smart contract
permission control mainly includes who has the right to
call the function, what operations can be performed, and
restrictions on contract operations. The form of permission
control is diverse and extensive, mistakenly recognizing
permission controls can readily lead to inaccurate detection
results. Analyzing permission control correctly is the main
challenge in improving tool detection accuracy.
Motivation: Relying on matching the single pattern with-
out analyzing permission control can easily result in false
positives. For example, in Figure 3, the execute function is
modified with the onlyOwner modifier, which restricts its
execution to the contract owner. However, Mythril [14] and
Manticore [10] did not capture this permission control logic
and assumed that anyone could call this function, resulting
in a false positive.
Challenge: Different permission control mechanisms increase
complexity and slow down path traversal. To improve
detection efficiency and accuracy with symbolic execution,
it’s vital to optimize path selection and enable targeted
analysis.
2.3.2 Unable to analyze execution logic of external contract
functions
Figure 4 presents an instance from [5] where false posi-
tives occur due to the incapability of analyzing external
contract function logic. The getTokenBal function queries
user balances through an external function balanceOf (in
L9), no state changes or transfers happen within balanceOf.
However, many tools can not fully analyse external functions,
they often misidentify such contracts as having reentrancy
vulnerabilities.
1 contract ForeignToken {
2 function balanceOf(address _owner) constant
public returns (uint256);
3 ...
4 }
5 contract Bitcash {
6 ...
7 function getTokenBal(address tokenAddr, address
who) constant public returns (uint){
8 ForeignToken t = ForeignToken(tokenAddr);
9 bal = t.balanceOf(who);
10 return bal;
11 }
12 }
Fig. 4. Unable to analyze execution logic of external contract functions
Motivation: Many detection tools struggle to understand
how external contract functions work, especially in cross-
contract interactions. For instance, in Figure 4, the balanceOf
function of the tokenAddr address is called to check the
balance of the who address and update the bal variable (in L9).
However, these tools often can not determine if the external
function involves transfers, so they rely on ”state changes
after external calls” to identify Reentrancy vulnerabilities,
leading to false positives.
Challenge: Cross-contract calls are challenging due to the
difficulties in analyzing external contract functions. This
often leads to incomplete program state analysis and false
positives.

---

4
3 METHODOLOGY
In this section, we will introduce the workflow and delve
into the technical details of ReEP.
3.1 Overview
We propose ReEP to verify vulnerability information in
existing tools’ detection reports, enhancing precision in
Reentrancy vulnerability detection. As shown in Figure 5,
the ReEP approach comprises two phases and four steps.
It takes smart contract source code as input and produces
detection results as output. In the first phase, Origin Tools like
Mythril [14] are utilized to report vulnerability information,
which includes the vulnerability’s location and associated
function. Program dependency analysis is then applied to
generate the sequence of functions related to the vulnerability
trigger, guiding the processes of symbolic execution. Follow-
ing this, the CFG Pruner constructs the SMC-CFG (State
Maximum Correlation Control Flow Graph) to optimize
path traversal for symbolic execution. In the second phase,
cross-contract interactions are monitored and analyzed to
collect global path constraints and verify the reachability of
vulnerability paths by accessing the constraint solver (SMT).
This enables the determination of whether the vulnerability
exists.
In general, Step 1⃝, Step 2⃝, Step 3⃝ contribute to improve
the efficiency of search, and Step 4⃝ aims to improve the
accuracy of detection.
Smart Contracts
Function Sequences
CFG Pruner
Cross-contract
Symbolic Execution
SMT
Detection Results
StageⅠ：Target State Search 
StageⅡ:
Symbolic Execution
Verification
Origin Tools
1
2 3
Vulnerability
Detection Reports
4
Step
Step
Step
Step
Step
SMC-CFG
3
Fig. 5. The workflow of ReEP
3.2 Stage I: Targeted State Search
In order to improve the efficiency of state search, path
pruning is essential for symbolic execution. ReEP achieves
this by conducting program dependency analysis on vulner-
able functions and generating function sequences to guide
symbolic execution. Additionally, ReEP constructs the SMC-
CFG to expedite path traversal during symbolic execution.
3.2.1 Step 1⃝ Reentrancy Report Collection
Initially, ReEP utilizes Origin Tools to detect smart contracts
and generate vulnerability detection reports, providing
coarse-grained information on Reentrancy vulnerabilities.
The information includes the location and function of the
vulnerability, which ReEP further analyzes to generate the
function sequence. The selection of Origin Tools is based on
the tool selection criteria outlined by Zheng et al. [5], as
these tools generate vulnerability detection reports contain-
ing the location and function information for Reentrancy
vulnerabilities.
3.2.2 Step 2⃝ Function Sequence Generation
To guide symbolic execution, ReEP analyzes functions and
variables related to vulnerable functions through program
dependency analysis to generate the sequence of functions.
Therefore, it is necessary to collect information on the
functions and variables related to the vulnerable functions
in the contract. This information includes:
• Target variables: Variables of the functions from vulner-
ability detection reports, denoted as V 
�,
T arget
.
• Target-related variables: Variables that have a program
dependency relationship (including control depen-
dencies or data dependencies) with V 
�,
T arget
, denoted
as V 
�,
T arget Related
.
• Target functions: Functions that read or assign vari-
ables that come from Target variables or Target-related
variables, denoted as F 
�,
T arget
.
To collect the functions and variables related to the vulner-
able function in the contract, ReEP performs a search based
on whether they have program dependencies, including data
and control dependencies, with the vulnerable functions. The
following process is used:
• When V 
�,
T arget Related 
= ∅, search for the function
that operates on the variables in V 
�,
T arget
, write the
function into the set F 
�,
T arget
, and write the state
variables of the function to the set V 
�,
T arget Related
.
• When V 
�,
T arget Related
̸
 
= ∅, search for the function that
operates on the variables in V 
�,
T arget Related
, write the
function to the set F 
�,
T arget
, write the state variables
of that function to the set V 
�,
T arget Related
, and con-
tinue repeating until F 
�,
T arget 
or V 
�,
T arget Related 
has
no more new elements written to it, as V 
�,
T arget 
∩
V 
�,
T arget Related 
= V 
�,
T arget
.
Algorithm 1: Generating Function Dependency
Graph
Input: V 
�,
T arget Related 
as V, F 
�,
T arget 
as F
Output: FDG
1 Function Main(V, F):
2 FDG ← empty graph;
3 foreach fi in F do
4 foreach fj in F do
5 if modif y(fi, V ) ∩ modif y(fj , V )̸ = ∅
then
6 F DG.add edge(fi, fj , weight)
7 end
8 end
9 end
10 return FDG;
To facilitate symbolic execution guidance, ReEP utilizes
the FDG (Function Dependency Graph) to analyze the
dependencies between vulnerable functions to generate the
sequence of functions. The algorithm for generating the FDG
is presented in Algorithm 1, which takes V 
�,
T arget Related 
and
F 
�,
T arget 
as inputs and produces the FDG as output. The
algorithm examines the dependency relationships between
the contract’s functions. Specifically, it determines whether
there are same variables between two functions to generate

---

5
the contract’s FDG, as depicted in L3–L9 of Algorithm 1.
The edge weight is determined by the number of common
variables shared by the two functions. By generating the
FDG, ReEP can identify functions that are directly or in-
directly related to the vulnerable functions, which enables
the construction of a sequence of functions related to the
execution of the vulnerable functions.
The sequence of functions is generated by sorting the
functions in the FDG (Function Dependency Graph) ac-
cording to their relevance. In the FDG, nodes represent
functions, edges represent the existence of the same state
variables, and the weight of edges represents the number of
the common state variables. The weight of a node (function)
is the sum of the weights of all its connecting edges, which
indicate the frequency of operations on the state variables.
Sorting nodes according to their weights generates the
corresponding function sequence. To avoid uninitialized
states, the nodes are sorted in ascending order of weight,
creating the corresponding function sequence. Combining
symbolic execution with function sequence guiding, ReEP
achieves efficient access to functions related to the execution
of the vulnerable functions, facilitating effective analysis of
the critical path.
3.2.3 Step 3⃝ Path Pruning
To alleviate the problem of path explosion in symbolic execu-
tion, ReEP employs function sequences and the CFG Pruner
to prune paths. Function sequences assist in eliminating
irrelevant function access, while the CFG Pruner generates
the SMC-CFG (State Maximum Correlation CFG) to prune
the CFG of the function, thus enhancing the efficiency of
symbolic execution. The SMC-CFG retains the CFG branch
pointing to the key block where state updates occur and
prunes irrelevant paths to minimize the cost of unnecessary
path forking. At the CFG branch, it is checked whether the
succeeding block is a key block. If all the succeeding blocks
are key blocks, then all branches are preserved. Specifically,
the CFG Pruner assigns weights to the jump edges of each
basic block in the contract, reflecting the block’s relevance
to state updates. Blocks containing instructions that write
or read state variables (SSTORE, SLOAD, and CALL) are
considered key blocks, while blocks without state operations
or containing REVERT/INVALID instructions are deemed
irrelevant. If the condition for the vulnerability’s existence
is met, the symbolic execution path traversal is halted. By
using the SMC-CFG, the path searching is accelerated by
prioritizing the exploration of key blocks.
The algorithm for generating the SMC-CFG is presented
in Algorithm 2. Initially, in L3–L9, all basic blocks in the CFG
are traversed to calculate the weight of each edge, which is
then recorded in the two-dimensional array SMC-CFG. In the
Count weight function in L12–L20, the opcode in each basic
block is traversed. If the opcode is an instruction in Key instrs,
the weight of the corresponding connecting edge (JUMP W)
for that basic block is incremented by 1. Simultaneously,
the PC value is updated to the position of the first opcode
in that block. By utilizing the Count weight function, each
basic block establishes weighted connections to its successor
blocks, ultimately generating of the SMC-CFG.
Figure 6 illustrates a part of the SMC-CFG for the
withdraw function. The basic blocks in the SMC-CFG are
Algorithm 2: Generating the SMC-CFG
Input: the CFG of the contract
Output: the SMC-CFG of the contract
1 Function Main (CFG):
2 SMC-CFG ← [][];
3 Blocks = getAllBlocks(CFG);
4 foreach block in Blocks do
5 foreach blk in block.successors do
6 JUMP W, Fir pc = Count weight(blk);
7 SMC-CFG[blk][Fir pc] = JUMP W;
8 end
9 end
10 return SMC-CFG
11 Function Count_weight (blk):
12 JUMP W ← 0, PC ← 0;
13 Key instrs = [SSTORE, SLOAD, CALL];
14 foreach opcode in blk.opcodes do
15 if opcode in Key instrs then
16 JUMP W++;
17 PC = blk.first opcode.pc;
18 end
19 end
20 return JUMP W, PC
represented by white rounded rectangles, while pruned
blocks are shown as gray rectangles. The red solid lines
indicate jump relationships between basic blocks, and the
blue solid lines represent pruned jump relationships. The
number on each edge denotes the weight value of the jump
edge (JUMP W). In Figure 6, for Block 4, the JUMPI opcode
branch has jump edges with weight values of 0 and 2. During
symbolic execution using the SMC-CFG, the jump edge
with a weight value of 2 is explored, and the block with
a weight value of 0 is omitted. If both succeeding blocks
possess non-zero weight values, they are explored in the
order of their weight values. By utilizing the jump edge
weight values assigned to each block by the SMC-CFG, the
path branching is prioritized by selecting the jump edge
with a greater weight value, enabling symbolic execution to
efficiently access paths with more state operations.
...
62: INVALID
JUMP_W : 1JUMP_W : 2
JUMP_W : 2 JUMP_W : 0
...
12: REVERT
JUMP_W : 0JUMP_W : 1
Block 1
Block 2 Block 3
Block 4 Block 5
Block 6 Block 7
63: SLOAD
...
85: SSTORE
33: SLOAD
33: CALL
...
57: JUMPI
26: SLOAD
...
32: STOP
13: SLOAD
...
25: JUMPI
1: JUMPDEST
...
9: JUMPI
Fig. 6. The SMC-CFG of the function withdraw

---

6
3.3 Stage II: Symbolic Execution Verification
To verify the existence of vulnerabilities, ReEP employs cross-
contract symbolic execution to verify the reachability of the
vulnerability path. It combines the SMC-CFG to accelerate
path traversal. Additionally, it uses program instrumentation
with function sequences to analyze the logic of functions and
collect global path constraints. Moreover, the SMT is accessed
to validate the reachability of the path and determine the
presence of any vulnerabilities.
3.3.1 Step 4⃝ Cross-contract Symbolic Execution
Analyzing the execution logic of functions and collecting
global path constraints is of vital importance for cross-
contract symbolic execution. Figure 7 illustrates the overall
process of cross-contract symbolic execution in ReEP. To
identify and ensure the correct switching of different contract
contexts (including msg and storage), ReEP employs the Call-
Return Monitor, a program instrumentation designed for
cross-contract bytecode analysis, with function sequences to
guide the switching of different contexts. The Global Storage
ensures the accurate writing and reading of distinct contract
data, preventing data confusion arising from different con-
tracts sharing a single storage. The Symbolic State Propagation
addresses the issue of symbolic parameters when calling
across contracts. These modules work collectively to ensure
the analysis of external functions and accurate collection of
global path constraints.
EVM
Caller's Code
Global Storage
Symbolic State
Call-Return Monitor (Instrumentation)
Callee's Code
GOT
Symbolic Runtime
Legend： Instrumentation Code Execution
SLOAD/SSTORE
Symbolic State Propagation
Fig. 7. The overall process of cross-contract symbolic execution
Call-Return Monitor. In order to ensure that the context
of different contracts is switched correctly in cross-contract in-
teraction, the instrumentation code needs to receive feedback
on the start, and end positions, and return value information
of the cross-contract call. As smart contracts use the Call-
Return paradigm, which can be summarized into three
patterns based on return values:
1 function Collect1(uint _am) public payable {
2 if(balances[msg.sender]>=_am){
3 if(msg.sender.call.value(_am)()){
4 balances[msg.sender]-=_am;
5 Log1.AddMessage(msg.sender,"Collect1
");
6 } } }
Fig. 8. Call has no return value or does not use a return value
Call has no return value or does not use the return value:
the function called in the external contract (callee) does not
return the value, or the return value is not used. This pattern
is shown in L5 of the function Collect1 in Figure 8. The
AddMessage function in the Log1 contract does not return a
value, and there is no need to pass the value across contracts.
1 function Collect2(uint _am) public payable{
2 if(balances[msg.sender]>=_am){
3 if (Log2.AddMessage(msg.sender,"Collect2
")){
4 if(msg.sender.call.value(_am)()){
5 balances[msg.sender]-=_am;
6 } } } }
Fig. 9. Call uses the return value but does not assign it
Call uses the return value but does not assign it: the function
called in the external contract (callee) has the return value,
which is used in the caller, but not assigned. This pattern
is shown in L3 of the function Collect2 in Figure 9. The
AddMessage function in the Log2 contract is checked to see if
it returns a value of True, but its return value is not assigned.
1 function Collect3(uint _am) public payable{
2 if(balances[msg.sender]>=_am){
3 success = Log3.AddMessage(msg.sender,"Collect3");
4 if (success){
5 if(msg.sender.call.value(_am)()){
6 balances[msg.sender]-=_am;
7 } } } }
Fig. 10. Call uses a return value and assigns it
Call uses a return value and assigns it: the function called
in the external contract (callee) has the return value, which
is used in the caller and assigned. This pattern is shown in
L3–L4 of the function Collect3 in Figure 10. The return value
of the AddMessage function in the Log3 contract is assigned
to the success variable.
The Call-Return Monitor employs static analysis of the
bytecode stream to extract essential information about cross-
contract function calls, including start and end positions, as
well as the return values of external function calls. The Call-
Return Monitor switches different contracts’ storage and msg
information based on the start and end positions and types
of external calls. By analyzing the return value information
of external function calls, it determines whether there is
cross-contract parameter passing, ensuring the correct cross-
contract interaction and avoiding state loss caused by cross-
contract interactions.
Global Storage. To ensure the accurate writing and
reading of different contract data and to prevent data confu-
sion, ReEP implements a global storage mechanism. Many
dynamic detection tools fail to save data after the function
call, leading to data loss issues in subsequent transaction
execution and global state analysis, as the triggering of
vulnerabilities frequently stems from multiple transactions.
Moreover, different types of cross-contract calls, such as
CALL, DELEGATECALL, CALLCODE, and STATICCALL,
necessitate different contexts for the msg and the storage [16].
Insufficient data or incorrect information can result in missed
critical paths and inaccurate detection outcomes. To address
this issue, ReEP combines the Global Storage with the GOT

---

7
(Global Offset Table), which assists in locating and retrieving
global data, thereby ensuring the correct storage and reading
of various contract data.
Caller
Callee
CALL
DELEGATECALL
CALLCODE
STATICCALL
Global storage
Context Switch
Executer
initiator GOT
Caller
slot0 Value 1
slot1 Value 2
Callee
slot0 Value 1
slot1 Value 2
...
slot0 Value 1
slot1 Value 2
Contract_n
slot0 Value 1
slot1 Value 2
... ... ... ... ... ... ... ...
Fig. 11. Global storage for call context switch
Figure 11 illustrates the functioning of global storage
in the call context switch. The instrumentation code dy-
namically switches the contract context according to the
various types of function calls between the caller and
callee (including CALL, DELEGATECALL, CALLCODE, and
STATICCALL) to ensure the accuracy of the cross-contract
analysis. Additionally, the GOT is used to determine the
position of different contract data in the global storage.
The design of the GOT is depicted in Figure 12, which
aids in identifying the location of various contract data.
The storage location of the global variable is calculated
using the formula L = GOT(Contract ID@Slot ID), where
Contract ID represents the partition index of the contract
in the global storage, and Slot ID corresponds to the slot
index in the storage of that contract. The instrumentation
code monitors the SLOAD and STORE instructions and the
corresponding stack top value in the bytecode, which are
employed to compute Slot ID. By using GOT, true values
can be obtained from global storage, avoiding issues such as
reverts caused by incorrect or lost data.
OPCODE 
GOT
Opcode:SLOAD/SSTORE
Contract_ID:
contract's partition number
Slot_ID:slot number Before：Revert/Wrong Value
After：True value
Contract_ID@Slot_ID
Global storage
Caller
slot0 Value 1
slot1 Value 2
Callee
slot0 Value 1
slot1 Value 2
...
slot0 Value 1
slot1 Value 2
Contract_n
slot0 Value 1
slot1 Value 2
... ... ... ... ... ... ... ...
Fig. 12. GOT (Global Offset Table)
Symbolic State Propagation. To address the issue of pass-
ing symbolic parameters during cross-contract calls, ReEP
returns the associated constraints of symbolic parameters as
return values and passes them to the caller. During cross-
contract transactions, the input parameters of the called
function may be symbolic, and the output values or updated
states may also be in the form of symbolic constraints,
making immediate computation challenging. Symbolic state
propagation transforms the contract operations on symbolic
parameters into constraint expressions, which can be utilized
for subsequent computations.
ReEP converts the execution logic of external functions
into symbolic constraint expressions and propagates them
between different contracts. Z3’s Bit-vector is employed to
store symbolic constraint expressions, and the constraints of
the input parameters (symbolic values) of the function are
saved and propagated, resolving dependency issues of the
program on symbolic parameters during symbolic execution.
Figure 13 illustrates a simple example of a caller invoking a
callee function with symbolic parameters, where the primary
logic involves storing the sum of the transferred ether
amount (CALLVALUE) and 6. The bytecode block displayed
in Figure 13 stores the caller addr in slot0, callee addr in slot1,
and adds the transferred ether CALLVALUE (a symbolic
value) to 6, which is then stored in slot2. ReEP converts
the calculation operations on CALLVALUE into constraint
expressions for subsequent computation and storage. Since
CALLVALUE is a symbolic input parameter, the storage in
slot2 contains a symbolic constraint expression.
Callee's Function
CALLER
PUSH1 0x0
SSTORE
ADDRESS
PUSH1 0x1
SSTORE
CALLVALUE
PUSH1 0x2
SSTORE
PUSH1 0x2
SLOAD
PUSH1 0x6
ADD
PUSH1 0x2
SSTORE
STOP
...
Callee's Storage
Slot0
Slot1
Slot2
Slotn
caller_add
callee_addr
(bvadd 0x6 CALLVALUE)
(store (store (store (store STORAGE_callee_addr
#x0 #caller_addr)
#x1 #callee_addr)
#x2 CALLVALUE)
#x2 (bvadd #x6 CALLVALUE))
Caller's contract
Return
Call
Callee.Function()
Fig. 13. Storage and propagation of symbolic states
Path constraints are resolved by accessing the constraint
solver (SMT). The completeness of the set of constraints
during the path constraint search phase is essential for
verifying the reachability of path constraints to determine
the existence of vulnerabilities.
4 EVALUATION
In this section, we evaluated the efficacy of ReEP by investi-
gating its ability to enhance detection precision of the Origin
Tools, its ability to integrate multiple tools, and understand
the impact of each stage within the ReEP framework. We
address these considerations by answering the following
research questions.
RQ1. How does ReEP improve the Reentrancy detection
precision of the Origin Tools?
RQ2. What is the impact of ReEP on the recall rate?
RQ3. What is the extensibility of ReEP when merging
multiple tools?
RQ4. What is the impact of different stages within ReEP?
4.1 Environment Setup and Dataset
The experiments were conducted on a machine running
Ubuntu 18.04.1 LTS and equipped with 16 cores (Intel(R)
Xeon(R) Gold 5217). The experimental environment was
set up by either downloading Docker images or manually
building the tool with the help of construction manuals (for
Securify2 and Smartian). To ensure that the experiments were
not overly time-consuming, we followed the time budget

---

8
TABLE 1
Statistics of detection results of the Origin Tool with ReEP
Tool Oyente Mythril Securify1 Securify2 Smartian Saifish Slither EThor
Origin Origin+ Origin Origin+ Origin Origin+ Origin Origin+ Origin Origin+ Origin Origin+ Origin Origin+ Origin Origin+
# TP 25 25 26 26 15 22 3 3 7 7 19 21 31 31 26 28
# FP 488 8 15474 8 2372 8 2489 5 15 5 2270 8 4587 9 3269 9
# Reported 513 33 15500 34 2387 30 2492 8 22 12 2289 29 4618 40 3295 37
Precision 4.9% 75.8% 0.2% 76.5% 0.6% 73.3% 0.1% 37.5% 31.8% 58.3% 0.8% 72.4% 0.7% 77.5% 0.8% 75.7%
settings from [5], capping the maximum runtime to 120
seconds and keeping the parameters at their default settings.
We adopted two datasets in our study to comprehen-
sively evaluate ReEP’s performance in detecting Reentrancy
vulnerabilities. Dataset DB1 was employed to validate RQ1,
RQ3, and RQ4, while dataset DB2 was used to validate RQ2.
DB1. Zheng et al.’s Dataset [5]. Zheng et al. initially collected
230,548 verified contracts from Etherscan. These con-
tracts were subsequently analyzed by using six state-of-
the-art Reentrancy detection tools, and 21,212 contracts
were flagged as potentially vulnerable to Reentrancy
vulnerabilities by at least one of the tools. After
that, two rounds of manual checks were conducted
involving 50 participants, resulting in 34 contracts
being confirmed as true positives (TP).
DB2. SmartBugs Dataset [17]. The widely used SmartBugs
dataset contains 143 contracts. Among these contracts,
31 were identified as containing Reentrancy vulnerabil-
ities. The inclusion of these labeled contracts allowed
us to evaluate ReEP’s recall performance in detecting
Reentrancy vulnerabilities.
For tool selection, we adopted the criteria proposed by
Zheng et al. [5], selecting the same set of tools: Oyente [9],
Mythril [14], Securify [18] (both V1 and V2 versions),
Smartian [11], and Sailfish [19]. Additionally, we included
Slither [15] and EThor [20] as part of the Origin Tools,
making a total of eight tools used to generate Reentrancy
vulnerability detection reports. These selected tools are all
presented at top software engineering or security conferences
and cover various techniques, such as symbolic execution,
formal verification, and fuzz testing. It is worth noting that
some of these tools do not explicitly define Reentrancy
vulnerabilities as “Reentrancy”. For instance, Mythril reports
two vulnerabilities related to Reentrancy, namely, external
call to user-supplied address and state access after external call.
To ensure consistency, we adopted the same classification
criteria provided by Zheng et al. [5], which offers a standard-
ized classification scheme for these Reentrancy vulnerability
detection tools.
4.2 RQ1: Improvement on Precision
We use DB1 to evaluate the impact of ReEP on improving
the Reentrancy detection precision, we compared the results
of eight Origin Tools with and without ReEP. The results are
provided in Table 1, where TP and FP stand for True Positive
and False Positive, respectively. Origin+ and Origin represent
the Origin Tool with or without ReEP, and Precision refers to
the detection precision. The precision calculation formula is:
P recision(P RE) = T P/(T P + F P ).
As shown in Table 1, a total of 21,212 Reentrancy cases
were reported from 230,548 contract detections by the Origin
Tools. At the same time, ReEP can significantly reduces
false positives for all of them, especially for Mythril, where
false positives dropped from 15,474 to 8. It is worth noting
that DB1(Zheng et al.’s Dataset) reported only 34 TP, while
ReEP identified 7 additional contracts (a 20% increase) with
Reentrancy vulnerabilities that were missed in their manual
checks. We notified the authors of the dataset, and they
confirmed that these 7 contracts do contain Reentrancy
vulnerabilities and subsequently updated their dataset.
In conclusion, the results show that ReEP can significantly
improve the precision of the Origin Tools. Mythril exhibited
the maximum increase in precision from 0.2% to 76.5%, while
Smartian showed the minimum increase, also increasing
from 31.8% to 58.3%. After using the ReEP, the average
precision of all Origin Tools rose by 72.5%, from 0.5% to 73%,
indicating that ReEP significantly improves the precision of
the detection results for the Origin Tools.
Answer to RQ1: The experimental results showed a
significant improvement in the Origin Tools’s precision when
integrated with ReEP, escalating from 0.5% to 73% on average.
The most significant improvement was observed in Mythril,
with a remarkable increase of 76.3%. These results highlight
ReEP’s exceptional capability in enhancing the precision of
the Origin Tools.
4.3 RQ2: Impact on Recall
DB1 comprises 21,212 suspicious contracts selected from
230,548 verified contracts. It may not provide a fair eval-
uation of ReEP’s recall impact, as these 21,212 contracts
were marked as potentially susceptible to Reentrancy vul-
nerabilities by at least one of the Original tools. Therefore,
we utilized DB2 (SmartBugs dataset), the most commonly
used dataset, which consists of 31 contracts with Reentrancy
vulnerabilities and 112 contracts without such vulnerabilities,
to assess the recall impact. The recall calculation formula is:
Recall = T P/(T P + F N ).
Table 2 presents the result statistics of ReEP on the
SmartBugs dataset. As shown in the table, ReEP significantly
enhances the precision and F1 scores of the Origin Tools, while
having no impact on Recall. Among the eight tools, Slither
demonstrated the highest recall performance on SmartBugs,
remaining unchanged at 93.5%. This indicates that ReEP
maintains the Recall of Origin Tools while improving preci-
sion.
Warning information is utilized for path pruning, com-
bined with symbolic execution to verify path reachability,
leading to fewer false positives and an enhanced F1 score,
without affecting Recall of Origin Tools.
Answer to RQ2. ReEP utilizes warning information from
Origin Tools to guide path pruning and targeted analysis,
including path symbol execution verification, resulting in a

---

9
TABLE 2
Statistics of Detection Results on SmartBugs Dataset
Tool Oyente Mythril Securify1 Securify2 Smartian Saifish Slither EThor
Origin Origin+ Origin Origin+ Origin Origin+ Origin Origin+ Origin Origin+ Origin Origin+ Origin Origin+ Origin Origin+
# TP 21 21 10 10 17 17 6 6 15 15 19 19 29 29 25 25
# FP 43 8 48 7 31 8 47 9 19 7 24 8 38 9 55 9
# FN 10 10 21 21 14 14 25 25 16 16 12 12 2 2 6 6
# TN 69 104 64 105 81 104 65 103 93 105 88 104 74 103 57 103
Precision 32.8% 72.4% 17.2% 58.8% 35.4% 68.0% 11.3% 40.0% 44.1% 68.2% 44.2% 70.4% 43.3% 76.3% 31.3% 73.5%
Recall 67.7% 67.7% 32.3% 32.3% 54.8% 54.8% 19.4% 19.4% 48.4% 48.4% 61.3% 61.3% 93.5% 93.5% 80.6% 80.6%
F1 44.2% 70.0% 22.5% 41.7% 43.0% 60.7% 14.3% 26.1% 46.2% 56.6% 51.4% 65.5% 59.2% 84.1% 45.0% 76.9%
significant reduction of false positives in the detection results
without compromising Recall rate.
4.4 RQ3: Extensibility of ReEP
The previous two RQs demonstrated that ReEP can improve
precision by decreasing false positives (FP), but it cannot
increase the recall rate. This is because ReEP relies on Origin
Tools to provide vulnerability information, and thus the
ability of a single tool to report Reentrancy vulnerability
might constrain ReEP’s capability. Fortunately, this limitation
can be countered by merging multiple tools, as a greater num-
ber of tools can provide more comprehensive vulnerability
information.
In this RQ, we explore the detection efficiency of ReEP
by combining multiple tools. The extensibility of ReEP was
thoroughly assessed by fusing different sets of Origin Tools,
including combinations of two, four, six, and eight tools,
resulting in a total of 127 unique combinations. All of the 127
combinations’ experimental data are provided at our GitHub
repository. When combining multiple tools, ReEP analyzes
the detection outcomes of different tools, and determines
the result by using a logical OR operation. To clearly show
the results, we categorized the results into three groups:
Best combo, Worst combo, and Random combo. Specifically,
Best combo represents the combination with the highest
precision, Worst combo corresponds to the combination with
the lowest precision, and Random combo includes randomly
selected combinations.
67.1%47.9%61.0%79.0%65.0%74.0%82.0%83.6%79.2%80.7%
Best_comboWorst_comboRandom_comboMerge8
45%52%60%67%75%82%90%
Precision
 Merge2 Merge4 Merge6 Merge8
Fig. 14. Comparison for merging multiple tools
Figure 14 compares the precision of Merger2, Merge4,
Merger6, and Merger8 with ReEP. Among the 28 combina-
tions of Merger2, ReEP achieved the Best combo by merging
Mythril and Slither, resulting in the highest precision of
67.1%. The Best combo of Merger6 achieved the highest
precision of 83.6% among all the combinations, indicating
the optimal performance achievable with these eight tools.
This suggests that ReEP has already reached the best possible
performance, and further increasing the number of merged
tools does not result in an improvement in overall precision.
Additionally, as the number of tools increases, the gap
between the highest and lowest precision values decreases,
resulting in more consistent results. Overall, ReEP effectively
enhances detection precision by merging multiple tools,
demonstrating its impressive extensibility.
Answer to RQ3. Our experiments demonstrated that as
the number of merged tools increased, the improvement in
precision became more stable. The Best combo of Merger6
achieved a peak precision of 83.6%. Adding more tools did
not significantly enhance the performance. These findings
highlight the extensibility and effectiveness of ReEP in
detecting Reentrancy vulnerabilities.
4.5 RQ4: Impact of Different Stages in ReEP
To evaluate the impact of each stage of ReEP on the overall
effectiveness, we conducted comparative experiments on
precision and time consumption for Merge6’s Best combo
using three modes: Stage1 (Target State Search), Stage2
(Symbolic Execution Verification), and Stage1&2. In Stage1,
ReEP integrated the FDG and SMC-CFG analysis to prune
the path, while Stage2 involved the verification of path
accessibility through symbolic execution.
Table 3 presents a comparison of the detection results
among the three modes, where Avg. Tool represents the
average detection results from the Origin Tools. As evidenced
by the table data, we can observe that Stage1 detected all
the 41 Reentrancy vulnerabilities (TP) but have 556 false
positives (FP). Stage 1 does not significantly improve the
precision (from 0.5% to 6.9%) due to a high number of false
positives. In contrast, Stage2’s symbolic execution verification
remarkably reduces the number of false positives (FPs) to
only 51, which is less than one-tenth of the FPs identified
in Stage1. Nonetheless, the number of true positives (TPs)
detected by symbolic execution is 35, as symbolic execution
may encounter path explosion, leading to the omission of
certain TP contracts. The Stage1&2 mode, which combines
symbolic execution verification with path pruning, achieves
the highest precision of 83.6%.
TABLE 3
Comparison of Detection Results for Different Modes
Avg. Tool Stage1 Stage2 Stage1&2
# TP 19 41 35 41
# FP 3870 556 51 8
Precision 0.5% 6.9% 40.7% 83.6%
Time (s) 8.18 1.3 23.8 15.6
Table 3 provides the average time consumption for the
three modes. While Stage2 takes an average of 23.8 seconds,

---

10
the processing time is reduced to 15.6 seconds in Stage1&2.
The pruning in Stage1 plays a crucial role in enhancing ReEP’s
overall performance. Experimental observations indicate that
Stage1 combines FDG with SMC-CFG pruning, leading to
reduced running time and mitigated symbolic execution path
explosion. Furthermore, it facilitates targeted path analysis,
enabling deeper path searches and improving the overall
precision of vulnerability detection.
Answer to RQ4. The Stage1&2 mode, by combining
path pruning with symbolic execution verification, achieves
efficient path reachability validation, resulting in the highest
precision of 83.6% when merging multiple tools.
5 THREATS TO VALIDITY
5.1 Internal Validity
The internal validity threats stem from the reliance on
existing Reentrancy detection tools. While ReEP can improve
precision by reducing false positives, it is not capable of
detecting more Reentrancy cases than Origin Tools (as ob-
served in the experimental results of RQ2). Consequently, the
capbilities of ReEP might be constrained by the limitations of
Origin Tools. Fortunately, a key strength of ReEP is its ability
to merge multiple tools to enhance its detection capabilities.
As demonstrated in RQ3, ReEP achieved a peak precision
of 83.6% by merging six tools, underlining its impressive
extensibility. Even though new Reentrancy attack patterns
emerge, ReEP can integrate new detection tools, effectively
extending its capabilities to adapt to evolving vulnerabilities.
5.2 External Validity
The external validity threats primarily stem from the inherent
challenges associated with manual inspections of large
datasets, which tend to be highly error-prone and time-
consuming. The dataset DB1 comprises 230,548 verified
contracts obtained from Etherscan, among which 21,212
contracts were flagged for Reentrancy vulnerabilities by state-
of-the-art automated detection tools. Manually verifying this
large-scale real-world dataset can be error-prone and time-
consuming. To ensure the dataset’s accuracy, the authors
adopted a rigorous approach involving 50 participants,
including graduate students and PhDs with extensive experi-
ence in smart contract research. These participants conducted
two rounds of thorough checks on the detection results,
minimizing bias and ensuring the reliability of the manual
examination of the reentrant contracts detected by the tools.
Utilizing tool evaluation to enhance the accuracy of the
results. Additionally, by employing ReEP and integrating
eight state-of-the-art tools, we successfully identified 7
additional real-world Reentrancy vulnerability contracts
that were initially missed. Therefore, this dataset represents
real-world smart contracts deployed on the Ethereum with
Reentrancy vulnerabilities.
6 RELATED WORK
6.1 Symbolic Execution.
Recent research on symbolic execution in smart contract
security can be divided into two categories according to the
effect: accuracy and efficiency.
To enhance the accuracy of symbolic execution in detect-
ing security vulnerabilities, various tools such as Oyente [9],
Mythril [14], Manticore [10], and Maian [21] conduct thor-
ough analyses of contracts, and explore all possible paths
to generate vulnerability reports. Sailfish [19] utilizes a
storage dependency graph (SDG) to detect vulnerabilities
in contracts. SmartDagger [7] constructs the cross-contract
control flow graph from bytecodes, facilitating cross-contract
vulnerability detection. However, blind path traversal can
easily lead to imprecise results, especially in cross-contract
analysis where different contracts sharing the same stor-
age may cause data confusion. More importantly, many
existing tools face a significant limitation in their capacity
to adapt and detect evolving vulnerability patterns. ReEP
distinguishes itself by validating existing tool results to
reduce false positives and integrating different tools to detect
various vulnerability patterns.
To improve the efficiency of symbolic execution for faster
detection of security vulnerabilities, tools like Oyente [9],
MPro [22], and Mythril [14] analyze smart contract bytecode.
They apply corresponding path pruning strategies to ex-
pedite path traversal and mitigate path explosion issues.
Smartian [11], SmartDagger [7], and Smartest [12] have
optimized speed by refining search strategies for symbolic
execution paths or employing heuristic algorithms. Addition-
ally, Park [23] proposes a parallel symbolic execution-based
approach to accelerate vulnerability detection. ReEP stands
out by guiding symbolic execution based on the detection
results of existing tools, achieving efficient path searching
and traversal.
6.2 Dynamic and Static Detection.
Traditional static detection techniques for smart contracts [6]–
[8], [24], [25] have several limitations. The public nature of
the blockchain, along with diverse permission control in
smart contracts, complicates static vulnerability detection,
often resulting in false positives. Additionally, unclear call re-
lationships between functions require further exploration for
effective target state identification triggering vulnerabilities.
Dynamic detection methods [9]–[13], [22], [26]–[28], re-
lying on program testing and verification, enhance result
reliability. However, the inability to access global state
information and perform cross-contract analysis leads to
path explosion and high resource consumption. Resource
constraints and vulnerability identification limitations can
further contribute to detection failures or errors.
FuzzSlice [29] performs fuzz testing within a given time
budget to eliminate potential false positives in static analysis.
The difference is that ReEP validates suspicious vulnerability
information from existing tools through symbolic execution,
showcasing strong extensibilit and avoiding detection fail-
ures due to the inability to generate effective inputs. During
the Target state search phase, ReEP explores vulnerability
target states to guide path pruning, eliminating irrelevant
path branches to enhance path traversal efficiency. In the
Symbolic execution verification phase, combined with program
instrumentation to achieve vulnerability state-guided sym-
bolic execution verification. ReEP combines the strengths of
both static and dynamic methods, which enables efficient
identification and analysis of critical states to improve
precision.

---

11
7 CONCLUSION AND FUTURE WORKS
In this paper, we present ReEP, a tool that effectively
improves the precision of existing Reentrancy vulnerability
detection tools. ReEP evaluates results from existing tools and
validates vulnerability likelihood to reduce false positives.
When new vulnerability patterns emerge, integrating the
corresponding detection tools ensures reliable Reentrancy
detection. By analyzing the program dependency relation-
ships of vulnerability functions in the detection report, ReEP
guides path pruning and symbolic execution. Cross-contract
symbolic execution is employed to verify the reachability of
vulnerability paths and confirm the existence of vulnerabili-
ties. We implemented and validated our tool with eight state-
of-the-art detection tools. After applying ReEP, the average
precision of these eight tools increased significantly from
0.5% to 73%. Furthermore, by merging six tools, the precision
further improved, reaching a maximum of 83.6%, while
the best performance of the current state-of-the-art tools is
only 31.8%. These results demonstrate that ReEP effectively
unites the strengths of existing works, enhances the precision
of Reentrancy vulnerability detection tools, and efficiently
identifies Reentrancy vulnerabilities in real-world scenarios.
In future work, we aim to expand the scope and ca-
pabilities of vulnerability detection by combining multiple
technologies, covering a broader range of vulnerability types,
and supporting the detection of bytecode, among other
enhancements.
REFERENCES
[1] PeckShield, “Web3 industry security report,” 2022. [Online].
Available: https://peckshield.com/static/pdf/2023.pdf
[2] SLOWMIST, “2022-blockchain-security-and-aml-analysis-annual-
report(en),” 2023. [Online]. Available: https://www.slowmist.com/
report
[3] C. Ferreira Torres, M. Baden, R. Norvill, B. B. Fiz Pontiveros,
H. Jonker, and S. Mauw, “Ægis: Shielding vulnerable smart
contracts against attacks,” in Proceedings of the 15th ACM Asia
Conference on Computer and Communications Security, 2020, pp. 584–
597.
[4] R. Ji, N. He, L. Wu, H. Wang, G. Bai, and Y. Guo, “Deposafe:
Demystifying the fake deposit vulnerability in ethereum smart
contracts,” in 2020 25th International Conference on Engineering of
Complex Computer Systems (ICECCS). IEEE, 2020, pp. 125–134.
[5] Z. Zheng, N. Zhang, J. Su, Z. Zhong, M. Ye, and J. Chen, “Turn
the rudder: A beacon of reentrancy detection for smart contracts
on ethereum,” in 2023 IEEE/ACM 45th International Conference on
Software Engineering (ICSE), 2023, pp. 295–306.
[6] J. Feist, G. Grieco, and A. Groce, “Slither: a static analysis frame-
work for smart contracts,” in 2019 IEEE/ACM 2nd International
Workshop on Emerging Trends in Software Engineering for Blockchain
(WETSEB). IEEE, 2019, pp. 8–15.
[7] Z. Liao, Z. Zheng, X. Chen, and Y. Nan, “Smartdagger: a bytecode-
based static analysis approach for detecting cross-contract vul-
nerability,” in Proceedings of the 31st ACM SIGSOFT International
Symposium on Software Testing and Analysis, 2022, pp. 752–764.
[8] J. Ye, M. Ma, Y. Lin, Y. Sui, and Y. Xue, “Clairvoyance: Cross-
contract static analysis for detecting practical reentrancy vul-
nerabilities in smart contracts,” in Proceedings of the ACM/IEEE
42nd International Conference on Software Engineering: Companion
Proceedings, 2020, pp. 274–275.
[9] L. Luu, D.-H. Chu, H. Olickel, P. Saxena, and A. Hobor, “Making
smart contracts smarter,” in Proceedings of the 2016 ACM SIGSAC
conference on computer and communications security, 2016, pp. 254–269.
[10] M. Mossberg, F. Manzano, E. Hennenfent, A. Groce, G. Grieco,
J. Feist, T. Brunson, and A. Dinaburg, “Manticore: A user-friendly
symbolic execution framework for binaries and smart contracts,” in
2019 34th IEEE/ACM International Conference on Automated Software
Engineering (ASE). IEEE, 2019, pp. 1186–1189.
[11] J. Choi, D. Kim, S. Kim, G. Grieco, A. Groce, and S. K. Cha,
“Smartian: Enhancing smart contract fuzzing with static and
dynamic data-flow analyses,” in 2021 36th IEEE/ACM International
Conference on Automated Software Engineering (ASE). IEEE, 2021,
pp. 227–239.
[12] S. So, S. Hong, and H. Oh, “Smartest: Effectively hunting vulnerable
transaction sequences in smart contracts through language model-
guided symbolic execution.” in USENIX Security Symposium, 2021,
pp. 1361–1378.
[13] C. F. Torres, J. Sch ¨utte, and R. State, “Osiris: Hunting for integer
bugs in ethereum smart contracts,” in Proceedings of the 34th Annual
Computer Security Applications Conference, 2018, pp. 664–676.
[14] ConsenSys, “Mythril,” 2020. [Online]. Available: https://github.
com/ConsenSys/mythril
[15] J. Feist, G. Grieco, and A. Groce, “Slither Analyzer,” Jun. 2023.
[Online]. Available: https://github.com/crytic/slither
[16] Solidity, “Solidity compiler,” 2013. [Online]. Available: https:
//docs.soliditylang.org/en/latest/installing-solidity.html
[17] T. Durieux, J. F. Ferreira, R. Abreu, and P. Cruz, “Empirical review
of automated analysis tools on 47,587 ethereum smart contracts,” in
Proceedings of the ACM/IEEE 42nd International conference on software
engineering, 2020, pp. 530–541.
[18] P. Tsankov, A. Dan, D. Drachsler-Cohen, A. Gervais, F. Buenzli, and
M. Vechev, “Securify: Practical security analysis of smart contracts,”
in Proceedings of the 2018 ACM SIGSAC Conference on Computer and
Communications Security, 2018, pp. 67–82.
[19] P. Bose, D. Das, Y. Chen, Y. Feng, C. Kruegel, and G. Vigna, “Sailfish:
Vetting smart contract state-inconsistency bugs in seconds,” in 2022
IEEE Symposium on Security and Privacy (SP). IEEE, 2022, pp.
161–178.
[20] C. Schneidewind, I. Grishchenko, M. Scherer, and M. Maffei,
“Ethor: Practical and provably sound static analysis of ethereum
smart contracts,” in Proceedings of the 2020 ACM SIGSAC Conference
on Computer and Communications Security, ser. CCS ’20. New York,
NY, USA: Association for Computing Machinery, 2020, p. 621–640.
[Online]. Available: https://doi.org/10.1145/3372297.3417250
[21] I. Nikoli´c, A. Kolluri, I. Sergey, P. Saxena, and A. Hobor, “Finding
the greedy, prodigal, and suicidal contracts at scale,” in Proceedings
of the 34th annual computer security applications conference, 2018, pp.
653–663.
[22] W. Zhang, S. Banescu, L. Pasos, S. Stewart, and V. Ganesh, “Mpro:
Combining static and symbolic analysis for scalable testing of smart
contract,” in 2019 IEEE 30th International Symposium on Software
Reliability Engineering (ISSRE). IEEE, 2019, pp. 456–462.
[23] P. Zheng, Z. Zheng, and X. Luo, “Park: accelerating smart contract
vulnerability detection via parallel-fork symbolic execution,” in
Proceedings of the 31st ACM SIGSOFT International Symposium on
Software Testing and Analysis, 2022, pp. 740–751.
[24] C. Schneidewind, I. Grishchenko, M. Scherer, and M. Maffei, “ethor:
Practical and provably sound static analysis of ethereum smart
contracts,” in Proceedings of the 2020 ACM SIGSAC Conference on
Computer and Communications Security, 2020, pp. 621–640.
[25] S. Tikhomirov, E. Voskresenskaya, I. Ivanitskiy, R. Takhaviev,
E. Marchenko, and Y. Alexandrov, “Smartcheck: Static analysis
of ethereum smart contracts,” in Proceedings of the 1st international
workshop on emerging trends in software engineering for blockchain,
2018, pp. 9–16.
[26] F. Ma, Z. Xu, M. Ren, Z. Yin, Y. Chen, L. Qiao, B. Gu, H. Li,
Y. Jiang, and J. Sun, “Pluto: Exposing vulnerabilities in inter-
contract scenarios,” IEEE Transactions on Software Engineering,
vol. 48, no. 11, pp. 4380–4396, 2021.
[27] J. Su, H.-N. Dai, L. Zhao, Z. Zheng, and X. Luo, “Effectively
generating vulnerable transaction sequences in smart contracts
with reinforcement learning-guided fuzzing,” in 37th IEEE/ACM
International Conference on Automated Software Engineering, 2022, pp.
1–12.
[28] T. D. Nguyen, L. H. Pham, J. Sun, Y. Lin, and Q. T. Minh,
“sfuzz: An efficient adaptive fuzzer for solidity smart contracts,” in
Proceedings of the ACM/IEEE 42nd International Conference on Software
Engineering, 2020, pp. 778–788.
[29] A. Murali, N. S. Mathews, M. Alfadel, M. Nagappan, and M. Xu,
“Fuzzslice: Pruning false positives in static analysis warnings
through function-level fuzzing,” in 2024 IEEE/ACM 46th Inter-
national Conference on Software Engineering (ICSE). IEEE Computer
Society, 2023, pp. 767–779.
[30] G. Wood et al., “Ethereum: A secure decentralised generalised
transaction ledger,” Ethereum project yellow paper, vol. 151, no. 2014,
pp. 1–32, 2014.

---

12
[31] Z. Zheng, S. Xie, H.-N. Dai, W. Chen, X. Chen, J. Weng, and
M. Imran, “An overview on smart contracts: Challenges, advances
and platforms,” Future Generation Computer Systems, vol. 105, pp.
475–491, 2020.
[32] J. Chen, X. Xia, D. Lo, J. Grundy, X. Luo, and T. Chen, “Defining
smart contract defects on ethereum,” IEEE Transactions on Software
Engineering, vol. 48, no. 1, pp. 327–345, 2020.
[33] S. So, M. Lee, J. Park, H. Lee, and H. Oh, “Verismart: A highly
precise safety verifier for ethereum smart contracts,” in 2020 IEEE
Symposium on Security and Privacy (SP). IEEE, 2020, pp. 1678–1694.
[34] smartbugs, “Smartbugs wild dataset,” 2020. [Online]. Available:
https://github.com/smartbugs/smartbugs-wild
[35] B. Zhao, Z. Li, S. Qin, Z. Ma, M. Yuan, W. Zhu, Z. Tian, and
C. Zhang, “{StateFuzz}: System {Call-Based}{State-Aware} linux
driver fuzzing,” in 31st USENIX Security Symposium (USENIX
Security 22), 2022, pp. 3273–3289.
[36] M. R. Parvez, “Combining static analysis and targeted symbolic
execution for scalable bug-finding in application binaries,” Master’s
thesis, University of Waterloo, 2016.
[37] S. Arzt, S. Rasthofer, R. Hahn, and E. Bodden, “Using targeted sym-
bolic execution for reducing false-positives in dataflow analysis,”
in Proceedings of the 4th ACM SIGPLAN International Workshop on
State of the Art in Program Analysis, 2015, pp. 1–6.
[38] Y. Xue, M. Ma, Y. Lin, Y. Sui, J. Ye, and T. Peng, “Cross-contract
static analysis for detecting practical reentrancy vulnerabilities in
smart contracts,” in Proceedings of the 35th IEEE/ACM International
Conference on Automated Software Engineering, 2020, pp. 1029–1040.
[39] F. Contro, M. Crosara, M. Ceccato, and M. Dalla Preda, “Ethersolve:
Computing an accurate control-flow graph from ethereum byte-
code,” in 2021 IEEE/ACM 29th International Conference on Program
Comprehension (ICPC). IEEE, 2021, pp. 127–137.
[40] X. Rival and K. Yi, Introduction to static analysis: an abstract
interpretation perspective. Mit Press, 2020.
[41] J. Krupp and C. Rossow, “teether: Gnawing at ethereum to
automatically exploit smart contracts,” in 27th {USENIX} Security
Symposium ({USENIX} Security 18), 2018, pp. 1317–1333.
[42] P. Godefroid, N. Klarlund, and K. Sen, “Dart: Directed automated
random testing,” in Proceedings of the 2005 ACM SIGPLAN conference
on Programming language design and implementation, 2005, pp. 213–
223.
[43] F. Victor and A. M. Weintraud, “Detecting and quantifying wash
trading on decentralized cryptocurrency exchanges,” in Proceedings
of the Web Conference 2021, 2021, pp. 23–32.
[44] T. Chen, Z. Li, Y. Zhang, X. Luo, T. Wang, T. Hu, X. Xiao, D. Wang,
J. Huang, and X. Zhang, “A large-scale empirical study on control
flow identification of smart contracts,” in 2019 ACM/IEEE Interna-
tional Symposium on Empirical Software Engineering and Measurement
(ESEM). IEEE, 2019, pp. 1–11.
[45] T. Chen, Y. Zhang, Z. Li, X. Luo, T. Wang, R. Cao, X. Xiao,
and X. Zhang, “Tokenscope: Automatically detecting inconsistent
behaviors of cryptocurrency tokens in ethereum,” in Proceedings of
the 2019 ACM SIGSAC conference on computer and communications
security, 2019, pp. 1503–1520.
[46] E. Coppa, H. Yin, and C. Demetrescu, “Symfusion: Hybrid instru-
mentation for concolic execution,” in 37th IEEE/ACM International
Conference on Automated Software Engineering, 2022, pp. 1–12.
[47] Inpluslab, “Smart contract dataset,” 2021. [Online]. Available:
http://xblock.pro/#/
[48] etherscan, “A block explorer for ethereum,” 2020. [Online].
Available: https://etherscan.io/
[49] Remix, “Ethereum ide and tools for the web,” 2023. [Online].
Available: https://github.com/ethereum/remix
[50] E.Org, “Ethereum,” 2023. [Online]. Available: https://ethereum.
org/en/
[51] P. Tsankov, A. Dan, D. Drachsler-Cohen, A. Gervais, F. Buenzli, and
M. Vechev, “Securify: Practical security analysis of smart contracts,”
in Proceedings of the 2018 ACM SIGSAC Conference on Computer and
Communications Security, 2018, pp. 67–82.
[52] C. F. Torres, A. K. Iannillo, A. Gervais, and R. State, “Confuzzius:
A data dependency-aware hybrid fuzzer for smart contracts,” in
2021 IEEE European Symposium on Security and Privacy (EuroS&P),
2021, pp. 103–119.