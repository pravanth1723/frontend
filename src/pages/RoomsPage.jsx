import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import JoinRoomComponent from "../components/JoinRoomComponent";

/**
 * RoomsPage
 * - Lists local rooms stored in localStorage under keys starting with "room:"
 * - Allows creating an ephemeral room or joining an existing local room
 * - Navigates to /room/:roomId/step1 when entering a room
 */
export default function RoomsPage() {
  const [roomIdInput, setRoomIdInput] = useState("");
  const [passcode, setPasscode] = useState("");
  const [apiRooms, setApiRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoomsFromAPI();
  }, []);

  function fetchRoomsFromAPI() {
    axios.get('http://localhost:5000/api/rooms', { withCredentials: true })
      .then(response => {
        if (response.status >= 200) {
          console.log('Rooms fetched from API:', response.data);
          setApiRooms(response.data);
        }
      })
      .catch(error => {
        console.error('Error fetching rooms:', error);
      });
  }

  function goToRoom(id) {
    // navigate to API room
    navigate(`/room/${encodeURIComponent(id)}/step1`);
  }

  function createRoom(kind) {
    const roomCode = roomIdInput.trim() || `room-${Date.now()}`;
      axios.post('http://localhost:5000/api/rooms', {roomCode,passcode,kind},{ withCredentials: true })
      .then(response => {
        if (response.status >= 200) {
         fetchRoomsFromAPI();
        }
      })
      .catch(error => {
        console.error('Error fetching rooms:', error);
      });
  }

  return (
    <div className="container-card">
      <h2 className="section-title">Rooms</h2>

      <div className="row">
        <div className="col card">
          <h3 className="small">Create / Join Local Room</h3>

          <div style={{ marginBottom: 8 }}>
            <label className="small" >Room id</label>
            <input className="input" value={roomIdInput} onChange={(e) => setRoomIdInput(e.target.value)} placeholder="e.g. trip-to-goa" />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="small">Passcode</label>
            <input className="input" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="passcode" />
          </div>

          <div className="controls">
            <button className="btn" onClick={() => createRoom('personal')}>Create Personal Room</button>
            <button className="btn ghost" onClick={() => createRoom('group')}>Create Group Room</button>
          </div>

          <div style={{ marginTop: 12 }} className="small">
            Local rooms are stored in your browser localStorage (demo). To clear a local room use the remove button.
          </div>

          {/* Join Room Component */}
          <div style={{ marginTop: 20 }}>
            <JoinRoomComponent />
          </div>
        </div>

        <div className="col card">
          <h3 className="small">Your Rooms</h3>
          
          {apiRooms.length === 0 ? (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              color: '#999',
              background: '#f9f9f9',
              borderRadius: '4px',
              marginTop: '12px'
            }}>
              <div className="small">No rooms available</div>
              <div className="small" style={{ marginTop: '8px' }}>Create a new room or join using a room code</div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <h4 className="small" style={{ marginBottom: 8, color: "var(--primary)" }}>Personal</h4>
                {apiRooms.filter(room => room.kind === 'personal').length === 0 ? (
                  <div className="small" style={{ color: "#999", fontStyle: "italic" }}>No personal rooms</div>
                ) : (
                  apiRooms.filter(room => room.kind === 'personal').map((room) => (
                    <div 
                      key={room._id} 
                      className="room-item" 
                      style={{ 
                        marginBottom: 8, 
                        padding: '10px', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => goToRoom(room._id)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ fontWeight: 600 }}>{room.name}</div>
                    </div>
                  ))
                )}
              </div>

              <div>
                <h4 className="small" style={{ marginBottom: 8, color: "var(--primary)" }}>Group</h4>
                {apiRooms.filter(room => room.kind === 'group').length === 0 ? (
                  <div className="small" style={{ color: "#999", fontStyle: "italic" }}>No group rooms</div>
                ) : (
                  apiRooms.filter(room => room.kind === 'group').map((room) => (
                    <div 
                      key={room._id} 
                      className="room-item" 
                      style={{ 
                        marginBottom: 8, 
                        padding: '10px', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => goToRoom(room._id)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ fontWeight: 600 }}>{room.name}</div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
