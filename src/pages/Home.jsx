import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { store } from "../App";

/**
 * Home - shows create/join room area link to rooms.
 */
export default function Home() {
  const [user] = useContext(store);

  return (
    <div className="container-card">
      <h2 className="section-title">Welcome</h2>
      <div className="row">
        <div className="col card">
          <h3 className="small">Get started</h3>
          {user !== "loggedin" ? (
            <p className="small">Please login or register to create or join a room.</p>
          ) : (
            <>
              <p className="small">Create or join a room to start tracking shared expenses.</p>
              <Link to="/rooms"><button className="btn">Go to Rooms</button></Link>
            </>
          )}
        </div>

        <div className="col card">
          <h3 className="small">About</h3>
          <p className="small">This app helps you split expenses in groups. Step 1: Setup room with members. Step 2: Add expenses with flexible payment options. Step 3: Preview final settlements and download PDF.</p>
        </div>
      </div>
    </div>
  );
}
