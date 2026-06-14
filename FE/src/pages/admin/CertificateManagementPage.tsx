import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';

export const CertificateManagementPage: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Certificate Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Certificate management interface will be displayed here.</p>
      </div>
    </AdminLayout>
  );
};
