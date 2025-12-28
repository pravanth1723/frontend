import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreateRoom from "../components/Rooms/CreateRoom";
import RoomsList from "../components/Rooms/RoomsList";
import JoinRoomComponent from "../components/Rooms/JoinRoom";
import Snackbar from "../components/Snackbar";
import { BACKEND_URL } from "../config";

/**
 * RoomsPage
 * - Main page for managing rooms
 * - Displays create room, join room, and list of rooms
 */
export default function RoomsPage() {
  const [apiRooms, setApiRooms] = useState([]);
  const [snackbar, setSnackbar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  function fetchRooms() {
    axios.get(`${BACKEND_URL}/api/rooms`, { withCredentials: true })
      .then(response => {
        if (response.status === 200) {
          console.log('Rooms fetched from API:', response.data);
          const rooms = Array.isArray(response.data.data) ? response.data.data : [];
          setApiRooms(rooms);
        }
      })
      .catch(error => {
        console.error('Error fetching rooms:', error);
        setSnackbar({ category: 'error', message: 'Failed to fetch rooms. Please try again.' });
        setApiRooms([]);
      });
  }

  return (
    <div className="container-card">
      <h2 className="section-title">Rooms</h2>

      <div className="row">
        <div className="col">
          <CreateRoom onRoomCreated={fetchRooms} />
          
          <div style={{ marginTop: 20 }}>
            <JoinRoomComponent />
          </div>
        </div>

        <div className="col">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>My Rooms</h3>
            <button className="back-button" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          </div>

          <RoomsList rooms={apiRooms} onRoomsChange={fetchRooms} />
        </div>
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
