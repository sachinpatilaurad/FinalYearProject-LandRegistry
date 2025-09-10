import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer bg-dark text-white mt-auto py-3">
      <div className="container text-center">
        <p>&copy; {new Date().getFullYear()} Blockchain Land Registry. All Rights Reserved.</p>
        <div className="d-flex justify-content-center">
            <Link to="/about" className="text-white mx-2">About</Link>
            <Link to="/features" className="text-white mx-2">Features</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;