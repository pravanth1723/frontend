import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreateRoom from "../components/Rooms/CreateRoom";
import RoomsList from "../components/Rooms/RoomsList";
import JoinRoomComponent from "../components/Rooms/JoinRoom";
import Snackbar from "../components/Snackbar";
import { BACKEND_URL } from "../config";

export default function RoomsPage() {
  const [apiRooms, setApiRooms] = useState([]);
  const [snackbar, setSnackbar] = useState(null);
  const navigate = useNavigate();

  const fetchRooms = useCallback(() => {
    axios
      .get(`${BACKEND_URL}/api/rooms`, { withCredentials: true })
      .then(response => {
        if (response.status === 200) {
          const rooms = Array.isArray(response.data.data)
            ? response.data.data
            : [];
          setApiRooms(rooms);
        }
      })
      .catch(error => {
        console.error("Error fetching rooms:", error);

        if (error.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        setSnackbar({
          category: "error",
          message: "Failed to fetch rooms. Please try again."
        });

        setApiRooms([]);
      });
  }, [navigate]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

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
          <h3 style={{ marginBottom: 12 }}>My Rooms</h3>
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
