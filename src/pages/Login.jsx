import React, { useContext, useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { store } from '../App';
import Snackbar from '../components/Snackbar';
import Spinner from '../components/Spinner';
import { BACKEND_URL } from "../config";
import './Login.css';

/**
 * Login page - uses localStorage 'users' for demo credentials.
 */
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [, setUserState] = useContext(store);
  const [snackbar, setSnackbar] = useState(null);
  
  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    axios.post(`${BACKEND_URL}/api/users/login`, { username, password }, { withCredentials: true })
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
    <div className="login-container">
      {/* Left side - Design/Artwork */}
      <div className="login-left">
        <div className="login-artwork">
          <div className="login-artwork-icon">🏆</div>
          <h1 className="login-artwork-title">Welcome Back</h1>
          <p className="login-artwork-subtitle">
            Continue your expense splitting journey with the most trusted platform
          </p>
          
          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-icon">🔒</div>
              <span className="login-feature-text">Secure & Private</span>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">⚡</div>
              <span className="login-feature-text">Lightning Fast</span>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">💯</div>
              <span className="login-feature-text">100% Accurate</span>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">🌟</div>
              <span className="login-feature-text">Trusted by Thousands</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="login-right">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-icon">💰</div>
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Sign in to manage your expenses</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                className="form-input"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                disabled={isLoading}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                className="form-input"
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Enter your password"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? (
                <>
                  <Spinner size="small" color="#ffffff" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>🔐</span>
                  <span>Sign In</span>
                </>
              )}
            </button>

            <div className="login-footer">
              <span className="login-footer-text">
                Don't have an account?{' '}
              </span>
              <Link to="/register" className="login-link">
                Create one now
              </Link>
            </div>
          </form>
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
