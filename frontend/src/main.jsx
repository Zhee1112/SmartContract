import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import SimApp from "./SimApp.jsx";
import App    from "./App.jsx";
import "./index.css";

function Root() {
  const [mode, setMode] = useState(null); // null | "demo" | "real"
  if (mode === "demo") return <SimApp onBack={() => setMode(null)} />;
  if (mode === "real") return <App    onBack={() => setMode(null)} />;
  return <ModeSelector onSelect={setMode} />;
}

function ModeSelector({ onSelect }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "2rem", textAlign: "center",
    }}>
      {/* Badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: ".5rem",
        background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.25)",
        borderRadius: "9999px", padding: ".4rem 1.1rem",
        fontSize: ".72rem", fontWeight: 700, color: "var(--brand)",
        letterSpacing: ".07em", marginBottom: "2rem",
      }}>
        ⛓️ BLOCKCHAIN · RUPIAH DIGITAL · SMART CONTRACT
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: "3.5rem", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem",
        background: "linear-gradient(135deg, #dce8f5 0%, #10b981 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>
        IDR Payroll System
      </h1>
      <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", maxWidth: 520, lineHeight: 1.75, marginBottom: "3rem" }}>
        Sistem penggajian transparan berbasis <strong style={{color:"var(--text-primary)"}}>Ethereum Smart Contract</strong> dengan
        potongan PPh 21 otomatis, escrow, dan milestone payment.
      </p>

      {/* Mode Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", maxWidth: 740, width: "100%" }}>

        {/* Demo Mode */}
        <div onClick={() => onSelect("demo")} style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "2rem",
          cursor: "pointer", transition: "all .2s ease", textAlign: "left",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.boxShadow = "0 0 28px rgba(16,185,129,.18)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎭</div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: ".5rem" }}>Mode Demo</h2>
          <p style={{ fontSize: ".85rem", marginBottom: "1.5rem", lineHeight: 1.7 }}>
            Simulasi penuh <strong>tanpa MetaMask</strong>. Klik langsung, ganti peran (PM, Worker, Admin),
            dan coba semua fitur dengan data simulasi.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: ".4rem", marginBottom: "1.5rem" }}>
            {["✓ Tidak perlu wallet","✓ Ganti peran bebas","✓ Data disimpan lokal","✓ Ideal untuk presentasi"].map(f => (
              <div key={f} style={{ fontSize: ".8rem", color: "var(--text-secondary)" }}>{f}</div>
            ))}
          </div>
          <button className="btn btn-primary btn-full" id="btn-demo-mode">
            ⚡ Mulai Demo
          </button>
        </div>

        {/* Real Mode */}
        <div onClick={() => onSelect("real")} style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "2rem",
          cursor: "pointer", transition: "all .2s ease", textAlign: "left",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-blue)"; e.currentTarget.style.boxShadow = "0 0 28px rgba(59,130,246,.18)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🦊</div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: ".5rem" }}>Mode Real</h2>
          <p style={{ fontSize: ".85rem", marginBottom: "1.5rem", lineHeight: 1.7 }}>
            Koneksi ke <strong>blockchain Hardhat</strong> via MetaMask. Transaksi nyata,
            smart contract aktif, data on-chain dan permanen.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: ".4rem", marginBottom: "1.5rem" }}>
            {["✓ MetaMask diperlukan","✓ Transaksi on-chain nyata","✓ Smart contract aktif","✓ Butuh Hardhat node"].map(f => (
              <div key={f} style={{ fontSize: ".8rem", color: "var(--text-secondary)" }}>{f}</div>
            ))}
          </div>
          <button className="btn btn-secondary btn-full" id="btn-real-mode"
            style={{ borderColor: "var(--accent-blue)", color: "var(--accent-blue)" }}>
            🔗 Hubungkan MetaMask
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ marginTop: "2.5rem", display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        {["Escrow Aman","PPh 21 Progresif","Milestone Payment","Sistem Dispute","Rupiah Digital"].map(f => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: ".4rem",
            fontSize: ".8rem", color: "var(--text-muted)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand)" }} />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><Root /></React.StrictMode>
);
