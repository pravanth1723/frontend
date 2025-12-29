import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Snackbar from "./Snackbar";
import { BACKEND_URL } from "../config";
import "./UserAnalytics.css";

export default function UserAnalytics() {
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [spends, setSpends] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  const fetchAnalytics = async () => {
    if (!fromDate || !toDate) {
      setSnackbar({
        category: "error",
        message: "Please select both From and To dates",
      });
      return;
    }

    setIsLoading(true);
    try {
      const [incomeRes, spendsRes] = await Promise.all([
        axios.get(
          `${BACKEND_URL}/api/users/income/${fromDate}/${toDate}`,
          { withCredentials: true }
        ),
        axios.get(
          `${BACKEND_URL}/api/users/spends/${fromDate}/${toDate}`,
          { withCredentials: true }
        ),
      ]);

      // ✅ Income API returns SUM
      setTotalIncome(incomeRes.data.data.totalIncome || 0);

      // ✅ Spends API returns room-wise totals
      const spendData = spendsRes.data.data || [];

      const spendSum = spendData.reduce(
        (sum, room) => sum + Number(room.totalSpent || 0),
        0
      );

      setTotalSpent(spendSum);
      setSpends(spendData);

    } catch (error) {
      console.error(error);
      setSnackbar({
        category: "error",
        message: "Failed to fetch analytics for selected period",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <h3 className="analytics-title">📊 Spend Analytics</h3>
      </div>

      {/* Date Filter */}
      <div className="analytics-filter-card">
        <div className="filter-group">
          <label>From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="filter-group">
          <label>To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="form-input"
          />
        </div>

        <button
          className="submit-method-btn"
          onClick={fetchAnalytics}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Apply"}
        </button>
      </div>

      {/* Summary */}
      <div className="analytics-summary-grid">
        <div className="analytics-summary-card income">
          <h4>Total Income</h4>
          <p>₹ {totalIncome}</p>
        </div>

        <div className="analytics-summary-card spent">
          <h4>Total Spent</h4>
          <p>₹ {totalSpent}</p>
        </div>
      </div>

      {/* Spends Table */}
      <div className="analytics-table-card">
        <h4 className="analytics-section-title">
          💸 Room-wise Spends (Personal) ({spends.length} Rooms)
        </h4>

        {spends.length === 0 ? (
          <div className="analytics-empty">
            No spends found for selected period
          </div>
        ) : (
          <div className="analytics-table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Total Spent (₹)</th>
                </tr>
              </thead>
              <tbody>
                {spends.map((room) => (
                  <tr key={room.roomId}>
                    <td>
                      <span
                        className="room-link"
                        onClick={() => navigate(`/room/${room.roomId}/step3`)}
                      >
                        {room.roomName}
                      </span>
                    </td>
                    <td>₹ {room.totalSpent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
