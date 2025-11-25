import React, { useEffect } from "react";

/**
 * SetupForm
 * - splitTitle
 * - users textarea (one per line)
 * - organizer radio selection (required)
 */
export default function SetupForm({ splitTitle, setSplitTitle, users, setUsers, organizer, setOrganizer }) {
  const [userText, setUserText] = React.useState(users.join("\n"));

  useEffect(() => {
    // when users change ensure organizer remains valid
    if (organizer && !users.includes(organizer)) {
      setOrganizer("");
    }
  }, [users, organizer, setOrganizer]);

  function onUsersChange(e) {
    const value = e.target.value;
    setUserText(value);
    const lines = value.split("\n").map(s => s.trim()).filter(Boolean);
    setUsers(lines);
  }

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <label className="small">Split Title</label>
        <input className="input" value={splitTitle} onChange={(e)=>setSplitTitle(e.target.value)} placeholder="e.g., Goa Trip 2025" />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label className="small">Enter persons (one per line)</label>
        <textarea className="input" placeholder="Alice&#10;Bob&#10;Charlie" value={userText} onChange={onUsersChange} />
      </div>

      <div>
        <label className="small">Select organizer</label>
        <div style={{ marginTop: 8 }} className="checkbox-list">
          {users.length === 0 && <div className="small">Add persons first to choose an organizer.</div>}
          {users.map((u, i) => (
            <label key={u + i} style={{ cursor: "pointer" }}>
              <input
                type="radio"
                name="organizer"
                checked={organizer === u}
                onChange={() => setOrganizer(u)}
                style={{ marginRight: 8 }}
              />{" "}
              {u}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
