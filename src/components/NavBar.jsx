import React ,{useContext}from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { store } from '../App';

/**
 * NavBar - top navigation (login-aware)
 */
export default function NavBar() {
  const [user, setUser] = useContext(store);
  const navigate = useNavigate();

  function logout() {
    setUser("notloggedin");
    navigate("/login");
  }

  return (
    <header className="app-header">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 16, color: "var(--primary)" }}>Group Expense Splitter</h1>
        <nav className="nav">
          <NavLink to="/" className={({isActive})=> isActive ? "active" : ""}>Home</NavLink>
          {user === "loggedin" && <NavLink to="/rooms" className={({isActive})=> isActive ? "active" : ""}>Rooms</NavLink>}
        </nav>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {user === "loggedin" ? (
          <>
            <button className="btn ghost" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({isActive})=> isActive ? "active" : ""}>Login</NavLink>
            <NavLink to="/register" className={({isActive})=> isActive ? "active" : ""}>Register</NavLink>
          </>
        )}
      </div>
    </header>
  );
}
