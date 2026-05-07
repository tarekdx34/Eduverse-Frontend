import React from 'react';
import { Badge } from '../ui/badge';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalizedStatus = status?.toUpperCase() || '';

  const getColorClass = (): string => {
    switch (normalizedStatus) {
      case 'DRAFT':
        return 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600';
      case 'UNDER_REVIEW':
        return 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700';
      case 'APPROVED':
        return 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100 border-green-300 dark:border-green-700';
      case 'REJECTED':
        return 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100 border-red-300 dark:border-red-700';
      case 'ARCHIVED':
        return 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700';
      case 'PUBLISHED':
        return 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700';
      default:
        return 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600';
    }
  };

  const getDisplayText = (): string => {
    return normalizedStatus.replace(/_/g, ' ');
  };

  return (
    <Badge className={`border ${getColorClass()}`}>
      {getDisplayText()}
    </Badge>
  );
};
