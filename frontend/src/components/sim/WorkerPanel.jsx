import { useState, useMemo } from "react";
import { formatRupiah } from "../../hooks/useWeb3";
import { calcTax } from "../../hooks/useSimulation";

// ── Icons ─────────────────────────────────────────────────────
const Icon = {
  Todo: () => <span style={{color:"var(--text-muted)"}}>⭕</span>,
  InProgress: () => <span style={{color:"var(--accent-blue)"}}>⏳</span>,
  Review: () => <span style={{color:"var(--accent-amber)"}}>👀</span>,
  Done: () => <span style={{color:"var(--accent-emerald)"}}>✅</span>,
};

// ── Kanban Column Mapping ─────────────────────────────────────
const getColumn = (status) => {
  if (status === 0) return "todo";
  if (status === 1) return "inprogress";
  if (status === 2 || status === 5) return "review";
  if (status === 4 || status === 6) return "done";
  return "todo";
};

const S_LABEL = ["OPEN","CLAIMED","SUBMITTED","APPROVED","COMPLETED","DISPUTED","CANCELLED"];
const S_CLASS = ["open","claimed","submitted","approved","completed","disputed","cancelled"];
const StatusBadge = ({ s }) => <span className={`badge badge-${S_CLASS[s]}`}>{S_LABEL[s]}</span>;

// ── Worker Panel ──────────────────────────────────────────────
export default function WorkerPanel({ sim, notify }) {
  const { account, balance, tasks, milestones, getWorkerStats,
    claimTask, submitWork, submitMilestone, raiseDispute, loading } = sim;
  const addr = account.address;

  const [activeModal, setActiveModal] = useState(null); // taskId
  
  // Form State
  const [proof, setProof] = useState("");
  const [msProof, setMsProof] = useState("");
  const [reason, setReason] = useState("");
  const [activeTab, setActiveTab] = useState("details"); // 'details' or 'submit' or 'dispute'

  const myTasks = useMemo(() => tasks.filter(t => t.worker === addr).reverse(), [tasks, addr]);
  const [totalEarned, completedCount, avgRatingX10] = getWorkerStats(addr);
  const avgRating = avgRatingX10 > 0 ? (avgRatingX10 / 10).toFixed(1) : "—";

  const kanban = {
    todo: myTasks.filter(t => getColumn(t.status) === "todo"),
    inprogress: myTasks.filter(t => getColumn(t.status) === "inprogress"),
    review: myTasks.filter(t => getColumn(t.status) === "review"),
    done: myTasks.filter(t => getColumn(t.status) === "done"),
  };

  const handleClaim = async (id) => {
    try { await claimTask(id); notify("success",`Task PAY-${String(id).padStart(3,"0")} diklaim!`); setActiveModal(null); }
    catch(e) { notify("error", e.message); }
  };

  const handleSubmit = async (id) => {
    if (!proof.trim()) return;
    try { await submitWork(id, proof); notify("success","Bukti terkirim!"); setActiveModal(null); setProof(""); }
    catch(e) { notify("error", e.message); }
  };

  const handleMsSubmit = async (taskId, idx) => {
    if (!msProof.trim()) return;
    try { await submitMilestone(taskId, idx, msProof); notify("success",`Milestone ${idx+1} disubmit!`); setMsProof(""); }
    catch(e) { notify("error", e.message); }
  };

  const handleDispute = async (id) => {
    if (!reason.trim()) return;
    try { await raiseDispute(id, reason); notify("warn","Dispute diajukan!"); setActiveModal(null); setReason(""); }
    catch(e) { notify("error", e.message); }
  };

  const renderColumn = (id, title, icon, tasksInCol) => (
    <div className="board-column">
      <div className="board-column-header">
        <div style={{display:"flex",alignItems:"center",gap:".5rem"}}>{icon} {title}</div>
        <div className="board-column-count">{tasksInCol.length}</div>
      </div>
      <div className="board-column-content">
        {tasksInCol.map(t => (
          <div key={t.id} className="task-card" onClick={() => { setActiveModal(t.id); setActiveTab("details"); }}>
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
              <div style={{fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--brand)",fontWeight:600}}>
                {formatRupiah(t.netSalary)}
              </div>
            </div>
            {t.status === 5 && <div style={{marginTop:".4rem",fontSize:"10px",color:"var(--accent-rose)",fontWeight:600}}>⚖️ DISPUTED</div>}
          </div>
        ))}
        {tasksInCol.length === 0 && <div style={{textAlign:"center",padding:"2rem",fontSize:"12px",color:"var(--text-muted)"}}>Kosong</div>}
      </div>
    </div>
  );

  const selectedTask = typeof activeModal === "number" ? tasks.find(t => t.id === activeModal) : null;

  return (
    <div style={{height: "100%", display: "flex", flexDirection: "column"}}>
      
      {/* Header Stats */}
      <div style={{display:"flex",gap:"2rem",marginBottom:"1.5rem",background:"var(--bg-surface)",padding:"1.5rem",borderRadius:"var(--radius-md)",border:"1px solid var(--border)"}}>
        <div>
          <div style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:600,marginBottom:".2rem"}}>SALDO DOMPET</div>
          <div style={{fontSize:"24px",fontWeight:700,fontFamily:"var(--font-mono)",color:"var(--text-primary)"}}>{formatRupiah(balance)}</div>
        </div>
        <div>
          <div style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:600,marginBottom:".2rem"}}>TOTAL PENDAPATAN</div>
          <div style={{fontSize:"24px",fontWeight:700,fontFamily:"var(--font-mono)",color:"var(--accent-blue)"}}>{formatRupiah(totalEarned)}</div>
        </div>
        <div>
          <div style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:600,marginBottom:".2rem"}}>TASK SELESAI</div>
          <div style={{fontSize:"24px",fontWeight:700,fontFamily:"var(--font-mono)",color:"var(--text-primary)"}}>{completedCount}</div>
        </div>
        <div>
          <div style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:600,marginBottom:".2rem"}}>RATING RATA-RATA</div>
          <div style={{fontSize:"24px",fontWeight:700,fontFamily:"var(--font-mono)",color:"var(--accent-amber)"}}>{avgRating !== "—" ? `⭐ ${avgRating}` : "—"}</div>
        </div>
      </div>

      <div className="alert alert-info" style={{marginBottom:"1.5rem"}}>
        ℹ️ Gaji bersih yang ditampilkan sudah otomatis dipotong PPh 21 (5% - 30%) berdasarkan sistem bracket pintar on-chain.
      </div>

      {/* Kanban Board */}
      <div className="board">
        {renderColumn("todo", "Tersedia", <Icon.Todo/>, kanban.todo)}
        {renderColumn("inprogress", "Sedang Dikerjakan", <Icon.InProgress/>, kanban.inprogress)}
        {renderColumn("review", "Menunggu Review PM", <Icon.Review/>, kanban.review)}
        {renderColumn("done", "Selesai", <Icon.Done/>, kanban.done)}
      </div>

      {/* TASK DETAIL MODAL */}
      {selectedTask && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}>
          <div className="modal-content" style={{maxWidth:"650px", height:"auto", maxHeight:"85vh"}}>
            
            <div className="modal-header">
              <div style={{display:"flex",alignItems:"center",gap:".75rem"}}>
                <span className="mono" style={{color:"var(--text-muted)",fontSize:"13px"}}>PAY-{String(selectedTask.id).padStart(3,"0")}</span>
                <StatusBadge s={selectedTask.status} />
              </div>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setActiveModal(null); setActiveTab("details"); setProof(""); setReason("");}}>✕</button>
            </div>

            {/* Modal Navigation Tabs (Worker-specific) */}
            <div style={{display:"flex",borderBottom:"1px solid var(--border)",background:"var(--bg-elevated)",padding:"0 1rem"}}>
              <button className={`btn btn-ghost ${activeTab==="details"?"active":""}`} style={{borderRadius:0,borderBottom:activeTab==="details"?"2px solid var(--brand)":"2px solid transparent"}} onClick={()=>setActiveTab("details")}>Detail Pekerjaan</button>
              {selectedTask.status === 1 && !selectedTask.isMilestone && <button className={`btn btn-ghost ${activeTab==="submit"?"active":""}`} style={{borderRadius:0,borderBottom:activeTab==="submit"?"2px solid var(--brand)":"2px solid transparent"}} onClick={()=>setActiveTab("submit")}>Kirim Hasil</button>}
              {selectedTask.status === 2 && <button className={`btn btn-ghost ${activeTab==="dispute"?"active":""}`} style={{borderRadius:0,borderBottom:activeTab==="dispute"?"2px solid var(--brand)":"2px solid transparent",color:activeTab==="dispute"?"var(--accent-rose)":""}} onClick={()=>setActiveTab("dispute")}>⚖️ Ajukan Dispute</button>}
            </div>

            <div className="modal-body" style={{overflowY:"auto"}}>
              
              {/* DETAILS TAB */}
              {activeTab === "details" && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 220px",gap:"2rem"}}>
                  <div>
                    <h2 style={{fontSize:"18px",marginBottom:"1rem",lineHeight:1.4}}>{selectedTask.desc}</h2>
                    {selectedTask.pmNote && (
                      <div style={{background:"rgba(76,161,111,0.1)",padding:"1rem",borderRadius:"var(--radius-sm)",border:"1px solid rgba(76,161,111,0.2)",marginBottom:"1rem"}}>
                        <div style={{fontSize:"11px",color:"var(--accent-emerald)",marginBottom:".25rem",fontWeight:600}}>CATATAN DARI PM:</div>
                        <div style={{fontSize:"13px"}}>{selectedTask.pmNote}</div>
                      </div>
                    )}
                    {selectedTask.status === 4 && selectedTask.workerRating > 0 && (
                      <div style={{fontSize:"13px",marginBottom:"1.5rem",background:"var(--bg-elevated)",padding:".75rem",borderRadius:"var(--radius-sm)",border:"1px solid var(--border)"}}>
                        <span style={{color:"var(--text-muted)"}}>Rating diberikan:</span> <span style={{letterSpacing:2}}>{"⭐".repeat(selectedTask.workerRating)}</span>
                      </div>
                    )}

                    {selectedTask.isMilestone && milestones[selectedTask.id] && (
                      <div style={{marginTop:"1.5rem"}}>
                        <div style={{fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",marginBottom:".75rem",textTransform:"uppercase"}}>Milestones</div>
                        <div style={{display:"flex",flexDirection:"column",gap:".5rem"}}>
                          {milestones[selectedTask.id].map((ms,i) => (
                            <div key={i} style={{background:"var(--bg-elevated)",padding:"1rem",borderRadius:"var(--radius-sm)",border:"1px solid var(--border)"}}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:".5rem"}}>
                                <div style={{fontSize:"13px",fontWeight:500}}>{ms.description}</div>
                                <div className="badge" style={{background:"transparent",border:"1px solid var(--border)",color:"var(--text-secondary)"}}>
                                  {["PENDING","SUBMITTED","APPROVED","REJECTED"][ms.status]}
                                </div>
                              </div>
                              <div style={{fontSize:"11px",color:"var(--brand)",fontFamily:"var(--font-mono)",marginBottom:"1rem"}}>{formatRupiah(ms.netPayment)} (Bersih)</div>
                              
                              {/* Submit UI for milestone */}
                              {ms.status === 0 && selectedTask.status === 1 && (
                                <div style={{display:"flex",gap:".5rem"}}>
                                  <input className="form-input" placeholder="Link bukti M1..." value={msProof} onChange={e=>setMsProof(e.target.value)} style={{fontSize:"12px"}}/>
                                  <button className="btn btn-primary btn-sm" disabled={loading} onClick={()=>handleMsSubmit(selectedTask.id,i)}>Kirim</button>
                                </div>
                              )}
                              {ms.submissionProof && (
                                <div style={{fontSize:"11px",color:"var(--text-muted)"}}>Bukti: <a href={ms.submissionProof} target="_blank" rel="noreferrer" style={{color:"var(--accent-blue)"}}>Link</a></div>
                              )}
                            </div>
                          ))}
                        </div>
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
                      <div className="property-row" style={{marginTop:"1rem",paddingTop:"1rem",borderTop:"1px solid var(--border)"}}><span className="property-label">Gaji Bruto</span><span className="property-value mono">{formatRupiah(selectedTask.grossSalary)}</span></div>
                      <div className="property-row"><span className="property-label">PPh {selectedTask.taxRate}%</span><span className="property-value mono" style={{color:"var(--accent-amber)"}}>{formatRupiah(selectedTask.taxAmount)}</span></div>
                      <div className="property-row" style={{marginTop:".5rem",paddingTop:".5rem",borderTop:"1px solid var(--border)"}}><span className="property-label" style={{fontWeight:600}}>Gaji Bersih</span><span className="property-value mono" style={{color:"var(--brand)",fontWeight:700,fontSize:"14px"}}>{formatRupiah(selectedTask.netSalary)}</span></div>
                    </div>
                    {selectedTask.status === 0 && (
                      <button className="btn btn-primary btn-full" disabled={loading} onClick={()=>handleClaim(selectedTask.id)}>🤝 Klaim Pekerjaan</button>
                    )}
                  </div>
                </div>
              )}

              {/* SUBMIT TAB */}
              {activeTab === "submit" && selectedTask.status === 1 && (
                <div>
                  <h3 style={{fontSize:"16px",marginBottom:".5rem"}}>Kirim Hasil Pekerjaan</h3>
                  <p style={{fontSize:"13px",color:"var(--text-secondary)",marginBottom:"1.5rem"}}>Berikan link (GitHub, Google Drive, Figma, dll) yang membuktikan pekerjaan telah diselesaikan.</p>
                  
                  <div className="form-group">
                    <label className="form-label">URL Bukti Pekerjaan</label>
                    <input className="form-input" placeholder="https://..." value={proof} onChange={e=>setProof(e.target.value)} />
                  </div>
                  
                  <div style={{display:"flex",justifyContent:"flex-end",gap:".5rem",marginTop:"2rem"}}>
                    <button className="btn btn-ghost" onClick={()=>setActiveTab("details")}>Batal</button>
                    <button className="btn btn-primary" onClick={()=>handleSubmit(selectedTask.id)} disabled={loading||!proof}>Kirim ke PM</button>
                  </div>
                </div>
              )}

              {/* DISPUTE TAB */}
              {activeTab === "dispute" && selectedTask.status === 2 && (
                <div>
                  <div style={{background:"var(--accent-rose-dim)",padding:"1rem",borderRadius:"var(--radius-sm)",border:"1px solid rgba(211,92,92,0.3)",marginBottom:"1.5rem"}}>
                    <h3 style={{fontSize:"14px",color:"var(--accent-rose)",marginBottom:".25rem"}}>Ajukan Sengketa (Dispute)</h3>
                    <p style={{fontSize:"12px",color:"var(--text-primary)"}}>Jika PM menolak hasil pekerjaan secara tidak adil, ajukan dispute. Arbitrator (Admin) akan turun tangan menengahi kasus ini.</p>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Alasan Dispute</label>
                    <textarea className="form-textarea" rows={4} placeholder="Jelaskan secara rinci mengapa Anda merasa berhak mendapatkan bayaran..." value={reason} onChange={e=>setReason(e.target.value)} />
                  </div>
                  
                  <div style={{display:"flex",justifyContent:"flex-end",gap:".5rem",marginTop:"2rem"}}>
                    <button className="btn btn-ghost" onClick={()=>setActiveTab("details")}>Batal</button>
                    <button className="btn btn-danger" onClick={()=>handleDispute(selectedTask.id)} disabled={loading||!reason}>⚖️ Ajukan Dispute Resmi</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
