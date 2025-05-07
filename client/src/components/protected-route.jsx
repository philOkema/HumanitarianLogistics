import { useAuth } from "@/hooks/use-auth";
import { Redirect, Route } from "wouter";
import { Loader2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

// ProtectedRoute component that requires authentication
export function ProtectedRoute({ path, component: Component, roles = [] }) {
  const { user, loading, isInitialized } = useAuth();
  const [showContent, setShowContent] = useState(false);

  // Memoize the role check to prevent unnecessary re-renders
  const hasRequiredRole = useMemo(() => {
    if (!user || !user.displayName) return false;
    const [, userRole] = user.displayName.split(':');
    return roles.length === 0 || roles.includes(userRole);
  }, [user, roles]);

  // Add a small delay before showing content to prevent flickering
  useEffect(() => {
    if (!loading && isInitialized) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, isInitialized]);

  // Show loading spinner while checking authentication
  if (loading || !isInitialized) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </Route>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    // Store the current path for redirect after login
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    }
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If roles are specified and user doesn't have required role, show unauthorized
  if (!hasRequiredRole) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
          <h1 className="text-2xl font-bold mb-4 text-white">Unauthorized</h1>
          <p className="text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
      </Route>
    );
  }

  // Otherwise, render the protected component with fade-in effect
  return (
    <Route path={path}>
      <div className={`transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <Component />
      </div>
    </Route>
  );
}