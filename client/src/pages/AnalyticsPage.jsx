import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import DistributionTrendsChart from '@/components/charts/DistributionTrendsChart';
import AidTypesChart from '@/components/charts/AidTypesChart';
import ServiceEfficiencyChart from '@/components/charts/ServiceEfficiencyChart';
import { chartData } from '@/data';

const AnalyticsPage = () => {
  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Distribution Analytics</h2>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button className="bg-gray-200 text-gray-800 py-1.5 px-3 rounded-md text-sm font-medium">
              Last 30 Days
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 px-3 rounded-md text-sm font-medium">
              All Locations
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 px-3 rounded-md text-sm font-medium">
              All Aid type
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Aid Distributed</h3>
            <p className="text-2xl font-bold">$12,450,000</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Beneficiaries Served</h3>
            <p className="text-2xl font-bold">2000+</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Distribution Trends Over Time</h3>
          <DistributionTrendsChart data={chartData.distributionTrends} />
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Most Requested Aid Types</h3>
          <AidTypesChart data={chartData.aidTypes} />
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Service Efficiency</h3>
          <ServiceEfficiencyChart data={chartData.serviceEfficiency} />
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
