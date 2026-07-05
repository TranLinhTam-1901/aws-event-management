import React from 'react';

export const RoleGuard: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({
  children,
  // allowedRoles chưa được dùng — TODO: cần bổ sung logic kiểm tra quyền dựa trên allowedRoles
}) => {
  return <>{children}</>;
};