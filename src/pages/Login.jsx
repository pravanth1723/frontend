import React, { useContext, useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import {store} from '../App';
/**
 * Login page - uses localStorage 'users' for demo credentials.
 */
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [userstate, setUserState] = useContext(store);
  function handleSubmit(e) {
    e.preventDefault();
    axios.post('http://localhost:5000/api/users/login',{username, password},{ withCredentials: true }).then(
            
            response=>{
                if(response.status >= 200 && response.status < 300) {
                    setUserState("loggedin");
                    navigate('/rooms');
                }
            }
        ).catch(error=>
            alert('UnAuthorized Access Please check your email and password'),
        );
        
  }
  return (
    <div className="container-card" style={{ maxWidth: 480 }}>
      <h2 className="section-title">Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label className="small">Username</label>
          <input className="input" value={username} onChange={(e)=>setUsername(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label className="small">Password</label>
          <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <div className="controls">
          <button className="btn" type="submit">Login</button>
          <Link to="/register"><button type="button" className="btn ghost">Register</button></Link>
        </div>
      </form>
    </div>
  );
}
