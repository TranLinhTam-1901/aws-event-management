import React from 'react';
import { UserLayout } from '../../components/layout/UserLayout';
import { CertificatePreview } from '../../components/certificates/CertificatePreview';
import { CertificateDownloadButton } from '../../components/certificates/CertificateDownloadButton';

export const CertificateDetailPage: React.FC = () => {
  return (
    <UserLayout>
      <div className="space-y-6">
        <CertificatePreview />
        <div className="flex justify-center">
          <CertificateDownloadButton />
        </div>
      </div>
    </UserLayout>
  );
};
