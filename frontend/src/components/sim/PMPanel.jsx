import { useState, useMemo } from "react";
import { calcTax } from "../../hooks/useSimulation";
import { formatRupiah } from "../../hooks/useWeb3";

// ── Icons ─────────────────────────────────────────────────────
const Icon = {
  Todo: () => <span style={{color:"var(--text-muted)"}}>⭕</span>,
  InProgress: () => <span style={{color:"var(--accent-blue)"}}>⏳</span>,
  Review: () => <span style={{color:"var(--accent-amber)"}}>👀</span>,
  Done: () => <span style={{color:"var(--accent-emerald)"}}>✅</span>,
  Dispute: () => <span style={{color:"var(--accent-rose)"}}>⚖️</span>,
  Cancel: () => <span style={{color:"var(--text-muted)"}}>🚫</span>,
};

// ── Kanban Column Mapping ─────────────────────────────────────
// 0: OPEN -> To Do
// 1: CLAIMED -> In Progress
// 2: SUBMITTED -> Review
// 4: COMPLETED -> Done
// 5: DISPUTED -> Review (or Dispute)
// 6: CANCELLED -> Done

const getColumn = (status) => {
  if (status === 0) return "todo";
  if (status === 1) return "inprogress";
  if (status === 2 || status === 5) return "review";
  if (status === 4 || status === 6) return "done";
  return "todo";
};

// ── Status Badge ──────────────────────────────────────────────
const S_LABEL = ["OPEN","CLAIMED","SUBMITTED","APPROVED","COMPLETED","DISPUTED","CANCELLED"];
const S_CLASS = ["open","claimed","submitted","approved","completed","disputed","cancelled"];
const StatusBadge = ({ s }) => (
  <span className={`badge badge-${S_CLASS[s]}`}>{S_LABEL[s]}</span>
);

// ── Tax Box ───────────────────────────────────────────────────
const TaxBox = ({ salary }) => {
  if (!salary || isNaN(salary) || Number(salary) <= 0) return null;
  const { gross, tax, net, rate } = calcTax(salary);
  return (
    <div className="tax-box">
      <div className="tax-row"><span className="tax-label">Gaji Bruto</span>
        <span className="tax-val">{formatRupiah(gross)}</span></div>
      <div className="tax-row deduct">
        <span className="tax-label">PPh 21 <span className="badge" style={{background:"transparent",border:"1px solid var(--accent-rose)",color:"var(--accent-rose)",marginLeft:".3rem",padding:"0 .2rem"}}>{rate}%</span></span>
        <span className="tax-val">− {formatRupiah(tax)}</span>
      </div>
      <div className="tax-row total"><span className="tax-label">Gaji Bersih</span>
        <span className="tax-val">{formatRupiah(net)}</span></div>
    </div>
  );
};

// ── Main PM Panel ─────────────────────────────────────────────
export default function PMPanel({ sim, notify }) {
  const { account, balance, pmBudget, tasks, milestones,
    depositBudget, createTask, approveTask, cancelTask,
    approveMilestone, rejectMilestone, loading } = sim;
  const addr = account.address;

  // View state
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  
  // Modal state
  const [activeModal, setActiveModal] = useState(null); // 'create', 'deposit', 'wbs', or taskId (number)
  
  // WBS / Template State
  const [wbsProject, setWbsProject] = useState("Aplikasi E-Commerce");
  const [wbsBudget, setWbsBudget]   = useState(5000000);

  // Create Form State
  const [desc, setDesc]       = useState("");
  const [cat, setCat]         = useState("IT");
  const [priority, setPriority]= useState("Medium");
  const [worker, setWorker]   = useState("");
  const [salary, setSalary]   = useState("");
  const [isMile, setIsMile]   = useState(false);
  const [miles, setMiles]     = useState([{ desc:"", amount:"" }]);
  
  // Deposit Form State
  const [depAmt, setDepAmt]   = useState("");
  
  // Action State
  const [rating, setRating]   = useState(4);
  const [note, setNote]       = useState("");

  // Data processing
  const myTasks = useMemo(() => tasks.filter(t => t.pm === addr).reverse(), [tasks, addr]);
  
  const filteredTasks = useMemo(() => {
    return myTasks.filter(t => {
      if (catFilter !== "All" && t.category !== catFilter) return false;
      if (search && !t.desc.toLowerCase().includes(search.toLowerCase()) && !String(t.id).includes(search)) return false;
      return true;
    });
  }, [myTasks, search, catFilter]);

  const kanban = {
    todo: filteredTasks.filter(t => getColumn(t.status) === "todo"),
    inprogress: filteredTasks.filter(t => getColumn(t.status) === "inprogress"),
    review: filteredTasks.filter(t => getColumn(t.status) === "review"),
    done: filteredTasks.filter(t => getColumn(t.status) === "done"),
  };

  const categories = ["All", ...new Set(myTasks.map(t => t.category))];

  // Actions
  const handleDeposit = async () => {
    try { await depositBudget(depAmt); setDepAmt(""); setActiveModal(null);
      notify("success", `Deposit ${formatRupiah(depAmt)} berhasil!`);
    } catch(e) { notify("error", e.message); }
  };

  const handleCreate = async () => {
    try {
      const msDescs = isMile ? miles.map(m => m.desc) : [];
      const msAmts  = isMile ? miles.map(m => Number(m.amount)) : [];
      if (isMile) {
        const tot = msAmts.reduce((a,b)=>a+b,0);
        if (tot !== Number(salary)) { notify("error",`Total milestone ≠ gaji`); return; }
      }
      await createTask({ desc, category: cat, priority, worker, salary, isMilestone: isMile, milestoneDescs: msDescs, milestoneAmounts: msAmts });
      notify("success", `Task dibuat!`);
      setDesc(""); setWorker(""); setSalary(""); setPriority("Medium"); setIsMile(false); setMiles([{ desc:"", amount:"" }]);
      setActiveModal(null);
    } catch(e) { notify("error", e.message); }
  };

  const updateMile = (i, f, v) => setMiles(p => p.map((m,idx) => idx===i ? {...m,[f]:v} : m));
  const msTotal = miles.reduce((s,m) => s + Number(m.amount||0), 0);

  // Render Kanban Column
  const renderColumn = (id, title, icon, tasksInCol) => (
    <div className="board-column">
      <div className="board-column-header">
        <div style={{display:"flex",alignItems:"center",gap:".5rem"}}>
          {icon} {title}
        </div>
        <div className="board-column-count">{tasksInCol.length}</div>
      </div>
      <div className="board-column-content">
        {tasksInCol.map(t => (
          <div key={t.id} className="task-card" onClick={() => setActiveModal(t.id)}>
            <div className="task-id">PAY-{String(t.id).padStart(3,"0")}</div>
            <div className="task-desc" style={{fontSize:"12px"}}>{t.desc}</div>
            
            <div style={{display:"flex",gap:".4rem",marginBottom:".5rem",flexWrap:"wrap"}}>
              <div className="badge" style={{background:"var(--bg-elevated)",border:"1px solid var(--border-light)",color:"var(--text-secondary)"}}>
                {t.category}
              </div>
              {t.priority && (
                <div className="badge" style={{
                  background: t.priority==="High"?"rgba(211,92,92,0.1)":t.priority==="Medium"?"rgba(226,147,58,0.1)":"var(--bg-elevated)",
                  color: t.priority==="High"?"var(--accent-rose)":t.priority==="Medium"?"var(--accent-amber)":"var(--text-secondary)"
                }}>
                  {t.priority==="High"?"↑":t.priority==="Medium"?"=":"↓"} {t.priority}
                </div>
              )}
            </div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:".5rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:".3rem",fontSize:"10px",color:"var(--text-muted)",background:"var(--bg-main)",padding:".1rem .3rem",borderRadius:"10px",border:"1px solid var(--border-light)"}}>
                <div style={{width:"14px",height:"14px",borderRadius:"50%",background:"var(--brand)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8px",fontWeight:700}}>
                  {t.worker.toLowerCase().includes("15d")?"A":"S"}
                </div>
                {t.worker.toLowerCase().includes("15d")?"Andi":"Sari"}
              </div>
              <div style={{fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-secondary)"}}>
                {formatRupiah(t.grossSalary)}
              </div>
            </div>
            {t.isMilestone && t.status !== 4 && t.status !== 6 && (
               <div style={{marginTop:".5rem"}}>
                 <div className="progress-bar">
                   <div className="progress-fill" style={{width:`${(t.milestonePaid/t.milestoneCount)*100}%`}}/>
                 </div>
               </div>
            )}
            {t.status === 5 && <div style={{marginTop:".4rem",fontSize:"10px",color:"var(--accent-rose)",fontWeight:600}}>⚖️ DISPUTED</div>}
          </div>
        ))}
      </div>
    </div>
  );

  const selectedTask = typeof activeModal === "number" ? tasks.find(t => t.id === activeModal) : null;

  return (
    <div style={{height: "100%", display: "flex", flexDirection: "column"}}>
      
      {/* Header & Controls */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"1.5rem"}}>
        <div style={{display:"flex",gap:"1.5rem"}}>
          <div>
            <div style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:600,marginBottom:".2rem"}}>BUDGET KONTRAK</div>
            <div style={{fontSize:"24px",fontWeight:700,fontFamily:"var(--font-mono)",color:"var(--text-primary)"}}>{formatRupiah(pmBudget)}</div>
          </div>
          <div>
            <div style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:600,marginBottom:".2rem"}}>SALDO DOMPET</div>
            <div style={{fontSize:"18px",fontWeight:600,fontFamily:"var(--font-mono)",color:"var(--text-secondary)"}}>{formatRupiah(balance)}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:".5rem"}}>
          <button className="btn btn-secondary" onClick={()=>setActiveModal("deposit")}>💰 Deposit</button>
          <button className="btn btn-primary" style={{background:"var(--brand)",color:"white"}} onClick={()=>setActiveModal("wbs")}>⚡ Quick WBS</button>
          <button className="btn btn-secondary" onClick={()=>setActiveModal("create")}>+ Buat Task</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:".5rem",marginBottom:"1rem"}}>
        <input className="form-input" placeholder="🔍 Cari task..." style={{maxWidth:"250px",background:"var(--bg-surface)"}} 
          value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="form-select" style={{maxWidth:"150px",background:"var(--bg-surface)"}}
          value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Kanban Board */}
      <div className="board">
        {renderColumn("todo", "To Do", <Icon.Todo/>, kanban.todo)}
        {renderColumn("inprogress", "In Progress", <Icon.InProgress/>, kanban.inprogress)}
        {renderColumn("review", "Review", <Icon.Review/>, kanban.review)}
        {renderColumn("done", "Done", <Icon.Done/>, kanban.done)}
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}>
          
          {/* DEPOSIT MODAL */}
          {activeModal === "deposit" && (
            <div className="modal-content" style={{maxWidth:"400px"}}>
              <div className="modal-header">
                <h3>Deposit Budget</h3>
                <button className="btn btn-ghost btn-sm" onClick={()=>setActiveModal(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Jumlah IDRT</label>
                  <input type="number" className="form-input" placeholder="5000000"
                    value={depAmt} onChange={e=>setDepAmt(e.target.value)} />
                  <div className="form-hint">Saldo tersedia: {formatRupiah(balance)}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={()=>setActiveModal(null)}>Batal</button>
                <button className="btn btn-primary" onClick={handleDeposit} disabled={loading||!depAmt}>Deposit</button>
              </div>
            </div>
          )}

          {/* QUICK WBS MODAL */}
          {activeModal === "wbs" && (
            <div className="modal-content" style={{maxWidth:"500px"}}>
              <div className="modal-header">
                <h3>⚡ Auto-Generate WBS & Timeline</h3>
                <button className="btn btn-ghost btn-sm" onClick={()=>setActiveModal(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div style={{background:"var(--accent-blue-dim)",padding:"1rem",borderRadius:"var(--radius-sm)",border:"1px solid rgba(79,137,216,0.3)",marginBottom:"1.5rem",fontSize:"13px",color:"var(--accent-blue)"}}>
                  Fitur ini akan otomatis memecah proyek besar menjadi beberapa task (UI/UX, Frontend, Backend) dengan Milestone dan mendistribusikan budget secara proporsional.
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Proyek Besar</label>
                  <input type="text" className="form-input" value={wbsProject} onChange={e=>setWbsProject(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Budget yang Dialokasikan (IDRT)</label>
                  <input type="number" className="form-input" value={wbsBudget} onChange={e=>setWbsBudget(Number(e.target.value))} />
                  <div className="form-hint" style={{color: pmBudget < wbsBudget ? "var(--accent-rose)" : "var(--text-muted)"}}>
                    Budget tersedia di kontrak: {formatRupiah(pmBudget)}
                  </div>
                </div>
                
                {/* WBS Preview */}
                <div style={{marginTop:"1.5rem"}}>
                  <label className="form-label">Preview Work Breakdown Structure:</label>
                  <div style={{background:"var(--bg-elevated)",padding:"1rem",borderRadius:"var(--radius-sm)",border:"1px solid var(--border)",fontSize:"12px",display:"flex",flexDirection:"column",gap:".5rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span><strong>1. Desain UI/UX</strong> (Andi)</span>
                      <span className="mono" style={{color:"var(--text-secondary)"}}>{formatRupiah(wbsBudget * 0.2)}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span><strong>2. Frontend Dev</strong> (Andi) <span style={{color:"var(--accent-emerald)"}}>+ 2 Milestones</span></span>
                      <span className="mono" style={{color:"var(--text-secondary)"}}>{formatRupiah(wbsBudget * 0.4)}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span><strong>3. Backend & API</strong> (Sari) <span style={{color:"var(--accent-emerald)"}}>+ 2 Milestones</span></span>
                      <span className="mono" style={{color:"var(--text-secondary)"}}>{formatRupiah(wbsBudget * 0.4)}</span>
                    </div>
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={()=>setActiveModal(null)}>Batal</button>
                <button className="btn btn-primary" disabled={loading || pmBudget < wbsBudget} onClick={async () => {
                  try {
                    // 1. UI/UX
                    await createTask({ desc: `${wbsProject} - UI/UX Design`, category: "Desain", priority: "Medium", worker: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", salary: wbsBudget * 0.2, isMilestone: false });
                    // 2. Frontend
                    await createTask({ desc: `${wbsProject} - Frontend Dev`, category: "IT", priority: "High", worker: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", salary: wbsBudget * 0.4, isMilestone: true, milestoneDescs: ["Slicing UI", "Integrasi API"], milestoneAmounts: [(wbsBudget * 0.4)*0.5, (wbsBudget * 0.4)*0.5] });
                    // 3. Backend
                    await createTask({ desc: `${wbsProject} - Backend API`, category: "IT", priority: "High", worker: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", salary: wbsBudget * 0.4, isMilestone: true, milestoneDescs: ["Database Setup", "REST API Endpoint"], milestoneAmounts: [(wbsBudget * 0.4)*0.5, (wbsBudget * 0.4)*0.5] });
                    
                    notify("success", "WBS berhasil di-generate!");
                    setActiveModal(null);
                  } catch(e) { notify("error", e.message); }
                }}>
                  {loading ? <span className="spinner"/> : "Generate WBS & Timeline"}
                </button>
              </div>
            </div>
          )}

          {/* CREATE MODAL */}
          {activeModal === "create" && (
            <div className="modal-content">
              <div className="modal-header">
                <h3>Buat Task Baru</h3>
                <button className="btn btn-ghost btn-sm" onClick={()=>setActiveModal(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Deskripsi Pekerjaan</label>
                  <textarea className="form-textarea" rows={2} value={desc} placeholder="Apa yang perlu dikerjakan?" onChange={e=>setDesc(e.target.value)}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1rem"}}>
                  <div className="form-group">
                    <label className="form-label">Pekerja (Worker)</label>
                    <select className="form-select" value={worker} onChange={e=>setWorker(e.target.value)}>
                      <option value="">-- Pilih --</option>
                      <option value="0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65">Andi</option>
                      <option value="0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc">Sari</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kategori</label>
                    <select className="form-select" value={cat} onChange={e=>setCat(e.target.value)}>
                      {["IT","Finance","Marketing","Desain"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={priority} onChange={e=>setPriority(e.target.value)}>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Gaji Bruto (IDRT)</label>
                  <input type="number" className="form-input" placeholder="1000000" value={salary} onChange={e=>setSalary(e.target.value)}/>
                  <TaxBox salary={salary}/>
                </div>
                
                <div style={{marginTop:"1.5rem",borderTop:"1px solid var(--border)",paddingTop:"1rem"}}>
                  <label style={{display:"flex",alignItems:"center",gap:".5rem",cursor:"pointer",marginBottom:"1rem"}}>
                    <input type="checkbox" checked={isMile} onChange={e=>setIsMile(e.target.checked)}/>
                    <span style={{fontSize:"13px",fontWeight:500}}>Aktifkan Milestone Pembayaran</span>
                  </label>
                  {isMile && (
                    <div style={{background:"var(--bg-elevated)",padding:"1rem",borderRadius:"var(--radius-sm)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:".5rem",fontSize:"12px"}}>
                        <span>Tahapan</span>
                        <span style={{color:msTotal===Number(salary)?"var(--accent-emerald)":"var(--accent-rose)"}}>Total: {formatRupiah(msTotal)}</span>
                      </div>
                      {miles.map((m,i) => (
                        <div key={i} style={{display:"flex",gap:".5rem",marginBottom:".5rem"}}>
                          <input className="form-input" placeholder="Deskripsi milestone" value={m.desc} onChange={e=>updateMile(i,"desc",e.target.value)} style={{flex:2}}/>
                          <input type="number" className="form-input" placeholder="Rp" value={m.amount} onChange={e=>updateMile(i,"amount",e.target.value)} style={{flex:1}}/>
                          {miles.length>1 && <button className="btn btn-secondary btn-sm" onClick={()=>setMiles(p=>p.filter((_,idx)=>idx!==i))}>✕</button>}
                        </div>
                      ))}
                      <button className="btn btn-ghost btn-sm" onClick={()=>setMiles(p=>[...p,{desc:"",amount:""}])}>+ Tambah Milestone</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={()=>setActiveModal(null)}>Batal</button>
                <button className="btn btn-primary" onClick={handleCreate} disabled={loading||!desc||!worker||!salary}>Buat Task</button>
              </div>
            </div>
          )}

          {/* TASK DETAIL MODAL */}
          {selectedTask && (
            <div className="modal-content" style={{maxWidth:"650px"}}>
              <div className="modal-header">
                <div style={{display:"flex",alignItems:"center",gap:".75rem"}}>
                  <span className="mono" style={{color:"var(--text-muted)",fontSize:"13px"}}>PAY-{String(selectedTask.id).padStart(3,"0")}</span>
                  <StatusBadge s={selectedTask.status} />
                </div>
                <button className="btn btn-ghost btn-sm" onClick={()=>{setActiveModal(null); setRating(4); setNote("");}}>✕</button>
              </div>
              <div className="modal-body" style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:"2rem"}}>
                {/* Left Col */}
                <div>
                  <h2 style={{fontSize:"18px",marginBottom:"1.5rem",lineHeight:1.4}}>{selectedTask.desc}</h2>
                  
                  <div style={{fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",marginBottom:".75rem",textTransform:"uppercase"}}>Detail Pekerjaan</div>
                  {selectedTask.submissionProof && (
                    <div style={{background:"var(--bg-elevated)",padding:"1rem",borderRadius:"var(--radius-sm)",border:"1px solid var(--border)",marginBottom:"1.5rem"}}>
                      <div style={{fontSize:"11px",color:"var(--text-muted)",marginBottom:".25rem"}}>Link Bukti Pekerjaan:</div>
                      <a href={selectedTask.submissionProof} target="_blank" rel="noreferrer" style={{fontSize:"13px",wordBreak:"break-all"}}>{selectedTask.submissionProof}</a>
                    </div>
                  )}

                  {selectedTask.isMilestone && milestones[selectedTask.id] && (
                    <div style={{marginBottom:"1.5rem"}}>
                      <div style={{fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",marginBottom:".75rem",textTransform:"uppercase"}}>Milestones</div>
                      <div style={{display:"flex",flexDirection:"column",gap:".5rem"}}>
                        {milestones[selectedTask.id].map((ms,i) => (
                          <div key={i} style={{background:"var(--bg-elevated)",padding:"0.75rem",borderRadius:"var(--radius-sm)",border:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div>
                              <div style={{fontSize:"13px",fontWeight:500,marginBottom:".2rem"}}>{ms.description}</div>
                              <div style={{fontSize:"11px",color:"var(--text-muted)"}}>
                                {formatRupiah(ms.netPayment)} · {["PENDING","SUBMITTED","APPROVED","REJECTED"][ms.status]}
                              </div>
                            </div>
                            {ms.status === 1 && (
                              <div style={{display:"flex",gap:".25rem"}}>
                                <button className="btn btn-primary btn-sm" disabled={loading} onClick={async()=>{await approveMilestone(selectedTask.id,i);notify("success","Milestone dibayar!");}}>Terima</button>
                                <button className="btn btn-danger btn-sm" disabled={loading} onClick={async()=>{await rejectMilestone(selectedTask.id,i);notify("warn","Milestone ditolak");}}>Tolak</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTask.status === 5 && (
                    <div style={{background:"var(--accent-rose-dim)",padding:"1rem",borderRadius:"var(--radius-sm)",border:"1px solid rgba(211,92,92,0.3)",marginBottom:"1.5rem"}}>
                      <div style={{color:"var(--accent-rose)",fontWeight:600,fontSize:"12px",marginBottom:".25rem"}}>⚠️ Task dalam sengketa</div>
                      <div style={{fontSize:"13px",color:"var(--text-primary)"}}>Menunggu keputusan arbitrator.</div>
                    </div>
                  )}

                  {/* Activity Log (Jira/Notion style) */}
                  <div style={{marginTop:"2rem"}}>
                    <div style={{fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",marginBottom:"1rem",textTransform:"uppercase"}}>Activity Log</div>
                    <div style={{display:"flex",flexDirection:"column",gap:"1rem",borderLeft:"2px solid var(--border-light)",marginLeft:"10px",paddingLeft:"15px"}}>
                      {selectedTask.activityLog?.map((log, i) => (
                        <div key={i} style={{position:"relative"}}>
                          <div style={{position:"absolute",left:"-22px",top:"4px",width:"10px",height:"10px",borderRadius:"50%",background:"var(--border)",border:"2px solid var(--bg-surface)"}} />
                          <div style={{fontSize:"12px",color:"var(--text-primary)",fontWeight:500}}>{log.action}</div>
                          <div style={{fontSize:"11px",color:"var(--text-muted)",marginTop:".1rem"}}>
                            Oleh <strong>{log.user}</strong> · {new Date(log.time * 1000).toLocaleString("id-ID")}
                          </div>
                        </div>
                      ))}
                      {!selectedTask.activityLog && <div style={{fontSize:"11px",color:"var(--text-muted)"}}>Tidak ada history.</div>}
                    </div>
                  </div>
                </div>

                {/* Right Col */}
                <div>
                  <div className="property-list">
                    <div className="property-row"><span className="property-label">Priority</span>
                      <span className="property-value">
                        <span className="badge" style={{background:selectedTask.priority==="High"?"rgba(211,92,92,0.1)":selectedTask.priority==="Medium"?"rgba(226,147,58,0.1)":"var(--bg-elevated)",color:selectedTask.priority==="High"?"var(--accent-rose)":selectedTask.priority==="Medium"?"var(--accent-amber)":"var(--text-secondary)"}}>
                          {selectedTask.priority || "Medium"}
                        </span>
                      </span>
                    </div>
                    <div className="property-row"><span className="property-label">Kategori</span><span className="property-value">{selectedTask.category}</span></div>
                    <div className="property-row"><span className="property-label">Assignee</span>
                      <span className="property-value" style={{display:"flex",alignItems:"center",gap:".4rem"}}>
                        <div style={{width:"18px",height:"18px",borderRadius:"50%",background:"var(--brand)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700}}>{selectedTask.worker.toLowerCase().includes("15d")?"A":"S"}</div>
                        {selectedTask.worker.toLowerCase().includes("15d")?"Andi Worker":"Sari Worker"}
                      </span>
                    </div>
                    <div className="property-row"><span className="property-label">Gaji Bruto</span><span className="property-value mono">{formatRupiah(selectedTask.grossSalary)}</span></div>
                    <div className="property-row"><span className="property-label">Potongan PPh</span><span className="property-value mono" style={{color:"var(--accent-amber)"}}>{formatRupiah(selectedTask.taxAmount)}</span></div>
                    <div className="property-row" style={{marginTop:".5rem",paddingTop:".5rem",borderTop:"1px solid var(--border)"}}><span className="property-label">Gaji Bersih</span><span className="property-value mono" style={{color:"var(--accent-emerald)",fontWeight:600}}>{formatRupiah(selectedTask.netSalary)}</span></div>
                  </div>

                  {/* PM Actions */}
                  {selectedTask.status === 2 && !selectedTask.isMilestone && (
                    <div style={{background:"var(--bg-elevated)",padding:"1rem",borderRadius:"var(--radius-sm)",border:"1px solid var(--border)",marginTop:"1.5rem"}}>
                      <div style={{fontSize:"12px",fontWeight:600,marginBottom:".75rem"}}>Review Pekerjaan</div>
                      <div className="form-group">
                        <label className="form-label">Rating</label>
                        <select className="form-select" value={rating} onChange={e=>setRating(Number(e.target.value))}>
                          {[5,4,3,2,1].map(r=><option key={r} value={r}>{"⭐".repeat(r)}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Catatan (Opsional)</label>
                        <textarea className="form-textarea" rows={2} value={note} onChange={e=>setNote(e.target.value)}/>
                      </div>
                      <button className="btn btn-primary btn-full" disabled={loading} onClick={async()=>{await approveTask(selectedTask.id, rating, note); notify("success","Task selesai!"); setActiveModal(null);}}>Approve & Bayar</button>
                    </div>
                  )}

                  {(selectedTask.status === 0 || selectedTask.status === 1) && (
                    <button className="btn btn-danger btn-full" style={{marginTop:"1.5rem"}} disabled={loading} onClick={async()=>{await cancelTask(selectedTask.id); notify("success","Task dibatalkan"); setActiveModal(null);}}>Batalkan Task</button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
