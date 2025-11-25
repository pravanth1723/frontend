import React, { useState } from "react";

/**
 * EditExpenseModal - edit title, members sharing, paid-by entries
 */
export default function EditExpenseModal({ expense, members, onClose, onApply }) {
  console.log("Expense", expense);
  console.log("Members", members);
  const [title, setTitle] = useState(expense.description || "");
  const [selectedmembers, setSelectedmembers] = useState(
    (expense.spentFor || []).map(item => item.name)
  );
  const [entries, setEntries] = useState(
    (expense.spentBy || []).map(s => ({ user: s.name, amount: s.amount }))
  );
  const [newPayer, setNewPayer] = useState("");
  const [newAmt, setNewAmt] = useState("");

  function toggleUser(u) {
    setSelectedmembers(prev => prev.includes(u) ? prev.filter(x=>x!==u) : [...prev, u]);
  }
  function addEntry() {
    const amt = parseFloat(newAmt);
    if (!newPayer) return alert("Select payer");
    if (!amt || amt <= 0) return alert("Enter valid amount");
    setEntries(prev => [...prev, { user: newPayer, amount: amt }]);
    setNewPayer("");
    setNewAmt("");
  }
  function removeEntry(i) {
    setEntries(prev => prev.filter((_, idx) => idx !== i));
  }
  function apply() {
    if (!title.trim()) return alert("Title is required");
    if (selectedmembers.length === 0) return alert("Select at least one person who shares");
    if (entries.length === 0) return alert("Add at least one paid-by entry");
    
    // Convert to API format
    const updatedExpense = {
      description: title.trim(),
      category: expense.category,
      total: entries.reduce((sum, e) => sum + parseFloat(e.amount), 0),
      spentBy: entries.map(e => ({ name: e.user, amount: parseFloat(e.amount) })),
      spentFor: selectedmembers.map(name => {
        const totalAmount = entries.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        return { name, amount: totalAmount / selectedmembers.length };
      })
    };
    
    onApply(updatedExpense);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Edit Expense</h3>

        <div className="form-row">
          <div className="label">Description</div>
          <input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} />
        </div>

        <div style={{ marginTop: 8 }}>
          <div className="label">Who shares</div>
          <div className="checkbox-list" style={{ marginTop: 8 }}>
            {members.map(u => (
              <label key={u}>
                <input type="checkbox" checked={selectedmembers.includes(u)} onChange={()=>toggleUser(u)} style={{ marginRight: 8 }} />
                {u}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="label">Paid by</div>
          <div style={{ marginTop: 8 }}>
            {entries.length === 0 && <div className="small">No entries yet.</div>}
            {entries.map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: 8, borderRadius: 6, background: "#fbfaff", marginBottom: 6 }}>
                <div>{e.user}: <b>₹{parseFloat(e.amount).toFixed(2)}</b></div>
                <div><button className="btn ghost" onClick={()=>removeEntry(i)}>Remove</button></div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <select className="input" value={newPayer} onChange={(e)=>setNewPayer(e.target.value)}>
              <option value="">Choose person</option>
              {members.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input className="input" placeholder="Amount" value={newAmt} onChange={(e)=>setNewAmt(e.target.value)} />
            <button className="btn ghost" onClick={addEntry} type="button">Add</button>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={apply}>Apply</button>
        </div>
      </div>
    </div>
  );
}
