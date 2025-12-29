import React, { createContext, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import RoomPage from "./pages/Room";
import RoomsPage from "./pages/Rooms";
import Dashboard from "./pages/dashboard";
import Spinner from "./components/Spinner";
import UserAnalytics from "./components/UserAnalytics";

import { BACKEND_URL } from "./config";

/**
 * App - top-level router with user state management
 */
export const store = createContext();

export default function App() {
  const [user, setUser] = useState("notloggedin");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/me`, {
        withCredentials: true
      });

      if (response.status === 200 && response.data.data) {
        // User is authenticated
        setUser("loggedin");
      } else {
        setUser("notloggedin");
      }
    } catch (error) {
      // Not authenticated or error occurred
      setUser("notloggedin");
    } finally {
      setIsCheckingAuth(false);
    }
  }

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spinner size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <store.Provider value={[user, setUser]}>
      <div className="app-root">
        <NavBar />
        <main className="app-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<Home />} />

            {/* Protected Routes - require authentication */}
            <Route
              path="/rooms"
              element={
                <ProtectedRoute>
                  <RoomsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/room/:roomId/*"
              element={
                <ProtectedRoute>
                  <RoomPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />


            <Route path="*" element={<Navigate to="/rooms" replace />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <small>Expense Splitting Application - Manage and track group expenses</small>
        </footer>
      </div>
    </store.Provider>
  );
}
