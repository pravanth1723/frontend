import React, { useEffect, useState } from "react";
import axios from "axios";
import Snackbar from "./Snackbar";
import { BACKEND_URL } from "../config";
import "./Income.css";

export default function Income() {
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);
  const [editingIncome, setEditingIncome] = useState(null);

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
    <div className="income-container">
      <div className="income-header">
        <h3 className="income-title">
          <span className="income-icon">💰</span>
          Your Income
        </h3>
      </div>

      <div className="income-summary">
        <div className="summary-card">
          <div className="summary-value">{totalIncome.toFixed(2)}</div>
          <div className="summary-label">Total Income</div>
        </div>

        <div className="summary-card">
          <div className="summary-value">{incomes.length}</div>
          <div className="summary-label">Entries</div>
        </div>
      </div>

      <div className="income-grid">
        <div className="income-left">
          <div className="add-income-card">
            <h4 className="add-income-title">
              <span className="add-income-icon">➕</span>
              Add New Income
            </h4>

            <form className="income-form" onSubmit={submitIncome}>
              <div className="form-group">
                <label className="form-label">Note</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Salary, Bonus, Gift"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="form-input"
                />
              </div>

              <button type="submit" className="submit-income-btn" disabled={loading}>
                {loading ? "Saving..." : "➕ Add Income"}
              </button>
            </form>
          </div>
        </div>

        <div className="income-right">
          <div className="incomes-list-card">
            <h4 className="incomes-list-title">
              <span className="incomes-list-icon">📋</span>
              Recent Incomes ({incomes.length})
            </h4>

            <div className="incomes-list-content">
              {loading && !incomes.length ? (
                <div className="loading-incomes">Loading incomes...</div>
              ) : incomes.length === 0 ? (
                <div className="no-incomes">No incomes recorded yet.</div>
              ) : (
                <div className="incomes-scroll">
                  {incomes.map((inc) => (
                    <div key={inc._id || `${inc.date}-${inc.amount}-${inc.note}`} className="income-item">
                      <div className="income-info">
                        <div className="income-note">{inc.note || "—"}</div>
                        <div className="income-date">
                          {inc.date ? new Date(inc.date).toLocaleDateString() : "—"}
                        </div>
                      </div>
                      <div className="income-amount">{Number(inc.amount).toFixed(2)}</div>
                      <div className="income-actions">
                        <button
                          type="button"
                          className="edit-income-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditingIncome({ ...inc });
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="delete-income-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteIncome(inc);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {editingIncome && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target.classList && e.target.classList.contains("modal-backdrop"))
              setEditingIncome(null);
          }}
        >
          <div className="modal">
            <h3 className="modal-title">Edit Income</h3>
            <div className="form-group">
              <label className="form-label">Note</label>
              <input
                className="form-input"
                value={editingIncome.note || ""}
                onChange={(e) => setEditingIncome({ ...editingIncome, note: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                className="form-input"
                type="date"
                value={
                  editingIncome.date
                    ? editingIncome.date.split
                      ? editingIncome.date.split("T")[0]
                      : editingIncome.date
                    : ""
                }
                onChange={(e) => setEditingIncome({ ...editingIncome, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                value={editingIncome.amount || ""}
                onChange={(e) => setEditingIncome({ ...editingIncome, amount: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setEditingIncome(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-apply"
                onClick={() =>
                  applyEditIncome({
                    note: editingIncome.note,
                    date: editingIncome.date,
                    amount: Number(editingIncome.amount),
                  })
                }
              >
                Apply
              </button>
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
}
