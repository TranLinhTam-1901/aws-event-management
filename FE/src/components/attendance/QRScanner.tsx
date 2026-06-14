import React from 'react';

export const QRScanner: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center">QR Code Scanner</h2>
      <div className="bg-gray-300 h-64 rounded-lg mb-4 flex items-center justify-center">
        <p className="text-gray-600">Scanner will be displayed here</p>
      </div>
      <p className="text-center text-gray-600 text-sm">Position QR code in the frame</p>
    </div>
  );
};
