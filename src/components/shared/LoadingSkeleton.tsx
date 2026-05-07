import React from 'react';
import { Skeleton } from '../ui/skeleton';

interface LoadingSkeletonProps {
  rows?: number;
  cols?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 5,
  cols = 4,
}) => {
  return (
    <div className="w-full space-y-4">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-10 flex-1 rounded"
            />
          ))}
        </div>
      ))}
    </div>
  );
};
