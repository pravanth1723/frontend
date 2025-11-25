import React, { useState } from "react";

/**
 * Login
 * - Simple username/password login against users stored in localStorage
 * - onLogin(username) called on success
 * - onSwitchToRegister() to move to registration view
 */
export default function Login({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e && e.preventDefault();
    if (!username.trim() || !password) {
      return alert("Enter username and password");
    }
    const raw = localStorage.getItem("users");
    const users = raw ? JSON.parse(raw) : [];
    const found = users.find(u => u.username === username);
    if (!found) return alert("No such user. Please register first.");
    if (found.password !== password) return alert("Incorrect password.");
    onLogin(username);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 10 }}>
        <label className="small">Username</label>
        <input className="input" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="your username" />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label className="small">Password</label>
        <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="password" />
      </div>

      <div className="controls">
        <button className="btn" type="submit">Login</button>
        <button type="button" className="btn ghost" onClick={onSwitchToRegister}>Register</button>
      </div>

      <div style={{ marginTop: 10 }} className="small">
        This demo stores user credentials in localStorage. Replace with secure backend auth for production.
      </div>
    </form>
  );
}