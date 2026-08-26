import React from 'react';
import { EventForm } from '../../components/events/EventForm';

export const EventEditPage: React.FC = () => {
  return (
    <div className="flex justify-center px-4 py-6">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Chỉnh sửa sự kiện</h1>
        <EventForm />
      </div>
    </div>
  );
};
