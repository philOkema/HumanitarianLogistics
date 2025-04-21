import React from 'react';
import { useUser } from '../context/UserContext';
import { useRoleFeatures } from '../hooks/useRoleFeatures';

const DonationsPage: React.FC = () => {
  const { user } = useUser();
  const { canManageDonations } = useRoleFeatures();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Donations</h1>
      <div className="grid gap-6">
        {/* Donor Features */}
        {user?.role === 'donor' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Donations</h2>
            <div className="space-y-4">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Make New Donation
              </button>
              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">Donation History</h3>
                <p className="text-gray-600 dark:text-gray-300">Your past donations will appear here.</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin/Staff Features */}
        {canManageDonations && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Donation Management</h2>
              <div className="space-y-4">
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Process New Donation
                </button>
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-2">Recent Donations</h3>
                  <p className="text-gray-600 dark:text-gray-300">Recent donations will be listed here.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Donation Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-2">Total Donations</h3>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-2">This Month</h3>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-2">Pending</h3>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DonationsPage; 