import React, { useState } from "react";

/**
 * Register
 * - Saves user credentials to localStorage (demo only)
 * - onRegister(username) will be called and user will be considered logged in
 * - onSwitchToLogin() to go back to login view
 */
export default function Register({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  function handleSubmit(e) {
    e && e.preventDefault();
    if (!username.trim() || !password) return alert("Enter username and password");
    if (password !== confirm) return alert("Passwords do not match");
    const raw = localStorage.getItem("users");
    const users = raw ? JSON.parse(raw) : [];
    if (users.find(u => u.username === username)) return alert("Username already exists");
    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
    // auto-login after registration
    onRegister(username);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 10 }}>
        <label className="small">Username</label>
        <input className="input" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="choose a username" />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label className="small">Password</label>
        <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="password" />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label className="small">Confirm Password</label>
        <input className="input" type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="confirm password" />
      </div>

      <div className="controls">
        <button className="btn" type="submit">Register</button>
        <button type="button" className="btn ghost" onClick={onSwitchToLogin}>Back to Login</button>
      </div>

      <div style={{ marginTop: 10 }} className="small">
        Demo note: credentials are stored in localStorage. Integrate a real backend and secure hashing when ready.
      </div>
    </form>
  );
}