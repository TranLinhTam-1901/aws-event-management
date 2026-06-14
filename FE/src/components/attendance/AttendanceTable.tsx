import React from 'react';
import { AppTable } from '../common/AppTable';

export const AttendanceTable: React.FC = () => {
  const columns = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'checkInAt', label: 'Check-In Time' },
    { key: 'checkedBy', label: 'Checked By' },
  ];

  const data: any[] = [];

  return <AppTable columns={columns} data={data} keyField="ticketId" />;
};
