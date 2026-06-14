import React from 'react';
import { CertificateCard } from './CertificateCard';

export const MyCertificateList: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Certificates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CertificateCard />
        <CertificateCard />
      </div>
    </div>
  );
};
