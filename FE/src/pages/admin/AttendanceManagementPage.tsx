import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AttendanceTable } from '../../components/attendance/AttendanceTable';

export const AttendanceManagementPage: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Attendance Management</h1>
      <AttendanceTable />
    </AdminLayout>
  );
};
