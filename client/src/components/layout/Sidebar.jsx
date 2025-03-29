import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  Heart, 
  Truck, 
  Users, 
  BarChart2, 
  Settings, 
  MessageSquare, 
  Info 
} from 'lucide-react';

const Sidebar = () => {
  const [location] = useLocation();
  
  const isActive = (path) => {
    return location === path;
  };
  
  const navItems = [
    { path: '/dashboard', icon: <Home className="w-5 h-5 mr-3" />, label: 'Dashboard' },
    { path: '/request', icon: <Heart className="w-5 h-5 mr-3" />, label: 'Request Aid' },
    { path: '/distribution', icon: <Truck className="w-5 h-5 mr-3" />, label: 'Distribution' },
    { path: '/beneficiaries', icon: <Users className="w-5 h-5 mr-3" />, label: 'Beneficiaries' },
    { path: '/analytics', icon: <BarChart2 className="w-5 h-5 mr-3" />, label: 'Reports & Analytics' },
    { path: '#', icon: <Settings className="w-5 h-5 mr-3" />, label: 'Settings' }
  ];
  
  const footerItems = [
    { path: '#', icon: <MessageSquare className="w-5 h-5 mr-3" />, label: 'Feedback' },
    { path: '#', icon: <Info className="w-5 h-5 mr-3" />, label: 'About Us' }
  ];

  return (
    <div className="w-full md:w-64 bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center mb-6">
        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="font-medium text-gray-900">HADS</h3>
        </div>
      </div>
      
      <nav className="space-y-1">
        {navItems.map((item, index) => (
          <Link 
            key={index} 
            to={item.path} 
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive(item.path) 
                ? 'bg-primary/10 text-primary' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto pt-8">
        {footerItems.map((item, index) => (
          <Link 
            key={index} 
            to={item.path} 
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
