import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';

export const TicketManagementPage: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Ticket Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Ticket management interface will be displayed here.</p>
      </div>
    </AdminLayout>
  );
};
