import { useState, useEffect, useCallback } from "react";
import { formatRupiah, formatDate, shortenAddr } from "../hooks/useWeb3";

const ProjectDashboard = ({ contracts, account, onNotify }) => {
  const [projects,  setProjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [creating,  setCreating]  = useState(false);
  const [showForm,  setShowForm]  = useState(false);

  // Form state
  const [name,       setName]       = useState("");
  const [desc,       setDesc]       = useState("");
  const [category,   setCategory]   = useState("IT");
  const [budget,     setBudget]     = useState("");
  const [deadline,   setDeadline]   = useState("");
  const [multiAppr,  setMultiAppr]  = useState(false);
  const [threshold,  setThreshold]  = useState("");

  const fetchProjects = useCallback(async () => {
    if (!contracts || !account) return;
    setLoading(true);
    try {
      const ids     = await contracts.registry.getProjectsByLead(account);
      const results = await Promise.all(ids.map(id => contracts.registry.getProject(id)));
      setProjects([...results].reverse());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [contracts, account]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreate = async () => {
    if (!name || !budget || !deadline) return;
    setCreating(true);
    try {
      const deadlineTs = Math.floor(new Date(deadline).getTime() / 1000);
      const tx = await contracts.registry.createProject(
        name, desc, category, BigInt(budget),
        deadlineTs, multiAppr, multiAppr ? BigInt(threshold || 0) : 0n
      );
      await tx.wait();
      onNotify("success", `✅ Proyek "${name}" berhasil dibuat!`);
      setName(""); setDesc(""); setBudget(""); setDeadline(""); setShowForm(false);
      await fetchProjects();
    } catch (e) {
      onNotify("error", `❌ ${e.reason || e.message}`);
    } finally { setCreating(false); }
  };

  const STATUS_LABEL = ["🟢 AKTIF","⏸️ DIJEDA","✅ SELESAI","❌ BATAL"];
  const STATUS_COLOR = ["var(--brand)","var(--accent-amber)","var(--accent-blue)","var(--accent-rose)"];

  const now = Math.floor(Date.now() / 1000);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">🏗️ Manajemen Proyek</div>
          <div className="section-sub">Kelola anggaran, timeline, dan tim per proyek</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? "✕ Tutup" : "+ Buat Proyek"}
        </button>
      </div>

      {/* ── Create Project Form ─────────────────────────── */}
      {showForm && (
        <div className="card" style={{ marginBottom: "1.5rem", borderColor: "var(--brand)", boxShadow: "var(--shadow-glow)" }}>
          <div className="card-header">
            <h3>📋 Proyek Baru</h3>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nama Proyek *</label>
              <input className="form-input" placeholder="Sistem ERP Internal" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                {["IT","Finance","Marketing","HR","Legal","Operasional","Riset","Lainnya"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea className="form-textarea" rows={2} placeholder="Tujuan dan ruang lingkup proyek..."
              value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Anggaran (Rupiah) *</label>
              <input type="number" className="form-input" placeholder="50000000"
                value={budget} onChange={e => setBudget(e.target.value)} />
              {budget && <div className="form-hint">= {formatRupiah(budget)}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Deadline Proyek *</label>
              <input type="datetime-local" className="form-input"
                value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: ".6rem", cursor: "pointer" }}>
              <input type="checkbox" checked={multiAppr} onChange={e => setMultiAppr(e.target.checked)} />
              <span className="form-label" style={{ margin: 0 }}>Multi-Approval (butuh 2 PM untuk task dengan gaji tinggi)</span>
            </label>
          </div>
          {multiAppr && (
            <div className="form-group">
              <label className="form-label">Ambang Batas Multi-Approval (Rupiah)</label>
              <input type="number" className="form-input" placeholder="10000000"
                value={threshold} onChange={e => setThreshold(e.target.value)} />
              {threshold && <div className="form-hint">Task dengan gaji ≥ {formatRupiah(threshold)} butuh 2 approval</div>}
            </div>
          )}
          <button className="btn btn-primary" onClick={handleCreate}
            disabled={creating || !name || !budget || !deadline}>
            {creating ? <><span className="spinner" /> Membuat...</> : "🏗️ Buat Proyek"}
          </button>
        </div>
      )}

      {/* ── Project List ────────────────────────────────── */}
      {loading ? (
        <div className="empty-state"><span className="spinner" /></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏗️</div>
          <p>Belum ada proyek. Klik "Buat Proyek" untuk memulai.</p>
        </div>
      ) : (
        projects.map(p => {
          const statusIdx  = Number(p.status);
          const spent      = Number(p.spentBudget);
          const total      = Number(p.totalBudget);
          const utilPct    = total > 0 ? Math.round((spent / total) * 100) : 0;
          const taskPct    = Number(p.taskCount) > 0
            ? Math.round((Number(p.completedTasks) / Number(p.taskCount)) * 100) : 0;
          const overdue    = Number(p.deadline) < now && statusIdx === 0;

          return (
            <div key={Number(p.id)} className="card" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".85rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                    <span style={{ fontSize: ".65rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                      PRJ-{String(Number(p.id)).padStart(3,"0")}
                    </span>
                    <span style={{ fontSize: ".7rem", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                      borderRadius: "var(--radius-full)", padding: ".1rem .5rem", color: "var(--text-muted)" }}>
                      {p.category}
                    </span>
                    {overdue && <span className="badge badge-disputed">⚠️ Overdue</span>}
                  </div>
                  <h3 style={{ marginTop: ".25rem" }}>{p.name}</h3>
                  {p.description && <p style={{ fontSize: ".8rem", marginTop: ".2rem" }}>{p.description}</p>}
                </div>
                <span style={{ color: STATUS_COLOR[statusIdx], fontSize: ".8rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                  {STATUS_LABEL[statusIdx]}
                </span>
              </div>

              {/* Budget Utilization */}
              <div style={{ marginBottom: ".85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".75rem",
                  color: "var(--text-secondary)", marginBottom: ".3rem" }}>
                  <span>Anggaran Terpakai</span>
                  <span style={{ color: utilPct > 90 ? "var(--accent-rose)" : "var(--text-secondary)" }}>
                    {formatRupiah(spent)} / {formatRupiah(total)} ({utilPct}%)
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${utilPct}%`,
                    background: utilPct > 90 ? "var(--accent-rose)" : utilPct > 70 ? "var(--accent-amber)" : "var(--brand)"
                  }} />
                </div>
              </div>

              {/* Task Progress */}
              <div style={{ marginBottom: ".85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".75rem",
                  color: "var(--text-secondary)", marginBottom: ".3rem" }}>
                  <span>Penyelesaian Task</span>
                  <span>{Number(p.completedTasks)}/{Number(p.taskCount)} task ({taskPct}%)</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${taskPct}%`, background: "var(--accent-blue)" }} />
                </div>
              </div>

              {/* Meta row */}
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                <div>
                  <div className="task-meta-label">Mulai</div>
                  <div className="task-meta-value" style={{ fontSize: ".78rem" }}>{formatDate(p.startDate)}</div>
                </div>
                <div>
                  <div className="task-meta-label">Deadline</div>
                  <div className="task-meta-value" style={{ fontSize: ".78rem", color: overdue ? "var(--accent-rose)" : "inherit" }}>
                    {formatDate(p.deadline)}
                  </div>
                </div>
                <div>
                  <div className="task-meta-label">Sisa Anggaran</div>
                  <div className="task-meta-value brand" style={{ fontSize: ".85rem" }}>
                    {formatRupiah(total - spent)}
                  </div>
                </div>
                {p.requireMultiApproval && (
                  <div>
                    <div className="task-meta-label">Multi-Approval</div>
                    <div className="task-meta-value" style={{ fontSize: ".78rem", color: "var(--accent-violet)" }}>
                      ✓ Aktif (≥{formatRupiah(p.multiApprovalThreshold)})
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ProjectDashboard;
