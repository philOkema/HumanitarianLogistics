import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface UsersResponse {
  users: User[];
}

interface UpdateRoleResponse {
  success: boolean;
  message: string;
}

export const updateUserRole = async (userId: string, newRole: string): Promise<UpdateRoleResponse> => {
  const updateRole = httpsCallable(functions, 'updateUserRole');
  try {
    const result = await updateRole({ userId, newRole });
    return result.data as UpdateRoleResponse;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<UsersResponse> => {
  const getUsers = httpsCallable(functions, 'getAllUsers');
  try {
    const result = await getUsers();
    return result.data as UsersResponse;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}; 