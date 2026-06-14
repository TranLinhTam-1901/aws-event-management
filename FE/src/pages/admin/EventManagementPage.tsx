import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { EventList } from '../../components/events/EventList';
import { AppButton } from '../../components/common/AppButton';

export const EventManagementPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Event Management</h1>
        <AppButton variant="primary">Create Event</AppButton>
      </div>
      <EventList />
    </AdminLayout>
  );
};
