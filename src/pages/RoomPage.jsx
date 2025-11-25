import React, { useState, useEffect } from "react";
import { useParams, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { SplitProvider, useSplit } from "../context/SplitContext";
import axios from "axios";
import RoomCreate from "./RoomCreate";
import SetupStep from "./split/SetupStep";
import AddExpenseStep from "./split/AddExpenseStep";
import PreviewStep from "./split/PreviewStep";

/**
 * RoomPage - wraps SplitProvider for in-memory storage.
 * If user just wants to create/join, we also show a RoomCreate card.
 *
 * URL structure:
 *  /room/:roomId/step1
 *  /room/:roomId/step2
 *  /room/:roomId/step3
 */

function RoomContent() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { splitTitle, setSplitTitle, users, setUsers, organizer, setOrganizer } = useSplit();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editUsers, setEditUsers] = useState("");
  const [editOrganizer, setEditOrganizer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRoomData();
  }, [roomId]);

  function fetchRoomData() {
    setIsLoading(true);
    axios.get(`http://localhost:5000/api/rooms/${roomId}`, { withCredentials: true })
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          const data = response.data;
          setSplitTitle(data.title || "");
          setUsers(data.persons || []);
          setOrganizer(data.organizer || "");
          
          setEditTitle(data.title || "");
          setEditUsers((data.persons || []).join("\n"));
          setEditOrganizer(data.organizer || "");
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching room data:', error);
        setIsLoading(false);
      });
  }

  function handleEdit() {
    setEditTitle(splitTitle);
    setEditUsers(users.join("\n"));
    setEditOrganizer(organizer);
    setIsEditing(true);
  }

  function handleCancel() {
    setEditTitle(splitTitle);
    setEditUsers(users.join("\n"));
    setEditOrganizer(organizer);
    setIsEditing(false);
  }

  function handleSave() {
    const usersList = editUsers.split("\n").map(s => s.trim()).filter(Boolean);
    
    if (!editTitle.trim()) {
      alert("Please provide a room title");
      return;
    }
    if (usersList.length < 2) {
      alert("Please add at least two persons");
      return;
    }
    if (!editOrganizer || !usersList.includes(editOrganizer)) {
      alert("Please select a valid organizer from the persons list");
      return;
    }

    setIsSaving(true);

    axios.put(`http://localhost:5000/api/rooms/${roomId}`, {
      title: editTitle.trim(),
      persons: usersList,
      organizer: editOrganizer
    }, { withCredentials: true })
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          setSplitTitle(editTitle.trim());
          setUsers(usersList);
          setOrganizer(editOrganizer);
          setIsEditing(false);
          alert("Room details updated successfully");
        }
        setIsSaving(false);
      })
      .catch(error => {
        console.error('Error updating room:', error);
        alert("Error updating room details");
        setIsSaving(false);
      });
  }

  const usersList = editUsers.split("\n").map(s => s.trim()).filter(Boolean);

  return (
    <div className="container-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 className="section-title">Room: <span className="small-tag">{roomId}</span></h2>
          <div className="small">Room state is temporary (in-memory). Navigate between steps using the links below.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn ghost" onClick={() => navigate("/")}>Home</button>
          <button className="btn ghost" onClick={() => navigate(`/room/${roomId}/step1`)}>Step 1</button>
        </div>
      </div>

      {/* Room Details Section */}
      {isLoading ? (
        <div className="card" style={{ marginTop: 12, padding: '20px', textAlign: 'center' }}>
          <div className="small">Loading room details...</div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: 12, padding: '16px', background: '#f9f9f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="small" style={{ margin: 0 }}>Room Details</h3>
            {!isEditing && (
              <button className="btn ghost" onClick={handleEdit}>Edit</button>
            )}
          </div>

          {isEditing ? (
            <div>
              <div style={{ marginBottom: 10 }}>
                <label className="small">Room Title</label>
                <input 
                  className="input" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  placeholder="Room title"
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label className="small">Persons (one per line)</label>
                <textarea 
                  className="input" 
                  value={editUsers} 
                  onChange={(e) => setEditUsers(e.target.value)}
                  rows={5}
                  placeholder="Enter persons, one per line"
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label className="small">Organizer</label>
                <div style={{ marginTop: 8 }}>
                  {usersList.length === 0 && <div className="small">Add persons above to select an organizer.</div>}
                  {usersList.map((user) => (
                    <label key={user} style={{ display: 'block', marginBottom: 6, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="editOrganizer"
                        checked={editOrganizer === user}
                        onChange={() => setEditOrganizer(user)}
                        style={{ marginRight: 8 }}
                      />
                      {user}
                    </label>
                  ))}
                </div>
              </div>

              <div className="controls">
                <button className="btn" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button className="btn ghost" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 10 }}>
                <div className="small" style={{ color: '#666' }}>Title:</div>
                <div style={{ fontWeight: 600 }}>{splitTitle || "No title"}</div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div className="small" style={{ color: '#666' }}>Persons:</div>
                <div style={{ fontWeight: 500 }}>{users.length > 0 ? users.join(", ") : "No persons"}</div>
              </div>

              <div>
                <div className="small" style={{ color: '#666' }}>Organizer:</div>
                <div style={{ fontWeight: 500 }}>{organizer || "No organizer"}</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <nav style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <NavLink to={`/room/${roomId}/step1`} className={({isActive})=> isActive ? "active" : ""}>Step 1 - Setup</NavLink>
          <NavLink to={`/room/${roomId}/step2`} className={({isActive})=> isActive ? "active" : ""}>Step 2 - Add Expenses</NavLink>
          <NavLink to={`/room/${roomId}/step3`} className={({isActive})=> isActive ? "active" : ""}>Step 3 - Preview</NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="step1" replace />} />
          <Route path="step1" element={<SetupStep />} />
          <Route path="step2" element={<AddExpenseStep />} />
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
    <SplitProvider>
      <RoomContent />
    </SplitProvider>
  );
}
