import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'table' | 'text' | 'avatar';
  count?: number;
  className?: string;
}

function SkeletonPulse({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export function LoadingSkeleton({ variant = 'card', count = 1, className = '' }: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((i) => (
          <div key={i} className="space-y-2">
            <SkeletonPulse className="h-4 w-3/4" />
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <SkeletonPulse className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <SkeletonPulse className="h-4 w-1/3" />
          <SkeletonPulse className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
            <SkeletonPulse className="h-10 w-10 rounded" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-4 w-2/3" />
              <SkeletonPulse className="h-3 w-1/2" />
            </div>
            <SkeletonPulse className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex gap-4 p-3 border-b border-gray-100">
          {[1, 2, 3, 4].map((col) => (
            <SkeletonPulse key={col} className="h-4 flex-1" />
          ))}
        </div>
        {items.map((i) => (
          <div key={i} className="flex gap-4 p-3">
            {[1, 2, 3, 4].map((col) => (
              <SkeletonPulse key={col} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Default: card variant
  return (
    <div className={`grid gap-4 ${count > 1 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''} ${className}`}>
      {items.map((i) => (
        <div key={i} className="p-4 rounded-lg border border-gray-100 space-y-3">
          <SkeletonPulse className="h-32 w-full rounded" />
          <SkeletonPulse className="h-5 w-3/4" />
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-2/3" />
          <div className="flex gap-2 pt-2">
            <SkeletonPulse className="h-8 w-20 rounded-md" />
            <SkeletonPulse className="h-8 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
