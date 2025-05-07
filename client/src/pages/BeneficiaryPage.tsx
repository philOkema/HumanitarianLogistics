import React from 'react';
import { useUser } from '../context/UserContext';
import { useRoleFeatures } from '../hooks/useRoleFeatures';
import { useAidRequest } from '../context/AidRequestContext';

const BeneficiaryPage: React.FC = () => {
  const { user } = useUser();
  const { canRequestAid, canManageDistributions } = useRoleFeatures();
  const { aidRequests, loading } = useAidRequest() as any;

  // For beneficiaries: show only their own requests
  const myRequests: any[] = user?.role === 'beneficiary'
    ? (aidRequests as any[]).filter((r: any) => r.userId === user?.uid)
    : [];
  const activeRequests = myRequests.filter((r: any) => ['pending', 'in_progress', 'approved', 'in_transit'].includes(r.status));
  const pastRequests = myRequests.filter((r: any) => ['delivered', 'denied', 'cancelled'].includes(r.status));

  // For admin/staff: group requests by beneficiary
  let beneficiariesMap: Record<string, any> = {};
  if (canManageDistributions) {
    (aidRequests as any[]).forEach((r: any) => {
      if (!beneficiariesMap[r.userId]) {
        beneficiariesMap[r.userId] = {
          name: r.userName || r.userId,
          aidHistory: [],
          futureNeeds: r.futureNeeds || '',
        };
      }
      beneficiariesMap[r.userId].aidHistory.push({ type: r.aidType, date: r.createdAt });
    });
  }
  const beneficiaries = Object.values(beneficiariesMap);

  // Analytics for admin/staff
  const totalBeneficiaries = Object.keys(beneficiariesMap).length;
  const totalActiveRequests = (aidRequests as any[]).filter((r: any) => ['pending', 'in_progress', 'approved', 'in_transit'].includes(r.status)).length;
  const totalCompleted = (aidRequests as any[]).filter((r: any) => r.status === 'delivered').length;

  return (
    <div className="p-6">
      <h1 className="text-2xl text-white font-bold mb-4">Beneficiary Dashboard</h1>
      <div className="grid gap-6">
        {/* Beneficiary Features */}
        {user?.role === 'beneficiary' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl text-white font-semibold mb-4">My Aid Requests</h2>
            <div className="space-y-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => window.location.href = '/request/new'}
              >
                Request Aid
              </button>
              <div className="border rounded p-4">
                <h3 className="font-medium text-white mb-2">Request History</h3>
                {pastRequests.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300">No past requests.</p>
                ) : (
                  <ul>
                    {pastRequests.map((r: any) => (
                      <li key={r.id} className="text-gray-600 dark:text-gray-300">
                        {r.aidType} - {r.status}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border rounded p-4">
                <h3 className="font-medium text-white mb-2">Active Requests</h3>
                {activeRequests.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300">No active requests.</p>
                ) : (
                  <ul>
                    {activeRequests.map((r: any) => (
                      <li key={r.id} className="text-gray-600 dark:text-gray-300">
                        {r.aidType} - {r.status}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin/Staff Features */}
        {canManageDistributions && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl text-white font-semibold mb-4">Beneficiaries</h2>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aid History</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {beneficiaries.map((b: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{b.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {b.aidHistory.map((h: any, hidx: number) => (
                            <div key={hidx} className="text-xs text-gray-500">{h.type} ({h.date ? new Date(h.date).toLocaleDateString() : ''})</div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl text-white font-semibold mb-4">Distribution Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded p-4">
                  <h3 className="font-medium text-white mb-2">Total Beneficiaries</h3>
                  <p className="text-2xl text-white font-bold">{totalBeneficiaries}</p>
                </div>
                <div className="border rounded p-4">
                  <h3 className="font-medium text-white mb-2">Active Requests</h3>
                  <p className="text-2xl text-white font-bold">{totalActiveRequests}</p>
                </div>
                <div className="border rounded p-4">
                  <h3 className="font-medium text-white mb-2">Completed Distributions</h3>
                  <p className="text-2xl text-white font-bold">{totalCompleted}</p>
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