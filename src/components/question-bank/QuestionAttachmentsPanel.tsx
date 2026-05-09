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
import { Trash2, Upload, Plus, AlertCircle } from 'lucide-react';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Attachments
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              {truncateText(questionText, 50)}
            </span>
          </DialogTitle>
          <DialogDescription>
            Manage images and files attached to this question
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {loading && <LoadingSkeleton rows={3} cols={1} />}

          {!loading && attachments.length === 0 && !addUrlMode && (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-white/10">
              <p className="text-sm text-gray-600 dark:text-gray-400">No attachments yet</p>
            </div>
          )}

          {!loading && attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-gray-600 dark:text-gray-400">
                Attachments ({attachments.length})
              </p>
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-white/10"
                >
                  {att.type === 'image' && att.url && (
                    <img
                      src={att.url}
                      alt={att.altText || 'attachment'}
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                  {att.type !== 'image' && (
                    <div className="h-12 w-12 rounded bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {att.type.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {att.caption || 'Untitled'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {att.type}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(att.id)}
                    disabled={deleteLoading === att.id}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-500/10 dark:hover:text-red-400 disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {addUrlMode && (
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-medium uppercase text-gray-600 dark:text-gray-400">
                Add URL Attachment
              </p>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Caption (optional)"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-400"
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="link">Link</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAddUrlMode(false);
                    setNewUrl('');
                    setNewCaption('');
                    setNewType('image');
                  }}
                  className="flex-1 rounded border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUrl}
                  disabled={uploadLoading || !newUrl.trim()}
                  className="flex-1 rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  {uploadLoading ? 'Adding...' : 'Add URL'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-gray-200 px-6 py-4 dark:border-white/10">
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
              className="w-full flex items-center justify-center gap-2 rounded border border-gray-300 py-2 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <Upload size={16} />
              Upload Image
            </button>
          </label>
          <button
            onClick={() => setAddUrlMode(!addUrlMode)}
            disabled={uploadLoading}
            className="flex items-center justify-center gap-2 rounded border border-gray-300 py-2 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
          >
            <Plus size={16} />
            Add URL
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded border border-gray-300 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
