# ADF-GA: Data Flow Criterion Based Test Case
# Generation for Ethereum Smart Contracts
Pengcheng Zhang
College of Computer and Information
Hohai University
Nanjing, China
pchzhang@hhu.edu.cn
Jianan Yu
College of Computer and Information
Hohai University
Nanjing, China
yu poppy@qq.com
Shunhui Ji
College of Computer and Information
Hohai University
Nanjing, China
shunhuiji@hhu.edu.cn
Abstract—Testing is an important technique to improve the
quality of Ethereum smart contract programs. However, current
work on testing smart contract only focus on static problems
of smart contract programs. A data flow oriented test case
generation approach for dynamic testing of smart contract
programs is still missing. To address this problem, this paper
proposes a novel test case generation approach, called ADF-GA
(All-uses Data Flow criterion based test case generation using
Genetic Algorithm), for Solidity based Ethereum smart contract
programs. ADF-GA aims to efficiently generate a valid set of
test cases via three stages. First, the corresponding program
control flow graph is constructed from the source codes. Second,
the generated control flow graph is analyzed to obtain the
variable information in the Solidity programs, locate the require
statements, and also get the definition-use pairs to be tested.
Finally, a genetic algorithm is used to generate test cases, in
which an improved fitness function is proposed to calculate the
definition-use pairs coverage of each test case with program
instrumentation. Experimental studies are performed on several
representative Solidity programs. The results show that ADF-GA
can effectively generate test cases, achieve better coverage, and
reduce the number of iterations in genetic algorithm.
Index Terms—blockchain, smart contract, Solidity, test case
generation, genetic algorithm, fitness function
I. INTRODUCTION
Blockchain technology is a groundbreaking technology that
truly realizes decentralization [1]. Ethereum, as one of the
mainstream blockchain platforms, attracts a large number of
developers and researchers because of its simplicity, conve-
nience and openness to all uses [2]. Solidity is a main pro-
gramming language for writing smart contracts on Ethereum,
derived from JavaScript, Python, and C++ [3]. Recently,
it is frequent to find serious security vulnerabilities caused
by insecure programming in smart contracts, which cause
significant losses. For example, the re-entrancy vulnerability
in the DAO [4] led to the loss of $50 million worth of Ethers
at that time. In addition, due to the special characteristics
of blockchain, smart contracts cannot be modified once de-
ployed. Therefore, it is critical to ensure the security and
function completeness of a smart contract program before it
is deployed. Nevertheless, it needs to constantly improve the
sufficient testing of Solidity smart contracts, considering the
impact of its execution environment and its characteristics on
the execution of the smart contract.
In recent years, more and more researchers adopt different
methods to develop different tools and make contributions to
smart contracts security testing [5]–[9]. Static analysis and
testing is still the main idea of most of these approaches or
tools [5], [6] due to the limitations of the blockchain environ-
ment. These approaches or tools analyze and detect the bugs
or problems in smart contract codes according to the known
or predefined error types, and then give the detection results
by matching the existing vulnerability one by one. They may
also statically reason about a program path-by-path through
symbolic execution [5]. Other approaches apply a fuzzy test
to detect specific vulnerabilities in smart contracts [7]–[9].
While these approaches make some progress on smart contract
testing, the state-of-the-art testing generation approaches for
smart contracts still suffer the following two main limitations:
• The research on dynamic testing of smart contracts is still
insufficient. The existing researches mainly detect known
vulnerabilities in contracts in static ways. Unexpected
errors that may happen during program execution can not
be tested by static approaches. Consequently, a dynamic
data flow oriented testing approach for smart contract
programs is necessary.
• Existing test case generation approaches are only de-
signed for traditional development languages, such as
Java and C#. Some of them are mature, but cannot deal
with the specific features of Solidity smart contracts, such
as the require statements.
To address the aforementioned limitations, we propose a
novel all-uses data flow criterion based test case generation
approach for Solidity smart contracts, called ADF-GA (All-
uses Data Flow criterion based test case generation using
Genetic Algorithm), which means that every dup (definition-
use pair) [11] needs to be covered in the testing. The key
ideas of ADF-GA are described as follows: 1) The CFG
(control flow graph) of a smart contract is constructed as an
intermediate representation for the source codes to extract the
internal information of the contract. 2) Data flow analysis is
performed to obtain the information of variables and the dups
to be tested. 3) By constructing a reasonable chromosome
coding structure, we apply GA (genetic algorithm) [12] to
optimize the generation of test cases for smart contracts, in
## arXiv:2003.00257v1 [cs.SE] 29 Feb 2020

---

which an improved fitness function for calculating individual
fitness value to guide population evolution, which makes ADF-
GA effectively generate test cases that satisfy the criterion.
In summary, the main contributions of this paper are de-
scribed as follows:
• To the best of our knowledge, data flow criterion based
test case generation for dynamic testing of smart contracts
is proposed for the first time, which can effectively
test data information during the execution of the smart
contracts.
• An improved fitness function is proposed to emphasize
the coverage of the require statements related dups by
setting a weighted parameter, which helps to perform
better selection operation of individuals in GA.
• Finally, based on several representative Solidity programs,
we design a set of comparative experiments to compare
ADF-GA with two other approaches. The experimental
results show the effectiveness and efficiency of ADF-GA.
The structure of the paper is organized as follows: Section II
surveys state-of-the-art smart contract testing approaches and
discusses their limitations. Section III introduces the pre-
liminary knowledge. Section IV presents the details of our
approach. Section V performs the experimental studies based
on several data sets. Section VI concludes the paper and plans
our future work.
II. RELATED WORK
A. Smart Contracts Vulnerability Detection and Testing
Existing approaches and tools can be summarized into two
main categories in terms of testing technology: static analysis
based vulnerability detection [5], [6] and fuzzy test-based
vulnerability detection [7]–[9].
Static analysis approaches and tools have many different
implementations, including static code analysis, symbol exe-
cution, and etc. Static analysis can be effective in detecting
program vulnerabilities, especially for coding errors and some
known error types. Luu et al. [5] proposed an approach
based on symbolic execution and built a tool to find potential
security bugs. This approach is the first work to use CFG of
smart contracts for information extraction. Tsankov et al. [6]
presented another tool to analyze a smart contract program
according to the predefined security patterns by transforming
the EVM (Ethereum Virtual Machine) bytecode provided
as the input into a stackless representation in static-single
assignment form and then the corresponding semantic facts
are inferred. Tikhomirov et al. [13] provided a comprehensive
classification of code issues in Solidity and implemented an
extensible static analysis tool to detect them.
Fuzzy test-based approaches are used to generates fuzzing
inputs to detect vulnerabilities. Liu et al. [7] presented an
analyzer for re-entrancy bugs detection. The tool firstly con-
verts the smart contract to C++ using an intermediate rep-
resentation; and then fuzzes the C++. Finally, a bug report
is given. This analyzer only addresses the re-entrancy attack.
Besides, Liu et al. [8], [9] proposed a more perfect fuzzy
Fig. 1. Sample program: function add
test approach, which is used for fuzzy testing of seven types
of vulnerabilities. The approach generates based on the ABI
(Application Binary Interface) specifications of the Solidity
smart contracts and detect vulnerabilities based on defined
test oracles. The approach has a high detection accuracy for
predefined vulnerabilities.
However, existing testing approaches are based on already
defined vulnerabilities. Furthermore, they mainly use static
analysis techniques and do not consider dynamic executions
of smart contracts.
B. Data Flow Criterion Based Test Case Generation
Dynamic test detects bugs through the program execution
and the analysis of the program running results, common test
methods including logical test, path test, data flow test. Among
them, data flow test focus on the interaction of data flow in
a program, some studies show that test cases generated based
on data flow criteria are better [14].
Rapps et al. [15] extended and defined the concept of data
flow analysis and proposed different data flow criteria. On this
basis, Pande et al. [16] implemented data flow analysis for C
for test case generation. Harrold et al. [17] extended data flow
analysis to object-oriented programs and put forward object-
oriented programs test based on data flow criterion. Nayak
et al. [18] applied the particle swarm optimization algorithm
to implement data flow testing. Deng et al. [19] proposed to
combine GA with data flow analysis to generate test cases.
Girgis et al. [20] proposed a test case generation method
based on the all-uses strategy and used it to test C# programs.
Vivanti et al. [21] applied the GA to the data flow test of
object-oriented programs and proved the validity of test case
generation methods based on data flow criterion in practice.
Although there are many researches on data flow based test
case generation, they are designed for traditional languages
such as C++ and Java. Due to the unique structure, statements
as well as the use of variables in Solidity, these approaches
cannot be directly used.
III. BACKGROUND
A. Smart contracts in Solidity
Smart contracts are specific programs, which run on
blockchain platforms (e.g., Ethereum). Most Ethereum smart
contracts are written in Solidity, whose programming style is
similar to JavaScript and Python. Smart contracts written in

---

Fig. 2. The main architecture of ADF-GA
Solidity are specifically deployed and run on the Ethereum in
the EVM bytecode format [22].
There are three main structures in smart contract programs:
sequential, selection, and loop structure [22]. Solidity has some
different attributes with traditional development languages.
Fig. 1 shows a function “add” written in Solidity, which can
get the sum of two variables of type uint16. The require
statement is used at line 8 to qualify a program execution
condition, and the program continues execution only if this
require statement condition is satisfied.
In addition, in Solidity, the type of numeric variable is
relatively simple, which can be classified into two types,
unsigned int and signed int, with type identifiers uint and int,
respectively. The length of the variable directly determines
the range of variable expression. The minimum length of the
variable is 8 bits, and the maximum length is 256 bits. For
example, uint8 can represent all natural Numbers between 0
and 2
8 
− 1; int16 can represent all integers between −2
15 
and
2
15 
− 1.
B. Control Flow Graph
Traditionally, the CFG of a program P is a directed graph,
in which each node represents a block of code and each edge
represents the control flow between blocks [23]. In general, the
CFG can be represented by a quaternion G = (N, E, s, e) [10],
where N represents the collection of program statement nodes;
E is the set of directed edges where each edge connecting
two nodes is used to indicate the program statement execution
sequence; s represents the unique entry (start) node in the
CFG; e represents the unique exit (end) node. In addition, there
are three main control structures in CFG: sequence, selection,
and looping structure. Based on the principle and structure of
classical CFG, we realize the construction of CFG that meet
the characteristics of Solidity.
C. Genetic Algorithm
GA [12] is an optimization algorithm for searching the
optimal solution in the problem spaces. In the traditional
research on test case generation, GA is used to realize process
optimization. Many works show that GA has a good effect in
guiding test case generation [11], [19], [25].
In GA, there are three main factors. The first one is the
chromosome, which is a specific representation of the target
solution of GA. Second, a fitness function is necessary to
calculate the fitness value of the individual and the probability
of the individual being selected. In addition, three genetic
operators, including selection [26], crossover and mutation,
are used to generate a new population. The main steps of GA
can be summarized as follows:
1) First-generation population is initialized based on input
variable information.
2) The step is further divided in three sub-steps. First,
the dup coverage of each individual in the current
population is obtained by executing the program after
instrumentation. Second, the fitness value of individuals
in the population is calculated according to the defined
fitness function. Finally, the selection, crossover and
mutation operation are carried out to generate a new
population.
3) Whether GA meet the termination condition is judged.
If the condition meets, the algorithm will output the
population with the maximum fitness value. Otherwise,
the new population is taken as the current population
and return 2).
IV. THE ADF-GA APPROACH
A. Overview of ADF-GA
The ADF-GA generates valid test cases based on the source
codes of smart contracts. The main architecture is shown in
Fig. 2, which contains the following three steps:
Step 1: CFG Construction. This step is used to obtain
the CFG of a smart contract as an intermediate representation
based on source codes.
Step 2: Data Flow Analysis. In this step, the data flow
analysis method is adopted to obtain the test targets and some
input information of GA, including the variable information,
the require statements and dups in the program.

---

Fig. 3. CFG of the sample program in Fig. 1
Step 3: Test Case Generation. In this step, we use GA to
generate test cases, and the application of program instrumen-
tation to obtain the coverage results and an improved fitness
function is also used to calculate individual fitness values.
B. CFG Construction
To realize test case generation based on data flow criteria, a
reasonable CFG should be constructed first. The characteristics
of the CFG are described as follows: 1) It retains the three
constructs of the CFG in the traditional languages: sequence,
selection, and looping structure. 2) We specify that each node
in the CFG represents only a valid statement, not a block.
Based on these, the rules for constructing CFG are:
1) For every function structure in the contract, a sepa-
rate CFG (called sub-CFG) is constructed. The require
statements are processed as selection structure. For the
selection structure generated by a require statement, an
arc is generated and the node of the require statement is
the arc tail. if the condition in the require statement is
true, the next statement node is the arc head. Otherwise,
the end node of the sub-CFG is the arc head.
2) We generate an arc to represent a function call in the
program. The node where the function call occurs is the
arc tail and the start node of the sub-CFG of the called
function is the arc head. We then generate another arc
to represent the return of a function call. The end node
of the sub-CFG of the called function is the arc tail and
the node where the function call occurs is the arc head.
According to the rules mentioned above, the CFG constructed
for the program segment in Fig. 1 is shown in Fig. 3.
C. Data Flow Analysis
For the purpose of obtaining the test targets (the collection
of dups) and the initial input of GA, we perform the following
three phases to achieve a complete data flow analysis.
a) Variable Information Extraction: The main purpose
of this phase is to get the information of variables existing
TABLE I
VARIABLE INFORMATION
Variable Name Variable Type Variable Length
a1 0 16
b1 0 16
a2 0 32
b2 0 32
sum1 0 16
TABLE II
INFORMATION OF REQUIRE STATEMENT
Require Statement Node number
require(a2 + b2 <= 65535); 8
in the program, which includes variable name, variable type
and variable length. Then a list Lv is created based on the
information, where we mark the variable type of uint as 0, the
variable type of int as 1, and the length of the variable is the
length indicated by its type identifier.
For example, the results of variable information extraction
of the code segment shown in Fig. 1 are shown in Table I.
b) Require Statements Recognition: To separately count
require statements related dups, data flow analysis is per-
formed. ADF-GA identifies the require statements. Here we
refer to the dups generated by the use of require statements
and the dups dependent on require statements as require
statement related dups.
For the CFG generated in the previous sub-step, each node
is traversed to obtain the location of the node where a require
statement is located. Table II is the result of require statements
identification in the code segment of Fig. 1.
c) Dup Calculation: To obtain the set of test targets, we
count the number of two types of dups: the first one represents
all dups in the program to be tested (abbreviated as N dup)
and the second one represents require statements related dups
(abbreviated as R dup). First, two lists Lv−d and Lv−u are
initialized respectively for each variable in Lv . Lv−d is used
to store the definition node of the variable and Lv−u is used
to store the use node of the variable. Then, the following two
stages are performed.
The first stage: The generated CFG is traversed in a pre-
order way in Step 1 to calculate N dup. The specific opera-
tions are as follows:
1) The CFG is traversed from the start node. If the current
traversed node contains a definition of a variable var1 in
Lv , the node is added to Lv−d of var1. If the currently
traversed node contains the use of a variable var2 in Lv ,
the node (denoted as use) is added to Lv−u of var2. Then
the definition node of var2 (denoted as def ) is found in
the current path to form a N dup and put it into the set
of test targets, which is represented by (v, def, use).
2) The next path in CFG is iterated until all paths are
traversed and the dups are constructed in the current
traversed path as we performed in 1).

---

TABLE III
STATISTICAL RESULTS OF DUP
Variable Name Def node Use node N dup R dup
a1 1 
2,4 (a1,1,2),(a1,1,4) 
(a1,1,9)
5,9 (a1,1,5),(a1,1,9)
b1 1 
3,4 (b1,1,3),(b1,1,4) 
(b1,1,9)
5,9 (b1,1,5),(b1,1,9)
a2 2 8 (a2,2,8) (a2,2,8)
b2 3 8 (b2,3,8) (b2,3,8)
sum 5,9 – – –
(a) The encoding of variables of type uint
(b) The encoding of variables of type int
Fig. 4. Sample of chromosome encoding
The second stage: Counting R dup. Based on the recogni-
tion result of require statements, R dup is separately counted
based on the aforementioned N dup set. Table III lists the
results corresponding to the CFG in Fig. 3.
D. Test Case Generation Based on Genetic Algorithm
ADF-GA adopts GA to guide test case generation. First,
we set the termination condition as follows: when the fitness
value reaches an optimal value and becomes stable; or the
maximum fitness value appears in the historical population
and is no longer updated with the execution of the algorithm.
Then, we introduce the realization of three factors of GA in
ADF-GA.
a) Chromosome Coding: To avoid the long encoding of
the chromosome due to too many variables contained in the
test case and the length of each variable is large, we proposed
the concept of sub-chromosome based on the principle of
binary coding. One chromosome is a set of sub-chromosomes,
and each sub-chromosome is a binary string of one variable.
The length of the string of each sub-chromosome is the length
of the variable plus 1, where the first bit represents the type of
the variable (0 for uint, 1 for int), and the remaining bits are
the binary representation of the decimal value of the variable.
Thus, a variable of type uint8 with a value of 117 can be
represented as Fig. 4. a; a variable of type int8 with a value
of 117 can be represented as Fig. 4. b.
b) Fitness Function: Fitness function is the key to guide
GA to select good individuals.
The traditional fitness function [20] in the GA is shown
in (1), where M represents the number of dups covered by
the current test case and N represents the total number of
dups in the program counted in the data flow analysis stage.
f iti = 
M
N 
(1)
If the tested smart contract contains require statements and
the generated test cases do not meet the execution conditions
of any of these require statements, the dup covered is limited
and the fitness values of test cases is small. If the majority
of the test cases generated are in this case, the algorithm
will end up with poor coverage. To alleviate this problem
effectively, our approach adjusts the weight of R dup when
fitness function is designed, so as to pay more attention to
the execution of require statements in the process of test case
selection. The fitness function is expressed as (2).
f iti = 
(n − m) + (1 + ε)m
N 
(2)
where N represents the number of N dup contained in the
program, n represents the number of N dup covered by the
current test case, m represents the number of R dup covered
by the current test case, ε is the weighted parameter whose
value is determined by experiment. According to (2), when the
parameter takes a appropriate value, the fitness value of indi-
viduals with more R dup in the population will increase and
the probability of being selected as the parent population will
increase. Meanwhile, an appropriate parameter also guarantees
that those individuals with most N dup coverage still have a
large probability of being selected. Therefore, the population
can be oriented towards achieving the overall better results.
c) Genetic Operators: Using GA to generate a new pop-
ulation based on the current population requires the following
three operations: selection, crossover, mutation.
Selection: Our approach adopts the roulette wheel selection
algorithm [26], whose basic idea is to calculate the probability
of each individual being selected according to the fitness value.
The specific operations are as follows:
1) For the population of size n, the fitness value of each
individual in the population is calculated according to
(2), denoted as fi, i = 1 · · · n. Then the probability of
the individual being selected is further calculated based
on (3), denoted as pi, i = 1 · · · n.
2) The cumulative probability of each individual is calcu-
lated according to (4), denoted as p
′
i
, i = 1 · · · n, where
p
′
1 
= p1, p
′
n 
= 1.
3) A number r is randomly generated between 0 and 1.
The selected individual is determined according to the
numerical value r and the cumulative probability p
′
. If
p
′
i−1 
< r ≤ p
′
i
, the i
th 
individual is selected.
pi = 
fi
∑
n
i=1 
fi
(3)
p
′
i 
=
i
∑
j=0
pj (4)
It can be found from (3) that the greater the fitness value
of the individual, the greater the probability of being selected.

---

Fig. 5. Sample of sub-chromosome crossing
TABLE IV
INFORMATION ABOUT THE CONTRACT PROGRAMS
Program LOC 
Number of Number of Number of
Function N dup R dup
getcenter 47 1 28 0
getsum 55 1 23 0
safe add 22 1 10 4
math op 84 7 102 0
safe buy 88 5 29 12
fundraise 123 4 33 14
math op reqiure 126 7 108 22
operationofarray 155 11 62 25
info manage sys 163 5 74 30
trade 202 10 64 30
geometry 246 9 93 50
Crossover: Uniform crossover is used. The basic operation
is to perform crossover on each sub-chromosome within two
paired individuals and each gene in the two paired sub-
chromosomes is exchanged with equal probability. The details
are described as follows: if the two paired sub-chromosomes
are expressed as X = x1x2 · · · xm and Y = y1y2 · · · ym
respectively. Before the crossover is performed, a binary string
S of the same length as the two sub-chromosomes is generated
randomly, denoted by S = s1s2 · · · sm. According to the
chromosome coding, s1 represents the type of variable, so the
crossover is done bit by bit from s2 to sm. If the value of si is
0, the value of xi and yi are maintained. If it is 1, the value of
the xi and yi is exchanged. Fig. 5 shows a sub-chromosome
crossing process.
Mutation: The goal of the mutation operation is to mutate
one or more of the genes in a chromosome string, which is
expressed as changing the original code of 0 to 1 and the
original code of 1 to 0 in ADF-GA. Specifically, the mutation
probability Pm is set in advance. For each chromosome in
the population, each of its sub-chromosomes is processed one
by one. For each encoding gene on the sub-chromosome, a
random number r between 0 and 1 is generated. When r <
Pm, the mutation operation is performed.
V. EXPERIMENTAL EVALUATION
A. Experimental Setup
a) Experiment Environment: We conduct our experiments
in a computer system with Intel(R) Core(TM) i5-8300H CPU
@2.30GHz, 8.00GBRAM, Windows 10. MATLAB R2016a is
used to build the model for GA, and Remix 0.4.22 is used to
execute the Solidity smart contracts.
b) Solidity programs: We consider the following two
factors when selecting the representative Solidity programs: 1)
the experimental cost caused by the limitation of the smart
contract operating environment; 2) diversity and universal-
ity of the experimental programs. Therefore, we choose the
following 11 smart contracts to validate the effectiveness of
ADF-GA. These contract programs basically contain various
structural statements commonly used in Solidity and have
different code size as well as the numbers of functions and
dups. The specific information of them is shown in Table IV,
where the first column represents the number of valid lines of
code that contain only partial comments; column 4 represents
the number of N dup contained; column 5 represents the
number of R dup contained. These smart contracts are new
programs that have been artificially modified and populated
to perform different functions based on a publicly available
smart contract data set
1 
on GitHub. We have compiled and
run these programs to verify their availability and uploaded
them to GitHub
2
.
c) Comparative Approaches: At present, there is no
other work on the generation of data flow test cases for
smart contracts. Therefore, we first implement ADF-GA and
then based on smart contracts we re-implement other two
representative approaches: random testing approach [27] and
the approach proposed in [20], which originally designed for
C#. In the following, we refer these two approaches as RT and
GA-C#.
B. Experimental Results
a) Parameters: To obtain a better value of parameter ε, we
conduct a set of experiments based on four contracts. Based
on the same first-generation population, we change the value
of parameter ε to perform multiple experiments and determine
the final value of ε by comparing the coverage of test cases
generated at different values of ε to N dup and R dup.
First, we take 0.1 as the step size.Then, we count the number
of N dup and R dup covered by the optimal test cases
generated by ADF-GA at different parameter, respectively. The
experimental results are shown in Fig. 6, in which, (a) shows
the coverage of the N dup when the parameter takes different
values; (b) shows the coverage of the R dup.
It can be seen from Fig. 6. a, when the value of the
parameter is between 0.3 and 0.6, a better N dup coverage
can be achieved. The experimental results in Fig. 6. b also
show that when parameter ε is between 0.3 and 0.6, the test
cases can cover most R dups.
To obtain a more accurate parameter, we set the value
between 0.3 and 0.6 with the step size of 0.05 for another set of
experiments. The parameter ε is 0.3, 0.35, 0.4, 0.45, 0.5, 0.55,
and 0.6, respectively. Fig. 7 show the experimental results. It
is clear that there is a difference in the number of covered dup
(R dup and N dup) at different parameters. Both the number
of covered R dup and the number of covered N dup are the
best when ε is 0.45. Consequently, 0.45 is chosen as the best
experimental parameters.
b) Coverage : To validate whether ADF-GA can achieve
higher coverage of dup, we conduct a set of dedicated exper-
iments on the 11 smart contracts using RT, GA-C# and ADF-
GA, respectively, and compared the experimental results.
1
https://github.com/fictional-tribble-2/not-so-smart-contracts
2
https://github.com/MoiraYjn/test-demo-

---

TABLE V
ITERATIONS IN GENETIC ALGORITHM
Program 
Total iterations 
Iterations when the maximum fitness value Iterations Of ADF-GA
is reached for the first time to achieves the best
ADF-GA GA-C# ADF-GA GA-C# coverage Of GA-C#
getcenter 8 9 2 3 2
getsum 21 21 8 9 8
safe add 7 7 1 1 1
math op 30 29 10 11 10
safe buy 25 20 16 3 2
fundraise 23 14 9 3 2
math op reqiure 23 32 17 25 14
operationofarray 19 28 14 18 12
info manage sys 27 27 19 19 18
trade 32 24 15 18 3
trade 18 31 10 15 10
geometry 21.18 22 11 11.36 7.45
(a)
(b)
Fig. 6. Coverage of N dup and R dup with different parameters-1
Fig. 8 shows a comparison of the coverage of test cases
generated by three approaches. First, compared to RT, it is
obvious that ADF-GA can cover more test targets (dup), This
is because ADF-GA uses genetic algorithm that can effectively
guide test case generation. Furthermore, it can be seen that
for all the tested contract programs, ADF-GA covers more
or the same number of N dup and R dup compared with
GA-C#. The reason is that the fitness function of ADF-GA
can further differentiate two kinds of dups, which makes the
coverage of R dup more sensitive to the generated test cases
and ultimately increases the coverage.
c) Performance: To validate whether ADF-GA can effec-
tively guide the execution of the algorithm, we apply ADF-
GA and GA-C# to perform test case generation and analyze
experimental results by comparing the number of the iterations
in the genetic algorithms.
We respectively count the total iterations in GA, the number
(a)
(b)
Fig. 7. Coverage of N dup and R dup with different parameters-2
of iterations when the maximum fitness value is reached for
the first time during the execution of GA, and the iterations
when ADF-GA achieves the best coverage that GA-C# can
obtain. The results are shown in Table V. First, it can be seen
that ADF-GA has fewer total iterations for some contracts and
for some other contracts GA-C# has fewer total iterations. In
general. we can draw the conclusion that the total number of
iterations in GA in ADF-GA is slightly fewer than that in
GA-C#. In addition, comparing the iterations when the first
maximum fitness value is reached for the first time, ADF-GA
requires slightly fewer iterations than GA-C#, which iterates
11.36 times, while ADF-GA iterates 11 times. Finally, we
record the iterations that ADF-GA needs to achieve the best
coverage of GA-C# and then compare it with the iterations
that GA-C# needs to achieve the best coverage for the first
time. The results show that it takes only 7.45 iterations for

---

(a)
(b)
Fig. 8. Coverage of N dup and R dup with different approaches
ADF-GA. Therefore, we can get the conclusion that ADF-GA
can effectively guide the generation of test cases. In summary,
ADF-GA can effectively generate test cases covering more test
targets.
VI. CONCLUSIONS AND FUTURE WORK
This paper presents a novel approach called ADF-GA for
the all-uses data flow criterion based test case generation of
smart contracts, which uses genetic algorithm to realize the
dynamic test of smart contracts. We compare ADF-GA with
two traditional approaches and the results show that ADF-GA
can generate available test cases more efficiently.
For future work, first, we need to further optimize the
selection and mutation operation to generated test cases.
Second, we will explore better fitness functions to evaluate
the generated test cases. Finally, due to the limitations of the
execution environment of smart contracts, we will try to solve
the constraint of the environment on dynamic testing of smart
contract programs.
ACKNOWLEDGMENT
The work is supported by the National Natural Science
Foundation of China under Grant No. 61702159 and No.
61572171, the Natural Science Foundation of Jiangsu Province
under Grant No. BK20170893 and No. BK20191297.
REFERENCES
[1] M. Crosby, P. Pattanayak, S. Verma, and V. Kalyanaraman, “Blockchain
technology: Beyond bitcoin,” Applied Innovation, vol. 2, no. 6-10, p.
71, 2016.
[2] N. Atzei, M. Bartoletti, and T. Cimoli, “A survey of attacks on ethereum
smart contracts (sok),” International Conference on Principles of Secu-
rity and Trust, pp. 164C186, Springer, 2017.
[3] A. Pinna, S. Ibba, G. Baralla, R. Tonelli, and M. Marchesi, “A massive
analysis of ethereum smart contracts empirical study and code metrics,”
IEEE Access, vol. 7, pp. 78194-78213, 2019.
[4] D.Siegel, “Understanding the Dao attack,” Retrieved June, vol. 13, pp.
2018, 2016.
[5] L. Luu, D.-H. Chu, H. Olickel, P. Saxena, and A. Hobor, “Making smart
contracts smarter,” Proceedings of the 2016 ACM SIGSAC conference
on computer and communications security, pp. 254-269, ACM, 2016.
[6] P. Tsankov, A. Dan, D. Drachsler-Cohen, A. Gervais, F. Buenzli, and
M. Vechev, “Securify: Practical security analysis of smart contracts,”
Proceedings of the 2018 ACM SIGSAC Conference on Computer and
Communications Security, pp. 67-82, ACM, 2018.
[7] C. Liu, H. Liu, Z. Cao, Z. Chen, B. Chen, and B. Roscoe, “Reguard:
finding reentrancy bugs in smart contracts,” Proceedings of the 40th
International Conference on Software Engineering: Companion Pro-
ceeedings, pp. 65-68, ACM, 2018.
[8] W. Chan and B. Jiang, “Fuse: An architecture for smart contract
fuzz testing service,” 2018 25th Asia-Pacific Software Engineering
Conference(APSEC), pp. 707-708, IEEE, 2018.
[9] B. Jiang, Y. Liu, and W. Chan, “Contractfuzzer: Fuzzing smart contracts
for vulnerability detection,” Proceedings of the 33rd ACM/IEEE Inter-
national Conference on Automated Software Engineering, pp. 259-269,
ACM, 2018.
[10] E. J. Weyuker, “More experience with data flow testing,” IEEE Trans-
actions on Software Engineering, vol. 19, no. 9, pp. 912-919, 1993.
[11] S. Rapps and E. J. Weyuker, “Selecting software test data using data
flow information,” IEEE Transactions on Software Engineering, no. 4,
pp. 367-375, 1985.
[12] J. H. and Holland, “Adaptation in natural and artificial systems: an
introductory analysis with applications to biology, control, and artificial
intelligence,” MIT Press, 1992.
[13] S. Tikhomirov, E. Voskresenskaya, I. Ivanitskiy, R. Takhaviev, E.
Marchenko, and Y. Alexandrov, “Smartcheck: Static analysis of
ethereum smart contracts,” 2018 IEEE/ACM 1st International Workshop
on Emerging Trends in Software Engineering for Blockchain (WET-
SEB), pp. 9-16, IEEE, 2018.
[14] A. S. Ghiduk, M. J. Harrold, and M. R. Girgis, “Using genetic algorithms
to aid test-data generation for data-flow coverage,” 14th Asia-Pacific
Software Engineering Conference (APSEC07), pp. 41-48, IEEE, 2007.
[15] S. Rapps and E. J. Weyuker, “Data flow analysis techniques for test data
selection,” Proceedings of the 6th international conference on Software
engineering, pp. 272-278, IEEE Computer Society Press, 1982.
[16] H. D. Pande, W. A. Landi, and B. G. Ryder, “Interprocedural def-use
associations for c systems with single level pointers,” IEEE Transactions
on Software Engineering, vol. 20, no. 5, pp. 385-403, 1994.
[17] M. J. Harrold and G. Rothermel, “Performing data flow testing on
classes,” ACM SIGSOFT Software Engineering Notes, vol. 19, pp. 154-
163, ACM, 1994.
[18] N. Nayak and D. P. Mohapatra, “Automatic test data generation for data
flow testing using particle swarm optimization,” International Confer-
ence on Contemporary Computing, pp. 1-12, Springer, 2010.
[19] M. Deng, R. Chen, and Z. Du, “Automatic test data generation model
by combining dataflow analysis with genetic algorithm,” 2009 Joint
Conferences on Pervasive Computing (JCPC), pp. 429-434, IEEE, 2009.
[20] M. R. Girgis, A. S. Ghiduk, and E. H. Abd-Elkawy, “Automatic gen-
eration of data flow test paths using a genetic algorithm,” International
Journal of Computer Applications, vol. 89, no. 12, pp. 29-36, 2014.
[21] M. Vivanti, A. Mis, A. Gorla, and G. Fraser, “Search-based data-flow
test generation,” 2013 IEEE 24th International Symposium on Software
Reliability Engineering (ISSRE), pp. 370-379, IEEE, 2013.
[22] I. Grishchenko, M. Maffei, and C. Schneidewind, “A semantic frame-
work for the security analysis of ethereum smart contracts,” International
Conference on Principles of Security and Trust, pp. 243-269, Springer,
2018.
[23] R. Santelices and M. J. Harrold, “Efficiently monitoring data-flow test
coverage,” Proceedings of the twenty-second IEEE/ACM International
Conferenceon on Automated Software Engineering, pp.343-352, ACM,
2007.
[24] P. G. Frankl and E. J. Weyuker, “An applicable family of data flow
testing criteria,” IEEE Transactions on Software Engineering, vol. 14,
no. 10, pp. 1483-1498, 1988.

---

[25] R. Jin, S. J. Jiang, and H. C. Zhang, “Novel evolutionary generation
approach to test data for data-flow coverage,” Journal of Chinese
Computer Systems, vol. 33, no. 4, pp. 722-726, 2012.
[26] J. K. Ge, Y. h. Qiu, C. M. Wu, and G. L. Pu, “Summary of genetic
algorithms research,” Application Research of Computers, vol. 10, no.
10, pp. 2911-2916, 2008.
[27] M. P, “Search-based software test data generation: a survey,” Software
Testing, Verification and Reliability, vol. 14, no. 2, pp. 105-156, 2004.