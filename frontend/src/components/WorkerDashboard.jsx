import { useState, useEffect, useCallback } from "react";
import { formatRupiah, formatDate } from "../hooks/useWeb3";
import TaskCard, { StarRating } from "./TaskCard";

const WorkerDashboard = ({ contracts, account, balance, refreshBalance, onNotify }) => {
  const { payroll } = contracts;

  const [tasks,         setTasks]         = useState([]);
  const [milestoneMap,  setMilestoneMap]  = useState({});
  const [workerStats,   setWorkerStats]   = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter,        setFilter]        = useState("all");

  const fetchTasks = useCallback(async () => {
    if (!payroll || !account) return;
    setLoading(true);
    try {
      const ids     = await payroll.getTasksByWorker(account);
      const results = await Promise.all(ids.map(id => payroll.getTask(id)));
      const reversed = [...results].reverse();
      setTasks(reversed);

      const msMap = {};
      await Promise.all(
        reversed.filter(t => t.isMilestone).map(async t => {
          msMap[Number(t.id)] = await payroll.getMilestones(t.id);
        })
      );
      setMilestoneMap(msMap);

      const stats = await payroll.getWorkerStats(account);
      setWorkerStats(stats);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [payroll, account]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleAction = async (action, taskId, extra = "") => {
    setActionLoading(true);
    try {
      let tx;
      if (action === "claim") {
        onNotify("info", "⏳ Mengklaim task...");
        tx = await payroll.claimTask(taskId);
        await tx.wait();
        onNotify("success", `🤝 Task #${taskId} diklaim!`);
      } else if (action === "submit") {
        onNotify("info", "⏳ Mengirim bukti kerja...");
        tx = await payroll.submitWork(taskId, extra);
        await tx.wait();
        onNotify("success", "📤 Bukti terkirim! Tunggu persetujuan PM.");
      } else if (action === "dispute") {
        onNotify("info", "⚖️ Mengajukan dispute...");
        tx = await payroll.raiseDispute(taskId, extra);
        await tx.wait();
        onNotify("warn", "⚖️ Dispute diajukan. Arbitrator akan meninjau.");
      }
      await refreshBalance(account);
      await fetchTasks();
    } catch (e) { onNotify("error", `❌ ${e.reason || e.message}`); }
    finally { setActionLoading(false); }
  };

  const handleMsAction = async (action, taskId, idx, proof = "") => {
    setActionLoading(true);
    try {
      if (action === "submitMs") {
        onNotify("info", `⏳ Submit milestone ${idx+1}...`);
        const tx = await payroll.submitMilestone(taskId, idx, proof);
        await tx.wait();
        onNotify("success", `✅ Milestone ${idx+1} berhasil disubmit!`);
      }
      await fetchTasks();
    } catch (e) { onNotify("error", `❌ ${e.reason || e.message}`); }
    finally { setActionLoading(false); }
  };

  // Filter
  const filtered = tasks.filter(t => {
    const s = Number(t.status);
    if (filter === "active")    return [0,1,2,3].includes(s);
    if (filter === "completed") return s === 4;
    if (filter === "disputed")  return s === 5;
    return true;
  });

  // Stats
  const earned     = workerStats ? Number(workerStats[0]) : 0;
  const completed  = workerStats ? Number(workerStats[1]) : 0;
  const avgRating  = workerStats ? (Number(workerStats[2]) / 10).toFixed(1) : "—";
  const disputed   = tasks.filter(t => Number(t.status) === 5).length;
  const openCount  = tasks.filter(t => Number(t.status) === 0).length;

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
          <div className="stat-label">Total Penghasilan</div>
          <div className="stat-value blue">{formatRupiah(earned)}</div>
          <div className="stat-sub">{completed} task selesai</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rata-rata Rating</div>
          <div className="stat-value amber">
            {avgRating !== "—" ? `⭐ ${avgRating}` : "—"}
          </div>
          <div className="stat-sub">Dari PM</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Task Tersedia</div>
          <div className="stat-value">{openCount}</div>
          <div className="stat-sub">{disputed} dispute aktif</div>
        </div>
      </div>

      {/* Info PPh */}
      <div className="alert alert-info" style={{ marginBottom: "1.25rem" }}>
        <span>ℹ️</span>
        <div>
          <strong>Gaji otomatis setelah pajak.</strong> Semua gaji yang kamu terima sudah dipotong
          PPh 21 secara progresif (5–30%) langsung oleh smart contract. Kamu tidak perlu lapor manual.
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: ".35rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {[["all","Semua"],["active","Aktif"],["completed","Selesai"],["disputed","Dispute"]].map(([k, l]) => (
          <button key={k} className={`btn btn-sm ${filter === k ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter(k)}>
            {l} ({k === "all" ? tasks.length : k === "active" ? tasks.filter(t => [0,1,2,3].includes(Number(t.status))).length
              : k === "completed" ? tasks.filter(t => Number(t.status) === 4).length
              : tasks.filter(t => Number(t.status) === 5).length})
          </button>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={fetchTasks} disabled={loading} style={{ marginLeft: "auto" }}>
          {loading ? <span className="spinner" /> : "🔄 Refresh"}
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="empty-state"><span className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>Tidak ada task dengan filter ini.</p>
        </div>
      ) : (
        filtered.map(t => (
          <TaskCard key={Number(t.id)} task={t}
            milestones={milestoneMap[Number(t.id)]}
            role="worker" onAction={handleAction}
            onMsAction={handleMsAction} loading={actionLoading} />
        ))
      )}
    </div>
  );
};

export default WorkerDashboard;
