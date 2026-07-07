## Towards Compositional Generalization in LLMs for Smart
## Contract Security: A Case Study on Reentrancy Vulnerabilities
Ying Zhou
†
, Jiacheng Wei
†
, Yu Qi, Faguo Wu
*
, Xiao Zhang
*
School of Artificial Intelligence, Beijing, China
Beijing Advanced Innovation Center for Future Blockchain and Privacy Computing, Beijing, China
zy2442115@buaa.edu.cn;jakiewei258@gmail.com
Abstract
Large language models (LLMs) demonstrate remarkable capabil-
ities in natural language understanding and generation. Despite
being trained on large-scale, high-quality data, LLMs still fail to
outperform traditional static analysis tools in specialized domains
like smart contract vulnerability detection. To address this issue,
this paper proposes a post-training algorithm based on atomic task
decomposition and fusion. This algorithm aims to achieve combina-
torial generalization under limited data by decomposing complex
reasoning tasks. Specifically, we decompose the reentrancy vulner-
ability detection task into four linearly independent atomic tasks:
identifying external calls, identifying state updates, identifying data
dependencies between external calls and state updates, and deter-
mining their data flow order. These tasks form the core components
of our approach. By training on synthetic datasets, we generate
three compiler-verified datasets. We then employ the Slither tool
to extract structural information from the control flow graph and
data flow graph, which is used to fine-tune the LLM’s adapter. Ex-
perimental results demonstrate that low-rank normalization fusion
with the LoRA adapter improves the LLM’s reentrancy vulnerability
detection accuracy to 98.2%, surpassing state-of-the-art methods.
On 31 real-world contracts, the algorithm achieves a 20% higher
recall than traditional analysis tools.
CCS Concepts
• Do Not Use This Code → Generate the Correct Terms for
Your Paper; Generate the Correct Terms for Your Paper; Generate
the Correct Terms for Your Paper; Generate the Correct Terms for
Your Paper.
Keywords
large language models, compositional generalization, smart con-
tract security, reentrancy vulnerabilities
† 
Equal contribution.
* 
Corresponding authors.
Permission to make digital or hard copies of all or part of this work for personal or
classroom use is granted without fee provided that copies are not made or distributed
for profit or commercial advantage and that copies bear this notice and the full citation
on the first page. Copyrights for components of this work owned by others than the
author(s) must be honored. Abstracting with credit is permitted. To copy otherwise, or
republish, to post on servers or to redistribute to lists, requires prior specific permission
and/or a fee. Request permissions from permissions@acm.org.
Conference acronym ’XX, Woodstock, NY
© 2018 Copyright held by the owner/author(s). Publication rights licensed to ACM.
ACM ISBN 978-1-4503-XXXX-X/2018/06
https://doi.org/XXXXXXX.XXXXXXX
ACM Reference Format:
Ying Zhou
†
, Jiacheng Wei
†
, Yu Qi, Faguo Wu
*
, Xiao Zhang
*
. 2018. Towards
Compositional Generalization in LLMs for Smart Contract Security: A Case
Study on Reentrancy Vulnerabilities. In Proceedings of Make sure to enter
the correct conference title from your rights confirmation email (Conference
acronym ’XX). ACM, New York, NY, USA, 18 pages. https://doi.org/XXXX
XXX.XXXXXXX
1 Introduction
Large language models (LLMs), pre-trained on extensive text cor-
pora, exhibit remarkable capabilities in both language understand-
ing and generation. This arises because abundant training data
expand the parameter space far beyond the constraining signal.
At the same time, the deterministic rank of the data distribution
provides structural regularity, guiding the model toward stable so-
lutions. Together, these conditions enable emergent capabilities.
However, in specialized vertical domains such as smart contract
vulnerability detection, even advanced models like GPT-5 fail to
outperform static analysis tools [14, 28]. This remains the case de-
spite GPT-5 being trained on nearly exhaustive high-quality data.
Therefore, data from many vertical domains are insufficient to sup-
port emergent behavior in LLMs, let alone complex reasoning tasks
requiring high accuracy. Furthermore, LLMs constrained by frozen
pre-training, often lag behind the rapidly evolving data of vertical
domains [21, 32]. Tasks such as code verification are inherently
constrained by graph structures, which encode control-flow and
data-flow dependencies [34, 37] and ultimately determine execution
correctness.
Combinatorial generalization refers to a model’s ability to trans-
fer capabilities across changing data distributions (i.e., new and
unseen combinatorial structures) by leveraging its understand-
ing of the underlying components. In recent years, extensive re-
search [1, 39] has investigated the combinatorial generalization of
LLMs, particularly in the vertical context of complex reasoning.
Many studies [16, 18, 29, 35] have sought to reduce the complexity
of reasoning tasks by decomposing them into simpler subtasks to
improve accuracy. This decomposition has further motivated re-
search on how to recombine these subtasks into the overall task.
However, current research [7, 15, 17, 30] has not adequately ad-
dressed the stability and efficiency of models when applied to novel
tasks. Furthermore, little research has examined the combinatorial
generalization of LLMs in specialized vertical domains, such as code
vulnerability detection. Smart contract vulnerabilities are closely
tied to asset security and have thus attracted more research atten-
tion and tool development than traditional software vulnerabilities.
Among them, reentrancy vulnerabilities [5], as one of the most
representative and persistent types, are particularly well-suited for
## arXiv:2601.06914v1 [cs.CR] 11 Jan 2026

---

Conference acronym ’XX, June 03–05, 2018, Woodstock, NY Trovato et al.
studying combinatorial generalization. Detecting such vulnerabili-
ties requires integrating multiple factors, including external calls,
state updates, execution order, data dependencies, and the absence
of defense mechanisms. Therefore, this article investigates how
atomic task decomposition and recombination can enhance
LLMs in detecting reentrancy vulnerabilities under limited
data, thereby advancing out-of-distribution generalization.
A reentrancy vulnerability occurs when a smart contract relies
on a previously read state during an external call, and the call pre-
cedes the state update in the data flow. Based on this definition,
we decompose reentrancy vulnerabilities into four linearly inde-
pendent atomic tasks: (1) identifying external calls, (2) identifying
state updates, (3) detecting data dependencies between external
calls and state updates, and (4) determining their data-flow order.
Preliminary evaluation shows that LLMs perform poorly except
(2) identifying state updates. To overcome dataset limitations, we
used LLMs to generate prompts guided by carefully designed rules.
With this approach, we constructed compilable datasets for the
three tasks. We then employed Slither to compile these datasets,
extracting knowledge from the intermediate representation (IR)
layer and generating structural information for the Control Flow
Graph (CFG) and Data Flow Graph (DFG) subtasks. This process
ultimately yielded three new CoT datasets. We subsequently fine-
tuned the base model to develop task-specific adapters. To improve
LLMs accuracy in reentrancy vulnerability detection, we fused the
three adapters and the base-model (represent the state update fac-
tor). The fusion process was optimized with cross-entropy loss and
accuracy as objective functions, yielding a final adapter specialized
for reentrancy vulnerabilities.
In our experiments, LoRA adapters trained on compiler-verified
factor datasets achieve near-saturated results (97–99% F1). When
fused, the adaptive variant reaches 94.7% F1 and 98.2% ACC, improv-
ing by 16.8% and 5.7% over the single-task LoRA baseline. On 31 real
contracts, recall increases to 87.1%, exceeding the best traditional
analyzer by 23.77%. Full-rankness tests under class-prior perturba-
tions show nearly identical AUROC and AUPRC curves, confirming
balanced and stable factor fusion. These results demonstrate that
compositional fusion effectively unifies factor-level reasoning and
achieves robust generalization beyond fine-tuned and rule-based
baselines.
In summary, the contributions of this paper are shown as follows:
• For complex reasoning tasks in vertical domains, we pro-
pose a post-training algorithm that leverages atomic task
decomposition and fusion to realize compositional out-of-
distribution generalization, allowing LLMs to generalize un-
der limited and sparse data conditions.
• As a concrete instantiation, we apply the proposed algorithm
to reentrancy vulnerability detection by decomposing the
task, and fine-tuning on them, thereby validating its effec-
tiveness.
• We build three compiler-verified datasets (external call task,
dependency task, order task, about 2.5k cases each) with
CFG/DFG cues and semantic refinement, plus 31 real vulner-
able contracts for realistic end-to-end evaluation.
• Our method achieves 98.2% reentrancy vulnerability detec-
tion accuracy, surpassing state-of-the-art performance. Ap-
plied to real-world vulnerable contracts, it outperforms tra-
ditional static analysis tools, exceeding Slither’s highest ac-
curacy by 20%.
2 Preliminary
2.1 Out-of-Distribution Generalization
Out-of-distribution generalization means that a trained model can
correctly answer questions about combinations not included in the
training set. In simple terms, this requires the model to learn the
underlying logic of the data rather than just memorize it. Following
the idea of curriculum learning, which breaks knowledge into small
units and learns it step by step with increasing difficulty, we assume
that any reasoning task F (𝑟 ) can be decomposed into atomic and
independent units 𝑎𝑖 .The formula is as follows,
F (𝑟 ) =
𝑛Ö
𝑖=1
𝑎𝑖 , 𝑎𝑖 ⊥𝑎�, (𝑖 ≠ �,) (1)
We assume that the size of the training dataset is positively
correlated with task complexity, that is, |𝐷𝑆 | ∝ C(𝑟 ). As shown
in Equation 1, if a reasoning task 𝑟 with complexity C(𝑟 ) = 𝑁
is decomposed into 𝑛 independent atomic subtasks, the average
complexity of each subtask becomes 
𝑛
√
𝑁 , and the total complexity
is 𝑛 
𝑛
√
𝑁 . Therefore, the size of the training dataset is reduced from
O(𝑁 ) to O(𝑛 
𝑛
√
𝑁 ). This alleviates the problem of dataset scarcity.
Learning from the training results of atomic tasks can effectively
enhance the learning of the overall reasoning task. Specifically,
the weight parameters 𝜃𝑖 , obtained by training the model 𝑓𝑖 on
dataset 𝐷𝑖 for subtask 𝑖, minimize the average loss L between the
predictions and the true labels. The formula is given as follows,
𝜃𝑖 = arg min
𝜃𝑖
E(𝑥,𝑦)∼𝐷𝑖 
[ L (𝑓𝑖 (𝑥; 𝜃𝑖 ), 𝑦) ] (2)
As shown in Equation 2, the training results of atomic reasoning
need to be integrated into the weight parameters of the overall
reasoning task in order to achieve high accuracy with simple train-
ing on a small dataset. Specifically, a non-negative and normalized
weight distribution 𝛼𝑖 (𝑥) is maintained. The output probabilities
of multiple subtasks are weighted and combined to obtain the pre-
diction ˆ𝑝 (𝑦 | 𝑥) for the overall task. The formula is:
ˆ
𝑃 (𝑦 | 𝑥) =
𝑛∑︁
𝑖=1
𝛼𝑖 (𝑥) 𝑝𝑖 (𝑦 | 𝑥),
𝑛∑︁
𝑖=1
𝛼𝑖 (𝑥) = 1, 𝛼𝑖 (𝑥) ≥ 0. (3)
2.2 Reentrancy vulnerability
Code vulnerability detection places greater demands on LLMs than
code generation, as it requires a deep understanding of program
logic. For smart contracts, whose correctness directly affects finan-
cial security, such reasoning is crucial. Reentrancy vulnerabilities,
among the earliest and most well-known flaws, have caused mil-
lions of dollars in losses (e.g., the DAO attack [10]). Their root cause
lies in external calls that transfer control without timely state up-
dates, allowing attackers to reenter and drain assets. Yet, existing
detection tools often depend on surface-level syntactic heuristics,

---

Towards Compositional Generalization in LLMs for Smart Contract Security Conference acronym ’XX, June 03–05, 2018, Woodstock, NY
Low-level call
Direct data dependency
ERC-based external call
Indirect data dependency
Simple control flow (no branch)
Multi-branch control flow
Low-level call
Direct data dependency
ERC-based external call
Indirect data dependency
Simple control flow (no branch)
Multi-branch control flow
Figure 1: Comparison of a typical reentrancy pattern (top)
and our dataset-constructed example (bottom).
such as recognizing .call() followed by a balance update. In real-
ity, many recent vulnerabilities stem from misuse of ERC-standard
APIs (e.g., safeTransferFrom) rather than legacy call.value().
Figure 1 illustrates this contrast, showing how our dataset includes
ERC-based interactions and multi-branch control flows for higher
structural complexity. Therefore, given a compilable smart contract
program 𝑃 with 𝑁 lines, the reentrancy vulnerability detection task
can be decomposed into four subtasks.
Definition 2.1 (External-call factor.). The external call(e.g.,
call, delegatecall, or ERC-interface call) factor is,
𝜙𝐸 : P → {0, 1}
𝑁 
, 𝜙𝐸 (𝑃) [𝑖] = 1 ⇐⇒ line 𝑖 is external call. (4)
Definition 2.2 (State-update factor.). The state update (e.g.,
) factor is defined as,
𝜙𝑆 : P → {0, 1}
𝑁 
, 𝜙𝑆 (𝑃) [𝑖] = 1 ⇐⇒ line 𝑖 is state update. (5)
Definition 2.3 (Dependency factor.). If the state update at
line 𝑖 writes variables that are read by the external call at line �,, a
data dependency occurs and can be formulated as:
𝜙𝐷 : P → {0, 1}
𝑁 �,𝑁 
, 𝜙𝐷 (𝑃) [𝑖, �,] = 1 ⇐⇒
𝜙𝑆 (𝑃) [𝑖] = 1 ∧ 𝜙𝐸 (𝑃) [ �,] = 1 ∧ vars(𝑖) ∩ vars( �,) ≠ 0. 
(6)
Definition 2.4 (Ordering factor.). The relative order between
state updates and external calls in the data flow is defined as the order
Pre-trained
Weights
Pre-trained
Weights
Token-wise Mean Pooling
⊕
Fused
Representation 
Softmax
Linear Scoring
Adaptive Fusion Layer
Input hidden
Output label
Task-aware Gating Network
Classifier Head
�,�, �,�, �,�, �,�,
Sigmoid
All branches use the same LoRA architecture, with three
adapters updated during training and one kept frozen.
: Factor-specific LoRA Adapter: Factor-specific LoRA Adapter: Frozen pretrained weights: Frozen pretrained weights
: Batch size
: Token length
: Hidden dimension
: Branch pooled feature
: Branch-wise gating weight
: Fused representation
Figure 2: Overall framework of CompFuse.
factor:
𝜙𝑂 : P → {−1, 0, +1}
𝑁 �,𝑁 
,
𝜙𝑂 (𝑃) [𝑖, �,] =










+1, if 𝜙𝐷 (𝑃) [𝑖, �,] = 1 ∧ 𝑖 ≺df �,,
−1, if 𝜙𝐷 (𝑃) [𝑖, �,] = 1 ∧ �, ≺df 𝑖,
0, otherwise.
(7)
where 𝑖 ≺df �, indicates that there exists a feasible path in the data
flow graph from line 𝑖 to line �, without being overwritten.
3 Methodology
3.1 Compositional Function Modeling
For program 𝑃, a reentrancy vulnerability exists only when the
following four conditions are satisfied,
∃(𝑖, �,) ∈ N �,N s.t.












𝜙𝐸 (𝑃) [𝑖] = 1
𝜙𝑆 (𝑃) [ �,] = 1
𝜙𝐷 (𝑃) [𝑖, �,] = 1
𝜙𝑂 (𝑃) [𝑖, �,] = −1
⇒ ReVul(𝑃) = True (8)
We map the discrete order factor 𝜙𝑂 (𝑃) [𝑖, �,] ∈ −1, 0, +1 to a
continuous risk weight using a sigmoid relaxation, formulated as:
˜
𝜙𝑂 (𝑃) [𝑖, �,] = 
1
1 + exp
