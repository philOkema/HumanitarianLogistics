import React from 'react';
import { useUser } from '../context/UserContext';
import { useRoleFeatures } from '../hooks/useRoleFeatures';

const BeneficiaryPage: React.FC = () => {
  const { user } = useUser();
  const { canRequestAid, canManageDistributions } = useRoleFeatures();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Beneficiary Dashboard</h1>
      <div className="grid gap-6">
        {/* Beneficiary Features */}
        {user?.role === 'beneficiary' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Aid Requests</h2>
            <div className="space-y-4">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Request Aid
              </button>
              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">Request History</h3>
                <p className="text-gray-600 dark:text-gray-300">Your aid request history will appear here.</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">Active Requests</h3>
                <p className="text-gray-600 dark:text-gray-300">Your active requests will be shown here.</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin/Staff Features */}
        {canManageDistributions && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Beneficiary Management</h2>
              <div className="space-y-4">
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Register New Beneficiary
                </button>
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-2">Recent Aid Requests</h3>
                  <p className="text-gray-600 dark:text-gray-300">Recent aid requests will be listed here.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Distribution Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-2">Total Beneficiaries</h3>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-2">Active Requests</h3>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-2">Completed Distributions</h3>
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

export default BeneficiaryPage; 