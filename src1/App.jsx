import React, { useEffect, useState } from "react";
import RoomCreate from "./components/RoomCreate";
import ExpensePage from "./components/ExpensePage";
import Login from "./components/Login";
import Register from "./components/Register";

/**
 * App
 * - Handles auth (simple demo using localStorage)
 * - Shows Login / Register when not authenticated
 * - After auth shows RoomCreate / ExpensePage
 */
export default function App() {
  const [activeRoom, setActiveRoom] = useState(null); // { id, passcode, data }
  const [currentUser, setCurrentUser] = useState(null); // username string
  const [authView, setAuthView] = useState("login"); // "login" or "register"

  useEffect(() => {
    // try to resume session from localStorage
    const saved = localStorage.getItem("session:user");
    if (saved) setCurrentUser(saved);
  }, []);

  function handleLogin(username) {
    setCurrentUser(username);
    localStorage.setItem("session:user", username);
  }

  function handleLogout() {
    setCurrentUser(null);
    localStorage.removeItem("session:user");
    // also leave room if inside one
    setActiveRoom(null);
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Expense Splitter (Frontend)</h1>
        <div className="header-meta">
          {currentUser ? (
            <>
              <span className="small">Logged as: <b>{currentUser}</b></span>
              <button className="btn ghost" style={{ marginLeft: 12 }} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <span className="small">Not signed in</span>
          )}
        </div>
      </header>

      <main className="app-main">
        {!currentUser ? (
          <div className="container-card" style={{ maxWidth: 520 }}>
            {authView === "login" ? (
              <>
                <h2 className="section-title">Sign In</h2>
                <Login onLogin={(u) => handleLogin(u)} onSwitchToRegister={() => setAuthView("register")} />
              </>
            ) : (
              <>
                <h2 className="section-title">Register</h2>
                <Register onRegister={(u) => handleLogin(u)} onSwitchToLogin={() => setAuthView("login")} />
              </>
            )}
          </div>
        ) : (
          <>
            {!activeRoom ? (
              <RoomCreate onEnterRoom={(room) => setActiveRoom(room)} />
            ) : (
              <ExpensePage
                room={activeRoom}
                onLeave={() => setActiveRoom(null)}
                currentUser={currentUser}
                persistRoom={(roomData) => {
                  const key = `room:${activeRoom.id}`;
                  const payload = {
                    id: activeRoom.id,
                    passcode: activeRoom.passcode,
                    data: roomData,
                  };
                  localStorage.setItem(key, JSON.stringify(payload));
                }}
              />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <small>Frontend only — backend will be built separately.</small>
      </footer>
    </div>
  );
}