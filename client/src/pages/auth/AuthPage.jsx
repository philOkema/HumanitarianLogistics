import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Loader2 } from "lucide-react";

export function AuthPage() {
  const { user, loading, isInitialized, error } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isInitialized && user) {
      console.log('AuthPage: User is authenticated, redirecting...');
      const storedPath = sessionStorage.getItem('redirectAfterLogin') || '/home';
      sessionStorage.removeItem('redirectAfterLogin');
      setLocation(storedPath);
    }
  }, [user, loading, isInitialized, setLocation]);

  if (loading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-500">Error: {error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to your account to continue
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
} 