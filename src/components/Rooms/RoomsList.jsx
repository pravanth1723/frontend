import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Snackbar from "../Snackbar";
import Spinner from "../Spinner";
import { BACKEND_URL } from "../../config";

/**
 * RoomsList Component
 * - Displays personal and group rooms fetched from the API
 * - Shows update passcode and delete buttons for admin users
 * - Shows leave button for non-admin users
 */
export default function RoomsList({ rooms, onRoomsChange }) {
  const navigate = useNavigate();
  const [showPasscodeModal, setShowPasscodeModal] = useState(null);
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  function goToRoom(id) {
    navigate(`/room/${id}/step1`);
  }

  function openPasscodeModal(room, e) {
    e.stopPropagation();
    setShowPasscodeModal(room);
    setNewPasscode("");
    setConfirmPasscode("");
  }

  function closePasscodeModal() {
    setShowPasscodeModal(null);
    setNewPasscode("");
    setConfirmPasscode("");
  }

  async function updatePasscode() {
    if (!newPasscode || !confirmPasscode) {
      setSnackbar({ category: 'error', message: 'Please enter passcode in both fields' });
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setSnackbar({ category: 'error', message: 'Passcodes do not match' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/rooms/change-passcode/${showPasscodeModal._id}`,
        { passcode: newPasscode },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setSnackbar({ category: 'success', message: 'Passcode updated successfully!' });
        closePasscodeModal();
        if (onRoomsChange) onRoomsChange();
      }
    } catch (error) {
      console.error('Error updating passcode:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update passcode';
      setSnackbar({ category: 'error', message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteRoom(room, e) {
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete the room "${room.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.delete(
        `${BACKEND_URL}/api/rooms/${room._id}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        setSnackbar({ category: 'success', message: 'Room deleted successfully!' });
        if (onRoomsChange) onRoomsChange();
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete room';
      setSnackbar({ category: 'error', message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  }

  async function leaveRoom(room, e) {
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to leave the room "${room.name}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/rooms/exit/${room._id}`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        setSnackbar({ category: 'success', message: 'Left room successfully!' });
        if (onRoomsChange) onRoomsChange();
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      const errorMsg = error.response?.data?.message || 'Failed to leave room';
      setSnackbar({ category: 'error', message: errorMsg });
    } finally {
      setIsLoading(false);
    }
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
        gap: '12px',
        position: 'relative'
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
          {room.kind === 'personal' ? 'Personal Room' : 'Group Room'}
        </div>
      </div>

      {/* Action buttons based on admin status */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {room.admin === 'yes' ? (
          <>
            <button
              onClick={(e) => openPasscodeModal(room, e)}
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#5568d3';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#667eea';
                e.target.style.transform = 'scale(1)';
              }}
              title="Update Passcode"
            >
              🔑
            </button>
            <button
              onClick={(e) => deleteRoom(room, e)}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ef4444';
                e.target.style.transform = 'scale(1)';
              }}
              title="Delete Room"
            >
              🗑️
            </button>
          </>
        ) : (
          <button
            onClick={(e) => leaveRoom(room, e)}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#d97706';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f59e0b';
              e.target.style.transform = 'scale(1)';
            }}
            title="Leave Room"
          >
            ↪️
          </button>
        )}
        <div style={{ color: '#9ca3af', fontSize: '1.2rem' }}>→</div>
      </div>
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

      {/* Passcode Update Modal */}
      {showPasscodeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={closePasscodeModal}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '1.8rem' }}>🔑</span>
              Update Passcode
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '0.9rem',
              marginBottom: '24px'
            }}>
              Room: <strong>{showPasscodeModal.name}</strong>
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                New Passcode
              </label>
              <input
                type="password"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                placeholder="Enter new passcode"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  backgroundColor: isLoading ? '#f9fafb' : 'white'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Confirm Passcode
              </label>
              <input
                type="password"
                value={confirmPasscode}
                onChange={(e) => setConfirmPasscode(e.target.value)}
                placeholder="Re-enter new passcode"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  backgroundColor: isLoading ? '#f9fafb' : 'white'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={closePasscodeModal}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#e5e7eb')}
                onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#f3f4f6')}
              >
                Cancel
              </button>
              <button
                onClick={updatePasscode}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: isLoading ? '#9ca3af' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#5568d3')}
                onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#667eea')}
              >
                {isLoading && <Spinner size="small" color="#ffffff" />}
                {isLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

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
