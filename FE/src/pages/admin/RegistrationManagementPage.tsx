import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { RegistrationTable } from '../../components/registrations/RegistrationTable';

export const RegistrationManagementPage: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Registration Management</h1>
      <RegistrationTable />
    </AdminLayout>
  );
};
