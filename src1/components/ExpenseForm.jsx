import React, { useState } from "react";

/**
 * ExpenseForm
 * - Title
 * - Who shares? (multiple)
 * - Paid by entries (multiple {user, amount})
 * - Add expense button
 *
 * onAdd({ title, users:[], spentBy:[{user,amount}]})
 */
export default function ExpenseForm({ users, organizer, onAdd }) {
  const [title, setTitle] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [paidByUser, setPaidByUser] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [paidEntries, setPaidEntries] = useState([]);

  function toggleUser(u) {
    setSelectedUsers(prev => prev.includes(u) ? prev.filter(x=>x!==u) : [...prev, u]);
  }
  function addPaidEntry() {
    const amt = parseFloat(paidAmount);
    if (!paidByUser) return alert("Select who paid");
    if (!amt || amt <= 0) return alert("Enter valid positive amount");
    setPaidEntries(prev => [...prev, { user: paidByUser, amount: amt }]);
    setPaidByUser("");
    setPaidAmount("");
  }
  function removePaid(idx) {
    setPaidEntries(prev => prev.filter((_,i)=>i!==idx));
  }
  function submitExpense(e) {
    e && e.preventDefault();
    if (!title.trim()) return alert("Expense title required");
    if (selectedUsers.length === 0) return alert("Select at least one person who shares this expense");
    if (paidEntries.length === 0) return alert("Add at least one paid-by entry");
    onAdd({ title: title.trim(), users: selectedUsers, spentBy: paidEntries });
    setTitle("");
    setSelectedUsers([]);
    setPaidEntries([]);
  }

  return (
    <form onSubmit={submitExpense}>
      <div style={{ marginBottom: 8 }}>
        <label className="small">Expense Title</label>
        <input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label className="small">Who shares?</label>
        <div className="checkbox-list" style={{ marginTop: 8 }}>
          {users.length === 0 && <div className="small">Add persons in Setup first.</div>}
          {users.map(u=>(
            <label key={u}>
              <input type="checkbox" checked={selectedUsers.includes(u)} onChange={()=>toggleUser(u)} style={{ marginRight: 8 }} />
              {u}
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label className="small">Paid By (multiple allowed)</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select className="input" value={paidByUser} onChange={(e)=>setPaidByUser(e.target.value)}>
            <option value="">Choose person</option>
            {users.map(u=> <option key={u} value={u}>{u}</option>)}
          </select>
          <input className="input" placeholder="Amount" value={paidAmount} onChange={(e)=>setPaidAmount(e.target.value)} />
          <button type="button" className="btn ghost" onClick={addPaidEntry}>Add</button>
        </div>

        <div style={{ marginTop: 8 }}>
          {paidEntries.length === 0 && <div className="small">No entries yet.</div>}
          {paidEntries.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", background: "#fbfaff", padding: 8, borderRadius: 6, marginTop: 6 }}>
              <div>{p.user}: <b>₹{p.amount.toFixed(2)}</b></div>
              <div>
                <button type="button" className="btn ghost" onClick={()=>removePaid(i)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="controls">
        <button className="btn" type="submit">Add Expense</button>
        <button type="button" className="btn ghost" onClick={() => {
          // quick preset: mark organizer as paid for convenience
          if (organizer && users.length) {
            setSelectedUsers([...users]);
            setPaidByUser(organizer);
          }
        }}>Quick: Mark organizer-paid</button>
      </div>
    </form>
  );
}