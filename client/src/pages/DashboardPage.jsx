import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/ui/StatCard';
import DistributionTable from '@/components/tables/DistributionTable';
import { stats, recentDistributions } from '@/data';

const DashboardPage = () => {
  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Dashboard</h2>
        
        <h3 className="text-sm font-medium text-gray-500 mb-4">Overall distributions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard title="Total Aid Distributed" value={stats.totalAidDistributed} />
          <StatCard title="Beneficiaries Served" value={stats.beneficiariesServed} />
          <StatCard title="Inventory Levels" value={stats.inventoryLevels} />
        </div>
        
        <h3 className="text-sm font-medium text-gray-500 mb-4">Recent Distributions</h3>
        
        <DistributionTable distributions={recentDistributions} />
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
