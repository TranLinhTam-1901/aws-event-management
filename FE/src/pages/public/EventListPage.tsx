import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { EventList } from '../../components/events/EventList';

export const EventListPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2">Upcoming Events</h1>
        <p className="text-gray-600 mb-8">Find and register for exciting events</p>
        <EventList />
      </div>
    </PublicLayout>
  );
};
