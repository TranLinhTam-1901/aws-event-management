import React from 'react';
import { UserLayout } from '../../components/layout/UserLayout';
import { UserProfileCard } from '../../components/user/UserProfileCard';
import { UserTicketSummary } from '../../components/user/UserTicketSummary';
import { UserCertificateSummary } from '../../components/user/UserCertificateSummary';

export const UserDashboardPage: React.FC = () => {
  return (
    <UserLayout>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <UserProfileCard />
        <UserTicketSummary />
        <UserCertificateSummary />
      </div>
    </UserLayout>
  );
};
