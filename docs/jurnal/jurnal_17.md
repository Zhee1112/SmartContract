## arXiv:2505.19059v1 [cs.SE] 25 May 2025
## An Initial Exploration of Fine-tuning Small
## Language Models for Smart Contract Reentrancy
## Vulnerability Detection
Ignacio Mariano Andreozzi Pofcher
1* 
and Joshua Ellul
1,2
1*
Centre for DLT, University of Malta, Msida, Malta.
2
Department of Computer Science, University of Malta, Msida, Malta.
*Corresponding author(s). E-mail(s): ignacio.andreozzi.18@um.edu.mt;
Contributing authors: joshua.ellul@um.edu.mt;
Abstract
Large Language Models (LLMs) are being used more and more for various cod-
ing tasks, including to help coders identify bugs and are a promising avenue to
support coders in various tasks including vulnerability detection — particularly
given the flexibility of such generative AI models and tools. Yet for many tasks
it may not be suitable to use LLMs, for which it may be more suitable to use
smaller language models that can fit and easily execute and train on a developer’s
computer. In this paper we explore and evaluate whether smaller language mod-
els can be fine-tuned to achieve reasonable results for a niche area: vulnerability
detection — specifically focusing on detecting the reentrancy bug in Solidity
smart contracts.
Keywords: Generative Artificial Intelligence, Language Models, Small Language
Models, Smart Contracts
1 Introduction
Generative AI techniques have been proposed for various aspects of coding for tasks
ranging from coding assistants [1] to optimisation [2] and vulnerability detection [3]
for which promising results are being heeded. Indeed, for many cases traditional types
of code verification (be it at compile/development time [4] or runtime [5]) often out
perform generative AI-based techniques, yet such tools are often rigid and less flex-
ible compared to how generative AI techniques can be used. Given potential future
1

---

advancements of generative AI techniques, and given the flexible interface with which
tools can interact with generative AI tools, it is useful to evaluate ‘how good are
generative AI techniques at undertaking such tasks?’
Indeed, extensive work in the domain has already been proposed surrounding this
question, of which an extensive amount of literature has focused on the state-of-the-art
large language models. Whilst it may be reasonable to make use of commercially/pub-
licly available LLMs that are operated by a service provider, they indeed raise issues of
privacy and confidentiality which some entities may rather not disclose certain intel-
lectual property to (e.g. smart contract code). For this reason, we propose the use of
small and resource-constrained language models for vulnerability detection that can
execute on an individual’s computer. In this paper we investigate the evaluation of
small language models for a particular niche-area, i.e. for Solidity smart contracts
specifically for the detection of a specific type of vulnerability — the ‘reentrancy bug’.
The questions this paper aims to shed light on follow:
1. Can small open-source language models (1-3B parameters) be fine-tuned to
effectively detect reentrancy vulnerabilities in Solidity smart contracts?
2. How do different model architectures (specifically LLaMA 3B and Qwen2.5Coder
3B) compare in their ability to adapt to the specialized task of reentrancy detection
through parameter-efficient fine-tuning?
3. Can synthetic data generation techniques produce training examples that enable
effective model adaptation despite the scarcity of real-world vulnerability examples?
The remainder of this paper is structured as follows. In Section 2 we describe the
curated dataset, and then in Section 3.1 delve into details pertaining to the small
language models. We then provide evaluation details of the fine-tuned small language
models in Section 4, and for provide a comparison relative to state-of-the-art large
language models in Section 5. We then conclude in Section 6.
2 Dataset Composition
In this section, we detail the methodology adopted for generating the training and
test datasets, highlighting the reasoning underpinning the selected class distributions.
To develop an effective vulnerability detection model, comprehensive training and
test datasets were constructed, considering class distributions. The intrinsic scarcity of
vulnerable contracts within production environments naturally leads to highly imbal-
anced datasets when gathering real-world samples. This imbalance can result in models
achieving deceptively high accuracy simply by always predicting the predominant
(secure) class. Custom-crafted balanced datasets mitigate this issue by guaranteeing
an equal representation across vulnerability classes during the model’s training phase.
The training dataset developed specifically for this study consisted of 8,000 Solid-
ity smart contracts, carefully balanced between 4,000 contracts exhibiting reentrancy
vulnerabilities and 4,000 secure contracts without such vulnerabilities. Of the vulner-
able contracts, 7.5% (300) were sourced from the Reentrancy Study Dataset [6] and
manually modernised through a process described in subsequent sections, whilst the
remaining 92.5% (3,700) were systematically synthesised through controlled generation
2

---

methods. Likewise, within the secure subset, 10% (400) originated from verified secure
examples within the Reentrancy Study Dataset, and the remaining 90% (3,600) were
synthesised using template-based approaches implementing various security patterns.
The predominantly synthetic nature of the dataset was necessitated by the notable
scarcity of well-documented, sophisticated and contemporary instances of reentrancy
vulnerabilities available in public repositories.
The test dataset—used initially to evaluate baseline model performance and sub-
sequently to benchmark the trained model—comprised 120 Solidity smart contracts,
constructed using a stratified sampling procedure to ensure representative coverage of
both vulnerability-free and vulnerability-containing instances. This holdout dataset,
representing approximately 1.5% of the overall corpus, preserved a near-balanced
class distribution, with 47.5% (57 contracts) containing reentrancy vulnerabilities
and 52.5% (63 contracts) deemed secure. This distribution was a deliberate design
decision aimed at reducing evaluation bias while retaining alignment with real-world
vulnerability prevalence trends.
The composition of the test set follows a hybrid approach to evaluation data
curation. Of the 57 contracts (47.5%) containing reentrancy vulnerabilities, 44 were
sourced from the Reentrancy Study Dataset [6], while the remaining 13 represented
documented exploits observed in production environments, drawn from Caversaccio’s
curated repository
1
.
To address limitations of limited labeled data, outdated solidity versions and issues
emanating due to language changes, this research adopted a multi-faceted approach to
data collection and refinement, integrating source code repository extraction, expert
annotation, and systematic preprocessing. The 4,000 vulnerable contracts used for
training were curated through a stratified sampling methodology: 300 contracts (7.5%)
were sourced from the Reentrancy Study Dataset (as discussed) while the remaining
92.5% were synthetically generated by implementing parameterised vulnerability pat-
terns. Notably, the 300 contracts drawn from the Reentrancy Study Dataset required
substantial modification prior to inclusion in the training set due to their reliance on
legacy Solidity versions (primarily 0.4.x and 0.5.x) that made use of deprecated exter-
nal call mechanisms such as transfer() and send(), and lacked explicit overflow
protection features introduced in version 0.8.0.
The updating process involved manually adapting the contracts to align with
modern Solidity standards (version 0.8.0 and above), ensuring that the original
vulnerabilities were preserved while rendering the code reflective of contemporary
development practices. This transformation included replacing deprecated constructs
(e.g., substituting transfer() with call{value: ...}("")), introducing explicit
variable visibility modifiers, and revising arithmetic operations to account for the inte-
grated overflow checks present in newer Solidity versions. The modernisation effort was
carried out through a combination of manual contract-level review and programmatic
transformation techniques.
This modernisation process also involved incorporating explicit visibility modifiers
for variables and functions, as well as adapting arithmetic operations to leverage the
built-in overflow protection introduced in Solidity 0.8.0—thereby ensuring consistency
1
https://github.com/pcaversaccio/reentrancy-attacks
3

---

with modern security conventions. The same modernisation protocol was applied to
the 400 secure contracts sourced from the Reentrancy Study Dataset, bringing the
total number of incorporated contracts from this dataset to 700 (300 vulnerable and
400 secure), collectively contributing approximately 8.75% of the overall training cor-
pus. While quantitatively modest, this subset played a critical role in anchoring the
dataset in empirically validated vulnerability instances and informing the parameter-
isation of synthetically generated samples. The comprehensiveness of the Reentrancy
Study Dataset—achieved through a hybrid labeling methodology combining static
analysis, dynamic execution, and expert verification—provided a robust foundation
for the development of reliable vulnerability detection models. Temporal disparities,
however, posed a challenge, the smart contracts were collected between 2015 and
2022, with over 63% predating Solidity 0.8.0. As a result, a systematic modernisation
method was followed to ensure consistency with contemporary language standards.
2.1 Synthetic Data generation
We now present the methodology employed for generating synthetic smart contract
data, with the aim of producing diverse, representative, and structurally valid samples
to support robust model training.
Given the limited availability of real-world examples of reentrancy vulnerabili-
ties—with only 147 documented exploits identified in the comprehensive repository
curated by Caversaccio
2
, and merely 13 exhibiting sufficiently isolated vulnerability
patterns suitable for training — synthetic data generation became a foundational pillar
of the dataset construction strategy. This approach is consistent with methodologies
advocated by Godefroid et al. [7] and Hellendoorn et al. [8], who proposed synthetic
generation as a viable means to mitigate data scarcity in program analysis domains.
Even the extraction and preparation of this limited subset demanded considerable
effort, as vulnerability-containing contracts often required extensive disentanglement
from surrounding contract ecosystems to isolate the vulnerable components.
The dataset size of 8,000 contracts (4,000 vulnerable and 4,000 non-vulnerable) was
determined based on empirical evidence concerning the relationship between dataset
scale and model performance in specialised classification tasks.
The synthetic data generation methodology employed multiple techniques to
ensure both diversity and representativeness. We adopted a template-based generation
strategy with controlled parameterisation, maintaining consistency in fundamental
vulnerability patterns while introducing substantial variation in surface-level features.
To address class imbalance characteristics of real-world vulnerability distributions, we
employed strategic oversampling techniques, including SMOTE (Synthetic Minority
Over-sampling Technique), originally proposed by Chawla et al [9].
For smaller language models (1-3B parameters), a dataset size of 8,000 examples
constitutes an appropriate scaling factor.
2
https://github.com/pcaversaccio/reentrancy-attacks
4

---

2.2 Pattern based Generation
The first generation technique yielded 2,800 vulnerable contracts exhibiting basic
reentrancy patterns, generated through controlled parameterisation of fundamental
vulnerability templates. This method focused on producing variants of elementary
reentrancy vulnerabilities by systematically randomising variable names, function
structures, and control flow constructs, while preserving the underlying vulnerabil-
ity semantics. The implementation incorporated semantic-preserving transformations,
ensuring that the generated contracts retained essential vulnerability characteristics
while introducing surface-level diversity necessary to mitigate overfitting to superficial
code patterns.
2.3 Advanced Vulnerable Contracts
The second generation technique produced an additional 900 vulnerable contracts,
each implementing more sophisticated vulnerability patterns through a taxonomy-
guided generative framework. This methodology adopted a systematic approach to
generating contracts across four distinct reentrancy vulnerability types: single-function
reentrancy, cross-function reentrancy, cross-contract reentrancy, and read-only reen-
trancy. The implementation incorporated randomised naming for functions and
contracts to prevent the model from learning spurious textual cues, while preserving
the structural features that define each vulnerability subtype.
To address potential class imbalance among more complex reentrancy variants,
this technique leveraged SMOTE, to ensure an even distribution across vulnerabil-
ity subtypes. An illustrative example of the parameterised template-based generation
process for the single-function reentrancy subtype is provided in Figure 1.
5

---

Fig. 1 Single-Function Reentrancy Vulnerability Template
function generate_solidity_contract(vuln_type):
contract_name = "VulnContract" + str(random.randint(1000, 9999))
function_name = generate_random_function_name()
if vuln_type == "single_function_reentrancy":
contract_code = f"""
pragma solidity ^0.8.0;
contract {contract_name} {{
mapping(address => uint256) public balances;
function deposit() public payable {{
balances[msg.sender] += msg.value;
}}
function {function_name}() public {{
require(balances[msg.sender] > 0, "Insufficient balance");
(bool success,) = msg.sender.call{{value: balances[msg.sender]}}("");
require(success, "Transfer failed");
balances[msg.sender] = 0;
}}
}}
"""
As illustrated in Figure 1, the template captures the core reentrancy vulnerability
pattern — the execution of an external call prior to the corresponding state update,
which enables the reentrant behaviour. The parameterised components, such as the
contract and function names, introduce surface-level variability while preserving the
semantic structure of the vulnerability.
2.4 Vulnerability-free Contracts
For the generation of vulnerability-free contracts, two complementary techniques were
employed. The first vulnerability-free contract generation technique yielded 2,800 con-
tracts that implemented various security patterns specifically designed to mitigate
reentrancy vulnerabilities. This methodology utilised multiple templates incorporat-
ing best practices such as the Checks-Effects-Interactions pattern, ReentrancyGuard
implementations
3
, pull-payment mechanisms and mutex locks.
Figure 2 illustrates one of the template categories employed specifically demon-
strating the implementation of the ReentrancyGuard pattern as defined in the
OpenZeppelin library.
3
https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard
6

---

Fig. 2 Reentrancy Guard Secure Contract Example
contract_templates = [
"""
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
contract SecureFund{0} is ReentrancyGuard {{
mapping(address => uint256) private balances;
function deposit() external payable {{
require(msg.value > 0, "Must send ETH");
balances[msg.sender] += msg.value;
}}
function withdraw(uint256 _amount) external nonReentrant {{
require(balances[msg.sender] >= _amount, "Insufficient balance");
balances[msg.sender] -= _amount;
payable(msg.sender).transfer(_amount);
}}
}}
"""
In Figure 2, the critical security element is the nonReentrant modifier from
OpenZeppelin’s ReentrancyGuard, which enforces a mutex mechanism to prevent
reentrant calls. This pattern exemplifies one of four security strategies systematically
incorporated into the generated contracts.
2.5 Advanced Secure Contracts
The second secure contract generation technique yielded an additional 800 contracts
with more sophisticated security implementations. This methodology focused on con-
structing contracts exhibiting “deceptive complexity” — i.e. contracts which may
appear superficially vulnerable to static analysis tools but internally incorporate
layered security mechanisms to defend against reentrancy attacks. These contracts
implemented multiple security modifiers, including custom non-reentrancy locks,
block execution limits, gas-based execution guards, timestamp throttling, and secure
delegation checks.
Diversity in security implementation techniques was essential for training the
model to recognise a broad spectrum of secure coding patterns, rather than relying
on simplistic indicators of vulnerability absence. Without exposure to varied and real-
istic security architectures, the model risks developing oversimplified heuristics for
vulnerability detection.
7

---

2.6 Integration of Real-World Vulnerabilities
The integration of real-world vulnerability instances into the testing dataset is critical
for ensuring a realistic evaluation of the model’s detection capabilities. In contrast to
purely synthetic datasets — which may overlook the nuanced characteristics of prac-
tical exploits, real-world vulnerabilities serve as authentic, adversarial examples that
more accurately reflect deployment conditions and challenge the model’s robustness
in realistic scenarios.
Building upon the method outlined above, the testing dataset used for the eval-
uation of both baseline and trained models was strategically enhanced through
the deliberate inclusion of empirically documented real-world reentrancy vulnerabil-
ities. Of the 120 smart contracts comprising our testing dataset, 13 were directly
derived from empirically verified reentrancy exploits observed in production blockchain
environments, several of which were recorded as recently as late 2024.
The inclusion of recent exploitation incidents such as the Peapods Finance attack,
The Smoofs attack and the Sumer Money attack, ensures that our testing framework
evaluates model performance against contemporary attack methodologies that have
demonstrably bypassed existing security protocols.
2.7 Reentrancy Variants
Our dataset design ensures comprehensive evaluation across reentrancy variants
including instances of five principal reentrancy types: Single-Function Reentrancy,
Cross-Function Reentrancy, Cross-Contract Reentrancy and Read-Only Reentrancy.
2.8 Test Dataset Construction
The construction of the test dataset adhered to a meticulous three-phase qualification
process designed to ensure accuracy, diversity and compatibility (with 0.8.0 solidity
versions).
1. Static Analysis Verification
Candidate contracts underwent analysis using the static analysis tool Slither to
establish their classification as either vulnerable or secure. To ensure confidence in the
results contracts with conflicting analysis outcomes were either excluded or subjected
to further manual review to resolve ambiguities.
2. Syntactic Modernisation
Contracts originating from the Reentrancy Study Dataset were modernised to ensure
compatibility with Solidity 0.8.0. Key updates included updating pragma directives,
replacing deprecated functions, adding explicit visibility modifiers and refactoring
arithmetic operations to align with Solidity’s integrated SafeMath features.
3. Structural Diversity Assurance
The test set was carefully curated to encompass different reentrancy vulnerabil-
ities, including single-function reentrancy, cross-function reentrancy, cross-contract
reentrancy and read-only reentrancy.
8

---

4. Additional Checks
All selected contracts underwent cross-validation using OpenAI language models. This
step leveraged advanced contextual understanding to mitigate potential oversights
from earlier phases.
5. Manual Review and Checks
Finally, manual review to double-check accurate classification as vulnerable or non-
vulnerable was undertaken.
2.9 Modernization of Reentrancy Study Dataset Contracts
Although the Reentrancy Study Dataset formed the foundation of our test set, as dis-
cussed, substantial improvements were made to enhance its relevance and robustness
including replacing deprecated Solidity functions, implementing explicit overflow/un-
derflow protection mechanisms, and refactoring control flow structures to comply with
Solidity 0.8.x standards.
To address limitations in prior datasets, we implemented several key improvements
including synthesized contracts were added, and we increased the sample size of read-
only reentrancy samples.
3 Model Selection & Fine-Tuning Strategy of
Models: LLaMA 3B, Qwen2.5Coder 3B
In this section we discuss why we decided to evaluate in this paper LLaMA 3B and
Qwen2.5Coder 3B as the smaller models for reentrancy detection in this first study.
3.1 LLaMA 3.2 3B Model Architecture
The LLaMA 3.2 3B model represents a significant advancement in the deployment of
transformative AI capabilities for relatively resource-constrained environments. This
model serves as a compact yet capable member of the LLaMA family, engineered specif-
ically for scenarios with limited computational resources while maintaining strong
language understanding performance
4
.
LLaMA 3.2 3B utilises a decoder-only transformer architecture comprising approx-
imately 3 billion parameters. The model integrates advanced attention mechanisms
and has undergone extensive pre-training on diverse corpora, including both gen-
eral natural language and code. Building upon the foundational advances of earlier
LLaMA iterations, it incorporates architectural refinements that improve its capacity
to process and reason about structured text, such as programming languages.
We selected the LLaMA 3.2 3B model as one of the models to evaluate based on
key factors:
• Capability vs. Efficiency: The 3B scale balances complex pattern understanding
with deployability on consumer hardware.
4
https://huggingface.co/stromdotcom/Llama-3.2-3B-Instruct-tuned
9

---

• Instruction-following: Pre-training on instruction datasets enables strong zero-
shot performance in specialized tasks.
• Quantization Suitability: The architecture maintains performance under quan-
tization, significantly reducing memory demands.
3.2 Qwen2.5-Coder-3B Architecture
Qwen2.5-Coder is a specialised foundation model optimised for code understanding
and generation, rendering it particularly well-suited for security-related analysis tasks
and it has underwent extensive pre-training on 5.5 trillion tokens, with a substantial
portion of the corpus dedicated to diverse programming languages [10].
Qwen2.5-Coder-3B integrates key enhancements over general-purpose models and
was selected as another model to investigate based on the following:
• Code-specific attention: Optimised attention mechanisms tailored to the syntac-
tic and semantic structure of programming languages.
• Enhanced tokenization: Utilises a tokeniser designed to preserve meaningful code
constructs, improving parsing and comprehension.
• Instruction-following: Fine-tuned to follow complex code analysis directives,
enabling effective handling of specialised security tasks.
3.3 Quantization Implementation
The implementation employs Unsloth’s dynamic 4-bit quantization, representing a sig-
nificant advancement over traditional quantization techniques. Whereas conventional
4-bit quantization frequently results in unacceptable accuracy degradation, Unsloth’s
approach mitigates this by selectively excluding parameters from quantization based
on their sensitivity to precision loss
5
.
3.4 Parameter-Efficient Fine-Tuning with LoRA
Low-Rank Adaptation (LoRA) is employed as the primary fine-tuning method,
enabling parameter-efficient adaptation by introducing trainable low-rank matrices
into the transformer architecture while keeping the pre-trained weights frozen
6
. This
approach significantly reduces memory consumption, as gradients and optimizer states
are computed solely for the LoRA parameters.
The fine-tuning process focuses on adapting the attention mechanisms and out-
put projection layers for the vulnerability detection task, leveraging the pretrained
knowledge embedded within the model. This targeted adaptation enables the model
to associate semantic code patterns with security implications, without requiring
extensive retraining.
To further optimise memory usage, Unsloth’s gradient checkpointing is applied,
which reduces memory overhead by recomputing intermediate activations during
backpropagation, trading-off increased computational complexity for reduced memory
consumption.
5
https://unsloth.ai/blog/dynamic-4bit
6
https://research.ibm.com/blog/LoRAs-explained
10

---

4 Evaluation and Validation
In this section we evaluate the fine-tuned language models discussed in Section 3.1.
The evaluation employed a comprehensive set of performance metrics to assess
model effectiveness across multiple dimensions including accuracy, precision, recall,
F1-scores and confusion matrices. The various metrics were computed with scikit-learn
[11].
4.1 Base Model Performance
Before the parameter-efficient fine-tuning regimen described in Section 3.1 was eval-
uated, the unaltered foundational models were tested and yielded poor performance
as provided in Table 1. This baseline evidences the importance of domain-specific
adaptation for such niche areas.
Table 1 Base Model Performance Metrics
Model Accuracy Precision Recall F1-Score
LLaMA 3B 48% 0.46 0.47 0.46
Qwen2.5Coder 3B 45% 0.43 0.44 0.43
The baseline results corroborate observations made by Rabin et al. [12], who docu-
mented substantial performance shortfalls when general-purpose code language models
are deployed for specialised analysis without targeted adaptation. Notably, the Qwen
2.5 Coder 3B model exhibited marginally inferior baseline performance to the more
general LLaMA 3B model, indicating that broad code-comprehension aptitude does
not necessarily confer proficiency in niche areas like solidity vulnerability detection.
4.2 Fine-tuned Model Performance
We now delve into performance achieved for the fine-tuned models in Sections 4.2.1
and 4.2.2.
4.2.1 Evaluating the Fine-tuned LLaMA 3B Model
By employing the LoRA-based parameter-efficient fine-tuning protocol, together with
the synthetic-data augmentation workflow detailed in the above sections, the LLaMA
3B model’s performance increased to 67% test accuracy — a 19-percentage-point gain
over the baseline. The result is particularly notable given the constrained computa-
tional requirements imposed, indicating effective transfer of pretrained knowledge into
the specialised, niche domain.
Granular performance indicators are provided in Table 3.
The model’s achieves a reasonable precision (0.79) for vulnerable class predictions
— which is a valuable characteristic for security analysis where false positives can be
costly. Results acheived are comparable with many traditional approaches to vulner-
ability detection, though indeed still not as good as some traditional methods. The
11

---

Table 2 Confusion matrix for fine-tuned LLaMA-3 (3 B)
model
Predicted
Actual Non-Vulnerable Vulnerable
Non-Vulnerable 47 4
Vulnerable 26 15
Table 3 Fine-tuned LLaMA 3B Performance Metrics
Class Precision Recall F1-Score
Non-Vulnerable 0.64 0.92 0.76
Vulnerable 0.79 0.37 0.50
Weighted Average 0.71 0.67 0.64
model exhibits ambiguity in 28 of the 120 contracts — a phenomenon recognised in
language-model applications to intricate technical tasks.
4.2.2 Evaluating the Fine-tuned Qwen2.5Coder 3B Model
The fine-tuned Qwen 2.5 Coder 3B model attained 59% accuracy — an uplift of 14
percentage points relative to the baseline, yet it still lagged behind the fine-tuned
LLaMA 3B model.
Table 4 Confusion matrix for fine-tuned Qwen2.5Coder
3B Model
Predicted
Actual Non-Vulnerable Vulnerable
Non-Vulnerable 32 31
Vulnerable 18 39
The confusion matrix provided in Figure ?? for the Qwen2.5Coder 3B fine-tuned
model reveals a less accurate classification pattern than the LLaMA 3B fine-tuned
model, with 51% of non-vulnerable contracts and 68% of vulnerable contracts correctly
identified.
Inspection of the confusion matrix in Figure ?? shows that the fine-tuned Qwen
2.5 Coder-3 B offers a comparatively less accurate classification profile than the fine-
tuned LLaMA-3B, correctly identifying 51% of non-vulnerable contracts and 68% of
vulnerable ones.
Table 5 indicates that the fine-tuned Qwen 2.5 Coder-3 B attains a recall of 0.68
on the vulnerable class — substantially surpassing the 0.37 achieved by the LLaMA-
3B fine-tuned model, thus exhibiting greater sensitivity to vulnerability cues at the
12

---

Table 5 Fine-tuned Qwen2.5Coder 3B Performance
Metrics
Class Precision Recall F1-Score
Non-Vulnerable 0.64 0.51 0.57
Vulnerable 0.56 0.68 0.61
Weighted Average 0.60 0.59 0.59
expense of precision. Such a recall-oriented profile is desirable in scenarios where min-
imising false negatives outweighs concerns over false positives, for example during an
initial triage phase in which flagged contracts are subsequently subjected to expert
review.
4.3 Comparative Analysis
This section provides a comparative analysis of model-performance characteristics,
delving into the resultant performance differences together with their practical
deployment implications.
The improvements observed through fine-tuning, i.e. 19 percentage points for the
LLaMA 3B fine-tuned model and 14 percentage points for the Qwen2.5Coder 3B fine-
tuned model, demonstrate the effectiveness of domain-specific adaptation even with
limited computational resources and training data.
Fig. 3 Model Performance Improvement Through Fine-tuning
LLaMA 3B Qwen2.5Coder 3B
0
20
40
60
48 
45
67
59
Accuracy (%)
Base Model Fine-tuned Model
The larger performance gain realised by the fine-tuned LLaMA-3B model relative
to the fine-tuned Qwen 2.5 Coder-3B model merits attention and likely stems from
architectural factors that modulate fine-tuning effectiveness. The magnitude of the
observed performance uplift is striking in light of the task’s inherent complexity and
the constrained computational budget under which fine-tuning was conducted.
The 8% performance divergence between the fine-tuned LLaMA-3B (67%) and
Qwen 2.5 Coder 3B (59%) models, necessitates a closer examination of architectural
13

---

determinants. This gap underscores the pivotal influence of design choices and pre-
training regimes on adaptation capacity for specialised niche tasks. Moreover, the
fine-tuned LLaMA 3B model challenges the presumption that code-specialised models
(such as the fine-tuned Qwen2.5Coder 3B model used) are invariably optimal for all
code-related applications inlcuding niche domains, particularly in resource-constrained
settings.
Key architectural differences contribute to this performance differential:
• Positional Encoding: LLaMA-3 B leverages Rotary Position Embeddings (RoPE)
[13], affording superior modelling of long-range dependencies—crucial for detect-
ing cross-function reentrancy patterns—relative to the hybrid positional-encoding
scheme adopted by Qwen 2.5 Coder.
• Pretraining Corpus: LLaMA’s more balanced pretraining corpus, with only 17%
code
7 
versus Qwen2.5Coder’s 70%
8
, which may contribute to the belief that diverse
training data benefits transfer learning for reasoning-intensive tasks.
These findings suggest several implications:
• Domain-Specialized Models̸ ⇒ Task-Specialized Performance: LLaMA’s
outperformance undermines the premise that code-specialised models are inherently
superior for code and niche code domains.
• Fine-tuning Efficiency: The disparity in fine-tuning efficacy across architectures
underscores that low-rank adaptation success is model-dependent.
• Resource-Performance Tradeoffs: The % gap underscores the pivotal role
of architectural selection under computational constraints, indicating that model
choice can offset performance ceilings imposed by limited parameter budgets.
4.4 Error Analysis
A closer inspection of misclassification patterns furnishes salient insights into model
behaviour and potential avenues for refinement. The fine-tuned LLaMA 3B model
exhibits a pronounced propensity to classify contracts as non-vulnerable, attaining
high specificity (92%) yet limited sensitivity (37%). In contrast, the fine-tuned Qwen
2.5 Coder 3B model delivers a more balanced error profile of 51% specificity and 68%
sensitivity — albeit with a lower overall accuracy.
This divergence in error patterns suggests that the models learned distinct feature
representations during fine-tuning, specifically:
• Conservative Detection Heuristics: The fine-tuned LLaMA 3B model appears
to impose stricter detection thresholds.
• Permissive Detection Criteria: The fine-tuned Qwen2.5Coder 3B model demon-
strated more lenient detection heuristics, improving sensitivity but increasing the
false positive rate.
A contract-level examination of the misclassified instances reveals that both models
struggled with the following cases:
7
https://ar5iv.labs.arxiv.org/html/2407.21783
8
https://build.nvidia.com/qwen/qwen2 5-coder-7b-instruct/modelcard
14

---

1. Complex Cross-Contract Reentrancy Patterns: Vulnerabilities spanning
multiple contracts, typically manifesting through indirect state manipulation or
multi-stage dependency chains.
2. Read-Only Reentrancy Patterns: Subtle scenarios in which view functions
introduce state inconsistencies that facilitate reentrancy.
3. Proxy and Delegatecall Implementations: Contracts that employ sophisti-
cated proxy patterns or invoke delegatecall, thereby introducing intricate control
flows and obscuring state dependencies.
These cases align with findings by Choi et al [14], who identified similar vulner-
ability patterns as particularly difficult for automated detection tools due to their
intricate control flow and nuanced state management characteristics.
The fine-tuned LLaMA 3B model’s abstention on 28 contracts embodies an emer-
gent uncertainty — instead of issuing low-confidence predictions, the model flags
instances demanding expert scrutiny.
4.5 Conclusions from the comparative evaluation of the
fine-tuned LLaMA 3B and Qwen2.5Coder 3B models
The comparative analysis of the fine-tuned LLaMA 3B and Qwen2.5Coder 3B models
demonstrates several lessons for security and coding niche-oriented language-model
applications:
1. Architectural Primacy for Security Tasks: The performance disparity
between architectures of equivalent parameter budgets indicates that architectural
design exerts a substantial influence in niche tasks. This outcome may indicate
that targeted architectural refinements may yield better performance relative to
focusing on parameter expansion.
2. Complementary Error Characteristics: The contrasting error profiles under-
score the potential of ensemble strategies that harness complementary traits.
3. Uncertainty Recognition as a Feature: The fine-tuned LLaMA 3B model’s ten-
dency to abstain from classifying contracts with ambiguous traits is advantageous
in such critical settings, where over-confidence may conceal latent vulnerabilities.
4. Pre-training Diversity Trumps Domain Specialization: The general
purpose/not-fine-tuned models’ performance indicates that a diverse pretraining
corpus cultivates additional reasoning essential for vulnerability detection more
effectively than a code-exclusive dataset — which may be the case for other niche
domains. This observation coincides with Kim et al’s conclusion that transfer-
learning efficacy on reasoning-intensive tasks hinges more on data diversity than
on narrow domain specialisation [15].
The observed performance profile indicates that parameter-efficient fine-tuning of
model architectures furnishes a promising pathway to practical vulnerability-detection
capabilities under constrained resource budgets which may also apply to other niche-
domains.
15

---

5 Comparing the Fine-tuned Small Models with a
State-of-the-Art Larger Model
To put the work into perspective, we compared the fine-tuned small models with a
state-of-the-art larger model, namely DeepSeek-r1 14B, possessing roughly 4.7 x the
parameters of our fine-tuned LLaMA 3B model. The larger model delivered 70.43%
test accuracy — only a 3.43% gain over the fine-tuned LLaMA 3B model (67.39%).
The improvement, however, entailed markedly higher computational expenditure, and
five smart contracts had to be omitted due to resource constraints. These findings
resonate with Li et al’s observation that properly tuned 1–3B parameter models may
be able to attain 80–90% of the task performance of models ten times their size [16].
Table 6 shows the efficiency–performance trade-off, juxtaposing each model’s accuracy,
computational overhead, and contract-processing reliability.
Table 6 Model Performance and Computational Efficiency Comparison
Model Accuracy (%) Skipped Contracts Parameters (B)
DeepSeek-r1 14B 70.43 5 14
Fine-tuned LLaMA 3B 67.39 28 3
6 Conclusion
This paper provides several contributions to the smart contract analysis and small
language-model adaptation areas:
• Small Model Adaptation: We show that small language models (1–3B param-
eters) can be fine-tuned with parameter-efficient methods to detect reentrancy
vulnerabilities in Solidity smart contracts, achieving substantial gains over baseline
model performance — 19 percentage points for the fine-tuned LLaMA 3B model and
14% for the fine-tuned Qwen2.5Coder 3B model. This evidence affirms the practical
viability of resource-constrained adaptation for specialised analysis.
• Parameter-Efficient Fine-tuning: We implement and assess a Low-Rank Adap-
tation (LoRA) fine-tuning regime, demonstrating that substantive task adaptation
is attainable while updating fewer than 1% of model parameters. This result
extends to resource-bounded domain specialisation, evidencing that effective knowl-
edge transfer can be realised without the computational overhead of full-parameter
optimisation.
• Synthetic Data Generation: We devise and empirically validate a synthetic-
data generation pipeline tailored to reentrancy vulnerabilities, thereby mitigating
the acute data-scarcity constraint in vulnerability-focused AI-based techniques.
• Comparative Analysis of Model Architectures: We conduct a comparison
of divergent model architectures for niche code analysis, illuminating the interplay
between pretraining objectives, architectural design, and specialisation capacity.
16

---

The result that the fine-tuned LLaMA 3B model surpasses the code-specialised fine-
tuned Qwen2.5Coder 3B warrants further investigation to challenge the assumption
that domain-specific pretraining intrinsically yields superior performance for other
niche domains.
Our results match that of Gunasekar et al [16], who show that properly fine-tuned
small language models (1–3B parameters) can achieve 70–80% of the performance of
far larger models. This efficiency–performance trade-off marks an attractive point in
the design space for practical niche applications.
6.1 Future Research Directions
We now lay out a number of future research directions:
• Scaling Model Size: An immediate extension of this work is to interrogate the
relationship between model scale and vulnerability-detection efficacy. Evaluating
moderately larger architectures (7–13B parameters) under parameter-efficient fine-
tuning could unlock additional gains while sustaining manageable resource demands,
echoing Touvron et al’s evidence that performance scaling persists in this parameter
range for specialised tasks [17].
• Ensemble Methods: Combining outputs from multiple fine-tuned models con-
stitutes a promising route to enhanced detection accuracy. Orthogonal error
patterns from the fine-tuned LLaMA 3B and Qwen2.5Coder 3B models suggest
complementary strengths that ensemble methods could harness.
• Uncertainty Quantification: Introducing explicit uncertainty quantification
would enhance the practical utility of language-model-driven vulnerability detection.
Recasting the task as a ternary classification (e.g. vulnerable, non-vulnerable, or
uncertain) or attaching calibrated confidence scores may better align model outputs
with real-world assessment workflows.
References
[1] Millam, A., Bakke, C.: Coding with ai as an assistant: Can ai generate concise
computer code? Journal of Information Technology Education: Innovations in
Practice 23, 009 (2024)
[2] Krishna, K., Murthy, P., Sarangi, S.: Exploring the synergy between generative ai
and software engineering: Automating code optimization and bug fixing (2024)
[3] Cheshkov, A., Zadorozhny, P., Levichev, R.: Evaluation of chatgpt model for
vulnerability detection. arXiv preprint arXiv:2304.07232 (2023)
[4] Ahrendt, W., Bubel, R., Ellul, J., Pace, G.J., Pardo, R., Rebiscoul, V., Schneider,
G.: Verification of smart contract business logic: exploiting a java source code
verifier. In: Fundamentals of Software Engineering: 8th International Conference,
FSEN 2019, Tehran, Iran, May 1-3, 2019, Revised Selected Papers 8, pp. 228–243
(2019). Springer
17

---

[5] Ellul, J., Pace, G.J.: Runtime verification of ethereum smart contracts. In: 2018
14th European Dependable Computing Conference (EDCC), pp. 158–163 (2018).
IEEE
[6] Zheng, Z., Zhang, N., Su, J., Zhong, Z., Ye, M., Chen, J.: Turn the rudder:
A beacon of reentrancy detection for smart contracts on ethereum. In: 2023
IEEE/ACM 45th International Conference on Software Engineering (ICSE), pp.
295–306 (2023). IEEE
[7] Godefroid, P., Peleg, H., Singh, R.: Learn&fuzz: Machine learning for input
fuzzing. In: 2017 32nd IEEE/ACM International Conference on Automated
Software Engineering (ASE), pp. 50–59 (2017). IEEE
[8] Hellendoorn, V.J., Sutton, C., Singh, R., Maniatis, P., Bieber, D.: Global
relational models of source code. In: International Conference on Learning
Representations (2019)
[9] Chawla, N.V., Bowyer, K.W., Hall, L.O., Kegelmeyer, W.P.: Smote: synthetic
minority over-sampling technique. Journal of artificial intelligence research 16,
321–357 (2002)
[10] Hui, B., Yang, J., Cui, Z., Yang, J., Liu, D., Zhang, L., Liu, T., Zhang, J., Yu, B.,
Lu, K., et al.: Qwen2. 5-coder technical report. arXiv preprint arXiv:2409.12186
(2024)
[11] Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O.,
Blondel, M., Prettenhofer, P., Weiss, R., Dubourg, V., et al.: Scikit-learn: Machine
learning in python. the Journal of machine Learning research 12, 2825–2830
(2011)
[12] Rabin, M.R.I., Bui, N.D., Wang, K., Yu, Y., Jiang, L., Alipour, M.A.: On the
generalizability of neural program models with respect to semantic-preserving
program transformations. Information and Software Technology 135, 106552
(2021)
[13] Su, J., Ahmed, M., Lu, Y., Pan, S., Bo, W., Liu, Y.: Roformer: Enhanced
transformer with rotary position embedding. Neurocomputing 568, 127063
(2024)
[14] Choi, J., Kim, D., Kim, S., Grieco, G., Groce, A., Cha, S.K.: Smartian: Enhanc-
ing smart contract fuzzing with static and dynamic data-flow analyses. In: 2021
36th IEEE/ACM International Conference on Automated Software Engineering
(ASE), pp. 227–239 (2021). IEEE
[15] Kim, Y.J., Kwak, B.-w., Kim, Y., Amplayo, R.K., Hwang, S.-w., Yeo, J.: Modular-
ized transfer learning with multiple knowledge graphs for zero-shot commonsense
reasoning. arXiv preprint arXiv:2206.03715 (2022)
18

---

[16] Li, Y., Bubeck, S., Eldan, R., Del Giorno, A., Gunasekar, S., Lee, Y.T.: Text-
books are all you need ii: phi-1.5 technical report. arXiv preprint arXiv:2309.05463
(2023)
[17] Touvron, H., Martin, L., Stone, K., Albert, P., Almahairi, A., Babaei, Y., Bash-
lykov, N., Batra, S., Bhargava, P., Bhosale, S., et al.: Llama 2: Open foundation
and fine-tuned chat models. arXiv preprint arXiv:2307.09288 (2023)
19