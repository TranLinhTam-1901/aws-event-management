import React from 'react';
import { UserLayout } from '../../components/layout/UserLayout';

export const MyRegistrationsPage: React.FC = () => {
  return (
    <UserLayout>
      <h1 className="text-3xl font-bold mb-8">My Registrations</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">You have not registered for any events yet.</p>
      </div>
    </UserLayout>
  );
};
