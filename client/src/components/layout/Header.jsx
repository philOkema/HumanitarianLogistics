import React from 'react';
import { Link, useLocation } from 'wouter';

const Header = () => {
  const [location] = useLocation();
  
  const isActive = (path) => {
    return location === path;
  };
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/distribution', label: 'Distribution' },
    { path: '/request', label: 'Requests' },
    { path: '/inventory', label: 'Inventory' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">HADS</h1>
          <div className="flex items-center space-x-6">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={isActive(item.path) ? "text-primary font-medium text-sm" : "text-gray-700 hover:text-primary text-sm font-medium"}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/profile">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
