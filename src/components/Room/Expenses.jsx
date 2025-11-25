import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSplit } from "../../context/SplitContext";
import axios from "axios";
import ExpenseList from "../../components/ExpenseList";
import EditExpenseModal from "../../components/EditExpenseModal";

export default function AddExpenseStep() {
  const { roomId } = useParams();
  const { addExpense, expenses, updateExpense, removeExpense } = useSplit();
  
  const [roomTitle, setRoomTitle] = useState("");
  const [members, setMembers] = useState([]);
  const [organizer, setOrganizer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState([]);
  const [payer, setPayer] = useState("");
  const [amount, setAmount] = useState("");
  const [paidEntries, setPaidEntries] = useState([]);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
    }
  }, [roomId]);

  function fetchRoomData() {
    setIsLoading(true);
    axios.get(`http://localhost:5000/api/rooms/${roomId}`, { withCredentials: true })
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          const data = response.data;
          setRoomTitle(data.title || "");
          setMembers(data.members || []);
          setOrganizer(data.organizer || "");
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching room data:', error);
        setIsLoading(false);
      });
  }

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

  if (isLoading) {
    return (
      <div className="card">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div className="small">Loading room data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Room Info Display */}
      <div className="card" style={{ marginBottom: 12, padding: '12px', background: '#f5f5f5' }}>
        <div style={{ marginBottom: 8 }}>
          <span className="small" style={{ color: '#666' }}>Room Title: </span>
          <span style={{ fontWeight: 600 }}>{roomTitle || "N/A"}</span>
        </div>
        <div>
          <span className="small" style={{ color: '#666' }}>Members: </span>
          <span style={{ fontWeight: 500 }}>{members.length > 0 ? members.join(", ") : "N/A"}</span>
        </div>
      </div>

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
              {members.length === 0 && <div className="small">Add members in Step 1 first.</div>}
              {members.map(u => (
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
                {members.map(u => <option key={u} value={u}>{u}</option>)}
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
              if (!organizer || members.length === 0) return alert("Set organizer and members in Step 1 first");
              setSelected([...members]);
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
        <EditExpenseModal expense={editing} users={members} onClose={() => setEditing(null)} onApply={(newExp) => applyEdit(editing.id, newExp)} />
      )}
    </div>
  );
}
