import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { store } from "../App";
import axios from "axios";

export default function NavBar() {
  const [user, setUser] = useContext(store);
  const navigate = useNavigate();
  const location = useLocation();

  async function logout() {
    try {
      // Call backend logout endpoint to clear session
      await axios.post('http://localhost:5000/api/users/logout', {}, { 
        withCredentials: true 
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear user state and redirect, even if API call fails
      setUser("notloggedin");
      navigate("/login");
    }
  }

  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <nav className="nav" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: 'var(--primary)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div className="nav-left">
        <Link to="/" className="brand" style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'white',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          💰 SplitWise
        </Link>
      </div>

      <div className="nav-right" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {user === "loggedin" ? (
          <>
            <Link to="/rooms" className="nav-link" style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              transition: 'background-color 0.3s',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
              My Rooms
            </Link>
            <button 
              className="btn" 
              onClick={logout}
              style={{
                backgroundColor: 'white',
                color: 'var(--primary)',
                border: 'none',
                padding: '0.5rem 1.5rem',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link" style={{
              backgroundColor: isLoginPage ? 'white' : 'transparent',
              color: isLoginPage ? 'var(--primary)' : 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              transition: 'all 0.3s',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              if (!isLoginPage) {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoginPage) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}>
              Login
            </Link>
            <Link to="/register" style={{
              backgroundColor: isRegisterPage ? 'white' : 'transparent',
              color: isRegisterPage ? 'var(--primary)' : 'white',
              textDecoration: 'none',
              padding: '0.5rem 1.5rem',
              borderRadius: '6px',
              fontWeight: '600',
              transition: 'all 0.3s',
              display: 'inline-block',
              border: isRegisterPage ? 'none' : '2px solid white'
            }}
            onMouseEnter={(e) => {
              if (!isRegisterPage) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRegisterPage) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
