import React from 'react';

export const RoleGuard: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({
  children,
  allowedRoles,
}) => {
  // Role checking logic will be implemented here
  return <>{children}</>;
};
