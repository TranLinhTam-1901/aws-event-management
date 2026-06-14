import React from 'react';
import { UserLayout } from '../../components/layout/UserLayout';
import { TicketDetail } from '../../components/tickets/TicketDetail';

export const TicketDetailPage: React.FC = () => {
  return (
    <UserLayout>
      <TicketDetail />
    </UserLayout>
  );
};
