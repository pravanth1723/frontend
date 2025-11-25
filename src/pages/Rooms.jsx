import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateRoom from "../components/Rooms/CreateRoom";
import RoomsList from "../components/Rooms/RoomsList";
import JoinRoomComponent from "../components/Rooms/JoinRoom";

/**
 * RoomsPage
 * - Main page for managing rooms
 * - Displays create room, join room, and list of rooms
 */
export default function RoomsPage() {
  const [apiRooms, setApiRooms] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  function fetchRooms() {
    axios.get('http://localhost:5000/api/rooms', { withCredentials: true })
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          console.log('Rooms fetched from API:', response.data);
          const rooms = Array.isArray(response.data) ? response.data : [];
          setApiRooms(rooms);
        }
      })
      .catch(error => {
        console.error('Error fetching rooms:', error);
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
          <RoomsList rooms={apiRooms} />
        </div>
      </div>
    </div>
  );
}
