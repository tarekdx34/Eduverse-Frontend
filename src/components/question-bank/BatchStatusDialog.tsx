import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import QuestionBankService from '../../services/api/questionBankService';

interface BatchStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: number[];
  onSuccess: () => void;
}

type QuestionStatus = 'draft' | 'under_review' | 'approved' | 'rejected' | 'archived';

const STATUS_OPTIONS: { value: QuestionStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' },
];

export const BatchStatusDialog: React.FC<BatchStatusDialogProps> = ({
  open,
  onOpenChange,
  selectedIds,
  onSuccess,
}) => {
  const [status, setStatus] = useState<QuestionStatus>('draft');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      await QuestionBankService.batchUpdateStatus(selectedIds, status);

      setProgress(100);
      toast.success(`${selectedIds.length} questions updated`);
      onSuccess();
      onOpenChange(false);
      setStatus('draft');
      setProgress(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update questions';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!loading) {
      setStatus('draft');
      setProgress(0);
      setError(null);
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Question Status</DialogTitle>
          <DialogDescription>
            Update the status for {selectedIds.length} selected question{selectedIds.length !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="status-select" className="text-sm font-medium block mb-2">
              New Status
            </label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as QuestionStatus);
                setError(null);
              }}
              disabled={loading}
            >
              <SelectTrigger id="status-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Updating questions...</span>
                <span className="text-gray-500 dark:text-gray-400">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-500/10 p-3">
              <p className="text-xs text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
