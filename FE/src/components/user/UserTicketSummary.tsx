import React from 'react';
import { AppCard } from '../common/AppCard';

export const UserTicketSummary: React.FC = () => {
  return (
    <AppCard>
      <h3 className="text-lg font-bold mb-2">My Tickets</h3>
      <p className="text-3xl font-bold text-blue-600">0</p>
      <p className="text-gray-600">Total tickets</p>
    </AppCard>
  );
};
