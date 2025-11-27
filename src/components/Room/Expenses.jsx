import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import EditExpenseModal from "../../components/EditExpenseModal";
import Snackbar from "../../components/Snackbar";
import Spinner from "../../components/Spinner";

export default function AddExpenseStep() {
  const { roomId } = useParams();
  
  const [roomTitle, setRoomTitle] = useState("");
  const [members, setMembers] = useState([]);
  const [organizer, setOrganizer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [apiExpenses, setApiExpenses] = useState([]);
  
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState([]);
  const [splitType, setSplitType] = useState("equal"); // 'equal' or 'individual'
  const [individualAmounts, setIndividualAmounts] = useState({});
  
  // For payers
  const [paidEntries, setPaidEntries] = useState([]);
  const [payer, setPayer] = useState("");
  const [amount, setAmount] = useState("");
  
  const [editing, setEditing] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpenseListOpen, setIsExpenseListOpen] = useState(false);
  const [snackbar, setSnackbar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
      fetchExpenses();
    }
  }, [roomId]);

  function fetchRoomData() {
    setIsLoading(true);
    axios.get(`http://localhost:5000/api/rooms/${roomId}`, { withCredentials: true })
      .then(response => {
        if (response.status===200) {
          const data = response.data.data;
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

  function fetchExpenses() {
    axios.get(`http://localhost:5000/api/expenses/by-room-id/${roomId}`, { withCredentials: true })
      .then(response => {
        if (response.status === 200) {
          setApiExpenses(response.data.data || []);
        }
      })
      .catch(error => {
        console.error('Error fetching expenses:', error);
      });
  }

  function toggleUser(u) {
    setSelected(prev => {
      const newSelected = prev.includes(u) ? prev.filter(x=>x!==u) : [...prev, u];
      // Reset individual amounts when selection changes
      if (splitType === 'individual') {
        const newAmounts = {};
        newSelected.forEach(person => {
          newAmounts[person] = individualAmounts[person] || "";
        });
        setIndividualAmounts(newAmounts);
      }
      return newSelected;
    });
  }
  
  function updateIndividualAmount(person, value) {
    setIndividualAmounts(prev => ({
      ...prev,
      [person]: value
    }));
  }
  
  function addPaidEntry() {
    const amt = parseFloat(amount);
    if (!payer) {
      setSnackbar({ category: 'error', message: 'Select a payer' });
      return;
    }
    if (!amt || amt <= 0) {
      setSnackbar({ category: 'error', message: 'Enter a valid amount' });
      return;
    }
    setPaidEntries(prev => [...prev, { name: payer, amount: amt }]);
    setPayer("");
    setAmount("");
  }
  
  function removePaid(i) {
    setPaidEntries(prev => prev.filter((_, idx) => idx !== i));
  }
  
  function submitExpense(e) {
    e && e.preventDefault();
    
    if (!description.trim()) {
      setSnackbar({ category: 'error', message: 'Expense description required' });
      return;
    }
    if (selected.length === 0) {
      setSnackbar({ category: 'error', message: 'Select at least one person who shares' });
      return;
    }
    if (paidEntries.length === 0) {
      setSnackbar({ category: 'error', message: 'Add at least one paid-by entry' });
      return;
    }
    
    let spentBy = [];
    let spentFor = [];
    let total = 0;
    
    // Calculate total from all payers
    total = paidEntries.reduce((sum, entry) => sum + entry.amount, 0);
    spentBy = paidEntries;
    
    // Calculate split based on type
    if (splitType === "equal") {
      // Split equally
      const perPerson = total / selected.length;
      spentFor = selected.map(person => ({
        name: person,
        amount: perPerson
      }));
    } else {
      // Individual amounts
      spentFor = selected.map(person => {
        const amt = parseFloat(individualAmounts[person] || 0);
        if (amt <= 0) {
          throw new Error(`Please enter valid amount for ${person}`);
        }
        return { name: person, amount: amt };
      });
      
      const totalSpentFor = spentFor.reduce((sum, item) => sum + item.amount, 0);
      if (Math.abs(totalSpentFor - total) > 0.01) {
        setSnackbar({ category: 'error', message: `Total split amount (₹${totalSpentFor.toFixed(2)}) must equal paid amount (₹${total.toFixed(2)})` });
        return;
      }
    }
    
    // API call
    setIsSaving(true);
    axios.post('http://localhost:5000/api/expenses', {
      roomId: roomId,
      description: description.trim(),
      category: "multiple",
      total: total,
      spentBy: spentBy,
      spentFor: spentFor
    }, { withCredentials: true })
      .then(response => {
        if (response.status === 200) {
          setSnackbar({ category: 'success', message: 'Expense added successfully' });
          // Reset form
          setDescription("");
          setSelected([]);
          setSplitType("equal");
          setIndividualAmounts({});
          setPaidEntries([]);
          fetchExpenses();
        }
        setIsSaving(false);
      })
      .catch(error => {
        console.error('Error adding expense:', error);
        setSnackbar({ category: 'error', message: 'Error adding expense' });
        setIsSaving(false);
      });
  }

  function handleEdit(exp) {
    setEditing(exp);
  }
  
  function handleDeleteExpense(expenseId) {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    axios.delete(`http://localhost:5000/api/expenses/${expenseId}`, { withCredentials: true })
      .then(response => {
        if (response.status === 200) {
          setSnackbar({ category: 'success', message: 'Expense deleted successfully' });
          fetchExpenses();
        }
      })
      .catch(error => {
        console.error('Error deleting expense:', error);
        setSnackbar({ category: 'error', message: 'Error deleting expense' });
      });
  }
  
  function applyEdit(expenseId, updatedData) {
    axios.put(`http://localhost:5000/api/expenses/${expenseId}`, updatedData, { withCredentials: true })
      .then(response => {
        if (response.status === 200) {
          setSnackbar({ category: 'success', message: 'Expense updated successfully' });
          setEditing(null);
          fetchExpenses();
        }
      })
      .catch(error => {
        console.error('Error updating expense:', error);
        setSnackbar({ category: 'error', message: 'Error updating expense' });
      });
  }

  if (isLoading) {
    return (
      <div className="card">
        <div style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Spinner size="medium" color="var(--primary)" />
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
            <label className="small">Description</label>
            <input 
              className="input" 
              value={description} 
              onChange={(e)=>setDescription(e.target.value)} 
              placeholder="e.g., Dinner, Hotel, Transport"
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="small">Who shares this expense?</label>
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
            <label className="small">Paid by (add one or more entries)</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <select className="input" value={payer} onChange={(e)=>setPayer(e.target.value)}>
                <option value="">Choose</option>
                {members.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <input 
                className="input" 
                type="number"
                step="0.01"
                placeholder="Amount" 
                value={amount} 
                onChange={(e)=>setAmount(e.target.value)} 
              />
              <button type="button" className="btn ghost" onClick={addPaidEntry}>Add</button>
            </div>

            <div style={{ marginTop: 8 }}>
              {paidEntries.length === 0 && <div className="small">No paid-by entries yet.</div>}
              {paidEntries.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: 8, background: "#fbfaff", marginTop: 6, borderRadius: 6 }}>
                  <div>{p.name}: <b>₹{p.amount.toFixed(2)}</b></div>
                  <div><button type="button" className="btn ghost" onClick={()=>removePaid(i)}>Remove</button></div>
                </div>
              ))}
              {paidEntries.length > 0 && (
                <div style={{ marginTop: 8, fontWeight: 600 }}>
                  Total: ₹{paidEntries.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="small">Split Type</label>
            <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input 
                  type="radio" 
                  name="splitType" 
                  value="equal"
                  checked={splitType === "equal"} 
                  onChange={(e) => setSplitType(e.target.value)} 
                />
                Split Equally
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input 
                  type="radio" 
                  name="splitType" 
                  value="individual"
                  checked={splitType === "individual"} 
                  onChange={(e) => setSplitType(e.target.value)} 
                />
                Individual Amounts
              </label>
            </div>
          </div>

          {splitType === "individual" && selected.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <label className="small">Enter amount for each person</label>
              <div style={{ marginTop: 8 }}>
                {selected.map(person => (
                  <div key={person} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ minWidth: "100px", fontWeight: 500 }}>{person}:</span>
                    <input 
                      className="input" 
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={individualAmounts[person] || ""}
                      onChange={(e) => updateIndividualAmount(person, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="controls">
            <button className="btn" type="submit" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {isSaving && <Spinner size="small" color="#ffffff" />}
              {isSaving ? "Saving..." : "Add Expense"}
            </button>
            <button className="btn secondary" type="button" onClick={() => navigate("../step3")}>
              Finish & Preview
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            padding: '8px 0'
          }}
          onClick={() => setIsExpenseListOpen(!isExpenseListOpen)}
        >
          <h3 className="small">Added Expenses ({apiExpenses.length})</h3>
          <span style={{ fontSize: '20px', transition: 'transform 0.3s', transform: isExpenseListOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>
        
        {isExpenseListOpen && (
          <>
            {apiExpenses.length === 0 ? (
              <div className="small" style={{ color: '#999', padding: '20px', textAlign: 'center' }}>
                No expenses added yet
              </div>
            ) : (
              <div>
                {apiExpenses.map((expense) => (
              <div 
                key={expense._id} 
                style={{ 
                  padding: '12px', 
                  background: '#f9f9f9', 
                  borderRadius: '4px', 
                  marginBottom: '8px',
                  border: '1px solid #e0e0e0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{expense.description}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    ₹{expense.total.toFixed(2)}
                  </div>
                </div>
                
                <div style={{ marginBottom: 6 }}>
                  <div className="small" style={{ fontWeight: 600, marginBottom: 4 }}>Paid by:</div>
                  {expense.spentBy.map((payer, idx) => (
                    <div key={idx} className="small" style={{ paddingLeft: 8 }}>
                      • {payer.name}: ₹{payer.amount.toFixed(2)}
                    </div>
                  ))}
                </div>
                
                <div style={{ marginBottom: 8 }}>
                  <div className="small" style={{ fontWeight: 600, marginBottom: 4 }}>Split among:</div>
                  {expense.spentFor.map((person, idx) => (
                    <div key={idx} className="small" style={{ paddingLeft: 8 }}>
                      • {person.name}: ₹{person.amount.toFixed(2)}
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className="btn ghost" 
                    onClick={() => handleEdit(expense)}
                    style={{ fontSize: '12px', padding: '4px 12px' }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn ghost" 
                    onClick={() => handleDeleteExpense(expense._id)}
                    style={{ fontSize: '12px', padding: '4px 12px', color: '#d32f2f' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
              </div>
            )}
          </>
        )}
      </div>

      {editing && (
        <EditExpenseModal 
          expense={editing} 
          members={members} 
          onClose={() => setEditing(null)} 
          onApply={(newExp) => applyEdit(editing._id, newExp)} 
        />
      )}

      {snackbar && (
        <Snackbar
          category={snackbar.category}
          message={snackbar.message}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
}
