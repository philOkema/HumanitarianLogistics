import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log('Auth state changed:', user ? 'User logged in' : 'No user');
          setUser(user);
          setLoading(false);
          setIsInitialized(true);
        }, (error) => {
          console.error('Auth state change error:', error);
          setError(error);
          setLoading(false);
          setIsInitialized(true);
        });
      } catch (error) {
        console.error("Error initializing auth:", error);
        setError(error);
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value = {
    user,
    loading,
    isInitialized,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 