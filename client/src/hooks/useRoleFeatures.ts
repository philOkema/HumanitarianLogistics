import { useUser } from '../context/UserContext';
import { USER_ROLES } from '../context/UserContext';

interface FeatureAccess {
  canManageUsers: boolean;
  canManageInventory: boolean;
  canManageDonations: boolean;
  canRequestAid: boolean;
  canViewAnalytics: boolean;
  canManageDistributions: boolean;
  canViewSettings: boolean;
}

export const useRoleFeatures = (): FeatureAccess => {
  const { user } = useUser();
  const role = user?.role || USER_ROLES.GUEST;

  return {
    canManageUsers: role === USER_ROLES.ADMIN,
    canManageInventory: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.VOLUNTEER].includes(role as any),
    canManageDonations: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.DONOR].includes(role as any),
    canRequestAid: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.BENEFICIARY].includes(role as any),
    canViewAnalytics: [USER_ROLES.ADMIN, USER_ROLES.STAFF].includes(role as any),
    canManageDistributions: [USER_ROLES.ADMIN, USER_ROLES.STAFF].includes(role as any),
    canViewSettings: role === USER_ROLES.ADMIN,
  };
}; 