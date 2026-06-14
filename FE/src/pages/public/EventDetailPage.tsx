import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { EventDetail } from '../../components/events/EventDetail';

export const EventDetailPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <EventDetail />
      </div>
    </PublicLayout>
  );
};
