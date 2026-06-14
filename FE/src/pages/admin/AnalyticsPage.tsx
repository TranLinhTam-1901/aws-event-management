import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { RegistrationChart } from '../../components/analytics/RegistrationChart';
import { AttendanceChart } from '../../components/analytics/AttendanceChart';
import { EventPerformanceChart } from '../../components/analytics/EventPerformanceChart';
import { AnalyticsTable } from '../../components/analytics/AnalyticsTable';

export const AnalyticsPage: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RegistrationChart />
        <AttendanceChart />
      </div>
      <div className="mb-6">
        <EventPerformanceChart />
      </div>
      <h2 className="text-2xl font-bold mb-4">Event Performance Details</h2>
      <AnalyticsTable />
    </AdminLayout>
  );
};
