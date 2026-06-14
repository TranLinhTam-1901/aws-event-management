import React from 'react';

export const TicketQRCode: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="bg-gray-200 w-64 h-64 rounded-lg flex items-center justify-center mb-4">
        <div className="text-center text-gray-600">
          <p>QR Code</p>
          <p className="text-sm">(Will be generated)</p>
        </div>
      </div>
      <p className="text-sm text-gray-600">Scan this code to check-in</p>
    </div>
  );
};
