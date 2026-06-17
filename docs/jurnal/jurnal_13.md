### A Comparative Gas Cost Analysis of Proxy and
### Diamond Patterns in EVM Blockchains for
### Trusted Smart Contract Engineering
Anto Benedetti
1,2[0009−0009−5526−1287]
,
Tiphaine Henry
1[0000−0002−7981−8934]
, and
Sara Tucci-Piergiovanni
1[0000−0001−9738−9021]
1 
Universit´e Paris-Saclay, CEA, List, F-91120, Palaiseau, France
2 ´
Ecole Sup´erieure de G´enie Informatique, Paris, France
Abstract. Blockchain applications are witnessing rapid evolution, ne-
cessitating the integration of upgradeable smart contracts. Software pat-
terns have been proposed to summarize upgradeable smart contract best
practices. However, research is missing on the comparison of these up-
gradeable smart contract patterns, especially regarding gas costs related
to deployment and execution. This study aims to provide an in-depth
analysis of gas costs associated with two prevalent upgradeable smart
contract patterns: the proxy and diamond patterns. The proxy pattern
utilizes a proxy pointing to a logic contract, while the diamond pat-
tern enables a proxy to point to multiple logic contracts. A comparative
analysis of gas costs for both patterns is conducted and compared to a
traditional non-upgradeable smart contract. From this analysis, a theo-
retical contribution is derived in the form of two consolidated blockchain
patterns and a corresponding decision model.
Keywords: Blockchain · Software Patterns · Upgradeable Smart Con-
tracts · Proxy Pattern · Diamond Pattern
1 Introduction
Smart contracts are pivotal for orchestrating digital transactions in a reliable
and secure manner in blockchain platforms [19]. Smart contracts are particularly
important on Ethereum and similar blockchain platforms, where they are used
in diverse areas including digital finance or industrial traceability.
As blockchain applications evolve, the need for smart contracts to be not
only secure but also upgradeable becomes apparent [8]. In this context, a set of
upgradeable smart contract patterns, including the proxy and diamond patterns,
have surfaced to answer the lack of classical smart contracts’ adaptability whose
logic cannot be changed once deployed [22, 27]. The proxy pattern uses a proxy
contract to delegate calls to an implementation contract, providing a flexible and
upgradeable solution. The diamond pattern, introduced in EIP-2535, addresses
concerns like contract size limitations and facilitates enhanced maintainability
and versioning through multiple implementation contracts.
## arXiv:2312.08945v2 [cs.SE] 15 May 2024

---

2 A. Benedetti, T.Henry, and S.Tucci-Piergiovanni
Research has focused on identifying upgradeable smart contracts pattern
families, pointing towards proxy and diamond-based strategies [14, 21, 22, 27].
However, the papers do not provide an in-depth analysis of the functional and
non-functional properties of these patterns, nor gas costs behaviors. Hence, a
research gap is identified regarding a thorough study of the proxy and diamond
patterns, especially in terms of a gas costs analysis.
To address this issue, this paper aims to answer the following research ques-
tions: (RQ1) How do the classic, proxy, and diamond patterns differ in terms of
gas consumption, scalability, and ease of use? And (RQ2) What implications do
these differences have for the development of blockchain applications, considering
the traditional classic pattern as a baseline?
In this paper, we contribute to the literature through a unified approach to
compare gas costs in upgradeable smart contracts. We leverage this methodology
to provide a comparative gas cost analysis of the proxy and diamond patterns in
EVM blockchains, compared against a monolithic non-upgradeable smart con-
tract, which is used as a baseline. Based on these results, we derive a theoretical
contribution in the form of two smart contract patterns adhering to the Alexan-
drian form format following the standard proposed by Christopher Alexander [1].
These patterns include the results of our comparative analysis and contribute to
the broader understanding of upgradeable smart contract patterns and their use
in blockchain applications. Based on these patterns, a decision model for using
these patterns is proposed, emphasizing functional and non-functional properties
for each design decision.
The remainder of this paper is structured as follows. Section 2 introduces
key concepts related to smart contracts and blockchain patterns, and section 3
presents studies already made on linked concepts. Section 4 presents the method
used to carry a comparative analysis on proxy versus diamond gas costs. Sec-
tion 5 presents the results of the tests made on the different patterns. Section 6
leverages these findings to propose two consolidated proxy and diamond patterns
as well as a decision model for using these patterns. Section 7 finally concludes
the paper with a summary and a discussion of the results and some considera-
tions for future work.
2 Background
2.1 Smart Contracts
A smart contract is a program hosted on a blockchain network [30]. When a smart
contract executes, its updated state (or storage) is registered into a transaction.
Then, that transaction is stored in the blockchain ledger making it immutable
and tamper-proof [4]. More precisely, the final validated results are stored in
a Merkle Patricia trie whose nodes correspond to an account or a smart con-
tract. A smart contract comprises both variables and functions. Smart contract
functions can execute arbitrary code, access the state of the variables and op-
tionally update them. The default function’s mutability gives the right to read

---

Gas Cost Analysis of Proxy and Diamond Patterns 3
and modify state variables. However, function mutability can be constrained to
add more security when it comes to accessing these variables. On the one hand,
a pure function cannot read nor modify the state of the contract; it is only
used to compute a value, often using the parameters passed to it. On the other
hand, a view function can read the state of the contract, but cannot modify
it. Smart contracts are immutable, meaning that once deployed, they cannot be
modified [7, 31]. This is a security feature, as it prevents malicious actors from
modifying the code, so that the contract can be trustable and unbreakable. How-
ever, this also means that if a bug is found in the code, it cannot be fixed, and
the only solution is to deploy a new contract. Also, if a new feature is added to
the contract, the only way to do it is to deploy a new contract. This is a problem
for users, as they have to migrate to the new contract, and for developers, as
they have to maintain multiple contracts. To address this issue, several patterns
have emerged, which are discussed later in the paper [8, 22].
2.2 Gas and Storage in the Ethereum Virtual Machine (EVM)
The EVM is a Turing-complete virtual machine that runs on every node of
the Ethereum network and other EVM-based blockchains. It provides a secure
and isolated environment for smart contract execution [16]. Gas is the unit of
computation in the EVM, and every operation performed by the EVM has a gas
cost associated with it [15]. The user pays this cost in the form of gas fees, to
the miner/validator who executes the smart contract. It is the miner’s incentive
to execute the smart contract and record the results on the blockchain, but also
a way to prevent spam and denial of service attacks. Storage in the EVM is
linked to the concept of gas, as every operation involving storage – whether it
is writing new data or modifying existing data – incurs a gas cost. This cost
is proportional to the storage resources consumed, reflecting the principle that
the more network resources (like memory and storage space) a transaction uses,
the more it needs to compensate the network. Every smart contract has its own
storage space, which is isolated and theoretically unlimited.
Smart contracts’ storage utilizes a key-value store, with these key-value pairs
referred to as storage slots. A key for a storage slot is determined by the index of
the slot, which is numbered contiguously from 0 to 2
256 
− 1. A value is a 32-byte
(or 256-bit) word, also called an item. Data smaller than 32 bytes can be packed
into a single slot, but if it is larger, the transaction is reverted [12]. Some types of
data are stored in multiple slots, such as arrays and mappings which are stored
in multiple contiguous slots [13]. Strings are also stored in multiple slots, where
one slot stores the length of the string, and the other slots store each 32-byte
chunk of the string [11]. A struct, which is a collection of variables, is stored
in a single slot if it fits, otherwise, it is stored in multiple contiguous slots. The
gas cost of writing to storage increases with the number of slots written to. This
means that writing multiple variables, if they fit within a single slot, incurs the
same gas cost as writing a single variable.

---

4 A. Benedetti, T.Henry, and S.Tucci-Piergiovanni
3 Related Work
(a) Proxy pattern diagram.
(b) Diamond pattern diagram.
Fig. 1: Illustration of the Proxy and Diamond patterns
Software engineering patterns provide well-tested solutions for frequently en-
countered application development use cases [2]. Standardized formatting such
as the Alexandrian Form Format systematically include for each pattern the
description, the forces or tradeoffs at stake, the benefits and drawbacks, and
their main applications. A family of patterns focusing on blockchain patterns
has recently emerged in the literature [28, 33]. The later include smart-contract
related best practices such as upgradability patterns which refer to decentralized
application maintenance strategies that can be applied for adding or updating
features [8]. Two recurring upgradability patterns are identified in the literature,
namely the proxy and diamond patterns [14, 21, 22, 27].
The proxy pattern, pictured in Figure 1a enables smart contract updates
without changing the contract’s address or requiring data migration [25]. It con-
sists of two contracts, the user-interacted proxy and the logic-holding imple-
mentation. The proxy forwards calls to the implementation via delegated calls.
Shared storage ensures that if the implementation is updated, the storage per-
sists. To update the implementation, a new contract is deployed, and the proxy
is directed to it, eliminating the need for user migration and preventing data
loss. Compound, a key DeFi protocol, exemplifies this pattern through multiple
upgrades, including Compound III 
3
.
The diamond pattern, depicted in Figure 1b is a more upgradeable version
of the proxy pattern. This pattern solves the maximum contract size problem,
3 
https://compound.finance/

---

Gas Cost Analysis of Proxy and Diamond Patterns 5
which is a limitation of the proxy pattern. Indeed, logic can be separated into
small contracts referred to as facets. A main contract, referred to as the im-
plementation or diamond contract, points at the different facets to retrieve the
applicable logic. The diamond contract can be upgraded by adding, replacing
or removing facets. The diamond pattern is used in a diverse array of projects,
as documented in Nick Mudge’s Awesome Diamonds repository [24]. For exam-
ple, Aavegotchi, a Non-Fungible Token (NFT) based gaming protocol, employs
a single diamond pattern with eight distinct facets 
4
.
A set of studies provide insight on upgradeable smart contract patterns.
Kannengiesser et al. conduct a study on key smart contract development chal-
lenges across various distributed ledger technology (DLT) protocols, including
Ethereum, Hyperledger, and EOSIO [19]. They highlight upgradability as a sig-
nificant challenge and reference two upgradeable smart contract patterns, namely
the diamond (referred to as the fa¸cade pattern) pattern and the proxy pattern.
However, the paper lacks an in-depth analysis of these patterns. Two papers
identify the proxy pattern but do not detail the forces, advantages, drawbacks,
or gas costs considerations of this pattern [14, 21]. There is no mention of the
diamond pattern. Two other works present a set of upgradeable smart contract
patterns, including the proxy and diamond patterns [22, 27]. However, the pa-
pers do not provide an in-depth analysis of the functional and non-functional
properties of these patterns, nor gas costs behaviors. Additionally, it is to note
that two studies focus on gas cost efficiency strategies in smart contracts de-
velopment. Zarir et al.’s work focuses on transaction parameters rather than
architectural design [34]. The study by Di et al. identifies smart contract cod-
ing metrics impacting gas costs [10]. However, it does not specifically focus on
upgradeable smart contracts. These contracts possess unique functionalities like
proxy pointers and proxy contract management. In summary, a research gap is
identified regarding a thorough study of the proxy and diamond patterns. There
is a lack of studies about gas costs analysis and formalization of the proxy and
diamond patterns, especially using the Alexandrian form format.
4 Methodology
The methodology section of this paper details the approach employed for com-
paring the proxy and diamond patterns. This involves the definition of a baseline
scenario and the development of a gas consumption evaluation test bench.
4.1 Protocol
Smart contract deployments are one of the most expensive operations in terms of
gas costs. Therefore, assessing the deployment costs associated with various pat-
terns is essential. Additionally, upgrades often necessitate deploying additional
smart contracts, making it crucial to compare the deployment costs of each sub-
sequent upgrade. The protocol leverages a file notarization scenario, a standard
4 
https://www.aavegotchi.com/

---

6 A. Benedetti, T.Henry, and S.Tucci-Piergiovanni
Fig. 2: Evolution of the notarization application across versions by patterns.
use of smart contracts to ensure the integrity of critical data such as diplomas or
scientific workflows [5, 9, 20]. The scenario is implemented using the proxy and
diamond patterns, as well as a reference monolithic non-upgradeable smart con-
tract referred to as the classic pattern. For each pattern, the initial deployment
of the notarization smart contract is referred to as version 1. The study then
proceeds to two sequential upgrades of the application, a minor one (version 2)
and a major one (version 3), to evaluate the gas costs. Features are added as
updates are made. Figure 2 demonstrates the upgrades for each pattern. Then
the analysis turns to comparing the average gas cost of each function, for seeing
which pattern is the less gas intensive when it comes to execution. Each func-
tion is accompanied by a test case ran hundreds of times, to simulate real-world
usage of this file notarization application over an extended period and to check
the robustness of the code.
4.2 Implementation
The code is written in Solidity, the main language used to develop decentralized
application on EVM blockchains. For the experiment, the Universal Upgradeable
Proxy Standard (UUPS) proxy pattern is used because it is the recommended
standard at the time of writing by OpenZeppelin [6]. For this study, the diamond
pattern implemented by SolidState is used. It utilizes Nick Mudge’s gas-efficient
Diamond 2 model [23, 29] in a plug-and-play fashion: the developer only needs
to import the diamond made by SolidState without any configuration needed.
Version 1: Basic Notarization Application. In the first version of the
notarization use case, files are represented by a mapping between their name
and their hash. The logic encompasses several functions. The function addFile
is designed to notarize a file on the blockchain and modifies the state of the
contract. The getFileName function is a view function that returns the name
of the file. Similarly, getFileHash is a view function that provides the hash of

---

Gas Cost Analysis of Proxy and Diamond Patterns 7
the file. Lastly, compareHash is a pure function for comparing two hashes passed
as parameters; while this operation is ideally performed off-chain, it is included
here to demonstrate the gas cost of a pure function.
Version 2: Updatable File. In case of file modifications, a function for
updating it on the blockchain is needed. The second version of this notarization
application contains the updateFile function, added on top of the previous
version. This function updates the file hash of a notarized file and so modifies
the state of the contract. This version can be seen as a minor update.
Version 3: Access Control. For security reasons, access control is manda-
tory, so that only the owner of a file can modify or delete it. This involves creating
a File structure containing the owner’s address, the hash of the file’s contents,
the creation timestamp and the last modification timestamp. The previous map-
ping is replaced by one between the file’s name and its File structure instance.
Then, the addFile and updateFile functions are modified to work with this
new File structure, and access control is added, where the new logic smart con-
tract ensures that the caller interacts only with his own files. This version can
be seen as a major update.
4.3 Unit Tests
As mentioned in section 4.1, each function has a unit test that is run hundreds of
times (704 iterations for the addFile function across all unit tests of version 3, for
example). It calls the function with random parameters (file name, hash, etc.)
and checks that the result is correct. This is done to simulate real-world usage
of this file notarization application. An expected result is computed before the
function call, and the actual result is compared to it. In the addFile unit test,
we expect the smart contract to add the file name and hash to its storage, using
either the proxy or diamond pattern. The updateFile unit test should update
the file hash in the contract’s storage, while the deleteFile test ensures the
file’s removal. In the compareHash test, the outcome should be true for match-
ing hashes and false otherwise. The getFileName, getFileHash, getFileOwner,
getFileCreatedAt, and getFileLastModifiedAt unit tests respectively verify
the return of the file’s name, hash, owner address, creation timestamp, and last
modification timestamp. Finally, the getFileDetails test checks for the return
of all the previously mentioned file properties.
Testing each single function is important to ensure that the code is robust and
that it does not break when upgrading the smart contract. These tests are also
conducted to compare the gas costs across various patterns, specifically examin-
ing each type of function, including pure, view, and state-modifying functions.
By testing pure functions, the gas costs of computations without storage access
can be assessed and compared across patterns. View functions are tested to eval-
uate the gas costs of computations with storage access. Finally, state-modifying
functions are tested to assess the gas costs of storage writes.
Smart contracts used for this study are developed using Foundry [17]. Foundry
plays a critical role in this testing process by autonomously simulating an Ethereum

---

8 A. Benedetti, T.Henry, and S.Tucci-Piergiovanni
Virtual Machine (EVM) blockchain environment. During test execution, it de-
ploys the contracts and carries out the testing scenarios within this emulated
setting, utilizing the default configuration of this local blockchain. The entire
source code, tests and results here are available in the accompanying source
code repository 
5
.
4.4 Results Retrieval
Through these unit tests, Foundry produces gas reports that provide insights into
the gas consumption for each function, alongside the gas costs associated with
deployment and the size of the contracts. The cost of function calls is quantified
in gas units, and the contract size is measured in bytes.
These gas cost results for each function are derived by summing the gas costs
associated with every operation performed within the function. Each operation,
also known as opcode, has a fixed gas cost, which is the same for all patterns.
Those instructions are described in the Ethereum Yellow Paper [31]. For exam-
ple, the SLOAD opcode, which reads a value from storage, has a fixed cost of 100
for warm access, and 2100 gas for cold access. Then, the deployment cost is the
sum of several components. First, the TRANSACTION opcode incurs 21,000 gas
units, representing the base cost of every transaction on the EVM. Additionally,
there is the CREATE opcode, costing 32,000 gas units, which is used for creat-
ing a new contract. Next, the cost related to the bytecode includes 4 times the
number of 0 bytes and 16 times the number of non-zero bytes. Furthermore, 200
gas units are added for every byte of the contract’s size. Finally, if a constructor
function is present, its cost is also included in the deployment cost.
In addition, the framework furnishes complete stack traces of the calls, detail-
ing the gas consumption for each operation. These traces are utilized to construct
charts that capture the gas cost of each function call. This level of detail supple-
ments gas reports, which typically provide only a summary of costs, including
the minimum, average, median, and maximum values.
5 Evaluation
This section presents the gas costs evaluation of the proxy and diamond smart
contract patterns, against a baseline built using the classic pattern in the context
of an app deployment and upgrade 
6
.
5.1 Gas Cost During Smart Contract Deployment and Upgrades
The primary aim is to compare the gas costs during the deployment (version 1)
and upgrades (version 2 and 3) of the file notarization application implemented
5 
https://anonymous.4open.science/r/proxy-diamond-patterns-gas-analysis
6 
All results can be found here: https://anonymous.4open.science/r/
proxy-diamond-patterns-gas-analysis/data

---

Gas Cost Analysis of Proxy and Diamond Patterns 9
(a) Deployment cost by pattern and ver-
sion.
(b) Average function cost by pattern for
version 2.
Fig. 3: Evaluation results
with the three different patterns. For the classic and proxy pattern, a new con-
tract is deployed for each version. For the proxy, the proxy pointer is updated in
the smart contract implementation. For the diamond pattern, in version 2, only
facet is changed, and in version 3, all facets are changed.
Figure 3a presents the deployment costs, in gas units, of each version by
pattern. The cost of deployment increases with each version, except for the
diamond pattern, where the initial cost of deployment is significant. In all, the
classic pattern requires just 1,614,545 units of gas, while the proxy and diamond
patterns consume around 2.6 times as much, at 4,343,104 and 4,123,977 units of
gas respectively. The classic pattern appears the most gas efficient. The increased
consumption at deployment of the proxy and diamond patterns relates to the
need to deploy more contracts compared to the classic pattern: two for the proxy
pattern, and four for the diamond one.
5.2 Gas Cost During Smart Contract Execution
The analysis now shifts to comparing the average gas cost of functions to de-
termine the most gas efficient execution pattern. Gas cost behaviors in versions
1 and 3 align with online gas reports. Notably, addFile and updateFile func-
tions are the costliest, while remaining functions incur comparatively lower gas
costs. Across the three patterns, the proxy and diamond patterns exhibit slightly
higher expenses than the classic pattern. Notable cost discrepancies include
compareHashes being significantly cheaper than addFile in the classic pattern.
This difference is attributed to addFile requiring two storage writes while other
functions mainly perform storage reads. The classic pattern avoids delegation to
other contracts, unlike the proxy and diamond patterns, resulting in additional
costs. Furthermore, incurring more operations when invoking a diamond adds
to its expense compared to a proxy. Getters in the classic pattern involve state
lookups, costing 2100 gas for cold storage loads, while compareHashes is a pure
function, devoid of state lookups or modifications, resulting in lower gas costs.
In reviewing the data obtained from the comparative analyses, the deploy-
ment phase exhibits the most significant variation among the different patterns,

---

10 A. Benedetti, T.Henry, and S.Tucci-Piergiovanni
primarily due to the fluctuating number of smart contracts deployed. For this
metric, the diamond pattern is the cheapest, especially for minor upgrades. Dur-
ing execution, the gas costs are similar across patterns, though there is a marginal
escalation in costs when transitioning from the classic architecture to the proxy
pattern, and subsequently from the proxy to the diamond pattern. This increase
in gas costs is due to the additional operations required to delegate calls to the
logic contract(s) in the proxy and diamond patterns.
6 Discussion
This section summarizes and consolidates the proxy and diamond patterns fol-
lowing the Alexandrian form format proposed by C. Alexander [2]. A decision
model is proposed to help developers choose between both patterns.
6.1 Proxy Pattern Outline
– Summary: The proxy pattern facilitates upgradability in smart contracts
through a proxy contract pointing to the latest version of a logic contract.
– Context: A smart contract must be upgraded due to evolving requirements
and potential improvements [7].
– Problem: Traditional smart contracts lack the ability to be updated without
manual storage migration, posing challenges in addressing vulnerabilities,
enhancing functionality, and adapting to changing circumstances.
– Forces (tradeoffs): The problem requires balancing the following forces: (i)
Immutability vs. Upgradability. Smart contracts on blockchain platforms are
traditionally immutable once deployed; (ii) Gas Costs vs. Flexibility. Mini-
mizing gas costs while providing flexibility for contract upgrades; (iii) Trust
vs. Transparency. Establishing trust in the upgrade process while maintain-
ing transparency.
– Solution: The smart contract proxy pattern introduces a proxy contract as
an intermediary layer. This proxy delegates calls to a logic contract, allowing
seamless upgrades by deploying new logic contracts and updating the proxy
to point to the latest version, hence allowing for dynamic updates.
– Consequences:
• Benefits:
∗ Upgradability. Allows upgrades without the need to change the con-
tract address nor requiring data migration;
∗ Simplest Upgradeable Pattern. The upgrade process consists in de-
ploying a new logic contract and a proxy update pointing to it with
a proxy administration function.
• Drawbacks:
∗ Compatibility Maintenance. Requires consistent function selectors
and storage layouts;
∗ Limited Direct Function Visibility. Logic functions visibility only ac-
cessible in the documentation;

---

Gas Cost Analysis of Proxy and Diamond Patterns 11
∗ Storage Collision. It requires careful consideration of storage layout
to avoid storage overlap between the proxy and the logic contract as
if both contracts use the same storage slot, it can lead to data loss.
A convention is to use namespaced storage layouts for naming struct
holding storage variables [18].
∗ Function Selector Clash. Different functions having the same selector
can override each other [26]. This requires careful naming of func-
tion selectors as the Solidity compiler cannot detect function selector
clashes between the proxy and logic contracts due to cross-contract
interactions.
– Related patterns: Diamond pattern.
– Known uses: Two standardized implementations are proposed in the Ethereum
Improvement Proposal EIP-897 and in OpenZeppelin’s smart contract de-
velopment framework [3, 22]. Compound and USDC, respectively a DeFi
protocol and a stable coin, both implement the proxy pattern for upgrades.
6.2 Diamond Pattern Outline
– Summary: employing multiple implementation contracts to balance con-
tract size, maintainability and versioning;
– Context: Need for a solution to improve maintainability in large contracts.
– Problem: Traditional approaches face challenges in managing contract size
and versioning effectively.
– Forces (tradeoffs): The problem requires balancing the following forces: (i)
Contract Size vs. Modularity Balancing the need for compact contract sizes
with the demand for modular, well-organized code structures; (ii) Maintain-
ability vs. Simplicity Achieving improved maintainability without introduc-
ing unnecessary complexity; (iii) Scalability vs. Consistency Scaling smart
contract applications requires accommodating versioning and updates.
– Solution: The diamond pattern introduces a structure where a proxy can
point to multiple logic contracts. It involves the deployment of all contracts
(diamond and facets), retrieving facets function selectors, and leveraging
both to implement a diamond cut.
– Consequences:
• Benefits:
∗ Better upgradability. Possibility to deploy smaller contracts during
upgrades or updates to already deployed facets without requiring
address change or data migration;
∗ Modularity. Code reusable across multiple contracts. A facet can be
used in multiple diamonds;
∗ Contract size. Thanks to a modular structure, it can theoretically
support an infinite number of facets. Therefore, the whole smart
contract system has no size limit;
∗ Cheaper minor upgrades. Most of the time, only one facet is updated,
so only small contracts are deployed for low gas costs;

---

12 A. Benedetti, T.Henry, and S.Tucci-Piergiovanni
∗ Shorter compilation time. Only modified facets need to be compiled,
so for the same logic code, the compilation time is shorter than for
the classic pattern and proxy pattern.
• Drawbacks:
∗ Implementation Complexity. A more complex structure compared to
the classic and proxy patterns, and a lack of supporting libraries.
∗ Complexity in managing multiple logic contracts. Managing multiple
logic contracts require careful consideration during upgrades. It re-
quires developers to manage the diamond storage manually because
of the multiple implementation contracts.
∗ Limited Direct Function Visibility. Like the proxy pattern, users de-
pend on documentation to identify callable functions.
∗ Storage collision risks similarly to Proxy pattern
∗ Function selector clash similarly to Proxy pattern
– Related patterns: Proxy pattern.
– Known uses: Aavegotchi, a NFT-based gaming protocol; GeoWeb, a dApp
managing digital land property rights using NFTs.
6.3 Choosing between the Proxy and Diamond Patterns
Fig. 4: Decision model for upgradeable smart contract pattern usage.
Figure 4 proposes a decision model to orient between a proxy or a diamond
pattern in the design stage of an upgradeable smart contract. It follows the design
goal decision model introduced by Xu where decisions are modeled using a logical
BPMN flow [32]. More precisely, arrows, logical gateways, and functional and
non-functional properties orient the decision path.

---

Gas Cost Analysis of Proxy and Diamond Patterns 13
The choice of smart contract pattern largely depends on the need for upgrad-
ability. For scenarios without upgradability needs, the classic pattern is prefer-
able due to its straightforward development process, relying on contract inheri-
tance and library imports. However, upgrades in the classic pattern often involve
complex and resource-intensive data migration. This pattern also poses chal-
lenges in communicating new contract addresses to users, potentially affecting
the user experience. For extensive upgradeable features, the diamond pattern is
recommended. Its modular nature allows for easy addition or removal of facets,
reducing compilation time. However, it is less cost-effective initially compared to
the proxy pattern and requires in-depth knowledge of smart contract storage and
facet-library management. The proxy pattern is advised for limited code sizes
or infrequent upgrades. It simplifies development and integrates easily with li-
braries like OpenZeppelin’s. This pattern enhances upgradability by separating
logic and state, reducing the need for data migration. But it offers less flexi-
bility and modularity compared to the diamond pattern and demands careful
consideration to maintain compatibility across versions.
In the end, while the classic pattern excels in execution ease, the proxy and
diamond patterns provide a more manageable framework for upgrades, simpli-
fying contract interactions for users during updates. The diamond pattern is
more suitable for extensive upgrades, while the proxy pattern is recommended
for limited upgrades and simpler development.
7 Conclusion
In conclusion, this comprehensive study delves into the intricacies of upgrade-
able smart contract design patterns—a critical facet of contemporary blockchain
applications. The comparative analysis specifically focuses on the gas costs as-
sociated with deploying, using, and upgrading decentralized applications using
two prominent upgradeable patterns: the proxy and diamond patterns.
Each pattern unfolds with distinct strengths and weaknesses, delineating its
applicability across diverse scenarios. The classic pattern implies an unpractical
and costly approach to smart contract upgrades because of the need of manual
data migration. The proxy pattern offers the simplest solution for upgradability,
but security concerns such as storage collisions and function selector clashes
remain. This demands a developer’s careful attention and thus results in a more
challenging pattern to utilize. The diamond pattern is the most complex of
the three, but it offers the most flexibility and maintainability thanks to its
modularity. Moreover, the diamond pattern is the most gas efficient when it
comes to doing more than two upgrades. This is because the diamond pattern
does not need to deploy long contracts, but only small facets. Finally, this pattern
is the most scalable because it does not have a contract size limit. Despite these
considerations, real-world implementations in projects like Compound, USDC,
GeoWeb, and Aavegotchi underline the use of the proxy and diamond patterns
as facilitators for flexible, upgradeable, and scalable smart contracts.

---

14 A. Benedetti, T.Henry, and S.Tucci-Piergiovanni
To generalize these initial findings, the study advocates for extending exper-
iments beyond the notarization scenario used as a comparison baseline for this
paper. Essential to this endeavor is the necessity for additional experiments en-
compassing diverse blockchain networks and pattern libraries to extrapolate and
validate the findings. For future work, a replication of the study on alternative
upgradeable patterns would also provide a more comprehensive understanding
of upgradeable smart contract patterns.
References
1. Alexander, C.: A pattern language: towns, buildings, construction. Oxford univer-
sity press (1977)
2. Alexander, C.: The timeless way of building, vol. 1. New york: Oxford university
press (1979)
3. Amri, S.A., Aniello, L., Sassone, V.: A review of upgradeable smart contract pat-
terns based on openzeppelin technique. The Journal of The British Blockchain
Association (2023)
4. Ayub, M., Saleem, T., Janjua, M., Ahmad, T.: Storage state analysis and ex-
traction of ethereum blockchain smart contracts. ACM Transactions on Software
Engineering and Methodology 32(3), 1–32 (2023)
5. Badr, A., Rafferty, L., Mahmoud, Q.H., Elgazzar, K., Hung, P.C.: A permissioned
blockchain-based system for verification of academic records. In: NTMS. IEEE
(2019)
6. Barros, G., Gallagher, P.: Erc-1822: Universal upgradeable proxy standard (uups).
https://eips.ethereum.org/EIPS/eip-1822 (2019-03-04), accessed: March 4,
2019
7. Buterin, V., et al.: Ethereum: a next generation smart contract and decentralized
application platform (2013). URL {http://ethereum. org/ethereum. html} (2017)
8. Chen, J., Xia, X., Lo, D., Grundy, J., Yang, X.: Maintaining smart con-
tracts on ethereum: Issues, techniques, and future challenges. arXiv preprint
arXiv:2007.00286 (2020)
9. Coelho, R., Braga, R., David, J.M.N., Stroele, V., Campos, F., Dantas, M.: A
blockchain-based architecture for trust in collaborative scientific experimentation.
Journal of Grid Computing 20(4), 1–31 (2022)
10. Di Sorbo, A., Laudanna, S., Vacca, A., Visaggio, C.A., Canfora, G.: Profiling gas
consumption in solidity smart contracts. Journal of Systems and Software (2022)
11. Docs, S.: Bytes and string. https://docs.soliditylang.org/en/latest/
internals/layout_in_storage.html#bytes-and-string (2023-04-14), accessed:
April 14, 2023
12. Docs, S.: Layout of state variables in storage. https://docs.soliditylang.org/
en/latest/internals/layout_in_storage.html (2023-04-14)
13. Docs, S.: Mappings and dynamic arrays. https://docs.soliditylang.org/en/
latest/internals/layout_in_storage.html#mappings-and-dynamic-arrays
(2023-04-14), accessed: April 14, 2023
14. Ebrahimi, A.M., Adams, B., Oliva, G.A., Hassan, A.E.: A large-scale exploratory
study on the proxy pattern in ethereum. Preprint (2023)
15. Ethereum: Gas and fees. https://ethereum.org/en/developers/docs/gas/
(2023-07-19), accessed: July 19, 2023

---

Gas Cost Analysis of Proxy and Diamond Patterns 15
16. Ethereum: Ethereum virtual machine (evm). https://ethereum.org/en/
developers/docs/evm/ (2023-09-02), accessed: September 2, 2023
17. Foundry: Foundry book. https://book.getfoundry.sh/ (2023-11-22), accessed:
November 22, 2023
18. Francisco Giordano, Hadrien Croubois, E.G., Lau, E.: Erc-7201: Namespaced stor-
age layout. https://eips.ethereum.org/EIPS/eip-7201
19. Kannengießer, N., Lins, S., Sander, C., Winter, K., Frey, H., Sunyaev, A.: Chal-
lenges and common solutions in smart contract development. IEEE Transactions
on Software Engineering 48(11), 4291–4318 (2021)
20. Leible, S., Schlager, S., Schubotz, M., Gipp, B.: A review on blockchain technology
and blockchain projects fostering open science. Frontiers in Blockchain p. 16 (2019)
21. Marchesi, L., Marchesi, M., Destefanis, G., Barabino, G., Tigano, D.: Design pat-
terns for gas optimization in ethereum. In: 2020 IEEE International Workshop on
Blockchain Oriented Software Engineering (IWBOSE). pp. 9–15. IEEE (2020)
22. Meisami, S., Bodell III, W.E.: A comprehensive survey of upgradeable smart con-
tract patterns. arXiv preprint arXiv:2304.03405 (2023)
23. Mudge, N.: Diamond 2 hardhat implementation. https://github.com/mudgen/
diamond-2-hardhat (2022-12-16), accessed: December 16, 2022
24. Mudge, N.: Awesome diamonds. https://github.com/mudgen/awesome-diamonds
(2023-11-01), accessed: November 1, 2023
25. OpenZeppelin: Proxy patterns. https://blog.openzeppelin.com/
proxy-patterns (2018-04-19), accessed: April 19, 2018
26. Palladino, P.: Malicious backdoors in ethereum
proxies. https://medium.com/nomic-foundation-blog/
malicious-backdoors-in-ethereum-proxies-62629adf3357 (2018-06-01)
27. Qasse, I., Hamdaqa, M., J´onsson, B.T.: Smart contract upgradeability on the
ethereum blockchain platform: An exploratory study. arXiv:2304.06568 (2023)
28. Six, N., Herbaut, N., Salinesi, C.: Blockchain software patterns for the design of
decentralized applications: A systematic literature review. Blockchain: Research
and Applications 3(2), 100061 (2022)
29. SolidState: Solidstate diamond. https://github.com/solidstate-network/
solidstate-solidity/tree/master/contracts/proxy/diamond (2023-10-12),
accessed: October 12, 2023
30. Szabo, N.: Formalizing and securing relationships on public networks. First monday
(1997)
31. Wood, G., et al.: Ethereum: A secure decentralised generalised transaction ledger.
Ethereum project yellow paper 151(2014), 1–32 (2014)
32. Xu, X., Bandara, H.D., Lu, Q., Weber, I., Bass, L., Zhu, L.: A decision model for
choosing patterns in blockchain-based applications. In: ICSA. IEEE (2021)
33. Xu, X., Pautasso, C., Zhu, L., Lu, Q., Weber, I.: A pattern collection for blockchain-
based applications. In: Proceedings of the 23rd European Conference on Pattern
Languages of Programs. pp. 1–20 (2018)
34. Zarir, A.A., Oliva, G.A., Jiang, Z.M., Hassan, A.E.: Developing cost-effective
blockchain-powered applications: A case study of the gas usage of smart contract
transactions in the ethereum blockchain platform. TOSEM (2021)