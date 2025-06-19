import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto border-t border-gray-800 shadow-inner">
      <div className="flex flex-col items-center justify-center space-y-3">
        <p className="text-base font-medium tracking-wide">&copy; {currentYear} Sellerscore. All rights reserved.</p>
        <div className="flex space-x-4 mt-2">
          <a href="#" className="hover:text-blue-400 transition">Privacy Policy</a>
          <a href="#" className="hover:text-blue-400 transition">Terms of Service</a>
          <a href="#" className="hover:text-blue-400 transition">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 