### Secure-by-design smart contract based on dataflow
### implementations
Simone Casale-Brunet
1,2⋆ 
and Marco Mattavelli
3⋆⋆
1 
Casale Brunet Consulting, Switzerland
2 
Blockchain Research Lab, Germany
3 
École Polytechnique Fédérale de Lausanne, Switzerland
Abstract. This article conducts an extensive examination of the persisting challenges re-
lated to smart contract attacks within blockchain networks, with a particular focus on the
reentrancy attack. It emphasizes the inherent vulnerabilities embedded in the programming
languages commonly employed for smart contract development, particularly within Ethereum
Virtual Machine (EVM)-based blockchains. While the concrete example used primarily em-
ploys the Solidity programming language, the insights garnered from this study are readily
generalizable to a wide array of blockchain architectures. Significantly, this article extends
beyond the mere identification of vulnerabilities and ventures into the realm of proactive secu-
rity measures. It explores the adaptation and adoption of dataflow programming paradigms,
employing Domain-Specific Languages (DSLs) to enforce security by design in the context of
smart contract development. This forward-looking approach aims to bolster the foundational
principles of blockchain security, offering a promising research direction for mitigating the
risks associated with smart contract vulnerabilities. The objective of this article is to cater
to a diverse audience, ranging from individuals with limited computer science and program-
ming expertise to seasoned experts in the field. It provides a comprehensive and accessible
resource for fostering a deeper understanding of the intricate dynamics between blockchain
technology and the imperative need for secure smart contract development practices.
Keywords: Smart Contract · Security · Dataflow · Blockchain · Ethereum · Solidity
1 Introduction
Smart contracts (SCs) were initially conceptualized in the early 1990s as digital agreements char-
acterized by automated enforcement and execution of legally binding terms. In recent years, they
have been integrated into blockchain technology. However, critical bugs and vulnerabilities in SCs
have led to catastrophic consequences for deployed applications, necessitating further scientific
research to enhance their security and reliability. Blockchain technology’s foundational principle
is the immutability and irreversibility of recorded data. This characteristic makes modifying de-
ployed SCs infeasible, often requiring the creation of entirely new SCs for rectification. Rigorous
pre-deployment testing and validation of SCs are crucial due to the impracticality of this approach.
Unfortunately, contemporary testing methodologies often fall short, resulting in errors and vulner-
abilities with severe repercussions. A significant challenge arises from the disparity between the
programming languages used in SC development and the unique characteristics of blockchain sys-
tems. Current programming techniques for smart contracts primarily rely on serial models, making
it challenging to express parallel and distributed execution on a blockchain network. This limita-
tion, described in recent papers such as [10] (see for example insights 4 and 13) and [20], contributes
to the difficulty of achieving secure and correct-by-construction smart contract implementations.
Presently, SC implementation often relies on vague and underspecified "coding best practices"
to compensate for these shortcomings. This deficiency stems from the absence of a suitable design
methodology and the unreliability of analysis and verification tools. The question of "which pro-
gramming model best suits SCs?" remains an open scientific problem, as highlighted in previous
research [20,19,10,18]. Previous attempts to identify an effective programming model have yielded
limited results, with existing literature primarily offering diverse solutions (often lacking scientific
verification) tailored for specific and straightforward use cases [18].
⋆ 
Dr. Simone Casale Brunet, PhD: simone@casalebrunet.com
⋆⋆ 
Dr. MER Marco Mattavelli, PhD: marco.mattavelli@epfl.ch
## arXiv:2309.17200v2 [cs.SI] 4 Oct 2023

---

2
The aim of this work is to investigate the root causes of these vulnerabilities and challenges
in achieving secure-by-design development techniques, which we attribute to the use of seemingly
inappropriate programming languages. In fact, by examining a simple yet well-known example of
a reentrancy attack (currently the most common and with the most catastrophic outcomes), it
is possible to mitigate such vulnerabilities by adopting a dataflow programming model. This pro-
gramming model, which has been successfully applied in fields such as video coding and genomics,
enables the representation of a program (in this case, the smart contract) at a high level while en-
suring both security and efficiency when implemented on parallel and heterogeneous architectures
(in this case, the blockchain).
The paper is structured as follows: Section 2 provides a brief historical overview of reentrancy
attacks. It illustrates their emergence in the early days of Ethereum in 2016 and, despite the years
that have passed, how reentrancy attacks remain a prevalent threat in newly deployed smart con-
tracts, emphasizing the urgency for effective mitigation strategies. An illustrative scenario involving
a bank ATM is presented in Section 3 to facilitate understanding for non-technical readers. Suc-
cessively, Section 4 delves deep into the technical aspects of reentrancy attacks, offering a detailed
examination of the source code of a real-world smart contract. Through this analysis, readers
can gain a profound understanding of why current programming languages for smart contract
development are inadequate and fraught with risks. The limitations of current best practices are
discussed in Section 5. Finally, the concept of a dataflow model for secure-by-design smart contract
implementation is discussed in Section 6. Here, it is outlined how this model can be leveraged to
construct inherently secure smart contracts. By doing so, the paper presents a potential solution to
address the prevailing issues in the current ecosystem, where the development process heavily relies
on the developer’s experience rather than robust engineering methodologies. Section 7 concludes
the paper, providing further research directions.
2 The DAO Hack and how the history was altered with a fork
In 2015, the nascent Ethereum community initiated discussions surrounding the concept of Decen-
tralized Autonomous Organizations (DAOs). These blockchain-based entities were designed to fa-
cilitate coordinated human activities through the execution of verifiable code, primarily by utilizing
smart contracts on the Ethereum blockchain. They aimed to enable decentralized decision-making
regarding community protocols. In 2016, approximately one year after the Ethereum mainnet’s
launch, a DAO called "The DAO" was established. It operated as a decentralized, community-
managed investment fund, with its smart contract deployed on April 30, 2016. Individuals acquired
The DAO’s community tokens by depositing Ether (ETH), and these ETH holdings constituted
the investment funds managed by The DAO on behalf of its token-holding community. The DAO
managed to attract nearly 14% of all ETH tokens in circulation at the time, boasting over 18,000
stakeholders. Unfortunately, on June 8, 2016, less than three months after its inception, The DAO’s
smart contract fell victim to a malicious hacker. Over the ensuing weeks, the hacker systematically
drained a substantial portion of The DAO’s smart contract balance. This security breach dealt a
severe blow to The DAO, eroding the trust of its investors and severely denting the credibility of
Ethereum and blockchain technology as a whole. Faced with a formidable decision, the Ethereum
core team contemplated potential solutions to thwart the hacker. One option was to execute a
fork of the Ethereum blockchain, effectively rewriting its history and creating an alternative re-
ality. By forking Ethereum, the new branch would operate as if the hack had never transpired.
If users adopted the new fork and abandoned the old one, the value of the hacker’s ETH hold-
ings would significantly decrease. This fork would invalidate the historical blocks containing the
hacker’s attack transactions. However, this drastic measure ran counter to the fundamental princi-
ples underpinning Ethereum. Those who supported the fork were essentially advocating for a world
with two parallel Ethereum blockchains. Ultimately, the vote in favor of the fork prevailed with
an 85% majority, leading to the fork’s implementation on July 20, 2016, that occurred with block
1,920,000 [2] containing the fix to "The DAO" (i.e., which allowed DAO investors to retrieve their
funds). Consequently, two Ethereum chains now exist: Ethereum Classic (which retains the hack
in its ledger) and the familiar Ethereum chain we know today (where the ledger’s history predates
the deployment of the flawed smart contract). Both chains have their native ETH tokens, which
possess significantly different market values.

---

3
Controversial issues
These events have sparked two opposing lines of discussion. From a legitimate but unethical per-
spective, it is essential to delve into the intricacies of this issue. From a purely technical standpoint,
the hacker’s actions did not breach the parameters established in "The DAO" protocols or the algo-
rithmic rules embedded in the smart contract. This viewpoint gains further weight when considering
an open letter signed by the attacker (which a copy can be accessed here [12]). Nevertheless, the
ethical and moral dimensions of this action should not be underestimated. Despite its technical
legality, appropriating funds in this manner is regarded as theft, giving rise to a significant ethical
and moral dilemma. On the other hand, in the context of blockchain being an immutable ledger,
the outcome leads to a dilemma regarding whether the Immutability Theorem has been compro-
mised due to consensus among network validators. Indeed, the introduction of a hard fork, while
addressing the crisis immediately, opens a Pandora’s box of philosophical questions that pertain to
the very foundations of blockchain technology. It challenges the long-standing principle that code,
once implemented, is sacrosanct and akin to law etched in stone, rendering any action permitted
by the code inherently legitimate and unalterable once executed. In practical terms, the hard fork
operates as a mechanism for temporal regression. Transactions recorded on the public ledger are
effectively nullified, creating a reality in which the malicious hack appears to have never happened,
as the smart contract was never published on the network. This decision carries profound im-
plications, as it necessitates a compromise on the immutability of the blockchain, a fundamental
principle of distributed ledger technology. This compromise is made in the interest of preserving
the then-emerging Ethereum movement during a severe existential crisis. The immutable nature
of the blockchain, once hailed as a cornerstone principle, is sacrificed in this instance in pursuit of
the greater good.
3 Understanding Reentrancy
In the following section we are providing a non-technical explanation of the reentrancy attack using
a "bugged" ATM analogy. Imagine you have 10,000 CHF in your bank account, and you walk up
to an ATM to withdraw 200 CHF. You receive the 200 CHF, but you notice that your balance
hasn’t changed. So, you decide to withdraw another 200 CHF, and again, there’s no change in
your balance. You continue to withdraw increasingly larger amounts until the cash in your hand
exceeds your total balance. You keep going, and only when you remove your card does your balance
finally reflect what just happened: you now have 0 CHF in your bank balance but 200,000 CHF
in your hands. All you know is that you now have 200,000 CHF in cash because the ATM kept
withdrawing from your original balance without updating it after each withdrawal. Every time
you selected "Withdraw 200 CHF," the ATM checked that your balance was sufficient (seeing your
original 10,000 CHF balance) and withdrew from it. However, it never updated the balance to 9,800
CHF after each withdrawal. You effectively trapped the ATM in a loop of withdrawing from your
initial balance indefinitely, and the money the ATM distributed to you came from the bank’s funds,
not necessarily your own. This is precisely what occurred in "The DAO" hack, where a similar
vulnerability in The DAO’s smart contract code allowed a malicious attacker to drain funds beyond
the allocation to which they were entitled. This type of attack is known as a reentrancy attack
(or exploit). Just like in the ATM example above, the malicious attacker repeatedly entered a
transaction via a recursive call and continuously executed withdrawals without the balance ever
being updated. The technical description of this attack is illustrated in the next section.
4 Technical analysis of the DAO attack
The smart contract "The DAO" is a Solidity-based smart contract (version v0.3.1) consisting of ap-
proximately 1200 lines of code, accessible at Ethereum address 0xbb9bc244d798123fde783fcc1c72d3bb8c189413
(i.e., see [1]). As previously described, this smart contract was hacked for an amount of 50 mil-
lion USD on June 17, 2016, by exploiting a flaw in the lines within the withdrawRewardFor(..)
function [5]. This code defect was addressed by Lefteris Karapetsas in the fix titled "Protect
against recursive withdrawRewardFor attack" [14], by moving the line containing the statement
paidOut[_account] += reward; as depicted in Figure 1. In essence, what the hacker did was

---

4
withdraw their previously deposited ETH recursively using the splitDAO(..) function, which in-
voked the withdrawRewardFor(..) function up to a depth of 29 recursive calls. Consequently,
transfers were executed 29 times without incrementing the value of paidout[_account] with the
already paid amount.
Fig. 1. DAO fix github
A simplified version of The DAO smart contract
In order to provide a more comprehensive description of how it was possible to exploit "The DAO"
smart contract (which was authored by highly experienced individuals) by leveraging the incorrect
placement of a single line of code, we simplified the original source code. We rewrote it in Table 1
with only the functions necessary to understand its operation and how, by changing the order of just
one line, it is possible to alter the transaction outcome. This highlights a fundamental discrepancy
between the execution model of Solidity and that on the blockchain. In the following, we analyze
block by block (identified by the numbers in the left column of the table) the various components
of this smart contract: 1○ it identifies the Solidity compiler version used to build the smart contract
deployed bytecode. 2○ this line defines the smart contract name (i.e., like a Java class). 3○ this is an
internal smart contract state variable that contains the ETH balance value of each mapped address.
4○ the function deposit(..) is used to deposit some ETH (i.e., defined by msg.value) on the smart
contract. This function is used to increment the caller (i.e., identified by msg.sender) balance. By
construction requirements, the minimum deposit is 1 ETH. 5○ the function daoBalance(..) is used
to return the available ETH balance stored in the smart contract. 6○ the function withdraw(..)
is used to withdraw the caller (i.e., identified by msg.sender) balance and it is used to describe in
an equivalent manner the functioning of the withdrawRewardFor(..) function [5] available in the
original DAO.sol smart contract. The operations performed by the withdraw function are:
1. Check if the caller has sufficient funds by checking balances[msg.sender]
2. Withdraw the balance sending the funds to the msg.sender address
3. Update balances[msg.sender] by setting the value to 0
This contract, while appearing straightforward, harbors a significant concern within its withdraw(..)
function. The anticipated execution sequence, which aligns naturally with our thought processes
when using a sequential language like Solidity, unfolds as follows:
1. Invocation of the withdraw(..) function.
2. Within the function, a validation step is executed to ascertain the caller’s possession of available
funds. This validation relies on inspecting the balances(address => uint256) mapping.

---

5
Table 1. Simplified version of the original "The DAO" smart contract source code.
3. If the caller possesses available funds, the function proceeds to transfer all those funds back
to the caller. Conversely, if no available funds are detected, an error is generated, and the
execution terminates.
4. As a final step, the balances mapping is updated to reflect a balance of 0 for the caller’s address.
The pivotal question at this point centers on the locus of the issue. The core concern revolves
around the fact that the caller of the withdraw(..) function can either be an external wallet
(as in the case of individual users) or another smart contract. In the case the caller is a wallet,
Fig. 2. Simplified execution flow of the DAO smart contract attack.
the withdraw(..) function operates smoothly without intrinsic issues. In contrast, in the latter
scenario where the caller is a smart contract, complications arise due to the non-atomic nature
of the function’s execution. The intricacy lies in how this non-atomicity can be exploited by the
invoking smart contract. To elucidate this concept, we employ visual aids of Figure 2, representing
each smart contract as a distinct entity denoted by a box. We further illustrate communication
between these smart contracts as communication channels, akin to buffered interconnections. In
this diagram we have two smart contracts communicating with each other: a) the DAO that is the one
we saw earlier, and b) Attacker which is the smart contract we use to perform the exploit. Let us
see below how we can build the smart contract Attacker in order to drain all the funds, even those
that do not belong to us, from DAO with the few Solidity source code lines illustrated in Table 2. In

---

6
the following, we analyze block by block (identified by the numbers in the left column of the table)
the various components of this smart contract: 1○ it identifies the Solidity compiler version used
to build the smart contract deployed bytecode. 2○ this is the interface of the DAO smart contract,
and it is used to define what functions of the DAO smart contract we can call from the Attacker
smart contract . 3○ this line defines the smart contract name 4○ this is the handler to the DAO
smart contract containing its public address. 5○ this is the smart contract constructor function,
used only during the deployment where the address of the DAO smart contract is provided. 6○ this
is the fallback function, a special Solidity construct that is triggered in specific situations such as
when the smart contract receives some ETH. 7○ we implement and use the function attack(..)
to launch the attack. We call the deposit function from the DAO smart contract sending it 1 ETH
so that: a) it receives the minimum required deposit and b) it records on its balances variable that
we have 1 ETH we can withdraw. Finally, we call the withdraw(..) function from the DAO smart
contract. This will then send the funds to this smart contract and the fallback function will be
triggered and executed. And this is where the problems begin, which we see in detail in the section
below.
Table 2. Attacker smart contract Solidity source code.
The reentrancy attack
Now that we have seen the source code of the Attacker smart contract, let us assume that there are
2 users that we will identify as userA and userB (in reality they are identified by a 42-character
hexadecimal address, but this would unnecessarily complicate the discussion). Both userA and
userB send 3 ETH in the DAO contract. So, we can start the discussion with the DAO contract
in the following state:
– DAO balances[userA] = 3 ETH
– DAO balances[userB] = 3 ETH
– The total DAO smart contract balance is 6 ETH (i.e., the total of ETH stored in the smart con-
tract) and this value can be retrieved by the primitive solidity function DAO.daoBalance(..)
And now we are ready to launch the attack by calling the attack(..) function from the smart
contract Attacker. What happens next is illustrated by the red arrows in Figure 3, which is:
1. The Attacker.attack(..) is executed and:
(a) It calls the DAO.deposit(..) function by sending 1 ETH

---

7
(b) The DAO.balances[address(Attacker)] = 1 ETH is set
(c) It call the DAO.withdraw(..) function
2. The DAO.withdraw(..) is called, the value DAO.balances[address(Attacker)] is 1 so:
(a) 1 ETH is sent from the DAO contract to the Attacker contract
(b) The new DAO balance is 5 ETH
3. The Attacker.fallback(..) function is triggered since 1 ETH is received and this function
will call the DAO.withdraw(..) function.
4. The DAO.withdraw(..) is called, the value DAO.balances[address(Attacker)] is still 1 ETH
since it has never been updated: the yellow line we previously highlighted in the Solidity code
of DAO smart contract contained in Table 1 has not yet been executed.
(a) 1 ETH is sent from the DAO contract to the Attacker contract
(b) The new DAO balance is 4 ETH
5. We repeat to point 3 till DAO.daoBalance(..) is 0, i.e., all founds have been drained.
The final status of the DAO contract is the following:
– DAO balances[userA] = 3 ETH
– DAO balances[userB] = 3 ETH
– DAO balances[Attacker] = 0 ETH
– The DAO smart contract balance is 0 ETH, since all the founds have been drained:
• address(DAO).balance = 0 ETH
• address(Attacker).balance = 6 ETH
Now we are going to look in detail at what is going on during the execution of these two smart
contracts and why the problem that has led to this exploit in such simple source code is related
to the fact that the computation model we are using for Solidity is at the root of the problem.
The same conclusions can be extended to the sequential programming languages that are used to
develop the smart contracts. As you can see, the funds from the DAO contract are sent before
Fig. 3. DAO attack explained
updating the balances variable, the Attacker fallback(..) function is triggered which will call
the DAO windraw(..) function which will have an un-updated view of the balances variable and
it will continue to send to Attacker funds that are not its own (DAO owns the funds, but they are
intended for userA and userB).
The question that arises is: "How can we prevent such exploits and attacks?" Presently, the
prevalent approach employed in smart contract implementation appears to rely on a set of coding
best practices. However, this approach poses a substantial challenge as it inherently compromises
the security of the code, given the absence of a universally applicable methodology for its analysis,
irrespective of the use-case scenario. In the next section, we will examine how these techniques are
formulated and adopted.

---

8
5 The (fragile and difficult) use of coding best-practices
To date, best practices for smart contracts development are a set of (non-standardized) rules based
on the knowledge of experienced developers who suggest some coding rules in order to avoid well-
known exploits. There are several collections of best practices for solidity, one of which we believe
is the most comprehensive is the one available here [11]. As you can see, these are alchemical rules
that look almost hobbyist (even if drafted by a company). For our particular example, the best-
practice we need to use in order to prevent the reentrancy attack in our example is the following one:
“If no internal state updates happen after an ether transfer or an external function
call inside a method, the function is safe from the reentrancy vulnerability”.
This rule requires to change the order of operations in the DAO withdraw(..) function so that
the caller’s balance is reset to 0 before some ETH are sent to the Attacker smart contract. The
new code would look like the one illustrated in Figure 4. This is feasible for this simple example
but could be not for more complex ones. It’s worth noting that this corresponds precisely to the
fix that was implemented in the original source code in 2016, as previously illustrated in Figure 1.
A second solution, could be use a kind-of mutex variable [17] as the one illustrated in Figure 7 and
discussed in the following section.
Fig. 4. DAO attack reentrancy fix by changing the order of a line.
General considerations about using best practices
Security-by-design is a fundamental requirement of any technology today. However, with this simple
example, we have seen how even the development of a simple smart contract of a few lines is prone
to potentially catastrophic bugs. We have seen how it is extremely difficult to effectively write
even simple smart contracts that are secure and reliable since the development methodology is
still based on best-practices that, as you can realize, are difficult to apply when it comes to more
complicated protocols that require writing high numbers of lines of code or when not applicable in
specific situations. If we go back to the origin of the problem, the main difficulty in securely writing
a smart contract can be related to the divergence between the programming language execution
model and the real execution on the blockchain. In fact, this fact can be identified as the main
cause of problems in both development and analysis.
1. The difficulty in using inappropriate language is evident if you have a look to the log on github
of the various attempts by the DAO development team to fix the bug [15]. It must be noted
that at that time no best practices where available.
2. The difficulty in analysing smart contracts developed with an inappropriate execution model is
evident when we try to analyse the above example with the current tools: the code of the second
solution (i.e., the one with the mutex) generates false positives making the analysis unrealisable
and the security of the implementation still dependent to the developer experience.

---

9
Therefore, it is absolutely necessary to have a development methodology capable to provide the
security by design, which is a fundamental requirement for any kind of technology we have today.
In the following section we will see how the security by design requirement can be granted by using
a dataflow programming model and how, in our opinion, pursuing research in this direction is the
right direction.
6 The use of a Dataflow model
In recent decades, the rise of massively parallel architectures, coupled with the challenges of pro-
gramming these architectures, has made the dataflow paradigm an attractive alternative to the
imperative paradigm [8,7]. The primary advantages of the dataflow paradigm are linked to its ca-
pacity to express concurrency without intricate synchronization mechanisms. This capability arises
from the program’s internal representation as a network of processing blocks that exclusively com-
municate through communication channels. In fact, these blocks operate independently and do not
produce any side effects [16]. Consequently, this eliminates potential concurrency issues that may
emerge when programmers are tasked with manually managing synchronization among parallel
computations. Furthermore, this paradigm explicitly exposes all the inherent parallelism within a
program. Over the past decade, a multitude of programming languages has emerged to model the
semantics of dataflow programs [6,13]. Imperative programming languages have been extended to
incorporate parallel directives (e.g., Java, Python, C/C++), while native dataflow languages (e.g.,
Esterel, Ptolemy) have been newly specified. Within this diverse landscape of language extensions,
RVC-CAL [3] distinguishes itself as the sole formally standardized programming language aligned
with the dataflow model. It is capable of modeling complex and dynamic dataflow networks where
the token production and consumption rates cannot be known at compile time. As depicted in
Figure 5, an RVC-CAL actor is defined as a collection of atomic methods (i.e., functions), referred
to as actions, accompanied by encapsulated state variables. These variables are inaccessible for ac-
cess or modification by neighboring actors within the same network. During an actor’s execution,
only a single action is selected at any given time, with the concurrent execution of multiple actions
being precluded. The selection of the action to execute is contingent upon the input token values
and/or the actor’s internal variables. One of the intriguing properties associated with the use of
these high-level dataflow programming models is the ability to generate optimized and secure-
by-design low-level code from this architecture-independent representation. Examples of synthesis
tools specifically developed for the RVC-CAL programming language include the Open RVC-CAL
Compiler (Orcc) [21], Exelixi [4], and Tÿcho [9].
Fig. 5. An example of RVC-CAL dataflow network composed by 5 actors (A, B, C, D, E) and 5 buffers
(b1, b2, b3, b4, b5). Each actor is composed by a set of input and output ports, a set of internal state
variables, a set of actions (i.e., atomic functions) and a finite state machine (FSM).

---

10
Dataflow-based smart contracts
The interconnected block representation we employed in Figure 2 to elucidate the interaction
between two smart contracts, namely the DAO and the Attacker, essentially forms the foundation
of any dataflow-based model, as seen earlier. As illustrated in Figure 6, the core characteristics of
such a dataflow model are as follows: A) Each box represents an actor, which corresponds to a
smart contract, as previously demonstrated in Figure 2. B) The exchange of information between
two smart contracts can only occur through dedicated communication channels known as buffers.
These buffers ensure that the order and consistency of data are preserved and guaranteed by
the execution model itself. C) Each function execution is inherently atomic. This means that, in
advance, we are assured that the execution model prevents unpredictable effects resulting from
changing the order of source code lines. A function execution adheres to the following sequence of
operations:
– Input data is consumed from the input buffer(s).
– Subsequently, the execution occurs, during which state variables may be updated.
– Only at this point is output data placed in the output buffer(s).
Fig. 6. Smart contract dafaflow model
The complexity of the individual action determines the category to which each smart contract
(actor) belongs. These categories include:
– Static: At each function execution, it consumes from its input buffers and produces on its
output buffers an always equal amount of data.
– Cyclo-Static: The number of data consumed and produced varies from run to run but follows
a repetitive and cyclic pattern.
– Dynamic: The number of produced and consumed data is not known in advance.
These fundamental rules underlie a dataflow programming model, which can be extended to en-
hance the expressiveness and capability of representing various smart contract use cases. Conse-
quently, creating a smart contract using a Domain Specific Language (DSL) similar to Solidity
and RVC-CAL can resemble the example presented in Table 3. It is important to note that in this
example, we employ a guard condition as a prerequisite for executing the action (function). If the
prerequisite is not met, the action cannot be executed. In the following sections, we will analyze
each block, identified by the numbers in the left column of the table, to understand the various
components of this smart contract: 1○ Smart contract (actor) name. 2○ Input port definition,
the point where data can be read/received inside the actor. 3○ Output port definition, the point
where data can be written/sent outside the actor. 4○ ETH balance of each mapped address. 5○A
requirement for at least 1 ether available in the input port, involving popping (consuming) one
value from the input port and updating the state variable. 6○ It’s worth noting that the update of
the balances variable occurs after the value is pushed onto the output port. However, it’s crucial

---

11
Table 3. Smart contract dataflow code using a DSL similar to Solidity and RVC-CAL
to understand that this message will be sent only once all operations are executed. This design
choice fundamentally guarantees the absence of a reentrancy condition.
In essence, this model enables the generation of Solidity source code that is correct by con-
struction. As previously mentioned, the dataflow model of computation hinges on the concept of
atomicity in function execution. This concept can be translated into automated source code gener-
ation from the dataflow model to Solidity code, introducing, for example, a mutex variable, as seen
in the generated source code illustrated in Figure 7. It’s important to note that this source code,
while deviating from Solidity best practices, is entirely correct, and it fundamentally enhances
robustness by being invariant to the order of execution of its operations. This assures a security by
design property, a critical requirement for smart contract development, which is currently lacking.
Fig. 7. Smart contract dafaflow generated source code
7 Conclusions
In summary, this study represents an initial exploration into the integration of dataflow program-
ming models and Domain-Specific Languages (DSLs) within the domain of smart contract develop-
ment, with a primary focus on enforcing security through the principle of security-by-construction.
Our investigation has unveiled the fundamental attributes of dataflow-based models, demonstrating

---

12
their innate capacity to articulate concurrency in a manner that obviates the need for intricate syn-
chronization mechanisms. This approach effectively mitigates potential concurrency-related vulner-
abilities, a significant concern within decentralized applications. Moreover, dataflow models provide
a transparent framework for exposing inherent program parallelism, imparting an additional layer
of security to the smart contract development process. As elucidated in our analysis, the adop-
tion of DSLs analogous to Solidity and RVC-CAL facilitates the automated generation of low-level
code that adheres to security-by-design principles, starting from high-level, architecture-agnostic
representations. This approach reframes smart contract development, shifting the emphasis away
from manual coding practices, which heavily rely on developer expertise, towards a systematic,
inherently secure methodology. While our research marks an initial exploration of these concepts,
it simultaneously beckons forth a promising trajectory for future research. Within the ever-evolving
landscape of blockchain technology, where security stands as a paramount concern, this nascent
study lays the foundational groundwork for a more resilient and secure future in smart contract
programming.
References
1. The dao smart contract ethereum address (Apr 2016), https://etherscan.io/address/
0xbb9bc244d798123fde783fcc1c72d3bb8c189413
2. Ethereum block number 1920000 (Jul 2016), https://etherscan.io/block/1920000
3. 23001-4:2011, I.: Information technology - MPEG systems technologies - Part 4: Codec configuration
representation (2011)
4. Bezati, E.: High-level synthesis of dataflow programs for heterogeneous platforms design flow tools
and design space exploration (2015). https://doi.org/10.5075/epfl-thesis-6653, http://infoscience.
epfl.ch/record/207992
5. Blockchains, I.: Original dao.sol with bugged withdrawrewardfor function (Nov 2016),
https://github.com/blockchainsllc/DAO/blob/6967d70e0e11762c1c34830d7ef2b86e62ff868e/
DAO.sol#L738
6. Casale-Brunet, S.: Analysis and optimization of dynamic dataflow programs. Ph.D. thesis, EPFL STI,
Lausanne (2015). https://doi.org/10.5075/epfl-thesis-6663
7. Casale-Brunet, S., Bezati, E., Mattavelli, M.: Programming models and methods for heterogeneous par-
allel embedded systems. In: Embedded Multicore/Many-core Systems-on-Chip (MCSoC), 2016 IEEE
10th International Symposium on. pp. 289–296. Ieee (2016)
8. Castrillon, J., Leupers, R.: Programming Heterogeneous MPSoCs: Tool Flows to Close the Software
Productivity Gap. Springer Publishing Company, Incorporated (2013)
9. Cedersjö, G., Janneck, J.W.: Tÿcho: a framework for compiling stream programs. ACM Transactions
on Embedded Computing Systems (TECS) 18(6), 1–25 (2019)
10. Chen, H., Pendleton, M., Njilla, L., Xu, S.: A survey on ethereum systems security: Vulnerabilities,
attacks, and defenses. ACM Comput. Surv. 53(3) (jun 2020). https://doi.org/10.1145/3391195, https:
//doi.org/10.1145/3391195
11. Diligence, C.: Solidity best practices for smart contract security (Sep 2023), https://consensys.net/
blog/developers/solidity-best-practices-for-smart-contract-security/
12. Forum, B.: (copy of the original) letter from dao attacker (Jun 2016), https://bitcointalk.org/
index.php?topic=1516913.0
13. Johnston, W., Hanna, J., Millar, R.: Advances in dataflow programming languages. ACM Computing
Surveys (CSUR) 36(1), 1–34 (2004)
14. Karapetsas, L.: Dao.sol fix "protect against recursive withdrawrewardfor attack" (Jun 2016), https:
//github.com/blockchainsllc/DAO/commit/f01f3bd8df5e1e222dde625118b7e0f2bfe5b680
15. Karapetsas, L.: Dao.sol fix "protect from the recursive attack in withdraw()" (Nov 2016), https:
//github.com/blockchainsllc/DAO/commit/9c822ba54c9c2b9ae0433ab2358c52a19e5fb2fe
16. Lee, E., Parks, T.: Dataflow Process Networks. In: Proceedings of the IEEE. pp. 773–799 (1995)
17. Manual, G.G..R.: Mutexes and condition variables (Sep 2023), https://www.gnu.org/software/
guile/manual/html_node/Mutexes-and-Condition-Variables.html
18. Rameder, H., di Angelo, M., Salzer, G.: Frontiers in Blockchain 5 (2022).
https://doi.org/10.3389/fbloc.2022.814977, https://www.frontiersin.org/articles/10.3389/
fbloc.2022.814977
19. Sayeed, S., Marco-Gisbert, H., Caira, T.: Smart contract: Attacks and protections. IEEE Access 8,
24416–24427 (2020). https://doi.org/10.1109/ACCESS.2020.2970495
20. Sergey, I., Hobor, A.: A concurrent perspective on smart contracts. In: Financial Cryptography and
Data Security. pp. 478–493. Springer International Publishing, Cham (2017)
21. Yviquel, H., Lorence, A., Jerbi, K., Cocherel, G., Sanchez, A., Raulet, M.: Orcc: Multimedia Devel-
opment Made Easy. In: Proceedings of the 21st ACM International Conference on Multimedia. pp.
863–866. MM ’13, ACM (2013)