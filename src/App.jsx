import { useState, useMemo } from "react";

const initialTasks = [
  { id: 1, task: "Restock shelf A3 - pallet of boxes", assignedTo: "All", dueDate: "2026-05-14", status: "In Progress", notes: "", completedDate: "" },
  { id: 2, task: "Check forklift battery levels", assignedTo: "Raf", dueDate: "2026-05-15", status: "Not Started", notes: "", completedDate: "" },
  { id: 3, task: "Clear loading bay 2", assignedTo: "Dane", dueDate: "2026-05-13", status: "Complete", notes: "Done ahead of schedule", completedDate: "2026-05-13" },
];

const TEAM = ["All", "Raf", "Dane"];
const STATUSES = ["Not Started", "In Progress", "Complete"];
const MANAGER_PASSWORD = "manager123";

const STATUS_STYLES = {
  "Not Started": { bg: "#f3f4f6", border: "#d1d5db", text: "#374151", dot: "#6b7280" },
  "In Progress": { bg: "#fff7cc", border: "#f5c400", text: "#8a6d00", dot: "#f5c400" },
  "Complete": { bg: "#dcfce7", border: "#22c55e", text: "#166534", dot: "#22c55e" },
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
  const [view, setView] = useState("warehouse");
  const [managerUnlocked, setManagerUnlocked] = useState(false);
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

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

  function openManagerView() {
    if (managerUnlocked) {
      setView("manager");
    } else {
      setShowPasswordBox(true);
    }
  }

  function submitManagerPassword() {
    if (passwordInput === MANAGER_PASSWORD) {
      setManagerUnlocked(true);
      setView("manager");
      setShowPasswordBox(false);
      setPasswordInput("");
    } else {
      alert("Incorrect password");
    }
  }

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
        ? {
            ...t,
            ...form,
            completedDate:
              form.status === "Complete" && !t.completedDate
                ? new Date().toISOString().slice(0, 10)
                : form.status !== "Complete"
                  ? ""
                  : t.completedDate
          }
        : t
      ));
    } else {
      setTasks(ts => [...ts, { id: nextId, ...form, completedDate: "" }]);
      setNextId(n => n + 1);
    }

    setShowForm(false);
  }

  function deleteTask(id) {
    setTasks(ts => ts.filter(t => t.id !== id));
  }

  function cycleStatus(id) {
    setTasks(ts => ts.map(t => {
      if (t.id !== id) return t;
      const idx = STATUSES.indexOf(t.status);
      const next = STATUSES[(idx + 1) % STATUSES.length];

      return {
        ...t,
        status: next,
        completedDate: next === "Complete" ? new Date().toISOString().slice(0, 10) : ""
      };
    }));
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#111827", fontFamily: "Arial, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; }
        input, select, textarea { outline: none; }

        .row-hover:hover { background: #f9fafb !important; }

        .btn-primary {
          background: #f5c400;
          color: #111827;
          border: none;
          padding: 10px 18px;
          font-weight: 700;
          font-size: 14px;
          border-radius: 6px;
        }

        .btn-primary:hover { background: #ffd700; }

        .btn-ghost {
          background: #ffffff;
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 7px 12px;
          font-size: 12px;
          border-radius: 6px;
        }

        .btn-ghost:hover { background: #f3f4f6; }

        .tag {
          display: inline-block;
          padding: 4px 10px;
          font-size: 11px;
          border-radius: 999px;
          font-weight: 600;
        }

        .input-field {
          background: #ffffff;
          border: 1px solid #d1d5db;
          color: #111827;
          padding: 10px 12px;
          font-size: 14px;
          width: 100%;
          border-radius: 6px;
        }

        .input-field:focus { border-color: #f5c400; }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .modal {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          padding: 28px;
          width: 100%;
          max-width: 520px;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .filter-btn {
          background: #ffffff;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 7px 12px;
          font-size: 12px;
          border-radius: 6px;
        }

        .filter-btn.active {
          background: #111827;
          border-color: #111827;
          color: #ffffff;
        }

        .view-toggle {
          display: flex;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          overflow: hidden;
        }

        .view-btn {
          padding: 9px 18px;
          font-weight: 700;
          font-size: 13px;
          border: none;
        }

        .view-btn.active {
          background: #111827;
          color: #ffffff;
        }

        .view-btn:not(.active) {
          background: #ffffff;
          color: #374151;
        }
      `}</style>

      <div style={{ borderBottom: "1px solid #e5e7eb", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 6, height: 38, background: "#f5c400", borderRadius: 4 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 26, color: "#111827" }}>Warehouse Tasks</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Task Management System</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div className="view-toggle">
            <button className={`view-btn ${view === "warehouse" ? "active" : ""}`} onClick={() => setView("warehouse")}>Warehouse</button>
            <button className={`view-btn ${view === "manager" ? "active" : ""}`} onClick={openManagerView}>Manager</button>
          </div>

          {view === "manager" && (
            <button className="btn-primary" onClick={openNew}>+ Add Task</button>
          )}
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Tasks", val: stats.total, color: "#111827" },
            { label: "In Progress", val: stats.inProgress, color: "#b58b00" },
            { label: "Completed", val: stats.complete, color: "#15803d" },
            { label: "Overdue", val: stats.overdue, color: "#dc2626" },
          ].map(s => (
            <div key={s.label} style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "16px 20px", borderRadius: 10 }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontWeight: 700 }}>Status</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["All", ...STATUSES].map(s => (
                <button key={s} className={`filter-btn ${filterStatus === s ? "active" : ""}`} onClick={() => setFilterStatus(s)}>{s}</button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontWeight: 700 }}>Assigned To</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TEAM.map(p => (
                <button key={p} className={`filter-btn ${filterAssigned === p ? "active" : ""}`} onClick={() => setFilterAssigned(p)}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 110px 130px 110px", padding: "12px 20px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
            {["Task", "Assigned", "Due Date", "Status", view === "manager" ? "Actions" : "Update"].map(h => (
              <div key={h} style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>{h}</div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#6b7280", fontSize: 14 }}>No tasks match the current filters.</div>
          )}

          {filtered.map((t, i) => {
            const ss = STATUS_STYLES[t.status];
            const overdue = isOverdue(t);

            return (
              <div key={t.id} className="row-hover" style={{
                display: "grid",
                gridTemplateColumns: "1fr 100px 110px 130px 110px",
                padding: "14px 20px",
                borderBottom: i < filtered.length - 1 ? "1px solid #e5e7eb" : "none",
                background: "#ffffff",
                borderLeft: overdue ? "4px solid #dc2626" : "4px solid transparent",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ fontSize: 14, color: t.status === "Complete" ? "#9ca3af" : "#111827", textDecoration: t.status === "Complete" ? "line-through" : "none", marginBottom: 4 }}>{t.task}</div>
                  {t.notes && <div style={{ fontSize: 12, color: "#6b7280" }}>{t.notes}</div>}
                  {overdue && <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}>⚠ OVERDUE</span>}
                  {t.completedDate && <div style={{ fontSize: 12, color: "#15803d", marginTop: 2 }}>✓ Done {formatDate(t.completedDate)}</div>}
                </div>

                <div style={{ fontSize: 13, color: "#374151" }}>{t.assignedTo}</div>
                <div style={{ fontSize: 13, color: overdue ? "#dc2626" : "#374151" }}>{formatDate(t.dueDate)}</div>

                <div>
                  <span className="tag" style={{ background: ss.bg, border: `1px solid ${ss.border}`, color: ss.text }}>
                    <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: ss.dot, marginRight: 6 }} />
                    {t.status}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  {view === "manager" ? (
                    <>
                      <button className="btn-ghost" onClick={() => openEdit(t)}>Edit</button>
                      <button className="btn-ghost" style={{ color: "#dc2626" }} onClick={() => deleteTask(t.id)}>Delete</button>
                    </>
                  ) : (
                    <button className="btn-ghost" onClick={() => cycleStatus(t.id)}>
                      {t.status === "Not Started" ? "Start" : t.status === "In Progress" ? "Done" : "Reopen"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: "#6b7280" }}><span style={{ color: "#dc2626" }}>■</span> Red border = overdue task</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Warehouse view is open to staff. Manager view needs a password.</div>
        </div>
      </div>

      {showPasswordBox && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ fontWeight: 800, fontSize: 22, color: "#111827", marginBottom: 12 }}>
              Manager Login
            </div>

            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
              Enter the manager password to add, edit, or delete tasks.
            </div>

            <input
              className="input-field"
              type="password"
              placeholder="Enter manager password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitManagerPassword();
              }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => setShowPasswordBox(false)}>Cancel</button>
              <button className="btn-primary" onClick={submitManagerPassword}>Login</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div style={{ fontWeight: 800, fontSize: 22, color: "#111827", marginBottom: 22, borderBottom: "1px solid #e5e7eb", paddingBottom: 14 }}>
              {editId !== null ? "Edit Task" : "New Task"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: "#374151", marginBottom: 6, fontWeight: 700 }}>Task Description *</div>
                <input className="input-field" value={form.task} onChange={e => setForm(f => ({ ...f, task: e.target.value }))} placeholder="Describe the task..." />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, color: "#374151", marginBottom: 6, fontWeight: 700 }}>Assigned To</div>
                  <select className="input-field" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                    {TEAM.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <div style={{ fontSize: 13, color: "#374151", marginBottom: 6, fontWeight: 700 }}>Due Date</div>
                  <input className="input-field" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, color: "#374151", marginBottom: 6, fontWeight: 700 }}>Status</div>
                <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <div style={{ fontSize: 13, color: "#374151", marginBottom: 6, fontWeight: 700 }}>Notes</div>
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
