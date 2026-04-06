import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AssignmentList from './AssignmentList';
import AssignmentView from './AssignmentView';

/**
 * AssignmentsPage - Main container that switches between list and detail views
 */
export function AssignmentsPage() {
  const { isDark } = useTheme() as { isDark: boolean };
  const { t } = useLanguage();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  if (selectedAssignmentId) {
    return (
      <AssignmentView
        assignmentId={selectedAssignmentId}
        onBack={() => setSelectedAssignmentId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('stayOnTop') || 'Assignments'}
        </h1>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Track your progress, manage deadlines, and achieve your academic goals
        </p>
      </div>

      {/* Assignment List */}
      <AssignmentList onSelectAssignment={setSelectedAssignmentId} />
    </div>
  );
}

export default AssignmentsPage;
