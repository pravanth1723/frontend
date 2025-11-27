import React, { useState } from "react";
import axios from "axios";

/**
 * CreateRoom Component
 * - Allows creating personal or group rooms
 */
export default function CreateRoom({ onRoomCreated }) {
  const [roomIdInput, setRoomIdInput] = useState("");
  const [passcode, setPasscode] = useState("");

  function createRoom(kind) {
    const roomCode = roomIdInput.trim() || `room-${Date.now()}`;
    axios.post('http://localhost:5000/api/rooms', { roomCode, passcode, kind }, { withCredentials: true })
      .then(response => {
        if (response.status === 200) {
          setRoomIdInput("");
          setPasscode("");
          if (onRoomCreated) {
            onRoomCreated();
          }
        }
      })
      .catch(error => {
        console.error('Error creating room:', error);
        alert('Error creating room. Please try again.');
      });
  }

  return (
    <div className="card">
      <h3 className="small">Create Room</h3>

      <div style={{ marginBottom: 8 }}>
        <label className="small">Room ID</label>
        <input 
          className="input" 
          value={roomIdInput} 
          onChange={(e) => setRoomIdInput(e.target.value)} 
          placeholder="e.g. trip-to-goa" 
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label className="small">Passcode</label>
        <input 
          className="input" 
          value={passcode} 
          onChange={(e) => setPasscode(e.target.value)} 
          placeholder="passcode" 
        />
      </div>

      <div className="controls">
        <button className="btn" onClick={() => createRoom('personal')}>
          Create Personal Room
        </button>
        <button className="btn ghost" onClick={() => createRoom('group')}>
          Create Group Room
        </button>
      </div>

      <div style={{ marginTop: 12 }} className="small">
        Personal rooms are private. Group rooms can be shared with others.
      </div>
    </div>
  );
}
