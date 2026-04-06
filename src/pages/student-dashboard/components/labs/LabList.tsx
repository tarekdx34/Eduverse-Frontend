import { ChevronDown, Clock, FileText } from 'lucide-react';
import type { Lab } from '../../../../services/api/labService';
import { LabStatusBadge } from './shared/LabStatusBadge';
import { useLanguage } from '../../contexts/LanguageContext';

interface LabListProps {
  labs: Lab[];
  onSelectLab: (labId: string) => void;
  isDark?: boolean;
}

export function LabList({ labs, onSelectLab, isDark }: LabListProps) {
  const { language } = useLanguage();

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const cardClass = isDark
    ? 'bg-card-dark border border-white/5'
    : 'bg-white border border-slate-100';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

  const safeLabs = Array.isArray(labs) 
    ? labs 
    : (labs as any)?.data 
      ? (labs as any).data 
      : (labs as any)?.labs 
        ? (labs as any).labs 
        : [];

  if (!safeLabs || safeLabs.length === 0) {
    return (
      <div className={`rounded-2xl p-8 text-center ${cardClass}`}>
        <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>
          No Labs Available
        </h3>
        <p className={textSecondary}>No labs are currently available for this course.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {safeLabs.map((lab: Lab) => (
        <div
          key={lab.id}
          onClick={() => onSelectLab(lab.id)}
          className={`rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${cardClass}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className={`font-semibold text-lg ${textPrimary}`}>{lab.title}</h3>
              <p className={`text-sm mt-1 line-clamp-2 ${textSecondary}`}>
                {lab.description || 'No description provided.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <LabStatusBadge status={lab.status} />
                
                {lab.dueDate && (
                  <div className={`flex items-center gap-1.5 text-sm ${textSecondary}`}>
                    <Clock className="w-4 h-4" />
                    <span>Due: {formatDate(lab.dueDate)}</span>
                  </div>
                )}
                
                <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Max Score: {Number(lab.maxScore)} pts
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors">
              <ChevronDown className="w-5 h-5 -rotate-90" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
