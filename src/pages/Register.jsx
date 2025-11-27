import React, { useContext, useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { store } from '../App';
import Snackbar from '../components/Snackbar';
import Spinner from '../components/Spinner';

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
    axios.post('http://localhost:5000/api/users/register', { 
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
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
            🎉
          </div>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Create Account
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '0.95rem'
          }}>
            Join us and start splitting expenses
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
              type="text"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              disabled={isLoading}
              placeholder="Choose a username"
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
                e.target.style.borderColor = '#f5576c';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
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
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Create a strong password"
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
                e.target.style.borderColor = '#f5576c';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)';
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
              Confirm Password
            </label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Re-enter your password"
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
                e.target.style.borderColor = '#f5576c';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)';
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
              backgroundColor: isLoading ? '#9ca3af' : '#f5576c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '1.05rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#e04560';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(245, 87, 108, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#f5576c';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(245, 87, 108, 0.3)';
              }
            }}
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

          <div style={{
            textAlign: 'center',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Already have an account?{' '}
            </span>
            <Link 
              to="/login"
              style={{
                color: '#f5576c',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '0.95rem',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#e04560'}
              onMouseLeave={(e) => e.target.style.color = '#f5576c'}
            >
              Sign in instead
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
