import React from 'react';
import { AppTable } from '../common/AppTable';

export const NotificationLogTable: React.FC = () => {
  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'sentAt', label: 'Sent At' },
  ];

  const data: any[] = [];

  return <AppTable columns={columns} data={data} keyField="notificationId" />;
};
