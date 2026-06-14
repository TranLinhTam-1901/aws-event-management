import React from 'react';

export const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar will be added here */}
      <div className="flex-1 flex flex-col">
        {/* Header will be added here */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};
