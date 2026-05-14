import { useState, useMemo } from "react";

const initialTasks = [
  { id: 1, task: "Restock shelf A3 - pallet of boxes", assignedTo: "All", dueDate: "2026-05-14", status: "In Progress", notes: "", completedDate: "" },
  { id: 2, task: "Check forklift battery levels", assignedTo: "Raf", dueDate: "2026-05-15", status: "Not Started", notes: "", completedDate: "" },
  { id: 3, task: "Clear loading bay 2", assignedTo: "Dane", dueDate: "2026-05-13", status: "Complete", notes: "Done ahead of schedule", completedDate: "2026-05-13" },
];

const TEAM = ["All", "Raf", "Dane"];
const STATUSES = ["Not Started", "In Progress", "Complete"];

const STATUS_STYLES = {
  "Not Started": { bg: "#1a1a1a", border: "#444", text: "#aaa", dot: "#555" },
  "In Progress": { bg: "#1a1500", border: "#7a6000", text: "#f5c400", dot: "#f5c400" },
  "Complete":    { bg: "#001a08", border: "#1a6635", text: "#2ecc71", dot: "#2ecc71" },
};

function isOverdue(task) {
  if (task.status === "Complete") return false;
  return task.dueDate && new Date(task.dueDate) < new Date(new Date().toDateString());
}

function formatDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [view, setView] = useState("manager"); // "manager" | "warehouse"
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterAssigned, setFilterAssigned] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ task: "", assignedTo: "All", dueDate: "", status: "Not Started", notes: "" });
  const [nextId, setNextId] = useState(4);

  const filtered = useMemo(() => tasks.filter(t => {
    const statusOk = filterStatus === "All" || t.status === filterStatus;
    const assignOk = filterAssigned === "All" || t.assignedTo === filterAssigned || t.assignedTo === "All";
    if (view === "warehouse") return statusOk && assignOk && t.status !== "Complete";
    return statusOk && assignOk;
  }), [tasks, filterStatus, filterAssigned, view]);

  const stats = {
    total: tasks.length,
    complete: tasks.filter(t => t.status === "Complete").length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    overdue: tasks.filter(isOverdue).length,
  };

  function openNew() {
    setForm({ task: "", assignedTo: "All", dueDate: "", status: "Not Started", notes: "" });
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(t) {
    setForm({ task: t.task, assignedTo: t.assignedTo, dueDate: t.dueDate, status: t.status, notes: t.notes });
    setEditId(t.id);
    setShowForm(true);
  }

  function saveForm() {
    if (!form.task.trim()) return;
    if (editId !== null) {
      setTasks(ts => ts.map(t => t.id === editId
        ? { ...t, ...form, completedDate: form.status === "Complete" && !t.completedDate ? new Date().toISOString().slice(0,10) : (form.status !== "Complete" ? "" : t.completedDate) }
        : t));
    } else {
      setTasks(ts => [...ts, { id: nextId, ...form, completedDate: "" }]);
      setNextId(n => n + 1);
    }
    setShowForm(false);
  }

  function deleteTask(id) {
    setTasks(ts => ts.filter(t => t.id !== id));
  }

  function markComplete(id) {
    setTasks(ts => ts.map(t => t.id === id
      ? { ...t, status: "Complete", completedDate: new Date().toISOString().slice(0,10) }
      : t));
  }

  function cycleStatus(id) {
    setTasks(ts => ts.map(t => {
      if (t.id !== id) return t;
      const idx = STATUSES.indexOf(t.status);
      const next = STATUSES[(idx + 1) % STATUSES.length];
      return { ...t, status: next, completedDate: next === "Complete" ? new Date().toISOString().slice(0,10) : "" };
    }));
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#e0e0e0", fontFamily: "'DM Mono', 'Courier New', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Barlow+Condensed:wght@400;600;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        input, select, textarea { outline: none; } button { cursor: pointer; }
        .row-hover:hover { background: #161616 !important; }
        .btn-primary { background: #f5c400; color: #000; border: none; padding: 10px 22px; font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 15px; letter-spacing: 1px; text-transform: uppercase; transition: all 0.15s; }
        .btn-primary:hover { background: #ffd700; }
        .btn-ghost { background: transparent; color: #777; border: 1px solid #2a2a2a; padding: 8px 16px; font-family: 'DM Mono', monospace; font-size: 12px; transition: all 0.15s; }
        .btn-ghost:hover { border-color: #555; color: #ccc; }
        .tag { display: inline-block; padding: 3px 10px; font-size: 11px; letter-spacing: 0.5px; border-radius: 2px; font-family: 'DM Mono', monospace; }
        .input-field { background: #141414; border: 1px solid #2a2a2a; color: #e0e0e0; padding: 10px 14px; font-family: 'DM Mono', monospace; font-size: 13px; width: 100%; transition: border 0.15s; }
        .input-field:focus { border-color: #f5c400; }
        .overdue-row { border-left: 3px solid #cc3300 !important; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
        .modal { background: #111; border: 1px solid #2a2a2a; padding: 32px; width: 100%; max-width: 520px; }
        .filter-btn { background: transparent; border: 1px solid #222; color: #666; padding: 6px 14px; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.5px; transition: all 0.15s; }
        .filter-btn.active { background: #f5c400; border-color: #f5c400; color: #000; font-weight: 500; }
        .filter-btn:hover:not(.active) { border-color: #444; color: #aaa; }
        .view-toggle { display: flex; border: 1px solid #2a2a2a; overflow: hidden; }
        .view-btn { padding: 8px 20px; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; border: none; transition: all 0.15s; }
        .view-btn.active { background: #f5c400; color: #000; }
        .view-btn:not(.active) { background: transparent; color: #555; }
        .view-btn:not(.active):hover { color: #999; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e1e1e", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 6, height: 40, background: "#f5c400" }} />
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: 2, color: "#fff", textTransform: "uppercase" }}>Warehouse Tasks</div>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>Task Management System</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div className="view-toggle">
            <button className={`view-btn ${view === "manager" ? "active" : ""}`} onClick={() => setView("manager")}>Manager</button>
            <button className={`view-btn ${view === "warehouse" ? "active" : ""}`} onClick={() => setView("warehouse")}>Warehouse</button>
          </div>
          {view === "manager" && (
            <button className="btn-primary" onClick={openNew}>+ Add Task</button>
          )}
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Tasks", val: stats.total, color: "#fff" },
            { label: "In Progress", val: stats.inProgress, color: "#f5c400" },
            { label: "Completed", val: stats.complete, color: "#2ecc71" },
            { label: "Overdue", val: stats.overdue, color: "#cc3300" },
          ].map(s => (
            <div key={s.label} style={{ background: "#111", border: "1px solid #1e1e1e", padding: "16px 20px" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 4, letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Status</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["All", ...STATUSES].map(s => (
                <button key={s} className={`filter-btn ${filterStatus === s ? "active" : ""}`} onClick={() => setFilterStatus(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Assigned To</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TEAM.map(p => (
                <button key={p} className={`filter-btn ${filterAssigned === p ? "active" : ""}`} onClick={() => setFilterAssigned(p)}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div style={{ border: "1px solid #1e1e1e" }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 110px 130px 110px", gap: 0, padding: "10px 20px", borderBottom: "1px solid #1e1e1e", background: "#0d0d0d" }}>
            {["Task", "Assigned", "Due Date", "Status", view === "manager" ? "Actions" : "Update"].map(h => (
              <div key={h} style={{ fontSize: 10, color: "#444", letterSpacing: 1, textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#333", fontSize: 13 }}>No tasks match the current filters.</div>
          )}

          {filtered.map((t, i) => {
            const ss = STATUS_STYLES[t.status];
            const overdue = isOverdue(t);
            return (
              <div key={t.id} className="row-hover" style={{
                display: "grid", gridTemplateColumns: "1fr 100px 110px 130px 110px",
                padding: "14px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #161616" : "none",
                background: "#0f0f0f", borderLeft: overdue ? "3px solid #cc3300" : "3px solid transparent",
                alignItems: "center", gap: 0, transition: "background 0.1s"
              }}>
                <div>
                  <div style={{ fontSize: 13, color: t.status === "Complete" ? "#555" : "#ddd", textDecoration: t.status === "Complete" ? "line-through" : "none", marginBottom: 4 }}>{t.task}</div>
                  {t.notes && <div style={{ fontSize: 11, color: "#444" }}>{t.notes}</div>}
                  {overdue && <span style={{ fontSize: 10, color: "#cc3300", letterSpacing: 0.5 }}>⚠ OVERDUE</span>}
                  {t.completedDate && <div style={{ fontSize: 10, color: "#2ecc71", marginTop: 2 }}>✓ Done {formatDate(t.completedDate)}</div>}
                </div>
                <div style={{ fontSize: 12, color: "#777" }}>{t.assignedTo}</div>
                <div style={{ fontSize: 12, color: overdue ? "#cc3300" : "#777" }}>{formatDate(t.dueDate)}</div>
                <div>
                  <span className="tag" style={{ background: ss.bg, border: `1px solid ${ss.border}`, color: ss.text }}>
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: ss.dot, marginRight: 6 }} />
                    {t.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {view === "manager" ? (
                    <>
                      <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => openEdit(t)}>Edit</button>
                      <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 11, color: "#662222", borderColor: "#2a1a1a" }} onClick={() => deleteTask(t.id)}>✕</button>
                    </>
                  ) : (
                    <button
                      className="btn-ghost"
                      style={{ padding: "5px 12px", fontSize: 11, color: t.status === "Complete" ? "#2ecc71" : "#f5c400", borderColor: t.status === "Complete" ? "#1a4a2a" : "#4a4000" }}
                      onClick={() => cycleStatus(t.id)}
                    >
                      {t.status === "Not Started" ? "▶ Start" : t.status === "In Progress" ? "✓ Done" : "↩ Reopen"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ marginTop: 16, display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: 0.5 }}><span style={{ color: "#cc3300" }}>■</span> Red border = overdue task</div>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: 0.5 }}>Warehouse view: use ▶ Start → ✓ Done to update status</div>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: 2, color: "#fff", textTransform: "uppercase", marginBottom: 24, borderBottom: "1px solid #1e1e1e", paddingBottom: 16 }}>
              {editId !== null ? "Edit Task" : "New Task"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Task Description *</div>
                <input className="input-field" value={form.task} onChange={e => setForm(f => ({ ...f, task: e.target.value }))} placeholder="Describe the task..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Assigned To</div>
                  <select className="input-field" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                    {TEAM.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Due Date</div>
                  <input className="input-field" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Status</div>
                <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Notes</div>
                <textarea className="input-field" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." rows={3} style={{ resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveForm}>{editId !== null ? "Save Changes" : "Add Task"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
