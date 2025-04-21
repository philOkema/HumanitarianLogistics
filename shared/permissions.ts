import { UserRole } from './types';

export type Permission = 
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_inventory'
  | 'manage_donations'
  | 'manage_beneficiaries'
  | 'view_reports'
  | 'manage_settings'
  | 'view_profile'
  | 'edit_profile';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard',
    'manage_users',
    'manage_inventory',
    'manage_donations',
    'manage_beneficiaries',
    'view_reports',
    'manage_settings',
    'view_profile',
    'edit_profile'
  ],
  staff: [
    'view_dashboard',
    'manage_inventory',
    'manage_donations',
    'manage_beneficiaries',
    'view_reports',
    'view_profile',
    'edit_profile'
  ],
  donor: [
    'view_dashboard',
    'manage_donations',
    'view_profile',
    'edit_profile'
  ],
  beneficiary: [
    'view_dashboard',
    'view_profile',
    'edit_profile'
  ]
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
} 