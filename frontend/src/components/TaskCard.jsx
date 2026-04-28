import { useState } from "react";
import { formatRupiah, formatDate, shortenAddr,
  TASK_STATUS_LABEL, TASK_STATUS_CLASS } from "../hooks/useWeb3";

// ── Star Rating ───────────────────────────────────────────────
export const StarRating = ({ value, max = 5 }) => (
  <span className="stars">
    {Array.from({ length: max }, (_, i) => (
      <span key={i} className={`star ${i < value ? "filled" : "empty"}`}>★</span>
    ))}
  </span>
);

// ── Status Badge ──────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const s = Number(status);
  const icons = ["🔵","🟡","🟣","🔷","✅","🔴","⬛"];
  return (
    <span className={`badge badge-${TASK_STATUS_CLASS[s]}`}>
      {icons[s]} {TASK_STATUS_LABEL[s]}
    </span>
  );
};

// ── Milestone Item ────────────────────────────────────────────
const MS_STATUS = ["PENDING","SUBMITTED","APPROVED","REJECTED"];
const MS_CLASS  = ["","submitted","approved","rejected"];

const MilestoneList = ({ milestones, taskId, role, onMsAction, loading }) => {
  if (!milestones || milestones.length === 0) return null;
  return (
    <div className="milestone-list">
      {milestones.map((ms, i) => {
        const status = Number(ms.status);
        return (
          <div key={i} className={`milestone-item ${MS_CLASS[status]}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="milestone-title">
                  <span className="badge badge-milestone" style={{ marginRight: ".4rem", fontSize: ".62rem" }}>
                    M{i + 1}
                  </span>
                  {ms.description}
                </div>
                <div className="milestone-amount">
                  {formatRupiah(ms.netPayment)} bersih · PPh {formatRupiah(ms.taxAmount)} · {MS_STATUS[status]}
                </div>
                {ms.submissionProof && (
                  <a href={ms.submissionProof} target="_blank" rel="noreferrer"
                    style={{ fontSize: ".72rem", color: "var(--accent-blue)", display: "block", marginTop: ".2rem" }}>
                    📎 {ms.submissionProof.slice(0, 50)}...
                  </a>
                )}
              </div>
              <div style={{ display: "flex", gap: ".35rem", flexShrink: 0, marginLeft: ".5rem" }}>
                {role === "pm" && status === 1 && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => onMsAction("approve", taskId, i)} disabled={loading}>✓</button>
                    <button className="btn btn-danger btn-sm" onClick={() => onMsAction("reject", taskId, i)} disabled={loading}>✗</button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Main Task Card ────────────────────────────────────────────
const TaskCard = ({ task, milestones, role, onAction, onMsAction, loading }) => {
  const taskId = Number(task.id);
  const status = Number(task.status);
  const [proof, setProof]           = window.React.useState("");
  const [showProof, setShowProof]   = window.React.useState(false);
  const [dispReason, setDispReason] = window.React.useState("");
  const [showDisp, setShowDisp]     = window.React.useState(false);
  const [msProof, setMsProof]       = window.React.useState({});
  const [activeMsSubmit, setActiveMsSubmit] = window.React.useState(null);

  const milestonePaid  = Number(task.milestonePaid || 0);
  const milestoneCount = Number(task.milestoneCount || 0);
  const progress = milestoneCount > 0 ? Math.round((milestonePaid / milestoneCount) * 100) : 0;

  return (
    <div className="task-card">
      {/* Header */}
      <div className="task-card-header">
        <div style={{ flex: 1 }}>
          <div className="task-id">TASK #{String(taskId).padStart(4, "0")} · {task.category || "General"}</div>
          <div className="task-desc">{task.description}</div>
          {task.isMilestone && (
            <div style={{ marginTop: ".3rem" }}>
              <span className="badge badge-milestone">⚡ {milestonePaid}/{milestoneCount} Milestones</span>
            </div>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Milestone progress bar */}
      {task.isMilestone && milestoneCount > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem", color: "var(--text-muted)", marginBottom: ".3rem" }}>
            <span>Progress Milestone</span><span>{progress}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      {/* Meta */}
      <div className="task-meta">
        <div className="task-meta-item">
          <span className="task-meta-label">Gaji Bruto</span>
          <span className="task-meta-value">{formatRupiah(task.grossSalary)}</span>
        </div>
        <div className="task-meta-item">
          <span className="task-meta-label">Gaji Bersih</span>
          <span className="task-meta-value brand">{formatRupiah(task.netSalary)}</span>
        </div>
        <div className="task-meta-item">
          <span className="task-meta-label">PPh ({Number(task.taxRate)}%)</span>
          <span className="task-meta-value amber">{formatRupiah(task.taxAmount)}</span>
        </div>
        {role === "pm" && (
          <div className="task-meta-item">
            <span className="task-meta-label">Worker</span>
            <span className="task-meta-value mono" style={{ fontSize: ".75rem" }}>{shortenAddr(task.worker)}</span>
          </div>
        )}
        {role === "worker" && (
          <div className="task-meta-item">
            <span className="task-meta-label">PM</span>
            <span className="task-meta-value mono" style={{ fontSize: ".75rem" }}>{shortenAddr(task.pm)}</span>
          </div>
        )}
        {task.deadline && Number(task.deadline) > 0 && (
          <div className="task-meta-item">
            <span className="task-meta-label">Deadline</span>
            <span className="task-meta-value" style={{ fontSize: ".75rem" }}>{formatDate(task.deadline)}</span>
          </div>
        )}
        {status === 4 && task.workerRating > 0 && (
          <div className="task-meta-item">
            <span className="task-meta-label">Rating</span>
            <StarRating value={Number(task.workerRating)} />
          </div>
        )}
      </div>

      {/* Submission proof link */}
      {task.submissionProof && (
        <div style={{ marginTop: ".75rem", padding: ".55rem .8rem", background: "var(--bg-elevated)",
          borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: ".78rem" }}>
          <span style={{ color: "var(--text-muted)" }}>📎 Bukti: </span>
          <a href={task.submissionProof} target="_blank" rel="noreferrer"
            style={{ color: "var(--accent-blue)", wordBreak: "break-all" }}>{task.submissionProof}</a>
        </div>
      )}

      {/* PM Note */}
      {task.pmNote && (
        <div style={{ marginTop: ".5rem", padding: ".55rem .8rem", background: "rgba(16,185,129,.06)",
          borderRadius: "var(--radius-sm)", border: "1px solid rgba(16,185,129,.15)", fontSize: ".78rem" }}>
          💬 <span style={{ color: "var(--text-secondary)" }}>{task.pmNote}</span>
        </div>
      )}

      {/* Milestone list (PM view) */}
      {task.isMilestone && milestones && milestones.length > 0 && (
        <MilestoneList milestones={milestones} taskId={taskId} role={role} onMsAction={onMsAction} loading={loading} />
      )}

      {/* Milestone submit (Worker) */}
      {role === "worker" && task.isMilestone && status === 1 && milestones && (
        <div style={{ marginTop: ".75rem" }}>
          {milestones.map((ms, i) => Number(ms.status) === 0 && (
            <div key={i} style={{ marginBottom: ".5rem" }}>
              {activeMsSubmit === i ? (
                <div>
                  <input className="form-input" style={{ marginBottom: ".4rem" }}
                    placeholder={`Bukti milestone ${i+1} (URL/hash)`}
                    value={msProof[i] || ""} onChange={e => setMsProof(p => ({ ...p, [i]: e.target.value }))} />
                  <div style={{ display: "flex", gap: ".4rem" }}>
                    <button className="btn btn-primary btn-sm" disabled={loading || !msProof[i]}
                      onClick={() => { onMsAction("submitMs", taskId, i, msProof[i]); setActiveMsSubmit(null); }}>
                      Kirim M{i+1}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveMsSubmit(null)}>Batal</button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveMsSubmit(i)}>
                  📤 Submit Milestone {i+1}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="task-actions">
        {/* Worker */}
        {role === "worker" && status === 0 && (
          <button className="btn btn-primary btn-sm" onClick={() => onAction("claim", taskId)} disabled={loading}>
            {loading ? <span className="spinner"/> : "🤝 Klaim Task"}
          </button>
        )}
        {role === "worker" && status === 1 && !task.isMilestone && !showProof && (
          <button className="btn btn-secondary btn-sm" onClick={() => setShowProof(true)}>📤 Submit Bukti</button>
        )}
        {role === "worker" && status === 1 && !task.isMilestone && showProof && (
          <div style={{ width: "100%" }}>
            <input className="form-input" placeholder="Link bukti kerja (URL / IPFS hash)"
              value={proof} onChange={e => setProof(e.target.value)} style={{ marginBottom: ".4rem" }} />
            <div style={{ display: "flex", gap: ".4rem" }}>
              <button className="btn btn-primary btn-sm" disabled={loading || !proof.trim()}
                onClick={() => { onAction("submit", taskId, proof); setShowProof(false); setProof(""); }}>
                {loading ? <span className="spinner"/> : "✅ Kirim"}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowProof(false)}>Batal</button>
            </div>
          </div>
        )}
        {role === "worker" && status === 2 && !showDisp && (
          <button className="btn btn-danger btn-sm" onClick={() => setShowDisp(true)}>⚖️ Ajukan Dispute</button>
        )}
        {role === "worker" && status === 2 && showDisp && (
          <div style={{ width: "100%" }}>
            <textarea className="form-textarea" rows={2} placeholder="Alasan dispute..."
              value={dispReason} onChange={e => setDispReason(e.target.value)} style={{ marginBottom: ".4rem" }} />
            <div style={{ display: "flex", gap: ".4rem" }}>
              <button className="btn btn-danger btn-sm" disabled={loading || !dispReason.trim()}
                onClick={() => { onAction("dispute", taskId, dispReason); setShowDisp(false); }}>
                Ajukan
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDisp(false)}>Batal</button>
            </div>
          </div>
        )}

        {/* PM */}
        {role === "pm" && status === 2 && (
          <button className="btn btn-primary btn-sm" onClick={() => onAction("approve", taskId)} disabled={loading}>
            {loading ? <span className="spinner"/> : "💸 Approve & Bayar"}
          </button>
        )}
        {role === "pm" && (status === 0 || status === 1) && (
          <button className="btn btn-danger btn-sm" onClick={() => onAction("cancel", taskId)} disabled={loading}>
            🚫 Batalkan
          </button>
        )}
        {role === "pm" && status === 5 && (
          <span style={{ fontSize: ".78rem", color: "var(--accent-rose)" }}>
            ⚖️ Menunggu resolusi arbitrator
          </span>
        )}

        {/* Auto-approve trigger */}
        {Number(task.autoApproveAt) > 0 && status === 2 && (
          <span style={{ fontSize: ".7rem", color: "var(--text-muted)" }}>
            Auto-approve: {formatDate(task.autoApproveAt)}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
