import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  Users, 
  Package, 
  Truck, 
  BarChart2, 
  Settings, 
  MessageSquare, 
  Info,
  LogOut
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/hooks/use-auth';

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useUser();
  const { logout } = useAuth();

  const isActive = (path) => {
    return location === path;
  };

  const navItems = [
    { path: '/home', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { path: '/distribution', icon: <Truck className="w-5 h-5" />, label: 'Distribution' },
    { path: '/beneficiaries', icon: <Users className="w-5 h-5" />, label: 'Beneficiaries' },
    { path: '/analytics', icon: <BarChart2 className="w-5 h-5" />, label: 'Reports & Analytics' },
    { path: '/inventory', icon: <Package className="w-5 h-5" />, label: 'Inventory' },
    { path: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' }
  ];

  const footerItems = [
    { path: '/feedback', icon: <MessageSquare className="w-5 h-5" />, label: 'Feedback' },
    { path: '/about', icon: <Info className="w-5 h-5" />, label: 'About Us' }
  ];

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">HADS</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-100'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-1">
          {footerItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-100'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center px-4 py-2">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role || 'Guest'}
              </p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md mt-2"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
