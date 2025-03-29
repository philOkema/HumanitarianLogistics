import React from 'react';
import { formatDate } from '@/lib/utils';

const InventoryTable = ({ inventory = [], onAddItem }) => {
  // Default data if none is provided
  const defaultData = [
    { itemId: 'ID-1001', itemName: 'Blankets', category: 'Clothing', quantity: 5000, lastUpdate: '2023-07-12' },
    { itemId: 'ID-1002', itemName: 'Blankets', category: 'Clothing', quantity: 3000, lastUpdate: '2023-07-15' },
    { itemId: 'ID-1003', itemName: 'Tents', category: 'Shelter', quantity: 1000, lastUpdate: '2023-07-14' },
    { itemId: 'ID-1004', itemName: 'Tents', category: 'Shelter', quantity: 800, lastUpdate: '2023-07-16' },
    { itemId: 'ID-1005', itemName: 'Blankets', category: 'Clothing', quantity: 2500, lastUpdate: '2023-07-18' }
  ];

  const data = inventory.length > 0 ? inventory : defaultData;

  return (
    <>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item ID</th>
              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.itemId}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.itemName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.category}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.quantity}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatDate(item.lastUpdate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <button 
          onClick={onAddItem}
          className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          Add Item
        </button>
        
        <div className="flex items-center space-x-1">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-primary text-white">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">3</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default InventoryTable;
