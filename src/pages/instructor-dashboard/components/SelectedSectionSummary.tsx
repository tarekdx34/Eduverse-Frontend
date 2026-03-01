import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export type SectionSummary = {
  courseCode: string;
  courseName: string;
  sectionLabel: string;
  schedule: string;
  capacity: number;
  enrolled: number;
};

export function SelectedSectionSummary({ section }: { section: SectionSummary | null }) {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  if (!section) return null;
  return (
    <div className={`rounded-lg border p-4 mb-4 ${isDark ? 'bg-card-dark border-white/10' : 'bg-white border-gray-200'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Selected Section</div>
          <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{section.courseName} • {section.sectionLabel}</div>
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{section.courseCode} • {section.schedule}</div>
        </div>
        <div className="text-sm">
          <span
            className="px-2 py-1 rounded"
            style={{
              backgroundColor: isDark ? `${primaryHex}26` : `${primaryHex}1A`,
              color: primaryHex,
            }}
          >
            Enrolled: {section.enrolled}
          </span>
          <span className={`ml-2 px-2 py-1 rounded ${isDark ? 'bg-white/5 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>Capacity: {section.capacity}</span>
        </div>
      </div>
    </div>
  );
}

export default SelectedSectionSummary;