import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSplit } from "../../context/SplitContext";

/**
 * Step 1 - Setup Group
 * Mirrors the HTML: title, persons textarea (one per line), organizer radio
 */
export default function SetupStep() {
  const { splitTitle, setSplitTitle, users, setUsers, organizer, setOrganizer } = useSplit();
  const navigate = useNavigate();
  const [userText, setUserText] = React.useState(users.join("\n"));

  useEffect(() => {
    // ensure organizer is valid
    if (organizer && !users.includes(organizer)) setOrganizer("");
  }, [users, organizer, setOrganizer]);

  function onUsersChange(e) {
    const value = e.target.value;
    setUserText(value);
    const lines = value.split("\n").map(s => s.trim()).filter(Boolean);
    setUsers(lines);
  }

  function next() {
    if (!splitTitle.trim()) return alert("Please provide a split title");
    if (!users || users.length < 2) return alert("Please add at least two persons");
    if (!organizer) return alert("Select an organizer");
    navigate("../step2");
  }

  return (
    <div className="card">
      <h3 className="small">Step 1: Setup Group</h3>
      <div style={{ marginBottom: 8 }}>
        <label className="small">Split Title</label>
        <input className="input" value={splitTitle} onChange={(e)=>setSplitTitle(e.target.value)} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label className="small">Enter persons (one per line)</label>
        <textarea className="input" value={userText} onChange={onUsersChange} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label className="small">Select organizer</label>
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {users.length === 0 && <div className="small">Add persons above.</div>}
          {users.map(u => (
            <label key={u} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input type="radio" name="organizer" checked={organizer === u} onChange={() => setOrganizer(u)} />
              {u}
            </label>
          ))}
        </div>
      </div>

      <div className="controls">
        <button className="btn" onClick={next}>Next: Add Expenses</button>
      </div>
    </div>
  );
}
