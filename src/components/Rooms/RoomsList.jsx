import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * RoomsList Component
 * - Displays personal and group rooms fetched from the API
 */
export default function RoomsList({ rooms }) {
  const navigate = useNavigate();

  function goToRoom(id) {
    navigate(`/room/${id}/step1`);
  }

  const personalRooms = rooms.filter(r => r.kind === 'personal');
  const groupRooms = rooms.filter(r => r.kind === 'group');

  if (!Array.isArray(rooms) || rooms.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#f8f9ff',
        borderRadius: '12px',
        border: '2px dashed #d1d5db'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📭</div>
        <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>No rooms available</h3>
        <p style={{ color: '#9ca3af' }}>Create a new room or join an existing one to get started!</p>
      </div>
    );
  }

  const renderRoomCard = (room) => (
    <div
      key={room._id}
      onClick={() => goToRoom(room._id)}
      style={{
        padding: '16px 20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.15)';
        e.currentTarget.style.borderColor = '#667eea';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      <div style={{ 
        fontSize: '1.5rem',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: room.kind === 'personal' ? '#ede9fe' : '#dbeafe',
        borderRadius: '8px'
      }}>
        {room.kind === 'personal' ? '👤' : '👥'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontWeight: '600', 
          fontSize: '1.05rem',
          color: '#1f2937',
          marginBottom: '2px'
        }}>
          {room.name}
        </div>
        <div style={{ 
          fontSize: '0.85rem', 
          color: '#6b7280'
        }}>
        </div>
      </div>
      <div style={{ color: '#9ca3af', fontSize: '1.2rem' }}>→</div>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
    }}>
      <h2 style={{ 
        fontSize: '1.75rem', 
        marginBottom: '24px', 
        color: '#1f2937',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '2rem' }}>🏠</span>
        Your Rooms
      </h2>

      {personalRooms.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            marginBottom: '16px', 
            color: '#6b7280',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.9rem'
          }}>
            👤 Personal Rooms
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {personalRooms.map(renderRoomCard)}
          </div>
        </div>
      )}

      {personalRooms.length === 0 && (
        <div style={{ 
          fontStyle: 'italic', 
          color: '#9ca3af', 
          marginBottom: '32px',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          No personal rooms yet
        </div>
      )}

      {groupRooms.length > 0 && (
        <div>
          <h3 style={{ 
            fontSize: '1.1rem', 
            marginBottom: '16px', 
            color: '#6b7280',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.9rem'
          }}>
            👥 Group Rooms
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {groupRooms.map(renderRoomCard)}
          </div>
        </div>
      )}

      {groupRooms.length === 0 && (
        <div style={{ 
          fontStyle: 'italic', 
          color: '#9ca3af',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          No group rooms yet
        </div>
      )}
    </div>
  );
}
