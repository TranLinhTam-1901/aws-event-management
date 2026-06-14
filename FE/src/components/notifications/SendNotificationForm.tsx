import React from 'react';
import { AppButton } from '../common/AppButton';

export const SendNotificationForm: React.FC = () => {
  return (
    <form className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option>All Registered Users</option>
          <option>Confirmed Only</option>
          <option>Waiting List</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Email subject"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={4}
          placeholder="Email message"
        />
      </div>
      <AppButton variant="primary">Send Notification</AppButton>
    </form>
  );
};
