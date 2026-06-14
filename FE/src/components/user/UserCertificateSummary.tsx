import React from 'react';
import { AppCard } from '../common/AppCard';

export const UserCertificateSummary: React.FC = () => {
  return (
    <AppCard>
      <h3 className="text-lg font-bold mb-2">My Certificates</h3>
      <p className="text-3xl font-bold text-green-600">0</p>
      <p className="text-gray-600">Total certificates</p>
    </AppCard>
  );
};
