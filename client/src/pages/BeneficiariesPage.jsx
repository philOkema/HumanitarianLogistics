import React, { useState } from 'react';
import BeneficiariesTable from '@/components/tables/BeneficiariesTable';
import { beneficiaries } from '@/data';

const BeneficiariesPage = () => {
  const handleAddBeneficiary = () => {
    // In a real app, this would open a modal or navigate to a form
    console.log("Add beneficiary clicked");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <BeneficiariesTable 
        beneficiaries={beneficiaries} 
        onAddBeneficiary={handleAddBeneficiary} 
      />
    </div>
  );
};

export default BeneficiariesPage;
