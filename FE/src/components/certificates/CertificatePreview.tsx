import React from 'react';

export const CertificatePreview: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="border-2 border-yellow-600 rounded-lg p-16 text-center bg-yellow-50">
        <h2 className="text-3xl font-bold text-yellow-800 mb-4">Certificate of Achievement</h2>
        <p className="text-lg text-gray-600 mb-4">This certifies that</p>
        <p className="text-2xl font-bold text-gray-800 mb-4">John Doe</p>
        <p className="text-lg text-gray-600 mb-4">has successfully completed</p>
        <p className="text-2xl font-bold text-gray-800">Event Title</p>
        <p className="text-sm text-gray-600 mt-8">Date: December 25, 2024</p>
      </div>
    </div>
  );
};
