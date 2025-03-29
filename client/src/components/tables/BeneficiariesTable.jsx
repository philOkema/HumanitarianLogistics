import React from 'react';

const BeneficiariesTable = ({ beneficiaries = [], onAddBeneficiary }) => {
  // Default data if none is provided
  const defaultData = [
    {
      name: 'John Price',
      aidHistory: [
        { type: 'Shelter', date: '2023-07-20' },
        { type: 'Medical Supplies, Hygiene Kits', date: '' },
        { type: 'Food', date: '2023-07-10' }
      ],
      futureNeeds: 'Medical Supplies/Hygiene Kits, Clothing'
    },
    {
      name: 'Mary Wary',
      aidHistory: [
        { type: 'Shelter', date: '2023-07-20' },
        { type: 'Medical Supplies, Hygiene Kits', date: '' },
        { type: 'Food', date: '2023-07-10' }
      ],
      futureNeeds: 'Hygiene Kits, Clothing'
    },
    {
      name: 'John Price',
      aidHistory: [
        { type: 'Shelter', date: '2023-07-20' },
        { type: 'Medical Supplies, Hygiene Kits', date: '' },
        { type: 'Food', date: '2023-07-10' }
      ],
      futureNeeds: 'Medical Supplies/Hygiene Kits, Clothing'
    }
  ];

  const data = beneficiaries.length > 0 ? beneficiaries : defaultData;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Beneficiaries</h2>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={onAddBeneficiary}
            className="bg-primary hover:bg-primary/90 text-white py-1.5 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            Add Beneficiary
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
            placeholder="Search by Name or ID"
          />
        </div>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-2">
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded text-sm">
          Aid Type
        </button>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded text-sm">
          Date
        </button>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded text-sm">
          Location
        </button>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded text-sm">
          Urgency
        </button>
      </div>
      
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aid History</th>
              <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Future Aid Needs</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((beneficiary, index) => (
              <tr key={index}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{beneficiary.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {beneficiary.aidHistory.map((history, idx) => (
                    <React.Fragment key={idx}>
                      {history.date && <div className="text-xs text-gray-500">{history.type} ({history.date})</div>}
                      {!history.date && <div>{history.type}</div>}
                    </React.Fragment>
                  ))}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{beneficiary.futureNeeds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-1">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-primary text-white">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">3</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">...</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">10</button>
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

export default BeneficiariesTable;
