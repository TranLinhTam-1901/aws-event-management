import React from 'react';
import { AppTable } from '../common/AppTable';

export const AnalyticsTable: React.FC = () => {
  const columns = [
    { key: 'eventTitle', label: 'Event' },
    { key: 'totalRegistrations', label: 'Total Registrations' },
    { key: 'checkInCount', label: 'Check-Ins' },
    { key: 'attendanceRate', label: 'Attendance Rate' },
  ];

  const data: any[] = [];

  return <AppTable columns={columns} data={data} keyField="eventId" />;
};
