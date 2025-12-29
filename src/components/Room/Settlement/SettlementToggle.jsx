import { SETTLEMENT_MODES } from "./settlementModes";

export default function SettlementToggle({ mode, setMode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label>
        <input
          type="radio"
          checked={mode === SETTLEMENT_MODES.NET}
          onChange={() => setMode(SETTLEMENT_MODES.NET)}
        />
        Net settlement (fewest payments) ⭐
      </label>

      <br />

      <label>
        <input
          type="radio"
          checked={mode === SETTLEMENT_MODES.PHONEPE}
          onChange={() => setMode(SETTLEMENT_MODES.PHONEPE)}
        />
        PhonePe-style settlement
      </label>

      <br />

      <label>
        <input
          type="radio"
          checked={mode === SETTLEMENT_MODES.ORGANIZER}
          onChange={() => setMode(SETTLEMENT_MODES.ORGANIZER)}
        />
        Organizer-based settlement
      </label>
    </div>
  );
}
