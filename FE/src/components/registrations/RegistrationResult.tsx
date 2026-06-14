import React from 'react';
import { StatusBadge } from '../common/StatusBadge';

export const RegistrationResult: React.FC = () => {
  return (
    <div className="text-center py-8">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-bold mb-2">Registration Successful!</h3>
      <p className="text-gray-600 mb-4">Your registration has been received.</p>
      <StatusBadge status="Confirmed" variant="success" />
    </div>
  );
};
