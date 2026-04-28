import { useState, useCallback } from "react";
import { useWeb3, formatRupiah } from "./hooks/useWeb3";
import PMDashboard      from "./components/PMDashboard";
import WorkerDashboard  from "./components/WorkerDashboard";
import ProjectDashboard from "./components/ProjectDashboard";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import AdminPanel       from "./components/AdminPanel";

// Expose React globally so TaskCard can use window.React.useState
import React from "react";
window.React = React;

// ─── Toast Notifications ─────────────────────────────────────
const ToastStack = ({ toasts }) =>
  toasts.length === 0 ? null : (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast alert-${t.type}`}
          style={{
            background: t.type === "success" ? "rgba(16,185,129,.15)"
              : t.type === "error" ? "rgba(244,63,94,.15)"
              : t.type === "warn" ? "rgba(245,158,11,.15)"
              : "rgba(59,130,246,.15)",
            border: `1px solid ${t.type === "success" ? "rgba(16,185,129,.35)"
              : t.type === "error" ? "rgba(244,63,94,.35)"
              : t.type === "warn" ? "rgba(245,158,11,.35)"
              : "rgba(59,130,246,.35)"}`,
            color: t.type === "success" ? "#34d399"
              : t.type === "error" ? "#fb7185"
              : t.type === "warn" ? "#fbbf24"
              : "#60a5fa",
          }}>
          {t.message}
        </div>
      ))}
    </div>
  );

// ─── Hero / Connect Screen ────────────────────────────────────
const HeroScreen = ({ onConnect, isConnecting, error }) => (
  <div className="hero">
    <div className="hero-badge">⛓️ Blockchain · Rupiah Digital · Smart Contract</div>
    <h1>IDR Payroll System</h1>
    <p>
      Sistem penggajian transparan berbasis <strong>Ethereum Smart Contract</strong>.
      Gaji otomatis, pajak progresif terotomasi, escrow aman, milestone-based payment.
    </p>
    <div className="hero-features">
      {["Escrow Aman","PPh 21 Progresif","Milestone Payment","Sistem Dispute","Rupiah Digital (IDRT)","Transparan & Immutable"].map(f => (
        <div key={f} className="hero-feature">
          <div className="hero-dot" />
          <span>{f}</span>
        </div>
      ))}
    </div>
    {error && (
      <div className="alert alert-error" style={{ maxWidth: 480, marginBottom: "1rem" }}>
        ⚠️ {error}
      </div>
    )}
    <button className="btn btn-primary btn-lg" onClick={onConnect}
      disabled={isConnecting} id="btn-connect-wallet">
      {isConnecting ? <><span className="spinner" /> Menghubungkan...</> : "🦊 Hubungkan MetaMask"}
    </button>
    <p style={{ marginTop: "1rem", fontSize: ".78rem" }}>
      Butuh MetaMask · Jaringan Hardhat Local (Chain ID: 31337)
    </p>

    {/* Feature cards */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem",
      maxWidth: 760, margin: "3rem auto 0", width: "100%" }}>
      {[
        { icon: "🔒", title: "Escrow & Milestone", desc: "Dana dikunci hingga pekerjaan disetujui. Bayar bertahap per milestone." },
        { icon: "📊", title: "Progressive PPh 21", desc: "5-30% otomatis dipotong sesuai bracket penghasilan, langsung ke wallet pajak." },
        { icon: "⚖️", title: "Sistem Dispute", desc: "Worker dapat ajukan sengketa. Arbitrator independen menyelesaikan secara on-chain." },
      ].map(c => (
        <div key={c.title} className="card" style={{ textAlign: "left" }}>
          <div style={{ fontSize: "1.75rem", marginBottom: ".5rem" }}>{c.icon}</div>
          <h3 style={{ fontSize: ".9rem", marginBottom: ".4rem" }}>{c.title}</h3>
          <p style={{ fontSize: ".78rem" }}>{c.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Nav Config ───────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "pm",       icon: "👔", label: "Project Manager", section: "PM" },
  { id: "worker",   icon: "🧑‍💻", label: "Worker",          section: "PM" },
  { id: "projects", icon: "🏗️",  label: "Proyek",          section: "Manage" },
  { id: "analytics",icon: "📊", label: "Analytics",       section: "Manage" },
  { id: "admin",    icon: "⚙️",  label: "Admin Panel",     section: "System" },
];

const PAGE_TITLES = {
  pm:        { title: "Project Manager", sub: "Kelola task, budget, dan approval pembayaran" },
  worker:    { title: "Worker Dashboard", sub: "Lihat task, submit bukti, dan tracking penghasilan" },
  projects:  { title: "Manajemen Proyek", sub: "Buat proyek, pantau anggaran dan timeline" },
  analytics: { title: "Analytics", sub: "Laporan penggajian, pajak, dan performa tim" },
  admin:     { title: "Admin Panel", sub: "Konfigurasi sistem, arbitrase dispute, dan mint token" },
};

// ─── Main App ─────────────────────────────────────────────────
function App({ onBack }) {
  const web3 = useWeb3();
  const { isConnected, account, shortAddress, networkName,
          contracts, balance, pmBudget, workerStats,
          isConnecting, error: web3Error,
          connect, disconnect, refreshBalance } = web3;

  const [page,     setPage]     = useState("pm");
  const [toasts,   setToasts]   = useState([]);
  const [sideOpen, setSideOpen] = useState(false);

  // Notification system
  const notify = useCallback((type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const pageTitle = PAGE_TITLES[page];

  // Section grouping for sidebar
  const sections = ["PM", "Manage", "System"];

  return (
    <div>
      {!isConnected ? (
        <HeroScreen onConnect={connect} isConnecting={isConnecting} error={web3Error} />
      ) : (
        <div className="app-shell">

          {/* ── Topbar ─────────────────────────────────────── */}
          <header className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {/* Mobile burger */}
              <button className="btn btn-ghost btn-sm"
                style={{ display: "none" }} id="burger"
                onClick={() => setSideOpen(v => !v)}>☰</button>
              <div className="brand">
                <div className="brand-logo">Rp</div>
                <div>
                  <div className="brand-text">IDR Payroll System</div>
                  <div className="brand-sub">Rupiah Digital · v2.0</div>
                </div>
              </div>
            </div>

            <div className="topbar-right">
              <div className="chip">
                <div className="net-dot" />
                {networkName}
              </div>
              <div className="chip" style={{ fontFamily: "monospace" }}>
                💰 {formatRupiah(balance)}
              </div>
              <div className="chip mono" style={{ fontSize: ".72rem", letterSpacing: 0 }}>
                {shortAddress}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={disconnect} id="btn-disconnect">
                Keluar
              </button>
              {onBack && (
                <button className="btn btn-ghost btn-sm" onClick={onBack} id="btn-back-real">
                  ← Pilih Mode
                </button>
              )}
            </div>
          </header>

          {/* ── Sidebar ────────────────────────────────────── */}
          <aside className={`sidebar ${sideOpen ? "open" : ""}`}>
            {/* Wallet info mini */}
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)", padding: ".85rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: ".68rem", color: "var(--text-muted)", marginBottom: ".25rem", fontWeight: 600 }}>
                CONNECTED WALLET
              </div>
              <div style={{ fontFamily: "monospace", fontSize: ".75rem", color: "var(--brand)",
                wordBreak: "break-all", marginBottom: ".5rem" }}>
                {account}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".4rem" }}>
                <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
                  padding: ".4rem", textAlign: "center" }}>
                  <div style={{ fontSize: ".6rem", color: "var(--text-muted)", marginBottom: ".15rem" }}>IDRT</div>
                  <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--brand)",
                    fontFamily: "monospace" }}>
                    {formatRupiah(balance)}
                  </div>
                </div>
                <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
                  padding: ".4rem", textAlign: "center" }}>
                  <div style={{ fontSize: ".6rem", color: "var(--text-muted)", marginBottom: ".15rem" }}>BUDGET</div>
                  <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--accent-blue)",
                    fontFamily: "monospace" }}>
                    {formatRupiah(pmBudget)}
                  </div>
                </div>
              </div>
              {workerStats && Number(workerStats[1]) > 0 && (
                <div style={{ marginTop: ".4rem", fontSize: ".68rem", color: "var(--text-muted)",
                  textAlign: "center" }}>
                  ⭐ Worker Rating: {(Number(workerStats[2]) / 10).toFixed(1)} · {Number(workerStats[1])} task
                </div>
              )}
            </div>

            {/* Nav items */}
            {sections.map(section => {
              const items = NAV_ITEMS.filter(n => n.section === section);
              return (
                <div key={section}>
                  <div className="nav-section-label">{section}</div>
                  {items.map(item => (
                    <div key={item.id}
                      className={`nav-item ${page === item.id ? "active" : ""}`}
                      onClick={() => { setPage(item.id); setSideOpen(false); }}
                      id={`nav-${item.id}`}>
                      <span className="nav-icon">{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Quick stats at bottom */}
            <div style={{ marginTop: "auto", paddingTop: "1rem",
              borderTop: "1px solid var(--border)", fontSize: ".7rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: ".2rem 0" }}>
                <span>Contracts</span>
                <span style={{ color: "var(--brand)" }}>3 deployed</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: ".2rem 0" }}>
                <span>Network</span>
                <span>{networkName}</span>
              </div>
            </div>
          </aside>

          {/* ── Main Content ────────────────────────────────── */}
          <main className="main-content">
            {/* Page header */}
            <div style={{ marginBottom: "1.75rem" }}>
              <h2>{pageTitle.title}</h2>
              <p style={{ fontSize: ".82rem", marginTop: ".2rem" }}>{pageTitle.sub}</p>
            </div>

            {/* Route */}
            {page === "pm" && contracts && (
              <PMDashboard
                contracts={contracts}
                account={account}
                balance={balance}
                pmBudget={pmBudget}
                refreshBalance={refreshBalance}
                onNotify={notify}
              />
            )}
            {page === "worker" && contracts && (
              <WorkerDashboard
                contracts={contracts}
                account={account}
                balance={balance}
                refreshBalance={refreshBalance}
                onNotify={notify}
              />
            )}
            {page === "projects" && contracts && (
              <ProjectDashboard
                contracts={contracts}
                account={account}
                onNotify={notify}
              />
            )}
            {page === "analytics" && contracts && (
              <AnalyticsDashboard
                contracts={contracts}
                account={account}
              />
            )}
            {page === "admin" && contracts && (
              <AdminPanel
                contracts={contracts}
                account={account}
                onNotify={notify}
              />
            )}
          </main>
        </div>
      )}

      <ToastStack toasts={toasts} />
    </div>
  );
}

export default App;
