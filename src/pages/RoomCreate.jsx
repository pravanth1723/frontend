import React, { useState } from "react";

/**
 * RoomCreate page component (used optionally)
 * For this demo we provide a way to create a new ephemeral room id.
 */
export default function RoomCreate({ onEnterRoom }) {
  const [roomId, setRoomId] = useState("");
  const [pass, setPass] = useState("");

  function create() {
    if (!roomId.trim()) return alert("Enter room id");
    // For demo, simply call onEnterRoom with id
    const r = { id: roomId.trim(), passcode: pass.trim() };
    onEnterRoom && onEnterRoom(r);
  }

  return (
    <div className="card">
      <h3 className="small">Create a room</h3>
      <div style={{ marginBottom: 8 }}>
        <label className="small">Room Id</label>
        <input className="input" value={roomId} onChange={(e)=>setRoomId(e.target.value)} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label className="small">Passcode (optional)</label>
        <input className="input" value={pass} onChange={(e)=>setPass(e.target.value)} />
      </div>
      <div className="controls">
        <button className="btn" onClick={create}>Create</button>
      </div>
    </div>
  );
}