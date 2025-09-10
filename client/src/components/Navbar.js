import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useWallet } from './WalletContext';

function Navbar() {
  const { accountName, isAdmin, isLoading } = useWallet();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/">Blockchain Land Registry</Link>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><NavLink className="nav-link" to="/">Home</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/manage-land">Manage Land</NavLink></li>
            {isAdmin && <li className="nav-item"><NavLink className="nav-link" to="/admin">Admin</NavLink></li>}
          </ul>
          <span className="navbar-text">
            {isLoading ? 'Connecting...' : (accountName || 'Not Connected')}
          </span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;