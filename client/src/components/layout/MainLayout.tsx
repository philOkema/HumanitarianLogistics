import React from 'react';
import { useUser, USER_ROLES } from '../../context/UserContext';
import { useRoleFeatures } from '../../hooks/useRoleFeatures';
import { Link } from 'wouter';
import { useLocation } from 'wouter';
import { 
  Home, 
  LayoutDashboard, 
  Package, 
  Gift, 
  Users, 
  User, 
  Settings,
  BarChart2,
  Truck,
  MessageSquare,
  LogOut,
  MapPin,
  Navigation
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const { logout } = useAuth();
  const [location] = useLocation();
  const { 
    canManageInventory, 
    canManageDonations, 
    canRequestAid, 
    canViewAnalytics,
    canManageDistributions,
    canViewSettings 
  } = useRoleFeatures();

  // Skip layout for public and auth pages
  if (location === '/' || location === '/about' || location.startsWith('/auth') || location.startsWith('/login') || location.startsWith('/register')) {
    return <>{children}</>;
  }

  // If no user, don't show the layout
  if (!user) {
    return <>{children}</>;
  }

  const navigationItems = [
    { path: '/home', label: 'Home', icon: <Home className="w-5 h-5" />, roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.DONOR, USER_ROLES.BENEFICIARY, USER_ROLES.VOLUNTEER, USER_ROLES.GUEST] },
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.BENEFICIARY, USER_ROLES.DONOR, USER_ROLES.VOLUNTEER] },
    { path: '/inventory', label: 'Inventory', icon: <Package className="w-5 h-5" />, roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.VOLUNTEER] },
    { path: '/donations', label: 'Donations', icon: <Gift className="w-5 h-5" />, roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.DONOR] },
    { path: '/distribution', label: 'Distribution', icon: <Truck className="w-5 h-5" />, roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.VOLUNTEER] },
    { path: '/beneficiaries', label: 'Beneficiaries', icon: <Users className="w-5 h-5" />, roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.BENEFICIARY] },
    { path: '/request', label: 'Aid Requests', icon: <MessageSquare className="w-5 h-5" />, roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.BENEFICIARY] },
    { path: '/analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" />, roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF] },
    { path: '/feedback', label: 'Feedback', icon: <MessageSquare className="w-5 h-5" />, roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.DONOR, USER_ROLES.BENEFICIARY, USER_ROLES.VOLUNTEER, USER_ROLES.GUEST] },
    { path: '/profile', label: 'Profile', icon: <User className="w-5 h-5" />, roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.DONOR, USER_ROLES.BENEFICIARY, USER_ROLES.VOLUNTEER] },
    { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, roles: [USER_ROLES.ADMIN] },
    { path: '/staff/location', label: 'Location Tracking', icon: <MapPin className="w-5 h-5" />, roles: [USER_ROLES.STAFF, USER_ROLES.VOLUNTEER] },
    { path: '/delivery/123/track', label: 'Track Delivery', icon: <Navigation className="w-5 h-5" />, roles: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.BENEFICIARY, USER_ROLES.VOLUNTEER] },
  ];

  // Debug logs for role-based navigation
  console.log('=== Navigation Debug ===');
  console.log('Current user:', user);
  console.log('Current user role:', user.role);
  console.log('USER_ROLES:', USER_ROLES);
  
  const visibleItems = navigationItems.filter(item => {
    const hasRole = item.roles.includes(user.role);
    console.log(`Checking "${item.label}" (${item.path}):`);
    console.log('- Required roles:', item.roles);
    console.log('- User role:', user.role);
    console.log('- Has access:', hasRole);
    return hasRole;
  });

  console.log('=== Final Navigation Items ===');
  console.log('Visible items for role:', user.role);
  visibleItems.forEach(item => {
    console.log(`- ${item.label} (${item.path})`);
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">HADS</h1>
          <p className="text-sm text-gray-500 capitalize">{user.role}</p>
        </div>
        <nav className="mt-4">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                location === item.path ? 'bg-gray-100 dark:bg-gray-700 border-r-4 border-primary' : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 mt-4"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout; 