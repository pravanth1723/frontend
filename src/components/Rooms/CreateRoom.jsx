import React, { useState } from "react";
import axios from "axios";
import Snackbar from "../Snackbar";
import Spinner from "../Spinner";
import { BACKEND_URL } from "../../config";

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
    axios.post(`${BACKEND_URL}/api/rooms`, { roomCode, passcode, kind }, { withCredentials: true })
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
    <div className="card" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
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
        <span style={{ fontSize: '1.8rem' }}>🏠</span>
        Create New Room
      </h3>

      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '500',
          fontSize: '0.9rem',
          opacity: 0.9
        }}>
          Room ID
        </label>
        <input 
          className="input" 
          value={roomIdInput} 
          onChange={(e) => setRoomIdInput(e.target.value)} 
          placeholder="e.g. trip-to-goa"
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
          placeholder="Secure your room"
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

      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        flexDirection: 'column'
      }}>
        <button 
          onClick={() => createRoom('personal')}
          disabled={isLoading}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            backgroundColor: 'white',
            color: '#667eea',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            opacity: isLoading ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
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
          {isLoading && <Spinner size="small" color="#667eea" />}
          <span>👤 Create Personal Room</span>
        </button>
        <button 
          onClick={() => createRoom('group')}
          disabled={isLoading}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '2px solid white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            opacity: isLoading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          {isLoading && <Spinner size="small" color="#ffffff" />}
          <span>👥 Create Group Room</span>
        </button>
      </div>

      <div style={{ 
        marginTop: 16, 
        fontSize: '0.85rem',
        opacity: 0.9,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '10px',
        borderRadius: '6px',
        textAlign: 'center'
      }}>
        💡 Personal rooms are private. Group rooms can be shared with others.
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
