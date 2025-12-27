import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export type MessageFormData = {
  id?: number;
  from: string;
  role: string;
  content: string;
  time: string;
};

type MessageModalProps = {
  open: boolean;
  messageData: MessageFormData | null;
  onClose: () => void;
  onSave: (data: MessageFormData) => void;
  mode?: 'compose' | 'reply' | 'view';
};

export function MessageModal({
  open,
  messageData,
  onClose,
  onSave,
  mode = 'compose',
}: MessageModalProps) {
  const [formData, setFormData] = useState<MessageFormData>({
    from: 'Dr. Jane Smith',
    role: 'Instructor',
    content: '',
    time: '',
  });

  useEffect(() => {
    if (messageData && mode === 'view') {
      setFormData(messageData);
    } else if (messageData && mode === 'reply') {
      setFormData({
        from: 'Dr. Jane Smith',
        role: 'Instructor',
        content: '',
        time: '',
      });
    } else {
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setFormData({
        from: 'Dr. Jane Smith',
        role: 'Instructor',
        content: '',
        time: timeStr,
      });
    }
  }, [messageData, open, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    onSave({ ...formData, time: timeStr });
  };

  if (!open) return null;

  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'compose'
              ? 'Compose Message'
              : mode === 'reply'
                ? 'Reply to Message'
                : 'View Message'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {mode === 'reply' && messageData && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md border-l-4 border-indigo-500">
              <div className="text-sm text-gray-600 mb-1">Replying to:</div>
              <div className="font-semibold">{messageData.from}</div>
              <div className="text-sm text-gray-600 mt-2">{messageData.content}</div>
            </div>
          )}

          {isViewMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <div className="text-gray-900">
                  {formData.from} ({formData.role})
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <div className="text-gray-900">{formData.time}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <div className="text-gray-900 whitespace-pre-wrap">{formData.content}</div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Content
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Type your message here..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageModal;
