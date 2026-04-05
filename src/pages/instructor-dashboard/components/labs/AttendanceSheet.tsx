import React, { useState, useMemo } from 'react';
import { X, Search, Users, Check, Save } from 'lucide-react';
import { useLabAttendance } from './hooks/useLabAttendance';
import { AttendanceBadge } from './shared/AttendanceBadge';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'sonner';
import { Lab } from './types';

interface AttendanceSheetProps {
  isOpen: boolean;
  lab: Lab;
  onClose: () => void;
}

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  email: string;
  status: AttendanceStatus;
  notes: string;
  lastUpdated: string;
}

export const AttendanceSheet: React.FC<AttendanceSheetProps> = ({
  isOpen,
  lab,
  onClose,
}) => {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    attendance,
    isLoading,
    isSaved,
    updateAttendance,
    markAllPresent,
  } = useLabAttendance(lab.id, isOpen);

  // Filter attendance records based on search query
  const filteredAttendance = useMemo(() => {
    if (!attendance) return [];
    
    return attendance.filter((record) =>
      record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [attendance, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!attendance || attendance.length === 0) {
      return {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      };
    }

    return {
      total: attendance.length,
      present: attendance.filter((r) => r.status === 'Present').length,
      absent: attendance.filter((r) => r.status === 'Absent').length,
      late: attendance.filter((r) => r.status === 'Late').length,
      excused: attendance.filter((r) => r.status === 'Excused').length,
    };
  }, [attendance]);

  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    updateAttendance(studentId, newStatus);
    setHasUnsavedChanges(true);

    toast.success(
      lang === 'ar'
        ? `تم تحديث الحضور إلى ${newStatus}`
        : `Attendance updated to ${newStatus}`
    );
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    updateAttendance(studentId, undefined, notes);
    setHasUnsavedChanges(true);
  };

  const handleMarkAllPresent = async () => {
    setIsSaving(true);
    try {
      await markAllPresent();
      setHasUnsavedChanges(false);
      toast.success(
        lang === 'ar'
          ? 'تم وضع علامة على الجميع كحاضرين'
          : 'All students marked as present'
      );
    } catch (error) {
      toast.error(
        lang === 'ar'
          ? 'فشل تحديث الحضور'
          : 'Failed to update attendance'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          theme === 'dark' ? 'bg-black/50' : 'bg-white/50'
        }`}
      >
        <div
          className={`max-h-[90vh] max-w-4xl w-full rounded-lg p-6 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}
        >
          <div className="space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3 animate-pulse" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-300 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!attendance || attendance.length === 0) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          theme === 'dark' ? 'bg-black/50' : 'bg-white/50'
        }`}
      >
        <div
          className={`max-h-[90vh] max-w-4xl w-full rounded-lg p-8 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {lang === 'ar' ? 'ورقة الحضور' : 'Attendance Sheet'}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-200 ${
                theme === 'dark' ? 'hover:bg-gray-700' : ''
              }`}
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <p
                className={`text-lg ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {lang === 'ar'
                  ? 'لا توجد طلاب مسجلين في هذه المعمل'
                  : 'No students enrolled in this lab'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        theme === 'dark' ? 'bg-black/50' : 'bg-white/50'
      }`}
    >
      <div
        className={`max-h-[90vh] max-w-4xl w-full rounded-lg overflow-hidden flex flex-col ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            theme === 'dark'
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div>
            <h2
              className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {lang === 'ar' ? 'ورقة الحضور' : 'Attendance Sheet'}
            </h2>
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {lab.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Statistics */}
          <div
            className={`px-6 py-4 border-b grid grid-cols-5 gap-4 ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <StatCard
              label={lang === 'ar' ? 'الإجمالي' : 'Total'}
              value={stats.total}
              theme={theme}
            />
            <StatCard
              label={lang === 'ar' ? 'حاضر' : 'Present'}
              value={stats.present}
              theme={theme}
              color="text-green-600"
            />
            <StatCard
              label={lang === 'ar' ? 'غائب' : 'Absent'}
              value={stats.absent}
              theme={theme}
              color="text-red-600"
            />
            <StatCard
              label={lang === 'ar' ? 'متأخر' : 'Late'}
              value={stats.late}
              theme={theme}
              color="text-yellow-600"
            />
            <StatCard
              label={lang === 'ar' ? 'معاف' : 'Excused'}
              value={stats.excused}
              theme={theme}
              color="text-blue-600"
            />
          </div>

          {/* Search and Actions */}
          <div
            className={`px-6 py-4 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="flex gap-4 items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <Search
                  size={20}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}
                />
                <input
                  type="text"
                  placeholder={
                    lang === 'ar'
                      ? 'ابحث عن طالب...'
                      : 'Search student...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Mark All Present Button */}
              <button
                onClick={handleMarkAllPresent}
                disabled={isSaving}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                  isSaving
                    ? 'opacity-50 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Check size={18} />
                <span className="hidden sm:inline">
                  {lang === 'ar' ? 'الكل حاضر' : 'Mark All'}
                </span>
              </button>

              {/* Save Indicator */}
              {isSaved && (
                <div className="flex items-center gap-2 text-green-600">
                  <Save size={18} />
                  <span className="text-sm font-medium hidden sm:inline">
                    {lang === 'ar' ? 'تم الحفظ' : 'Saved'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className={`${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-100 border-gray-200'
                } border-b sticky top-0`}
              >
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-sm font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {lang === 'ar' ? 'اسم الطالب' : 'Student Name'}
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-sm font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-sm font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {lang === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-sm font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {lang === 'ar' ? 'ملاحظات' : 'Notes'}
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-sm font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {lang === 'ar' ? 'آخر تحديث' : 'Last Updated'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record, index) => (
                  <tr
                    key={record.studentId}
                    className={`border-b transition-colors ${
                      theme === 'dark'
                        ? `border-gray-700 ${
                            index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'
                          } hover:bg-gray-700`
                        : `border-gray-200 ${
                            index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                          } hover:bg-gray-100`
                    }`}
                  >
                    <td
                      className={`px-6 py-4 text-sm font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {record.studentName}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {record.email}
                    </td>
                    <td className="px-6 py-4">
                      <StatusDropdown
                        value={record.status}
                        onChange={(status) =>
                          handleStatusChange(record.studentId, status)
                        }
                        theme={theme}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={record.notes}
                        onChange={(e) =>
                          handleNotesChange(record.studentId, e.target.value)
                        }
                        placeholder={
                          lang === 'ar' ? 'أضف ملاحظة...' : 'Add note...'
                        }
                        className={`w-full px-3 py-1 rounded text-sm border transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {formatDate(record.lastUpdated, lang)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex justify-end gap-3 ${
            theme === 'dark'
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
            }`}
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
          {hasUnsavedChanges && (
            <div
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-yellow-900/30 text-yellow-400'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {lang === 'ar' ? 'توجد تغييرات غير محفوظة' : 'Unsaved changes'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Statistic Card Component
 */
interface StatCardProps {
  label: string;
  value: number;
  theme: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, theme, color = '' }) => (
  <div
    className={`p-4 rounded-lg border ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-gray-50 border-gray-200'
    }`}
  >
    <p
      className={`text-xs font-medium uppercase tracking-wide mb-2 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}
    >
      {label}
    </p>
    <p className={`text-2xl font-bold ${color || (theme === 'dark' ? 'text-white' : 'text-gray-900')}`}>
      {value}
    </p>
  </div>
);

/**
 * Status Dropdown Component
 */
interface StatusDropdownProps {
  value: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
  theme: string;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, onChange, theme }) => {
  const options: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Excused'];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AttendanceStatus)}
      className={`px-3 py-1 rounded text-sm border font-medium transition-colors ${
        theme === 'dark'
          ? 'bg-gray-700 border-gray-600 text-white'
          : 'bg-white border-gray-300 text-gray-900'
      }`}
    >
      {options.map((status) => (
        <option key={status} value={status}>
          <AttendanceBadge status={status} />
        </option>
      ))}
    </select>
  );
};

/**
 * Format date utility
 */
const formatDate = (dateString: string, lang: string): string => {
  try {
    const date = new Date(dateString);
    if (lang === 'ar') {
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};
