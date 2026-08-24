import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar fade-in">
      <div className="navbar-brand">
        LastMile<span>.</span>
      </div>
      {user && (
        <div className="nav-links">
          <span>Welcome, <b>{user.name}</b> ({user.role})</span>
          <button className="btn btn-accent" onClick={logout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
