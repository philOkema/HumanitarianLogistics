// Static data for initial state rendering

export const stats = {
  totalAidDistributed: '$12,450,000',
  beneficiariesServed: '2000+',
  inventoryLevels: '10,000 items'
};

export const recentDistributions = [
  { date: '2023-07-02', location: 'Turkana', aidType: 'Medical Supplies', quantity: '5000 Units' },
  { date: '2023-07-12', location: 'Turkana', aidType: 'Medical Supplies', quantity: '3000 Units' },
  { date: '2023-07-22', location: 'Turkana', aidType: 'Medical Supplies', quantity: '3000 Units' },
  { date: '2023-07-12', location: 'Turkana', aidType: 'Medical Supplies', quantity: '3000 Units' },
  { date: '2023-07-22', location: 'Turkana', aidType: 'Medical Supplies', quantity: '3000 Units' }
];

export const inventoryItems = [
  { itemId: 'ID-1001', itemName: 'Blankets', category: 'Clothing', quantity: 5000, lastUpdate: '2023-07-12' },
  { itemId: 'ID-1002', itemName: 'Blankets', category: 'Clothing', quantity: 3000, lastUpdate: '2023-07-15' },
  { itemId: 'ID-1003', itemName: 'Tents', category: 'Shelter', quantity: 1000, lastUpdate: '2023-07-14' },
  { itemId: 'ID-1004', itemName: 'Tents', category: 'Shelter', quantity: 800, lastUpdate: '2023-07-16' },
  { itemId: 'ID-1005', itemName: 'Blankets', category: 'Clothing', quantity: 2500, lastUpdate: '2023-07-18' }
];

export const beneficiaries = [
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

export const chartData = {
  distributionTrends: [25, 30, 35, 40, 35, 30],
  aidTypes: [65, 40, 55, 30, 70],
  serviceEfficiency: [1.2, 2.3, 2.8, 2.5, 3.5]
};

export const countries = [
  { value: 'usa', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'canada', label: 'Canada' },
  { value: 'australia', label: 'Australia' },
  { value: 'germany', label: 'Germany' },
  { value: 'france', label: 'France' },
  { value: 'other', label: 'Other' }
];

export const organizations = [
  { value: 'red-cross', label: 'Red Cross' },
  { value: 'unicef', label: 'UNICEF' },
  { value: 'doctors-without-borders', label: 'Doctors Without Borders' },
  { value: 'world-food-program', label: 'World Food Program' },
  { value: 'other', label: 'Other' }
];

export const roles = [
  { value: 'field-volunteer', label: 'Field Volunteer' },
  { value: 'logistics-coordinator', label: 'Logistics Coordinator' },
  { value: 'medical-staff', label: 'Medical Staff' },
  { value: 'administrative', label: 'Administrative Support' },
  { value: 'other', label: 'Other' }
];

export const aidTypes = [
  { value: 'food', label: 'Food' },
  { value: 'water', label: 'Water' },
  { value: 'medical', label: 'Medical Supplies' },
  { value: 'shelter', label: 'Shelter' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'hygiene', label: 'Hygiene Kits' },
  { value: 'other', label: 'Other' }
];

export const urgencyLevels = [
  { value: 'critical', label: 'Critical - Immediate (24 hours)' },
  { value: 'high', label: 'High - Urgent (2-3 days)' },
  { value: 'medium', label: 'Medium - Important (1 week)' },
  { value: 'low', label: 'Low - Standard (2+ weeks)' }
];
