import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { EventList } from '../../components/events/EventList';

export const EventListPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2">Sự kiện sắp diễn ra</h1>
        <p className="text-gray-600 mb-8">Khám phá và đăng ký các sự kiện thú vị</p>
        <EventList />
      </div>
    </PublicLayout>
  );
};
