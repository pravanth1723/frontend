import React, { useContext, useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { store } from '../App';
import Snackbar from '../components/Snackbar';
import Spinner from '../components/Spinner';
import { BACKEND_URL } from "../config";
import './Register.css';

/**
 * Register page
 */
export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [userstate, setUserState] = useContext(store);
  const [snackbar, setSnackbar] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();

    if (!username || !password) {
      setSnackbar({ category: 'error', message: 'Please fill in all fields' });
      return;
    }

    if (password !== confirmPassword) {
      setSnackbar({ category: 'error', message: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    axios.post(`${BACKEND_URL}/api/users/register`, { 
      username, 
      password
    }, { withCredentials: true })
      .then(response => {
        console.log("Response", response);
        setSnackbar({ category: response.data.category, message: response.data.message });
        
        if (response.status >= 200 && response.status < 300) {
          setUserState("loggedin");
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Registration error:", error);
        const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
        setSnackbar({ category: 'error', message: errorMsg });
        setIsLoading(false);
      });
  }

  return (
    <div className="register-container">
      {/* Left side - Design/Artwork */}
      <div className="register-left">
        <div className="register-artwork">
          <div className="register-artwork-icon">💫</div>
          <h1 className="register-artwork-title">Split Smart</h1>
          <p className="register-artwork-subtitle">
            Join thousands who trust us to make expense splitting simple, fair, and transparent
          </p>
          
          <div className="register-features">
            <div className="register-feature">
              <div className="register-feature-icon">🏠</div>
              <span className="register-feature-text">Create & Join Rooms</span>
            </div>
            <div className="register-feature">
              <div className="register-feature-icon">💰</div>
              <span className="register-feature-text">Track All Expenses</span>
            </div>
            <div className="register-feature">
              <div className="register-feature-icon">📊</div>
              <span className="register-feature-text">Smart Settlements</span>
            </div>
            <div className="register-feature">
              <div className="register-feature-icon">📱</div>
              <span className="register-feature-text">Mobile Friendly</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="register-right">
        <div className="register-card">
          {/* Header */}
          <div className="register-header">
            <div className="register-icon">🎉</div>
            <h2 className="register-title">Create Account</h2>
            <p className="register-subtitle">Join us and start splitting expenses</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text"
                className="form-input"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                disabled={isLoading}
                placeholder="Choose a username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password"
                className="form-input"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Create a strong password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input 
                type="password"
                className="form-input"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Re-enter your password"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="register-button"
            >
              {isLoading ? (
                <>
                  <Spinner size="small" color="#ffffff" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Create Account</span>
                </>
              )}
            </button>

            <div className="register-footer">
              <span className="register-footer-text">
                Already have an account?{' '}
              </span>
              <Link to="/login" className="register-link">
                Sign in instead
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
