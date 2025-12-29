export default function SettlementTable({ settlements }) {
  if (!settlements.length) {
    return <div style={{ color: "#6b7280" }}>✅ All settled</div>;
  }

  return (
    <table className="settlement-table">
      <thead>
        <tr className="settlement-header">
          <th>From</th>
          <th>To</th>
          <th style={{ textAlign: "right" }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {settlements.map((s, i) => (
          <tr key={i}>
            <td>{s.from}</td>
            <td>{s.to}</td>
            <td style={{ textAlign: "right", fontWeight: 700 }}>
              ₹{s.amount.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
