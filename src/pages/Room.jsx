import React from "react";
import { useParams, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import RoomCreate from "../components/Rooms/CreateRoom";
import Setup from "../components/Room/Setup";
import Expenses from "../components/Room/Expenses";
import PreviewStep from "../components/Room/Finalize_and_preview";
import './Room.css';

function RoomContent() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="room-container">
      {/* Header Section */}
      <div className="room-header">
        <div className="room-header-content">
          <h2 className="room-title">
            <span className="room-title-icon">🏠</span>
            Room Management
          </h2>
          <div className="room-id-badge">
            📍 Room ID: <span className="room-id-text">{roomId}</span>
          </div>
          <div className="room-description">
            Navigate between steps to manage your room expenses
          </div>
        </div>
        <button 
          onClick={() => navigate("/rooms")}
          className="back-button"
        >
          <span>←</span>
          Back to Rooms
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className="room-nav">
        <NavLink 
          to={`/room/${roomId}/step1`} 
          className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-link-icon">⚙️</span>
          Step 1 - Setup
        </NavLink>
        
        <NavLink 
          to={`/room/${roomId}/step2`} 
          className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-link-icon">💰</span>
          Step 2 - Add Expenses
        </NavLink>
        
        <NavLink 
          to={`/room/${roomId}/step3`} 
          className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-link-icon">📊</span>
          Step 3 - Preview
        </NavLink>
      </nav>

      {/* Main Content Area */}
      <div className="room-content">
        <Routes>
          <Route path="/" element={<Navigate to="step1" replace />} />
          <Route path="step1" element={<Setup />} />
          <Route path="step2" element={<Expenses />} />
          <Route path="step3" element={<PreviewStep />} />
          <Route path="create" element={<RoomCreate onEnterRoom={(r)=> navigate(`/room/${r.id}/step1`)} />} />
          <Route path="*" element={
            <div className="unknown-step">
              <div className="unknown-step-icon">❓</div>
              <h3>Unknown Step</h3>
              <p>Please choose a valid step from the tabs above</p>
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
