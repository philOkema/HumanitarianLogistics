import { ComponentType } from 'react';
import { User } from '../context/UserContext';

export interface ProtectedRouteProps {
  component: ComponentType<any>;
  requiredPermission?: string;
  [key: string]: any;
}

export interface RoleBasedRouteProps {
  component: ComponentType<any>;
  requiredRoles: User['role'][];
  [key: string]: any;
}

export interface UnauthenticatedRouteProps {
  component: ComponentType<any>;
  [key: string]: any;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps>;
export const RoleBasedRoute: React.FC<RoleBasedRouteProps>;
export const UnauthenticatedRoute: React.FC<UnauthenticatedRouteProps>; 