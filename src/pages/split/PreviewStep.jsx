import React from "react";
import { useSplit } from "../../context/SplitContext";

/**
 * Step 3 - Preview
 * Mirrors the preview area in the HTML: expenses table, per-person summary, final balances
 */
export default function PreviewStep() {
  const { splitTitle, users, organizer, expenses, calculations } = useSplit();
  const { userPaidMap, userShare, userOwes } = calculations;

  function downloadJSON() {
    const payload = { splitTitle, users, organizer, expenses };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(splitTitle||"split").replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="card">
        <h3 className="small">Finish & Preview</h3>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <div>
            <div className="small">Title</div>
            <div style={{ fontWeight: 700 }}>{splitTitle || "(untitled)"}</div>
            <div className="small">Organizer: <b>{organizer || "(none)"}</b></div>
          </div>
          <div>
            <button className="btn" onClick={() => window.print()}>Print</button>
            <button className="btn ghost" style={{ marginLeft: 8 }} onClick={downloadJSON}>Download JSON</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h4 className="small">Expenses List</h4>
        <div style={{ overflowX: "auto" }}>
          <table className="expense-table">
            <thead><tr><th>#</th><th>Title</th><th>Share Between</th><th>Paid By</th></tr></thead>
            <tbody>
              {expenses.map((ex, i) => (
                <tr key={ex.id}>
                  <td>{i+1}</td>
                  <td>{ex.title}</td>
                  <td>{ex.users.join(", ")}</td>
                  <td>{(ex.spentBy || []).map(s => `${s.user}: ₹${parseFloat(s.amount).toFixed(2)}`).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h4 className="small">Per-person Summary</h4>
        {users.map(u => {
          const lines = [];
          let totalShare = 0;
          expenses.forEach(exp => {
            if (exp.users.includes(u)) {
              const total = (exp.spentBy || []).reduce((s,b)=>s+Number(b.amount||0),0);
              const per = total / Math.max(1, exp.users.length);
              lines.push(`${exp.title}: ₹${per.toFixed(2)}`);
              totalShare += per;
            }
          });
          const paid = userPaidMap[u] || 0;
          const owes = (userShare[u] || 0) - paid;
          return (
            <div key={u} className="person-card">
              <div className="person-title">{u} {u === organizer ? <em style={{ fontSize: 12 }}>(Organizer)</em> : null}</div>
              <ul style={{ marginTop: 8 }}>
                {lines.length === 0 ? <li className="small">No shared expenses.</li> : lines.map((l,idx)=><li key={idx}>{l}</li>)}
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

      <div className="card" style={{ marginTop: 12 }}>
        <h4 className="small">Final Balances (payments go to organizer)</h4>
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
        <p className="small" style={{ marginTop: 8 }}><em>Negative: person paid more than their share; positive means the person must pay organizer.</em></p>
      </div>
    </div>
  );
}