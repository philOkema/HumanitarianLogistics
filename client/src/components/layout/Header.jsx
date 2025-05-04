import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useUser, USER_ROLES } from '@/context/UserContext';
import { useAuth } from '@/hooks/use-auth';
import { useRoleFeatures } from '@/hooks/useRoleFeatures';

const Header = () => {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const { user } = useUser();
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const { 
    canManageInventory,
    canManageDistributions,
    canRequestAid,
    canViewAnalytics,
    canViewSettings
  } = useRoleFeatures();
  
  // Debug logging
  useEffect(() => {
    console.log('Header - Current user:', user);
    console.log('Header - User role:', user?.role);
    console.log('Header - USER_ROLES.VOLUNTEER:', USER_ROLES.VOLUNTEER);
    console.log('Header - Is volunteer?', user?.role === USER_ROLES.VOLUNTEER);
  }, [user]);
  
  const isActive = (path) => {
    return location === path;
  };
  
  // Define navigation items with strict role alignment
  const navItems = [
    { 
      path: '/home', 
      label: 'Home', 
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.DONOR, USER_ROLES.BENEFICIARY, USER_ROLES.VOLUNTEER, USER_ROLES.GUEST] 
    },
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.DONOR, USER_ROLES.BENEFICIARY, USER_ROLES.VOLUNTEER] 
    },
    { 
      path: '/admin-dashboard', 
      label: 'Admin Dashboard', 
      roles: [USER_ROLES.ADMIN] 
    },
    { 
      path: '/distribution', 
      label: 'Distribution', 
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.VOLUNTEER], 
      permission: canManageDistributions 
    },
    { 
      path: '/deliveries', 
      label: 'My Deliveries', 
      roles: [USER_ROLES.VOLUNTEER]
    },
    { 
      path: '/request', 
      label: 'Requests', 
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.BENEFICIARY], 
      permission: canRequestAid 
    },
    { 
      path: '/inventory', 
      label: 'Inventory', 
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.VOLUNTEER], 
      permission: canManageInventory 
    },
    { 
      path: '/analytics', 
      label: 'Analytics', 
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF], 
      permission: canViewAnalytics 
    }
  ];
  
  // Desktop click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Mobile click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileDropdownOpen && mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setMobileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileDropdownOpen]);
  
  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
  };
  
  // Get initials from name or username or email
  const getInitials = (name) => {
    if (!name) return '?';
    
    // Handle case where name is a string that can be split
    try {
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
    } catch (e) {
      // If splitting fails, just take the first character
      return name.charAt(0).toUpperCase();
    }
  };

  // Filter navigation items based on user role and permissions
  const visibleNavItems = navItems.filter(item => {
    const userRole = user?.role || USER_ROLES.GUEST;
    const hasRole = item.roles.includes(userRole);
    const hasPermission = !item.permission || item.permission;
    
    // Debug logging for dashboard item
    if (item.path === '/dashboard') {
      console.log('Header - Dashboard item:', item);
      console.log('Header - User role:', userRole);
      console.log('Header - Has role?', hasRole);
      console.log('Header - Has permission?', hasPermission);
    }
    
    return hasRole && hasPermission;
  });
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-1 flex justify-center">
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-4 lg:space-x-8">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                    isActive(item.path)
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Desktop user icon and dropdown */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative" ref={desktopDropdownRef}>
              <div>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    {getInitials(user?.name || user?.email || '')}
                  </div>
                </button>
              </div>
              {dropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setTimeout(() => setDropdownOpen(false), 100)}
                  >
                    Your Profile
                  </Link>
                  {canViewSettings && (
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setTimeout(() => setDropdownOpen(false), 100)}
                    >
                      Settings
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile user icon and dropdown */}
          <div className="flex items-center sm:hidden">
            <div className="relative" ref={mobileDropdownRef}>
              <button
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  {getInitials(user?.name || user?.email || '')}
                </div>
              </button>
              {mobileDropdownOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <button
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    onClick={() => {
                      navigate('/profile');
                      setMobileDropdownOpen(false);
                    }}
                  >
                    Your Profile
                  </button>
                  {canViewSettings && (
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                      onClick={() => {
                        navigate('/settings');
                        setMobileDropdownOpen(false);
                      }}
                    >
                      Settings
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
