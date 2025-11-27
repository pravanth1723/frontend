import React, { useState } from "react";
import axios from "axios";
import Snackbar from "../Snackbar";
import Spinner from "../Spinner";

/**
 * CreateRoom Component
 * - Allows creating personal or group rooms
 */
export default function CreateRoom({ onRoomCreated }) {
  const [roomIdInput, setRoomIdInput] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  function createRoom(kind) {
    const roomCode = roomIdInput.trim() || `room-${Date.now()}`;
    setIsLoading(true);
    axios.post('http://localhost:5000/api/rooms', { roomCode, passcode, kind }, { withCredentials: true })
      .then(response => {
        setIsLoading(false);
        if (response.status === 200) {
          setRoomIdInput("");
          setPasscode("");
          setSnackbar({ category: 'success', message: `${kind === 'personal' ? 'Personal' : 'Group'} room created successfully!` });
          if (onRoomCreated) {
            onRoomCreated();
          }
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error('Error creating room:', error);
        const errorMsg = error.response?.data?.message || 'Error creating room. Please try again.';
        setSnackbar({ category: 'error', message: errorMsg });
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
          disabled={isLoading}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label className="small">Passcode</label>
        <input 
          className="input" 
          value={passcode} 
          onChange={(e) => setPasscode(e.target.value)} 
          placeholder="passcode"
          disabled={isLoading}
        />
      </div>

      <div className="controls">
        <button 
          className="btn" 
          onClick={() => createRoom('personal')}
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {isLoading && <Spinner size="small" color="#ffffff" />}
          Create Personal Room
        </button>
        <button 
          className="btn ghost" 
          onClick={() => createRoom('group')}
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {isLoading && <Spinner size="small" color="var(--primary)" />}
          Create Group Room
        </button>
      </div>

      <div style={{ marginTop: 12 }} className="small">
        Personal rooms are private. Group rooms can be shared with others.
      </div>

      {snackbar && (
        <Snackbar
          category={snackbar.category}
          message={snackbar.message}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
}
