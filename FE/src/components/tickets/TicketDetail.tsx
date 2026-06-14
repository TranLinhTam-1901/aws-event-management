import React from 'react';
import { TicketQRCode } from './TicketQRCode';

export const TicketDetail: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold mb-6">Ticket Details</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-600 text-sm">Ticket ID</p>
          <p className="font-semibold">TKT-12345</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Event</p>
          <p className="font-semibold">Event Title</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Status</p>
          <p className="font-semibold text-green-600">Confirmed</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Date</p>
          <p className="font-semibold">Dec 25, 2024</p>
        </div>
      </div>
      <TicketQRCode />
    </div>
  );
};
