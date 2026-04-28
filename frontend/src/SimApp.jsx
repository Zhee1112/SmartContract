import { useState, useCallback } from "react";
import { useSimulation } from "./hooks/useSimulation";
import { formatRupiah } from "./hooks/useWeb3";
import PMPanel     from "./components/sim/PMPanel";
import WorkerPanel from "./components/sim/WorkerPanel";

// ── Toast ─────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((type, msg) => {
    const id = Date.now();
    setToasts(p => [...p, { id, type, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
  }, []);
  return { toasts, add };
}

// ── Status Badge ──────────────────────────────────────────────
const S_LABEL = ["OPEN","CLAIMED","SUBMITTED","APPROVED","COMPLETED","DISPUTED","CANCELLED"];
const S_CLASS = ["open","claimed","submitted","approved","completed","disputed","cancelled"];
const StatusBadge = ({ s }) => <span className={`badge badge-${S_CLASS[s]}`}>{S_LABEL[s]}</span>;

// ── Admin/Arbitrator Panel (inline) ───────────────────────────
function AdminSim({ sim, notify }) {
  const { openDisputes, resolveDispute, mintToken, totalTaxCollected,
    totalSupply, tasks, loading } = sim;
  const [mintTo,  setMintTo]  = useState("");
  const [mintAmt, setMintAmt] = useState("");
  const [resNote, setResNote] = useState("");
  const [favor,   setFavor]   = useState(true);
  const [selTask, setSelTask] = useState("");

  return (
    <div style={{height: "100%", display: "flex", flexDirection: "column"}}>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Supply IDRT</div>
          <div className="stat-value green">{formatRupiah(totalSupply)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">PPh 21 Terkumpul (Kas Negara)</div>
          <div className="stat-value amber">{formatRupiah(totalTaxCollected)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dispute Aktif</div>
          <div className="stat-value" style={{color:openDisputes.length>0?"var(--accent-rose)":"inherit"}}>{openDisputes.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Task Sistem</div>
          <div className="stat-value">{tasks.length}</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem"}}>
        {/* Mint Token */}
        <div className="card">
          <div className="card-header"><h3>🪙 Mint Token IDRT</h3></div>
          <div className="form-group">
            <label className="form-label">Penerima</label>
            <select className="form-select" value={mintTo} onChange={e=>setMintTo(e.target.value)}>
              <option value="">-- Pilih akun --</option>
              <option value="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266">Deployer</option>
              <option value="0x90F79bf6EB2c4f870365E785982E1f101E93b906">Budi (PM)</option>
              <option value="0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65">Andi (Worker)</option>
              <option value="0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc">Sari (Worker)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Jumlah (Rupiah)</label>
            <input type="number" className="form-input" placeholder="10000000"
              value={mintAmt} onChange={e=>setMintAmt(e.target.value)}/>
          </div>
          <button className="btn btn-primary btn-full" disabled={loading||!mintTo||!mintAmt}
            onClick={async()=>{
              try{ await mintToken(mintTo, mintAmt);
                notify("success",`Minted ${formatRupiah(mintAmt)} IDRT!`);
                setMintTo(""); setMintAmt("");
              }catch(e){notify("error",e.message);}
            }}>
            {loading?<><span className="spinner"/> Memproses...</>:"🪙 Mint Token"}
          </button>
        </div>

        {/* Dispute Resolution */}
        <div className="card">
          <div className="card-header">
            <h3>⚖️ Resolusi Dispute</h3>
            {openDisputes.length>0 && <span className="badge badge-disputed">{openDisputes.length}</span>}
          </div>
          {openDisputes.length === 0 ? (
            <div style={{padding:"2rem",textAlign:"center",color:"var(--text-muted)",fontSize:"13px"}}>
              <div style={{fontSize:"24px",marginBottom:".5rem"}}>✅</div>
              Tidak ada dispute aktif.
            </div>
          ) : (
            <div style={{maxHeight:"250px",overflowY:"auto",marginBottom:"1.5rem"}}>
              {openDisputes.map(d => (
                <div key={d.taskId} style={{background:"var(--bg-elevated)",border:"1px solid var(--border)",padding:".75rem",borderRadius:"var(--radius-sm)",marginBottom:".5rem"}}>
                  <div style={{fontSize:"11px",color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginBottom:".25rem"}}>PAY-{String(d.taskId).padStart(3,"0")}</div>
                  <div style={{fontSize:"13px",fontWeight:500,color:"var(--accent-rose)",marginBottom:".25rem"}}>{tasks.find(t=>t.id===d.taskId)?.desc}</div>
                  <div style={{fontSize:"12px",color:"var(--text-secondary)"}}><strong>Alasan:</strong> {d.reason}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{borderTop:"1px solid var(--border)",paddingTop:"1.5rem"}}>
            <div className="form-group">
              <label className="form-label">ID Task Bersengketa</label>
              <input type="number" className="form-input" value={selTask} onChange={e=>setSelTask(e.target.value)} placeholder="1"/>
            </div>
            <div className="form-group">
              <label className="form-label">Keputusan Arbitrator</label>
              <select className="form-select" value={favor?"w":"p"} onChange={e=>setFavor(e.target.value==="w")}>
                <option value="w">✅ Menangkan Worker (Bayar Gaji)</option>
                <option value="p">❌ Menangkan PM (Batalkan & Kembalikan Dana)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Catatan Resmi Arbitrase</label>
              <textarea className="form-textarea" rows={2} placeholder="Penjelasan keputusan..." value={resNote} onChange={e=>setResNote(e.target.value)}/>
            </div>
            <button className="btn btn-primary btn-full" disabled={loading||!selTask||!resNote}
              onClick={async()=>{
                try{ await resolveDispute(Number(selTask), favor, resNote);
                  notify("success",`Dispute Task #${selTask} diselesaikan!`);
                  setSelTask(""); setResNote("");
                }catch(e){notify("error",e.message);}
              }}>
              {loading?<><span className="spinner"/> Memproses...</>:"⚖️ Eksekusi Resolusi (Final)"}
            </button>
          </div>
        </div>
      </div>

      {/* Task log */}
      <div className="card" style={{marginTop:"1.5rem",flex:1}}>
        <div className="card-header"><h3>📋 Seluruh Log Task (Global)</h3></div>
        {tasks.length===0 ? <div style={{padding:"2rem",textAlign:"center",color:"var(--text-muted)",fontSize:"13px"}}>Belum ada task di sistem.</div> : (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
              <thead>
                <tr style={{borderBottom:"1px solid var(--border-light)",textAlign:"left",color:"var(--text-secondary)"}}>
                  <th style={{padding:".75rem",fontWeight:500,width:"60px"}}>ID</th>
                  <th style={{padding:".75rem",fontWeight:500}}>Deskripsi</th>
                  <th style={{padding:".75rem",fontWeight:500}}>Kategori</th>
                  <th style={{padding:".75rem",fontWeight:500}}>Gaji Bruto</th>
                  <th style={{padding:".75rem",fontWeight:500}}>PPh</th>
                  <th style={{padding:".75rem",fontWeight:500}}>Bersih</th>
                  <th style={{padding:".75rem",fontWeight:500}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...tasks].reverse().map(t => (
                  <tr key={t.id} style={{borderBottom:"1px solid var(--border-light)",transition:"background .2s"}} onMouseOver={e=>e.currentTarget.style.background="var(--bg-hover)"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:".75rem"}} className="mono">PAY-{String(t.id).padStart(3,"0")}</td>
                    <td style={{padding:".75rem",maxWidth:250,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:500}}>{t.desc}</td>
                    <td style={{padding:".75rem"}}><div className="chip">{t.category}</div></td>
                    <td style={{padding:".75rem"}} className="mono">{formatRupiah(t.grossSalary)}</td>
                    <td style={{padding:".75rem",color:"var(--accent-amber)"}} className="mono">{formatRupiah(t.taxAmount)}</td>
                    <td style={{padding:".75rem",color:"var(--brand)",fontWeight:600}} className="mono">{formatRupiah(t.netSalary)}</td>
                    <td style={{padding:".75rem"}}><StatusBadge s={t.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main SimApp ───────────────────────────────────────────────
export default function SimApp({ onBack }) {
  const sim = useSimulation();
  const { toasts, add: notify } = useToast();
  const { account, currentAcct, setCurrentAcct, ACCOUNTS,
    balance, pmBudget, reset } = sim;

  const [page, setPage] = useState("pm");

  const NAV = [
    { id:"pm",     icon:"👔", label:"PM Board" },
    { id:"worker", icon:"🧑‍💻", label:"Worker Board" },
    { id:"admin",  icon:"⚙️",  label:"Admin / Arbitrator" },
  ];

  return (
    <div className="app-shell">
      {/* Topbar */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo" style={{background:"var(--brand)"}}>IDR</div>
          <div>
            <div className="brand-text">IDR Payroll System</div>
            <div className="brand-sub" style={{color:"var(--accent-emerald)"}}>Sistem Aktif</div>
          </div>
        </div>
        <div className="topbar-right">
          <div className="badge badge-submitted" style={{marginRight:"1rem"}}>
            🎭 MODE DEMO
          </div>
          {onBack && (
            <button className="btn btn-ghost btn-sm" onClick={onBack}>
              ← Beranda
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={()=>{if(confirm("Reset semua data simulasi?"))reset();}}>
            🔄 Reset Data
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="sidebar">
        {/* User Switcher (Notion-like workspace switcher) */}
        <div style={{padding:"0 1rem",marginBottom:"1.5rem"}}>
          <div style={{fontSize:"11px",fontWeight:600,color:"var(--text-muted)",marginBottom:".5rem"}}>PENGGUNA AKTIF</div>
          <select className="form-select" style={{background:"var(--bg-elevated)",fontWeight:500,border:"none"}} 
            value={currentAcct} onChange={e=>setCurrentAcct(e.target.value)}>
            {Object.entries(ACCOUNTS).map(([key, acc]) => (
              <option key={key} value={key}>
                {acc.role==="admin"?"👑":acc.role==="pm"?"👔":acc.role==="worker"?"🧑‍💻":"🏦"} {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Page Nav */}
        <div className="nav-section-label">WORKSPACE</div>
        {NAV.map(n => (
          <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
            <span className="nav-icon">{n.icon}</span>{n.label}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div style={{marginBottom:"2rem",display:"flex",alignItems:"center",gap:".5rem",color:"var(--text-secondary)",fontSize:"13px"}}>
          <span>{account.name}</span> <span style={{color:"var(--text-muted)"}}>/</span> <span style={{color:"var(--text-primary)",fontWeight:500}}>{NAV.find(n=>n.id===page)?.label}</span>
        </div>

        {page==="pm"     && <PMPanel     sim={sim} notify={notify}/>}
        {page==="worker" && <WorkerPanel sim={sim} notify={notify}/>}
        {page==="admin"  && <AdminSim    sim={sim} notify={notify}/>}
      </main>

      {/* Toasts */}
      <div style={{position:"fixed",bottom:"2rem",right:"2rem",zIndex:9999,display:"flex",flexDirection:"column",gap:".5rem",maxWidth:380}}>
        {toasts.map(t => (
          <div key={t.id} className={`alert alert-${t.type}`} style={{boxShadow:"var(--shadow-md)",animation:"slideIn .2s ease"}}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
