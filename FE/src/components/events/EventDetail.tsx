import React from 'react';
import { AppButton } from '../common/AppButton';

export const EventDetail: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="bg-gray-300 h-64 rounded-lg mb-6"></div>
      <h1 className="text-3xl font-bold mb-4">Event Title</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-600 text-sm">Location</p>
          <p className="text-lg font-semibold">Event Location</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Start Time</p>
          <p className="text-lg font-semibold">Dec 25, 2024 10:00</p>
        </div>
      </div>
      <div className="border-t pt-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Description</h2>
        <p className="text-gray-600">Event description will be displayed here.</p>
      </div>
      <AppButton variant="primary">Register Now</AppButton>
    </div>
  );
};
