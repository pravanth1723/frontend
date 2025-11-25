import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const s = localStorage.getItem("session:user");
    if (s) setUser(s);
  }, []);

  function login(username) {
    setUser(username);
    localStorage.setItem("session:user", username);
    navigate("/", { replace: true });
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("session:user");
    navigate("/login", { replace: true });
  }

  function register(username, password) {
    // store minimal user in localStorage for demo
    const raw = localStorage.getItem("users");
    const users = raw ? JSON.parse(raw) : [];
    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
    login(username);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}