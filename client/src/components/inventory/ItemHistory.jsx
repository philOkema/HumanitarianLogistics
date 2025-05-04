import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ItemHistory = ({ history = [] }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      case 'delete':
        return '🗑️';
      case 'adjust':
        return '📊';
      default:
        return '📝';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create':
        return 'text-green-600';
      case 'update':
        return 'text-blue-600';
      case 'delete':
        return 'text-red-600';
      case 'adjust':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatChange = (change) => {
    if (!change) return 'No details available';
    
    if (typeof change === 'string') return change;
    
    return Object.entries(change)
      .map(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
        return `${formattedKey}: ${value}`;
      })
      .join(', ');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Item History</h3>
      
      {history.length === 0 ? (
        <p className="text-sm text-gray-500">No history available</p>
      ) : (
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200"
            >
              <div className={`text-xl ${getActionColor(entry.action)}`}>
                {getActionIcon(entry.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                  </p>
                </div>
                
                <p className="mt-1 text-sm text-gray-600">
                  {formatChange(entry.change)}
                </p>
                
                {entry.user && (
                  <p className="mt-1 text-xs text-gray-500">
                    By {entry.user.name || entry.user.email}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemHistory; 