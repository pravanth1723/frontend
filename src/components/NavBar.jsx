import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { store } from "../App";
import axios from "axios";
import { BACKEND_URL } from "../config";
import './NavBar.css';

export default function NavBar() {
  const [user, setUser] = useContext(store);
  const navigate = useNavigate();
  const location = useLocation();

  async function logout() {
    try {
      // Call backend logout endpoint to clear session
      await axios.post(`${BACKEND_URL}/api/users/logout`, {}, { 
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
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-brand">
          💰 SplitWise
        </Link>
      </div>

      <div className="nav-right">
        {user === "loggedin" ? (
          <>
            <Link 
              to="/rooms" 
              className={`nav-item nav-link ${location.pathname.includes('/room') ? 'active' : ''}`}
            >
              My Rooms
            </Link>
            <button 
              className="nav-item nav-button" 
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className={`nav-item nav-link ${isLoginPage ? 'active' : ''}`}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className={`nav-item nav-button ${isRegisterPage ? 'active' : ''}`}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
