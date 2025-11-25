import React, { useState, useEffect } from "react";

/**
 * RoomCreate
 * - Allows creating a room (id + passcode)
 * - Joining existing room (validated against localStorage mock)
 * - Or continue without room (local split)
 *
 * onEnterRoom(room) => { id, passcode, data }
 */
export default function RoomCreate({ onEnterRoom }) {
  const [mode, setMode] = useState("choose"); // choose/create/join/local
  const [roomId, setRoomId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [message, setMessage] = useState("");
  const [knownRooms, setKnownRooms] = useState([]);

  useEffect(() => {
    // load rooms from localStorage
    const rooms = Object.keys(localStorage)
      .filter((k) => k.startsWith("room:"))
      .map((k) => {
        try {
          const r = JSON.parse(localStorage.getItem(k));
          return { id: r.id, hasData: !!r.data };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    setKnownRooms(rooms);
  }, [mode]);

  function createRoom() {
    if (!roomId.trim()) return setMessage("Room id required");
    const key = `room:${roomId}`;
    if (localStorage.getItem(key)) {
      setMessage("A room with that id already exists. Choose another id or join it.");
      return;
    }
    const payload = { id: roomId, passcode, data: null };
    localStorage.setItem(key, JSON.stringify(payload));
    setMessage("Room created. Entering room...");
    onEnterRoom({ id: roomId, passcode, data: null });
  }

  function joinRoom() {
    if (!roomId.trim()) return setMessage("Room id required");
    const key = `room:${roomId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return setMessage("No such room found.");
    try {
      const parsed = JSON.parse(raw);
      if (parsed.passcode !== passcode) return setMessage("Invalid passcode.");
      setMessage("Joined!");
      onEnterRoom(parsed);
    } catch (e) {
      setMessage("Room data corrupted.");
    }
  }

  function useLocal() {
    // create ephemeral room
    onEnterRoom({ id: `local-${Date.now()}`, passcode: "", data: null });
  }

  return (
    <div className="container-card">
      <h2 className="section-title">Start: Create / Join / Use local split</h2>
      <div className="row">
        <div className="col card">
          <p className="small">You can create a room (id + passcode) that others can join with the same credentials. Rooms are stored locally (mock backend). Or join an existing room. Or skip and use a local split.</p>

          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button className="btn" onClick={() => setMode("create")}>Create Room</button>
              <button className="btn ghost" onClick={() => setMode("join")}>Join Room</button>
              <button className="btn secondary" onClick={useLocal}>Use Local (no room)</button>
            </div>

            {mode === "create" && (
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 8 }}>
                  <label className="small">Room id</label>
                  <input className="input" value={roomId} onChange={(e)=>setRoomId(e.target.value)} placeholder="e.g. trip-to-goa"/>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label className="small">Passcode (optional)</label>
                  <input className="input" value={passcode} onChange={(e)=>setPasscode(e.target.value)} placeholder="passcode"/>
                </div>
                <div className="controls">
                  <button className="btn" onClick={createRoom}>Create & Enter</button>
                  <button className="btn ghost" onClick={()=>setMode("choose")}>Cancel</button>
                </div>
              </div>
            )}

            {mode === "join" && (
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 8 }}>
                  <label className="small">Room id</label>
                  <input className="input" value={roomId} onChange={(e)=>setRoomId(e.target.value)} placeholder="room id"/>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label className="small">Passcode</label>
                  <input className="input" value={passcode} onChange={(e)=>setPasscode(e.target.value)} placeholder="passcode"/>
                </div>
                <div className="controls">
                  <button className="btn" onClick={joinRoom}>Join</button>
                  <button className="btn ghost" onClick={()=>setMode("choose")}>Cancel</button>
                </div>
              </div>
            )}

            {message && <div style={{ marginTop: 10, color: "#6b6877" }}>{message}</div>}

            <hr style={{ margin: "16px 0" }} />

            <div>
              <h4 className="small">Known rooms (local)</h4>
              <div className="room-list">
                {knownRooms.length === 0 && <div className="small">No local rooms found.</div>}
                {knownRooms.map(r => (
                  <div key={r.id} className="room-item">
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.id}</div>
                      <div className="small">{r.hasData ? "Has stored data" : "Empty"}</div>
                    </div>
                    <div className="room-actions">
                      <button className="btn ghost" onClick={() => { setRoomId(r.id); setMode("join"); }}>Use / Join</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        <div className="col card">
          <h3 className="small">Quick notes</h3>
          <ul>
            <li className="small">Room id is unique (local). Passcode is validated on join.</li>
            <li className="small">Room data persists to your browser localStorage — for the demo only.</li>
            <li className="small">Backend will be integrated later; this UI is ready for API hooks.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}