import React from 'react';
import { Button } from '../ui/button';

interface Action {
  label: string;
  onClick: () => void;
  danger?: boolean;
  icon?: React.ReactNode;
}

interface BulkActionToolbarProps {
  selectedCount: number;
  actions: Action[];
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  actions,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 rounded-md border bg-background p-4 mb-4">
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            variant={action.danger ? 'destructive' : 'outline'}
            size="sm"
          >
            {action.icon && (
              <span className="mr-2">
                {action.icon}
              </span>
            )}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
