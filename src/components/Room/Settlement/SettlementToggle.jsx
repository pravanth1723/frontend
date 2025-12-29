import { SETTLEMENT_MODES } from "./settlementModes";

export default function SettlementToggle({ mode, setMode }) {
  const options = [
    {
      key: SETTLEMENT_MODES.NET,
      title: "Net Settlement",
      subtitle: "Fewest payments",
      badge: "Recommended",
      emoji: "⚡",
    },

    {
      key: SETTLEMENT_MODES.ORGANIZER,
      title: "Organizer Based",
      subtitle: "Simple & familiar",
      emoji: "👑",
    },
    {
      key: SETTLEMENT_MODES.P2P,
      title: "Peer to Peer",
      subtitle: "Expense-wise & transparent",
      emoji: "📱",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
      {options.map((opt) => {
        const active = mode === opt.key;

        return (
          <div
            key={opt.key}
            onClick={() => setMode(opt.key)}
            style={{
              cursor: "pointer",
              borderRadius: "12px",
              padding: "14px 16px",
              border: active
                ? "2px solid #3b82f6"
                : "2px solid #e5e7eb",
              background: active
                ? "linear-gradient(135deg, #eff6ff, #dbeafe)"
                : "#ffffff",
              boxShadow: active
                ? "0 8px 20px rgba(59, 130, 246, 0.25)"
                : "0 2px 6px rgba(0,0,0,0.08)",
              transition: "all 0.25s ease",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            {/* Left */}
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{opt.emoji}</span>
                {opt.title}
              </div>

              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  marginTop: "4px",
                }}
              >
                {opt.subtitle}
              </div>
            </div>

            {/* Right */}
            <div style={{ textAlign: "right" }}>
              {opt.badge && (
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#065f46",
                    backgroundColor: "#d1fae5",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    marginBottom: "6px",
                  }}
                >
                  {opt.badge}
                </div>
              )}

              <input
                type="radio"
                checked={active}
                readOnly
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "#3b82f6",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
