import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from "react";
import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { firebaseApp } from "@/lib/firebase";
import axios from 'axios';

export type UserRole = 'admin' | 'staff' | 'donor' | 'beneficiary' | 'volunteer';
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  DONOR: 'donor',
  BENEFICIARY: 'beneficiary',
  VOLUNTEER: 'volunteer'
} as const;

// Roles that users can self-assign during registration
export const SELF_ASSIGNABLE_ROLES = ['donor', 'beneficiary', 'volunteer'] as const;

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: Error | null;
  isInitialized: boolean;
  loginMutation: UseMutationResult<FirebaseUser, Error, LoginCredentials>;
  registerMutation: UseMutationResult<FirebaseUser, Error, RegisterData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  hasRole: (role: UserRole) => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const auth = useMemo(() => getAuth(firebaseApp), []);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const authListenerRef = useRef<(() => void) | null>(null);

  // Check for persisted auth state on mount
  useEffect(() => {
    const checkPersistedAuth = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          // If we have a persisted user, wait for token refresh
          await currentUser.getIdToken(true);
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error checking persisted auth:', err);
      } finally {
        setIsFirstLoad(false);
      }
    };

    checkPersistedAuth();
  }, [auth]);

  useEffect(() => {
    // Prevent multiple listener setups
    if (authListenerRef.current) {
      return;
    }

    console.log('AuthProvider: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        // Only update if the user state has actually changed
        if (currentUser?.uid !== user?.uid) {
          console.log('AuthProvider: Auth state changed:', { currentUser });
          
          // If we have a user, ensure we have their role
          if (currentUser) {
            // Add a small delay to ensure all auth state is properly initialized
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          setUser(currentUser);
        }
        
        setLoading(false);
        setIsInitialized(true);
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err instanceof Error ? err : new Error('Auth state change failed'));
        setLoading(false);
        setIsInitialized(true);
      }
    }, (err) => {
      console.error('Auth state listener error:', err);
      setError(err);
      setLoading(false);
      setIsInitialized(true);
    });

    authListenerRef.current = unsubscribe;

    return () => {
      if (authListenerRef.current) {
        console.log('AuthProvider: Cleaning up auth state listener');
        authListenerRef.current();
        authListenerRef.current = null;
      }
    };
  }, [auth, user?.uid]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      try {
        console.log('Attempting login with email:', email);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful:', userCredential.user);
        return userCredential.user;
      } catch (error) {
        console.error('Login error:', error);
        if (error instanceof Error) {
          if (error.message.includes('auth/invalid-login-credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          }
          if (error.message.includes('auth/user-not-found')) {
            throw new Error('No account found with this email. Please register first.');
          }
          if (error.message.includes('auth/wrong-password')) {
            throw new Error('Incorrect password. Please try again.');
          }
        }
        throw new Error(error instanceof Error ? error.message : "Login failed");
      }
    },
    onSuccess: (user) => {
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.email}!`,
      });
      // Add a small delay before redirecting to ensure auth state is properly set
      setTimeout(() => {
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/home';
        sessionStorage.removeItem('redirectAfterLogin');
        setLocation(redirectPath);
      }, 100);
    },
    onError: (error: Error) => {
      setError(error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ email, password, name, role }: RegisterData) => {
      try {
        // Validate role
        if (!SELF_ASSIGNABLE_ROLES.includes(role as typeof SELF_ASSIGNABLE_ROLES[number])) {
          throw new Error('Invalid role selected. Please choose a valid role.');
        }

        console.log('Attempting registration with email:', email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Registration successful:', userCredential.user);
        
        // Update Firebase Auth profile
        await updateProfile(userCredential.user, {
          displayName: `${name}:${role}`,
        });
        console.log('Profile updated successfully');

        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          name,
          role,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          permissions: getDefaultPermissions(role)
        });
        console.log('Firestore document created successfully');
        
        return userCredential.user;
      } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof Error) {
          if (error.message.includes('auth/email-already-in-use')) {
            throw new Error('An account with this email already exists. Please login instead.');
          }
          if (error.message.includes('auth/weak-password')) {
            throw new Error('Password is too weak. Please use a stronger password.');
          }
        }
        throw new Error(error instanceof Error ? error.message : "Registration failed");
      }
    },
    onSuccess: (user) => {
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/home';
      sessionStorage.removeItem('redirectAfterLogin');
      setLocation(redirectPath);
    },
    onError: (error: Error) => {
      setError(error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await firebaseSignOut(auth);
        setUser(null);
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Logout failed");
      }
    },
    onSuccess: () => {
      toast({
        title: "Logout successful",
        description: "You have been logged out.",
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const hasRole = useCallback((role: UserRole): boolean => {
    if (!user?.displayName) return false;
    const [, userRole] = user.displayName.split(':');
    return userRole === role;
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  }, [loginMutation]);

  const register = useCallback(async (email: string, password: string, role: UserRole) => {
    await registerMutation.mutateAsync({ email, password, name: '', role });
  }, [registerMutation]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const value = useMemo(() => ({
    user,
    loading: loading || isFirstLoad,
    error,
    isInitialized,
    loginMutation,
    registerMutation,
    logoutMutation,
    hasRole,
    login,
    register,
    logout,
  }), [
    user,
    loading,
    isFirstLoad,
    error,
    isInitialized,
    loginMutation,
    registerMutation,
    logoutMutation,
    hasRole,
    login,
    register,
    logout,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper function to get default permissions based on role
function getDefaultPermissions(role: UserRole): string[] {
  switch (role) {
    case 'admin':
      return ['*']; // Admin has all permissions
    case 'staff':
      return ['read', 'write', 'manage_inventory', 'manage_distributions'];
    case 'donor':
      return ['read', 'create_donation', 'view_donations'];
    case 'volunteer':
      return ['read', 'create_distribution', 'view_distributions', 'manage_distributions'];
    case 'beneficiary':
      return ['read', 'view_aid_requests', 'create_aid_request'];
    default:
      return ['read'];
  }
}

// Set up axios interceptor for auth token
axios.interceptors.request.use(async (config) => {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}); 