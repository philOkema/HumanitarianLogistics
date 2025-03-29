import React from 'react';

const StatCard = ({ title, value }) => {
  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default StatCard;
