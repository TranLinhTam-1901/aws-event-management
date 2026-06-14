import React from 'react';
import { StatusBadge } from '../common/StatusBadge';

export const EmailStatusTag: React.FC<{ status: string }> = ({ status }) => {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    sent: 'success',
    pending: 'warning',
    failed: 'danger',
  };

  return <StatusBadge status={status} variant={variants[status] || 'info'} />;
};
