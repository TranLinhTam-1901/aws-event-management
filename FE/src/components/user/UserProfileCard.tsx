import React from 'react';
import { AppCard } from '../common/AppCard';

export const UserProfileCard: React.FC = () => {
  return (
    <AppCard>
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-bold mb-2">User Name</h3>
        <p className="text-gray-600">user@example.com</p>
      </div>
    </AppCard>
  );
};
