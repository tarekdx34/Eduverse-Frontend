import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { LoadingSkeleton } from '../shared';
import QuestionBankService from '../../services/api/questionBankService';
import { Trash2, Upload, Plus, AlertCircle, Paperclip, Layers } from 'lucide-react';

interface Attachment {
  id: number;
  type: string;
  url?: string;
  caption?: string;
  altText?: string;
}

export interface QuestionAttachmentsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: number;
  questionText: string;
}

export function QuestionAttachmentsPanel({
  open,
  onOpenChange,
  questionId,
  questionText,
}: QuestionAttachmentsPanelProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [addUrlMode, setAddUrlMode] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newType, setNewType] = useState('image');

  useEffect(() => {
    if (!open || questionId === 0) return;
    loadAttachments();
  }, [open, questionId]);

  const loadAttachments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await QuestionBankService.getById(questionId);
      const question = response?.data || response;
      setAttachments(question?.attachments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const result = await QuestionBankService.uploadImageAttachment(questionId, file);
      // The API returns the newly created attachment, add it to the list
      const newAttachment: Attachment = {
        id: result?.fileId || Date.now(),
        type: 'image',
        url: result?.url || '',
        caption: file.name,
        altText: file.name,
      };
      setAttachments([...attachments, newAttachment]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAddUrl = async () => {
    if (!newUrl.trim()) {
      setError('URL is required');
      return;
    }

    setUploadLoading(true);
    try {
      const result = await QuestionBankService.addAttachment(questionId, {
        url: newUrl,
        type: newType,
        caption: newCaption,
      });
      const newAttachment: Attachment = {
        id: result?.id || Date.now(),
        type: newType,
        url: newUrl,
        caption: newCaption,
        altText: newCaption,
      };
      setAttachments([...attachments, newAttachment]);
      setNewUrl('');
      setNewCaption('');
      setNewType('image');
      setAddUrlMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add attachment');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    setDeleteLoading(attachmentId);
    try {
      await QuestionBankService.deleteAttachment(questionId, attachmentId);
      setAttachments(attachments.filter(a => a.id !== attachmentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete attachment');
    } finally {
      setDeleteLoading(null);
    }
  };

  const truncateText = (text: string, maxLen: number) =>
    text.length > maxLen ? text.slice(0, maxLen) + '…' : text;

  const isDark = document.documentElement.classList.contains('dark');
  const headingClass = isDark ? 'text-slate-100' : 'text-slate-900';
  const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderColor = isDark ? 'border-white/10' : 'border-slate-200';
  const bgSoft = isDark ? 'bg-white/5' : 'bg-slate-50';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl max-h-[90vh] flex flex-col rounded-3xl p-0 overflow-hidden ${isDark ? 'bg-slate-950 border-white/10 shadow-2xl shadow-indigo-500/10' : 'bg-white border-slate-200 shadow-2xl shadow-slate-200'}`}>
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <Paperclip size={20} />
            </div>
            <DialogTitle className={`text-xl font-bold tracking-tight flex items-center gap-3 ${headingClass}`}>
              Resource Library
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                {truncateText(questionText, 30)}
              </span>
            </DialogTitle>
          </div>
          <DialogDescription className={`text-sm ${subTextClass}`}>
            Manage external assets, visual aids, and documentation for this evaluation artifact.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 pb-4 space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
              <p className="text-sm font-medium text-rose-700 dark:text-rose-200">{error}</p>
            </div>
          )}

          {loading && <LoadingSkeleton rows={3} cols={1} />}

          {!loading && attachments.length === 0 && !addUrlMode && (
            <div className={`rounded-3xl border-2 border-dashed p-12 text-center transition-colors ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
              <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-white/5 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                <Paperclip size={24} />
              </div>
              <p className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                No resources linked yet
              </p>
            </div>
          )}

          {!loading && attachments.length > 0 && (
            <div className="space-y-3">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                Active Attachments ({attachments.length})
              </p>
              <div className="grid grid-cols-1 gap-3">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className={`group flex items-center gap-4 rounded-2xl border p-3 transition-all hover:scale-[1.01] ${
                      isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50'
                    }`}
                  >
                    {att.type === 'image' && att.url && (
                      <img
                        src={att.url}
                        alt={att.altText || 'attachment'}
                        className="h-14 w-14 rounded-xl object-cover border border-white/10 shadow-lg"
                      />
                    )}
                    {att.type !== 'image' && (
                      <div className={`h-14 w-14 rounded-xl flex items-center justify-center border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                        <span className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {att.type.slice(0, 3).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold tracking-tight truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {att.caption || 'Untitled Resource'}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isDark ? 'text-indigo-400/60' : 'text-indigo-500/60'}`}>
                        Source: {att.type}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(att.id)}
                      disabled={deleteLoading === att.id}
                      className={`p-3 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${
                        isDark ? 'text-slate-500 hover:text-rose-500 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      } disabled:opacity-50`}
                    >
                      {deleteLoading === att.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {addUrlMode && (
            <div className={`space-y-4 rounded-2xl border p-6 ${isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                Inject Remote Resource
              </p>
              <div className="grid gap-3">
                <input
                  type="url"
                  placeholder="Remote URL (https://...)"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className={`w-full h-11 px-4 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
                    isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-600 focus:ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-indigo-500/10'
                  }`}
                />
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Context / Caption"
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className={`flex-1 h-11 px-4 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
                      isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-600 focus:ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-indigo-500/10'
                    }`}
                  />
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className={`h-11 px-4 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
                      isDark ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500/10'
                    }`}
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                    <option value="link">Link</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setAddUrlMode(false);
                    setNewUrl('');
                    setNewCaption('');
                    setNewType('image');
                  }}
                  className={`flex-1 h-11 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUrl}
                  disabled={uploadLoading || !newUrl.trim()}
                  className={`flex-1 h-11 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    isDark ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                  }`}
                >
                  {uploadLoading ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Source'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`flex gap-3 border-t p-8 ${borderColor} ${bgSoft}`}>
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadLoading}
              className="hidden"
            />
            <button
              onClick={(e) => e.currentTarget.previousSibling?.click()}
              disabled={uploadLoading}
              className={`w-full h-11 flex items-center justify-center gap-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
              } disabled:opacity-50`}
            >
              <Upload size={14} />
              Local Upload
            </button>
          </label>
          <button
            onClick={() => setAddUrlMode(!addUrlMode)}
            disabled={uploadLoading}
            className={`flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
              isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
            } disabled:opacity-50`}
          >
            <Plus size={14} />
            Add URL
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className={`px-8 h-11 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
