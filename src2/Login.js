import React,{useState,useContext} from 'react';
import axios from 'axios';
import { Navigate}  from 'react-router-dom';
import{store} from './App';
const Login = () => {
    const [token,setToken]=useContext(store);
    const [data,setData]=useState({
        email:'',
        password:''
    });
    const changeHandler=e=>{
        setData({...data,[e.target.name]:e.target.value});
    }
    const submitHandler=e=>{
        e.preventDefault();//https://dpcontactmanager.onrender.com
        axios.post('https://dpcontactmanager.onrender.com/api/users/login',data).then(
            
            response=>{
                if(response.status >= 200 && response.status < 300)
                    setToken(response.data.accessToken);
            }
        ).catch(error=>
            alert('UnAuthorized Access Please check your email and password'),
        );
        
    }
    if(token){
      return  <Navigate to='/myprofile'/>;

        // </redirect>
    }
    return (
        <div>
            <form onSubmit={submitHandler}>
                <h3>Login</h3>
                {/* <input type="text" onChange={changeHandler} name='username' placeholder='username'/> */}
                <input type="email" onChange={changeHandler} name='email'placeholder='useremail'/>
                <input type="password" onChange={changeHandler} name='password'placeholder='password'/>
                {/* <input type="password" onChange={changeHandler} name='confimpassword'placeholder='confirmpassword'/> */}
                <input type='submit' value='Login'/>
            </form>
        </div>
    );
}

export default Login;
