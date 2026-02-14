import React, { useState } from 'react';
import { ArrowLeft, Beaker, Calendar, MapPin, FileText, User, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

type LabMaterial = { id: string; name: string; type: string; url: string };
type Lab = {
  id: string;
  courseId: string;
  courseName: string;
  labNumber: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  instructions?: string;
  materials?: LabMaterial[];
  submissionCount: number;
  gradedCount: number;
  attendanceCount: number;
};
type Submission = {
  id: string;
  labId: string;
  studentName: string;
  submittedAt: string;
  files: { name: string; size: string }[];
  status: string;
  grade?: number;
  feedback?: string;
};

type LabDetailViewProps = {
  lab: Lab;
  submissions: Submission[];
  onBack: () => void;
  onGrade: (submissionId: string) => void;
};

export function LabDetailView({ lab, submissions, onBack, onGrade }: LabDetailViewProps) {
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const cardCls = isDark ? 'bg-gray-800 border-gray-700 shadow-sm' : 'bg-white border-gray-200 shadow-sm';
  const textCls = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderCls = isDark ? 'border-gray-700' : 'border-gray-200';
  const btnPrimary = isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white';
  const linkCls = isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-lg border ${borderCls} ${cardCls} ${mutedCls} ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'} transition-colors`}
          aria-label={t('back')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className={`text-2xl font-bold ${textCls}`}>{lab.title}</h2>
          <p className={`${mutedCls} mt-1`}>{lab.courseName} • {t('lab')} #{lab.labNumber}</p>
        </div>
      </div>

      <div className={`${cardCls} border rounded-lg p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className={`w-5 h-5 ${mutedCls}`} />
            <div>
              <p className={`text-sm ${mutedCls}`}>{t('dateTime')}</p>
              <p className={textCls}>{lab.date} • {lab.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className={`w-5 h-5 ${mutedCls}`} />
            <div>
              <p className={`text-sm ${mutedCls}`}>{t('location')}</p>
              <p className={textCls}>{lab.location}</p>
            </div>
          </div>
        </div>

        {lab.instructions && (
          <div className="mb-6">
            <h3 className={`text-sm font-semibold ${textCls} mb-2`}>{t('instructions')}</h3>
            <p className={`text-sm ${mutedCls} whitespace-pre-wrap`}>{lab.instructions}</p>
          </div>
        )}

        {(lab.materials?.length ?? 0) > 0 && (
          <div className="mb-6">
            <h3 className={`text-sm font-semibold ${textCls} mb-2`}>{t('materials')}</h3>
            <ul className="space-y-2">
              {lab.materials!.map((m) => (
                <li key={m.id} className={`flex items-center gap-2 text-sm ${mutedCls}`}>
                  <FileText className="w-4 h-4" />
                  <span>{m.name}</span>
                  <a href={m.url} className={linkCls} target="_blank" rel="noopener noreferrer">{t('open')}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => setShowAttendanceModal(true)}
          className={`flex items-center gap-2 ${btnPrimary} px-4 py-2 rounded-lg text-sm font-medium`}
        >
          <CheckCircle className="w-4 h-4" />
          {t('markAttendance')}
        </button>
      </div>

      <div className={`${cardCls} border rounded-lg p-6`}>
        <h3 className={`text-lg font-semibold ${textCls} mb-4`}>{t('submissions')} ({submissions.length})</h3>
        <div className="space-y-3">
          {submissions.length === 0 ? (
            <p className={mutedCls}>{t('noSubmissionsFound')}</p>
          ) : (
            submissions.map((sub) => (
              <div
                key={sub.id}
                className={`flex items-center justify-between p-4 border ${borderCls} rounded-lg`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                    <User className={`w-5 h-5 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${textCls}`}>{sub.studentName}</p>
                    <p className={`text-xs ${mutedCls}`}>{new Date(sub.submittedAt).toLocaleString()}</p>
                    {sub.grade != null && (
                      <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Grade: {sub.grade}%</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onGrade(sub.id)}
                  className={`${linkCls} text-sm font-medium`}
                >
                  {sub.status === 'graded' ? t('editGrade') : t('manualGrade')}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAttendanceModal(false)}>
          <div
            className={`${cardCls} border rounded-xl shadow-xl max-w-sm w-full p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-lg font-semibold ${textCls} mb-2`}>{t('markAttendance')}</h3>
            <p className={`text-sm ${mutedCls} mb-4`}>Attendance marked for this lab session.</p>
            <button
              onClick={() => setShowAttendanceModal(false)}
              className={`${btnPrimary} w-full py-2 rounded-lg text-sm font-medium`}
            >
              {t('save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
