import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export type NewLabData = {
  courseId: string;
  courseName: string;
  labNumber: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'active' | 'completed';
  instructions: string;
};

type CreateLabModalProps = {
  onClose: () => void;
  onCreate: (data: NewLabData) => void;
  courseOptions: { id: string; name: string }[];
};

export function CreateLabModal({ onClose, onCreate, courseOptions }: CreateLabModalProps) {
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(courseOptions[0]?.id ?? '');
  const [labNumber, setLabNumber] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [instructions, setInstructions] = useState('');
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

  const courseName = courseOptions.find((c) => c.id === courseId)?.name ?? '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      courseId,
      courseName,
      labNumber,
      title: title || `Lab ${labNumber}`,
      date: date || new Date().toISOString().slice(0, 10),
      time: time || '10:00 AM - 12:00 PM',
      location: location || 'TBD',
      status: 'upcoming',
      instructions: instructions || '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className={`${cardCls} border rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold ${textCls}`}>{t('createNewLab')}</h3>
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
            <label htmlFor="create-lab-course" className={`block text-sm font-medium ${textCls} mb-1`}>{t('course')}</label>
            <select
              id="create-lab-course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${inputCls}`}
              autoFocus
            >
              {courseOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${textCls} mb-1`}>{t('lab')} #</label>
            <input
              type="number"
              min={1}
              value={labNumber}
              onChange={(e) => setLabNumber(parseInt(e.target.value, 10) || 1)}
              className={`w-full px-3 py-2 border rounded-lg ${inputCls}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textCls} mb-1`}>{t('lab')} {t('title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lab 1: Basic Syntax"
              className={`w-full px-3 py-2 border rounded-lg ${inputCls}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${textCls} mb-1`}>{t('dateTime')}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${inputCls}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textCls} mb-1`}>Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:00 AM - 12:00 PM"
                className={`w-full px-3 py-2 border rounded-lg ${inputCls}`}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${textCls} mb-1`}>{t('location')}</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${inputCls}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textCls} mb-1`}>{t('instructions')}</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg ${inputCls}`}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className={`px-4 py-2 rounded-lg ${btnSecondary} text-sm font-medium`}>
              {t('cancel')}
            </button>
            <button type="submit" className={`px-4 py-2 rounded-lg ${btnPrimary} text-sm font-medium`}>
              {t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
