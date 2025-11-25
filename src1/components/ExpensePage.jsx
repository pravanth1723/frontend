import React, { useState, useEffect } from "react";
import SetupForm from "./SetupForm";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";
import Preview from "./Preview";
import EditExpenseModal from "./EditExpenseModal";

/**
 * ExpensePage
 * - Combines setup, add/edit expenses, preview
 * - Accepts room = { id, passcode, data }
 * - persistRoom(roomData) will be called by parent when user clicks Save (or auto-save)
 */
export default function ExpensePage({ room, onLeave, currentUser, persistRoom }) {
  // initial data may come from room.data
  const initial = room.data || {
    splitTitle: "",
    users: [],
    organizer: "",
    expenses: [],
  };

  const [splitTitle, setSplitTitle] = useState(initial.splitTitle || "");
  const [users, setUsers] = useState(initial.users || []);
  const [organizer, setOrganizer] = useState(initial.organizer || "");
  const [expenses, setExpenses] = useState(initial.expenses || []);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    // auto-load any saved room data
    if (room && room.data) {
      setSplitTitle(room.data.splitTitle || "");
    }
  }, [room]);

  useEffect(() => {
    // auto-save to localStorage for the room (simulate backend)
    const timeout = setTimeout(() => {
      const payload = { splitTitle, users, organizer, expenses };
      const key = `room:${room.id}`;
      try {
        const existing = JSON.parse(localStorage.getItem(key)) || {};
        existing.data = payload;
        localStorage.setItem(key, JSON.stringify(existing));
      } catch {}
      if (persistRoom) persistRoom(payload);
    }, 600);
    return () => clearTimeout(timeout);
  }, [splitTitle, users, organizer, expenses, room.id, persistRoom]);

  function addExpense(exp) {
    setExpenses((s) => [...s, { ...exp, id: `e_${Date.now()}` }]);
  }
  function updateExpense(id, update) {
    setExpenses((s) => s.map(e => e.id === id ? { ...e, ...update } : e));
  }
  function removeExpense(id) {
    setExpenses((s) => s.filter(e => e.id !== id));
  }

  function handleEdit(exp) {
    setEditingExpense(exp);
  }
  function closeEditor() {
    setEditingExpense(null);
  }
  function applyEdit(id, newExp) {
    updateExpense(id, { ...newExp });
    closeEditor();
  }

  function resetAll() {
    if (!window.confirm("Start over? This clears current split in this room.")) return;
    setSplitTitle("");
    setUsers([]);
    setOrganizer("");
    setExpenses([]);
  }

  return (
    <div className="container-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 className="section-title">Room: <span className="small-tag">{room.id}</span></h2>
          <div className="small">You joined this room. Anyone with id + passcode can join (mock).</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn ghost" onClick={onLeave}>Leave Room</button>
          <button className="btn ghost" onClick={resetAll}>Start Over</button>
        </div>
      </div>

      <div style={{ marginTop: 14 }} className="split-steps">
        <div>
          <div className="card">
            <h3 className="small">Step 1 — Group Setup</h3>
            <SetupForm
              splitTitle={splitTitle}
              setSplitTitle={setSplitTitle}
              users={users}
              setUsers={setUsers}
              organizer={organizer}
              setOrganizer={setOrganizer}
            />
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <h3 className="small">Step 2 — Add Expense</h3>
            <ExpenseForm
              users={users}
              organizer={organizer}
              onAdd={addExpense}
            />
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <h3 className="small">Added Expenses</h3>
            <ExpenseList
              expenses={expenses}
              onEdit={handleEdit}
              onRemove={removeExpense}
            />
          </div>
        </div>

        <div>
          <div className="card">
            <h3 className="small">Preview / Finalize</h3>
            <Preview
              splitTitle={splitTitle}
              users={users}
              organizer={organizer}
              expenses={expenses}
              onSave={() => {
                // already auto-saved; inform user
                alert("Split saved locally for this room.");
              }}
            />
            <div className="footer-note">Tip: You can edit an existing expense from the list (Edit button) before finalizing.</div>
          </div>
        </div>
      </div>

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          users={users}
          onClose={closeEditor}
          onApply={(newExp) => applyEdit(editingExpense.id, newExp)}
        />
      )}
    </div>
  );
}