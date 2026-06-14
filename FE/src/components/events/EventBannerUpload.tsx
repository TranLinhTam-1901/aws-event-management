import React from 'react';
import { AppButton } from '../common/AppButton';

export const EventBannerUpload: React.FC = () => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <p className="text-gray-600 mb-2">Drag and drop your image here</p>
      <p className="text-gray-400 text-sm mb-4">or</p>
      <AppButton variant="secondary">Choose File</AppButton>
    </div>
  );
};
