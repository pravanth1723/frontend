import React, { useContext, useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { store } from '../App';
import Snackbar from '../components/Snackbar';
import Spinner from '../components/Spinner';

/**
 * Login page - uses localStorage 'users' for demo credentials.
 */
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [userstate, setUserState] = useContext(store);
  const [snackbar, setSnackbar] = useState(null);
  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    axios.post('http://localhost:5000/api/users/login', { username, password }, { withCredentials: true })
      .then(response => {
        console.log("Response", response);
        setSnackbar({ category: response.data.category, message: response.data.message });
        
        if (response.status >= 200 && response.status < 300) {
          setUserState("loggedin");
          // Navigate after short delay to show snackbar
          setTimeout(() => {
            navigate('/rooms');
          }, 1500);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Login error:", error);
        const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
        setSnackbar({ category: 'error', message: errorMsg });
        setIsLoading(false);
      });
  }
  return (
    <div className="container-card" style={{ maxWidth: 480 }}>
      <h2 className="section-title">Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label className="small">Username</label>
          <input 
            className="input" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            disabled={isLoading}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label className="small">Password</label>
          <input 
            className="input" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="controls">
          <button className="btn" type="submit" disabled={isLoading}>
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <Spinner size="small" color="#ffffff" />
                <span>Logging in...</span>
              </div>
            ) : 'Login'}
          </button>
          <Link to="/register"><button type="button" className="btn ghost" disabled={isLoading}>Register</button></Link>
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
