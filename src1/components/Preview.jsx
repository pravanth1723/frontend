import React from "react";

/**
 * Preview
 * - Shows full breakdown similarly to the provided html file:
 *   - Expenses list
 *   - Per-person summary (Total Split / Paid / Difference)
 *   - Final balances (all payments go to organizer)
 */
export default function Preview({ splitTitle, users, organizer, expenses, onSave }) {
  // Calculate per-person totals paid
  const userPaidMap = {};
  users.forEach(u => userPaidMap[u] = 0);
  expenses.forEach(exp => {
    (exp.spentBy || []).forEach(sb => {
      userPaidMap[sb.user] = (userPaidMap[sb.user] || 0) + parseFloat(sb.amount || 0);
    });
  });

  // Calculate shares
  const userShare = {};
  users.forEach(u => userShare[u] = 0);
  expenses.forEach(exp => {
    const total = (exp.spentBy || []).reduce((s, b) => s + Number(b.amount || 0), 0);
    const n = exp.users.length || 1;
    const per = total / n;
    exp.users.forEach(u => { userShare[u] = (userShare[u] || 0) + per; });
  });

  // owes = share - paid
  const userOwes = {};
  users.forEach(u => userOwes[u] = (userShare[u] || 0) - (userPaidMap[u] || 0));

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <div>
            <div className="small">Title</div>
            <div style={{ fontWeight: 700 }}>{splitTitle || "(untitled split)"}</div>
            <div className="small">Organizer: <b>{organizer || "(none selected)"}</b></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ marginBottom: 8 }}>
              <button className="btn" onClick={() => {
                // create a printable view
                window.print();
              }}>Print</button>
              <button className="btn ghost" style={{ marginLeft: 8 }} onClick={() => onSave && onSave()}>Save</button>
            </div>
            <div className="small">Preview below. Edit any expense to change totals.</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <h4 className="small">Expenses</h4>
        <div style={{ overflowX: "auto" }}>
          <table className="expense-table">
            <thead>
              <tr><th>#</th><th>Title</th><th>Share Between</th><th>Paid By</th></tr>
            </thead>
            <tbody>
              {expenses.map((ex, i) => (
                <tr key={ex.id || i}>
                  <td>{i+1}</td>
                  <td>{ex.title}</td>
                  <td>{ex.users.join(", ")}</td>
                  <td>{(ex.spentBy || []).map(sb => `${sb.user}: ₹${parseFloat(sb.amount).toFixed(2)}`).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h4 className="small">Per-person summary</h4>
        {users.length === 0 && <div className="small">Add persons in setup to see per-person summary.</div>}
        {users.map(u => {
          const lines = [];
          let totalShare = 0;
          expenses.forEach(exp => {
            if (exp.users.includes(u)) {
              const total = (exp.spentBy || []).reduce((s, b) => s + Number(b.amount || 0), 0);
              const per = total / (exp.users.length || 1);
              lines.push(`${exp.title}: ₹${per.toFixed(2)}`);
              totalShare += per;
            }
          });
          const paid = userPaidMap[u] || 0;
          const owes = totalShare - paid;
          return (
            <div key={u} className="person-card">
              <div className="person-title">{u} {u === organizer ? <em style={{ fontSize: 12 }}>(Organizer)</em> : null}</div>
              <ul style={{ marginTop: 8 }}>
                {lines.length === 0 ? <li className="small">No shared expenses.</li> : lines.map((l, idx) => <li key={idx}>{l}</li>)}
              </ul>
              <div style={{ marginTop: 8 }}>
                <div className="small">Total Split: <b>₹{totalShare.toFixed(2)}</b></div>
                <div className="small">Paid: <b>₹{paid.toFixed(2)}</b></div>
                <div className="small">Difference: <b style={{ color: owes > 0 ? "crimson" : owes < 0 ? "var(--success)" : "var(--primary)" }}>
                  {owes === 0 ? "Settled" : owes > 0 ? `You owe organizer: ₹${owes.toFixed(2)}` : `You paid extra: ₹${Math.abs(owes).toFixed(2)}`}
                </b></div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12 }}>
        <h4 className="small">Final balances (payments go to organizer)</h4>
        <div style={{ overflowX: "auto" }}>
          <table className="summary-table">
            <thead><tr><th>Person</th><th>Amount to Organizer ({organizer})</th><th>Paid</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u}>
                  <td style={u === organizer ? { background: "#faf3ff", fontWeight: 700 } : {}}>{u}{u === organizer ? <div className="small">Organizer</div> : null}</td>
                  <td>
                    {u === organizer ? <b>Collects</b> : (userOwes[u] > 0 ? `₹${userOwes[u].toFixed(2)}` : userOwes[u] < 0 ? `-₹${Math.abs(userOwes[u]).toFixed(2)}` : "Settled")}
                  </td>
                  <td>₹{(userPaidMap[u] || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}