import React from 'react';
import { AppCard } from '../common/AppCard';

export const DashboardStatsCard: React.FC<{ title: string; value: number; color: string }> = ({
  title,
  value,
  color,
}) => {
  return (
    <AppCard>
      <p className="text-gray-600 text-sm mb-2">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </AppCard>
  );
};
