import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { AttendanceStatus } from '../types';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

interface AttendanceBadgeProps {
  status: AttendanceStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

const statusConfig: Record<AttendanceStatus, {
  lightBg: string;
  lightText: string;
  darkBg: string;
  darkText: string;
  icon: React.ElementType;
  labelKey: string;
}> = {
  present: {
    lightBg: 'bg-green-100',
    lightText: 'text-green-700',
    darkBg: 'bg-green-500/20',
    darkText: 'text-green-400',
    icon: Check,
    labelKey: 'present',
  },
  absent: {
    lightBg: 'bg-red-100',
    lightText: 'text-red-700',
    darkBg: 'bg-red-500/20',
    darkText: 'text-red-400',
    icon: X,
    labelKey: 'absent',
  },
  late: {
    lightBg: 'bg-yellow-100',
    lightText: 'text-yellow-700',
    darkBg: 'bg-yellow-500/20',
    darkText: 'text-yellow-400',
    icon: Clock,
    labelKey: 'late',
  },
  excused: {
    lightBg: 'bg-blue-100',
    lightText: 'text-blue-700',
    darkBg: 'bg-blue-500/20',
    darkText: 'text-blue-400',
    icon: AlertCircle,
    labelKey: 'excused',
  },
};

export function AttendanceBadge({ status, size = 'sm', showIcon = true }: AttendanceBadgeProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  const config = statusConfig[status];
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  
  const bgClass = isDark ? config.darkBg : config.lightBg;
  const textClass = isDark ? config.darkText : config.lightText;
  
  const label = t(config.labelKey) || config.labelKey.charAt(0).toUpperCase() + config.labelKey.slice(1);
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses} ${bgClass} ${textClass}`}>
      {showIcon && <Icon className={iconSize} />}
      {label}
    </span>
  );
}

export default AttendanceBadge;
