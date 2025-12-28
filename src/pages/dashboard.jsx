import React, { useEffect, useState } from "react";
import axios from "axios";
import Snackbar from "../components/Snackbar";
import PaymentMethods from "../components/PaymentMethods";
import { BACKEND_URL } from "../config";

import "./Dashboard.css";

const Dashboard = () => {
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  const fetchIncomes = () => {
    setLoading(true);
    axios
      .get(`${BACKEND_URL}/api/users/incomes`, { withCredentials: true })
      .then((response) => {
        const payload = response.data;
        const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        setIncomes(list);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err.message || "Unable to fetch incomes";
        setSnackbar({ category: "error", message: msg });
      })
      .finally(() => setLoading(false));
  }; 

  useEffect(() => {
    fetchIncomes();
  }, []);

  const submitIncome = (e) => {
    e.preventDefault();
    // basic validation
    if (!amount || isNaN(Number(amount))) {
      setSnackbar({ category: "error", message: "Please enter a valid amount" });
      return;
    }

    setLoading(true);
    const payload = { note, date, amount: Number(amount) };

    axios
      .post(`${BACKEND_URL}/api/users/income`, payload, { withCredentials: true })
      .then((response) => {
        const data = response.data || {};
        // success — clear form and refresh list
        setNote("");
        setDate("");
        setAmount("");
        fetchIncomes();
        setSnackbar({ category: data.category || "success", message: data.message || "Income added" });
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err.message || "Unable to add income";
        setSnackbar({ category: "error", message: msg });
      })
      .finally(() => setLoading(false));
  };

  const [editingIncome, setEditingIncome] = useState(null);

  // Close edit modal on Escape
  useEffect(() => {
    if (!editingIncome) return;
    const handler = (e) => {
      if (e.key === "Escape") setEditingIncome(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editingIncome]);

  const totalIncome = incomes.reduce((sum, it) => sum + Number(it.amount || 0), 0);

  const handleDeleteIncome = (income) => {
    const id = income._id;
    if (!id) return setSnackbar({ category: "error", message: "Unable to identify income to delete" });
    if (!window.confirm("Are you sure you want to delete this income?")) return;

    axios
      .delete(`${BACKEND_URL}/api/users/income/${id}`, { withCredentials: true })
      .then((res) => {
        setSnackbar({ category: "success", message: res.data?.message || "Income deleted" });
        fetchIncomes();
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err.message || "Failed to delete income";
        setSnackbar({ category: "error", message: msg });
      });
  };

  const applyEditIncome = (updated) => {
    const id = editingIncome?._id;
    if (!id) return setSnackbar({ category: "error", message: "Unable to identify income to update" });

    axios
      .put(`${BACKEND_URL}/api/users/income/${id}`, updated, { withCredentials: true })
      .then((res) => {
        setSnackbar({ category: "success", message: res.data?.message || "Income updated" });
        setEditingIncome(null);
        fetchIncomes();
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err.message || "Failed to update income";
        setSnackbar({ category: "error", message: msg });
      });
  };

  return (
    <div className="room-container">
      {/* Payment Methods Section */}
      <PaymentMethods />

      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Income Dashboard</h2>
          <p className="dashboard-sub">Add new income entries and review history.</p>
        </div>

        <div className="dashboard-summary">
          <div className="summary-card">
            <div className="summary-value">{totalIncome.toFixed(2)}</div>
            <div className="summary-label">Total</div>
          </div>

          <div className="summary-card">
            <div className="summary-value">{incomes.length}</div>
            <div className="summary-label">Entries</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-left">
          <form className="expense-form" onSubmit={submitIncome}>
            <div className="form-row">
              <label>Note</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Salary, Bonus, Gift"
                className="text-input"
              />
            </div>

            <div className="form-row">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-input"
              />
            </div>

            <div className="form-row">
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-input"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Saving..." : "Add Income"}
              </button>
            </div>
          </form>
        </div>

        <div className="dashboard-right">
          <section className="incomes-list">
            <h3>Recent Incomes</h3>

            {loading && !incomes.length ? (
              <div className="spinner">Loading incomes...</div>
            ) : incomes.length === 0 ? (
              <div className="no-incomes">No incomes recorded yet.</div>
            ) : (
              <ul className="incomes-scroll">
                {incomes.map((inc) => (
                  <li key={inc._id || `${inc.date}-${inc.amount}-${inc.note}`} className="expense-item">
                    <div className="expense-left">
                      <div className="expense-note">{inc.note || "—"}</div>
                      <div className="expense-date">{inc.date ? new Date(inc.date).toLocaleDateString() : "—"}</div>
                    </div>
                    <div className="expense-right">{Number(inc.amount).toFixed(2)}</div>
                    <div className="expense-actions">
                      <button type="button" className="edit-expense-btn" onClick={(e) => { e.preventDefault(); setEditingIncome({ ...inc }); }}>✏️</button>
                      <button type="button" className="delete-expense-btn" onClick={(e) => { e.preventDefault(); handleDeleteIncome(inc); }}>🗑️</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {editingIncome && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target.classList && e.target.classList.contains('modal-backdrop')) setEditingIncome(null); }}>
          <div className="modal">
            <h3>Edit Income</h3>
            <div className="form-row">
              <label>Note</label>
              <input className="text-input" value={editingIncome.note || ''} onChange={(e) => setEditingIncome({ ...editingIncome, note: e.target.value })} />
            </div>
            <div className="form-row">
              <label>Date</label>
              <input className="text-input" type="date" value={editingIncome.date ? (editingIncome.date.split ? editingIncome.date.split('T')[0] : editingIncome.date) : ''} onChange={(e) => setEditingIncome({ ...editingIncome, date: e.target.value })} />
            </div>
            <div className="form-row">
              <label>Amount</label>
              <input className="text-input" type="number" step="0.01" value={editingIncome.amount || ''} onChange={(e) => setEditingIncome({ ...editingIncome, amount: e.target.value })} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button type="button" className="btn ghost" onClick={() => setEditingIncome(null)}>Cancel</button>
              <button type="button" className="btn" onClick={() => applyEditIncome({ note: editingIncome.note, date: editingIncome.date, amount: Number(editingIncome.amount) })}>Apply</button>
            </div>
          </div>
        </div>
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
};

export default Dashboard;
