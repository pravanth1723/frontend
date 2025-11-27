import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Snackbar from "../Snackbar";

export default function JoinRoom() {
  const [joinRoomCode, setjoinRoomCode] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);
  const navigate = useNavigate();

  function handleJoinRoom(e) {
    e.preventDefault();
    
    if (!joinRoomCode.trim()) {
      setSnackbar({ category: 'error', message: 'Please enter a room code' });
      return;
    }

    setIsLoading(true);

    // Verify room with passcode via API
    axios.post(`http://localhost:5000/api/rooms/join/${encodeURIComponent(joinRoomCode)}`, 
      { joinRoomCode: joinRoomCode, passcode: passcode.trim() },
      { withCredentials: true }
    )
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          setSnackbar({ category: 'success', message: 'Successfully joined room!' });
          // Successfully verified, navigate to room
          setTimeout(() => {
            navigate(`/room/${encodeURIComponent(joinRoomCode.trim())}/step1`);
          }, 1000);
        }
      })
      .catch(error => {
        setIsLoading(false);
        if (error.response?.status === 401) {
          setSnackbar({ category: 'error', message: 'Invalid room code or passcode' });
        } else if (error.response?.status === 404) {
          setSnackbar({ category: 'error', message: 'Room not found' });
        } else {
          setSnackbar({ category: 'error', message: 'Error joining room. Please try again.' });
        }
        console.error('Error joining room:', error);
      });
  }

  return (
    <div className="card">
      <h3 className="small">Join Room with Code</h3>
      <form onSubmit={handleJoinRoom}>
        <div style={{ marginBottom: 8 }}>
          <label className="small">Room Code</label>
          <input 
            className="input" 
            value={joinRoomCode} 
            onChange={(e) => setjoinRoomCode(e.target.value)} 
            placeholder="Enter room code"
            disabled={isLoading}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label className="small">Passcode</label>
          <input 
            className="input" 
            type="password"
            value={passcode} 
            onChange={(e) => setPasscode(e.target.value)} 
            placeholder="Enter passcode"
            disabled={isLoading}
          />
        </div>

        <div className="controls">
          <button className="btn" type="submit" disabled={isLoading}>
            {isLoading ? "Joining..." : "Join Room"}
          </button>
        </div>
      </form>

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
