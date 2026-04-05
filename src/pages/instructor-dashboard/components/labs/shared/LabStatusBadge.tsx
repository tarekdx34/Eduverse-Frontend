import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { LabStatus } from '../types';

interface LabStatusBadgeProps {
  status: LabStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<LabStatus, { 
  lightBg: string; 
  lightText: string; 
  darkBg: string; 
  darkText: string;
  labelKey: string;
}> = {
  draft: {
    lightBg: 'bg-yellow-100',
    lightText: 'text-yellow-800',
    darkBg: 'bg-yellow-500/20',
    darkText: 'text-yellow-300',
    labelKey: 'draft',
  },
  published: {
    lightBg: 'bg-green-100',
    lightText: 'text-green-800',
    darkBg: 'bg-green-500/20',
    darkText: 'text-green-300',
    labelKey: 'published',
  },
  closed: {
    lightBg: 'bg-gray-100',
    lightText: 'text-gray-800',
    darkBg: 'bg-gray-500/20',
    darkText: 'text-gray-300',
    labelKey: 'closed',
  },
  archived: {
    lightBg: 'bg-slate-100',
    lightText: 'text-slate-800',
    darkBg: 'bg-slate-500/20',
    darkText: 'text-slate-400',
    labelKey: 'archived',
  },
};

export function LabStatusBadge({ status, size = 'sm' }: LabStatusBadgeProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  const config = statusConfig[status] || statusConfig.draft;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  
  const bgClass = isDark ? config.darkBg : config.lightBg;
  const textClass = isDark ? config.darkText : config.lightText;
  
  // Capitalize first letter for display
  const label = t(config.labelKey) || config.labelKey.charAt(0).toUpperCase() + config.labelKey.slice(1);
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${bgClass} ${textClass}`}>
      {label}
    </span>
  );
}

export default LabStatusBadge;
