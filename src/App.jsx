import React ,{createContext, useState}from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import RoomPage from "./pages/Room";
import RoomsPage from "./pages/Rooms"; // <-- new import

/**
 * App - top-level router + auth provider
 */
export const store = createContext();

export default function App() {
  const [user, setUser] = useState("notloggedin");

  return (
    <store.Provider value={[user, setUser]}>
      <AuthProvider>
        <div className="app-root">
          <NavBar />
          <main className="app-main">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/" element={<Home />} />

              <Route path="/rooms" element={<RoomsPage />} /> {/* <-- new route */}

              {/* Room route hosts the in-memory SplitProvider inside RoomPage */}
              <Route path="/room/:roomId/*" element={<RoomPage />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="app-footer">
            <small>Frontend-only demo. Split data is in-memory per-room session.</small>
          </footer>
        </div>
      </AuthProvider>
    </store.Provider>
  );
}
