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
      <h1 className="home-title">Welcome to My Money Buddy</h1>
      
      <div className="cards-container">
        <div className="home-card">
          <h3 className="card-title">Get Started</h3>
          {user !== "loggedin" ? (
            <p className="card-text">Please login or register to create or join a room and start managing your shared expenses.</p>
          ) : (
            <>
              <p className="card-text">Create or join a room to start tracking personal and shared expenses with your friends and family.</p>
              <Link to="/rooms" className="home-link">
                <button className="home-button">
                  Go to Rooms
                </button>
              </Link>
            </>
          )}
        </div>

        <div className="home-card">
          <h3 className="card-title">How It Works??</h3>
          <p className="card-text">
           <h3> Add your Income and Expenses to track and analyze</h3>
            <strong>Step 1:</strong> Setup personal rooms for personal expenses and shared rooms for group expenses<br/>
            <strong>Step 2:</strong> Add expenses with flexible payment options<br/>
            <strong>Step 3:</strong> Preview final settlement in various styles and download your report
          
          </p>
          <div className="feature-badge">
            Simple • Fair • Transparent
          </div>
        </div>
      </div>
    </div>
  );
}
