import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import DistributionMap from '@/components/maps/DistributionMap';
import SearchInput from '@/components/ui/SearchInput';

const DistributionPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Aid Distribution</h2>
        
        <h3 className="text-sm font-medium text-gray-500 mb-4">Overall distributions</h3>
        
        <div className="mb-6">
          <SearchInput 
            placeholder="Search a Location" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="aspect-w-16 aspect-h-9 mb-6 bg-gray-100 rounded-lg overflow-hidden">
          <DistributionMap />
        </div>
      </div>
    </MainLayout>
  );
};

export default DistributionPage;
