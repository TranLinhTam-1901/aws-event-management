import React from 'react';
import { AppCard } from '../common/AppCard';

export const TicketCard: React.FC = () => {
  return (
    <AppCard>
      <h3 className="text-lg font-bold mb-2">Ticket</h3>
      <p className="text-sm text-gray-600 mb-4">Event Title</p>
      <p className="text-xs text-gray-500 mb-4">Ticket ID: TKT-12345</p>
      <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
        View QR Code
      </button>
    </AppCard>
  );
};
