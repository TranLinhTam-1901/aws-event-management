import React from 'react';
import { StatusBadge } from '../common/StatusBadge';

export const EventStatusTag: React.FC<{ status: string }> = ({ status }) => {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    active: 'success',
    draft: 'info',
    ended: 'danger',
    cancelled: 'danger',
  };

  return <StatusBadge status={status} variant={variants[status] || 'info'} />;
};
