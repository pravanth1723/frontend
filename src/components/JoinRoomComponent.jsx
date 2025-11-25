import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * JoinRoomComponent
 * - Component to join a room using room code and passcode
 */
export default function JoinRoomComponent() {
  const [joinRoomCode, setjoinRoomCode] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function handleJoinRoom(e) {
    e.preventDefault();
    
    if (!joinRoomCode.trim()) {
      alert("Please enter a room code");
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
          // Successfully verified, navigate to room
          navigate(`/room/${encodeURIComponent(joinRoomCode.trim())}/step1`);
        }
      })
      .catch(error => {
        setIsLoading(false);
        if (error.response?.status === 401) {
          alert('Invalid room code or passcode');
        } else if (error.response?.status === 404) {
          alert('Room not found');
        } else {
          alert('Error joining room. Please try again.');
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
    </div>
  );
}
