import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import Snackbar from '../components/Snackbar';

/**
 * Register page
 */
export default function Register() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [snackbar, setSnackbar] = useState(null);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    
    if (password !== confirm) {
      setSnackbar({ category: 'error', message: 'Passwords do not match!' });
      return;
    }

    axios.post('http://localhost:5000/api/users/register', { username, password }, { withCredentials: true })
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          setSnackbar({ category: 'success', message: 'Account created successfully!' });
          // Navigate to login after short delay
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        } else {
          setSnackbar({ category: 'error', message: 'Something went wrong' });
        }
      })
      .catch(error => {
        console.error('Registration error:', error);
        const errorMsg = error.response?.data?.message || 'Registration failed. Username may already exist.';
        setSnackbar({ category: 'error', message: errorMsg });
      });
  }

  return (
    <div className="container-card" style={{ maxWidth: 480 }}>
      <h2 className="section-title">Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label className="small">Username</label>
          <input className="input" value={username} onChange={(e)=>setUsername(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label className="small">Password</label>
          <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label className="small">Confirm Password</label>
          <input className="input" type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
        </div>
        <div className="controls">
          <button className="btn" type="submit">Register</button>
          <Link to="/login"><button type="button" className="btn ghost">Back to Login</button></Link>
        </div>
      </form>

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
