import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Snackbar from "../Snackbar";
import Spinner from "../Spinner";

/**
 * JoinRoom Component
 * - Allows joining existing rooms with room code and passcode
 */
export default function JoinRoom() {
  const navigate = useNavigate();
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  function handleJoinRoom(e) {
    e.preventDefault();

    if (!joinRoomCode.trim()) {
      setSnackbar({ category: 'error', message: 'Please enter a room code' });
      return;
    }

    setIsLoading(true);
    axios.post(`http://localhost:5000/api/rooms/join/${encodeURIComponent(joinRoomCode)}`, 
      { joinRoomCode: joinRoomCode, passcode: passcode.trim() },
      { withCredentials: true }
    )
      .then(response => {
        setIsLoading(false);
        if (response.status === 200) {
          setSnackbar({ category: 'success', message: 'Joined room successfully!' });
          setTimeout(() => {
            navigate(`/room/${response.data.data._id}/step1`);
          }, 1000);
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error('Error joining room:', error);
        if (error.response?.status === 401) {
          setSnackbar({ category: 'error', message: 'Invalid room code or passcode' });
        } else if (error.response?.status === 404) {
          setSnackbar({ category: 'error', message: 'Room not found' });
        } else {
          setSnackbar({ category: 'error', message: 'Error joining room. Please try again.' });
        }
      });
  }

  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 8px 20px rgba(245, 87, 108, 0.3)',
      border: 'none'
    }}>
      <h3 style={{ 
        fontSize: '1.5rem', 
        marginBottom: '20px', 
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '1.8rem' }}>🔗</span>
        Join Existing Room
      </h3>

      <form onSubmit={handleJoinRoom}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            fontSize: '0.9rem',
            opacity: 0.9
          }}>
            Room Code
          </label>
          <input
            className="input"
            value={joinRoomCode}
            onChange={(e) => setJoinRoomCode(e.target.value)}
            placeholder="Enter room code"
            disabled={isLoading}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '1rem',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            fontSize: '0.9rem',
            opacity: 0.9
          }}>
            Passcode
          </label>
          <input
            className="input"
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
            disabled={isLoading}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '1rem',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            backgroundColor: 'white',
            color: '#f5576c',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            opacity: isLoading ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
        >
          {isLoading && <Spinner size="small" color="#f5576c" />}
          <span>🚀 {isLoading ? 'Joining...' : 'Join Room'}</span>
        </button>
      </form>

      <div style={{ 
        marginTop: 16, 
        fontSize: '0.85rem',
        opacity: 0.9,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '10px',
        borderRadius: '6px',
        textAlign: 'center'
      }}>
        🔐 Ask the room organizer for the room code and passcode
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
