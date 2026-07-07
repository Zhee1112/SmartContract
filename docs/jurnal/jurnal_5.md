### Profiling Gas Consumption in Solidity Smart Contracts
Andrea Di Sorbo
a
, Sonia Laudanna
a
, Anna Vacca
a
, Corrado A. Visaggio
a
, Gerardo Canfora
a
a
Department of Engineering, University of Sannio, Italy
Abstract
Nowadays, more and more applications are developed for running on a distributed ledger technology, namely dApps. The business
logic of dApps is usually implemented within smart contracts developed through Solidity, a programming language for writing
smart contracts on different blockchain platforms, including the popular Ethereum. In Ethereum, the smart contracts run on the
machines of miners and the gas corresponds to the execution fee compensating such computing resources. However, the deployment
and execution costs of a smart contract depend on the implementation choices done by developers. Unappropriated design choices
could lead to higher gas consumption than necessary. In this paper, we (i) identify a set of 19 Solidity code smells affecting the
deployment and transaction costs of a smart contract, and (ii) assess the relevance of such smells through a survey involving 34
participants. On top of these smells, we propose GasMet, a suite of metrics for statically evaluating the code quality of a smart
contract from the gas consumption perspective. An experiment involving 2,186 smart contracts demonstrates that the proposed
metrics have direct associations with deployment costs. The metrics in our suite can be used for more easily identifying source
code segments that need optimizations.
Keywords: Software Engineering for Blockchain Technologies, Smart Contracts Optimization, Code Quality, Software Metrics,
Empirical Study
1. Introduction
Blockchain emerged as the enabling technology [1] for im-
plementing transactions of electronic cash, namely cryptocur-
rency, without the brokerage of a financial institution. Thanks
to the versatility of this technology, it is now increasingly
adopted in several contexts, with different purposes far beyond
crypto-currencies. Indeed, blockchain is impacting a variety
of business sectors; at illustrative aim, some recent applica-
tions using blockchain concern
1
: sharing of sensitive data, elec-
tronic voting, cross-border payments, personal identity security,
goods authenticity and traceability, real estate processing. The
global blockchain technology market size is expected to reach
USD 57,641.3 million by 2025 [2]. This forecast entails that in
the next years we will witness a significant spreading of decen-
tralized applications (dApps), i.e., computer applications which
run on a distributed ledger technology (DLT).
The business logic of dApps is usually implemented within
smart contracts, i.e., fully-fledged programs that run on
blockchain. Ethereum is one of the most popular blockchain
platforms [3] and provides an environment to code and run
smart contracts [4]. In this environment, smart contracts are
typically developed through the Solidity object-oriented lan-
guage, before being compiled into bytecodes that can be exe-
cuted by the Ethereum Virtual Machine (EVM).
Email addresses: disorbo@unisannio.it (Andrea Di Sorbo),
slaudanna@unisannio.it (Sonia Laudanna), avacca@unisannio.it
(Anna Vacca), visaggio@unisannio.it (Corrado A. Visaggio),
canfora@unisannio.it (Gerardo Canfora)
1
See https://builtin.com/blockchain/blockchain-
applications
As each underlying technology imposes its peculiarities
and characteristics to applications that run on top of it, also
blockchain introduces critical aspects affecting smart contract
development [5]. For instance, the immutability of blockchain
complicates smart contract maintenance activities, as, once de-
ployed, they can hardly be patched [6]. For this reason, it is
crucial ensuring that a smart contract is bug-free and well de-
signed before deploying it to the blockchain [7]. Besides, since
smart contracts run on a blockchain infrastructure, a key factor
is the cost of execution due to the mining of the blocks par-
ticipating in the chain. On the Ethereum platform, the gas (in
Ether) corresponds to the execution fee compensating for such
computing resources. Pragmatically speaking, gas corresponds
to real money; unoptimized smart contracts can lead to unnec-
essary gas leaks and, thus, to money losses [8]. Moreover, when
the users produce a high number of transactions, if the dApp is
not properly designed, the execution costs could be not sustain-
able by the business model of the Decentralized Application
Organization (DAO) which manages it.
The choices done by developers, such as the types of data
structures used, the number of cycles, the kind of instructions,
the types of variables used, where and how they are initial-
ized or valued, may affect the gas consumption of a smart con-
tract. Although recent research [8] outlined design patterns and
guidelines for the development of more optimized smart con-
tracts from the gas consumption perspective, programming re-
sources and development environments that can help develop-
ers more easily identifying code units that need to be optimized
are still lacking. This is also confirmed by the survey con-
ducted by Zou et al. [9], in which the majority of interviewed
## arXiv:2008.05449v3 [cs.SE] 15 Dec 2021

---

smart contract developers feel that optimizing gas is painful,
especially in complex applications, and it would be important
to have tools that allow optimizing smart contract source code
rather than bytecode. Indeed, to estimate gas consumption,
a typical workflow consists of deploying the smart contract
within a simulated DLT running on a private workstation or lo-
cal servers and obtaining an estimation of the cost
2
. If the cost is
too high, the smart contract is modified, deployed again on the
local simulated DLT, and the new cost is evaluated. This pro-
cess is repeated till the result is satisfying. Recently, Ajienka et
al. [10] studied the correlation between object-oriented metrics
and the resources required for smart contracts deployment. The
results of this prior work demonstrate that while inheritance-
based metrics represent good indicators of the gas used for
smart contracts deployment, coupling-related metrics do not.
This achievement partially confirms the belief that traditional
software metrics do not capture all the specific aspects of smart
contracts and the need of metrics specifically designed for smart
contracts [11].
To fill this gap, the goal of our work is to provide a tool for
helping developers more easily identifying code units that may
be optimized for achieving gas savings. In particular, devel-
oper communities have identified Solidity cost smells, which
are coding practices that can negatively affect deployment and
transaction costs of a smart contract. Such cost smells are not
gathered into a unique catalog, but they are dispersed within
different books, reports, and web forums. In this paper, we
collect a set of 19 cost smells and, through a survey involv-
ing 34 among smart contract developers and researchers, assess
the perceived relevance of the collected cost smells. The sur-
veyed developers discussed the extent to which they agree that
the identified smells are actual problems and that the proposed
solutions are potential candidates to fix those problems, achiev-
ing an average agreement of about 70% over the smells and
solutions presented in the catalog. On top of these smells, we
define a suite of code metrics, namely GasMet (standing for
Gas Metrics), for statically evaluating the code quality of smart
contracts, from the gas consumption perspective. Through an
experiment involving 2,186 real-world smart contracts, we ob-
tain empirical evidence about the relationships existing between
the defined metrics and gas consumption required by the de-
ployment of a smart contract. The advantage brought by Gas-
Met is that the developers can more easily localize the segments
of their code that need optimization, while coding, without de-
ploying or running it on a DLT, simulated or real. Thus, the
metrics in our suite can help developers implementing more op-
timized smart contracts requiring lower resource consumption.
In particular, the collection of GasMet metrics can give devel-
opers general indications of gas consumption inefficiencies oc-
curring in the code, fostering the application of gas-saving pat-
terns [8]. Besides, blockchain researchers could leverage the
proposed metrics to develop linters for accurately capturing the
occurrences of cost smells in source code.
The original contribution of this paper includes:
2
https://ethereum.stackexchange.com/questions/27452/how-
to-estimate-gas-cost
• a collection of cost smells, i.e., coding practices that entail
a higher cost of smart contract deployment and execution;
• the results of a survey involving real smart contract de-
velopers on the perceived relevance of each defined cost
smell;
• GasMet, a suite of metrics for identifying the occurrences
of the defined cost smells; and
• an empirical study for identifying the GasMet metrics that
most correlate with deployment costs.
Previous research proposed tools based on symbolic execu-
tion for (i) automatically inferring gas upper bounds of smart
contracts’ public functions to prevent out-of-gas vulnerabili-
ties [12], or (ii) analyzing the number and types of bytecode
instructions executed to detect under-optimized storage pat-
terns [13], whereas static analysis techniques turned out to be
effective for automatically identifying gas-related vulnerabili-
ties [14]. Our suite of metrics (i) provides information that
is complementary to the one provided by the aforementioned
tools, and (ii) aims at supporting developers in identifying po-
tential inefficiencies in the smart contracts/functions implemen-
tations that could lead to higher gas consumption when deploy-
ing smart contracts. In particular, our metrics are related to a
variety of gas-inefficient practices (not only to storage usage)
and they are computed directly on the Solidity source code.
In addition, our metrics do not take into account function in-
puts, as previous experiments demonstrated that only a small
percentage of smart contracts (i.e., about 10%) do not follow
the Ethereum safety recommendations
3 
and their gas consump-
tion depends on the size of data stored, the size of functions
inputs, or the blockchain state [12].
Paper structure. The paper proceeds as follows. Section 2
highlights the novelty of our findings with respect to the exist-
ing literature. Section 3 details the identified cost smells, while
Section 4 illustrates our study on the relevance of the identified
cost smells and discusses the related results. Section 5 intro-
duces the GasMet suite and tool, while Section 6 deals with the
evaluation of the suite and the results of our correlation anal-
ysis with gas consumption. Threats to our study’s validity are
commented on in Section 7 and, finally, Section 8 concludes the
paper.
2. Related work
In this section, we discuss the related literature that has been
mainly devoted to studying (i) software metrics for Blockchain-
Oriented Software (BOS in the remainder of the paper), (ii) is-
sues related to weaknesses in smart contracts source code, and
(iii) evaluation of gas consumption.
3
https://github.com/ethereum/wiki/wiki/Safety
2

---

2.1. BOS software metrics
Ortu et al. [15] provided a statistical characterization of
BOS. The authors inspected and compared 5 C++ open source
Blockchain-Oriented and 5 Traditional Java software systems,
to discover strength differences between the two categories of
projects, and particularly in the statistical distribution of 10
software metrics. Even if there are similarities between the
statistical distributions for Traditional software and Blockchain
software, the distribution of Average Cyclomatic and Ra-
tion Comment To Code metrics detect significant differences,
whereas the Number of Statements metric reveals meaningful
differences on the double Pareto distribution.
Hegedus [16] used Object-Oriented (OO) metrics for esti-
mating properties of the smart contracts written in Solidity.
Based on the results, the author found that smart contract pro-
grams are short, not excessively complex and with few or no
comments. Furthermore, it would be useful for smart contracts
to have an external library and dependency management mech-
anisms because many libraries have similar functionalities.
Tonelli et al. [17] investigated the differences between the
software metrics measured on Smart contracts (SC) and metrics
extracted from traditional software systems. The authors built
their dataset from the Etherscan collection
4
, taking the Smart
Contracts bytecode, the Application Binary Interface (ABI),
and the Smart Contract source code (written in Solidity) for
each sample. The authors implemented a code parser to extract
the software metrics for each smart contract considered. They
have computed: the total lines of code to a specific blockchain
address, the number of smart contracts inside a single address
code, blank lines, the comment lines, the number of static calls
to events, the number of modifiers, the number of functions,
number of payable functions, the cyclomatic complexity as the
simplest McCabe definition, the number of mappings to ad-
dresses for the dataset considered. Based on the results, smart
contract lines of code metric is the metric that is closest to the
statistical distribution of the corresponding metric in a tradi-
tional software system.
Gencer et al. [18] proposed a measurement framework for
two of the dominant cryptocurrencies, Bitcoin and Ethereum.
They estimated the network resources of nodes and the inter-
connection among them, the protocol requirements influencing
the operation of nodes, and the robustness of the two systems
against attacks to analyze the depth of decentralization. They
found that neither Bitcoin nor Ethereum has rigorously better
properties than the other.
Other papers have computed more specific metrics tailored
for specific application domains, such as healthcare [19], and
model the real-time predictive delivery performance in supply
chain management [20].
With respect to these metrics, the ones of the suite proposed
in this paper aim at evaluating Solidity code’s patterns that de-
teriorate the performance of the smart contract’s deployment.
4
https://etherscan.io/
2.2. Weaknesses on Smart Contract’s source code
A part of the literature on BOS concerns the analysis and
detection of different types of weaknesses affecting the code of
a smart contract.
Ye et al. [21] realized a comparison of the state-of-art bug de-
tection tools and executed experiments to find their advantages
and disadvantages.
By analyzing the literature, Demir et al. [22] identified the
vulnerabilities that developers must fix when writing smart con-
tracts. In addition, they analyzed applications that seek these
vulnerabilities and provided an overview of how they are used
and which they cover. In their analysis, they identified issues
related to smart contracts and provided a discussion about the
problems, the challenges and the techniques of the available
technology in this area.
Peng et al. [23] proposed SIF, a framework useful for Solidity
contract monitoring, instrumenting, and code generation. SIF
is able to detect bugs, analyze, optimize and generate code to
support developers and testers. This framework has been tested
on real smart contracts deployed on the Ethereum platform.
Tikhomirov et al. [24] propose a classification of problems
that may occur in smart contract code. Subsequently, they im-
plemented a static analysis tool that can identify them, called
Smartcheck. The tool converts Solidity source code into an
XML-based intermediate representation and compares it with
XPath models. The tool has been tested on a large set of real
smart contracts.
Kalra et al. [25] presented ZEUS, a framework to check the
correctness and confirm the fairness of smart contracts. By cor-
rectness, they mean using secure programming practices, in-
stead, fairness indicates compliance with high-level business
logic. ZEUS simultaneously uses abstract interpretation, the
symbolic model checking and horn clauses to speedily check
the security of smart contracts. Zeus has been tested on over
22,000 smart contracts and it has shown that around 94.6% of
them are vulnerable.
In our study, we focus on the cost smells which, at the best
knowledge of the authors, is a novel area of investigation in the
literature regarding BOS.
2.3. Gas Cost Evaluation
Literature studying the relationship between the smart con-
tract’s code and the cost of its deployment and execution has
yet a small number of contributions.
Baird et al. [26] explore the economics of smart contracts.
There is a disparity that continues to increase between the ac-
tual costs of executing smart contracts and the computational
costs. This occurs because the gas cost model of the Ethereum
Virtual Machine (EVM) instruction-set is poorly implemented.
To resolve this problem momentarily, the Ethereum community
increases the cost of gas periodically. In their study, the authors
showed a new gas cost model that fixes the principal irregularity
of the current Ethereum gas cost model. Their new cost model
blocks the ongoing inflation of execution time per unit of gas.
Chen et al. [3] proposed analysis to show that many smart
contracts have dependencies on the cost of gas and could be re-
placed by more efficient bytecodes to save gas. For this goal,
3

---

they implement GASPER to automatically discover gas-costly
programming patterns from the bytecode of smart contracts.
Their analysis focuses on dead codes, Opaque Predicates, Ex-
pensive Operations in a Loop in relation to the gas cost using
bytecode; our metrics extract information from a smart contract
but at a higher level than bytecode, i.e. at the source code level.
More recently, Albert et al. [12, 13] proposed methods and
tools for automatically inferring gas upper bounds for smart
contract functions, while Grech et al. [14] presented a static
analysis tool for detecting gas-focused vulnerabilities in smart
contracts. Instead, Marchesi et al. [8] have identified a set of
24 design patterns that influence gas consumption in the execu-
tion of Ethereum smart contract. After classifying these design
patterns into 5 categories (external transaction, storage, saving
space, operations and miscellaneous), for each pattern, they de-
scribe the problem and a possible solution. We can observe
similarities between the cost smells and patterns identified by
Marchesi et al.. In particular, based on the descriptions pro-
vided, 14 cost smells identified in our study are similar to pat-
terns presented in prior work. In contrast, our study reports
five cost smells, two related to the number of loops present in
the contract and the number of variables declared in them (i.e.,
CS11 and CS1, respectively), two concerning the use of mem-
ory type arrays and public members (i.e., CS7 and CS2, respec-
tively), and one pertaining to the number of indexed parameters
within events (i.e., CS13), that were not discussed in [8]. In
addition, differently from this previous study, we (i) assessed
the relevance of the identified cost smells through a survey in-
volving real smart contract developers, and (ii) defined a suite
of metrics for more easily identifying the code smells that can
negatively impact gas consumption. On static profiling and
optimization of Ethereum smart contracts, Correas et al. [27]
presented a novel static profiling technique based on static re-
source analysis to generate upper-bound expressions on a vari-
ety of resources (e.g., the number of storage instructions, gas
consumed by some EVM operations, total ether sent by an ex-
ternal call, etc.) that can be used for optimizing the gas con-
sumption of smart contracts. Moreover, through the use of an
automatic optimization of Solidity programs, they propose to
reduce gas consumption by replacing the accesses to state vari-
ables by gas-efficient accesses to local variables. Brandstatter et
al. [28] presented a python solidity-optimizer based on classical
code efficiency optimization strategies in the context of smart
contracts, postulated in early work by Bentley [29] and grouped
into six categories (time-for-space rules, space-for-time rules,
loop rules, logic rules, procedure rules, and expression rules).
In [30], Chen et al. proposed ten gas-inefficient programming
patterns belonging to four categories. The first category regards
useless code (i.e., opaque predicates and dead code). The sec-
ond category encompasses the expensive operations in loops
(such as the cost smell CS1 identified in our study), the fusible
loops, and the repeated computations in loops. The third cate-
gory deals with the wasted disk space (e.g., storage that is never
used after definition). Finally, the fourth category comprises
gas-inefficient operation sequences (i.e., consecutive EVM op-
eration sequences that can be replaced with gas-efficient opera-
tion sequences). The authors also presented GasChecker, a tool
able to detect the defined gas-inefficient patterns in the byte-
code of Ethereum smart contracts. Unlike the GasMet tool that
collects metrics at the source code level, GasChecker is based
on symbolic execution and works at the bytecode level.
In a different effort, Chen et al. [7] defined 20 types of con-
tract defects, by analyzing posts on Ethereum StackExchange
5
.
Among the defects identified, there are functions and data types
that can increase gas consumption. As in our study, to validate
the elicited contract defects, they conduct a survey with prac-
titioners and evaluate the diffusion of such defects in 587 real
world smart contracts. However, while previous work mainly
focuses on characterizing different types of defects and only
suggests the implementation of practical tools for practitioners,
our study has a special focus on bad coding practices that can
negatively affect gas consumption, also providing developers
with a concrete suite of metrics for more easily evaluating smart
contract code quality from the gas consumption perspective.
3. Elicitation of cost smells
We identified a set of cost smells, by inspecting specialized
forums and books dealing with the development of Solidity
smart contracts. Although exhaustively identifying any possi-
ble cost-related defect in smart contracts is not an objective of
this paper, we relied on multiple sources to spot out some com-
mon bad practices in smart contract development with Solidity
that can negatively impact gas consumption. In particular, we
(i) leveraged some textbooks [38], highlighting good practices
in smart contracts and decentralized applications development,
and (ii) consulted technical blog posts dealing with Solidity
and gas optimization tips. Specifically, to mine potential smell-
related posts, the keywords (i) “Solidity gas consumption”, (ii)
“Solidity gas usage”, (iii) “Solidity gas optimization”, and (iv)
“Solidity gas saving” have been used to perform the Google
search. By inspecting the ten top-ranked retrieved documents
for each search query, we were able to discover ten blog posts
specifically targeting Solidity coding practices for optimizing
gas usage [31, 41, 40, 32, 33, 34, 35, 36, 37, 39]. Relying on
the aforementioned information sources, we found that, in gen-
eral, gas consumption could be negatively affected by:
• inefficient use of data storage;
• inefficient implementation of functions.
In particular, we identified 19 cost smells (i.e., coding prac-
tices entailing higher gas consumption). Table 1 reports the
identified cost smells, along with a brief description of each
smell and a reference to the webpage from which it has been
deduced. In particular, the cost smells reported in Table 1 could
be related to either inefficient use of data storage (i.e., CS1, CS4,
CS7, CS8, CS9, CS10, CS11, CS12, CS13, CS14, CS15, CS17,
and CS18) or inefficient implementation of functions (i.e., CS2,
CS3, CS5, CS6, CS16, and CS19).
5
https://ethereum.stackexchange.com/
4

---

Table 1: The list of the identified Cost Smells along with the rationale explaining the relationship with the gas consumption.
Id Type Cost Smell Description Ref.
CS1 storage Duplicate writes 
Modifying a variable’s value several times could require much gas. To save gas, developers should
overwrite variables outside cycles as much as possible. 
[31]
CS4 storage 
Inefficient initializa-
tion of variables
An uninitialized variable is automatically set with its default value (e.g., a uint256 variable, when not
initialized, it is assumed to have the default value 0). When declaring a variable, explicitly setting it
with its default value is useless and wastes gas.
[32]
CS7 storage 
Inefficient use of
memory arrays
Whenever a developer has to make some internal computation in a Solidity function with the help of
an array, it may be good to avoid using storage, by employing memory arrays. If the size of the array
is exactly known, fixed size memory arrays can be used to save gas.
[33]
CS8 storage 
Inefficient use of
strings
Using bytes32 is cheaper than using the string type. If the length of the string can be limited to a
certain number of bytes, bytes1 to bytes32 data types are preferable wherever possible. 
[34]
CS9 storage 
Inefficient use of re-
turn values
A simple optimization in Solidity consists of naming the return value of a function. It is not needed to
create a local variable then. 
[35]
CS10 storage 
Inefficient use of
global variables
Storing global variables in memory is expensive in terms of gas. Number and size of global variables
should be minimized. 
[36]
CS11 storage Unbounded loops 
In general, loops should be avoided. If avoiding loops is not possible, it could be beneficial to try to
avoid unbounded loops, i.e., loops where the upper limit of iterations is not defined. 
[37]
CS12 storage 
Inefficient use of
data types
Use bytes32 whenever possible, because it is the most optimized storage type. For example, storing
a small number in a uint8 variable is not cheaper than storing it into a uint256 variable, as, for
storing, any smaller data is padded with zeros to fill the 32 bytes, requiring additional operations from
the EVM and additional gas.
[37]
CS13 storage 
Inefficient use of in-
dexed parameters
The indexed parameters in events have additional gas costs. It is preferable to only use the indexed
qualifier for event parameters that should be searchable. 
[38]
CS14 storage 
Inefficient use of
structs
Since many DApps use storage, it would be useful to reduce archiving costs in order to optimize gas
costs. In particular, instance or struct variables can be packed together to reduce storage costs, while
mappings can not. Thus, using a high number of mappings could result in higher storage costs than
using variables that can be packed into single storage slots.
[39]
CS15 storage 
Inefficient use of
mappings
As arrays are not stored sequentially in memory and each access to array elements requires a key-value
lookup, in Solidity, arrays are more expensive versions of mappings with added features making them
array-like (e.g., length, bound checking, sophisticated packing behaviors, automatic zeroing out of
unused storage slots, special optimizations). To save gas, mappings are preferable to arrays.
[40]
CS17 storage 
Inefficient use of
booleans
Booleans (bool) are uint8 which means they use 8 bits of storage even if they can have only two values:
True or False. When EVM packs the bools normally it can store only 32 bools in one memory slot.
Otherwise, a set of 256 different booleans could be more efficiently packed in a single word by not
declaring them as bool but uint256, using one bit for each boolean value.
[32]
CS18 storage 
Inefficient use of
events 
It is cheaper to store data that is not required on-chain in events rather than variables. [32]
CS2 function 
Abundance of pub-
lic members
The order of the functions influences the gas consumption. Since the order of the functions is based
on the method ID, this implies that the subsequent ordering can consume additional gas. Depending
on the VM transaction, each position will have an additional gas fee. Since all public members
participate in the sorting, reducing public members could save gas.
[41]
CS3 function 
Scarcity of external
functions
Storing the input parameters in memory costs gas. For all public functions, the input parameters are
copied to memory automatically. If a function is only called externally, it should be explicitly marked
as external, in a way that these parameters are not stored into memory but are read from call data
directly. This can save gas when the function input parameters are huge.
[40]
CS5 function 
Inefficient use of li-
braries
The bytecode of library functions is not made part of a deployed client smart contract. Thus, smart
contract developers could use software libraries to implement complex logic. Library imports help to
keep the size of the client smart contract small, consequently reducing the gas required for deploying
it.
[32]
CS6 function 
Inefficient use of in-
ternal functions
From inside a smart contract, calls to internal functions are cheaper than calls to public functions.
A call to a public function implies that all the parameters are copied into memory and passed to
that function. Conversely, a call to an internal function does not entail copying such parameters into
memory again.. For this reason, the use of internal functions is preferable whenever possible,
especially when the parameters are big.
[32]
CS16 function 
Inefficient use of ex-
ternal calls
Every call to an external contract costs a decent amount of gas. For optimizing gas usage, it is better to
call one function and have it return all the needed data rather than calling a separate function for every
piece of data.
[40]
CS19 function 
Inefficient use of
functions
In Solidity, it could be preferable to use fewer larger functions, rather than implementing multiple
functions, each performing a single small task. Indeed, multiple smaller functions cost more gas and
require more bytecode.
[32]
4. Study on the relevance of cost smells
The goal of this study is to investigate whether the identified
cost smells (see Section 3) are considered as relevant by smart
contract developers. To pursue this goal, we pose our first re-
search question:
RQ1: To what extent are the identified cost smells relevant
for smart contract developers?
4.1. Research method
To address RQ1, similar to previous work on code smells as-
sessment [42, 43, 44], we conduct a survey targeting experts in
the development of Solidity smart contracts and blockchain ap-
plications. Prior research [45, 46] found that developers may
have divergences of opinions about the incidence and the per-
ceived relevance of code smells. Thus, to assess the extent to
which the identified cost smells (reported in Table 1) are issues
that might actually affect gas consumption, we decided to sur-
vey real smart contract developers and blockchain experts and
ask them their opinions about the relevance of all the aforemen-
tioned smells. In particular, the survey with developers rep-
resents an important part of our study, as its results may help
to avoid considering eventual cost smells for which developers
report a low perceived relevance. Relevant guidelines on how
to design and carry out survey studies in software engineering
5

---

are provided in previous work [47, 48, 49, 50, 51, 52]. On the
one hand, according to such guidelines, we (i) design specific
and measurable goals, (ii) target subjects able to answer the
questions posed, (iii) group questions into topics, and (iv) when
possible, use standardized response formats. On the other hand,
we can not estimate whether the set of subjects involved in our
survey is a representative subset of the target population, as we
have no prior knowledge of such a population. Specifically, the
survey is structured in three sections:
• The first section aims at collecting demographic informa-
tion about respondents. In particular, this section com-
prises questions about: (i) the highest education qualifi-
cation; (ii) the domain in which respondents work (e.g.,
industry, academia, etc.); (iii) their role in the organiza-
tion (e.g., developer, project manager); (iv) the years of
experience in software development; (v) more specifically,
the years of experience in smart contract development, and
(vi) the languages used to develop smart contracts.
• The second section gathers the developers’ perceived rel-
evance about the identified Solidity code smells that may
affect gas consumption. Each smell is presented to respon-
dents through a brief description of the problem, outlining
its effects on gas usage and the optimizations to mitigate
or avoid such effects. For each smell, we ask to provide
a relevance score on a 5-level Likert scale [53] (in which
1 corresponds to strongly disagree and 5 corresponds to
strongly agree). Finally, for each question, the respondents
could provide an optional open comment.
• The final section asks questions about the general per-
ceived usefulness of a suite of metrics for more easily
identifying the identified cost smells while coding, i.e.,
(i) whether respondents perceive the availability of such a
suite of metrics useful, and (ii) whether they would be will-
ing to adopt it during smart contract development. Finally,
we ask to provide free comments about possible Solidity
code smells that were not considered in our study.
To recruit participants, we posted a link to the questionnaire
on Reddit channels related to Ethereum and Solidity develop-
ment, namely solidity, dapps, cryptodevs, ethdev,
and ethereum. Along with the link to the online survey, we
added a short message explaining its purpose, the estimated du-
ration (20 min.), and our will to only use the collected data
in aggregated, anonymized form. Besides, we sent the invita-
tion for the questionnaire completion to our contacts who are
working or studying blockchain-related topics in companies or
academic institutions. Furthermore, we invited practitioners
who regularly contribute to smart contract-related projects on
GitHub.
We summarize the responses obtained in our survey in the
form of diverging stacked bar charts, also discussing the open
comments reported by the respondents.
4.2. Results
Our survey on cost smells relevance has been kept open for
one month. During this period we were able to collect responses
from 34 different respondents. Considering that (i) the commu-
nity of smart contract developers is not so big (e.g., blockchain
technology is still in its infancy [54]), (ii) our survey asked to
assess a quite high number of different cost smells (i.e., it re-
quired a moderate amount of time for completion), and (iii) the
exploratory nature of our survey, we believe that 34 responses
are adequate for our purposes. Out of the 34 respondents, 12
own a Bachelor’s degree, 12 a Master’s degree, and 6 a Ph.D.
14 respondents have less than 5 years of development experi-
ence, 10 between 5 and 10 years, and 10 more than 10 years.
Concerning smart contract development, 12 respondents have
less than a year of experience, 16 between 1 and 3 years, and
6 more than 3 years. Considering that Ethereum and Solidity
were first released in late 2015 and that about 65% of the sur-
veyed practitioners declare more than one year of experience
in smart contract development, we believe that the respondents
have adequate expertise for judging the relevance of identified
cost smells [7]. Most of the participants (33) in our survey de-
clare to develop smart contracts using Solidity, while just one
respondent develops smart contracts with Kotlin. About 80%
of survey respondents (27) are smart contract developers, be-
sides 3 blockchain researchers, 2 teachers at blockchain-related
courses, one participant involved in smart contract testing, and
one (is a) product owner. It is worth pointing out that while
the majority of participants in our survey were already aware
of most of the 19 smells, by looking at the survey responses,
we observed that, for some smells (i.e., CS2, CS9, CS12, CS13,
and CS18), one or two participants declared to be unfamiliar
with the specific bad practices.
In Figure 1 the diverging stacked bar charts summarize the
perceived relevance of the 19 identified cost smells. The three
percentages reported in the graph indicate the proportion of dis-
agreements, neutral responses, and agreements, respectively.
As illustrated in Figure 1, the majority of interviewed develop-
ers agree or strongly agree on most of the identified cost smells.
In particular, about four-fifths of the participants in our study
agree or strongly agree on nine smells (i.e., CS3, CS6, CS7,
CS8, CS10, CS11, CS13, CS14, and CS16), about three-fifths
of them agree or strongly agree on five smells (i.e., CS1, CS9,
CS12, CS15, and CS18), and for only two smells (i.e., CS2 and
CS17) we observe that less than 50% of respondents agreed.
However, in these latter two cases (i.e., CS2 and CS17), de-
velopers mainly tend to assume a neutral position (35% and
44% of respondents, respectively), rather than disagreeing. In-
deed, concerning CS2, surveyed developers acknowledge that
public members influence gas consumption, “though this is not
the location where devs should worry too much about optimiza-
tion”. According to their opinions (i) the cost/benefit of re-
ducing public members could be not so high (e.g., “The effects
on gas costs due to function selector I would imagine are sec-
ondary to other savings I’d imagine”), and (ii) the optimiza-
tion should be performed at Ethereum or compiler level (e.g.,
“This should be fixed at the Ethereum or Solidity compiler
level.”). Similarly, for CS17, although “bit-fiddling-concepts
are an amazing source for gas-saving tactics”, survey respon-
dents feel that these tactics significantly hamper code readabil-
ity (e.g., “I don’t think it is worth saving gas if it impacts that
6

---

Figure 1: Perceived relevance of the 19 cost smells.
much the code readability”) and “the benefit in terms of gas
consumption should be carefully evaluated”. However, for en-
suring both code readability and gas savings, they recommend
that this kind of optimization should be handled at compiler
level rather than source code level (e.g., “If this is of concern,
the compiler should handle it”).
For all identified smells, less than one-third of the partici-
pants disagree or strongly disagree. In the cases in which we
observe higher percentages of disagreements, survey partici-
pants are mostly concerned about code readability and believe
that eventual optimization should be performed at the compiler
level, rather than directly in the source code. Code readability
is an important aspect to consider as developers spend a lot of
time reading and inspecting code. Thus, code readability is par-
ticularly important during smart contracts implementation and
maintenance activities [55]. Previous research [56] also demon-
strated that smart contract developers often reuse code blocks
implemented in other smart contracts. Thus, lower readabil-
ity would make the smart contract harder to understand, con-
sequently hampering code reuse [7]. As reported in previous
work [9], it is often hard to optimize gas without reducing code
readability, as more efficient code basically requires fewer in-
structions. This is the case of CS4, in which, even if the devel-
opers are aware that avoiding initializing a variable to its default
value would be an easy strategy for gas optimization, they also
argue about the negative effects on code readability (e.g., “It
saves gas but also degrades readability”). Indeed, according
to some of the participants in our survey, explicitly initializ-
ing variables is always a good practice, otherwise “it is difficult
during a review to know if the intent for the variable was to
be initialized to the default value, or if the variable is missing
the initialization”. Other participants suggest “adding a small
comment to document the default value” initialization, to save
both gas and code readability. For the same reason, some of
the developers involved in our study believe that default value
variable initialization could be optimized at a level lower than
source code (e.g., “Statically initializing a variable to its de-
fault value should be caught by the compiler and reduced to a
no-op”).
Comments of a similar sort are received for CS9, where re-
spondents recommend balancing “the readability and the gas
consumption”, as the “benefit is minimal compared to read-
ability”. Indeed, they believe that the few “cost saved does not
justify the decrease in code readability”, as named return val-
ues “are frequently the source of vulnerabilities”. Thus, since
named return values help in “reducing the size of a contract,
although of a small factor”, their usage is “an optimization the
compiler should do”. This depends also on the programming
style chosen (e.g., “. . . it is a matter of taste whether an explicit
return is better readable than naming the return variable”).
Beyond code readability, developers argue that some opti-
mizations could increase error-proneness. This is what happens
for CS1. More specifically, the survey respondents think that
“it’s a waste of gas to increment a storage variable in a loop”.
However, they report that the optimization reduces code quality
as it is “more error-prone” (e.g., “. . . If the dev changes later
the number of loop iteration, he might forget to change the in-
crease of count, which can lead to a bug/vulnerability”), and
they also highlight that the situation where the “variable won’t
be used” inside the loop “is not common in developing’s logic”.
Instead, according to the interviewed developers, code read-
ability is just one of the concerns related to CS5 and deriv-
ing from the adoption of libraries (e.g., “This has its place but
can also reduce readability”; “what is not in the contract code
7

---

Figure 2: Survey responses on perceived usefulness of a suite of metrics for identifying cost smells
is not transparent on the blockchain”). Indeed, libraries can
“cause all sorts of issues” and they are rarely used “because of
the difficulty of managing their deployment”. In addition, sur-
vey participants also highlight that the use of libraries for saving
gas mainly depends on the application’s context. Indeed, while
using libraries could be a good strategy to reduce the deploy-
ment cost, it can also increase the execution cost (e.g., “With
a library, you reduce the gas cost of deployment, but you in-
crease the gas cost of executing the contract”; “Calls to an ex-
ternal library (paid with each call) may become more expensive
than the deployment costs (paid once)”). Finally, the comments
about CS19 indicate a general reluctance of developers to adopt
coding practices that would reduce modularization (“This dis-
courages good coding practices of modularization and small,
well-contained functions”). In particular, the subjects in our
study consider security and readability “more important than
gas usage in most cases” and keeping the business logic clear
is important “for transparency and verification reasons” (e.g.,
“Devs should aim to create small functions with a clear pur-
pose, rather than complex functions difficult to review and to
test. This is another case where the gas-saving does not justify
the decrease in code readability imho”).
Figure 2 reports, again in the form of diverging stacked bar
charts, the results about (i) the perceived usefulness of a suite of
metrics for more easily identifying the enumerated smells, and
(ii) the willingness of respondents to use it if available. 30 out
of 34 respondents (88%) agreed or strongly agreed about the
usefulness of a suite of metrics capturing gas consumption in-
formation, and 28 participants (82%) indicated that they would
use it in the smart contract development process. However,
as highlighted by one of the survey participants the “problem
of metrics is that they may become quickly outdated when the
compiler changes the way it generates bytecode”, and optimiz-
ing code for gas consumption at the bytecode level would be of
broader applicability. However, since smart contract developers
desire to optimize source code rather than bytecode [9], soft-
ware metrics can allow them to directly identify the portions of
source code that would have room for efficiency improvement.
RQ1 Summary: Smart contract developers generally agree
or strongly agree about the identified cost smells. However,
they point out that some optimizations may negatively impact
code readability. The vast majority of respondents are in fa-
vor of adopting a suite of source code metrics for more easily
identifying cost smells.
5. The GasMet suite and tool
Relying on the cost smells reported in Table 1, we define a
suite of metrics (detailed in Table 2), called GasMet metrics,
able to capture information related to each smell. Table 2 re-
ports, for each defined metric, its name, its acronym, its de-
scription, the cost smell to which it is related, and the expected
direction of the correlation between the metric and the gas con-
sumption. An expected positive (P) correlation between the
metric and the gas consumption means that higher values of
the metric should correspond to higher gas consumption. On
the contrary, an expected negative (N) correlation between the
metric and the gas consumption means that higher values of the
metric should correspond to lower gas consumption.
It is worth pointing out that some metrics (e.g., DF) consider
the lines of code of the smart contract, while some others (e.g.,
PM) do not. This choice relies on the expected impact on gas
consumption. For example, according to CS2, ten public mem-
bers would have the same impact on the gas consumption inde-
pendently of the smart contract’s lines of code. Contrarily, DF
is a proxy to measure code modularization, and, according to
CS19, ten defined functions would have different gas consump-
tion impacts in smart contracts with different sizes.
The defined metrics could help in statically measuring the
code quality of smart contracts, from the gas consumption per-
spective.
They could represent a guide for developers for improving
this facet of smart contract’s quality, as very localized changes
might be required to improve the values of the specific metrics.
For instance, to achieve lower values of the ACI metric (and,
consequently, save gas), it is sufficient to reduce the number of
variable updates occurring within cycles. More specifically, the
defined metrics can help developers detecting (i) gas-inefficient
or redundant operations (e.g., ACI, AZ, NLF, RLV), (ii) func-
tion visibility (and responsibility) inefficiencies (e.g., PM, EF,
IFF), (iii) inefficient usages of data types and structures (e.g.,
UMA, SB, GV, NU, IP, NM, MA, BV, NE), and (iv) ineffi-
ciencies in code modularity (e.g., LI, EC, DF). For example,
the function visibility-related metrics can help developers iden-
tifying likely opportunities for optimizations (e.g., they could
change the modifier of functions that are only used internally
from public to internal, or update the modifier of functions
that are not used internally from public to external). Sim-
ilarly, as events consume less gas than Solidity variables, the
number of events (in combination with the number of variables)
represents a good indicator for developers interested in applying
8

---

Table 2: Metrics’ descriptions and correlations.
Metric’s name Abbr. Description CS Corr.
Assignments within Cycles ACI It computes the assignments and/or variable updates occurring within loops. CS1 P
Public Members PM It enumerates the functions defined as public members. CS2 P
External Functions EF It enumerates the functions defined as external. CS3 N
Assignments to default values AZ It computes the assignments to default values during variable definitions. CS4 P
Library Imports LI
It estimates the usage of external libraries. Given the number of import statements, S import :
LI = S import CS5 N
Internal Functions IFF
It computes the ratio of internal functions on the total number of defined functions. Given the number of internal
functions, Finternal, and the number of overall functions, Fall, defined in the contract:
IFF = 
Finternal
Fall
CS6 N
Uses of Memory Arrays UMA
It computes the ratio of memory arrays on the total number of defined arrays within the contracts. Given the
number of arrays defined as memory, Amemory, and the total number of defined arrays, Aall:
U MA = 
Amemory
Aall
CS7 N
Strings and Bytes SB
It computes the occurrences of string variables with respect to the occurrences of bytes. Given the number of
string variables, Vstring, and the number of bytes variables, Vbytes:
S B = 
Vstring
(Vbytes + Vstring)
CS8 P
Functions Returning Local Vari-
ables 
RLV
It computes the ratio of functions returning local variables on the total number of functions. Given the number
of functions returning local variables, Flocal, and the overall number of functions, Fall, defined in the contract:
RLV = 
Flocal
Fall
CS9 P
Global Variables GV It computes the number of global variables. CS10 P
Number of Loops NLF 
It computes the number of loops inside the contract. In the case of a code block with two (or more) nested loops,
the NLF metric will count two (or more) loops. 
CS11 P
Number of non-32-bytes variables NU It computes the ratio of non-32-bytes type variables on the total number of variables. CS12 P
Indexed Parameters IP It computes the number of parameters declared as indexed within events. CS13 P
Number of Mappings NM It computes the occurrences of mapping with respect to occurrences of instance variables. CS14 P
Mappings and Arrays MA
It computes the ratio of mappings with respect to the sum of mappings and arrays defined in the contract. Given
the occurrences of mappings, Nmappings and the occurrences of arrays, Narrays:
MA = 
Nmappings
(Nmappings + Narrays)
CS15 N
External Calls EC
It computes the ratio of calls to external functions (i.e., not defined in the contract) on the total number of
function calls. Given the occurrences of calls to external functions, Cexternal, and the total number of calls within
the contract, Call:
EC = 
Cexternal
Call
CS16 P
Boolean Variables BV
It computes the ratio of boolean variables on the number of total variables. Given the number of variables of the
boolean type, Vbool, the number of overall variables, Vall:
BV = 
Vbool
Vall
CS17 N
Number of Events NE It computes the number of events. CS18 N
Defined Functions DF
It computes the number of the functions with respect to the overall lines of code. Given the number of overall
defined functions, Fall, and the amount of lines of code, LOC:
DF = 
Fall
LOC
CS19 P
optimizations. Indeed, by applying updates to the smart con-
tract’s logic, they could identify data (not required on-chain) to
store in events and save gas.
For helping smart contract developers more easily identify-
ing likely gas-inefficient code portions in smart contracts writ-
ten in Solidity, we implemented the GasMet tool. GasMet is a
prototype Java tool able to parse Solidity smart contracts and
automatically compute the metrics in the GasMet suite. In par-
9

---

Figure 3: GasMet tool’s usage example.
ticular, for properly parsing smart contracts, the tool leverages
a generated parser based on a modified version of an exist-
ing antlr4 grammar
6
. Specifically, the tool is composed of
three main software modules: the Lexer, the Parser, and the
GasMet Metrics Calculator. The Lexer receives as in-
put the raw text of the Solidity smart contract and provides a
stream of tokens, relying on lexical rules. The Parser pro-
cesses this stream and builds an abstract syntax tree. The
GasMet Metrics Calculator traverses the tree generated
by the Parser to compute the GasMet metrics. Once processed
the smart contract, the GasMet Metrics Calculator stores
the results in a tabular format. The results can also be exported
as a CSV file.
The tool either provides a graphical user interface (GUI) or
can be used from the command line. The instructions for run-
ning the GUI or using it from the command line are provided in
our replication package
7
. In particular, the tool’s GUI is built
as a web application that can be deployed by using the Wild-
fly application server. Once selected a Solidity smart contract
to analyze, the tool’s GUI presents two frames (see Figure 3).
The left frame reports a table containing the results of the Gas-
Met metrics computation on the selected smart contract. More
specifically, the aforementioned table encompasses the follow-
ing information about each metric: acronym, extended name,
description, computed value, and lines involved in the compu-
tation. In the right frame, the source code of the smart contract
under analysis is shown. The lines involved in the computa-
tion of the different GasMet metrics are highlighted in red to
allow developers and researchers more easily identifying the
code portions that could likely require improvements. A devel-
oper interested in saving the gas required for the deployment
6
https://github.com/solidityj/solidity-antlr4
7
https://github.com/paperSubmition2020/
GasmetReplicationPackage/tree/master/GasMetSuite
of her smart contract could analyze the smart contract through
the GasMet tool and apply improvements to achieve better
values for the computed metrics. There are many different
tools available for Ethereum smart contracts. These tools have
been gathered from research publications and through Internet
searches. To make a comparison with the GasMet tool, we
selected the tools that are actively maintained, open-sourced,
ready for use, such as Remix-IDE
8 
and SmartCheck
9
. Unlike
our tool, Remix-IDE is a browser-based IDE for developing So-
lidity contracts. It can connect to the Ethereum network using
Metamask
10 
and developers can directly deploy smart contracts
from Remix. During compilation it is able to report security
issues, indicating where they occurred in the code. It also re-
ports implicit visibility, unchecked return values, implicit typ-
ing, deprecated constructs, and address checksums. The static
analysis is only lightweight and includes some control flow
analysis. Remix-IDE also enables the testing of smart contracts
via unit tests written using tape
11
. Remix-IDE, for the Solidity
static analysis, is not based on a suite of metrics but computes
the gas consumption associated with each Ethereum Assembly
instruction listed in the Ethereum Yellow-Paper/AppendixG
12
.
SmartCheck is a static analysis tool for smart contracts written
in Solidity and Vyper. It is developed by SmartDec and the Uni-
versity of Luxembourg. Like other static analysis tools, it works
at the source code level. In particular, it transforms the source
code into an XML-based intermediate representation. This rep-
resentation is then checked against XPath patterns to highlight
potential vulnerabilities in the code.
8
https://remix-ide.readthedocs.io/en/latest/
9
https://github.com/smartdec/smartcheck
10
https://metamask.io/
11
https://www.npmjs.com/package/tape
12
https://ethereum.github.io/yellowpaper/paper.pdf
10

---

6. Study on the relations between GasMet metrics and de-
ployment costs
The goal of this second study is to more-in-depth investi-
gate the relationships between the individual metrics in the Gas-
Met suite and smart contracts’ deployment costs. More specif-
ically, this investigation aims at assessing whether our suite can
capture gas-related information by analyzing smart contracts’
source code. To pursue this goal, we pose our second research
question:
RQ2: To which extent does the GasMet suite correlate with
gas consumption?
6.1. Context selection and data extraction
For this study, we collected a dataset containing the source
code of 2,186 Solidity smart contracts deployed on Ethereum.
Actually, there are about 1.5 million smart contracts deployed
on Ethereum [57]. However, for many of these smart contracts,
the source code is not publicly available [58]. For this rea-
son, we leveraged Etherscan
13
, a popular service for Ethereum
blockchain exploration that offers a feature called “verified con-
tracts”, through which developers can publish the source code
of blockchain smart contracts. The Etherscan API actually al-
lows obtaining the source code of more than 40,000 smart con-
tracts [59]. As we needed to compile and deploy the extracted
contracts to estimate the deployment costs and this requires a
discrete amount of time, for reducing the experimentation time,
we decided to conduct our study on a (statistically significant)
set of contracts randomly sampled from the initial collection
returned by Etherscan. It is worth noticing that the number
of instances in our dataset was defined for guaranteeing high
representativeness. Indeed, our dataset, beyond being a statisti-
cally significant sample of the Etherscan collection (i.e., a con-
fidence level of 99% and a margin of error smaller than 3%), it
is also a statistically representative sample of all the smart con-
tracts deployed on Ethereum (i.e., a confidence level of 99%
and a margin of error smaller than 3%). It is worth noticing that
the margin of error was computed according to the formula for
margin of error with finite population correction [60]:
Margin o f error = z �,
√
p �, (1 − p)
(N − 1) �, 
n
N−n
where z is the z-score associated with the confidence level
(z = 2.576 in the case of a confidence level of 99%), p is the
sample proportion (p = 0.5 in the case of random sampling), n
is the sample size (n = 2186 in our case), and N is the popula-
tion size.
For each smart contract in our dataset, we extracted the val-
ues of the GasMet metrics, by using the parser we developed
(see Section 5).
Table 3 groups the smart contracts considered in our data set
according to the number of lines of source code (SLOC). It is
worth noticing that about 73% of the analyzed contracts have
13
https://etherscan.io/
Table 3: Lines of source code of the analyzed contracts.
# of source code lines #instance %instance
SLOC <50 462 21.1
50 ≤ SLOC < 100 800 36.6
100 ≤ SLOC < 500 794 36.3
SLOC ≥ 500 130 5.9
a size expressed in lines of source code between 50 and 500,
while only a limited number of them (i.e., about 6%) exhibit
higher values of SLOC.
To collect data on gas consumption, we used the built-in
smart contract compilation. The compilation process for smart
contracts involves the Truffle suite [61] and the Ethereum client
Ganache [62] where it gets deployed. Truffle Suite is a col-
lection of tools for the development and testing of Ethereum
blockchain based software. It contains Truffle which is the
most popular development and testing framework using the
Ethereum Virtual Machine (EVM). The compilation and de-
ployment pipeline of Ethereum smart contract, that we used,
is as follows:
1. setting up an Ethereum development environment: we cre-
ate a Truffle project, read smart contracts from dataset,
create a deployment script that deploys and initializes the
state of deployed contracts on blockchain specified in the
project config file, and
2. collect data regarding gas consumption: Ganache is a lo-
cal test blockchain included in the above mentioned Truf-
fle Suite. The gas consumption, on local blockchain, is
computed by: gasCost * gasPrice. gasPrice represents
the price to pay per gas unit to deploy the contracts under
Truffle project and was set, in our experimentation, to the
value of 1 Wei (1 Ether = 10
18 
Wei). gasCost is the max-
imum number of gas unit the EVM can use to process the
contract deployment transaction.
Replication package. All the analyzed contracts source
code (.sol files), as well as the metrics’ results, are made pub-
licly available in our replication package
14
.
6.2. Analysis method
For answering RQ2, we considered the values of GasMet
metrics computed on the smart contracts in our dataset and
the related values of gas consumption collected by deploying
such smart contracts (see in Section 6.1). Similar to previous
work [10], we investigated the correlation between source code
metrics computed on several smart contracts and the resources
needed for their deployment (i.e., gasUsed), as well as the cor-
relations between each pair of metrics. More specifically, to
evaluate if significant relationships can be found between (i)
each of the GasMet metrics and the gas consumption, and (ii)
14
https://github.com/paperSubmition2020/
GasmetReplicationPackage
11

---

each pair of GasMet indicators, we used the Spearman rank cor-
relation coefficient [63], fixing the p-value ≤ 0.05 and adopting
the Holm’s p-value correction procedure [64] to deal with mul-
tiple comparisons. We ran statistical significance tests, with
α = 0.05, for being sure that there is at maximum a 5% prob-
ability that the strength of the relationship found (the ρ coeffi-
cient) happened by chance (when p-value ≤ 0.05). In particular,
we tested the following null hypothesis:
H0: There is no monotonic association between the metrics mi
and m j
where mi and m j ∈ {GasCost, ACI, PM, EF, AZ, IFF, UMA,
SB, RLV, GV, NLF, NU, IP, NM, MA, EC, BV, NE, DF} and i ,
j. We interpret the strength of the correlation as (i) small for
0.10 ≤ |ρ| ≤ 0.29, (ii) medium for 0.30 ≤ |ρ| ≤ 0.49, and (iii)
large for |ρ| ≥ 0.50, as recommended by Cohen’s standard [65].
To better understand which of the metrics in our suite might
affect gas consumption more, we performed a Random For-
est (RF) regression analysis. To perform this analysis, we
considered a dataset containing the values of all the GasMet
metrics computed on the 2,186 smart contracts selected for
our study (see Section 6.1) and the corresponding values of
gas consumption collected by deploying such smart contracts.
In particular, we tried to predict gas consumption (i.e., de-
pendent variable) based on the values of the GasMet metrics
(i.e., independent variables). In this analysis, we leveraged the
randomForest [66] package from RStudio to estimate the per-
formance of the models and the importance of variables. We
used the Random Forest regression method as it works well
with almost all types of data, generally does not overfit, and it
is easy to get the relative importance of the predictor variables
from a trained model [67]. Specifically, we first performed a
grid search to find the best model parameters (i.e., ntree, the
number of trees to grow, and mtry, the number of variables
randomly sampled as candidates at each split), by using 10-
fold cross-validation. The best model (i.e., the one with lowest
Mean Square Error) was obtained by setting ntree = 500 and
mtry = 8. Then, the following steps were performed:
1. We split the initial dataset into a training set Ttrain (i.e.,
75% of the initial dataset) and the corresponding test set
Ttest (i.e., 25% of the initial dataset) at random.
2. The RF algorithm (with ntree = 500 and mtry = 8)
was trained (on Ttrain) and tested by predicting the sam-
ples in Ttest. Popular metric were used to assess the perfor-
mance of the model: Mean Absolute Error (MAE), Root
Mean Square Error (RMSE), and the Coefficient of deter-
mination (R
2
) [68]. In particular, MAE measures the aver-
age of the residuals (i.e., the absolute difference between
actual and predicted values), RMSE represents the stan-
dard deviation of residuals, and R
2 
is the proportion of the
variance in the dependent variable (i.e., the gas consump-
tion) which is explained by the model.
3. We estimated the importance of the different metrics by
considering the samples in Ttrain and the percentage in-
crease in Mean Square Error (i.e., %IncMSE) of each in-
dependent predictor (i.e., each GasMet metric). The %In-
cMSE metric represents the deterioration of the predictive
ability of the model when a predictor is randomly per-
muted and the other predictors remain unchanged [69]. In
particular, each tree in a random forest has its out-of-bag
(OOB) sample of data that was not used during construc-
tion. This sample is used to compute the importance of a
specific variable. For each tree, the prediction error (MSE)
on the out-of-bag portion of the data is recorded. Then the
same is done after randomly shuffling the values related
to a specific GasMet metric, keeping all other variables
the same. The differences between the two MSE values
(i.e., MSE on correct data and MSE on permuted data) ob-
tained for each tree are then averaged over all trees and
normalized according to the standard deviation of the dif-
ferences [66]. Finally, the percentage increase in MSE
(%IncMSE) on the shuffled data is measured. This pro-
cedure has been applied for all the 19 GasMet metrics.
The higher the %IncMSE is, the higher the importance of
the respective predictor in relation to the target variable
is [70].
To reduce sampling bias and obtain more reliable results, we
repeated steps 1,2, and 3 ten times. Therefore, all the results
were averaged over the ten runs.
6.3. Results
Figure 4 reports the results of the Spearman correlation be-
tween each pair of the metrics in the GasMet suite and between
the GasMet metrics and gas consumption. As specified in Sec-
tions 6.1 and 6.2, for each smart contract in our dataset, we
used the GasMet tool to compute the GasMet metrics, while we
leveraged Truffle (for compiling and deploying the smart con-
tract) and Ganache (a locally deployed blockchain simulator)
to collect data about gas consumption. Once obtained the met-
rics and gas consumption values for all the smart contracts in
our dataset, we implemented a script in the R language (using
the corrplot
15 
library) to compute the correlation values. It is
worth noticing that in Figure 4 we do not consider the LI metric,
as when computing this metric on the instances in our dataset,
all zero values have been obtained.
All the results considered in the following discussion corre-
spond to an adjusted p-value ≤ 0.05.
Four metrics of the GasMet suite are more strongly linked
to the gas consumption (in accordance with the Cohen’s stan-
dard), since their correlations with the gas cost have a large
effect size, which are: (i) the occurrences of public mem-
bers (PM, with ρ = 0.65), (ii) the number of global variables
(GV, with ρ = 0.75), (iii) the number of indexed parameters
(IP, with ρ = 0.56), and (iv) the number of events (NE, with
ρ = 0.59). Higher PM values correspond to a higher gas con-
sumption since public members are hash-sorted, and the sorting
algorithm entails a certain fixed quantity of gas (depending on
the EVM transactions) for each position in the list. Global vari-
ables cause an additional cost due to the storing of information
15
https://www.rdocumentation.org/packages/corrplot/versions/0.90
12

---

Figure 4: Spearman correlation results among the metrics belonging to the GasMet suite and the gas cost (values with x above is used to indicate the correlations
that are not statistically significant).
within the smart contract’s state on the blockchain, so their us-
age must be reduced and replaced with local variables which
are not stored on the blockchain. Similarly, indexed parame-
ters consume more gas than non-indexed parameters, while, if
properly used, events could be adopted to store data that is not
required on-chain.
With regards to the metrics that exhibited a medium effect
size in the correlation with the gas cost, nine should be men-
tioned: (i) the ratio of internal functions (IFF) with ρ = 0.46,
(ii) the ratio of external calls (EC) with ρ = 0.45, (iii) the ratio
of boolean variables (BV) with ρ = 0.44, (iv) the assignments
within cycles (ACI) with ρ = 0.44, (v) the number of loops
(NLF) with ρ = 0.40, (vi) the assignments to default values
(AZ) with ρ = 0.39, (vii) the number of functions returning
local variables (RLV) with ρ = 0.38, (viii) the number of non-
32-bytes variables (NU) with ρ = 0.30, and (ix) the ratio of
mappings (MA) with ρ = 0.30.
As reported in Table 4, among the metrics exhibiting large
relationships with gas consumption, for GV, IP, and NE we ob-
serve that the majority of surveyed developers (i.e., > 58%)
agree or strongly agree on the relevance of the related smells
(i.e., CS10, CS13, and CS18). Only 47% of them agree or
strongly agree on the relevance of the CS2 smell (related to the
PM metric). However, as reported in Section 4.2, the develop-
Table 4: Survey responses and correlations between GasMet metrics and gas
consumption.
Metric
Correlation with gas
consumption (Spear-
man’s ρ)
Cost
smell
(CS)
% of survey respondents
who agreed on the CS
relevance
ACI ρ = 0.44 CS1 59%
PM ρ = 0.65 CS2 47%
EF not significant CS3 88%
AZ ρ = 0.39 CS4 50%
LI not significant CS5 56%
IFF ρ = 0.46 CS6 88%
UMA ρ = 0.17 CS7 85%
SB ρ = 0.17 CS8 76%
RLV ρ = 0.38 CS9 65%
GV ρ = 0.75 CS10 91%
NLF ρ = 0.40 CS11 88%
NU ρ = 0.30 CS12 59%
IP ρ = 0.56 CS13 82%
NM ρ = 0.20 CS14 85%
MA ρ = 0.30 CS15 65%
EC ρ = 0.45 CS16 85%
BV ρ = 0.44 CS17 41%
NE ρ = 0.59 CS18 59%
DF not significant CS19 50%
ers acknowledge that the efficient usage of public members can
save gas, but they believe that the optimizations should be per-
formed at the Ethereum or compiler level. Similarly, among the
metrics exhibiting medium relationships with gas consumption,
we observe that, for most of them (i.e., ACI, IFF, RLV, NLF, NU,
13

---

MA, and EC), the majority of surveyed developers (i.e., > 58%)
agree or strongly agree on the relevance of the related smells
(i.e., CS1, CS6, CS9, CS11, CS12, CS15, and CS16). In con-
trast, only 50% of them agree or strongly agree on the relevance
of the CS4 smell (related to the AZ metric), and 41% of the par-
ticipants in our survey agree or strongly agree on the relevance
of the CS17 smell (related to the BV metric). As reported in
Section 4.2, although developers recognize that CS4 and CS17
smells could be sources of gas wasting, they rather worry about
the risk of hampering code readability that could derive from
the optimizations. Curiously, the majority of surveyed develop-
ers agree or strongly agree on the relevance of the cost smells
related to metrics exhibiting small or not significant relation-
ships with gas consumption (i.e., EF, UMA, SB, NM, and DF).
Thus, further investigation is needed to understand whether it is
possible to define better metrics for capturing the occurrences
of the corresponding smells (i.e., CS3, CS7, CS8, CS14, and
CS19).
Five correlations with gas consumption have been observed
to be weak or not significant (i.e., UMA, SB, NM, MA, and
DF). Using a memory array (UMA), as it happens with any
other kind of variable, means that the values of the data struc-
ture are not saved in storage. Storage in Solidity refers to a
mechanism that holds data between function calls, while mem-
ory keyword makes Solidity to create a chunk of space for the
variable at method runtime, guaranteeing its size and structure
for future use in that method. By using a metaphor, storage
could be seen as a hard drive, while memory as RAM. However,
in our dataset we observed a very low usage of memory arrays
(for 2,112 smart contracts in our dataset the value of this metric
is 0). This could explain why UMA is weakly correlated with
the gas cost. Concerning the usage of string type instead of
bytes type (SB), we expected different results. Consequently,
we did not find quantitative evidence about this smell. Also in
this case, for the majority of the smart contracts in our dataset,
we observe that the value of this metric is 0. Since the results
of the survey supports CS8, we can conclude that this smell
deserves further investigation. Mappings are lightweight data
structures, free of additional functions like the length compu-
tation, bound checking, and optimization. Similar to the other
metrics exhibiting weak correlation with gas consumption, we
observe that for many smart contracts in our dataset we report
a MA value equal to 0. This could explain why MA resulted as
weakly correlated with the gas cost. On the contrary, the NM
metric assumes non-zero values for the great majority of smart
contracts in our dataset and we believe that further investigation
is needed to understand the reason behind the weak correlation
between the number of mappings and the gas consumption. The
number of defined functions (DF) is not significantly correlated
with the gas cost, while the proliferation of public members
(PM) might affect gas consumption significantly.
By observing the pairwise correlations between the metrics,
we can discover the developers’ habits in writing smart con-
tracts that can negatively influence gas consumption. Among
the correlations with a large effect size, we can observe (i) the
one between the Number of Indexed Parameters (IP) and Num-
ber of Events (NE), with ρ = 0.96, and (ii) the one between the
Figure 5: Importance of variables used in random forest modeling.
Assignment Within Cycles (ACI) and Number of Loops (NLF),
with ρ = 0.93. From these two relationships it emerges that
two bad practices are pretty common: the first one is the use
of indexed parameters within the events, while the second one
consists of valuing variables inside the cycles. As previously
mentioned, both the practices lead to an increasing of gas cost,
and should be discouraged. The correlation between ACI and
AZ, with ρ = 0.63, suggests that assignments to default values
often occur within the cycles and this trend is also confirmed
by the large correlation between NLF and AZ (ρ = 0.69). The
large effect size (ρ = 0.52) of the correlation between the Num-
ber of Loops (NLF) and the Mappings and Array (MA) metric
also implies that loops are frequently used to iterate over map-
pings. Figure 4 also shows the correlations between the various
types of functions. In particular, focusing on the metrics mod-
eling internal (IFF), external (EF), public (PM), and defined
(DF) functions, we only observe a correlation with medium ef-
fect size (ρ = 0.39) between the PM-IFF pair, while for all the
other pairs only small or not significant correlations occur. Fi-
nally, the number of global variables (GV) usually grows when
higher numbers of (i) public members (i.e., PM, ρ = 0.58), (ii)
internal functions (i.e., IFF, ρ = 0.50), (iii) events (i.e., NE,
ρ = 0.59), or (iv) indexed parameters (i.e., IP, ρ = 0.60) are
adopted.
As reported in Section 6.2, we used Random Forest regres-
sion to predict gas consumption based on the values of the Gas-
Met metrics. This analysis allowed us to estimate the impor-
tance of the different metrics in predicting gas consumption.
Specifically, the Random Forest regression algorithm achieved
an average MAE of 0.0042, an average RMSE of 0.0096, and
an average R
2 
of 0.71. This means that, on average, the trained
models can explain more than 70% of the variance in the gas
consumption. The analysis of variable importance (see Fig-
ure 5) shows that all the metrics except UMA and LI exhibit an
increase in Mean Square Error (MSE) higher than 12%. More
specifically, the most important variables influencing the gas
consumption are the number of public members (PM) and the
number of global variables (GV), both increasing the MSE by
14

---

more than 30% (31.72% and 31.60%, respectively) when ran-
domly permuted. It is worth noticing that PM and GV are also
the metrics exhibiting the highest correlation coefficient values
with gas consumption. This result confirms that the numbers
of public members (PM) and global variables (GV) might both
have a significant impact on the gas consumption predictions.
Thus, they are the most important metrics developers should
monitor. In addition, we also report an increase of MSE higher
than 20% when the the number of indexed parameters (IP) or
the number of defined functions (DF) are randomly permuted.
RQ2 Summary: Thirteen metrics of the GasMet suite ex-
hibit large (PM, GV, IP, NE) or medium (ACI, AZ, IFF, RLV,
NLF, NU, MA, EC, BV) correlations with gas consumption
required by smart contract deployment. The correlations be-
tween the pairs of GasMet metrics allow identifying frequent
coding patterns that influence gas consumption. PM and GV
are the most important metrics to monitor, as they might both
affect gas consumption estimations significantly.
7. Threats to validity
Threats to construct validity concern the relationship be-
tween theory and observation. The most important threat that
could affect our results is related to possible imprecision/incom-
pleteness in identifying cost smells. In particular, such smells
have been identified by relying on information encompassed in
specialized forums/books focused on the development of So-
lidity smart contracts. Thus, some of the identified smells (and,
consequently, the related metrics in our suite) could be related
to anecdotal observations. To partially mitigate this weakness,
in our RQ1, we studied if domain experts (i.e., smart contract
developers) perceive such smells as relevant. The majority of
survey respondents generally agree with the identified smells.
However, we asked developers to rate the importance of smells
by only providing short descriptions of the problems. To coun-
teract this issue, such descriptions were accompanied by some
explanatory examples. Indeed, no respondents indicated possi-
ble misunderstanding in the questions.
Threats to conclusion validity concern the relationship be-
tween treatment and outcome. Appropriate, non-parametric sta-
tistical procedures have been adopted to draw our conclusions
concerning RQ2. More specifically, we used the Spearman rank
correlation coefficient, to investigate the relationships between
the different metrics in the GasMet suite and the gas cost. To
cope with multiple tests, Holm’s correction procedure has been
adopted to adjust p-values.
Threats to internal validity concern factors that can affect our
results. The smart contract dataset considered in our study com-
prises small to medium size smart contracts (see Table 3), and
this could have reduced the likelihood of specific cost smells
being present in a given smart contract. In particular, such
an issue may have hindered the statistical relevance of some
tests. Indeed, there are three metrics (i.e., UMA, SB, and NM)
for which we only found a small effect size in the correlation
with gas consumption (ρ < 0.3), while our results show that
for two metrics (i.e., DF and EF) the correlation with gas con-
sumption was not statistically significant (p > 0.05). How-
ever, the results of the analysis for estimating the importance
of the GasMet metrics when used to predict gas consumption
(see Figure 5) showed that all the aforementioned metrics (with
the exception of UMA), if randomly permuted, might have
a significant impact on the gas consumption predictions (i.e.,
%IncMS E > 12%). To cope with this problem, in the future,
we plan to replicate our study at a larger scale by also consider-
ing smart contracts of larger size.
Threats to external validity concern the generalization of the
findings. The set of identified cost smells is surely incomplete.
Further research is needed to more-in-depth explore broader
sets of Solidity coding practices that can negatively influence
gas consumption. Indeed, our work jointly attempts to (i) tackle
the problem of cost smells in Solidity source code, and (ii)
conceive approaches to help developers more easily identifying
them during smart contract development. With regards to RQ2,
our study has been carried out on a data collection comprising
2,186 real-world Solidity smart contracts for which Etherscan
provides the source code. The smart contracts in our dataset
may be not representative of all smart contracts deployed on
the blockchain, and some of the findings may depend on the
specific data we used. For partially alleviating this threat, we
collected a dataset that is (i) a statistically significant sample
of the smart contracts for which Etherscan provides the source
code, and (ii) sufficiently large to be representative of the smart
contracts actually deployed on Ethereum. However, while this
study is only observational, in the future we plan to carry out
experiments at a larger scale to verify the generalizability of
the obtained results. The Ethereum platform and Solidity are
constantly evolving at a fast pace [4] and future optimizations
might be applied in opcodes and/or in the compilation process
of Solidity smart contracts. Clearly, the latter could have effects
on the relationships exhibited by some of the metrics in our
suite and the gas consumption. Furthermore, as our research is
not exhaustive, in the future, additional metrics better outlining
the code quality of smart contracts (from the gas consumption
perspective) may be identified.
8. Conclusion
Although Blockchain technology has been established as the
enabling layer for allowing the transactions of electronic cash,
namely cryptocurrency, without the brokerage of a financial in-
stitution, it is now increasingly applied to many other domains.
One of the key aspects to govern when developing a distributed
application (dApp), i.e. an application built on the top of a DLT,
is the cost of execution that, if not properly limited, can easily
lead to relevant diseconomy, especially considering the issues
related to guaranteeing the service levels when scaling up the
distributed application. The back-end logic of a dApp is de-
fined in smart contracts that run on the blockchain. Currently,
to the best of authors’ knowledge, there are no tools that can
be used while coding to help developers properly identifying
the code segments that need optimizations for achieving lower
gas consumption. Considering that the choices are done by the
15

---

developer while writing the smart contracts can affect the de-
ployment and execution costs, we identified 19 patterns of code
that can increase (or reduce) the gas consumption, namely cost
smells. Through a survey involving real smart contract develop-
ers, we demonstrated that the majority of respondents perceive
15 out of 19 smells as relevant. The vast majority of respon-
dents also agree or strongly agree on the usefulness of a suite
of metrics for more easily identifying such cost smells.
On top of the identified smells, we defined a set of metrics,
namely the GasMet suite, in which each metric tries to cap-
ture the occurrences of a cost smell. Through a study involving
2,186 smart contracts, we empirically demonstrate that a sub-
set of GasMet strongly correlates with the gas consumption,
namely GV, PM, IP, and NE, while associations with medium
effect size are observed between a further subset of the defined
metrics, namely ACI, AZ, IFF, RLV, NLF, NU, MA, EC, and BV,
and the deployment cost. Our suite can be acquired as a tool for
allowing developers to optimize smart contracts by easily local-
izing cost smells and improving the related code segments. In
particular, since we found significant links between the metrics
in our suite and deployment costs, the proposed metrics can be
beneficial for especially novice smart contract developers [10].
GasMet metrics will guide inexperienced developers on source
code portions that could be modified or refactored for reduc-
ing deployment cost. Besides, since the GasMet suite statically
collects smart contract-related metrics, it can also be used by
developers and project managers as a tool for evaluating the
code quality of alternative solutions from the gas consumption
perspective.
This paper provides several contributions to the research
community:
• a catalog of cost smells for Solidity programming lan-
guage, whose relevance has been assessed through a sur-
vey involving smart contract developers (see Sections 3
and 4);
• a corresponding measurement suite, namely GasMet for
easily identifying cost smells while coding (see Section 5);
• an empirical evaluation of the GasMet suite, along with
a corpus of smart contracts that can be used for further
experiments, accessible from our replication package; and
• a tool that computes the GasMet metrics by statically in-
specting the Solidity code of smart contracts (see Sec-
tion 5).
While this study aims at (i) evaluating the perceived rele-
vance of the identified cost smells, and (ii) proposing a set of
metrics for better estimating the gas required for the deploy-
ment of the smart contracts, future work will focus on empiri-
cally setting accurate thresholds for these metrics. Since estab-
lishing robust threshold values for source code metrics is not
a trivial task [71], further research is needed to enable the ac-
curate detection of the proposed smells. Actually, some of the
identified code smells could be fixed directly by the Solidity
compiler, which could lift the burden of the modifications off
of the developer. Of course, not all the changes can be auto-
mated, since in some cases, keeping a smell might be benefi-
cial in the economy of the overall system. For this reason, in
the future, we want to investigate which code smells could be
solved as compiler optimization and how to perform such op-
timizations. As future work, we also plan to further refine our
metrics to help developers more easily applying gas consump-
tion optimizations. In addition, future analyses will be aimed at
more closely exploring the relationships existing between the
increasing number of code lines and the specific degradations
that might arise in gas consumption. Furthermore, since the
cost smells defined in this work are strictly dependent on the
Solidity programming language, as future work, we will inves-
tigate if more general design practices, not related to a specific
programming language, could be defined to achieve savings in
gas consumption.
Acknowledgment
We thank all the participants in our survey. We gratefully
thank Michele Fredella for his valuable help during the devel-
opment of the GasMet tool.
References
[1] S. Nakamoto, Bitcoin: A Peer-to-Peer Electronic Cash System, https:
//bitcoin.org/bitcoin.pdf, online; accessed 29 February 2020
(2008).
[2] Blockchain Technology Market Size, Share, Trends Analysis Re-
port By Type, By Component, By Application, By Enterprise Size,
By End Use, By Region And Segment Forecasts, 2019 - 2025 ,
https://www.reportlinker.com/p05807295/Blockchain-
Technology-Market-Size-Share-Trends-Analysis-Report-
By-Type-By-Component-By-Application-By-Enterprise-
Size-By-End-Use-By-Region-And-Segment-Forecasts.html?
utm_source=PRN, online; accessed 29 February 2020 (2019).
[3] T. Chen, X. Li, X. Luo, X. Zhang, Under-optimized smart contracts de-
vour your money, in: 2017 IEEE 24th International Conference on Soft-
ware Analysis, Evolution and Reengineering (SANER), IEEE, 2017, pp.
442–446.
[4] M. Wohrer, U. Zdun, Smart contracts: security patterns in the ethereum
ecosystem and solidity, in: 2018 International Workshop on Blockchain
Oriented Software Engineering, IWBOSE@SANER 2018, Campobasso,
Italy, March 20, 2018, 2018, pp. 2–8.
[5] A. Vacca, A. Di Sorbo, C. A. Visaggio, G. Canfora, A systematic litera-
ture review of blockchain and smart contract development: Techniques,
tools, and open challenges, J. Syst. Softw. 174 (2021) 110891.
[6] G. Destefanis, M. Marchesi, M. Ortu, R. Tonelli, A. Bracciali, R. Hierons,
Smart contracts vulnerabilities: a call for blockchain software engineer-
ing?, in: 2018 International Workshop on Blockchain Oriented Software
Engineering (IWBOSE), IEEE, 2018, pp. 19–25.
[7] J. Chen, X. Xia, D. Lo, J. Grundy, X. Luo, T. Chen, Defining Smart Con-
tract Defects on Ethereum, IEEE Transactions on Software Engineering
(2020).
[8] L. Marchesi, M. Marchesi, G. Destefanis, G. Barabino, D. Tigano, De-
sign Patterns for Gas Optimization in Ethereum, in: 2020 IEEE Inter-
national Workshop on Blockchain Oriented Software Engineering (IW-
BOSE), IEEE, 2020, pp. 9–15.
[9] W. Zou, D. Lo, P. S. Kochhar, X.-B. D. Le, X. Xia, Y. Feng, Z. Chen,
B. Xu, Smart Contract Development: Challenges and Opportunities,
IEEE Transactions on Software Engineering (2019).
[10] N. Ajienka, P. Vangorp, A. Capiluppi, An empirical analysis of source
code metrics and smart contract resource consumption, J. Softw. Evol.
Process. 32 (10) (2020).
16

---

[11] S. Ducasse, H. Rocha, S. Bragagnolo, M. Denker, C. Francomme, Open-
source tool suite for smart contract analysis, Blockchain and Web 3.0:
Social, economic, and technological challenges (2019).
[12] E. Albert, P. Gordillo, A. Rubio, I. Sergey, Running on fumes - prevent-
ing out-of-gas vulnerabilities in ethereum smart contracts using static re-
source analysis, in: Verification and Evaluation of Computer and Com-
munication Systems - 13th International Conference, VECoS 2019, Porto,
Portugal, October 9, 2019, Proceedings, 2019, pp. 63–78.
[13] E. Albert, J. Correas, P. Gordillo, G. Rom´an-D´ıez, A. Rubio, GASOL:
gas analysis and optimization for ethereum smart contracts, in: Tools and
Algorithms for the Construction and Analysis of Systems - 26th Inter-
national Conference, TACAS 2020, Held as Part of the European Joint
Conferences on Theory and Practice of Software, ETAPS 2020, Dublin,
Ireland, April 25-30, 2020, Proceedings, Part II, 2020, pp. 118–125.
[14] N. Grech, M. Kong, A. Jurisevic, L. Brent, B. Scholz, Y. Smaragdakis,
Madmax: surviving out-of-gas conditions in ethereum smart contracts,
Proc. ACM Program. Lang. 2 (OOPSLA) (2018) 116:1–116:27.
[15] M. Ortu, M. Orr´u, G. Destefanis, On comparing software quality met-
rics of traditional vs blockchain-oriented software: An empirical study,
in: 2019 IEEE International Workshop on Blockchain Oriented Software
Engineering (IWBOSE), IEEE, 2019, pp. 32–37.
[16] P. Heged˝us, Towards analyzing the complexity landscape of solidity based
ethereum smart contracts, Technologies 7 (1) (2019) 6.
[17] R. Tonelli, G. Destefanis, M. Marchesi, M. Ortu, Smart contracts software
metrics: a first study, arXiv preprint arXiv:1802.01517 (2018).
[18] A. E. Gencer, S. Basu, I. Eyal, R. Van Renesse, E. G. Sirer, Decentral-
ization in bitcoin and ethereum networks, in: International Conference on
Financial Cryptography and Data Security, Springer, 2018, pp. 439–457.
[19] P. Zhang, M. A. Walker, J. White, D. C. Schmidt, G. Lenz, Metrics for
assessing blockchain-based healthcare decentralized apps, in: 2017 IEEE
19th International Conference on e-Health Networking, Applications and
Services (Healthcom), IEEE, 2017, pp. 1–4.
[20] M. H. Meng, Y. Qian, A blockchain aided metric for predictive delivery
performance in supply chain management, in: 2018 IEEE International
Conference on Service Operations and Logistics, and Informatics (SOLI),
IEEE, 2018, pp. 285–290.
[21] J. Ye, M. Ma, T. Peng, Y. Peng, Y. Xue, Towards automated genera-
tion of bug benchmark for smart contracts, in: 2019 IEEE International
Conference on Software Testing, Verification and Validation Workshops
(ICSTW), IEEE, 2019, pp. 184–187.
[22] M. Demir, M. Alalfi, O. Turetken, A. Ferworn, Security smells in smart
contracts, in: 2019 IEEE 19th International Conference on Software
Quality, Reliability and Security Companion (QRS-C), IEEE, 2019, pp.
442–449.
[23] C. Peng, A. Rajan, Sif: A framework for solidity code instrumentation
and analysis, arXiv preprint arXiv:1905.01659 (2019).
[24] S. Tikhomirov, E. Voskresenskaya, I. Ivanitskiy, R. Takhaviev,
E. Marchenko, Y. Alexandrov, Smartcheck: Static analysis of ethereum
smart contracts, in: Proceedings of the 1st International Workshop on
Emerging Trends in Software Engineering for Blockchain, 2018, pp. 9–
16.
[25] M. Dhawan, Analyzing safety of smart contracts, in: Proceedings of the
Conference: Network and Distributed System Security Symposium, San
Diego, CA, USA, 2017, pp. 16–17.
[26] K. Baird, S. Jeong, Y. Kim, B. Burgstaller, B. Scholz, The economics of
smart contracts, arXiv preprint arXiv:1910.11143 (2019).
[27] J. Correas, P. Gordillo, G. Rom´an-D´ıez, Static profiling and optimiza-
tion of ethereum smart contracts using resource analysis, IEEE Access 9
(2021) 25495–25507.
[28] T. Brandst¨atter, S. Schulte, J. Cito, M. Borkowski, Characterizing effi-
ciency optimizations in solidity smart contracts, in: 2020 IEEE Interna-
tional Conference on Blockchain (Blockchain), IEEE, 2020, pp. 281–290.
[29] J. L. Bentley, Writing efficient programs, Prentice-Hall, Inc., 1982.
[30] T. Chen, Y. Feng, Z. Li, H. Zhou, X. Luo, X. Li, X. Xiao, J. Chen,
X. Zhang, Gaschecker: Scalable analysis for discovering gas-inefficient
smart contracts, IEEE Transactions on Emerging Topics in Computing
(2020).
[31] Y.-C. Chen, [Solidity] Optimize Smart Contract Gas Usage,
https://medium.com/joyso/solidity-save-gas-in-smart-
contract-3d9f20626ea4, online; accessed 21 February 2020 (2018).
[32] M. Gupta, Solidity tips and tricks to save gas and reduce byte-
code size, https://blog.polymath.network/solidity-tips-
and-tricks-to-save-gas-and-reduce-bytecode-size-
c44580b218e6, online; accessed 21 February 2020 (2019).
[33] D. Szego, Solidity gas optimization - memory arrays, http:
//danielszego.blogspot.com/2018/01/solidity-gas-
optimization-memory-arrays.html, online; accessed 21 February
2020 (2018).
[34] V. A. Bhushan, Optimizing smart contracts for cost, https://labs.
imaginea.com/optimizing-smart-contracts-for-cost/,
online; accessed 21 February 2020 (2018).
[35] K. Jelski, Three tips for optimizing gas, http://blockbites.io/
bites/bite2.html, online; accessed 21 February 2020 (2019).
[36] CipherZ, Optimizing your Solidity contract’s gas usage, https:
//medium.com/coinmonks/optimizing-your-solidity-
contracts-gas-usage-9d65334db6c7, online; accessed 21 February
2020 (2018).
[37] B. ˇSkvorc, Audits beyond code: optimizing gas, https://audithor.
io/audits-beyond-code-optimizing-gas/, online; accessed 21
February 2020 (2018).
[38] B. Badr, R. Horrocks, X. B. Wu, Blockchain By Example: A developer’s
guide to creating decentralized applications using Bitcoin, Ethereum, and
Hyperledger, Packt Publishing Ltd, 2018.
[39] N. Blitz, Storing Structs is costing you gas, https://medium.
com/@novablitz/storing-structs-is-costing-you-gas-
774da988895e, online; accessed 21 February 2020 (2018).
[40] M. Gupta, Solidity gas optimization tips, https://mudit.blog/
solidity-gas-optimization-tips/, online; accessed 21 February
2020 (2018).
[41] Y.-C. Chen, [Solidity] How does function name affect gas consumption
in smart contract, https://medium.com/joyso/solidity-how-
does-function-name-affect-gas-consumption-in-smart-
contract-47d270d8ac92, online; accessed 21 February 2020 (2018).
[42] A. Borrelli, V. Nardone, G. A. Di Lucca, G. Canfora, M. Di Penta, De-
tecting video game-specific bad smells in unity projects, in: MSR ’20:
17th International Conference on Mining Software Repositories, Seoul,
Republic of Korea, 29-30 June, 2020, 2020, pp. 198–208.
[43] M. Tufano, F. Palomba, G. Bavota, M. Di Penta, R. Oliveto, A. De Lucia,
D. Poshyvanyk, An empirical investigation into the nature of test smells,
in: Proceedings of the 31st IEEE/ACM International Conference on Au-
tomated Software Engineering, ASE 2016, Singapore, September 3-7,
2016, 2016, pp. 4–15.
[44] M. F. Aniche, G. Bavota, C. Treude, M. A. Gerosa, A. van Deursen, Code
smells for model-view-controller architectures, Empir. Softw. Eng. 23 (4)
(2018) 2121–2157.
[45] M. M¨antyl¨a, J. Vanhanen, C. Lassenius, Bad smells - humans as code crit-
ics, in: 20th International Conference on Software Maintenance (ICSM
2004), 11-17 September 2004, Chicago, IL, USA, 2004, pp. 399–408.
[46] F. Palomba, G. Bavota, M. Di Penta, R. Oliveto, A. De Lucia, Do they
really smell bad? A study on developers’ perception of bad code smells,
in: 30th IEEE International Conference on Software Maintenance and
Evolution, Victoria, BC, Canada, September 29 - October 3, 2014, 2014,
pp. 101–110.
[47] S. L. Pfleeger, B. A. Kitchenham, Principles of survey research: part
1: turning lemons into lemonade, ACM SIGSOFT Software Engineering
Notes 26 (6) (2001) 16–18.
[48] B. A. Kitchenham, S. L. Pfleeger, Principles of survey research: part 5:
populations and samples, ACM SIGSOFT Software Engineering Notes
27 (5) (2002) 17–20.
[49] B. A. Kitchenham, S. L. Pfleeger, Principles of survey research part 4:
questionnaire evaluation, ACM SIGSOFT Software Engineering Notes
27 (3) (2002) 20–23.
[50] B. A. Kitchenham, S. L. Pfleeger, Principles of survey research: part 3:
constructing a survey instrument, ACM SIGSOFT Software Engineering
Notes 27 (2) (2002) 20–24.
[51] B. A. Kitchenham, S. L. Pfleeger, Principles of survey research part 2:
designing a survey, ACM SIGSOFT Software Engineering Notes 27 (1)
(2002) 18–20.
[52] B. A. Kitchenham, S. L. Pfleeger, Principles of survey research part 6:
data analysis, ACM SIGSOFT Software Engineering Notes 28 (2) (2003)
24–27.
[53] A. N. Oppenheim, Questionnaire design, interviewing and attitude mea-
surement, Bloomsbury Publishing, 2000.
17

---

[54] P. Grover, A. K. Kar, M. Janssen, Diffusion of blockchain technology,
Journal of Enterprise Information Management (2019).
[55] G. Canfora, A. Di Sorbo, M. Fredella, A. Vacca, C. A. Visaggio, is-
cream: a suite for smart contract readability assessment, in: 37th Inter-
national Conference on Software Maintenance and Evolution, ICSME,
IEEE, 2021, p. To appear.
[56] X. Chen, P. Liao, Y. Zhang, Y. Huang, Z. Zheng, Understanding code
reuse in smart contracts, in: 28th IEEE International Conference on Soft-
ware Analysis, Evolution and Reengineering, SANER 2021, Honolulu,
HI, USA, March 9-12, 2021, 2021, pp. 470–479.
[57] G. A. Pierro, R. Tonelli, M. Marchesi, An organized repository of
ethereum smart contracts’ source codes and metrics, Future Internet
12 (11) (2020) 197.
[58] Y. Zhou, D. Kumar, S. Bakshi, J. Mason, A. Miller, M. Bailey, Erays: Re-
verse engineering ethereum’s opaque smart contracts, in: 27th USENIX
Security Symposium, USENIX Security 2018, Baltimore, MD, USA, Au-
gust 15-17, 2018, 2018, pp. 1371–1385.
[59] G. A. Oliva, A. E. Hassan, Z. M. J. Jiang, An exploratory study of smart
contracts in the ethereum blockchain platform, Empir. Softw. Eng. 25 (3)
(2020) 1864–1904.
[60] N. J. Salkind, Encyclopedia of research design, Vol. 1, sage, 2010.
[61] T. B. Group, truffle, https://www.trufflesuite.com/, online; ac-
cessed 1 November 2019 (2019).
[62] T. B. Group, ganache, https://www.trufflesuite.com/ganache,
online; accessed 1 November 2019 (2019).
[63] W. W. Daniel, Spearman rank correlation coefficient, Applied nonpara-
metric statistics, 2nd ed. PWS-Kent, Boston (1990) 358–365.
[64] S. Holm, A simple sequentially rejective multiple test procedure, Scandi-
navian journal of statistics (1979) 65–70.
[65] J. Cohen, Statistical power analysis for the behavioral sciences second
edition, Lawrence Erlbaum Associates, Publishers (1988).
[66] A. Liaw, M. Wiener, Classification and regression by randomforest, R
News 2 (3) (2002) 18–22.
URL https://CRAN.R-project.org/doc/Rnews/
[67] T. Dey, A. Mockus, Deriving a usage-independent software quality met-
ric, Empir. Softw. Eng. 25 (2) (2020) 1596–1641.
[68] C. Sammut, G. I. Webb, Encyclopedia of machine learning, Springer Sci-
ence & Business Media, 2011.
[69] C. Strobl, A. Boulesteix, T. Kneib, T. Augustin, A. Zeileis, Conditional
variable importance for random forests, BMC Bioinform. 9 (2008).
[70] C. Sabatti, C. Lalanne, Applied statistical genetics with r for population-
based association studies, Journal of Statistical Software 31 (1) (2009)
1–5.
[71] F. A. Fontana, E. Mariani, A. Morniroli, R. Sormani, A. Tonello, An ex-
perience report on using code smells detection tools, in: Fourth IEEE In-
ternational Conference on Software Testing, Verification and Validation,
ICST 2012, Berlin, Germany, 21-25 March, 2011, Workshop Proceed-
ings, 2011, pp. 450–457.
18