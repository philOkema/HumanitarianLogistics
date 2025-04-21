import React, { useState, useEffect, useCallback } from 'react';
import { Redirect, useLocation } from 'wouter';
import { useUser, USER_ROLES } from '../../context/UserContext';
import { useAuth } from '../../hooks/use-auth';
import { Loader2 } from 'lucide-react';

// Component to protect routes based on authentication
export const ProtectedRoute = ({ component: Component, requiredPermission, ...rest }) => {
  const { user, hasPermission, loading } = useUser();
  const [location] = useLocation();

  // Store the current URL as the redirect destination after login
  useEffect(() => {
    if (!user && !loading) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/auth' && currentPath !== '/login' && currentPath !== '/register') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
    }
  }, [user, loading]);

  if (loading) {
    // Show loading state while checking authentication
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    return <Redirect to="/login" />;
  }

  // If permission check is required and user doesn't have permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Store the attempted URL for the "Go Back" functionality
    sessionStorage.setItem('unauthorizedFrom', window.location.pathname);
    return <Redirect to="/unauthorized" />;
  }

  // Render the component if authorized
  return <Component {...rest} />;
};

// Component to restrict routes based on roles
export const RoleBasedRoute = ({ component: Component, requiredRoles, ...rest }) => {
  const { user, loading } = useUser();
  const [location] = useLocation();

  // Store the current URL as the redirect destination after login
  useEffect(() => {
    if (!user && !loading) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/auth' && currentPath !== '/login' && currentPath !== '/register') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
    }
  }, [user, loading]);

  if (loading) {
    // Show loading state while checking authentication
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    return <Redirect to="/login" />;
  }

  // If roles are specified and user doesn't have required role, show unauthorized
  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    // Store the attempted URL for the "Go Back" functionality
    sessionStorage.setItem('unauthorizedFrom', window.location.pathname);
    return <Redirect to="/unauthorized" />;
  }

  // Render the component if authorized
  return <Component {...rest} />;
};

export const UnauthenticatedRoute = ({ component: Component, ...rest }) => {
  const { user, loading } = useUser();
  const [location] = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  console.log('UnauthenticatedRoute:', { user, loading, location });

  useEffect(() => {
    if (loading) {
      setIsLoading(true);
      return;
    }
    setIsLoading(false);

    if (user && !shouldRedirect) {
      console.log('UnauthenticatedRoute: User is authenticated, setting redirect');
      // Allow the auth page to handle the logout flow
      if (location === '/login' || location === '/register') {
        console.log('UnauthenticatedRoute: Allowing access to auth pages even when authenticated');
        return;
      }
      
      const storedRedirectPath = sessionStorage.getItem('redirectAfterLogin') || '/home';
      sessionStorage.removeItem('redirectAfterLogin');
      setRedirectPath(storedRedirectPath);
      setShouldRedirect(true);
    }
  }, [user, loading, location, shouldRedirect]);

  if (isLoading) {
    console.log('UnauthenticatedRoute: Loading state');
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (location === '/auth') {
    console.log('UnauthenticatedRoute: Redirecting from /auth to /login');
    return <Redirect to="/login" />;
  }

  if (shouldRedirect) {
    console.log('UnauthenticatedRoute: Redirecting to', redirectPath);
    return <Redirect to={redirectPath} />;
  }

  console.log('UnauthenticatedRoute: Rendering component for unauthenticated user');
  return <Component {...rest} />;
};

export default RoleBasedRoute;