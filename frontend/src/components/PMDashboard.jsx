import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { formatRupiah, formatDate } from "../hooks/useWeb3";
import TaskCard from "./TaskCard";

const PMDashboard = ({ contracts, account, balance, pmBudget, refreshBalance, onNotify }) => {
  const { payroll, idrt } = contracts;

  const [tasks,         setTasks]         = useState([]);
  const [milestoneMap,  setMilestoneMap]  = useState({});
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab,     setActiveTab]     = useState("create");
  const [taxPreview,    setTaxPreview]    = useState(null);

  // ── Form State ────────────────────────────────────────────────
  const [depositAmt,   setDepositAmt]   = useState("");
  const [desc,         setDesc]         = useState("");
  const [category,     setCategory]     = useState("IT");
  const [worker,       setWorker]       = useState("");
  const [salary,       setSalary]       = useState("");
  const [projectId,    setProjectId]    = useState("0");
  const [deadline,     setDeadline]     = useState("");
  const [autoApprove,  setAutoApprove]  = useState("7");
  const [isMilestone,  setIsMilestone]  = useState(false);
  const [milestones,   setMilestones]   = useState([{ desc: "", amount: "" }]);

  // ── Fetch Tasks ───────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    if (!payroll || !account) return;
    setLoading(true);
    try {
      const ids     = await payroll.getTasksByPM(account);
      const results = await Promise.all(ids.map(id => payroll.getTask(id)));
      const reversed = [...results].reverse();
      setTasks(reversed);

      // Fetch milestones for milestone tasks
      const msMap = {};
      await Promise.all(
        reversed.filter(t => t.isMilestone).map(async t => {
          msMap[Number(t.id)] = await payroll.getMilestones(t.id);
        })
      );
      setMilestoneMap(msMap);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [payroll, account]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Tax Preview ───────────────────────────────────────────────
  useEffect(() => {
    const calc = async () => {
      if (!payroll || !salary || isNaN(salary) || Number(salary) <= 0) {
        setTaxPreview(null); return;
      }
      try {
        const [gross, tax, net, rate] = await payroll.previewTax(BigInt(salary));
        setTaxPreview({ gross, tax, net, rate: Number(rate) });
      } catch { setTaxPreview(null); }
    };
    const debounce = setTimeout(calc, 400);
    return () => clearTimeout(debounce);
  }, [salary, payroll]);

  // ── Deposit ───────────────────────────────────────────────────
  const handleDeposit = async () => {
    if (!depositAmt || Number(depositAmt) <= 0) return;
    setActionLoading(true);
    try {
      const payrollAddr = await payroll.getAddress();
      const amt = BigInt(depositAmt);
      onNotify("info", "⏳ Approve token di MetaMask...");
      const atx = await idrt.approve(payrollAddr, amt);
      await atx.wait();
      onNotify("info", "⏳ Mendepositkan...");
      const dtx = await payroll.depositBudget(amt);
      await dtx.wait();
      onNotify("success", `✅ Deposit ${formatRupiah(amt)} berhasil!`);
      setDepositAmt("");
      await refreshBalance(account);
    } catch (e) { onNotify("error", `❌ ${e.reason || e.message}`); }
    finally { setActionLoading(false); }
  };

  // ── Create Task ───────────────────────────────────────────────
  const handleCreateTask = async () => {
    if (!desc || !worker || !salary) return;
    if (!ethers.isAddress(worker)) { onNotify("error", "❌ Alamat worker tidak valid"); return; }

    // Validate milestones
    if (isMilestone) {
      const total = milestones.reduce((s, m) => s + Number(m.amount || 0), 0);
      if (total !== Number(salary)) {
        onNotify("error", `❌ Total milestone (${formatRupiah(total)}) harus = Gaji (${formatRupiah(salary)})`);
        return;
      }
    }

    setActionLoading(true);
    try {
      onNotify("info", "⏳ Membuat task di blockchain...");
      const deadlineTs  = deadline ? Math.floor(new Date(deadline).getTime() / 1000) : 0;
      const msDescs     = isMilestone ? milestones.map(m => m.desc) : [];
      const msAmounts   = isMilestone ? milestones.map(m => BigInt(m.amount || 0)) : [];

      const tx = await payroll.createTask(
        desc, category, worker, BigInt(salary),
        BigInt(projectId), deadlineTs,
        Number(autoApprove), isMilestone, msDescs, msAmounts
      );
      const receipt = await tx.wait();
      const ev = receipt.logs.find(l => l.fragment?.name === "TaskCreated");
      const id = ev ? Number(ev.args[0]) : "?";

      onNotify("success", `✅ Task #${id} dibuat! Dana ${formatRupiah(salary)} dikunci.`);
      setDesc(""); setWorker(""); setSalary(""); setDeadline("");
      setIsMilestone(false); setMilestones([{ desc: "", amount: "" }]);
      await refreshBalance(account);
      await fetchTasks();
    } catch (e) { onNotify("error", `❌ ${e.reason || e.message}`); }
    finally { setActionLoading(false); }
  };

  // ── Task Actions ──────────────────────────────────────────────
  const handleAction = async (action, taskId, extra = "") => {
    setActionLoading(true);
    try {
      let tx;
      if (action === "approve") {
        onNotify("info", "⏳ Menyetujui task...");
        const rating = 4; const note = "Pekerjaan bagus!";
        tx = await payroll.approveTask(taskId, rating, note);
        await tx.wait();
        onNotify("success", "💸 Gaji & pajak otomatis dibayar!");
      } else if (action === "cancel") {
        tx = await payroll.cancelTask(taskId);
        await tx.wait();
        onNotify("success", "🚫 Task dibatalkan, dana dikembalikan.");
      }
      await refreshBalance(account);
      await fetchTasks();
    } catch (e) { onNotify("error", `❌ ${e.reason || e.message}`); }
    finally { setActionLoading(false); }
  };

  const handleMsAction = async (action, taskId, idx) => {
    setActionLoading(true);
    try {
      let tx;
      if (action === "approve") {
        tx = await payroll.approveMilestone(taskId, idx);
        await tx.wait();
        onNotify("success", `✅ Milestone ${idx+1} disetujui & dibayar!`);
      } else if (action === "reject") {
        tx = await payroll.rejectMilestone(taskId, idx);
        await tx.wait();
        onNotify("warn", `🔁 Milestone ${idx+1} ditolak, worker harus submit ulang.`);
      }
      await refreshBalance(account);
      await fetchTasks();
    } catch (e) { onNotify("error", `❌ ${e.reason || e.message}`); }
    finally { setActionLoading(false); }
  };

  // Milestone helpers
  const addMilestone = () => setMilestones(prev => [...prev, { desc: "", amount: "" }]);
  const removeMilestone = i => setMilestones(prev => prev.filter((_, idx) => idx !== i));
  const updateMilestone = (i, field, val) =>
    setMilestones(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  const msTotal = milestones.reduce((s, m) => s + Number(m.amount || 0), 0);

  const stats = {
    pending: tasks.filter(t => [0,1,2,3].includes(Number(t.status))).length,
    done:    tasks.filter(t => Number(t.status) === 4).length,
    dispute: tasks.filter(t => Number(t.status) === 5).length,
  };

  return (
    <div>
      {/* KPI */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Saldo Wallet</div>
          <div className="stat-value green">{formatRupiah(balance)}</div>
          <div className="stat-sub">Token IDRT</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Budget di Kontrak</div>
          <div className="stat-value blue">{formatRupiah(pmBudget)}</div>
          <div className="stat-sub">Siap dikunci</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Task Aktif</div>
          <div className="stat-value amber">{stats.pending}</div>
          <div className="stat-sub">{stats.done} selesai</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dispute</div>
          <div className="stat-value" style={{ color: stats.dispute > 0 ? "var(--accent-rose)" : "var(--text-muted)" }}>
            {stats.dispute}
          </div>
          <div className="stat-sub">Menunggu arbitrator</div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: ".35rem", background: "var(--bg-surface)",
        border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
        padding: ".3rem", marginBottom: "1.5rem" }}>
        {[["create","➕ Buat Task"],["deposit","💰 Deposit"],["tasks","📋 Semua Task"]].map(([key, label]) => (
          <button key={key}
            className={`btn btn-sm ${activeTab === key ? "btn-primary" : "btn-ghost"}`}
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => setActiveTab(key)}>
            {label}{key === "tasks" && stats.dispute > 0 && (
              <span className="nav-badge">{stats.dispute}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── DEPOSIT TAB ─────────────────────────────────────── */}
      {activeTab === "deposit" && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div className="card-header"><h3>💰 Deposit Budget</h3></div>
          <div className="form-group">
            <label className="form-label">Jumlah (Rupiah)</label>
            <input type="number" className="form-input" placeholder="5000000"
              value={depositAmt} onChange={e => setDepositAmt(e.target.value)} />
            <div className="form-hint">Saldo wallet: {formatRupiah(balance)}</div>
          </div>
          <button className="btn btn-primary btn-full" onClick={handleDeposit}
            disabled={actionLoading || !depositAmt || Number(depositAmt) <= 0}>
            {actionLoading ? <><span className="spinner" /> Memproses...</> : "⬆️ Deposit Sekarang"}
          </button>
        </div>
      )}

      {/* ── CREATE TASK TAB ─────────────────────────────────── */}
      {activeTab === "create" && (
        <div className="card">
          <div className="card-header">
            <h3>➕ Buat Task Baru</h3>
            <span style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>
              Budget tersedia: <strong style={{ color: "var(--brand)" }}>{formatRupiah(pmBudget)}</strong>
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Deskripsi Pekerjaan *</label>
            <textarea className="form-textarea" rows={2} placeholder="Misal: Membuat fitur login dan dashboard"
              value={desc} onChange={e => setDesc(e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                {["IT","Finance","Marketing","HR","Legal","Operasional","Riset","Desain","Lainnya"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Project ID (0 = standalone)</label>
              <input type="number" className="form-input" placeholder="0" min="0"
                value={projectId} onChange={e => setProjectId(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Wallet Worker *</label>
            <input className="form-input mono" placeholder="0x..."
              value={worker} onChange={e => setWorker(e.target.value)} style={{ fontSize: ".82rem" }} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Deadline (opsional)</label>
              <input type="datetime-local" className="form-input"
                value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Auto-Approve (hari)</label>
              <input type="number" className="form-input" placeholder="7" min="1" max="30"
                value={autoApprove} onChange={e => setAutoApprove(e.target.value)} />
              <div className="form-hint">Task otomatis approve setelah {autoApprove} hari jika PM tidak review</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Gaji Bruto (Rupiah) *</label>
            <input type="number" className="form-input" placeholder="1000000"
              value={salary} onChange={e => setSalary(e.target.value)} />

            {/* Tax Preview Box */}
            {taxPreview && (
              <div className="tax-box">
                <div className="tax-row">
                  <span className="tax-label">Gaji Bruto</span>
                  <span className="tax-val">{formatRupiah(taxPreview.gross)}</span>
                </div>
                <div className="tax-row deduct">
                  <span className="tax-label">
                    PPh 21
                    <span className="tax-bracket">Bracket {taxPreview.rate}%</span>
                  </span>
                  <span className="tax-val">− {formatRupiah(taxPreview.tax)}</span>
                </div>
                <div className="tax-row total">
                  <span className="tax-label">💚 Gaji Bersih Worker</span>
                  <span className="tax-val">{formatRupiah(taxPreview.net)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Milestone Toggle */}
          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: ".6rem", cursor: "pointer" }}>
              <input type="checkbox" checked={isMilestone} onChange={e => setIsMilestone(e.target.checked)} />
              <span className="form-label" style={{ margin: 0 }}>⚡ Gunakan Milestone (bayar bertahap)</span>
            </label>
          </div>

          {isMilestone && (
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)", padding: "1rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".75rem" }}>
                <span style={{ fontSize: ".85rem", fontWeight: 700 }}>Daftar Milestone</span>
                <span style={{ fontSize: ".78rem", color: msTotal === Number(salary) ? "var(--brand)" : "var(--accent-rose)" }}>
                  Total: {formatRupiah(msTotal)} / {formatRupiah(salary)}
                </span>
              </div>
              {milestones.map((m, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto",
                  gap: ".5rem", alignItems: "center", marginBottom: ".5rem" }}>
                  <input className="form-input" placeholder={`Deskripsi milestone ${i+1}`}
                    value={m.desc} onChange={e => updateMilestone(i, "desc", e.target.value)} />
                  <input type="number" className="form-input" placeholder="Nominal"
                    style={{ width: "130px" }} value={m.amount}
                    onChange={e => updateMilestone(i, "amount", e.target.value)} />
                  {milestones.length > 1 && (
                    <button className="btn btn-danger btn-sm" onClick={() => removeMilestone(i)}>✕</button>
                  )}
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={addMilestone}>+ Tambah Milestone</button>
            </div>
          )}

          <button className="btn btn-primary btn-full" onClick={handleCreateTask}
            disabled={actionLoading || !desc || !worker || !salary ||
              (isMilestone && msTotal !== Number(salary))}>
            {actionLoading ? <><span className="spinner" /> Memproses...</> : "🔒 Buat & Kunci Dana"}
          </button>
        </div>
      )}

      {/* ── TASKS TAB ──────────────────────────────────────── */}
      {activeTab === "tasks" && (
        <div>
          <div className="section-header">
            <h3 className="section-title">Semua Task ({tasks.length})</h3>
            <button className="btn btn-ghost btn-sm" onClick={fetchTasks} disabled={loading}>
              {loading ? <span className="spinner" /> : "🔄"}
            </button>
          </div>
          {loading ? (
            <div className="empty-state"><span className="spinner" /></div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>Belum ada task. Buat task dari tab "Buat Task".</p>
            </div>
          ) : (
            tasks.map(t => (
              <TaskCard key={Number(t.id)} task={t}
                milestones={milestoneMap[Number(t.id)]}
                role="pm" onAction={handleAction}
                onMsAction={handleMsAction} loading={actionLoading} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PMDashboard;
