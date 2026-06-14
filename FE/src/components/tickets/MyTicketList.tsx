import React from 'react';
import { TicketCard } from './TicketCard';

export const MyTicketList: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Tickets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TicketCard />
        <TicketCard />
      </div>
    </div>
  );
};
