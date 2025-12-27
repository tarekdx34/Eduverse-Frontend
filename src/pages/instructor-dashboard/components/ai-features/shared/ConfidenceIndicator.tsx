import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface ConfidenceIndicatorProps {
  confidence: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceIndicator({
  confidence,
  showLabel = true,
  size = 'md',
}: ConfidenceIndicatorProps) {
  const getColor = () => {
    if (confidence >= 80) return 'green';
    if (confidence >= 60) return 'yellow';
    return 'red';
  };

  const getIcon = () => {
    const color = getColor();
    const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;

    if (color === 'green') return <CheckCircle size={iconSize} className="text-green-600" />;
    if (color === 'yellow') return <AlertCircle size={iconSize} className="text-yellow-600" />;
    return <XCircle size={iconSize} className="text-red-600" />;
  };

  const getLabel = () => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const colorClasses = {
    green: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      bar: 'bg-green-500',
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      bar: 'bg-yellow-500',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      bar: 'bg-red-500',
    },
  };

  const color = getColor();
  const classes = colorClasses[color];
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className="flex items-center gap-2">
      {/* Icon */}
      {getIcon()}

      {/* Badge */}
      <div
        className={`${classes.bg} ${classes.text} rounded-full ${sizeClasses[size]} font-medium flex items-center gap-2`}
      >
        <span>{confidence}%</span>
        {showLabel && size !== 'sm' && (
          <>
            <span className="text-gray-400">•</span>
            <span>{getLabel()}</span>
          </>
        )}
      </div>

      {/* Progress Bar (optional for larger sizes) */}
      {size === 'lg' && (
        <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${classes.bar} transition-all duration-300`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default ConfidenceIndicator;
