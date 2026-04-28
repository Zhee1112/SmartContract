// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PayrollManager v2
 * @dev Enhanced: Milestone payments, dispute mechanism, progressive PPh 21,
 *      multi-approval for high-value tasks, deadline enforcement, worker rating.
 */
contract PayrollManager is ReentrancyGuard, Ownable {

    IERC20  public immutable idrToken;
    address public taxWallet;
    address public disputeArbitrator;   // Alamat arbiter sengketa
    uint256 public taskCounter;
    uint256 public milestoneCounter;

    // ── Progressive Tax Brackets (PPh 21) ────────────────────────
    // Bracket 1: <= 60 Juta/tahun  → 5%
    // Bracket 2: <= 250 Juta/tahun → 15%
    // Bracket 3: <= 500 Juta/tahun → 25%
    // Bracket 4: > 500 Juta/tahun  → 30%
    uint256 public constant BRACKET_1_LIMIT = 60_000_000;
    uint256 public constant BRACKET_2_LIMIT = 250_000_000;
    uint256 public constant BRACKET_3_LIMIT = 500_000_000;

    // ── Enums ────────────────────────────────────────────────────
    enum TaskStatus     { OPEN, CLAIMED, SUBMITTED, APPROVED, COMPLETED, DISPUTED, CANCELLED }
    enum MilestoneStatus { PENDING, SUBMITTED, APPROVED, REJECTED }
    enum DisputeStatus  { NONE, OPEN, RESOLVED_PM, RESOLVED_WORKER, WITHDRAWN }

    // ── Structs ──────────────────────────────────────────────────
    struct Milestone {
        uint256 id;
        uint256 taskId;
        string  description;
        uint256 payment;        // Rupiah untuk milestone ini
        uint256 taxAmount;
        uint256 netPayment;
        string  submissionProof;
        MilestoneStatus status;
        uint256 submittedAt;
        uint256 approvedAt;
    }

    struct Dispute {
        uint256 taskId;
        address raisedBy;
        string  reason;
        DisputeStatus status;
        uint256 raisedAt;
        uint256 resolvedAt;
        string  resolution;     // Catatan arbitrator
    }

    struct Task {
        uint256  id;
        uint256  projectId;      // 0 = standalone (tanpa project)
        string   description;
        string   category;
        address  pm;
        address  worker;
        uint256  grossSalary;
        uint256  netSalary;
        uint256  taxAmount;
        uint256  taxRate;        // Tax rate yang dipakai (progresif)
        bool     isMilestone;    // True = dibagi jadi milestone
        uint256  milestoneCount;
        uint256  milestonePaid;  // Jumlah milestone sudah dibayar
        uint256  deadline;       // Deadline submit kerja
        uint256  autoApproveAt;  // Jika PM tidak approve dalam X hari, otomatis approve
        TaskStatus status;
        uint256  createdAt;
        uint256  completedAt;
        uint8    workerRating;   // Rating PM ke worker 1-5 setelah selesai
        string   pmNote;         // Catatan dari PM
        string   submissionProof;
        uint256  approvalCount;  // Jumlah PM yang approve (untuk multi-approval)
    }

    // ── Mappings ─────────────────────────────────────────────────
    mapping(uint256 => Task)        public tasks;
    mapping(uint256 => Milestone[]) public milestones;
    mapping(uint256 => Dispute)     public disputes;
    mapping(address => uint256)     public pmBudget;
    mapping(address => uint256[])   public tasksByPM;
    mapping(address => uint256[])   public tasksByWorker;
    mapping(uint256 => mapping(address => bool)) public hasApproved; // multi-approval
    mapping(address => uint256)     public workerTotalEarned;
    mapping(address => uint256)     public workerCompletedTasks;
    mapping(address => uint256)     public workerTotalRating;
    mapping(address => uint256)     public workerRatingCount;

    // ── Events ───────────────────────────────────────────────────
    event BudgetDeposited(address indexed pm, uint256 amount);
    event BudgetWithdrawn(address indexed pm, uint256 amount);
    event TaskCreated(uint256 indexed id, uint256 indexed projectId, address pm, address worker, uint256 salary);
    event TaskClaimed(uint256 indexed id, address worker);
    event TaskSubmitted(uint256 indexed id, address worker, string proof);
    event TaskApproved(uint256 indexed id, address pm, uint256 approvalCount);
    event TaskCompleted(uint256 indexed id, address worker, uint256 netSalary, uint256 tax, uint8 taxRate);
    event TaskCancelled(uint256 indexed id, address pm);
    event TaskAutoApproved(uint256 indexed id);
    event MilestoneSubmitted(uint256 indexed taskId, uint256 milestoneIdx, string proof);
    event MilestoneApproved(uint256 indexed taskId, uint256 milestoneIdx, uint256 netPayment);
    event MilestoneRejected(uint256 indexed taskId, uint256 milestoneIdx);
    event DisputeRaised(uint256 indexed taskId, address raisedBy, string reason);
    event DisputeResolved(uint256 indexed taskId, DisputeStatus result, string resolution);
    event WorkerRated(uint256 indexed taskId, address worker, uint8 rating);

    // ── Modifiers ────────────────────────────────────────────────
    modifier onlyPM(uint256 id)     { require(tasks[id].pm == msg.sender, "Bukan PM task ini"); _; }
    modifier onlyWorker(uint256 id) { require(tasks[id].worker == msg.sender, "Bukan worker task ini"); _; }
    modifier taskExists(uint256 id) { require(id > 0 && id <= taskCounter, "Task tidak ada"); _; }
    modifier onlyArbitrator()       { require(msg.sender == disputeArbitrator || msg.sender == owner(), "Bukan arbitrator"); _; }

    // ── Constructor ──────────────────────────────────────────────
    constructor(address _token, address _taxWallet, address _arbitrator) Ownable(msg.sender) {
        require(_token    != address(0), "Token tidak valid");
        require(_taxWallet != address(0), "TaxWallet tidak valid");
        idrToken          = IERC20(_token);
        taxWallet         = _taxWallet;
        disputeArbitrator = _arbitrator != address(0) ? _arbitrator : msg.sender;
    }

    // ════════════════════════════════════════════════════════════
    // BUDGET MANAGEMENT
    // ════════════════════════════════════════════════════════════

    function depositBudget(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Jumlah harus > 0");
        require(idrToken.transferFrom(msg.sender, address(this), _amount), "Transfer gagal");
        pmBudget[msg.sender] += _amount;
        emit BudgetDeposited(msg.sender, _amount);
    }

    function withdrawBudget(uint256 _amount) external nonReentrant {
        require(pmBudget[msg.sender] >= _amount, "Saldo tidak cukup");
        pmBudget[msg.sender] -= _amount;
        require(idrToken.transfer(msg.sender, _amount), "Transfer gagal");
        emit BudgetWithdrawn(msg.sender, _amount);
    }

    // ════════════════════════════════════════════════════════════
    // TASK CREATION
    // ════════════════════════════════════════════════════════════

    function createTask(
        string  calldata _desc,
        string  calldata _category,
        address _worker,
        uint256 _salary,
        uint256 _projectId,
        uint256 _deadline,
        uint256 _autoApproveDays,
        bool    _isMilestone,
        string[] calldata _milestoneDescs,
        uint256[] calldata _milestoneAmounts
    ) external returns (uint256) {
        require(bytes(_desc).length > 0,  "Deskripsi kosong");
        require(_worker != address(0) && _worker != msg.sender, "Worker tidak valid");
        require(_salary > 0,              "Gaji harus > 0");
        require(pmBudget[msg.sender] >= _salary, "Budget tidak cukup");
        if (_deadline > 0) require(_deadline > block.timestamp, "Deadline sudah lewat");

        // Kalkulasi pajak progresif
        (uint256 tax, uint8 rate) = calculateProgressiveTax(_salary);
        uint256 net               = _salary - tax;

        pmBudget[msg.sender] -= _salary;
        taskCounter++;

        uint256 autoApproveAt = _autoApproveDays > 0
            ? block.timestamp + (_autoApproveDays * 1 days)
            : 0;

        tasks[taskCounter] = Task({
            id:             taskCounter,
            projectId:      _projectId,
            description:    _desc,
            category:       _category,
            pm:             msg.sender,
            worker:         _worker,
            grossSalary:    _salary,
            netSalary:      net,
            taxAmount:      tax,
            taxRate:        rate,
            isMilestone:    _isMilestone,
            milestoneCount: _isMilestone ? _milestoneDescs.length : 0,
            milestonePaid:  0,
            deadline:       _deadline,
            autoApproveAt:  autoApproveAt,
            status:         TaskStatus.OPEN,
            createdAt:      block.timestamp,
            completedAt:    0,
            workerRating:   0,
            pmNote:         "",
            submissionProof: "",
            approvalCount:  0
        });

        // Buat milestones jika diperlukan
        if (_isMilestone) {
            require(_milestoneDescs.length == _milestoneAmounts.length, "Milestone data tidak sinkron");
            uint256 totalMs;
            for (uint i = 0; i < _milestoneDescs.length; i++) {
                totalMs += _milestoneAmounts[i];
                (uint256 mTax,) = calculateProgressiveTax(_milestoneAmounts[i]);
                milestones[taskCounter].push(Milestone({
                    id:             i,
                    taskId:         taskCounter,
                    description:    _milestoneDescs[i],
                    payment:        _milestoneAmounts[i],
                    taxAmount:      mTax,
                    netPayment:     _milestoneAmounts[i] - mTax,
                    submissionProof: "",
                    status:         MilestoneStatus.PENDING,
                    submittedAt:    0,
                    approvedAt:     0
                }));
            }
            require(totalMs == _salary, "Total milestone harus = gaji bruto");
        }

        tasksByPM[msg.sender].push(taskCounter);
        tasksByWorker[_worker].push(taskCounter);

        emit TaskCreated(taskCounter, _projectId, msg.sender, _worker, _salary);
        return taskCounter;
    }

    // ════════════════════════════════════════════════════════════
    // WORKER ACTIONS
    // ════════════════════════════════════════════════════════════

    function claimTask(uint256 _id) external taskExists(_id) onlyWorker(_id) {
        require(tasks[_id].status == TaskStatus.OPEN, "Task tidak bisa diklaim");
        if (tasks[_id].deadline > 0)
            require(block.timestamp <= tasks[_id].deadline, "Deadline sudah lewat");
        tasks[_id].status = TaskStatus.CLAIMED;
        emit TaskClaimed(_id, msg.sender);
    }

    function submitWork(uint256 _id, string calldata _proof)
        external taskExists(_id) onlyWorker(_id)
    {
        require(tasks[_id].status == TaskStatus.CLAIMED, "Task belum diklaim");
        require(bytes(_proof).length > 0, "Bukti kerja kosong");
        tasks[_id].status          = TaskStatus.SUBMITTED;
        tasks[_id].submissionProof = _proof;
        emit TaskSubmitted(_id, msg.sender, _proof);
    }

    function submitMilestone(uint256 _taskId, uint256 _milestoneIdx, string calldata _proof)
        external taskExists(_taskId) onlyWorker(_taskId)
    {
        require(tasks[_taskId].isMilestone, "Bukan task milestone");
        require(tasks[_taskId].status == TaskStatus.CLAIMED, "Task belum diklaim");
        Milestone storage ms = milestones[_taskId][_milestoneIdx];
        require(ms.status == MilestoneStatus.PENDING, "Milestone sudah disubmit");
        ms.status          = MilestoneStatus.SUBMITTED;
        ms.submissionProof = _proof;
        ms.submittedAt     = block.timestamp;
        emit MilestoneSubmitted(_taskId, _milestoneIdx, _proof);
    }

    function raiseDispute(uint256 _taskId, string calldata _reason)
        external taskExists(_taskId) onlyWorker(_taskId)
    {
        Task storage t = tasks[_taskId];
        require(t.status == TaskStatus.SUBMITTED, "Task belum disubmit");
        require(disputes[_taskId].status == DisputeStatus.NONE, "Dispute sudah ada");
        disputes[_taskId] = Dispute({
            taskId:      _taskId,
            raisedBy:    msg.sender,
            reason:      _reason,
            status:      DisputeStatus.OPEN,
            raisedAt:    block.timestamp,
            resolvedAt:  0,
            resolution:  ""
        });
        t.status = TaskStatus.DISPUTED;
        emit DisputeRaised(_taskId, msg.sender, _reason);
    }

    // ════════════════════════════════════════════════════════════
    // PM ACTIONS
    // ════════════════════════════════════════════════════════════

    function approveTask(uint256 _id, uint8 _workerRating, string calldata _note)
        external nonReentrant taskExists(_id) onlyPM(_id)
    {
        Task storage t = tasks[_id];
        require(t.status == TaskStatus.SUBMITTED || t.status == TaskStatus.APPROVED,
            "Task belum disubmit");
        require(_workerRating >= 1 && _workerRating <= 5, "Rating 1-5");
        require(!hasApproved[_id][msg.sender], "Sudah approve");

        hasApproved[_id][msg.sender] = true;
        t.approvalCount++;
        t.workerRating = _workerRating;
        t.pmNote       = _note;
        t.status       = TaskStatus.APPROVED;

        emit TaskApproved(_id, msg.sender, t.approvalCount);
        _executePayment(_id);
    }

    function approveMilestone(uint256 _taskId, uint256 _milestoneIdx)
        external nonReentrant taskExists(_taskId) onlyPM(_taskId)
    {
        require(tasks[_taskId].isMilestone, "Bukan task milestone");
        Milestone storage ms = milestones[_taskId][_milestoneIdx];
        require(ms.status == MilestoneStatus.SUBMITTED, "Milestone belum disubmit");

        ms.status     = MilestoneStatus.APPROVED;
        ms.approvedAt = block.timestamp;

        require(idrToken.transfer(taxWallet, ms.taxAmount),  "Transfer pajak gagal");
        require(idrToken.transfer(tasks[_taskId].worker, ms.netPayment), "Transfer gaji gagal");

        tasks[_taskId].milestonePaid++;
        workerTotalEarned[tasks[_taskId].worker] += ms.netPayment;

        if (tasks[_taskId].milestonePaid == tasks[_taskId].milestoneCount) {
            tasks[_taskId].status      = TaskStatus.COMPLETED;
            tasks[_taskId].completedAt = block.timestamp;
            workerCompletedTasks[tasks[_taskId].worker]++;
        }

        emit MilestoneApproved(_taskId, _milestoneIdx, ms.netPayment);
    }

    function rejectMilestone(uint256 _taskId, uint256 _milestoneIdx)
        external taskExists(_taskId) onlyPM(_taskId)
    {
        Milestone storage ms = milestones[_taskId][_milestoneIdx];
        require(ms.status == MilestoneStatus.SUBMITTED, "Milestone belum disubmit");
        ms.status = MilestoneStatus.REJECTED;
        emit MilestoneRejected(_taskId, _milestoneIdx);
    }

    function cancelTask(uint256 _id)
        external taskExists(_id) onlyPM(_id)
    {
        TaskStatus s = tasks[_id].status;
        require(s == TaskStatus.OPEN || s == TaskStatus.CLAIMED, "Tidak bisa dibatalkan");
        tasks[_id].status = TaskStatus.CANCELLED;
        pmBudget[msg.sender] += tasks[_id].grossSalary;
        emit TaskCancelled(_id, msg.sender);
    }

    // Auto-approve jika PM tidak approve dalam waktu yang ditetapkan
    function triggerAutoApprove(uint256 _id) external nonReentrant taskExists(_id) {
        Task storage t = tasks[_id];
        require(t.status == TaskStatus.SUBMITTED, "Task belum disubmit");
        require(t.autoApproveAt > 0 && block.timestamp >= t.autoApproveAt, "Belum waktunya auto-approve");
        t.status = TaskStatus.APPROVED;
        emit TaskAutoApproved(_id);
        _executePayment(_id);
    }

    function rateWorker(uint256 _id, uint8 _rating) external taskExists(_id) onlyPM(_id) {
        require(tasks[_id].status == TaskStatus.COMPLETED, "Task belum selesai");
        require(_rating >= 1 && _rating <= 5, "Rating 1-5");
        tasks[_id].workerRating = _rating;
        workerTotalRating[tasks[_id].worker]  += _rating;
        workerRatingCount[tasks[_id].worker]++;
        emit WorkerRated(_id, tasks[_id].worker, _rating);
    }

    // ── Arbitrator resolves dispute ───────────────────────────────
    function resolveDispute(uint256 _taskId, bool _favorWorker, string calldata _resolution)
        external nonReentrant onlyArbitrator taskExists(_taskId)
    {
        require(disputes[_taskId].status == DisputeStatus.OPEN, "Tidak ada dispute aktif");
        Task storage t    = tasks[_taskId];
        Dispute storage d = disputes[_taskId];
        d.resolvedAt = block.timestamp;
        d.resolution = _resolution;

        if (_favorWorker) {
            d.status = DisputeStatus.RESOLVED_WORKER;
            t.status = TaskStatus.COMPLETED;
            t.completedAt = block.timestamp;
            require(idrToken.transfer(taxWallet, t.taxAmount), "Transfer pajak gagal");
            require(idrToken.transfer(t.worker, t.netSalary), "Transfer gaji gagal");
            workerTotalEarned[t.worker] += t.netSalary;
            workerCompletedTasks[t.worker]++;
        } else {
            d.status = DisputeStatus.RESOLVED_PM;
            t.status = TaskStatus.CANCELLED;
            pmBudget[t.pm] += t.grossSalary;
        }
        emit DisputeResolved(_taskId, d.status, _resolution);
    }

    // ════════════════════════════════════════════════════════════
    // INTERNAL
    // ════════════════════════════════════════════════════════════

    function _executePayment(uint256 _id) internal {
        Task storage t = tasks[_id];
        if (t.isMilestone) return; // Milestone dibayar per-step
        t.status      = TaskStatus.COMPLETED;
        t.completedAt = block.timestamp;
        require(idrToken.transfer(taxWallet, t.taxAmount), "Transfer pajak gagal");
        require(idrToken.transfer(t.worker, t.netSalary),  "Transfer gaji gagal");
        workerTotalEarned[t.worker] += t.netSalary;
        workerCompletedTasks[t.worker]++;
        if (t.workerRating > 0) {
            workerTotalRating[t.worker] += t.workerRating;
            workerRatingCount[t.worker]++;
        }
        emit TaskCompleted(_id, t.worker, t.netSalary, t.taxAmount, uint8(t.taxRate));
    }

    // ════════════════════════════════════════════════════════════
    // PROGRESSIVE TAX CALCULATOR (PPh 21)
    // ════════════════════════════════════════════════════════════

    function calculateProgressiveTax(uint256 _salary)
        public pure returns (uint256 tax, uint8 rate)
    {
        if (_salary <= BRACKET_1_LIMIT) {
            tax  = (_salary * 5) / 100;
            rate = 5;
        } else if (_salary <= BRACKET_2_LIMIT) {
            tax  = (_salary * 15) / 100;
            rate = 15;
        } else if (_salary <= BRACKET_3_LIMIT) {
            tax  = (_salary * 25) / 100;
            rate = 25;
        } else {
            tax  = (_salary * 30) / 100;
            rate = 30;
        }
    }

    // ════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════

    function getTask(uint256 _id) external view taskExists(_id) returns (Task memory) {
        return tasks[_id];
    }

    function getMilestones(uint256 _taskId) external view returns (Milestone[] memory) {
        return milestones[_taskId];
    }

    function getDispute(uint256 _taskId) external view returns (Dispute memory) {
        return disputes[_taskId];
    }

    function getTasksByPM(address _pm) external view returns (uint256[] memory) {
        return tasksByPM[_pm];
    }

    function getTasksByWorker(address _w) external view returns (uint256[] memory) {
        return tasksByWorker[_w];
    }

    function getPMBudget(address _pm) external view returns (uint256) {
        return pmBudget[_pm];
    }

    function getWorkerStats(address _w) external view returns (
        uint256 totalEarned, uint256 completedTasks, uint256 avgRating
    ) {
        totalEarned    = workerTotalEarned[_w];
        completedTasks = workerCompletedTasks[_w];
        avgRating      = workerRatingCount[_w] > 0
            ? (workerTotalRating[_w] * 10) / workerRatingCount[_w]  // *10 for 1 decimal
            : 0;
    }

    function previewTax(uint256 _salary) external pure returns (
        uint256 gross, uint256 tax, uint256 net, uint8 rate
    ) {
        (tax, rate) = calculateProgressiveTax(_salary);
        gross       = _salary;
        net         = _salary - tax;
    }

    // ════════════════════════════════════════════════════════════
    // ADMIN
    // ════════════════════════════════════════════════════════════

    function setTaxWallet(address _w) external onlyOwner {
        require(_w != address(0));
        taxWallet = _w;
    }

    function setArbitrator(address _a) external onlyOwner {
        require(_a != address(0));
        disputeArbitrator = _a;
    }

    function emergencyWithdraw(uint256 _amount) external onlyOwner nonReentrant {
        require(idrToken.transfer(owner(), _amount), "Transfer gagal");
    }
}
