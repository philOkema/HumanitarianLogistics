import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/use-auth';
import { updateProfile as firebaseUpdateProfile } from 'firebase/auth';

export type UserRole = 'admin' | 'staff' | 'donor' | 'beneficiary' | 'volunteer' | 'guest';
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  DONOR: 'donor',
  BENEFICIARY: 'beneficiary',
  VOLUNTEER: 'volunteer',
  GUEST: 'guest'
} as const;

export interface User extends FirebaseUser {
  role: UserRole;
  createdAt: Date;
  lastLogin: Date;
  permissions?: string[];
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; message: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, loading: authLoading, error: authError, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Reset error when auth state changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    } else {
      setError(null);
    }
  }, [authError]);

  // Fetch user data from Firestore when auth state changes
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      if (authLoading) return;

      if (!authUser) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        // Get user document from Firestore
        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
        
        if (!isMounted) return;

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userWithRole: User = {
            ...authUser,
            role: userData.role || 'donor', // Default to donor if no role specified
            createdAt: userData.createdAt?.toDate() || new Date(),
            lastLogin: userData.lastLogin?.toDate() || new Date(),
            permissions: userData.permissions || getDefaultPermissions(userData.role || 'donor')
          };
          setUser(userWithRole);
          setError(null);
        } else {
          console.error('User document not found in Firestore');
          setError(new Error('User data not found'));
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [authUser, authLoading]);

  const hasRole = useMemo(() => (role: UserRole): boolean => {
    return user?.role === role;
  }, [user]);

  const hasPermission = useMemo(() => (permission: string): boolean => {
    if (!user) return false;
    
    // Check if user has explicit permission
    if (user.permissions?.includes(permission)) return true;
    if (user.permissions?.includes('*')) return true; // Admin has all permissions
    
    // Check role-based permissions
    switch (user.role) {
      case 'admin':
        return true; // Admin has all permissions
      case 'staff':
        return ['read', 'write', 'manage_inventory', 'manage_distributions', 'create_aid_request', 'view_aid_requests'].includes(permission);
      case 'donor':
        return ['read', 'create_donation', 'view_donations'].includes(permission);
      case 'volunteer':
        return ['read', 'create_distribution', 'view_distributions', 'manage_distributions'].includes(permission);
      case 'beneficiary':
        return ['read', 'view_aid_requests', 'create_aid_request'].includes(permission);
      default:
        return ['read'].includes(permission); // Guest users only have read permission
    }
  }, [user]);

  // Add updateProfile function
  const updateProfile = async (profileData: Partial<User>) => {
    if (!user) return { success: false, message: 'No user logged in' };
    try {
      // Update Firestore user document
      await updateDoc(doc(db, 'users', user.uid), profileData);
      // Optionally update Firebase Auth profile (displayName, photoURL)
      if (profileData.displayName || profileData.photoURL) {
        await firebaseUpdateProfile(user, {
          displayName: profileData.displayName,
          photoURL: profileData.photoURL
        });
      }
      // Refresh user data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          ...user,
          ...userData
        });
      }
      return { success: true, message: 'Profile updated successfully' };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { success: false, message: error.message || 'Failed to update profile' };
    }
  };

  const value = useMemo(() => ({
    user,
    loading,
    error,
    hasRole,
    hasPermission,
    logout,
    updateProfile
  }), [user, loading, error, hasRole, hasPermission, logout]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Helper function to get default permissions based on role
function getDefaultPermissions(role: UserRole): string[] {
  switch (role) {
    case 'admin':
      return ['*']; // Admin has all permissions
    case 'staff':
      return ['read', 'write', 'manage_inventory', 'manage_distributions', 'create_aid_request', 'view_aid_requests'];
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