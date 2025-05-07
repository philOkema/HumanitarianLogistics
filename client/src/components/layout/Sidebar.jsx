import React, { useEffect, useState } from 'react';
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
  LogOut,
  LayoutDashboard,
  Shield,
  Menu,
  X,
  MapPin,
  Navigation
} from 'lucide-react';
import { useUser, USER_ROLES } from '@/context/UserContext';
import { useAuth } from '@/hooks/use-auth';
import { useRoleFeatures } from '@/hooks/useRoleFeatures';
import { useIsMobile } from '@/hooks/use-mobile';

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useUser();
  const { logout } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const { 
    canManageInventory,
    canManageDistributions,
    canRequestAid,
    canViewAnalytics,
    canViewSettings
  } = useRoleFeatures();

  // Debug logging
  useEffect(() => {
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    console.log('USER_ROLES.VOLUNTEER:', USER_ROLES.VOLUNTEER);
    console.log('Is volunteer?', user?.role === USER_ROLES.VOLUNTEER);
  }, [user]);

  // Update sidebar state when screen size changes
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const isActive = (path) => {
    return location === path;
  };

  // Define navigation items with strict role alignment
  const navItems = [
    { 
      path: '/home', 
      icon: <Home className="w-5 h-5" />, 
      label: 'Home',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.DONOR, USER_ROLES.BENEFICIARY, USER_ROLES.VOLUNTEER, USER_ROLES.GUEST]
    },
    { 
      path: '/dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: 'Dashboard',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.DONOR, USER_ROLES.BENEFICIARY, USER_ROLES.VOLUNTEER]
    },
    { 
      path: '/admin-dashboard', 
      icon: <Shield className="w-5 h-5" />, 
      label: 'Admin Dashboard',
      roles: [USER_ROLES.ADMIN]
    },
    { 
      path: '/distribution', 
      icon: <Truck className="w-5 h-5" />, 
      label: 'Distribution',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.VOLUNTEER],
      permission: canManageDistributions
    },
    { 
      path: '/beneficiaries', 
      icon: <Users className="w-5 h-5" />, 
      label: 'Beneficiaries',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF]
    },
    { 
      path: '/analytics', 
      icon: <BarChart2 className="w-5 h-5" />, 
      label: 'Reports & Analytics',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF],
      permission: canViewAnalytics
    },
    { 
      path: '/inventory', 
      icon: <Package className="w-5 h-5" />, 
      label: 'Inventory',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.VOLUNTEER],
      permission: canManageInventory
    },
    { 
      path: '/staff/location', 
      icon: <MapPin className="w-5 h-5" />, 
      label: 'Location Tracking',
      roles: [USER_ROLES.STAFF, USER_ROLES.VOLUNTEER]
    },
    { 
      path: '/delivery/123/track', 
      icon: <Navigation className="w-5 h-5" />, 
      label: 'Track Delivery',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.BENEFICIARY, USER_ROLES.VOLUNTEER]
    },
    { 
      path: '/settings', 
      icon: <Settings className="w-5 h-5" />, 
      label: 'Settings',
      roles: [USER_ROLES.ADMIN],
      permission: canViewSettings
    }
  ];

  const footerItems = [
    { 
      path: '/feedback', 
      icon: <MessageSquare className="w-5 h-5" />, 
      label: 'Feedback',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.DONOR, USER_ROLES.BENEFICIARY, USER_ROLES.VOLUNTEER, USER_ROLES.GUEST]
    },
    { 
      path: '/about', 
      icon: <Info className="w-5 h-5" />, 
      label: 'About Us',
      roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.DONOR, USER_ROLES.BENEFICIARY, USER_ROLES.VOLUNTEER, USER_ROLES.GUEST]
    }
  ];

  // Filter navigation items based on user role and permissions
  const visibleNavItems = navItems.filter(item => {
    const userRole = user?.role || USER_ROLES.GUEST;
    const hasRole = item.roles.includes(userRole);
    const hasPermission = !item.permission || item.permission;
    
    // Debug logging for dashboard item
    if (item.path === '/dashboard') {
      console.log('Dashboard item:', item);
      console.log('User role:', userRole);
      console.log('Has role?', hasRole);
      console.log('Has permission?', hasPermission);
    }
    
    return hasRole && hasPermission;
  });

  // Filter footer items based on user role
  const visibleFooterItems = footerItems.filter(item => {
    const userRole = user?.role || USER_ROLES.GUEST;
    return item.roles.includes(userRole);
  });

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700 px-4">
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">HADS</h1>
        </div>
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 absolute right-4"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {visibleNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
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
          {visibleFooterItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
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
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-800 shadow-md"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-40 transform ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
              } transition-transform duration-300 ease-in-out`
            : 'relative'
        } flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
      >
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
