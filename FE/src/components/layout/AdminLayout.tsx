import React from 'react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Admin Sidebar will be added here */}
      <div className="flex-1 flex flex-col">
        {/* Header will be added here */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};
