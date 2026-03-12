import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  accentColor?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, text, accentColor = '#3b82f6', position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-current',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-current',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-current',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-current',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-[100] px-2 py-1 text-xs font-semibold text-white whitespace-nowrap rounded shadow-lg animate-in fade-in zoom-in duration-200 ${positionClasses[position]}`}
             style={{ backgroundColor: accentColor }}>
          {text}
          <div className={`absolute border-4 border-transparent ${arrowClasses[position]}`}
               style={{ color: accentColor }} />
        </div>
      )}
    </div>
  );
}
