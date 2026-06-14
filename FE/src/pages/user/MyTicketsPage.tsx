import React from 'react';
import { UserLayout } from '../../components/layout/UserLayout';
import { MyTicketList } from '../../components/tickets/MyTicketList';

export const MyTicketsPage: React.FC = () => {
  return (
    <UserLayout>
      <MyTicketList />
    </UserLayout>
  );
};
