import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useRoleFeatures } from '../hooks/useRoleFeatures';
import { updateUserRole, getAllUsers } from '../services/roleService';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const SettingsPage: React.FC = () => {
  const { user } = useUser();
  const { canViewSettings } = useRoleFeatures();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.users);
      } catch (err) {
        setError('Failed to fetch users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (canViewSettings) {
      fetchUsers();
    }
  }, [canViewSettings]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (err) {
      setError('Failed to update user role');
      console.error(err);
    }
  };

  if (!canViewSettings) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl text-white font-bold mb-4">System Settings</h1>
      <div className="grid gap-6">
        {/* System Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl text-white font-semibold mb-4">System Configuration</h2>
          <div className="space-y-4">
            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">Email Settings</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" id="emailNotifications" />
                  <label htmlFor="emailNotifications">Enable Email Notifications</label>
                </div>
                <input
                  type="email"
                  placeholder="System Email Address"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">Security Settings</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" id="twoFactor" />
                  <label htmlFor="twoFactor">Require Two-Factor Authentication</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" id="passwordExpiry" />
                  <label htmlFor="passwordExpiry">Enable Password Expiry</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl text-white font-semibold mb-4">User Management</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="border rounded px-2 py-1"
                          >
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="donor">Donor</option>
                            <option value="beneficiary">Beneficiary</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleRoleChange(user.id, user.role)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* System Logs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl text-white font-semibold mb-4">System Logs</h2>
          <div className="space-y-4">
            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">Recent Activity</h3>
              <p className="text-gray-600 dark:text-gray-300">System logs will appear here.</p>
            </div>
            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Download Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 