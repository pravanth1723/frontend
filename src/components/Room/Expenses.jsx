import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import EditExpenseModal from "../EditExpenseModal";
import Snackbar from "../Snackbar";
import Spinner from "../Spinner";

/**
 * Expenses Component
 * - Fetches room data and expenses
 * - Allows adding, editing, and deleting expenses
 */
export default function Expenses() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [roomTitle, setRoomTitle] = useState("");
  const [members, setMembers] = useState([]);
  const [organizer, setOrganizer] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [apiExpenses, setApiExpenses] = useState([]);
  const [isExpensesOpen, setIsExpensesOpen] = useState(false);

  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [splitType, setSplitType] = useState("equal");
  const [individualAmounts, setIndividualAmounts] = useState({});
  const [payers, setPayers] = useState([]);
  const [newPayerName, setNewPayerName] = useState("");
  const [newPayerAmount, setNewPayerAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [editingExpense, setEditingExpense] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    fetchRoomData();
    fetchExpenses();
  }, [roomId]);

  async function fetchRoomData() {
    try {
      const response = await axios.get(`http://localhost:5000/api/rooms/${roomId}`, { withCredentials: true });
      if (response.status === 200) {
        const data = response.data.data;
        setRoomTitle(data.title || data.name || "");
        setMembers(data.members || []); // Fixed: using 'members' from API
        setOrganizer(data.organizer || "");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching room data:", error);
      setSnackbar({ category: 'error', message: 'Failed to load room data' });
      setIsLoading(false);
    }
  }

  async function fetchExpenses() {
    try {
      const response = await axios.get(`http://localhost:5000/api/expenses/by-room-id/${roomId}`, { withCredentials: true });
      if (response.status === 200) {
        setApiExpenses(response.data.data || []); // Fixed: accessing data.data
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  }

  function toggleMember(member) {
    setSelectedMembers(prev =>
      prev.includes(member) ? prev.filter(m => m !== member) : [...prev, member]
    );
  }

  function addPayer() {
    const amount = parseFloat(newPayerAmount);
    if (!newPayerName) {
      setSnackbar({ category: 'error', message: 'Please select a payer' });
      return;
    }
    if (!amount || amount <= 0) {
      setSnackbar({ category: 'error', message: 'Please enter a valid amount' });
      return;
    }
    setPayers(prev => [...prev, { name: newPayerName, amount }]);
    setNewPayerName("");
    setNewPayerAmount("");
  }

  function removePayer(index) {
    setPayers(prev => prev.filter((_, i) => i !== index));
  }

  function handleIndividualAmountChange(member, value) {
    setIndividualAmounts(prev => ({ ...prev, [member]: value }));
  }

  async function submitExpense() {
    if (!description.trim()) {
      setSnackbar({ category: 'error', message: 'Description is required' });
      return;
    }
    if (selectedMembers.length === 0) {
      setSnackbar({ category: 'error', message: 'Please select at least one member to share the expense' });
      return;
    }
    if (payers.length === 0) {
      setSnackbar({ category: 'error', message: 'Please add at least one paid-by entry' });
      return;
    }

    const totalAmount = payers.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    let spentFor;
    if (splitType === "equal") {
      spentFor = selectedMembers.map(name => ({
        name,
        amount: totalAmount / selectedMembers.length
      }));
    } else {
      const individualTotal = selectedMembers.reduce((sum, name) => {
        return sum + (parseFloat(individualAmounts[name]) || 0);
      }, 0);

      if (Math.abs(individualTotal - totalAmount) > 0.01) {
        setSnackbar({ 
          category: 'error', 
          message: `Individual amounts (₹${individualTotal.toFixed(2)}) must equal total paid (₹${totalAmount.toFixed(2)})` 
        });
        return;
      }

      spentFor = selectedMembers.map(name => ({
        name,
        amount: parseFloat(individualAmounts[name]) || 0
      }));
    }

    const expenseData = {
      roomId: roomId,
      description: description.trim(),
      category: "expense",
      total: totalAmount,
      spentBy: payers.map(p => ({ name: p.name, amount: parseFloat(p.amount) })),
      spentFor: spentFor
    };

    setIsSaving(true);
    try {
      const response = await axios.post('http://localhost:5000/api/expenses', expenseData, { withCredentials: true });
      if (response.status === 200 || response.status === 201) {
        setSnackbar({ category: 'success', message: 'Expense added successfully!' });
        setDescription("");
        setSelectedMembers([]);
        setSplitType("equal");
        setIndividualAmounts({});
        setPayers([]);
        setNewPayerName("");
        setNewPayerAmount("");
        fetchExpenses();
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      const errorMsg = error.response?.data?.message || 'Failed to add expense';
      setSnackbar({ category: 'error', message: errorMsg });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteExpense(expenseId) {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      const response = await axios.delete(`http://localhost:5000/api/expenses/${expenseId}`, { withCredentials: true });
      if (response.status === 200) {
        setSnackbar({ category: 'success', message: 'Expense deleted successfully!' });
        fetchExpenses();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      const errorMsg = error.response?.data?.message || 'Failed to delete expense';
      setSnackbar({ category: 'error', message: errorMsg });
    }
  }

  async function applyEdit(updatedExpense) {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/expenses/${editingExpense._id}`,
        updatedExpense,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setSnackbar({ category: 'success', message: 'Expense updated successfully!' });
        setEditingExpense(null);
        fetchExpenses();
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      const errorMsg = error.response?.data?.message || 'Failed to update expense';
      setSnackbar({ category: 'error', message: errorMsg });
    }
  }

  const totalPaid = payers.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  if (isLoading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <Spinner size="large" />
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading room data...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 8px 20px rgba(245, 87, 108, 0.3)'
      }}>
        <h2 style={{ 
          fontSize: '1.75rem', 
          marginBottom: '12px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '2rem' }}>💰</span>
          {roomTitle}
        </h2>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px',
          opacity: 0.95
        }}>
          <span style={{ fontWeight: '600' }}>Members:</span>
          {members.map((member, idx) => (
            <span key={idx} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}>
              {member}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '28px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '24px',
          color: '#1f2937',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.8rem' }}>➕</span>
          Add New Expense
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#374151',
              fontSize: '0.95rem'
            }}>
              Description *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Dinner at restaurant"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f5576c'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '600',
              color: '#374151',
              fontSize: '0.95rem'
            }}>
              Paid By *
            </label>
            <div style={{ marginBottom: '12px' }}>
              {payers.length === 0 && (
                <div style={{ 
                  fontStyle: 'italic', 
                  color: '#9ca3af',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  No payers added yet
                </div>
              )}
              {payers.map((payer, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  <span style={{ fontWeight: '500', color: '#166534' }}>
                    {payer.name}: <b>₹{parseFloat(payer.amount).toFixed(2)}</b>
                  </span>
                  <button
                    onClick={() => removePayer(idx)}
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#fee2e2'}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={newPayerName}
                onChange={(e) => setNewPayerName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select person</option>
                {members.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
              <input
                type="number"
                value={newPayerAmount}
                onChange={(e) => setNewPayerAmount(e.target.value)}
                placeholder="Amount"
                style={{
                  width: '150px',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <button
                onClick={addPayer}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                }}
              >
                Add
              </button>
            </div>
            {payers.length > 0 && (
              <div style={{ 
                marginTop: '12px', 
                fontWeight: '700',
                color: '#1f2937',
                fontSize: '1.05rem',
                padding: '10px',
                backgroundColor: '#f0fdf4',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                Total Paid: ₹{totalPaid.toFixed(2)}
              </div>
            )}
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '600',
              color: '#374151',
              fontSize: '0.95rem'
            }}>
              Who Shares? *
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
              gap: '10px' 
            }}>
              {members.map(member => (
                <label key={member} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: selectedMembers.includes(member) ? '#dbeafe' : '#f9fafb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: `2px solid ${selectedMembers.includes(member) ? '#3b82f6' : '#e5e7eb'}`,
                  transition: 'all 0.3s',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  if (!selectedMembers.includes(member)) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedMembers.includes(member)) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member)}
                    onChange={() => toggleMember(member)}
                    style={{ marginRight: '8px', cursor: 'pointer' }}
                  />
                  {member}
                </label>
              ))}
            </div>
          </div>

          {selectedMembers.length > 0 && (
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Split Type
              </label>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: splitType === 'equal' ? '#dbeafe' : '#f9fafb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: `2px solid ${splitType === 'equal' ? '#3b82f6' : '#e5e7eb'}`,
                  flex: 1,
                  transition: 'all 0.3s'
                }}>
                  <input
                    type="radio"
                    value="equal"
                    checked={splitType === "equal"}
                    onChange={(e) => setSplitType(e.target.value)}
                    style={{ marginRight: '8px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500' }}>Split Equally</span>
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: splitType === 'individual' ? '#dbeafe' : '#f9fafb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: `2px solid ${splitType === 'individual' ? '#3b82f6' : '#e5e7eb'}`,
                  flex: 1,
                  transition: 'all 0.3s'
                }}>
                  <input
                    type="radio"
                    value="individual"
                    checked={splitType === "individual"}
                    onChange={(e) => setSplitType(e.target.value)}
                    style={{ marginRight: '8px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500' }}>Individual Amounts</span>
                </label>
              </div>

              {splitType === "equal" ? (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #bbf7d0'
                }}>
                  <span style={{ fontWeight: '600', color: '#166534', fontSize: '1.05rem' }}>
                    Each person pays: ₹{(totalPaid / selectedMembers.length).toFixed(2)}
                  </span>
                </div>
              ) : (
                <div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#6b7280',
                    marginBottom: '12px',
                    padding: '10px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    ⚠️ Enter individual amounts (must total ₹{totalPaid.toFixed(2)})
                  </div>
                  {selectedMembers.map(member => (
                    <div key={member} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '10px',
                      gap: '12px'
                    }}>
                      <label style={{ 
                        flex: 1, 
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        {member}:
                      </label>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={individualAmounts[member] || ''}
                        onChange={(e) => handleIndividualAmountChange(member, e.target.value)}
                        style={{
                          width: '150px',
                          padding: '10px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  ))}
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: '700',
                    color: '#166534'
                  }}>
                    Total Individual: ₹{selectedMembers.reduce((sum, member) => sum + (parseFloat(individualAmounts[member]) || 0), 0).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={submitExpense}
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '14px 24px',
              backgroundColor: '#f5576c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '1.05rem',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              opacity: isSaving ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '8px'
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(245, 87, 108, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(245, 87, 108, 0.3)';
            }}
          >
            {isSaving && <Spinner size="small" color="#ffffff" />}
            <span>{isSaving ? 'Adding...' : '➕ Add Expense'}</span>
          </button>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '28px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <div
          onClick={() => setIsExpensesOpen(!isExpensesOpen)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
        >
          <h3 style={{
            fontSize: '1.5rem',
            color: '#1f2937',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: 0
          }}>
            <span style={{ fontSize: '1.8rem' }}>📋</span>
            Added Expenses ({apiExpenses.length})
          </h3>
          <span style={{
            fontSize: '1.5rem',
            transform: isExpensesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
            color: '#6b7280'
          }}>
            ▼
          </span>
        </div>

        {isExpensesOpen && (
          <div style={{ marginTop: '20px' }}>
            {apiExpenses.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#9ca3af',
                fontStyle: 'italic'
              }}>
                No expenses added yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {apiExpenses.map((expense) => (
                  <div
                    key={expense._id}
                    style={{
                      padding: '20px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <h4 style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '1.2rem',
                          color: '#1f2937',
                          fontWeight: '600'
                        }}>
                          {expense.description}
                        </h4>
                        <div style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: '700',
                          color: '#059669'
                        }}>
                          Total: ₹{parseFloat(expense.total).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setEditingExpense(expense)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'background-color 0.3s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'background-color 0.3s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '12px',
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: '#6b7280',
                          fontWeight: '600',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          💳 Paid By
                        </div>
                        {expense.spentBy.map((s, idx) => (
                          <div key={idx} style={{ 
                            fontSize: '0.95rem',
                            color: '#374151',
                            padding: '4px 0'
                          }}>
                            {s.name}: <b>₹{parseFloat(s.amount).toFixed(2)}</b>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: '#6b7280',
                          fontWeight: '600',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          👥 Split Among
                        </div>
                        {expense.spentFor.map((s, idx) => (
                          <div key={idx} style={{ 
                            fontSize: '0.95rem',
                            color: '#374151',
                            padding: '4px 0'
                          }}>
                            {s.name}: <b>₹{parseFloat(s.amount).toFixed(2)}</b>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '2px solid #f3f4f6' }}>
          <button
            onClick={() => navigate(`/room/${roomId}/step3`)}
            style={{
              width: '100%',
              padding: '14px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '1.05rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            <span>Next: Finalize & Preview</span>
            <span style={{ fontSize: '1.2rem' }}>→</span>
          </button>
        </div>
      </div>

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          members={members}
          onClose={() => setEditingExpense(null)}
          onApply={applyEdit}
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
