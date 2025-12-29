import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import PaymentMethods from "../components/PaymentMethods";
import Income from "../components/Income";
import UserAnalytics from "../components/UserAnalytics";

import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAnalyticsPage = location.pathname.includes("/dashboard/analytics");

  return (
    <div className="room-container">
      {/* Show button ONLY on dashboard main page */}
      {!isAnalyticsPage && (
        <div style={{ marginBottom: "16px", textAlign: "right" }}>
          <button
            className="submit-method-btn"
            onClick={() => navigate("/dashboard/analytics")}
          >
            📊 View Analytics
          </button>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <>
              <PaymentMethods />
              <Income />
            </>
          }
        />

        <Route path="analytics" element={<UserAnalytics />} />
      </Routes>
    </div>
  );
};

export default Dashboard;
