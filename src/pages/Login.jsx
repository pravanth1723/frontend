import React, { useContext, useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { store } from '../App';
import Snackbar from '../components/Snackbar';
import Spinner from '../components/Spinner';
import { BACKEND_URL } from "../config";

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '460px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.5s ease-out'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px'
        }}>
          <div style={{ 
            fontSize: '3.5rem', 
            marginBottom: '16px'
          }}>
            💰
          </div>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Welcome Back
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '0.95rem'
          }}>
            Sign in to manage your expenses
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '0.9rem'
            }}>
              Username
            </label>
            <input 
              className="input" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              disabled={isLoading}
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'all 0.3s',
                boxSizing: 'border-box',
                backgroundColor: isLoading ? '#f9fafb' : 'white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '0.9rem'
            }}>
              Password
            </label>
            <input 
              className="input" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'all 0.3s',
                boxSizing: 'border-box',
                backgroundColor: isLoading ? '#f9fafb' : 'white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px 24px',
              backgroundColor: isLoading ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '1.05rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#5568d3';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#667eea';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }
            }}
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

          <div style={{
            textAlign: 'center',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Don't have an account?{' '}
            </span>
            <Link 
              to="/register"
              style={{
                color: '#667eea',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '0.95rem',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#5568d3'}
              onMouseLeave={(e) => e.target.style.color = '#667eea'}
            >
              Create one now
            </Link>
          </div>
        </form>
      </div>

      {snackbar && (
        <Snackbar
          category={snackbar.category}
          message={snackbar.message}
          onClose={() => setSnackbar(null)}
        />
      )}

      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}
