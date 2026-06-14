import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { DashboardStatsCard } from '../../components/analytics/DashboardStatsCard';
import { RegistrationChart } from '../../components/analytics/RegistrationChart';
import { AttendanceChart } from '../../components/analytics/AttendanceChart';

export const AdminDashboardPage: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <DashboardStatsCard title="Total Events" value={12} color="text-blue-600" />
        <DashboardStatsCard title="Total Registrations" value={245} color="text-green-600" />
        <DashboardStatsCard title="Check-Ins" value={189} color="text-purple-600" />
        <DashboardStatsCard title="Avg Attendance" value={77} color="text-orange-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RegistrationChart />
        <AttendanceChart />
      </div>
    </AdminLayout>
  );
};
