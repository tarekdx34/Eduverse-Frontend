import React, { useState } from 'react';
import { Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
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

  const isDark = document.documentElement.classList.contains('dark');
  const headingClass = isDark ? 'text-slate-100' : 'text-slate-900';
  const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderColor = isDark ? 'border-white/10' : 'border-slate-200';
  const bgSoft = isDark ? 'bg-white/5' : 'bg-slate-50';

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
      <DialogContent className={`max-w-md rounded-3xl p-0 overflow-hidden ${isDark ? 'bg-slate-950 border-white/10 shadow-2xl shadow-rose-500/10' : 'bg-white border-slate-200'}`}>
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
              <XCircle size={20} />
            </div>
            <DialogTitle className={`text-xl font-bold tracking-tight ${headingClass}`}>Reject Question</DialogTitle>
          </div>
          <DialogDescription className={`text-sm ${subTextClass}`}>
            Provide a reason for rejecting this question.
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 space-y-6">
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-widest block mb-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              Question Preview
            </label>
            <p className={`text-sm p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              {truncatedText}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="rejection-reason" className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[10px] font-bold ${charCount < 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
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
              className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4">
              <p className="text-xs font-medium text-rose-700 dark:text-rose-200">{error}</p>
            </div>
          )}
        </div>

        <div className={`mt-6 flex items-center justify-end gap-3 border-t p-6 ${borderColor} ${bgSoft}`}>
          <button
            type="button"
            onClick={() => handleClose(false)}
            disabled={loading}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isSubmitDisabled 
                ? 'opacity-50 cursor-not-allowed bg-slate-400 text-white' 
                : 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
            }`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Reject Question
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
