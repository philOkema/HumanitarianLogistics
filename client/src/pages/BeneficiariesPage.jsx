import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import BeneficiariesTable from '@/components/tables/BeneficiariesTable';
import { beneficiaries } from '@/data';

const BeneficiariesPage = () => {
  const handleAddBeneficiary = () => {
    // In a real app, this would open a modal or navigate to a form
    console.log("Add beneficiary clicked");
  };

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <BeneficiariesTable 
          beneficiaries={beneficiaries} 
          onAddBeneficiary={handleAddBeneficiary} 
        />
      </div>
    </MainLayout>
  );
};

export default BeneficiariesPage;
