import React, { useState, useEffect } from "react";

/**
 * EditExpenseModal - edit title, members sharing, paid-by entries, and individual splits
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
  
  // For individual split amounts
  const [splitType, setSplitType] = useState("equal");
  const [individualAmounts, setIndividualAmounts] = useState({});

  // Initialize individual amounts from expense data
  useEffect(() => {
    if (expense.spentFor && expense.spentFor.length > 0) {
      // Check if all amounts are equal (equal split) or different (individual)
      const amounts = expense.spentFor.map(s => s.amount);
      const allEqual = amounts.every(amt => Math.abs(amt - amounts[0]) < 0.01);
      
      if (allEqual) {
        setSplitType("equal");
      } else {
        setSplitType("individual");
        const amountMap = {};
        expense.spentFor.forEach(s => {
          amountMap[s.name] = s.amount;
        });
        setIndividualAmounts(amountMap);
      }
    }
  }, [expense]);

  function toggleUser(u) {
    const newSelected = selectedmembers.includes(u) 
      ? selectedmembers.filter(x=>x!==u) 
      : [...selectedmembers, u];
    setSelectedmembers(newSelected);
    
    // If adding a new user in individual mode, initialize their amount
    if (splitType === "individual" && !selectedmembers.includes(u)) {
      const total = entries.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      setIndividualAmounts(prev => ({
        ...prev,
        [u]: (total / (newSelected.length || 1)).toFixed(2)
      }));
    }
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

  function handleIndividualAmountChange(name, value) {
    setIndividualAmounts(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function apply() {
    if (!title.trim()) return alert("Title is required");
    if (selectedmembers.length === 0) return alert("Select at least one person who shares");
    if (entries.length === 0) return alert("Add at least one paid-by entry");
    
    const totalAmount = entries.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    let spentFor;
    if (splitType === "equal") {
      spentFor = selectedmembers.map(name => ({
        name,
        amount: totalAmount / selectedmembers.length
      }));
    } else {
      // Individual split
      const individualTotal = selectedmembers.reduce((sum, name) => {
        return sum + (parseFloat(individualAmounts[name]) || 0);
      }, 0);
      
      if (Math.abs(individualTotal - totalAmount) > 0.01) {
        return alert(`Individual amounts (₹${individualTotal.toFixed(2)}) must equal total paid (₹${totalAmount.toFixed(2)})`);
      }
      
      spentFor = selectedmembers.map(name => ({
        name,
        amount: parseFloat(individualAmounts[name]) || 0
      }));
    }
    
    // Convert to API format
    const updatedExpense = {
      description: title.trim(),
      category: "multiple",
      total: totalAmount,
      spentBy: entries.map(e => ({ name: e.user, amount: parseFloat(e.amount) })),
      spentFor: spentFor
    };
    
    onApply(updatedExpense);
  }

  const totalPaid = entries.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h3>Edit Expense</h3>

        <div className="form-row">
          <div className="label">Description</div>
          <input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} />
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
          <div style={{ marginTop: 8, fontWeight: 'bold' }}>
            Total Paid: ₹{totalPaid.toFixed(2)}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
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

        {selectedmembers.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div className="label">Split Type</div>
            <div style={{ marginTop: 8 }}>
              <label style={{ marginRight: 16 }}>
                <input 
                  type="radio" 
                  value="equal" 
                  checked={splitType === "equal"} 
                  onChange={(e) => setSplitType(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                Split Equally
              </label>
              <label>
                <input 
                  type="radio" 
                  value="individual" 
                  checked={splitType === "individual"} 
                  onChange={(e) => setSplitType(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                Individual Amounts
              </label>
            </div>

            {splitType === "equal" ? (
              <div style={{ marginTop: 8, padding: 8, background: "#f0f0f0", borderRadius: 6 }}>
                Each person pays: <b>₹{(totalPaid / selectedmembers.length).toFixed(2)}</b>
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                <div className="small" style={{ marginBottom: 8, color: '#666' }}>
                  Enter individual amounts (must total ₹{totalPaid.toFixed(2)})
                </div>
                {selectedmembers.map(name => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                    <div style={{ flex: 1 }}>{name}:</div>
                    <input 
                      type="number" 
                      className="input" 
                      style={{ width: '150px' }}
                      placeholder="Amount"
                      value={individualAmounts[name] || ''}
                      onChange={(e) => handleIndividualAmountChange(name, e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                ))}
                <div style={{ marginTop: 8, fontWeight: 'bold' }}>
                  Total Individual: ₹{selectedmembers.reduce((sum, name) => sum + (parseFloat(individualAmounts[name]) || 0), 0).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={apply}>Apply</button>
        </div>
      </div>
    </div>
  );
}
