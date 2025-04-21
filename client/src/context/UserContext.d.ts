import { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'volunteer' | 'donor' | 'beneficiary' | 'guest';
  phone?: string;
  address?: string;
}

export interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (user: Omit<User, 'id'> & { password: string }) => Promise<void>;
}

export interface UserProviderProps {
  children: ReactNode;
}

export declare const UserProvider: React.FC<UserProviderProps>;
export declare const useUser: () => UserContextType; 