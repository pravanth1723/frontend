import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * RoomsList Component
 * - Displays personal and group rooms fetched from the API
 */
export default function RoomsList({ rooms }) {
  const navigate = useNavigate();

  function goToRoom(id) {
    navigate(`/room/${encodeURIComponent(id)}/step1`);
  }

  return (
    <div className="card">
      <h3 className="small">Your Rooms</h3>
      
      {!Array.isArray(rooms) || rooms.length === 0 ? (
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
            {rooms.filter(room => room.kind === 'personal').length === 0 ? (
              <div className="small" style={{ color: "#999", fontStyle: "italic" }}>No personal rooms</div>
            ) : (
              rooms.filter(room => room.kind === 'personal').map((room) => (
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
            {rooms.filter(room => room.kind === 'group').length === 0 ? (
              <div className="small" style={{ color: "#999", fontStyle: "italic" }}>No group rooms</div>
            ) : (
              rooms.filter(room => room.kind === 'group').map((room) => (
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
  );
}
