import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { QRScanner } from '../../components/attendance/QRScanner';
import { CheckInResult } from '../../components/attendance/CheckInResult';

export const CheckInPage: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Check-In</h1>
      <div className="max-w-2xl mx-auto">
        <QRScanner />
        <div className="mt-8">
          <CheckInResult />
        </div>
      </div>
    </AdminLayout>
  );
};
