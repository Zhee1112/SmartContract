// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ProjectRegistry
 * @dev Registri proyek yang mengelompokkan task-task dalam satu project.
 *      Setiap project punya anggaran, deadline, dan status sendiri.
 *      Mendukung multi-PM dan worker whitelist per project.
 */
contract ProjectRegistry is AccessControl, ReentrancyGuard {

    // ── Roles ────────────────────────────────────────────────────
    bytes32 public constant ADMIN_ROLE      = keccak256("ADMIN_ROLE");
    bytes32 public constant PM_ROLE         = keccak256("PM_ROLE");

    // ── Enums ────────────────────────────────────────────────────
    enum ProjectStatus { ACTIVE, PAUSED, COMPLETED, CANCELLED }

    // ── Structs ──────────────────────────────────────────────────
    struct Project {
        uint256 id;
        string  name;
        string  description;
        string  category;          // IT, Finance, Marketing, etc.
        address lead;              // Project Lead (PM utama)
        uint256 totalBudget;       // Total anggaran proyek
        uint256 spentBudget;       // Sudah dipakai
        uint256 taskCount;         // Jumlah task dalam project
        uint256 completedTasks;    // Task yang selesai
        uint256 startDate;
        uint256 deadline;
        ProjectStatus status;
        bool    requireMultiApproval; // Butuh 2 PM untuk approve task mahal?
        uint256 multiApprovalThreshold; // Ambang batas gaji butuh multi-approval
    }

    // ── State ────────────────────────────────────────────────────
    IERC20   public immutable idrToken;
    uint256  public projectCounter;

    mapping(uint256 => Project)          public projects;
    mapping(uint256 => address[])        public projectPMs;       // projectId => list PM
    mapping(uint256 => mapping(address => bool)) public isPMInProject;
    mapping(uint256 => address[])        public projectWorkers;   // projectId => whitelist worker
    mapping(uint256 => mapping(address => bool)) public isWorkerInProject;
    mapping(address => uint256[])        public projectsByLead;
    mapping(uint256 => uint256[])        public tasksByProject;   // projectId => taskIds

    // ── Events ───────────────────────────────────────────────────
    event ProjectCreated(uint256 indexed id, address indexed lead, string name, uint256 budget, uint256 deadline);
    event ProjectUpdated(uint256 indexed id, ProjectStatus status);
    event PMAddedToProject(uint256 indexed projectId, address pm);
    event WorkerAddedToProject(uint256 indexed projectId, address worker);
    event TaskLinkedToProject(uint256 indexed projectId, uint256 taskId);
    event ProjectBudgetUsed(uint256 indexed projectId, uint256 amount, uint256 remaining);

    // ── Modifiers ────────────────────────────────────────────────
    modifier projectExists(uint256 _id) {
        require(_id > 0 && _id <= projectCounter, "ProjectRegistry: Proyek tidak ditemukan");
        _;
    }

    modifier onlyProjectLead(uint256 _id) {
        require(projects[_id].lead == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "ProjectRegistry: Bukan lead proyek ini");
        _;
    }

    // ── Constructor ──────────────────────────────────────────────
    constructor(address _idrToken) {
        require(_idrToken != address(0), "ProjectRegistry: Alamat token tidak valid");
        idrToken = IERC20(_idrToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PM_ROLE, msg.sender);
    }

    // ── Create Project ───────────────────────────────────────────
    function createProject(
        string  calldata _name,
        string  calldata _description,
        string  calldata _category,
        uint256 _totalBudget,
        uint256 _deadline,
        bool    _requireMultiApproval,
        uint256 _multiApprovalThreshold
    ) external returns (uint256) {
        require(bytes(_name).length > 0,      "ProjectRegistry: Nama tidak boleh kosong");
        require(_totalBudget > 0,             "ProjectRegistry: Budget harus > 0");
        require(_deadline > block.timestamp,  "ProjectRegistry: Deadline sudah lewat");

        projectCounter++;
        projects[projectCounter] = Project({
            id:                     projectCounter,
            name:                   _name,
            description:            _description,
            category:               _category,
            lead:                   msg.sender,
            totalBudget:            _totalBudget,
            spentBudget:            0,
            taskCount:              0,
            completedTasks:         0,
            startDate:              block.timestamp,
            deadline:               _deadline,
            status:                 ProjectStatus.ACTIVE,
            requireMultiApproval:   _requireMultiApproval,
            multiApprovalThreshold: _multiApprovalThreshold
        });

        projectPMs[projectCounter].push(msg.sender);
        isPMInProject[projectCounter][msg.sender] = true;
        projectsByLead[msg.sender].push(projectCounter);

        emit ProjectCreated(projectCounter, msg.sender, _name, _totalBudget, _deadline);
        return projectCounter;
    }

    // ── Manage Project Members ───────────────────────────────────
    function addPMToProject(uint256 _projectId, address _pm)
        external projectExists(_projectId) onlyProjectLead(_projectId)
    {
        require(!isPMInProject[_projectId][_pm], "ProjectRegistry: PM sudah ada");
        projectPMs[_projectId].push(_pm);
        isPMInProject[_projectId][_pm] = true;
        _grantRole(PM_ROLE, _pm);
        emit PMAddedToProject(_projectId, _pm);
    }

    function addWorkerToProject(uint256 _projectId, address _worker)
        external projectExists(_projectId) onlyProjectLead(_projectId)
    {
        require(!isWorkerInProject[_projectId][_worker], "ProjectRegistry: Worker sudah ada");
        projectWorkers[_projectId].push(_worker);
        isWorkerInProject[_projectId][_worker] = true;
        emit WorkerAddedToProject(_projectId, _worker);
    }

    // ── Link task ke project (dipanggil oleh PayrollManager) ─────
    function linkTaskToProject(uint256 _projectId, uint256 _taskId, uint256 _salary)
        external projectExists(_projectId)
    {
        Project storage p = projects[_projectId];
        require(p.status == ProjectStatus.ACTIVE, "ProjectRegistry: Proyek tidak aktif");
        require(p.spentBudget + _salary <= p.totalBudget, "ProjectRegistry: Budget proyek tidak cukup");

        p.spentBudget += _salary;
        p.taskCount++;
        tasksByProject[_projectId].push(_taskId);

        emit TaskLinkedToProject(_projectId, _taskId);
        emit ProjectBudgetUsed(_projectId, _salary, p.totalBudget - p.spentBudget);
    }

    function markTaskCompleted(uint256 _projectId) external projectExists(_projectId) {
        projects[_projectId].completedTasks++;
    }

    // ── Project Status ───────────────────────────────────────────
    function updateProjectStatus(uint256 _projectId, ProjectStatus _status)
        external projectExists(_projectId) onlyProjectLead(_projectId)
    {
        projects[_projectId].status = _status;
        emit ProjectUpdated(_projectId, _status);
    }

    // ── Views ────────────────────────────────────────────────────
    function getProject(uint256 _id) external view projectExists(_id) returns (Project memory) {
        return projects[_id];
    }

    function getProjectPMs(uint256 _id) external view returns (address[] memory) {
        return projectPMs[_id];
    }

    function getProjectWorkers(uint256 _id) external view returns (address[] memory) {
        return projectWorkers[_id];
    }

    function getTasksByProject(uint256 _id) external view returns (uint256[] memory) {
        return tasksByProject[_id];
    }

    function getProjectsByLead(address _lead) external view returns (uint256[] memory) {
        return projectsByLead[_lead];
    }

    function getBudgetUtilization(uint256 _id)
        external view projectExists(_id)
        returns (uint256 total, uint256 spent, uint256 remaining, uint256 utilizationPercent)
    {
        Project storage p = projects[_id];
        total             = p.totalBudget;
        spent             = p.spentBudget;
        remaining         = total - spent;
        utilizationPercent = total > 0 ? (spent * 100) / total : 0;
    }

    function isProjectOnSchedule(uint256 _id) external view projectExists(_id) returns (bool) {
        return block.timestamp <= projects[_id].deadline;
    }
}
