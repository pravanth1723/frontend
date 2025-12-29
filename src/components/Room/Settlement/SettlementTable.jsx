export default function SettlementTable({ settlements }) {
  if (!settlements || settlements.length === 0) {
    return (
      <div
        style={{
          padding: "16px",
          color: "#6b7280",
          background: "#f9fafb",
          borderRadius: "8px",
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        ✅ All settled
      </div>
    );
  }

  // Group settlements by sender (from)
  const grouped = settlements.reduce((acc, s) => {
    if (!acc[s.from]) acc[s.from] = [];
    acc[s.from].push(s);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {Object.entries(grouped).map(([from, payments]) => {
        const totalFromAmount = payments.reduce(
          (sum, p) => sum + p.amount,
          0
        );

        return (
          <div
            key={from}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              overflow: "hidden",
              background: "white",
            }}
          >
            {/* Sender Header */}
            <div
              style={{
                padding: "12px 16px",
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 700,
              }}
            >
              <span>💸 {from} pays</span>
              <span>₹{totalFromAmount.toFixed(2)}</span>
            </div>

            {/* Payments List */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f3f4f6",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "10px 16px" }}>To</th>
                  <th
                    style={{
                      padding: "10px 16px",
                      textAlign: "right",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <td
                      style={{
                        padding: "10px 16px",
                        fontWeight: 600,
                      }}
                    >
                      {p.to}
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        textAlign: "right",
                        fontWeight: 700,
                        color: "#059669",
                      }}
                    >
                      ₹{p.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
