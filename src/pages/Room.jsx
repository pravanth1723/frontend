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
    <div className="container-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 className="section-title">Room: <span className="small-tag">{roomId}</span></h2>
          <div className="small">Navigate between steps using the links below.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn ghost" onClick={() => navigate("/rooms")}>Back to Rooms</button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <nav style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <NavLink to={`/room/${roomId}/step1`} className={({isActive})=> isActive ? "active" : ""}>Step 1 - Setup</NavLink>
          <NavLink to={`/room/${roomId}/step2`} className={({isActive})=> isActive ? "active" : ""}>Step 2 - Add Expenses</NavLink>
          <NavLink to={`/room/${roomId}/step3`} className={({isActive})=> isActive ? "active" : ""}>Step 3 - Preview</NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="step1" replace />} />
          <Route path="step1" element={<Setup />} />
          <Route path="step2" element={<Expenses />} />
          <Route path="step3" element={<PreviewStep />} />
          <Route path="create" element={<RoomCreate onEnterRoom={(r)=> navigate(`/room/${r.id}/step1`)} />} />
          <Route path="*" element={<div className="small">Unknown step. Choose from the tabs above.</div>} />
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
