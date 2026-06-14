import React from 'react';
import { AppCard } from '../common/AppCard';

export const EventCard: React.FC = () => {
  return (
    <AppCard>
      <div className="bg-gray-200 h-40 rounded mb-4"></div>
      <h3 className="text-lg font-bold mb-1">Event Title</h3>
      <p className="text-gray-600 text-sm mb-2">Event Location</p>
      <p className="text-gray-500 text-xs mb-3">Dec 25, 2024</p>
      <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        View Details
      </button>
    </AppCard>
  );
};
