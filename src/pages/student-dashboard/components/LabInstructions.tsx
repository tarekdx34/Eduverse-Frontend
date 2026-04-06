import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../../../hooks/useApi';
import { enrollmentService } from '../../../services/api/enrollmentService';
import { LabService } from '../../../services/api/labService';
import { BookOpen } from 'lucide-react';
import { LabList } from './labs/LabList';
import { LabView } from './labs/LabView';

export function LabInstructions() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);

  const { data: enrolledCourses, loading: loadingCourses } = useApi(
    () => enrollmentService.getMyCourses(),
    []
  );

  useEffect(() => {
    if (!selectedCourseId && enrolledCourses?.length) {
      const first = enrolledCourses[0];
      setSelectedCourseId(String(first.course?.id || ''));
    }
  }, [enrolledCourses, selectedCourseId]);

  const { data: labs, loading: loadingLabs } = useApi(async () => {
    if (!selectedCourseId) return [];
    return LabService.getAll({ courseId: selectedCourseId });
  }, [selectedCourseId]);

  const cardClass = isDark
    ? 'bg-card-dark border border-white/5'
    : 'bg-white border border-slate-100';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

  // If a lab is selected, delegate completely to LabView
  if (selectedLabId) {
    return (
      <LabView 
        labId={selectedLabId} 
        onBack={() => setSelectedLabId(null)} 
        isDark={isDark} 
        accentColor={accentColor} 
      />
    );
  }

  // Loading skeleton for courses and list
  if (loadingCourses || loadingLabs) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Course Selector */}
        <div className={cardClass + ' rounded-2xl p-4'}>
           <div className={'h-4 w-24 mb-2 rounded ' + (isDark ? 'bg-white/10' : 'bg-slate-200')} />
           <div className={'h-10 w-full rounded-xl ' + (isDark ? 'bg-white/10' : 'bg-slate-200')} />
        </div>
        {/* Skeleton Lab Cards */}
        {[1, 2, 3].map((i) => (
           <div key={i} className={cardClass + ' rounded-2xl p-5'}>
             <div className="flex-1">
               <div className={'h-5 w-1/3 mb-4 rounded ' + (isDark ? 'bg-white/10' : 'bg-slate-200')} />
               <div className={'h-4 w-full mb-2 rounded ' + (isDark ? 'bg-white/5' : 'bg-slate-100')} />
               <div className={'h-4 w-2/3 rounded ' + (isDark ? 'bg-white/5' : 'bg-slate-100')} />
             </div>
           </div>
        ))}
      </div>
    );
  }

  if (!enrolledCourses?.length) {
    return (
      <div className={'rounded-2xl p-8 text-center ' + cardClass}>
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <h3 className={'text-lg font-semibold mb-2 ' + textPrimary}>
          No Enrolled Courses
        </h3>
        <p className={textSecondary}>Please enroll in courses to view labs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Selector */}
      <div className={'rounded-2xl p-4 ' + cardClass}>
        <label
          htmlFor="course-selector"
          className={'block text-sm font-medium mb-2 ' + textSecondary}
        >
          Select Course
        </label>
        <select
          id="course-selector"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className={
            'w-full p-3 rounded-xl border focus:ring-2 focus:border-transparent transition-all ' +
            (isDark
              ? 'bg-white/5 border-white/10 text-white'
              : 'bg-white border-slate-200 text-slate-800')
          }
          style={{ '--tw-ring-color': accentColor } as any}
        >
          {enrolledCourses.map((enrollment: any) => (
            <option key={enrollment.course?.id} value={enrollment.course?.id}>
              {enrollment.course?.name} ({enrollment.course?.code})
            </option>
          ))}
        </select>
      </div>

      {/* Lab List Delegation */}
      <LabList labs={labs || []} onSelectLab={setSelectedLabId} isDark={isDark} />
    </div>
  );
}

export default LabInstructions;
