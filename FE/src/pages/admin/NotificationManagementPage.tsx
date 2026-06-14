import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { SendNotificationForm } from '../../components/notifications/SendNotificationForm';
import { NotificationLogTable } from '../../components/notifications/NotificationLogTable';

export const NotificationManagementPage: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Notification Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Send Notification</h2>
          <SendNotificationForm />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Notification Logs</h2>
          <NotificationLogTable />
        </div>
      </div>
    </AdminLayout>
  );
};
