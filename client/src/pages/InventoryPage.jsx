import React from 'react';
import InventoryManagement from '../components/inventory/InventoryManagement';
import { useInventory } from '../context/InventoryContext';

const InventoryPage = () => {
  const { loading, error } = useInventory();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-sm text-gray-500">Manage inventory items, track stock levels, and monitor expiring items</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <InventoryManagement />
      )}
    </div>
  );
};

export default InventoryPage;
