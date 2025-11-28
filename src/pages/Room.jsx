import React from "react";
import { useParams, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import RoomCreate from "../components/Rooms/CreateRoom";
import Setup from "../components/Room/Setup";
import Expenses from "../components/Room/Expenses";
import PreviewStep from "../components/Room/Finalize_and_preview"

function RoomContent() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            fontSize: '1.75rem', 
            margin: '0 0 8px 0',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '2rem' }}>🏠</span>
            Room Management
          </h2>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '8px 16px',
            borderRadius: '6px',
            display: 'inline-block',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            📍 Room ID: <span style={{ fontWeight: '700' }}>{roomId}</span>
          </div>
          <div style={{ 
            marginTop: '8px',
            fontSize: '0.9rem',
            opacity: 0.9
          }}>
            Navigate between steps to manage your room expenses
          </div>
        </div>
        <button 
          onClick={() => navigate("/rooms")}
          style={{
            backgroundColor: 'white',
            color: '#667eea',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
        >
          <span>←</span>
          Back to Rooms
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <NavLink 
          to={`/room/${roomId}/step1`} 
          className={({isActive})=> isActive ? "active" : ""}
          style={({isActive}) => ({
            flex: 1,
            minWidth: '180px',
            padding: '14px 20px',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.95rem',
            textAlign: 'center',
            transition: 'all 0.3s',
            backgroundColor: isActive ? '#667eea' : '#f9fafb',
            color: isActive ? 'white' : '#6b7280',
            border: isActive ? 'none' : '2px solid #e5e7eb',
            boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          })}
          onMouseEnter={(e) => {
            if (!e.currentTarget.classList.contains('active')) {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.classList.contains('active')) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>⚙️</span>
          Step 1 - Setup
        </NavLink>
        
        <NavLink 
          to={`/room/${roomId}/step2`} 
          className={({isActive})=> isActive ? "active" : ""}
          style={({isActive}) => ({
            flex: 1,
            minWidth: '180px',
            padding: '14px 20px',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.95rem',
            textAlign: 'center',
            transition: 'all 0.3s',
            backgroundColor: isActive ? '#667eea' : '#f9fafb',
            color: isActive ? 'white' : '#6b7280',
            border: isActive ? 'none' : '2px solid #e5e7eb',
            boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          })}
          onMouseEnter={(e) => {
            if (!e.currentTarget.classList.contains('active')) {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.classList.contains('active')) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>💰</span>
          Step 2 - Add Expenses
        </NavLink>
        
        <NavLink 
          to={`/room/${roomId}/step3`} 
          className={({isActive})=> isActive ? "active" : ""}
          style={({isActive}) => ({
            flex: 1,
            minWidth: '180px',
            padding: '14px 20px',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.95rem',
            textAlign: 'center',
            transition: 'all 0.3s',
            backgroundColor: isActive ? '#667eea' : '#f9fafb',
            color: isActive ? 'white' : '#6b7280',
            border: isActive ? 'none' : '2px solid #e5e7eb',
            boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          })}
          onMouseEnter={(e) => {
            if (!e.currentTarget.classList.contains('active')) {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.classList.contains('active')) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>📊</span>
          Step 3 - Preview
        </NavLink>
      </nav>

      {/* Main Content Area */}
      <div style={{
        minHeight: '400px'
      }}>
        <Routes>
          <Route path="/" element={<Navigate to="step1" replace />} />
          <Route path="step1" element={<Setup />} />
          <Route path="step2" element={<Expenses />} />
          <Route path="step3" element={<PreviewStep />} />
          <Route path="create" element={<RoomCreate onEnterRoom={(r)=> navigate(`/room/${r.id}/step1`)} />} />
          <Route path="*" element={
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>❓</div>
              <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>Unknown Step</h3>
              <p style={{ color: '#9ca3af' }}>Please choose a valid step from the tabs above</p>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default function RoomPage() {
  return (
     <RoomContent />
  );
}
