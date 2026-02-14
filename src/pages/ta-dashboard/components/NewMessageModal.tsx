import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

type NewMessageModalProps = {
  onClose: () => void;
  onSend: (subject: string, message: string) => void;
};

export function NewMessageModal({ onClose, onSend }: NewMessageModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const cardCls = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textCls = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputCls = isDark
    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
    : 'bg-gray-50 border-gray-300 text-gray-900';
  const btnPrimary = isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white';
  const btnSecondary = isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim() || message.trim()) {
      onSend(subject.trim() || '(No subject)', message.trim() || '(No message)');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className={`${cardCls} border rounded-xl shadow-xl max-w-md w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold ${textCls}`}>{t('newMessage')}</h3>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg ${mutedCls} ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
            aria-label={t('cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className={`block text-sm font-medium ${textCls} mb-1`}>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject"
              className={`w-full px-3 py-2 border rounded-lg ${inputCls}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textCls} mb-1`}>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Write your message..."
              className={`w-full px-3 py-2 border rounded-lg ${inputCls}`}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className={`px-4 py-2 rounded-lg ${btnSecondary} text-sm font-medium`}>
              {t('cancel')}
            </button>
            <button type="submit" className={`px-4 py-2 rounded-lg ${btnPrimary} text-sm font-medium flex items-center gap-2`}>
              {t('send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
