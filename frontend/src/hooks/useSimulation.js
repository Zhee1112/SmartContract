/**
 * useSimulation.js
 * Hook simulasi penuh — tidak butuh MetaMask atau blockchain.
 * Semua state disimpan di localStorage agar persistent.
 */
import { useState, useCallback } from "react";
import { formatRupiah } from "./useWeb3";

// ── Initial demo data ─────────────────────────────────────────
const ACCOUNTS = {
  deployer: { address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", name: "Deployer (Owner)", role: "admin" },
  pm:       { address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", name: "Budi (PM)",        role: "pm" },
  worker1:  { address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", name: "Andi (Worker)",    role: "worker" },
  worker2:  { address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", name: "Sari (Worker)",    role: "worker" },
  tax:      { address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", name: "Kas Negara (Tax)", role: "tax" },
};

const INITIAL_STATE = {
  balances: {
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266": 50_000_000,
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906": 50_000_000,
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65": 5_000_000,
    "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc": 3_500_000,
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8": 0,
  },
  pmBudgets: {
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266": 0,
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906": 0,
  },
  taskCounter: 0,
  tasks: {},        // taskId -> task object
  milestones: {},   // taskId -> []
  disputes: {},     // taskId -> dispute
  projects: {},     // projectId -> project
  projectCounter: 0,
  totalTaxCollected: 0,
  totalSupply: 200_000_000,
};

// ── Progressive Tax Calculator ────────────────────────────────
export function calcTax(salary) {
  const s = Number(salary);
  let rate;
  if      (s <= 60_000_000)  rate = 5;
  else if (s <= 250_000_000) rate = 15;
  else if (s <= 500_000_000) rate = 25;
  else                        rate = 30;
  const tax = Math.floor(s * rate / 100);
  return { gross: s, tax, net: s - tax, rate };
}

// ── Persistent store ─────────────────────────────────────────
function loadState() {
  try {
    const saved = localStorage.getItem("idr_sim_state");
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  } catch { return INITIAL_STATE; }
}

function saveState(state) {
  localStorage.setItem("idr_sim_state", JSON.stringify(state));
}

// ── Fake tx delay ─────────────────────────────────────────────
const delay = (ms = 1200) => new Promise(r => setTimeout(r, ms));

// ── Main Simulation Hook ──────────────────────────────────────
export function useSimulation() {
  const [state,       setState]       = useState(() => loadState());
  const [currentAcct, setCurrentAcct] = useState("pm");
  const [loading,     setLoading]     = useState(false);

  const account = ACCOUNTS[currentAcct];
  const addr    = account.address;

  // Persist + update state
  const update = useCallback((fn) => {
    setState(prev => {
      const next = fn(structuredClone(prev));
      saveState(next);
      return next;
    });
  }, []);

  // Reset simulation
  const reset = useCallback(() => {
    localStorage.removeItem("idr_sim_state");
    setState(INITIAL_STATE);
  }, []);

  // ── BUDGET ──────────────────────────────────────────────────
  const depositBudget = useCallback(async (amount) => {
    const amt = Number(amount);
    if (state.balances[addr] < amt) throw new Error("Saldo tidak cukup");
    setLoading(true);
    await delay();
    update(s => {
      s.balances[addr]  -= amt;
      s.pmBudgets[addr] = (s.pmBudgets[addr] || 0) + amt;
      return s;
    });
    setLoading(false);
  }, [state, addr, update]);

  const withdrawBudget = useCallback(async (amount) => {
    const amt = Number(amount);
    if ((state.pmBudgets[addr] || 0) < amt) throw new Error("Budget tidak cukup");
    setLoading(true);
    await delay();
    update(s => {
      s.pmBudgets[addr] -= amt;
      s.balances[addr]  += amt;
      return s;
    });
    setLoading(false);
  }, [state, addr, update]);

  // ── TASKS ───────────────────────────────────────────────────
  const createTask = useCallback(async ({
    desc, category, priority = "Medium", worker, salary, projectId = 0,
    deadline = 0, autoApproveDays = 7,
    isMilestone = false, milestoneDescs = [], milestoneAmounts = []
  }) => {
    if ((state.pmBudgets[addr] || 0) < Number(salary))
      throw new Error(`Budget tidak cukup. Budget: ${formatRupiah(state.pmBudgets[addr])}, dibutuhkan: ${formatRupiah(salary)}`);

    setLoading(true);
    await delay();
    const { gross, tax, net, rate } = calcTax(salary);
    const now = Math.floor(Date.now() / 1000);

    update(s => {
      s.taskCounter++;
      const id = s.taskCounter;
      s.tasks[id] = {
        id, desc, category, priority, worker, pm: addr,
        grossSalary: gross, netSalary: net, taxAmount: tax, taxRate: rate,
        projectId, deadline, autoApproveAt: now + autoApproveDays * 86400,
        isMilestone, milestoneCount: isMilestone ? milestoneDescs.length : 0,
        milestonePaid: 0, status: 0, // OPEN
        createdAt: now, completedAt: 0,
        submissionProof: "", pmNote: "", workerRating: 0,
        activityLog: [{ action: "Task dibuat", user: ACCOUNTS[Object.keys(ACCOUNTS).find(k=>ACCOUNTS[k].address===addr)].name, time: now }]
      };
      s.pmBudgets[addr] -= gross;

      if (isMilestone) {
        s.milestones[id] = milestoneDescs.map((d, i) => {
          const { tax: mTax, net: mNet } = calcTax(milestoneAmounts[i]);
          return { id: i, taskId: id, description: d, payment: milestoneAmounts[i],
            taxAmount: mTax, netPayment: mNet, submissionProof: "",
            status: 0, submittedAt: 0, approvedAt: 0 };
        });
      }
      return s;
    });
    setLoading(false);
    return state.taskCounter + 1;
  }, [state, addr, update]);

  const claimTask = useCallback(async (taskId) => {
    setLoading(true); await delay(800);
    update(s => { 
      s.tasks[taskId].status = 1; 
      s.tasks[taskId].activityLog.push({ action: "Task diklaim worker", user: ACCOUNTS[Object.keys(ACCOUNTS).find(k=>ACCOUNTS[k].address===addr)]?.name || addr, time: Math.floor(Date.now()/1000) });
      return s; 
    });
    setLoading(false);
  }, [addr, update]);

  const submitWork = useCallback(async (taskId, proof) => {
    setLoading(true); await delay(800);
    update(s => { 
      s.tasks[taskId].status = 2; 
      s.tasks[taskId].submissionProof = proof; 
      s.tasks[taskId].activityLog.push({ action: "Hasil pekerjaan disubmit", user: ACCOUNTS[Object.keys(ACCOUNTS).find(k=>ACCOUNTS[k].address===addr)]?.name || addr, time: Math.floor(Date.now()/1000) });
      return s; 
    });
    setLoading(false);
  }, [addr, update]);

  const submitMilestone = useCallback(async (taskId, idx, proof) => {
    setLoading(true); await delay(800);
    update(s => {
      s.milestones[taskId][idx].status = 1;
      s.milestones[taskId][idx].submissionProof = proof;
      s.milestones[taskId][idx].submittedAt = Math.floor(Date.now() / 1000);
      return s;
    });
    setLoading(false);
  }, [update]);

  const approveTask = useCallback(async (taskId, rating = 4, note = "") => {
    setLoading(true); await delay(1500);
    update(s => {
      const t = s.tasks[taskId];
      t.status = 4; // COMPLETED
      t.completedAt = Math.floor(Date.now() / 1000);
      t.workerRating = rating;
      t.pmNote = note;
      t.activityLog.push({ action: `Task di-approve (Rating: ⭐${rating})`, user: ACCOUNTS[Object.keys(ACCOUNTS).find(k=>ACCOUNTS[k].address===addr)]?.name || addr, time: t.completedAt });
      
      // Transfer
      const taxAddr = ACCOUNTS.tax.address;
      s.balances[t.worker]  = (s.balances[t.worker] || 0) + t.netSalary;
      s.balances[taxAddr]   = (s.balances[taxAddr]  || 0) + t.taxAmount;
      s.totalTaxCollected  += t.taxAmount;
      return s;
    });
    setLoading(false);
  }, [addr, update]);

  const approveMilestone = useCallback(async (taskId, idx) => {
    setLoading(true); await delay(1000);
    update(s => {
      const ms = s.milestones[taskId][idx];
      const t  = s.tasks[taskId];
      ms.status = 2; // APPROVED
      ms.approvedAt = Math.floor(Date.now() / 1000);
      s.balances[t.worker] = (s.balances[t.worker] || 0) + ms.netPayment;
      s.balances[ACCOUNTS.tax.address] = (s.balances[ACCOUNTS.tax.address] || 0) + ms.taxAmount;
      s.totalTaxCollected += ms.taxAmount;
      t.milestonePaid++;
      if (t.milestonePaid >= t.milestoneCount) {
        t.status = 4;
        t.completedAt = Math.floor(Date.now() / 1000);
      }
      return s;
    });
    setLoading(false);
  }, [update]);

  const rejectMilestone = useCallback(async (taskId, idx) => {
    setLoading(true); await delay(600);
    update(s => { s.milestones[taskId][idx].status = 3; return s; });
    setLoading(false);
  }, [update]);

  const cancelTask = useCallback(async (taskId) => {
    setLoading(true); await delay(800);
    update(s => {
      const t = s.tasks[taskId];
      t.status = 6; // CANCELLED
      s.pmBudgets[t.pm] = (s.pmBudgets[t.pm] || 0) + t.grossSalary;
      return s;
    });
    setLoading(false);
  }, [update]);

  const raiseDispute = useCallback(async (taskId, reason) => {
    setLoading(true); await delay(800);
    update(s => {
      s.tasks[taskId].status = 5; // DISPUTED
      s.disputes[taskId] = {
        taskId, raisedBy: addr, reason,
        status: 1, raisedAt: Math.floor(Date.now() / 1000),
        resolvedAt: 0, resolution: ""
      };
      return s;
    });
    setLoading(false);
  }, [addr, update]);

  const resolveDispute = useCallback(async (taskId, favorWorker, resolution) => {
    setLoading(true); await delay(1200);
    update(s => {
      const t = s.tasks[taskId];
      const d = s.disputes[taskId];
      d.resolvedAt = Math.floor(Date.now() / 1000);
      d.resolution = resolution;
      if (favorWorker) {
        d.status = 3; t.status = 4; t.completedAt = d.resolvedAt;
        s.balances[t.worker] = (s.balances[t.worker] || 0) + t.netSalary;
        s.balances[ACCOUNTS.tax.address] = (s.balances[ACCOUNTS.tax.address] || 0) + t.taxAmount;
        s.totalTaxCollected += t.taxAmount;
      } else {
        d.status = 2; t.status = 6;
        s.pmBudgets[t.pm] = (s.pmBudgets[t.pm] || 0) + t.grossSalary;
      }
      return s;
    });
    setLoading(false);
  }, [update]);

  // ── PROJECTS ────────────────────────────────────────────────
  const createProject = useCallback(async ({ name, desc, category, budget, deadline, multiAppr, threshold }) => {
    setLoading(true); await delay(1000);
    update(s => {
      s.projectCounter++;
      s.projects[s.projectCounter] = {
        id: s.projectCounter, name, description: desc, category,
        lead: addr, totalBudget: Number(budget), spentBudget: 0,
        taskCount: 0, completedTasks: 0,
        startDate: Math.floor(Date.now() / 1000),
        deadline: Math.floor(new Date(deadline).getTime() / 1000),
        status: 0, requireMultiApproval: multiAppr,
        multiApprovalThreshold: Number(threshold || 0),
      };
      return s;
    });
    setLoading(false);
  }, [addr, update]);

  // ── MINT (admin only) ────────────────────────────────────────
  const mintToken = useCallback(async (to, amount) => {
    setLoading(true); await delay(1000);
    update(s => {
      s.balances[to] = (s.balances[to] || 0) + Number(amount);
      s.totalSupply += Number(amount);
      return s;
    });
    setLoading(false);
  }, [update]);

  // ── Derived data ─────────────────────────────────────────────
  const taskList = Object.values(state.tasks);
  const getTasksByPM     = (a) => taskList.filter(t => t.pm === a);
  const getTasksByWorker = (a) => taskList.filter(t => t.worker === a);
  const getWorkerStats   = (a) => {
    const done = taskList.filter(t => t.worker === a && t.status === 4);
    const earned = done.reduce((s, t) => s + t.netSalary, 0);
    const ratings = done.filter(t => t.workerRating > 0);
    const avg = ratings.length > 0
      ? ratings.reduce((s, t) => s + t.workerRating, 0) / ratings.length : 0;
    return [earned, done.length, Math.round(avg * 10)];
  };
  const projectList  = Object.values(state.projects);
  const openDisputes = Object.values(state.disputes).filter(d => d.status === 1);

  return {
    // Identity
    account, currentAcct, ACCOUNTS,
    setCurrentAcct,
    // Balances
    balance:   state.balances[addr] || 0,
    pmBudget:  state.pmBudgets[addr] || 0,
    taxBalance: state.balances[ACCOUNTS.tax.address] || 0,
    totalSupply: state.totalSupply,
    totalTaxCollected: state.totalTaxCollected,
    // Data
    state, tasks: taskList, milestones: state.milestones,
    disputes: state.disputes, projects: projectList,
    openDisputes,
    getTasksByPM, getTasksByWorker, getWorkerStats, calcTax,
    // Actions
    depositBudget, withdrawBudget, createTask,
    claimTask, submitWork, submitMilestone,
    approveTask, approveMilestone, rejectMilestone,
    cancelTask, raiseDispute, resolveDispute,
    createProject, mintToken, reset,
    loading,
    isSimulation: true,
  };
}
