import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import EditExpenseModal from "../EditExpenseModal";
import Snackbar from "../Snackbar";
import Spinner from "../Spinner";
import Calculator from "./Calculator";
import { BACKEND_URL } from "../../config";
import './Expenses.css';

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
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  

  const fetchRoomData = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/rooms/${roomId}`, { withCredentials: true });
      if (response.status === 200) {
        const data = response.data.data;
        setRoomTitle(data.title || data.name || "");
        setMembers(data.members || []); // Fixed: using 'members' from API
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching room data:", error);
      setSnackbar({ category: 'error', message: 'Failed to load room data' });
      setIsLoading(false);
    }
  }, [roomId]);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/expenses/by-room-id/${roomId}`, { withCredentials: true });
      if (response.status === 200) {
        setApiExpenses(response.data.data || []); // Fixed: accessing data.data
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoomData();
    fetchExpenses();
  }, [fetchRoomData, fetchExpenses]);

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
      const response = await axios.post(`${BACKEND_URL}/api/expenses`, expenseData, { withCredentials: true });
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
      const response = await axios.delete(`${BACKEND_URL}/api/expenses/${expenseId}`, { withCredentials: true });
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
        `${BACKEND_URL}/api/expenses/${editingExpense._id}`,
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
      <div className="expenses-loading">
        <Spinner size="large" />
        <p className="expenses-loading-text">Loading room data...</p>
      </div>
    );
  }

  return (
    <div className="expenses-container">
      <div className="expenses-header">
        <div className="expenses-header-top">
          <h2 className="expenses-title">
            <span className="expenses-title-icon">💰</span>
            {roomTitle}
          </h2>
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="calculator-button"
          >
            🧮 Calculator
          </button>
        </div>
        <div className="expenses-members">
          <span className="expenses-members-label">Members:</span>
          {members.map((member, idx) => (
            <span key={idx} className="member-badge">
              {member}
            </span>
          ))}
        </div>
      </div>

      <div className="add-expense-card">
        <h3 className="add-expense-title">
          <span className="add-expense-icon">➕</span>
          Add New Expense
        </h3>

        <div className="form-container">
          <div className="form-group">
            <label className="form-label">Description *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Dinner at restaurant"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Paid By *</label>
            <div className="payers-list">
              {payers.length === 0 && (
                <div className="no-payers">
                  No payers added yet
                </div>
              )}
              {payers.map((payer, idx) => (
                <div key={idx} className="payer-item">
                  <span className="payer-info">
                    {payer.name}: <b>₹{parseFloat(payer.amount).toFixed(2)}</b>
                  </span>
                  <button
                    onClick={() => removePayer(idx)}
                    className="remove-payer-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="add-payer-form">
              <select
                value={newPayerName}
                onChange={(e) => setNewPayerName(e.target.value)}
                className="payer-select"
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
                className="amount-input"
              />
              <button
                onClick={addPayer}
                className="add-payer-btn"
              >
                Add
              </button>
            </div>
            {payers.length > 0 && (
              <div className="total-paid">
                Total Paid: ₹{totalPaid.toFixed(2)}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label required">Who Shares? *</label>
            <div className="members-grid">
              {members.map(member => (
                <label
                  key={member}
                  className={`member-checkbox ${selectedMembers.includes(member) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member)}
                    onChange={() => toggleMember(member)}
                  />
                  {member}
                </label>
              ))}
            </div>
          </div>

          {selectedMembers.length > 0 && (
            <div className="form-group">
              <label className="form-label">Split Type</label>
              <div className="split-type-container">
                <label className={`split-type-option ${splitType === 'equal' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="equal"
                    checked={splitType === "equal"}
                    onChange={(e) => setSplitType(e.target.value)}
                  />
                  <span>Split Equally</span>
                </label>
                <label className={`split-type-option ${splitType === 'individual' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="individual"
                    checked={splitType === "individual"}
                    onChange={(e) => setSplitType(e.target.value)}
                  />
                  <span>Individual Amounts</span>
                </label>
              </div>

              {splitType === "equal" ? (
                <div className="equal-split-display">
                  <span className="equal-split-text">
                    Each person pays: ₹{(totalPaid / selectedMembers.length).toFixed(2)}
                  </span>
                </div>
              ) : (
                <div>
                  <div className="individual-amounts-warning">
                    ⚠️ Enter individual amounts (must total ₹{totalPaid.toFixed(2)})
                  </div>
                  {selectedMembers.map(member => (
                    <div key={member} className="individual-amount-row">
                      <label className="individual-amount-label">
                        {member}:
                      </label>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={individualAmounts[member] || ''}
                        onChange={(e) => handleIndividualAmountChange(member, e.target.value)}
                        className="individual-amount-input"
                      />
                    </div>
                  ))}
                  <div className="individual-total">
                    Total Individual: ₹{selectedMembers.reduce((sum, member) => sum + (parseFloat(individualAmounts[member]) || 0), 0).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={submitExpense}
            disabled={isSaving}
            className="submit-expense-btn"
          >
            {isSaving && <Spinner size="small" color="#ffffff" />}
            <span>{isSaving ? 'Adding...' : '➕ Add Expense'}</span>
          </button>
        </div>
      </div>

      <div className="expenses-list-card">
        <div
          onClick={() => setIsExpensesOpen(!isExpensesOpen)}
          className="expenses-list-header"
        >
          <h3 className="expenses-list-title">
            <span className="expenses-list-icon">📋</span>
            Added Expenses ({apiExpenses.length})
          </h3>
          <span className={`expenses-dropdown-icon ${isExpensesOpen ? 'open' : ''}`}>
            ▼
          </span>
        </div>

        {isExpensesOpen && (
          <div className="expenses-list-content">
            {apiExpenses.length === 0 ? (
              <div className="no-expenses">
                No expenses added yet
              </div>
            ) : (
              <div className="expenses-grid">
                {apiExpenses.map((expense) => (
                  <div key={expense._id} className="expense-item">
                    <div className="expense-header">
                      <div>
                        <h4 className="expense-title">
                          {expense.description}
                        </h4>
                        <div className="expense-total">
                          Total: ₹{parseFloat(expense.total).toFixed(2)}
                        </div>
                      </div>
                      <div className="expense-actions">
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="edit-expense-btn"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="delete-expense-btn"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    <div className="expense-details">
                      <div>
                        <div className="expense-section-title">
                          💳 Paid By
                        </div>
                        {expense.spentBy.map((s, idx) => (
                          <div key={idx} className="expense-detail-item">
                            {s.name}: <b>₹{parseFloat(s.amount).toFixed(2)}</b>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="expense-section-title">
                          👥 Split Among
                        </div>
                        {expense.spentFor.map((s, idx) => (
                          <div key={idx} className="expense-detail-item">
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

        <div className="next-step-container">
          <button
            onClick={() => navigate(`/room/${roomId}/step3`)}
            className="next-step-btn"
          >
            <span>Next: Finalize & Preview</span>
            <span className="next-step-arrow">→</span>
          </button>
        </div>
      </div>

      {/* Calculator Component */}
      <Calculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

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
