import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { store } from './App';
import './Nav.css';
const Nav = () => {
    const [token, setToken] = useContext(store);
    return (
        <div>
            {!token &&
            <ul id='ulid'>
                <NavLink to='/register'>
                    <li>
                        Register
                    </li>
                </NavLink>
                <NavLink to='/login'>
                    <li>
                        Login
                    </li>
                </NavLink>
            </ul>
}

        </div>
    );
}

export default Nav;
