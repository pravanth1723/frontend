import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Home - shows create/join room area link to rooms.
 * For demo, Rooms are ephemeral until you go into a /room/:id path.
 */
export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container-card">
      <h2 className="section-title">Welcome</h2>
      <div className="row">
        <div className="col card">
          <h3 className="small">Get started</h3>
          {!user ? (
            <p className="small">Please login or register to create or join a room.</p>
          ) : (
            <>
              <p className="small">Create a local room (ephemeral) or join using an id. Room state is kept in-memory during the session.</p>
              <Link to="/rooms"><button className="btn">Go to Rooms</button></Link>
            </>
          )}
        </div>

        <div className="col card">
          <h3 className="small">About</h3>
          <p className="small">This UI follows the flow from your HTML: Step 1 (Setup Group), Step 2 (Add Expenses), Step 3 (Preview & Download). You can edit expenses and navigate across steps.</p>
        </div>
      </div>
    </div>
  );
}