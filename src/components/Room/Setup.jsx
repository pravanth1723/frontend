import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Snackbar from "../Snackbar";

/**
 * Setup Component
 * Fetches and displays room metadata (title, persons, organizer)
 * Allows editing and saving room details
 */
export default function Setup() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [roomName, setRoomName] = useState("");
  const [title, setTitle] = useState("");
  const [persons, setPersons] = useState([]);
  const [organizer, setOrganizer] = useState("");
  const [notes, setNotes] = useState("");
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPersonsText, setEditPersonsText] = useState("");
  const [editOrganizer, setEditOrganizer] = useState("");
  const [editNotes, setEditNotes] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    if (roomId) {
      fetchRoomMeta();
    }
  }, [roomId]);

  function fetchRoomMeta() {
    setIsLoading(true);
    axios.get(`http://localhost:5000/api/rooms/${roomId}`, { withCredentials: true })
      .then(response => {
        if (response.status === 200) {
          const data = response.data.data;
          setRoomName(data.name || "");
          setTitle(data.title || "");
          setPersons(data.members || []);
          setOrganizer(data.organizer || "");
          setNotes(data.notes || "");
          setEditTitle(data.title || "");
          setEditPersonsText((data.members || []).join("\n"));
          setEditOrganizer(data.organizer || "");
          setEditNotes(data.notes || "");}
        setIsLoading(false);
      })
      .catch(error => {
        setSnackbar({ category: 'error', message: 'Failed to load room data' });
        setIsLoading(false);
      });
  }

  function handleEdit() {
    setEditTitle(title);
    setEditPersonsText(persons.join("\n"));
    setEditOrganizer(organizer);
    setEditNotes(notes);
    setIsEditing(true);
  }

  function handleCancel() {
    setEditTitle(title);
    setEditPersonsText(persons.join("\n"));
    setEditOrganizer(organizer);
    setEditNotes(notes);
    setIsEditing(false);
  }

  function handleSave() {
    const personsList = editPersonsText.split("\n").map(s => s.trim()).filter(Boolean);
    
    if (!editTitle.trim()) {
      setSnackbar({ category: 'error', message: 'Please provide a title' });
      return;
    }
    if (personsList.length < 2) {
      setSnackbar({ category: 'error', message: 'Please add at least two persons' });
      return;
    }
    if (!editOrganizer || !personsList.includes(editOrganizer)) {
      setSnackbar({ category: 'error', message: 'Please select a valid organizer from the persons list' });
      return;
    }

    setIsSaving(true);

    axios.put(`http://localhost:5000/api/rooms/${roomId}`, {
      title: editTitle.trim(),
      members: personsList,
      organizer: editOrganizer,
      notes: editNotes
    }, { withCredentials: true })
      .then(response => {
        if (response.status === 200) {
          setTitle(editTitle.trim());
          setPersons(personsList);
          setOrganizer(editOrganizer);
          setNotes(editNotes);
          setIsEditing(false);
          setSnackbar({ category: 'success', message: 'Room details saved successfully' });
        }
        setIsSaving(false);
      })
      .catch(error => {
        console.error('Error saving room details:', error);
        setSnackbar({ category: 'error', message: 'Error saving room details' });
        setIsSaving(false);
      });
  }

  function next() {
    if (!title || !persons.length || !organizer) {
      setSnackbar({ category: 'error', message: 'Please complete the setup before proceeding' });
      return;
    }
    navigate("../step2");
  }

  const editPersonsList = editPersonsText.split("\n").map(s => s.trim()).filter(Boolean);

  if (isLoading) {
    return (
      <div className="card">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div className="small">Loading room details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Room Info Header */}
      <div style={{ marginBottom: 16, padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="small" style={{ color: '#666' }}>Room ID:</div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{roomId || "N/A"}</div>
          </div>
          <div>
            <div className="small" style={{ color: '#666' }}>Room Name:</div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{roomName || "N/A"}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 className="small">Step 1: Setup Group</h3>
        {!isEditing && (
          <button className="btn ghost" onClick={handleEdit}>Edit</button>
        )}
      </div>

      {isEditing ? (
        <div>
          <div style={{ marginBottom: 8 }}>
            <label className="small">Title</label>
            <input 
              className="input" 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Enter title"
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="small">Enter persons (one per line)</label>
            <textarea 
              className="input" 
              value={editPersonsText} 
              onChange={(e) => setEditPersonsText(e.target.value)}
              rows={5}
              placeholder="Enter persons, one per line"
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="small">Select organizer</label>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {editPersonsList.length === 0 && <div className="small">Add persons above.</div>}
              {editPersonsList.map(person => (
                <label key={person} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <input 
                    type="radio" 
                    name="editOrganizer" 
                    checked={editOrganizer === person} 
                    onChange={() => setEditOrganizer(person)} 
                  />
                  {person}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="small">Notes</label>
            <textarea 
              className="input" 
              value={editNotes} 
              onChange={(e) => setEditNotes(e.target.value)}
              rows={4}
              placeholder="Add any notes or additional information here..."
            />
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
          <div style={{ marginBottom: 8 }}>
            <label className="small">Title</label>
            <div style={{ 
              padding: '8px 12px', 
              background: '#f9f9f9', 
              borderRadius: '4px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center'
            }}>
              {title || "N/A"}
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="small">Persons</label>
            <div style={{ 
              padding: '8px 12px', 
              background: '#f9f9f9', 
              borderRadius: '4px',
              minHeight: '40px'
            }}>
              {persons.length > 0 ? persons.join(", ") : "N/A"}
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="small">Organizer</label>
            <div style={{ 
              padding: '8px 12px', 
              background: '#f9f9f9', 
              borderRadius: '4px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center'
            }}>
              {organizer || "N/A"}
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="small">Notes</label>
            <div style={{ 
              padding: '8px 12px', 
              background: '#f9f9f9', 
              borderRadius: '4px',
              minHeight: '60px',
              whiteSpace: 'pre-wrap'
            }}>
              {notes || "N/A"}
            </div>
          </div>

          <div className="controls">
            <button className="btn" onClick={next}>Next: Add Expenses</button>
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
