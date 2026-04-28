import { useState, useEffect, useCallback } from "react";
import { formatRupiah, formatDate, shortenAddr } from "../hooks/useWeb3";

/**
 * AnalyticsDashboard — Visualisasi penggajian menggunakan SVG murni.
 * Menampilkan: spending chart, tax summary, task distribution,
 * top workers, dan budget utilization per kategori.
 */
const AnalyticsDashboard = ({ contracts, account }) => {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!contracts || !account) return;
    setLoading(true);
    try {
      const ids      = await contracts.payroll.getTasksByPM(account);
      const results  = await Promise.all(ids.map(id => contracts.payroll.getTask(id)));
      setTasks(results);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [contracts, account]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return (
    <div className="empty-state"><span className="spinner" /><p style={{ marginTop: ".75rem" }}>Memuat data analitik...</p></div>
  );

  // ── Compute Metrics ──────────────────────────────────────────
  const completed  = tasks.filter(t => Number(t.status) === 4);
  const disputed   = tasks.filter(t => Number(t.status) === 5);
  const inProgress = tasks.filter(t => [1,2,3].includes(Number(t.status)));
  const cancelled  = tasks.filter(t => Number(t.status) === 6);

  const totalGross = tasks.reduce((s, t) => s + Number(t.grossSalary), 0);
  const totalNet   = completed.reduce((s, t) => s + Number(t.netSalary), 0);
  const totalTax   = completed.reduce((s, t) => s + Number(t.taxAmount), 0);

  // Spending by category
  const byCategory = {};
  tasks.forEach(t => {
    const cat = t.category || "Lainnya";
    if (!byCategory[cat]) byCategory[cat] = { gross: 0, count: 0 };
    byCategory[cat].gross += Number(t.grossSalary);
    byCategory[cat].count++;
  });

  // Worker leaderboard
  const workerMap = {};
  completed.forEach(t => {
    const w = t.worker;
    if (!workerMap[w]) workerMap[w] = { earned: 0, count: 0, totalRating: 0 };
    workerMap[w].earned      += Number(t.netSalary);
    workerMap[w].count++;
    if (t.workerRating) workerMap[w].totalRating += Number(t.workerRating);
  });
  const topWorkers = Object.entries(workerMap)
    .map(([addr, d]) => ({ addr, ...d, avgRating: d.count ? (d.totalRating / d.count).toFixed(1) : "—" }))
    .sort((a, b) => b.earned - a.earned).slice(0, 5);

  // Tax brackets distribution
  const bracket5  = completed.filter(t => Number(t.taxRate) === 5).length;
  const bracket15 = completed.filter(t => Number(t.taxRate) === 15).length;
  const bracket25 = completed.filter(t => Number(t.taxRate) === 25).length;
  const bracket30 = completed.filter(t => Number(t.taxRate) === 30).length;

  // Donut chart data for task status
  const donutData = [
    { label: "Selesai",     count: completed.length,  color: "#10b981" },
    { label: "Berlangsung", count: inProgress.length, color: "#3b82f6" },
    { label: "Dispute",     count: disputed.length,   color: "#f43f5e" },
    { label: "Dibatalkan",  count: cancelled.length,  color: "#475569" },
  ];
  const total = tasks.length || 1;

  // ── SVG Bar Chart ─────────────────────────────────────────────
  const BarChart = ({ data }) => {
    const max    = Math.max(...data.map(d => d.value), 1);
    const width  = 100 / data.length;
    return (
      <svg viewBox={`0 0 ${data.length * 60} 120`} style={{ width: "100%", height: "120px" }}>
        {data.map((d, i) => {
          const barH = (d.value / max) * 80;
          const x    = i * 60 + 8;
          return (
            <g key={i}>
              <rect x={x} y={90 - barH} width={44} height={barH}
                fill={d.color || "#10b981"} rx={4} opacity={.85} className="chart-bar" />
              <text x={x + 22} y={108} textAnchor="middle" fontSize={9} fill="#4a6278">{d.label}</text>
              <text x={x + 22} y={86 - barH} textAnchor="middle" fontSize={8} fill="#7a90a8">
                {d.value > 0 ? formatRupiah(d.value).replace("Rp\u00a0","").replace(/\./g, "K").slice(0,6) : ""}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // ── SVG Donut ─────────────────────────────────────────────────
  const Donut = ({ data }) => {
    const r = 36; const cx = 50; const cy = 50; const stroke = 14;
    let offset = 0;
    const circumference = 2 * Math.PI * r;
    const segments = data.filter(d => d.count > 0).map(d => {
      const pct  = d.count / total;
      const dash = circumference * pct;
      const seg  = { ...d, dash, gap: circumference - dash, offset: circumference * offset };
      offset    += pct;
      return seg;
    });
    return (
      <svg viewBox="0 0 100 100" style={{ width: "140px", height: "140px" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1c2f47" strokeWidth={stroke} />
        {segments.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color}
            strokeWidth={stroke} strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset + circumference * .25}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px", transition: "all .4s" }} />
        ))}
        <text x={cx} y={cy - 3} textAnchor="middle" fontSize={14} fontWeight={800} fill="#dce8f5">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={7} fill="#4a6278">Task</text>
      </svg>
    );
  };

  const catKeys = Object.keys(byCategory);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">📊 Analytics & Laporan</div>
          <div className="section-sub">Ringkasan penggajian dan performa proyek</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAll}>🔄 Refresh</button>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Anggaran Dipakai</div>
          <div className="stat-value green">{formatRupiah(totalGross)}</div>
          <div className="stat-sub">{tasks.length} task total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Gaji Bersih Dibayar</div>
          <div className="stat-value blue">{formatRupiah(totalNet)}</div>
          <div className="stat-sub">{completed.length} task selesai</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">PPh 21 Disetor Negara</div>
          <div className="stat-value amber">{formatRupiah(totalTax)}</div>
          <div className="stat-sub">
            {totalGross > 0 ? ((totalTax / totalNet) * 100).toFixed(1) : 0}% dari gaji bersih
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tingkat Keberhasilan</div>
          <div className="stat-value violet">
            {tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0}%
          </div>
          <div className="stat-sub">{disputed.length} dispute · {cancelled.length} dibatalkan</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>

        {/* ── Distribusi Status ────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <h3>🍩 Distribusi Status Task</h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Donut data={donutData} />
            <div style={{ flex: 1 }}>
              {donutData.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: ".6rem",
                  padding: ".4rem 0", borderBottom: i < donutData.length-1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: ".8rem", color: "var(--text-secondary)", flex: 1 }}>{d.label}</span>
                  <span style={{ fontSize: ".85rem", fontWeight: 700, fontFamily: "monospace" }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PPh 21 Brackets ─────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <h3>📐 Distribusi Bracket PPh 21</h3>
          </div>
          {completed.length === 0 ? (
            <div className="empty-state" style={{ padding: "1.5rem" }}>
              <div className="empty-icon" style={{ fontSize: "1.5rem" }}>📭</div>
              <p style={{ fontSize: ".78rem" }}>Belum ada task selesai</p>
            </div>
          ) : (
            [
              { label: "5% (≤60Jt)",   count: bracket5,  color: "#10b981" },
              { label: "15% (≤250Jt)", count: bracket15, color: "#3b82f6" },
              { label: "25% (≤500Jt)", count: bracket25, color: "#f59e0b" },
              { label: "30% (>500Jt)", count: bracket30, color: "#f43f5e" },
            ].map((b, i) => (
              <div key={i} style={{ marginBottom: ".75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem",
                  color: "var(--text-secondary)", marginBottom: ".25rem" }}>
                  <span>{b.label}</span>
                  <span style={{ color: b.color, fontWeight: 700 }}>{b.count} task</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${completed.length > 0 ? (b.count / completed.length) * 100 : 0}%`,
                    background: b.color }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

        {/* ── Budget per Kategori ──────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <h3>📂 Budget per Kategori</h3>
          </div>
          {catKeys.length === 0 ? (
            <div className="empty-state" style={{ padding: "1.5rem" }}>
              <div className="empty-icon" style={{ fontSize: "1.5rem" }}>📭</div>
              <p style={{ fontSize: ".78rem" }}>Belum ada data</p>
            </div>
          ) : (
            <BarChart data={catKeys.map((k, i) => ({
              label: k.slice(0, 8),
              value: byCategory[k].gross,
              color: ["#10b981","#3b82f6","#f59e0b","#8b5cf6","#f43f5e"][i % 5]
            }))} />
          )}
          {catKeys.length > 0 && (
            <table className="data-table" style={{ marginTop: ".75rem" }}>
              <thead><tr><th>Kategori</th><th>Task</th><th>Total Budget</th></tr></thead>
              <tbody>
                {catKeys.map(k => (
                  <tr key={k}>
                    <td>{k}</td>
                    <td>{byCategory[k].count}</td>
                    <td style={{ fontFamily: "monospace", color: "var(--brand)" }}>
                      {formatRupiah(byCategory[k].gross)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Top Workers ──────────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <h3>🏆 Top Workers</h3>
          </div>
          {topWorkers.length === 0 ? (
            <div className="empty-state" style={{ padding: "1.5rem" }}>
              <div className="empty-icon" style={{ fontSize: "1.5rem" }}>👥</div>
              <p style={{ fontSize: ".78rem" }}>Belum ada worker selesai</p>
            </div>
          ) : (
            <table className="data-table">
              <thead><tr><th>#</th><th>Worker</th><th>Task</th><th>Rating</th><th>Total</th></tr></thead>
              <tbody>
                {topWorkers.map((w, i) => (
                  <tr key={w.addr}>
                    <td style={{ fontWeight: 700, color: ["#f59e0b","#94a3b8","#92400e"][i] || "var(--text-muted)" }}>
                      {["🥇","🥈","🥉"][i] || `#${i+1}`}
                    </td>
                    <td className="mono" style={{ fontSize: ".75rem" }}>{shortenAddr(w.addr)}</td>
                    <td style={{ textAlign: "center" }}>{w.count}</td>
                    <td style={{ color: "var(--accent-amber)" }}>★ {w.avgRating}</td>
                    <td style={{ fontFamily: "monospace", color: "var(--brand)", fontWeight: 700 }}>
                      {formatRupiah(w.earned)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
