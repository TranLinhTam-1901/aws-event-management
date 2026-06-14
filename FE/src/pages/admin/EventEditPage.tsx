import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { EventForm } from '../../components/events/EventForm';

export const EventEditPage: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Edit Event</h1>
      <div className="max-w-2xl">
        <EventForm />
      </div>
    </AdminLayout>
  );
};
