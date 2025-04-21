import React from 'react';
import { Link } from 'wouter';
import { useUser } from '../../context/UserContext';

const AuthLinks = () => {
  const { currentUser } = useUser();
  
  // Define available routes by role
  const roleRoutes = {
    admin: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/inventory', label: 'Inventory' },
      { path: '/distribution', label: 'Distribution' },
      { path: '/request', label: 'Aid Requests' },
      { path: '/beneficiaries', label: 'Beneficiaries' },
      { path: '/analytics', label: 'Analytics' },
      { path: '/volunteer', label: 'Volunteers' },
      { path: '/profile', label: 'Profile' },
      { path: '/feedback', label: 'Feedback' }
    ],
    staff: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/inventory', label: 'Inventory' },
      { path: '/distribution', label: 'Distribution' },
      { path: '/request', label: 'Aid Requests' },
      { path: '/beneficiaries', label: 'Beneficiaries' },
      { path: '/volunteer', label: 'Volunteers' },
      { path: '/profile', label: 'Profile' },
      { path: '/feedback', label: 'Feedback' }
    ],
    volunteer: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/inventory', label: 'Inventory' },
      { path: '/distribution', label: 'Distribution' },
      { path: '/volunteer', label: 'Volunteers' },
      { path: '/profile', label: 'Profile' },
      { path: '/feedback', label: 'Feedback' }
    ],
    donor: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/profile', label: 'Profile' },
      { path: '/feedback', label: 'Feedback' }
    ],
    beneficiary: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/request', label: 'Aid Requests' },
      { path: '/profile', label: 'Profile' },
      { path: '/feedback', label: 'Feedback' }
    ],
    guest: [
      { path: '/home', label: 'Home' },
      { path: '/profile', label: 'Profile' },
    ]
  };

  // Public routes available to all users
  const publicRoutes = [
    { path: '/', label: 'Landing Page' },
    { path: '/about', label: 'About' }
  ];

  // Get routes for the current user role
  const getRoutesForCurrentUser = () => {
    if (!currentUser) return publicRoutes;
    
    const userRole = currentUser.role || 'guest';
    const availableRoutes = roleRoutes[userRole] || roleRoutes.guest;
    
    return [...availableRoutes, ...publicRoutes];
  };

  const routes = getRoutesForCurrentUser();

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {routes.map((route) => (
        <Link 
          key={route.path} 
          href={route.path}
          className="block py-2 px-3 text-center bg-gray-200 hover:bg-gray-300 rounded text-gray-800 text-sm"
        >
          {route.label}
        </Link>
      ))}
    </div>
  );
};

export default AuthLinks;