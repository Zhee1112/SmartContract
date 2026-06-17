# Gas Gauge: A Security Analysis Tool for Smart
# Contract Out-of-Gas Vulnerabilities
Behkish Nassirzadeh , Vijay Ganesh
University of Waterloo
Waterloo, Canada
{bnassirz, vijay.ganesh}@uwaterloo.ca
Huaiying Sun
East China University of Science and Technology
Shanghai, China
ecustshy@foxmail.com
Sebastian Banescu
Quantstamp
Munich, Germany
sebi@quantstamp.com
Abstract—In recent years, we have witnessed a dramatic
increase in the adoption and application of smart contracts in
a variety of contexts. However, security vulnerabilities pose a
significant challenge to the continued adoption of smart contracts.
An important and pervasive class of security vulnerabilities
that afflicts Ethereum smart contracts is the gas limit DoS on
a contract via unbounded operations. These vulnerabilities result
in a failed transaction with an "out-of-gas" error and are
often present in contracts containing loops whose bounds are
affected by end-user input. To address this issue, we present Gas
Gauge, a tool aimed at detecting Out-of-Gas DoS vulnerabilities
in Ethereum smart contracts. The Gas Gauge tool has three
major components: The Detection Phase, Identification Phase,
and Correction Phase. The Detection Phase component consists
of an accurate static analysis approach that finds and summarizes
all the loops in a smart contract. The Identification Phase
component uses a white-box fuzzing approach to generate a set
of inputs that causes the contract to run out of gas. Lastly, the
Correction Phase component uses static analysis and run-time
verification to predict the maximum loop bounds consistent with
allowable gas usage and suggest appropriate repairs to the tool’s
users. Each part of Gas Gauge can be used separately or all
together to detect, identify and help repair contracts vulnerable
to Out-of-Gas DoS vulnerabilities. Gas Gauge was tested on
1,000 real-world solidity smart contracts. When compared to
seven state-of-the-art tools, we show that Gas Gauge is the most
effective (i.e., has no false positives and false negatives) while
being competitive in terms of efficiency.
Index Terms—Smart Contract Security, Blockchain, Ethereum,
Static Analysis, Dynamic Analysis
I. INTRODUCTION
Smart contracts are one of the main applications of leading
blockchains such as Ethereum [1]. Smart contracts are exe-
cutable programs that allow building a programmable value
exchange or a contract between various parties without the
need for a trusted third-party. While smart contracts bring
many benefits to the blockchain ecosystem, they suffer from
various security vulnerabilities. Certain vulnerabilities can be
exploited by attackers to steal funds from a smart contract,
while others can cause funds to be locked indefinitely. One
security issue plaguing Ethereum smart contracts is Out-of-
Gas Denial of Service (DoS) vulnerabilities. Every operation
in an Ethereum smart contract costs a certain amount of gas,
a measurement unit for the amount of computational effort
required to execute said operation or transaction, paid by the
transaction initiation party. Each block comes equipped with
an upper bound on the amount of gas that can be spent to
compute all the transactions within that block. This is called
the Block Gas Limit. Since a transaction cannot exceed one
block, the transaction gas limit is also bound by the block gas
limit [2]. One of the kinds of gas-related vulnerabilities is DoS
with Unbounded Operations, also known as Unbounded Mass
operations [3]. In this case, the execution of the transaction
requires more gas than the block gas limit. As a result,
The execution of one or more functions in a smart contract
vulnerable to Out-of-Gas can be blocked indefinitely if Out-
of-Gas conditions are not appropriately handled. This is the
type of vulnerability that we focus on in this paper.
Many Ethereum wallets, such as Metamask [4], have a built-
in mechanism to estimate the cost of a transaction statically,
right before it is executed. However, there are certain cases
when the gas estimation is incorrect or impossible to estimate.
For example, if multiple operations are performed inside a loop
traversing a dynamic array or mapping [5]. The Metamask
Support website acknowledges this issue [6] and indicates
that users should manually adjust the transaction gas limit
according to one of the latest passing transactions for the smart
contract function they are trying to call.
In order to address the above-mentioned problem, we
present a tool, Gas Gauge, that automatically detects and sug-
gests remediation for Out-of-Gas vulnerabilities in Ethereum
smart contracts. We were motivated by two factors in design-
ing Gas Gauge. First, to-date, the most widely used method for
detecting and repairing Out-of-Gas vulnerabilities is manual
security audits which cannot continue to scale with the ever-
growing size, complexity, and the number of smart contracts.
Second, as we show in this paper, existing automated methods
based on static, symbolic, or run-time analysis are plagued
by either high false negative rates or scalability issues. Our
insight is that the best way to address this problem is to
use an appropriate combination of static and dynamic analysis
methods. Hybrid methods can outperform all other approaches
because, in order to detect these vulnerabilities, one needs to
determine the loops or functions that can lead to an Out-of-
Gas DoS (best done via static analysis), and then perform
gas analysis to determine the exact point, e.g., loop iteration,
when Out-of-Gas occurs (best done using appropriate dynamic
analysis).
A. Contributions.
The contributions we make in this paper are as follows:
## arXiv:2112.14771v2 [cs.CR] 9 Jul 2022

---

i) Design and implementation of a static analysis and
run-time verification tool, Gas Gauge
1
, aimed at au-
tomatically detecting Out-of-Gas DoS vulnerabilities in
Ethereum smart contracts. We implemented three tech-
niques in Gas Gauge that are critical for identifying Out-
of-Gas DoS vulnerabilities. The first technique is a static
analysis method that identifies and summarizes loops in
smart contracts. The second is a white-box fuzzing tech-
nique that triggers Out-of-Gas errors in smart contracts
that contain publicly accessible functions with loops
whose bounds are influenced by inputs (To the best of
our knowledge, this feature is unique to Gas Gauge).
The third is a method for identifying a threshold, as a
function of input and state variables, at which Out-of-
Gas errors can be triggered in a contract-under-analysis
(To the best of our knowledge, this feature is also unique
to Gas Gauge).
ii) An extensive evaluation of the Gas Gauge against seven
state-of-the-art tools: GASTAP/Gasol [7], [8], Mad-
max [3], MPro [9], Mythril [10], Securify 2.0 [11],
Slither [12], and SmartCheck [13] on a benchmark of
1,000 real-world smart contracts. Our evaluation found
that Gas Gauge outperforms these state-of-the-art tools.
That is, Gas Gauge has zero false negative and false pos-
itive rates, while at the same time has a similar efficiency
profile to the fastest tool in the set, SmartCheck. Further,
none of these tools provide any support for repair, a
feature that is essential for the industry.
iii) A case study on a real-world application, Airswap,
a peer-to-peer trading network for Ethereum used for
trading of over $20 million/week with current ETH
value. We consulted with the engineers who manually
audited Airswap and were informed that constructing the
repair for the Out-of-Gas DoS vulnerability in Airswap
took them several man-hours of work, while our Gas
Gauge tool managed to automatically accomplish the
same task on this real-world smart contract in under 10
minutes.
Our experimental evaluation reveals that Gas Gauge is
useful, accurate, and outperforms other state-of-the-art tools
that can be used to detect Out-of-Gas vulnerabilities. We tested
our tool on 1,000 real-world smart contracts extracted from
Etherscan
2
, one of the most popular Ethereum blockchain
explorers. All these contracts were manually checked to ensure
that they contain at least one loop since user-controlled loops
are one of the main causes of DoS with Unbounded Opera-
tions [3]. Our tool uses run-time analysis to ensure no false
positives, and our static analysis method ensures a zero false
negative rate on the evaluated benchmark. Also, we performed
a case study that showed that Gas Gauge could be utilized in
real-world projects written in Solidity to save hours of manual
work and millions of USD.
1
https://gasgauge.github.io/
2
https://etherscan.io/
II. BACKGROUND
A. Background on Smart Contracts:
Ethereum is one of the leading blockchain platforms. It
is a decentralized and open-source blockchain that contains
millions of accounts and billions of USD in capitalization.
Hence, it is one of the most prevalent underlying technologies
for smart contracts [9]. Smart contracts handle transactions in a
cryptocurrency called Ether. They are commonly written in the
Solidity language, which is a Turing-complete programming
language [14]. It then gets compiled to Ethereum Virtual
Machine (EVM) bytecode instructions to be deployed on the
blockchain. Unlike traditional software programs, a smart con-
tract is publicly accessible, transparent, and immutable. There-
fore, once a smart contract is deployed on the blockchain, it
cannot be altered. Thus, if errors or vulnerabilities are found
in a smart contract post-deployment, they cannot be fixed a
posteriori by developers unless CREATE2 is used [15]. Several
smart contract vulnerabilities have been discovered in recent
years, of which Out-of-Gas DoS are among the common ones.
A list of the most known smart contract vulnerabilities can be
found on the SWC Registry website
3
.
B. Helper Tools:
Developing an automatic gas analysis tool from Solidity
source code requires a considerable implementation effort.
Fortunately, many existing open-source tools make this task
easier than otherwise. For example, we used the Slither [12]
and Truffle Suite [16] as part of the Gas Gauge. Slither pro-
vides many useful APIs to collect information about a smart
contract, such as data dependencies and function signatures.
This is used to summarize the contract and extract the needed
information for the other parts of Gas Gauge implementation.
Also, the Control Flow Graph (CFG) generated by Slither
is used to find the loops in the contract and their orders.
Further, Truffle Suite is used to compile and deploy Solidity
smart contracts to a test Ethereum network. This allows us
to use different sets of inputs in the Identification Phase of
the tool and use different threshold values in the Correction
Phase while retrieving useful gas-related information such as
gas used and gas left.
C. Whitebox Fuzzing:
Nowadays, security vulnerabilities in software products can
be found by two fundamental methods: Code inspection of
binaries and blackbox fuzzing. Blackbox fuzzing is a class of
blackbox random testing that randomly mutates well-formed
inputs to the program and then tests the program on the
resulting data in order to trigger a bug [17]. Blackbox fuzzing
is an effective method to test a program; however, it can have
limitations. Low code coverage is one of the leading limita-
tions of blackbox fuzzing resulting in missing security bugs
[17]. An alternative approach to blackbox fuzzing is whitebox
fuzzing. It is a type of automatic dynamic test generation,
3
https://swcregistry.io/

---

Fig. 1. The Architecture of Gas Gauge
based on symbolic execution and constraint solving, intended
for large applications’ security testing [17].
D. Out-of-Gas Denial of Service Vulnerabilities
1 pragma solidity >=0.4.24 <0.7;
2 contract SmallBank{
3 address[] users;
4 function addUsers(address newUser) public {
5 users.push(newUser);
6 }
7 function addInterest(uint interest) public {
8 //Heavy code to compute interest per user
9 for(uint i = 0; i < users.length; i++){
10 users[i].call.value(interest)();
11 }
12 }
13 }
Fig. 2. Ethereum smart contract Vulnerable to DoS with Block Gas Limit
The gas fee has to be paid by the transaction initiation
party before the execution starts. Since estimating the exact
gas needed can be challenging, as described in Section I, the
transaction initiators can specify the maximum amount of gas
they are willing to pay for their transaction to be included
in a block. This is known as the transaction gas limit. If the
gas usage associated with a transaction surpasses this limit, the
EVM raises an Out-of-Gas exception and aborts the associated
transaction [18]. Each block has an upper bound on the amount
of gas that is determined by the network and the miners.
This limit is called the Block Gas Limit. A transaction cannot
exceed one block, so the transaction gas limit is also bound
by the block gas limit [2]. Therefore, if a transaction requires
more gas than Block Gas Limit, it will revert due to Out-
of-Gas, which causes the initiation party to waste gas, and
no state changes occur. As a result, The execution of one
or more functions in a smart contract vulnerable to Out-of-
Gas can be blocked indefinitely if Out-of-Gas conditions are
not appropriately handled. As a result, DoS attacks can target
contracts with gas-related vulnerabilities. One of the principal
kinds of gas-based vulnerabilities is DoS with Block Gas Limit
vulnerability. This vulnerability has a few different types. The
most common form that mainly occurs in contracts with user-
controlled loops is DoS with Unbounded Operations. This can
happen when the cost of executing a function exceeds the
block gas limit [18]. This can be problematic even without any
malicious intent. Generally, loops that user input determines
their behavior could iterate too many times, exceeding the
Block Gas Limit [3].
Figure 2 demonstrates an example of a contract vulnerable
to DoS with Unbounded Operations. In this example, the num-
ber of iterations in the loop in addInterest is determined
by the length of the variable users, which is controlled by

---

the user input through addUsers. addInterest performs
some expensive arithmetic calculations to compute the interest
per user (not shown in the snippet) and then sends each user
the interest amount. If the length of users is large, the
computation required in the loop might reach the block gas
limit, which causes the execution of the transaction to reach
out of gas and revert. Thus, as the number of users grows,
the gas needed to execute addInterest will increase.
Ultimately, the function may become impossible to execute
without raising an Out-of-Gas exception, at which point no
user can claim their interest, and the SmallBank contract
will suffer reputation damage and lose users.
III. DESCRIPTION OF GAS GAUGE
Gas Gauge is designed to address gas-based vulnerabili-
ties of smart contracts. Since loops are the main cause of
many gas-related vulnerabilities, the focus of Gas Gauge is
on identifying and summarizing loops and then ascertaining
whether they are vulnerable. Gas Gauge contains three major
parts: the Detection Phase, Identification Phase, and Correction
Phase. The Identification Phase and Correction Phase require
the information generated by the Detection Phase; however,
Identification Phase and Correction Phase are independent
of one another. The inputs to all methods are the Solidity
source code 
4 
and the contract’s gas limit (optional if only
the Detection Phase is used). Overall, Gas Gauge can detect
all the loops and provide a repair to contracts vulnerable to
gas-related vulnerabilities. The architecture of Gas Gauge is
shown in Figure 1.
A. Detection Phase
The Detection Phase uses a static analysis approach to
efficiently and accurately detect all the loops in a smart
contract.
1) Initial Contract Generator: The first and simplest com-
ponent of the Detection Phase is the Initial Contract Generator.
In this step, a copy of the original contract is made. If the
Correction Phase is needed, the copied version is formatted to
make it easier for the other parts. For example, it removes all
the comments and adds brackets and spaces if needed. Then,
the new contract is fed to Slither. This part formats the contract
in a way that does not affect the behavior but makes it easier
for the static analysis section.
2) Target Block Detector and Its Inputs: In this stage,
inputs to the Identification Phase and Correction Phase are
generated. The input to the Identification Phase is the target
functions, and the input to the Correction Phase is the target
loops. First, Slither is used to extract the contract’s Control
Flow Graph (CFG) and other useful information like function
signatures and data dependencies. The Loop Finder uses the
contract’s CFG to find all the loops. Also, the information pro-
vided by Slither is used in the Function Summary Generator to
summarize the contract. If only the Detection Phase is needed,
the program halts here and outputs the functions containing
4
The contracts should be self-contained. Thus, contracts with external calls
are not supported.
loops along with the number of loops in each function. If
the Identification Phase or Correction Phase is also needed,
the types of variables affecting the loop bounds are obtained.
This process utilizes a static analysis approach and uses the
reports available in Slither to gather the loop conditions,
the variables affecting the loops, variable dependencies, and
function summaries. The variables affecting the loop bounds
are classified into four groups: State, Local, Fixed, and Input
variables. State variables are the contract variables whose
values are persistently stored in contract storage and can be
accessed by all the contract functions. Fixed variables are the
ones that only carry a fixed value and are defined within the
target function (in the loop bound). Input variables carry their
usual meaning: the inputs of the target function. Finally, Local
variables are declared and initialized inside the target function,
and their context is within a function and cannot be accessed
outside. If a Local variable is detected as the loop bound,
the Target Block Detector performs induction to find a list
of all State, Input, and Fixed variables affecting that local
variable. For the white-box fuzzer, the Target Block Detector
finds public functions that contain loops with bounds affected
by input variables and passes them to the Identification Phase.
After identifying the target functions, the function signatures,
name, and type of the input variables affecting the target
loops are passed to the fuzzer. For the Correction Phase,
the function signatures for all the functions containing loops,
and a summary of each loop is generated. This summary
includes the scope of each loop, the order of the loops if
the function contains nested loops, and information about the
variables affecting the loop bounds and their types. Therefore,
even if a function is not passed to the Identification Phase
because it does not satisfy the criteria of this phase, it is
still passed to the Correction Phase, and this phase finds the
correct threshold values. In the Correction Phase, the contract
is slightly modified, so that it can find the thresholds for any
loop in any type of function.
B. Identification Phase
In the Identification Phase, a white-box fuzzing approach
is utilized to generate a set of inputs for each user-controlled
loop in a public function in a Solidity smart contract. The
bounds of these loops must be affected by at least one of the
input variables of the function containing the loop; otherwise,
directly fuzzing the target function cannot be effective. This
component takes the information from the Detection Phase
and the block gas limit as inputs and outputs the set of
values that make the transaction go out of gas. Here, public
functions mean functions that can be called from outside the
contract. Thus, private functions cannot be fuzzed directly
without modifying the contract. These functions are supported
and checked by the Correction Phase.
In this part, all the input variables in the target function
get set to their initial values (i.e., integers are set to zero, and
arrays are set to an empty array). The input values reported
by the Target Block Detector get encoded in their binary
representations. Then the tool picks a bit at random and flips it.

---

Algorithm 1: Estimated threshold for a loop
1 initial gas = gasleft() ;
2 iteration = 0 ;
3 while iteration < 2 do
4 original code inside the loop ;
5 if iteration == 0 then
6 gas 1 = initial gas − gasleft();
7 end
8 gas 2 = initial gas − (gas 1 + gasleft());
9 iteration += 1;
10 end
11 max iteration = 1 + (initial gas − gas 1)/gas 2 ;
Then, the binary encoding gets converted back to the original
form. The only exception is arrays. In this case, the array
size can generally affect the bound of a loop, so arrays are
represented by 256 bits since arrays in Solidity can have
up to 2
256 
elements [19]. Then, the binary representation
gets converted to an integer, and the array size gets set to
that. If multiple input variables affect the loop bound, the
binary representations get concatenated, the bit is flipped, and
the concatenated value gets converted back to the original
forms. Next, all the necessary files are generated automatically.
Truffle Suite [16] is used to deploy the contract to a test
Ethereum network. A test file is generated in Solidity to call
the target function with generated input values. Then, the
contract is deployed, and the target function is fuzzed (tested
with different input values). Suppose the test case halts and
returns the remaining gas in the contract, the process repeats,
and the fuzzer flips another bit. The process continues until a
set of inputs is found that makes the test case abort due to an
Out-of-Gas exception. At this point, the used set of inputs is
reported as the output of the phase.
C. Correction Phase
The Identification Phase is convenient to scan the contracts
before deployment and check if the contract is at risk of DoS
with Block Gas Limit. Since it also provides an instance, it
further helps them examine the problem. However, one of the
first steps to fixing the code is to find the exact point where the
Out-of-Gas condition starts to get triggered, and any arbitrary
set of inputs is not enough. Therefore, The Correction Phase
is designed to find the upper bound limit of the loops in a
smart contract. The output is a formula based on the maximum
number of allowed iterations for loops before the transaction
runs out of gas. We refer to this number as the threshold of
the loop.
1) Modifier: The Modifier makes two copies of the contract
generated in the Initial Contract Generator. The first copy
is to measure the gas used for each loop’s first and second
iteration identified by the Target Block Detector. Based on
our observation, the first iteration of each loop consumes
more gas than the other iterations. This is perhaps due to the
gas consumption of the loop initialization, where the counter
gets initialized to a starting value. The second iteration’s gas
usage is typically the average gas usage of all the other
loop iterations. The first copy is the input to the Estimator,
and the second copy is to change the loop bound to the
desired value. It allows us to run each loop with a specified
number of iterations and capture the gas left after that many
iterations. The Threshold Calculator uses this to test different
values. The modifications only have an insignificant effect on
the behavior/gas usage of the contract. A public function is
added as a wrapper for both modified copies to call the target
function.
2) Threshold Estimator: The Threshold Estimator receives
the first modified contract and automatically creates a Solidity
test file and all the other necessary files for Truffle Suite [16].
Also, to get an actual gas usage for each iteration, the new
contract and test file are deployed to a test Ethereum network
using Truffle Suite. The modified contract runs each loop twice
and captures the gas used in each iteration. One can call the
function gasleft() returns (uint256) that exists in
the global namespace and returns to get the remaining gas at
any instance [1]. We can utilize this function to measure the
gas usage of the target block of code. Next, based on the gas
usage amount reported by the Truffle Suite and the gas limit,
the maximum number of iterations that the loop can perform
without running out of gas is estimated. Algorithm 1 shows
the used method method. As shown, the maximum iteration is
estimated to be the amount of the initial gas before entering the
loop minus the gas consumption of the first iteration divided
by the average gas consumption of all the other iterations. An
extra iteration is added to account for the first iteration.
3) Threshold Calculator: We first use the run-time/static
analyzer to estimate the loop bound threshold. Thus, any
value over this threshold may trigger the Out-of-Gas condition.
Then, we used a run-time verification approach to find a more
accurate value. We further use a binary search approach to
cut down the action space rapidly. The action space is all the
integers that can be the loop bound. The estimated threshold
helps the binary search model have a proper starting point.
The second set of the modified files and the Estimator’s result
is fed to the Threshold Calculator. The purpose is to run each
loop with a specified number of iterations and capture the gas
left after that many iterations. The threshold calculator uses
this to test different values. The code snippets in Figure 3 and
4 demonstrate how a contract is modified in order to find the
threshold for the first loop. The code snippet in Figure 3 is the
original contract that contains two loops and the code snippet
in Figure 4 is the modified contract.
At this stage, by inputting different values to the target
function, we can calculate different gas usages. The goal here
is to find two consecutive numbers, where only the larger
number makes the transaction run out of gas. Each loop is
isolated to ensure the value is only affecting the target loop.
The contract is deployed and run for each value, and the gas
left is obtained. There is a lower bound and an upper bound
limit for the search space in the Binary Search model. They are
initially set to 0 and 5,000, respectively. Once the execution
of a contract passes Truffle’s time limit, it throws a time-out
exception and stops running. Therefore, if a loop runs for too

---

1 pragma solidity >=0.4.24 <0.7;
2 contract TestContract{
3 uint[] numbers;
4 function addNumbers(uint[] calldata newNumbers)
external returns(uint){
5 for(uint i=0; i<newNumbers.length;i++) {
6 numbers.push(newNumbers[i]);
7 }
8 uint sum = 0;
9 for(uint j=0; j<numbers.length; j++){
10 sum += numbers[j];
11 }
12 }
13 }
Fig. 3. The Original Code Containing two Loops
1 pragma solidity >=0.4.24 <0.7;
2 contract TestContract {
3 uint[] numbers;
4 function getStateVarInaddNumbers(uint[] memory
input1) public returns (uint) {
5 addNumbers(input1);
6 return gasleft();
7 }
8 function addNumbers(uint[] memory newNumbers)
public returns (uint){
9 uint loopCounter = 0;
10 for(uint i=0; loopCounter < VALUE; i++) {
11 numbers.push(newNumbers[i]);
12 loopCounter = loopCounter + 1;
13 }
14 uint sum = 0;
15 for(uint j=0; 1 == 0 ; j++){
16 sum += numbers[j];
17 }
18 }
19 }
Fig. 4. The Modified Code Containing two Loops
many iterations, it might trigger the time-out exception. From
our experiments, if the maximum number of loop iterations is
less than 5,000, the test does not trigger the time-out condition.
Also, if a loop threshold is over 5,000, there is a lower chance
of running out of gas as most contracts do not require that
many iterations in one loop. The algorithm for this part is
shown in Algorithm 2.
4) Optimizer: The last part is the Optimizer. It has two
primary purposes. First, if the lower bound reaches 5,000 or
the value reported by the Estimator is over 5,000, it estimates
the loop’s threshold based on the original gas, gas consumed
by the first iteration, gas consumed by 5,000 iterations, and
the remaining gas. Secondly, to test a value in the Threshold
Calculator, the system needs to run the contract with the target
value, wait for the result, and then run the contract with
either value + 1 or value - 1. Since each execution
takes a few seconds, running the contract twice each time
may take a while. Therefore, the Optimizer makes two extra
copies of the generated files and simultaneously runs the three
contracts with three consecutive numbers (value, value +
1, value - 1). Then, based on the feedback fit receives, it
decides to use the correct extra feedback. This way, the run-
time gets reduced by almost 50%.
Algorithm 2: Run-time threshold of a loop
1 guess = estimated value by static and run-time analysis ;
2 lower = 0;
3 upper = 5, 000;
4 while conditional expression do
5 gas left =deploy the contract(guess);
6 if gas left < 0 then
7 new gas left = deploy the contract(guess − 1) ;
8 if new gas left < 0 then
9 upper = guess − 1;
10 else
11 threshold = guess − 1;
12 return threshold;
13 end
14 else
15 new gas left = deploy the contract(guess + 1) ;
16 if new gas left > 0 then
17 lower = guess + 1;
18 else
19 threshold = guess + 1;
20 return threshold;
21 end
22 end
23 guess = upper + lower/2 ;
24 end
1 function hasCardExpired(uint[] calldata
marketAddresses, uint numberOfTokens) public
returns (bool) {
2 bool _expired = false;
3 for (uint i = 0; i < marketAddresses.length; i++) {
4 IRealityCards rc = IRealityCards(marketAddresses
[i]);
5 for (uint j = 0; j < numberOfTokens; j++) {
6 if (rc.cOwnerLeftDeposit(j) == 0 && rc.
ownerOf(j) != address(rc)) {
7 _expired = true;
8 }
9 }
10 }
11 return _expired;
12 }
Fig. 5. The Original Code Containing a Nested Loop
5) Threshold of the Nested Loops: The process for nested
loops is slightly different. These loops and their order are
identified by the Target Block Detector. Then the Correction
Phasefinds the threshold for the most inner loop and works its
way back to the most outer loop. In order to find the threshold
for the inner loops, the loop bounds for the outer loops are set
to one, and the threshold for the target loops is found using
the method mentioned before. The loop bound for the inner
loop is set to zero, and the outer loop threshold is found. The
output report contains a formula based on the threshold values
of the outer and inner loops. The code snippets in Figure 5,
6 and 7 demonstrate how a contract with nested loops are
modified. The first code snippet shows the original function
containing a nested loop. The second and third code snippets
show the changes in the code in order to obtain the threshold
for the inner and outer loops respectively.
6) Output of the Correction Phase: The output contains the
signature of the functions containing loops and the number

---

1 function hasCardExpired(uint[] calldata
marketAddresses, uint numberOfTokens) public
returns (bool) {
2 bool _expired = false;
3 uint outerLoopCounter = 0;
4 for (uint i = 0; outerLoopCounter < 1; i++) {
5 IRealityCards rc = IRealityCards(marketAddresses
[i]);
6 uint loopCounter = 0;
7 for (uint j = 0; loopCounter < VALUE; j++) {
8 if (rc.cOwnerLeftDeposit(j) == 0 && rc.
ownerOf(j) != address(rc)) {
9 _expired = true;
10 }
11 loopCounter = loopCounter + 1;
12 }
13 outerLoopCounter = outerLoopCounter + 1;
14 }
15 return _expired;
16 }
Fig. 6. The Modified Code for the Threshold of the Inner Loop
1 function hasCardExpired(uint[] calldata
marketAddresses, uint numberOfTokens) public
returns (bool) {
2 bool _expired = false;
3 uint outerLoopCounter = 0;
4 for (uint i = 0; outerLoopCounter < VALUE; i++) {
5 IRealityCards rc = IRealityCards(marketAddresses
[i]);
6 for (uint j = 0; 1 == 0; j++) {
7 if (rc.cOwnerLeftDeposit(j) == 0 && rc.
ownerOf(j) != address(rc)) {
8 _expired = true;
9 }
10 }
11 outerLoopCounter = outerLoopCounter + 1;
12 }
13 return _expired;
14 }
Fig. 7. The Modified Code for the Threshold of the Outer Loop
of loops in them. It also has the variables affecting the loop
bounds and their datatype. It provides the type of the loop
(Normal/Single or Nested). Then, it provides the value of the
threshold found by the tool for the provided gas limit along
with the gas consumption of the first iteration and the average
gas consumption for the other iterations. An example of the
output of the Correction Phase is provided in Figure 8. In this
example, the size of the input variable ”receivers” is the bound
of the loop, the ”require” statement looks like this:
require(receivers.length < (gasleft() − 47420)/(5932),
”Loop bound is over the threshold!” );
In this case, if the user inputs an array of size greater than
899, the ”require” statement gets triggered, and the execution
stops before entering the loop. Finally, the threshold formula
is given in the following format:
(gaslef t() − gas 1)/(gas 2).
If there are nested loops in the contract, the formula is
slightly different. The formula for the inner loops is similar to
the ones above, but it considers the outer loop has only one
iteration, and for the outer loops is similar to the following:
(gaslef t() − gas 1)/(gas 2 + Internal).
Where gasleft() is the value returned by the function
gasleft() placed right before the loop in the source code,
gas_1 is the gas consumption of the first iteration of the loop,
gas_2 is the average gas consumption of the other iterations,
and Internal is the gas consumption of the internal loops.
This formula can be used in a require statement to
prevent Out-of-Gas exceptions for that loop. The statement
has to be placed in the source code right before the loop. The
user has to find the loop bound and place it in the require
statement. So, an example of the require statement looks
like this:
require( loopBound < (gasleft() −
gas_1)/(gas_2), "Over the limit")
Adding appropriate require statements can be a simple fix
to many contracts containing user-controlled loops. However,
this might not be the case when the contract uses poor
implementation patterns. These require statements help the
callers save some gas (by hitting the require statement
rather than the block gas limit). Unfortunately, if the contract
relies upon some user-controlled loops in order to function
properly, other correction approaches are required, or the funds
are still likely going to be locked. However, the loop bound
information output by our tool can be very useful for the
developers to come up with other solutions.
IV. EXPERIMENTAL EVALUATION
A. Real-world Smart Contract Benchmark
We gathered a benchmark of 1,000 real-world Solidity smart
contracts containing over 60,000 functions from Etherscan
5
.
All contacts are gathered starting from the latest block at the
time (Block Height: 11661369) and going backward in the
chain. Each contract has 413 lines of code, 63 functions, 4
functions with loops, and 5 loops on average. These contracts
were manually checked to ensure that each contained at least
one loop. Also, information such as the number of functions,
loops, and lines of code was manually collected. Hence, these
values are used as the ground truth. Gas Gauge and the
benchmark are available at https://gasgauge.github.io/ . The
name of each contract file in the benchmark represents the
contract address.
B. Experimental Setup
We ran our experiments on a machine that was equipped
with 8GB of RAM, a 4-core Intel Xeon 2.2 GHz processor
with Ubuntu 18.04 running. To test Gas Gauge, the latest ver-
sion (on January 2021) of nodejs, Ethereum, truffle, ganache-
cli, solc-select, python3, and Slither were installed. We de-
ployed the target smart contract to a test chain using Ganache-
cli. Since Gas Gauge does not make any modifications to
Truffle and Ganache-cli in its implementation, future versions
of these tools are still compatible with Gas Gauge. In all
these experiments, Solc compiler version 0.5.3 was used unless
either the tool or the contract required a different version. Also,
5
https://etherscan.io

---

Fig. 8. Output of Correction Phase
TABLE I
DETECTION PHASE COMPARISON ON 1,000 SMART CONTRACTS WITH LOOPS.
Tool Name Method 
Number of Contracts
Successfully Scanned
False Negative
Rate(%)
Average
Run-time (s)
Gas Gauge Static + Dynamic Analysis 997 0 10
GASTAP/Gasol Static Analysis 120 36 -
Madmax Static analysis 921 79 -
MPro 
Static Analysis +
Symbolic Execution 
851 100 242
Mythril Symbolic Execution 870 100 3109
Securify 2.0 Static Analysis 548 47 176
Slither Static Analysis 997 85 2.6
SmartCheck Static Analysis 1000 47 2
the block gas limit was so kept to the default value in Ganache-
cli (6,721,975). The Solc compiler version and the block gas
limit can be configured easily in the tool.
C. Competing Tools
The following seven tools were chosen to compare
against Gas Gauge: GASTAP [8]/Gasol [7], Madmax [3],
MPro [9], Mythril [10], Securify 2.0 [11], Slither [12], and
SmartCheck [13]. MPro, Mythril, Securify 2.0, Slither, and
SmartCheck were installed using the instruction provided on
their official documentation. A combination of GASTAP and
Gasol, which is available on a web interface 
6 
was used.
This interface was called using a script to scan our bench-
mark. MadMax is built into Contract Library
7
. Therefore, we
searched for our benchmark in Contract Library and collected
the reports generated by MadMax. Thus, in our analysis,
MadMax and GASTAP/Gasol do not have a run-time value
associated with their effectiveness results.
D. The Evaluation of the Detection Phase
This experiment aims to determine how accurate and ef-
ficient the Gas Gauge and the above-mentioned seven com-
peting tools are at detecting potential loops for Out-of-Gas
DoS vulnerabilities. All results are summarized in Table I.
6
https://costa.fdi.ucm.es/gastap
7
https://contract-library.com
The time-out limit for this experiment was set to 3 hours per
contract for each tool. As can be seen, Gas Gauge was able to
detect all the vulnerable loops in the contracts that it was able
to scan. There were three contracts that Slither could not scan,
and since the report generated by Slither is an essential part
of our methods, our tool was not successful in checking them
as well. Typically, a tool may not scan a contract for various
reasons, like reaching the time-out and lacking support for
the Pragma version. The false negative rate is calculated as
the number of loops detected by the tool divided by the total
number of loops in the contracts that the tool could scan. As
mentioned before, the number of loops in each contract was
manually collected and hence used as the ground truth. Also,
we tested all tools on a benchmark of 1,000 contracts without
loops, and they all had zero false positive rates. Hence, it is
not listed in the table.
One can only obtain the reports of MadMax if a contract
exists in Contract Library. Thus, ”Number of Contracts Suc-
cessfully Scanned” shows the number of contracts available on
Contract Library. Thus, if a contract does not exist there, it is
not necessarily a shortcoming of the tool. However, Madmax
was not able to find Out-of-GasDoS vulnerabilities in the
Majority of the contracts, although it is one of the industry-
standard tools for gas-related vulnerabilities. Also, although
GASTAP/Gasol has the lowest false negative rate amongst the
competitors, they have a low scan rate of around 12%. The

---

Fig. 9. Effect of the Number of Functions on the Run-time
Fig. 10. Effect of the Number of Loops and Line of Code on the Run-time
Fig. 11. Effect of the Complexity Score on the Run-time

---

reason is that the Solidity compiler used by GASTAP/Gasol
does not support a majority of the contracts in our bench-
mark or the generated report did not contain any meaningful
information.
Gas Gauge has 0 false positive and false negative rates
for the contracts supported by the tool and is efficient in
scanning contracts (on average, about 10 seconds per contract).
By contrast, all the other tools had difficulties detecting such
vulnerabilities. Therefore, Gas Gauge is efficient and effective
at detecting loops in smart contracts as it has an average run-
time of 10 seconds and false negative and false positive rates
of 0%.
E. Performance Analysis of the Detection Phase
In this experiment, we tried to find the main factors affecting
the run-time of the Detection Phase of Gas Gauge. We obtain
the summary of each of the 1,000 contracts containing loops
in our benchmark. This summary contains the total number of
functions, number of functions containing loops, number of
code lines (only source code lines without comments and blank
lines), and number of loops in each contract. We also measured
the run-time for each of the contracts for the Detection Phase.
During this experiment, we concluded that the total number of
functions and functions with loops have some impact on the
run-time. However, these effects are not as noticeable as the
number of loops and lines of code. It appears that the factors
impacting the run-time of Detection Phase in descending (run
time) order are the number of lines of code, number of loops,
number of functions containing loops, and total number of
functions. This is also expected because Detection Phase uses
a static analysis approach as its primary method.
ConsenSys has a tool called Solidity-metrics [20]. This tool
provides Source Code Metrics, Complexity, and Risk profile
reports for projects written in Solidity. One of the factors they
provide is ”Complexity Score”, a custom complexity score
derived from code statements known to introduce code com-
plexity such as branches, loops, calls, and external interfaces.
We obtained this score for each of the contracts and observed
the impact on the run-time. Based on our results, this factor
has a noticeable correlation with the run-time. Therefore, the
main factors in determining the run-time can be summarized
into the ”Complexity Score” of the code. Figures 9, and 10
demonstrate the impact of different factors on the run-time of
the Detection Phase. These factors are the number of lines
of code, number of loops, number of functions containing
loops, and total number of functions. Figure 11 demonstrates
the impact of ”Complexity Score” factor on the run-time of
Detection Phase.
This experiment cannot be done fairly on the other two
phases since they contain run-time analysis. Thus, the time to
deploy and run the contracts has a significant impact on the
overall run-time of the tool. Furthermore, for the Identification
Phase, factors like the search space, the ability of the fuzzer
to find the right set of inputs, and the complexity of the target
functions. Also, for the Correction Phase, the estimated value
reported by the Threshold Estimator, cyclomatic complexity of
the loop, and the actual threshold values are some of the factors
that affect the run-time noticeably and cannot be measured
easily.
F. The Evaluation of the Identification Phase
In this experiment, we evaluated the results of the Iden-
tification Phase. Generally, finding an Out-of-Gas instance
requires a run-time analysis-based technique. To the best of our
knowledge, Gas Gauge is the first tool, and the Identification
Phase is the first method that uses a run-time fuzzing technique
to detect gas-related vulnerabilities and automatically identify
Out-of-Gas instances. As a result, we did not find a direct
competitor to compare the results of the Identification Phase.
Therefore, we manually checked each contract to obtain the
number of functions satisfying the condition of the fuzzer and
the input variables affecting the loops. Only 979 functions in
501 contracts met these criteria. Then, we ran our tool on
the benchmark and obtained the results. Lastly, we verified
the results manually. The fuzzer detected 968 functions in
499 contracts and identified their variables correctly in 53
seconds per contract on average. Two of the contracts were
not scanned by Slither, so the fuzzer was not able to identify
11 functions. The fuzzer identified 614 instances of Out-of-
Gas in 331 contracts. Although the fuzzer detected the rest,
it could not find an Out-of-Gas instance in them for various
reasons, like reaching the maximum number of tries (it was set
to 10, but it is customizable), the function contained structs,
or the code reverted. However, even when the fuzzer could not
find an out of the gas instance, it still provided the function
signatures with loops and variables affecting the loop bounds.
Overall, the Identification Phase identified all the satisfying
functions that it could scan. It also was able to identify 614
instances of Out-of-Gas in 331 contracts.
G. Evaluation of the Methods for the Identification Phase
Three methods were considered when designing the white-
box fuzzer. The first approach was a random bit flip, as
described before. The second one was a random byte flip,
which flips every bit in the byte starting from the randomly
chosen bit. Lastly, a random byte shuffle was tested. In this
approach, the fuzzer chooses a random bit to flip, and then all
the bits in the byte starting from the chosen bit get randomly
shuffled. During this experiment, we obtained the following
results:
1) Because our implementation finds the exact functions
and variables to fuzz, in most cases, all three methods
can find the desired output within the first two tries.
These are simple cases when one input variable is the
loop bound, so the fuzzer has a high chance of finding
the correct value for the value.
2) In some cases, when the bound is more complex, the
fuzzer takes about 3 or 4 tries to find a correct set of
inputs using any of the approaches. An example of this
is when the difference between the values of two of the
inputs is the loop bound.

---

Fig. 12. A Comparison of Different Methods for the White-box Fuzzer
3) There are also some cases that the fuzzer needs to try
more numbers. An example of this is when ”input mod
250” is the loop bound, and any number of loop itera-
tions more than 240 triggers the Out-of-Gas condition.
These contracts were the determining factors, and as
shown, bit flip outperformed the other two methods.
Hence, the bit flip approach was chosen in our design.
Figure 12 shows a chart comparing the three methods
on a benchmark of 28 contracts containing a total of 31
functions with loops. We tested each method ten times on
each function and recorded the average number of tries for
each method until finding a set of inputs that causes the Out-
of-Gas exception. The number of tries means the number of
different combinations of inputs before finding a satisfying set.
This number was bounded to fifty in our experiments in order
to halt the process promptly.
H. The Evaluation of the Correction Phase
In this experiment, we evaluated the results of the Correction
Phase. Our benchmark has 4415 loops. Gas Gauge was able
to find the thresholds for 932 loops in 467 contracts. 779 of
these thresholds were calculated using run-time verification
with a high rate of accuracy, and 153 of these thresholds
were estimated with 95% accuracy. A threshold is estimated
if it is greater than 5,000 or for any reason, the run-time
verification is not able to find the correct number. The average
run-time for each loop was about 389 seconds, which is much
faster than manual processing. To the best of our knowledge,
Gas Gauge is the first tool ever attempted to find the loop
upper bound limits in a smart contract. The closest tool to our
work is GASTAP/Gasol. However, based on our experiments,
the provided web interface does not support most of the
contracts in our benchmark. Meanwhile, manually finding the
thresholds is a tedious process. Therefore, to get an idea of the
accuracy, we randomly picked 10 of the contracts and found
the thresholds of their loops manually. Then, we compared the
manual results with the ones generated by Gas Gauge. Based
on our results, the calculated threshold is about 2% lower than
the actual threshold. We expect the calculated thresholds to
be within 5% of the actual values and usually lower than the
actual values since our modifications introduce an insignificant
extra gas usage.
V. LIMITATIONS OF GAS GAUGE
If the Slither tool is not able to scan a contract or does
not identify loops or data dependencies, then all three phases
of Gas Gauge miss important information that lowers its
accuracy. Also, the time limit and compilation problems of
Truffle Suite may cause our tool not to operate properly.
Functions containing structs or multi-dimensional arrays are
not supported by the Correction Phase and Identification
Phase ˙A struct is just a custom type that can be defined within
a contract, and because it is different in each contract, it can
be very challenging to automate the test generation for such a
construct. However, they are supported in the Detection Phase,
which is the phase that competes with other tools. Moreover,
the contracts should be self-contained and written in Solidity
to be used by Gas Gauge. Thus, contracts with external calls to
other contracts or written in other languages are not supported.

---

VI. CASE STUDY
We performed a case study to evaluate Gas Gauge in
real-world applications. Quantstamp [21] is a leading veri-
fication company that evaluates smart contract projects for
security-related issues and code quality. We collected the
Quantstamp contract security certification of Airswap
8
, a peer-
to-peer trading network for Ethereum, to identify gas-related
vulnerabilities in this project. Airswap is used for trading the
USD equivalent of about 9200 ETH/week (over 20 million
USD/week with current ETH value). Loop concerns due to
gas usage have been reported in two contracts, Swap.sol,
and Index.sol. Gas Gauge was able to identify one vul-
nerable function in Swap.sol and two vulnerable functions
in Index.sol. Gas Gauge detected the loop and variables
affecting the loop bound in Swap.sol. Although it did not
find the threshold of the loop since the constructor of that
contract takes a struct as an input, it detected the loops and
variables affecting the loop bounds of Index.sol. For the
two other functions, it found the threshold of the loop as
well. The threshold of one of these loops was over 5,000,
so Gas Gauge estimated the threshold based on the average
gas consumption of a few iterations.
Usually, to find the loop threshold values, one needs to audit
the contracts to find potentially vulnerable code blocks. The
next step is to examine these code blocks to understand what
variables affect the loop bounds. Once all the information
is gathered, a gas analysis needs to be performed. The gas
analysis consists of making required files for tools like Truffle
Suite to test a contract with different test cases to find the
threshold for each loop
9
. This process is tedious and requires
many man-hours (estimated to be around 4 hours per contract)
of work by the developers. However, Gas Gauge took about 10
minutes to find the vulnerable functions and loop thresholds.
Also, Gas Gaugeis automatic and requires limited resources
and supervision. This case study shows that Gas Gaugeis
practical and can be used to save hours of manual work.
VII. RELATED WORK
Many smart contract verification tools scan a contract for
multiple security vulnerabilities. Some of the most well-known
tools are Manticore [22], MPro [9], Mythril [10], Securify [23]
(deprecated), Securify 2.0 [11], Slither [12], SmartCheck [13],
Verx [24], and Zeus [25]. Although these tools can detect
multiple security vulnerabilities, most of them either cannot
identify gas-related vulnerabilities or their results are not
reliable due to their high false negative rate (See Table I).
Fuzzing tools like ContractFuzzer [26], Echidna [27], and
Harvey [28] do not discover gas-related vulnerabilities, to
the best of our knowledge. Meanwhile, some research has
focused on gas-related vulnerabilities. GASTAP [8] derives
gas upper bounds for all public functions of smart contracts via
inferring size relations, generating gas equations, and solving
these equations. Madmax [3] uses a static program analysis
8
Available at https://certificate.quantstamp.com/full/airswap
9
The process can be found at here and here
technique to detect gas-focused vulnerabilities automatically.
However, most of these tools cannot detect gas-related DoS
vulnerabilities directly, or they do not provide any information
to fix the problem.
Gas Gauge can find all the loops in a contract reliably and
quickly. Also, it identifies the exact functions and variables
and provides an Out-of-Gas instance that helps developers
investigate the problem further. Finally, to the best of our
knowledge, Gas Gauge is the only tool that accurately and
reliably finds the threshold values and provides more useful
information like each loop’s type and the variables affecting it.
This information is helpful in order to repairing the code and
preventing gas-based attacks like DoS with Block Gas Limit.
VIII. CONCLUSIONS AND FUTURE WORK
Because smart contracts contain monetary transactions, it is
crucial to make sure they are risk-free. This paper summarizes
the design and implementation of Gas Gauge, an automatic
tool that helps developers and contract owners identify DoS
with Block Gas Limit vulnerability and repair their code.
This tool contains three powerful sections. These sections use
static analysis, run-time verification and white-box fuzzing to
detect all the contract loops, provide an instance of out-of-
gas and determine when the transaction starts to go out of
gas. Finally, our experimental evaluation results on 1,000 real-
world Solidity smart contracts show that all the methods are
accurate and efficient. Gas Gauge only supports self-contained
contracts, so contracts with external calls to other contracts
are not supported. As a part of future work, the Mainnet
forking will be used to include external contracts without
source code. Also, The current implementation only supports
contracts written in Solidity. As an improvement, we plan
to extend our tool so that it can support more programming
languages like Vyper and Rust. Furthermore, the fuzzer can
be improved so it can identify the private functions containing
loops and fuzz the public functions that call those private ones.
REFERENCES
[1] K. Ziechmann, “Introduction to smart contracts,” 2021. [Online].
Available: https://ethereum.org/en/developers/docs/smart-contracts/
[2] minimalsm, “Gas and fees.” [Online]. Available: https://ethereum.org/
en/developers/docs/gas/
[3] N. Grech, M. Kong, A. Jurisevic, L. Brent, B. Scholz, and
Y. Smaragdakis, “Madmax: surviving out-of-gas conditions in ethereum
smart contracts,” Proceedings of the ACM on Programming Languages,
vol. 2, no. OOPSLA, p. 1–27, 2018. [Online]. Available: https:
//dl.acm.org/doi/10.1145/3276486
[4] ConsenSys Software Inc., “Metamask,” 2021. [Online]. Available:
https://metamask.io/
[5] “If metamask gas calculations are nearly perfect why do we
still get out of gas error?” 2018. [Online]. Available: https:
//ethereum.stackexchange.com/questions/56287
[6] F. Calderon, “Why did my transaction fail with an out of
gas error? how can i fix it?” 2021. [Online]. Available: https:
//metamask.zendesk.com/hc/en-us/articles/360038849792/
[7] E. Albert, J. Correas, P. Gordillo, G. Rom´an-D´ıez, and A. Rubio, “Gasol:
Gas analysis and optimization for ethereum smart contracts,” 2019.
[8] E. Albert, P. Gordillo, A. Rubio, and I. Sergey, “Running on
fumes–preventing out-of-gas vulnerabilities in ethereum smart contracts
using static resource analysis,” Aug 2019. [Online]. Available:
https://arxiv.org/abs/1811.10403

---

[9] W. Zhang, S. Banescu, L. Pasos, S. Stewart, and V. Ganesh, “Mpro:
Combining static and symbolic analysis for scalable testing of smart
contract,” in 2019 IEEE 30th International Symposium on Software
Reliability Engineering (ISSRE). Berlin: IEEE, 2019, pp. 456–462.
[10] ConsenSys Software Inc., “Mythril,” 2021. [Online]. Available:
https://github.com/ConsenSys/mythril
[11] P. Tsankov, A. Dan, D. Drachsler-Cohen, A. Gervais, F. B¨unzli,
and M. Vechev, “Securify v2.0,” 2021. [Online]. Available: https:
//github.com/eth-sri/securify2
[12] J. Feist, G. Grieco, and A. Groce, “Slither: A static analysis
framework for smart contracts,” 2019 IEEE/ACM 2nd International
Workshop on Emerging Trends in Software Engineering for Blockchain
(WETSEB), vol. ””, no. ””, p. ””, 2019. [Online]. Available:
https://arxiv.org/abs/1908.09878
[13] S. Tikhomirov, E. Voskresenskaya, I. Ivanitskiy, R. Takhaviev,
E. Marchenko, and Y. Alexandrov, “Smartcheck: Static analysis of
ethereum smart contracts,” in 2018 IEEE/ACM 1st International Work-
shop on Emerging Trends in Software Engineering for Blockchain
(WETSEB). ”Gothenburg”: IEEE, 2018, pp. 9–16.
[14] Ethereum, “Solidity,” 2021. [Online]. Available: https://docs.
soliditylang.org/
[15] OpenZeppelin, “Deploying smart contracts using create2,”
2018. [Online]. Available: https://docs.openzeppelin.com/cli/2.8/
deploying-with-create2
[16] ConsenSys Software Inc., “Sweet tools for smart contracts,” 2021.
[Online]. Available: https://www.trufflesuite.com/
[17] P. Godefroid, M. Y. Levin, and D. Molnar, “Sage: Whitebox fuzzing
for security testing,” Queue, vol. 10, no. 1, p. 20–27, 2012. [Online].
Available: https://queue.acm.org/detail.cfm?id=2094081
[18] SmartContractSecurity, “Swc registry smart contract weakness
classification and test cases,” ””. [Online]. Available: https:
//swcregistry.io/docs/SWC-128
[19] A. C. Ca˜nada, “How not to run out of gas in
ethereum,” 2019. [Online]. Available: https://hackernoon.com/
how-much-can-i-do-in-a-block-163q3xp2
[20] ConsenSys Software Inc., “solidity-metrics,” 2021. [Online]. Available:
https://github.com/ConsenSys/solidity-metrics
[21] Quantstamp Inc., “Quantstamp certifications.” [Online]. Available:
https://certificate.quantstamp.com
[22] M. Mossberg, F. Manzano, E. Hennenfent, A. Groce, G. Grieco, J. Feist,
T. Brunson, and A. Dinaburg, “Manticore: A user-friendly symbolic
execution framework for binaries and smart contracts,” in 2019 34th
IEEE/ACM International Conference on Automated Software Engineer-
ing (ASE). California: IEEE, 2019, pp. 1186–1189.
[23] P. Tsankov, A. Dan, D. Drachsler-Cohen, A. Gervais, F. B¨unzli, and
M. Vechev, “Securify: Practical security analysis of smart contracts,”
Proceedings of the 2018 ACM SIGSAC Conference on Computer
and Communications Security, vol. ””, no. ””, p. ””, 2018. [Online].
Available: https://dl.acm.org/doi/10.1145/3243734.3243780
[24] A. Permenev, D. Dimitrov, P. Tsankov, D. Drachsler-Cohen, and
M. Vechev, “Verx: Safety verification of smart contracts,” in 2020 IEEE
Symposium on Security and Privacy (SP). California: IEEE, 2020, pp.
1661–1677.
[25] S. Kalra, S. Goel, M. Dhawan, and S. Sharma, “Zeus: Analyzing safety
of smart contracts,” Proceedings 2018 Network and Distributed System
Security Symposium, vol. ””, no. ””, p. ””, 2018.
[26] B. Jiang, Y. Liu, and W. K. Chan, “Contractfuzzer: fuzzing
smart contracts for vulnerability detection,” Proceedings of the
33rd ACM/IEEE International Conference on Automated Software
Engineering, vol. ””, no. ””, p. ””, Sep 2018. [Online]. Available:
http://dx.doi.org/10.1145/3238147.3238177
[27] G. Grieco, W. Song, A. Cygan, J. Feist, and A. Groce, “Echidna:
effective, usable, and fast fuzzing for smart contracts,” Proceedings of
the 29th ACM SIGSOFT International Symposium on Software Testing
and Analysis, vol. ””, no. ””, p. ””, 2020.
[28] V. W¨ustholz and M. Christakis, “Harvey: a greybox fuzzer for smart
contracts,” Proceedings of the 28th ACM Joint Meeting on European
Software Engineering Conference and Symposium on the Foundations
of Software Engineering, vol. ””, no. ””, p. ””, 2020.