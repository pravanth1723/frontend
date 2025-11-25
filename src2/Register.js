import React,{useState} from 'react';
import axios from 'axios';
import './Register.css';
const Register = () => {
    const [data,setData]=useState({
        username:'',
        email:'',
        password:'',
        confirmpassword:'',
    });
    const changeHandler=e=>{
        setData({...data,[e.target.name]:e.target.value});
    }
    const submitHandler=e=>{
        e.preventDefault();
        if(data.password!==data.confirmpassword){
            alert('Password and confirm password doesnt match');
            return;
        }
        axios.post('https://dpcontactmanager.onrender.com/api/users/register',data).then(
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
            alert('Email already used please try with other email'),
        );
    }
    return (
        <div>
            <form onSubmit={submitHandler}>
                <h3>Registration</h3>
                <input type="text" onChange={changeHandler} name='username' placeholder='username'/>
                <input type="email" onChange={changeHandler} name='email'placeholder='useremail'/>
                <input type="password" onChange={changeHandler} name='password'placeholder='password'/>
                <input type="password" onChange={changeHandler} name='confirmpassword'placeholder='confirmpassword'/>
                <input type='submit' value='Register'/>
            </form>
        </div>
    );
}

export default Register;
