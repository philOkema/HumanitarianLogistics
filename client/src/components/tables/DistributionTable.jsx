import React from 'react';
import { formatDate } from '@/lib/utils';

const DistributionTable = ({ distributions = [] }) => {
  // Default data if none is provided
  const defaultData = [
    { date: '2023-07-02', location: 'Turkana', aidType: 'Medical Supplies', quantity: '5000 Units' },
    { date: '2023-07-12', location: 'Turkana', aidType: 'Medical Supplies', quantity: '3000 Units' },
    { date: '2023-07-22', location: 'Turkana', aidType: 'Medical Supplies', quantity: '3000 Units' },
    { date: '2023-07-12', location: 'Turkana', aidType: 'Medical Supplies', quantity: '3000 Units' },
    { date: '2023-07-22', location: 'Turkana', aidType: 'Medical Supplies', quantity: '3000 Units' }
  ];

  const data = distributions.length > 0 ? distributions : defaultData;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aid Type</th>
            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Distributed</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((distribution, index) => (
            <tr key={index}>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {formatDate(distribution.date)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{distribution.location}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{distribution.aidType}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{distribution.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DistributionTable;
