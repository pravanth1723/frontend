import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { store } from "../App";

/**
 * ProtectedRoute - Wrapper component that redirects unauthenticated users to login
 */
export default function ProtectedRoute({ children }) {
  const [user] = useContext(store);
  
  if (user === "notloggedin") {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
