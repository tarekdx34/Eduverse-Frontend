import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Lab, LabStatus } from './types';
import LabStatusBadge from './shared/LabStatusBadge';
import { InstructionCard } from './shared/InstructionCard';
import {
  X,
  Calendar,
  FileText,
  Edit,
  Eye,
  Upload,
  Users,
  Clock,
  Award,
  MoreVertical,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface LabDetailProps {
  isOpen: boolean;
  lab: Lab | null;
  onClose: () => void;
  onEditClick: () => void;
  onViewSubmissions: () => void;
  onManageInstructions: () => void;
  onUploadTaMaterials: () => void;
  onViewAttendance: () => void;
}

export function LabDetail({
  isOpen,
  lab,
  onClose,
  onEditClick,
  onViewSubmissions,
  onManageInstructions,
  onUploadTaMaterials,
  onViewAttendance,
}: LabDetailProps) {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const { t, isArabic } = useLanguage();

  if (!isOpen || !lab) return null;

  // Get first 3 instructions
  const displayInstructions = (lab.instructions || []).slice(0, 3);
  const instructionCount = lab.instructions?.length || 0;

  // Format date to readable format
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const courseName = lab.course?.name || 'Unknown Course';
  const courseCode = lab.course?.code || '';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lab-detail-modal-title"
      onClick={onClose}
    >
      <div
        className={`rounded-xl w-full max-w-3xl my-8 shadow-2xl transition-colors ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== HEADER ===== */}
        <div
          className={`flex items-start justify-between p-6 border-b ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2
                id="lab-detail-modal-title"
                className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                {lab.title}
              </h2>
              <LabStatusBadge status={lab.status} size="md" />
            </div>
            {lab.labNumber && (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {t('lab') || 'Lab'} #{lab.labNumber}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label={t('close') || 'Close'}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              isDark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ===== SCROLLABLE CONTENT ===== */}
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-6 space-y-6">
          {/* ===== INFO SECTION ===== */}
          <section>
            <h3
              className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              <Clock className="w-5 h-5" style={{ color: primaryHex }} />
              {t('information') || 'Information'}
            </h3>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg ${
              isDark ? 'bg-white/5' : 'bg-gray-50'
            }`}>
              {/* Course */}
              <div>
                <p
                  className={`text-xs font-medium mb-1 ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}
                >
                  {t('course') || 'Course'}
                </p>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {courseCode && `${courseCode} - `}
                  {courseName}
                </p>
              </div>

              {/* Lab Number */}
              {lab.labNumber && (
                <div>
                  <p
                    className={`text-xs font-medium mb-1 ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}
                  >
                    {t('labNumber') || 'Lab Number'}
                  </p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    #{lab.labNumber}
                  </p>
                </div>
              )}

              {/* Available From */}
              <div>
                <p
                  className={`text-xs font-medium mb-1 flex items-center gap-1 ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  {t('availableFrom') || 'Available From'}
                </p>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatDate(lab.availableFrom)}
                </p>
              </div>

              {/* Due Date */}
              <div>
                <p
                  className={`text-xs font-medium mb-1 flex items-center gap-1 ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  {t('dueDate') || 'Due Date'}
                </p>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatDate(lab.dueDate)}
                </p>
              </div>

              {/* Max Score */}
              <div>
                <p
                  className={`text-xs font-medium mb-1 flex items-center gap-1 ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}
                >
                  <Award className="w-3 h-3" />
                  {t('maxScore') || 'Max Score'}
                </p>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {lab.maxScore} {t('points') || 'points'}
                </p>
              </div>

              {/* Weight */}
              <div>
                <p
                  className={`text-xs font-medium mb-1 ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}
                >
                  {t('weight') || 'Weight'}
                </p>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {lab.weight}%
                </p>
              </div>

              {/* Created At */}
              {lab.createdAt && (
                <div>
                  <p
                    className={`text-xs font-medium mb-1 ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}
                  >
                    {t('createdAt') || 'Created At'}
                  </p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(lab.createdAt)}
                  </p>
                </div>
              )}

              {/* Updated At */}
              {lab.updatedAt && (
                <div>
                  <p
                    className={`text-xs font-medium mb-1 ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}
                  >
                    {t('updatedAt') || 'Updated At'}
                  </p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(lab.updatedAt)}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ===== DESCRIPTION SECTION ===== */}
          {lab.description && (
            <section>
              <h3
                className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                <FileText className="w-5 h-5" style={{ color: primaryHex }} />
                {t('description') || 'Description'}
              </h3>
              <div
                className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
              >
                <p
                  className={`text-sm leading-relaxed whitespace-pre-wrap ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}
                >
                  {lab.description}
                </p>
              </div>
            </section>
          )}

          {/* ===== INSTRUCTIONS PREVIEW SECTION ===== */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-lg font-semibold flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                <FileText className="w-5 h-5" style={{ color: primaryHex }} />
                {t('instructions') || 'Instructions'}
                {instructionCount > 0 && (
                  <span
                    className={`text-sm font-normal px-2 py-1 rounded-full ${
                      isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {instructionCount}
                  </span>
                )}
              </h3>
            </div>

            {instructionCount === 0 ? (
              <div
                className={`p-6 rounded-lg text-center ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <AlertCircle
                  className={`w-10 h-10 mx-auto mb-2 ${
                    isDark ? 'text-slate-400' : 'text-gray-400'
                  }`}
                />
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {t('noInstructions') || 'No instructions added yet'}
                </p>
              </div>
            ) : (
              <>
                {/* Display first 3 instructions */}
                <div className="space-y-3 mb-4">
                  {displayInstructions.map((instruction, idx) => (
                    <InstructionCard
                      key={instruction.id}
                      instruction={instruction}
                      index={idx}
                      showActions={false}
                    />
                  ))}
                </div>

                {/* Show indicator if there are more instructions */}
                {instructionCount > 3 && (
                  <p
                    className={`text-xs font-medium mb-4 ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}
                  >
                    {t('and') || 'and'} {instructionCount - 3} {t('more') || 'more'}{' '}
                    {instructionCount - 3 === 1 ? t('instruction') : t('instructions') || 'instructions'}
                  </p>
                )}

                {/* Manage Instructions Button */}
                <button
                  onClick={onManageInstructions}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                  {t('manageInstructions') || 'Manage Instructions'}
                </button>
              </>
            )}
          </section>

          {/* ===== QUICK ACTIONS SECTION ===== */}
          <section>
            <h3
              className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              <CheckCircle className="w-5 h-5" style={{ color: primaryHex }} />
              {t('quickActions') || 'Quick Actions'}
            </h3>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Edit Lab */}
              <button
                onClick={onEditClick}
                className={`p-4 rounded-lg font-medium transition-all flex flex-col items-center gap-2 ${
                  isDark
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Edit className="w-5 h-5" />
                <span className="text-xs">{t('editLab') || 'Edit Lab'}</span>
              </button>

              {/* View Submissions */}
              <button
                onClick={onViewSubmissions}
                className={`p-4 rounded-lg font-medium transition-all flex flex-col items-center gap-2 ${
                  isDark
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Eye className="w-5 h-5" />
                <span className="text-xs">{t('viewSubmissions') || 'View Submissions'}</span>
              </button>

              {/* Upload TA Materials */}
              <button
                onClick={onUploadTaMaterials}
                className={`p-4 rounded-lg font-medium transition-all flex flex-col items-center gap-2 ${
                  isDark
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="text-xs">{t('uploadTaMaterials') || 'Upload TA Materials'}</span>
              </button>

              {/* View Attendance */}
              <button
                onClick={onViewAttendance}
                className={`p-4 rounded-lg font-medium transition-all flex flex-col items-center gap-2 ${
                  isDark
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-xs">{t('viewAttendance') || 'View Attendance'}</span>
              </button>

              {/* Manage Instructions (Secondary Button) */}
              {instructionCount > 0 && (
                <button
                  onClick={onManageInstructions}
                  className={`p-4 rounded-lg font-medium transition-all flex flex-col items-center gap-2 ${
                    isDark
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-xs">{t('manageInstructions') || 'Manage Instructions'}</span>
                </button>
              )}
            </div>
          </section>
        </div>

        {/* ===== FOOTER ===== */}
        <div
          className={`flex justify-end gap-3 p-6 border-t ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            {t('close') || 'Close'}
          </button>
          <button
            onClick={onEditClick}
            style={{ backgroundColor: primaryHex }}
            className="px-6 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
          >
            {t('edit') || 'Edit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LabDetail;
