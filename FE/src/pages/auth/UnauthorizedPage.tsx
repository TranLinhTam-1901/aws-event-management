import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';

export const UnauthorizedPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-red-600 mb-4">403</h1>
          <p className="text-2xl font-semibold text-gray-900 mb-2">Unauthorized</p>
          <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Go Home
          </button>
        </div>
      </div>
    </PublicLayout>
  );
};
