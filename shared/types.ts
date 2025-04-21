export type UserRole = 'admin' | 'staff' | 'donor' | 'beneficiary';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermissions {
  canManageUsers: boolean;
  canManageInventory: boolean;
  canManageDonations: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canManageUsers: true,
    canManageInventory: true,
    canManageDonations: true,
    canViewReports: true,
    canManageSettings: true,
  },
  staff: {
    canManageUsers: false,
    canManageInventory: true,
    canManageDonations: true,
    canViewReports: true,
    canManageSettings: false,
  },
  donor: {
    canManageUsers: false,
    canManageInventory: false,
    canManageDonations: true,
    canViewReports: false,
    canManageSettings: false,
  },
  beneficiary: {
    canManageUsers: false,
    canManageInventory: false,
    canManageDonations: false,
    canViewReports: false,
    canManageSettings: false,
  },
}; 