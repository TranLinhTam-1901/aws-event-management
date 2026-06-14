import React from 'react';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header will be added here */}
      <main className="flex-1">{children}</main>
      {/* Footer will be added here */}
    </div>
  );
};
