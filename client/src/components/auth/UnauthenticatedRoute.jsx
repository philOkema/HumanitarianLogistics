import { useAuth } from "@/hooks/use-auth";
import { Redirect, Route } from "wouter";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export function UnauthenticatedRoute({ path, component: Component, ...rest }) {
  const { user, loading, isInitialized } = useAuth();

  // Memoize the auth state to prevent unnecessary re-renders
  const authState = useMemo(() => ({
    isAuthenticated: !!user,
    isLoading: loading || !isInitialized
  }), [user, loading, isInitialized]);

  // Show loading spinner while checking authentication
  if (authState.isLoading) {
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

  // If authenticated, redirect to home or stored path
  if (authState.isAuthenticated) {
    const storedPath = sessionStorage.getItem('redirectAfterLogin') || '/home';
    sessionStorage.removeItem('redirectAfterLogin');
    return (
      <Route path={path}>
        <Redirect to={storedPath} />
      </Route>
    );
  }

  // Otherwise, render the unauthenticated component
  return (
    <Route path={path}>
      <Component {...rest} />
    </Route>
  );
} 