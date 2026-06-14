import React from 'react';
import { AppCard } from '../common/AppCard';

export const CertificateCard: React.FC = () => {
  return (
    <AppCard>
      <div className="bg-yellow-100 p-4 rounded mb-4 text-center">
        <p className="text-2xl">📜</p>
      </div>
      <h3 className="text-lg font-bold mb-2">Certificate</h3>
      <p className="text-sm text-gray-600 mb-4">Event Title</p>
      <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
        Download
      </button>
    </AppCard>
  );
};
