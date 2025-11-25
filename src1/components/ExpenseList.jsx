import React from "react";

/**
 * ExpenseList
 * - shows the list of expenses and provides Edit and Delete actions
 */
export default function ExpenseList({ expenses, onEdit, onRemove }) {
  if (!expenses || expenses.length === 0) {
    return <div className="small">No expenses added yet.</div>;
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="expense-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>For</th>
            <th>Paid By</th>
            <th style={{ width: 160 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((ex, idx) => (
            <tr key={ex.id || idx} className={idx % 2 === 0 ? "alt" : ""}>
              <td>{idx + 1}</td>
              <td>{ex.title}</td>
              <td>{(ex.users || []).join(", ")}</td>
              <td>{(ex.spentBy || []).map(s => `${s.user}: ₹${parseFloat(s.amount).toFixed(2)}`).join(", ")}</td>
              <td>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn ghost" onClick={() => onEdit && onEdit(ex)}>Edit</button>
                  <button className="btn ghost" onClick={() => {
                    if (window.confirm("Delete this expense?")) onRemove && onRemove(ex.id);
                  }}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}