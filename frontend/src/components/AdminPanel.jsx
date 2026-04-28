import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { formatRupiah, formatDate, shortenAddr } from "../hooks/useWeb3";

const AdminPanel = ({ contracts, account, onNotify }) => {
  const { payroll, idrt } = contracts;

  const [info,        setInfo]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [actionLoad,  setActionLoad]  = useState(false);
  const [disputes,    setDisputes]    = useState([]);
  const [allTasks,    setAllTasks]    = useState([]);

  // Form state
  const [newTaxWallet,  setNewTaxWallet]  = useState("");
  const [newArbitrator, setNewArbitrator] = useState("");
  const [mintTo,        setMintTo]        = useState("");
  const [mintAmt,       setMintAmt]       = useState("");
  const [resolveTaskId, setResolveTaskId] = useState("");
  const [favorWorker,   setFavorWorker]   = useState(true);
  const [resolution,    setResolution]    = useState("");

  const fetchInfo = useCallback(async () => {
    if (!payroll || !idrt) return;
    setLoading(true);
    try {
      const [taxW, arb, owner, totalSupply] = await Promise.all([
        payroll.taxWallet(),
        payroll.disputeArbitrator(),
        payroll.owner(),
        idrt.totalSupply(),
      ]);
      setInfo({ taxWallet: taxW, arbitrator: arb, owner, totalSupply });

      // Scan disputes from tasks (simple approach)
      const taskCount = Number(await payroll.taskCounter());
      const ids = Array.from({ length: taskCount }, (_, i) => i + 1);
      const tasks = await Promise.all(ids.map(id => payroll.getTask(id)));
      setAllTasks(tasks);

      const openDisputes = [];
      for (const t of tasks) {
        if (Number(t.status) === 5) {
          const d = await payroll.getDispute(t.id);
          openDisputes.push({ task: t, dispute: d });
        }
      }
      setDisputes(openDisputes);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [payroll, idrt]);

  useEffect(() => { fetchInfo(); }, [fetchInfo]);

  const handleSetTaxWallet = async () => {
    if (!ethers.isAddress(newTaxWallet)) { onNotify("error", "Alamat tidak valid"); return; }
    setActionLoad(true);
    try {
      const tx = await payroll.setTaxWallet(newTaxWallet);
      await tx.wait();
      onNotify("success", "✅ Tax wallet diperbarui!");
      setNewTaxWallet(""); fetchInfo();
    } catch (e) { onNotify("error", `❌ ${e.reason || e.message}`); }
    finally { setActionLoad(false); }
  };

  const handleSetArbitrator = async () => {
    if (!ethers.isAddress(newArbitrator)) { onNotify("error", "Alamat tidak valid"); return; }
    setActionLoad(true);
    try {
      const tx = await payroll.setArbitrator(newArbitrator);
      await tx.wait();
      onNotify("success", "✅ Arbitrator diperbarui!");
      setNewArbitrator(""); fetchInfo();
    } catch (e) { onNotify("error", `❌ ${e.reason || e.message}`); }
    finally { setActionLoad(false); }
  };

  const handleMint = async () => {
    if (!ethers.isAddress(mintTo) || !mintAmt) { onNotify("error", "Data tidak valid"); return; }
    setActionLoad(true);
    try {
      const tx = await idrt.mint(mintTo, BigInt(mintAmt));
      await tx.wait();
      onNotify("success", `✅ Minted ${formatRupiah(mintAmt)} IDRT ke ${shortenAddr(mintTo)}`);
      setMintTo(""); setMintAmt(""); fetchInfo();
    } catch (e) { onNotify("error", `❌ ${e.reason || e.message}`); }
    finally { setActionLoad(false); }
  };

  const handleResolveDispute = async () => {
    if (!resolveTaskId || !resolution) return;
    setActionLoad(true);
    try {
      onNotify("info", "⚖️ Menyelesaikan dispute...");
      const tx = await payroll.resolveDispute(Number(resolveTaskId), favorWorker, resolution);
      await tx.wait();
      onNotify("success", `✅ Dispute Task #${resolveTaskId} diselesaikan — ${favorWorker ? "Worker menang" : "PM menang"}`);
      setResolveTaskId(""); setResolution(""); fetchInfo();
    } catch (e) { onNotify("error", `❌ ${e.reason || e.message}`); }
    finally { setActionLoad(false); }
  };

  if (loading) return <div className="empty-state"><span className="spinner" /></div>;

  const totalPaid = allTasks
    .filter(t => Number(t.status) === 4)
    .reduce((s, t) => s + Number(t.taxAmount), 0);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">⚙️ Admin Panel</div>
          <div className="section-sub">Kelola sistem, arbitrase sengketa, dan mint token</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchInfo}>🔄 Refresh</button>
      </div>

      {/* ── System Info ───────────────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-label">Total Supply IDRT</div>
          <div className="stat-value green">{formatRupiah(info?.totalSupply)}</div>
          <div className="stat-sub">Token beredar</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total PPh 21 Disetor</div>
          <div className="stat-value amber">{formatRupiah(totalPaid)}</div>
          <div className="stat-sub">Dari {allTasks.filter(t => Number(t.status) === 4).length} task selesai</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dispute Aktif</div>
          <div className="stat-value" style={{ color: disputes.length > 0 ? "var(--accent-rose)" : "var(--text-muted)" }}>
            {disputes.length}
          </div>
          <div className="stat-sub">Menunggu arbitrase</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Task</div>
          <div className="stat-value">{allTasks.length}</div>
          <div className="stat-sub">Di semua PM</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>

        {/* ── Contract Addresses ─────────────────────────── */}
        <div className="card">
          <div className="card-header"><h3>📄 Alamat Kontrak</h3></div>
          {[
            ["Owner",      info?.owner],
            ["Tax Wallet", info?.taxWallet],
            ["Arbitrator", info?.arbitrator],
          ].map(([label, addr]) => (
            <div key={label} style={{ marginBottom: ".75rem" }}>
              <div className="task-meta-label">{label}</div>
              <div style={{ fontFamily: "monospace", fontSize: ".78rem",
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)", padding: ".4rem .75rem",
                color: "var(--text-primary)", wordBreak: "break-all" }}>
                {addr || "—"}
              </div>
            </div>
          ))}
        </div>

        {/* ── Mint IDRT ──────────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <h3>🪙 Mint Token IDRT</h3>
            <span style={{ fontSize: ".72rem", color: "var(--accent-amber)" }}>Only Owner</span>
          </div>
          <div className="alert alert-warn">
            ⚠️ Hanya pemilik kontrak yang bisa mencetak token baru.
          </div>
          <div className="form-group">
            <label className="form-label">Alamat Penerima</label>
            <input className="form-input mono" placeholder="0x..." style={{ fontSize: ".8rem" }}
              value={mintTo} onChange={e => setMintTo(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Jumlah (Rupiah)</label>
            <input type="number" className="form-input" placeholder="1000000"
              value={mintAmt} onChange={e => setMintAmt(e.target.value)} />
            {mintAmt && <div className="form-hint">= {formatRupiah(mintAmt)}</div>}
          </div>
          <button className="btn btn-primary btn-full" onClick={handleMint}
            disabled={actionLoad || !mintTo || !mintAmt}>
            {actionLoad ? <><span className="spinner" /> Memproses...</> : "🪙 Mint Token"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>

        {/* ── Update Tax Wallet ──────────────────────────── */}
        <div className="card">
          <div className="card-header"><h3>💼 Ganti Tax Wallet</h3></div>
          <div className="form-group">
            <label className="form-label">Alamat Wallet Pajak Baru</label>
            <input className="form-input mono" placeholder="0x..." style={{ fontSize: ".8rem" }}
              value={newTaxWallet} onChange={e => setNewTaxWallet(e.target.value)} />
          </div>
          <button className="btn btn-secondary btn-full" onClick={handleSetTaxWallet}
            disabled={actionLoad || !newTaxWallet}>
            {actionLoad ? <span className="spinner" /> : "💾 Simpan"}
          </button>
        </div>

        {/* ── Update Arbitrator ──────────────────────────── */}
        <div className="card">
          <div className="card-header"><h3>⚖️ Ganti Arbitrator</h3></div>
          <div className="form-group">
            <label className="form-label">Alamat Arbitrator Baru</label>
            <input className="form-input mono" placeholder="0x..." style={{ fontSize: ".8rem" }}
              value={newArbitrator} onChange={e => setNewArbitrator(e.target.value)} />
          </div>
          <button className="btn btn-secondary btn-full" onClick={handleSetArbitrator}
            disabled={actionLoad || !newArbitrator}>
            {actionLoad ? <span className="spinner" /> : "💾 Simpan"}
          </button>
        </div>
      </div>

      {/* ── Dispute Resolution ────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h3>⚖️ Resolusi Dispute</h3>
          {disputes.length > 0 && (
            <span className="nav-badge" style={{ fontSize: ".78rem" }}>{disputes.length} aktif</span>
          )}
        </div>

        {disputes.length === 0 ? (
          <div className="empty-state" style={{ padding: "1.5rem" }}>
            <div className="empty-icon">✅</div>
            <p>Tidak ada dispute aktif saat ini.</p>
          </div>
        ) : (
          <div style={{ marginBottom: "1.25rem" }}>
            {disputes.map(({ task, dispute }) => (
              <div key={Number(task.id)} className="dispute-panel" style={{ marginBottom: ".75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: ".78rem", color: "var(--accent-rose)", fontWeight: 700 }}>
                      ⚖️ DISPUTE — Task #{Number(task.id)}
                    </div>
                    <div style={{ fontSize: ".85rem", fontWeight: 600, margin: ".25rem 0" }}>
                      {task.description}
                    </div>
                    <div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>
                      Worker: {shortenAddr(task.worker)} · Gaji: {formatRupiah(task.grossSalary)}
                    </div>
                    <div style={{ fontSize: ".78rem", color: "var(--text-secondary)", marginTop: ".35rem" }}>
                      <strong>Alasan:</strong> {dispute.reason}
                    </div>
                    <div style={{ fontSize: ".72rem", color: "var(--text-muted)", marginTop: ".2rem" }}>
                      Diajukan: {formatDate(dispute.raisedAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resolve Form */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: ".5rem" }}>
          <div className="section-title" style={{ marginBottom: ".75rem", fontSize: ".9rem" }}>
            Resolusi Manual
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Task ID</label>
              <input type="number" className="form-input" placeholder="1"
                value={resolveTaskId} onChange={e => setResolveTaskId(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Keputusan</label>
              <select className="form-select" value={favorWorker ? "worker" : "pm"}
                onChange={e => setFavorWorker(e.target.value === "worker")}>
                <option value="worker">✅ Worker Menang (bayar gaji)</option>
                <option value="pm">❌ PM Menang (batalkan task)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Catatan Resolusi</label>
            <textarea className="form-textarea" rows={2}
              placeholder="Penjelasan keputusan arbitrator..."
              value={resolution} onChange={e => setResolution(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleResolveDispute}
            disabled={actionLoad || !resolveTaskId || !resolution}>
            {actionLoad ? <><span className="spinner" /> Memproses...</> : "⚖️ Eksekusi Resolusi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
