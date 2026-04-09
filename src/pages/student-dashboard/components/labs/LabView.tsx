import { useState, useMemo } from 'react';
import { useApi } from '../../../../hooks/useApi';
import { LabService } from '../../../../services/api/labService';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ArrowLeft, BookOpen, UserCheck, Send, Clock, AlertCircle } from 'lucide-react';
import { InstructionViewer } from './InstructionViewer';
import { SubmissionForm } from './SubmissionForm';
import { MySubmission } from './MySubmission';
import { LabStatusBadge } from './shared/LabStatusBadge';
import { AttendanceBadge } from './shared/AttendanceBadge';

interface LabViewProps {
  labId: string;
  onBack: () => void;
  isDark?: boolean;
  accentColor?: string;
}

export function LabView({ labId, onBack, isDark, accentColor = '#3b82f6' }: LabViewProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'instructions' | 'submission'>('instructions');

  const { data: lab, loading: loadingLab } = useApi(async () => {
    return LabService.getById(labId);
  }, [labId]);

  const { data: mySubmission, refetch: refetchSubmission } = useApi(async () => {
    return LabService.getMySubmission(labId);
  }, [labId]);

  const { data: attendanceList } = useApi(async () => {
    // Avoid fetching attendance for students since it returns 403 Forbidden.
    // The endpoint is restricted to INSTRUCTOR / TA roles.
    if (user?.roles?.includes('INSTRUCTOR') || user?.roles?.includes('TA') || user?.roles?.includes('ADMIN')) {
      try {
        return await LabService.getAttendance(labId);
      } catch (err) {
        return [];
      }
    }
    return [];
  }, [labId, user]);

  const myAttendance = useMemo(() => {
    if (!attendanceList || !user) return null;
    return attendanceList.find(a => Number(a.userId) === Number(user.userId)) || null;
  }, [attendanceList, user]);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loadingLab) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className={`h-10 w-32 rounded-lg ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
        <div className={`h-32 w-full rounded-2xl ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
        <div className={`h-64 w-full rounded-2xl ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
      </div>
    );
  }

  if (!lab) {
    return (
      <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-slate-100'}`}>
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Lab Not Found</h3>
        <button onClick={onBack} className="text-blue-500 hover:underline">Go back to labs list</button>
      </div>
    );
  }

  const cardClass = isDark ? 'bg-card-dark border border-white/5' : 'bg-white border border-slate-100';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 transition-colors hover:opacity-80 ${textSecondary}`}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Labs</span>
      </button>

      {/* Lab Header */}
      <div className={`rounded-2xl p-6 ${cardClass}`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className={`text-2xl font-bold ${textPrimary}`}>{lab.title}</h2>
              <LabStatusBadge status={lab.status} />
            </div>
            {lab.course && (
              <p className={textSecondary}>
                {lab.course.name} ({lab.course.code})
              </p>
            )}
            
            {/* Show personal attendance if available */}
            {myAttendance && (
               <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                 <UserCheck className={`w-4 h-4 ${textSecondary}`} />
                 <span className={`text-sm ${textSecondary}`}>My Attendance: </span>
                 <AttendanceBadge status={myAttendance.status} />
               </div>
            )}
          </div>

          <div className={`md:text-right p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <p className={`text-sm mb-1 ${textSecondary}`}>Maximum Score</p>
            <p className={`text-2xl font-bold ${textPrimary}`}>{Number(lab.maxScore)} pts</p>
            {lab.dueDate && (
               <div className={`flex items-center gap-1.5 justify-end mt-2 text-sm ${textSecondary}`}>
                 <Clock className="w-4 h-4" />
                 <span>Due: {formatDateTime(lab.dueDate)}</span>
               </div>
            )}
          </div>
        </div>

        {lab.description && (
          <div className="pt-4 border-t border-slate-200 dark:border-white/10">
            <h3 className={`font-semibold mb-2 ${textPrimary}`}>Description</h3>
            <p className={`${textSecondary}`}>{lab.description}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('instructions')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 ${
            activeTab === 'instructions'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent hover:text-blue-500 hover:border-blue-500/50 ' + textSecondary
          }`}
          style={activeTab === 'instructions' ? { borderColor: accentColor, color: accentColor } : {}}
        >
          <BookOpen className="w-4 h-4" />
          Instructions
        </button>
        <button
          onClick={() => setActiveTab('submission')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 ${
            activeTab === 'submission'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent hover:text-blue-500 hover:border-blue-500/50 ' + textSecondary
          }`}
          style={activeTab === 'submission' ? { borderColor: accentColor, color: accentColor } : {}}
        >
          <Send className="w-4 h-4" />
          {mySubmission ? 'My Submission' : 'Submit Work'}
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'instructions' ? (
          <div className={`space-y-6`}>
            {lab.instructionFiles && lab.instructionFiles.length > 0 && (
              <div className={`rounded-2xl p-6 ${cardClass}`}>
                <h3 className={`font-semibold text-lg mb-4 ${textPrimary}`}>Attached Materials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lab.instructionFiles.map(file => (
                    <div key={file.driveId} className={`flex flex-col p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2.5 rounded-lg text-white`} style={{ backgroundColor: accentColor }}>
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <span className={`font-medium text-sm truncate ${textPrimary}`} title={file.fileName}>
                          {file.fileName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-200 dark:border-white/10">
                        <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className={`flex-1 text-center px-4 py-2 rounded-lg text-xs font-medium transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-white border hover:bg-slate-50 text-slate-600'}`}>
                          Open
                        </a>
                        <a href={file.downloadUrl} className={`flex-1 text-center px-4 py-2 rounded-lg text-xs font-medium transition-colors text-white hover:opacity-90`} style={{ backgroundColor: accentColor }}>
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className={`rounded-2xl p-6 ${cardClass}`}>
              <InstructionViewer 
                instructions={lab.instructions || []} 
                isDark={isDark} 
                accentColor={accentColor} 
              />
            </div>
          </div>
        ) : (
          <div className={`rounded-2xl p-6 ${cardClass}`}>
            <h3 className={`font-semibold mb-6 text-xl ${textPrimary}`}>
              {mySubmission ? 'Submission Details' : 'Submit Lab Work'}
            </h3>
            
            {mySubmission ? (
              <MySubmission 
                submission={mySubmission} 
                maxScore={lab.maxScore} 
                isDark={isDark} 
              />
            ) : (
              <SubmissionForm 
                labId={labId} 
                isDark={isDark} 
                accentColor={accentColor} 
                onSubmitSuccess={() => refetchSubmission()} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
