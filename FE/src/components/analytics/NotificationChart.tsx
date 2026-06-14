import React from 'react';

export const NotificationChart: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold mb-4">Notification Status</h3>
      <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
        <p className="text-gray-500">Chart will be displayed here</p>
      </div>
    </div>
  );
};
