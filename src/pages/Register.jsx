import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
/**
 * Register page
 */
export default function Register() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    
  axios.post('http://localhost:5000/api/users/register',{username, password}).then(
            response=>{
                // alert(response.status+1);
                if(response.status >= 200 && response.status < 300){
                    alert('Account created successfully');
                    window.location.reload();
                }
                else{
                    alert('some thing went wrong');
                }
            }
        ).catch(error=>
          console.log(error)
            //alert('Email already used please try with other email'),
        );
  }

  return (
    <div className="container-card" style={{ maxWidth: 480 }}>
      <h2 className="section-title">Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label className="small">Username</label>
          <input className="input" value={username} onChange={(e)=>setUsername(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label className="small">Password</label>
          <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label className="small">Confirm Password</label>
          <input className="input" type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
        </div>
        <div className="controls">
          <button className="btn" type="submit">Register</button>
          <Link to="/login"><button type="button" className="btn ghost">Back to Login</button></Link>
        </div>
      </form>
    </div>
  );
}
