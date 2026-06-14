import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { EventForm } from '../../components/events/EventForm';

export const EventCreatePage: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Create Event</h1>
      <div className="max-w-2xl">
        <EventForm />
      </div>
    </AdminLayout>
  );
};
