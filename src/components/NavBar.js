// frontend/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ children, navItems }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  return (
    <nav className="fixed top-0 left-0 w-full bg-grey-700 text-white shadow-lg z-50 flex items-center justify-between px-8 py-3">
      <Link to="/" className="flex items-center">
        <img src="/sellerscore.png" alt="score logo" className="h-10 w-100 shadow" />
      </Link>
      <div className="flex items-center space-x-4">
        {navItems}
        {children}
        {isLoggedIn && (
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
