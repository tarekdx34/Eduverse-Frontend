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
import QuestionBankService from '../../services/api/questionBankService';

interface RejectQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: number;
  questionText: string;
  onSuccess: () => void;
}

export const RejectQuestionDialog: React.FC<RejectQuestionDialogProps> = ({
  open,
  onOpenChange,
  questionId,
  questionText,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const truncatedText = questionText.length > 150 ? questionText.substring(0, 150) + '...' : questionText;
  const charCount = reason.length;
  const isValid = charCount >= 10;
  const isSubmitDisabled = loading || !isValid;

  const handleSubmit = async () => {
    if (!isValid) return;

    try {
      setLoading(true);
      setError(null);
      await QuestionBankService.rejectQuestion(questionId, reason.trim());
      toast.success('Question rejected');
      onSuccess();
      onOpenChange(false);
      setReason('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject question';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!loading) {
      setReason('');
      setError(null);
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Question</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting this question.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Question Preview
            </p>
            <p className="text-sm bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-200 dark:border-white/10">
              {truncatedText}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="rejection-reason" className="text-sm font-medium">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {charCount}/10
              </span>
            </div>
            <textarea
              id="rejection-reason"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              placeholder="Explain why this question is being rejected..."
              className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            {charCount > 0 && charCount < 10 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Minimum 10 characters required ({10 - charCount} more needed)
              </p>
            )}
          </div>

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
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reject Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
