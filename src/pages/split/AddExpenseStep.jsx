import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSplit } from "../../context/SplitContext";
import ExpenseList from "../../components/ExpenseList";
import EditExpenseModal from "../../components/EditExpenseModal";

/**
 * Step 2 - Add Expenses
 * - Add expense title
 * - Select who shares (checkboxes)
 * - Add paid-by entries (user + amount)
 * - Save expense to in-memory store
 * - Edit expense via modal
 */
export default function AddExpenseStep() {
  const { users, organizer, addExpense, expenses, updateExpense, removeExpense } = useSplit();
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState([]);
  const [payer, setPayer] = useState("");
  const [amount, setAmount] = useState("");
  const [paidEntries, setPaidEntries] = useState([]);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  function toggleUser(u) {
    setSelected(prev => prev.includes(u) ? prev.filter(x=>x!==u) : [...prev, u]);
  }
  function addPaidEntry() {
    const amt = parseFloat(amount);
    if (!payer) return alert("Select a payer");
    if (!amt || amt <= 0) return alert("Enter a valid amount");
    setPaidEntries(prev => [...prev, { user: payer, amount: amt }]);
    setPayer("");
    setAmount("");
  }
  function removePaid(i) {
    setPaidEntries(prev => prev.filter((_, idx) => idx !== i));
  }
  function submitExpense(e) {
    e && e.preventDefault();
    if (!title.trim()) return alert("Expense title required");
    if (selected.length === 0) return alert("Select at least one person who shares");
    if (paidEntries.length === 0) return alert("Add at least one paid-by entry");
    addExpense({ title: title.trim(), users: selected, spentBy: paidEntries });
    setTitle("");
    setSelected([]);
    setPaidEntries([]);
  }

  function handleEdit(exp) {
    setEditing(exp);
  }
  function applyEdit(id, newExp) {
    updateExpense(id, { ...newExp });
    setEditing(null);
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <h3 className="small">Step 2: Add Expense</h3>
        <form onSubmit={submitExpense}>
          <div style={{ marginBottom: 8 }}>
            <label className="small">Expense Title</label>
            <input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="small">Who shares?</label>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {users.length === 0 && <div className="small">Add users in Step 1 first.</div>}
              {users.map(u => (
                <label key={u} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={selected.includes(u)} onChange={() => toggleUser(u)} />
                  {u}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="small">Paid by (multiple entries allowed)</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select className="input" value={payer} onChange={(e)=>setPayer(e.target.value)}>
                <option value="">Choose</option>
                {users.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <input className="input" placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} />
              <button type="button" className="btn ghost" onClick={addPaidEntry}>Add</button>
            </div>

            <div style={{ marginTop: 8 }}>
              {paidEntries.length === 0 && <div className="small">No paid-by entries yet.</div>}
              {paidEntries.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: 8, background: "#fbfaff", marginTop: 6, borderRadius: 6 }}>
                  <div>{p.user}: <b>₹{p.amount.toFixed(2)}</b></div>
                  <div><button className="btn ghost" onClick={()=>removePaid(i)}>Remove</button></div>
                </div>
              ))}
            </div>
          </div>

          <div className="controls">
            <button className="btn" type="submit">Add Expense</button>
            <button className="btn ghost" type="button" onClick={() => {
              if (!organizer || users.length === 0) return alert("Set organizer and users in Step 1 first");
              setSelected([...users]);
              setPayer(organizer);
            }}>Quick: Mark organizer-paid</button>
            <button className="btn secondary" type="button" onClick={() => navigate("../step3")}>Finish & Preview</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 className="small">Added Expenses</h3>
        <ExpenseList expenses={expenses} onEdit={handleEdit} onRemove={removeExpense} />
      </div>

      {editing && (
        <EditExpenseModal expense={editing} users={users} onClose={() => setEditing(null)} onApply={(newExp) => applyEdit(editing.id, newExp)} />
      )}
    </div>
  );
}