import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { store } from "../App";
import './Home.css';

/**
 * Home - shows create/join room area link to rooms.
 */
export default function Home() {
  const [user] = useContext(store);

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Expense Splitter</h1>
      
      <div className="cards-container">
        <div className="home-card">
          <h3 className="card-title">🚀 Get Started</h3>
          {user !== "loggedin" ? (
            <p className="card-text">Please login or register to create or join a room and start managing your shared expenses.</p>
          ) : (
            <>
              <p className="card-text">Create or join a room to start tracking shared expenses with your friends and family.</p>
              <Link to="/rooms" className="home-link">
                <button className="home-button">
                  Go to Rooms
                </button>
              </Link>
            </>
          )}
        </div>

        <div className="home-card">
          <h3 className="card-title">ℹ️ How It Works</h3>
          <p className="card-text">
            <strong>Step 1:</strong> Setup room with members<br/>
            <strong>Step 2:</strong> Add expenses with flexible payment options<br/>
            <strong>Step 3:</strong> Preview final settlements and download PDF
          </p>
          <div className="feature-badge">
            Simple • Fair • Transparent
          </div>
        </div>
      </div>
    </div>
  );
}
