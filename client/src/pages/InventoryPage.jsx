import React, { useState } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import InventoryTable from '@/components/tables/InventoryTable';
import SearchInput from '@/components/ui/SearchInput';
import { inventoryItems } from '@/data';

const InventoryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();

  const handleAddItem = () => {
    // In a real app, this would open a modal or navigate to a form
    console.log("Add item clicked");
  };

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Inventory Management</h2>
            <p className="text-sm text-gray-500">Manage Items in Transit and Storage</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1.5 px-3 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
              Export
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <SearchInput 
            placeholder="Search items" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <InventoryTable inventory={inventoryItems} onAddItem={handleAddItem} />
      </div>
    </MainLayout>
  );
};

export default InventoryPage;
