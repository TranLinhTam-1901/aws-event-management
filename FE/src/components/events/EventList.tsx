import React from 'react';
import { EventCard } from './EventCard';

export const EventList: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <EventCard />
      <EventCard />
      <EventCard />
    </div>
  );
};
