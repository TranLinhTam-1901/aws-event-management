import React from 'react';
import { UserLayout } from '../../components/layout/UserLayout';
import { MyCertificateList } from '../../components/certificates/MyCertificateList';

export const MyCertificatesPage: React.FC = () => {
  return (
    <UserLayout>
      <MyCertificateList />
    </UserLayout>
  );
};
