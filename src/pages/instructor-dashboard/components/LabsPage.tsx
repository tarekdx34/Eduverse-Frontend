import React, { useState, useEffect } from 'react';
import {
  Beaker,
  Users,
  TrendingUp,
  Upload,
  Sparkles,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  FileText,
  X,
  Save,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';
import { ConfirmDialog } from './ConfirmDialog';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { LabService, Lab, LabSubmission, LabInstruction } from '../../../services/api/labService';
import { CourseService } from '../../../services/api/courseService';
import { toast } from 'sonner';

// ==================== T085/T086: Grading Modal Component ====================
interface GradingModalProps {
  isOpen: boolean;
  labTitle: string;
  maxScore: number;
  submissions: LabSubmission[];
  onGrade: (submissionId: string, score: number, feedback: string) => Promise<void>;
  onClose: () => void;
}

function GradingModal({ isOpen, labTitle, maxScore, submissions, onGrade, onClose }: GradingModalProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(
    submissions[0]?.id || null
  );
  const [gradeScore, setGradeScore] = useState<string>('');
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const selectedSubmission = submissions.find((s) => s.id === selectedSubmissionId);
  const pendingSubmissions = submissions.filter((s) => s.submissionStatus === 'submitted');

  const handleGradeSubmit = async () => {
    if (!selectedSubmissionId || !gradeScore) {
      toast.error(t('pleaseEnterScore') || 'Please enter a score');
      return;
    }
    setSaving(true);
    try {
      await onGrade(selectedSubmissionId, parseFloat(gradeScore), gradeFeedback);
      setGradeScore('');
      setGradeFeedback('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="grading-modal-title"
    >
      <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10 bg-slate-800' : 'border-gray-200 bg-gray-50'}`}>
          <div>
            <h2 id="grading-modal-title" className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('gradeSubmissions') || 'Grade Submissions'}
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{labTitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label={t('close') || 'Close'}
            className={`p-1 rounded hover:bg-opacity-20 ${isDark ? 'hover:bg-white' : 'hover:bg-gray-200'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {pendingSubmissions.length === 0 ? (
            <div className={`text-center py-8 rounded-lg border-2 border-dashed ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                {t('noSubmissionsToGrade') || 'All submissions have been graded'}
              </p>
            </div>
          ) : (
            <>
              {/* Submissions List */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  {t('selectSubmission') || 'Select Submission'}
                </label>
                <div className={`border rounded-lg overflow-y-auto max-h-48 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-white'}`}>
                  {submissions.map((submission) => (
                    <button
                      key={submission.id}
                      onClick={() => {
                        setSelectedSubmissionId(submission.id);
                        setGradeScore('');
                        setGradeFeedback('');
                      }}
                      aria-pressed={selectedSubmissionId === submission.id}
                      className={`w-full text-left px-4 py-3 border-b transition-colors ${
                        selectedSubmissionId === submission.id
                          ? isDark ? 'bg-blue-500/20 border-white/10' : 'bg-blue-50 border-gray-200'
                          : isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {submission.user?.firstName} {submission.user?.lastName}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'Not submitted'}
                      </div>
                      {submission.score && (
                        <div className="text-xs font-medium text-green-600">
                          {t('score') || 'Score'}: {submission.score}/{maxScore}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSubmission && (
                <>
                  {/* Submission Details */}
                  <div className={`p-4 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                    <h3 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('submissionDetails') || 'Submission Details'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                        <span className="font-medium">{t('student') || 'Student'}:</span>{' '}
                        {selectedSubmission.user?.firstName} {selectedSubmission.user?.lastName}
                      </div>
                      <div className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                        <span className="font-medium">{t('submittedAt') || 'Submitted At'}:</span>{' '}
                        {selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleString() : 'Not submitted'}
                      </div>
                      {selectedSubmission.submissionText && (
                        <div>
                          <span className="font-medium block mb-1">{t('submission') || 'Submission'}:</span>
                          <div className={`p-2 rounded text-sm max-h-32 overflow-y-auto ${isDark ? 'bg-white/5 text-slate-300' : 'bg-white text-gray-700'}`}>
                            {selectedSubmission.submissionText}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grading Form */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="grade-score" className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        {t('score') || 'Score'} / {maxScore}
                      </label>
                      <input
                        id="grade-score"
                        type="number"
                        min="0"
                        max={maxScore}
                        step="0.5"
                        value={gradeScore}
                        onChange={(e) => setGradeScore(e.target.value)}
                        placeholder={`${t('enterScore') || 'Enter score'} (0-${maxScore})`}
                        aria-label={t('score') || 'Score'}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-gray-300 bg-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label htmlFor="grade-feedback" className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        {t('feedback') || 'Feedback'}
                      </label>
                      <textarea
                        id="grade-feedback"
                        value={gradeFeedback}
                        onChange={(e) => setGradeFeedback(e.target.value)}
                        placeholder={t('enterFeedback') || 'Enter feedback for the student...'}
                        rows={3}
                        aria-label={t('feedback') || 'Feedback'}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-gray-300 bg-white'
                        }`}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-6 border-t ${isDark ? 'border-white/10 bg-slate-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {pendingSubmissions.length} {t('pendingSubmissions') || 'pending submissions'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('close') || 'Close'}
            </button>
            {selectedSubmission && selectedSubmission.submissionStatus === 'submitted' && (
              <button
                onClick={handleGradeSubmit}
                disabled={saving || !gradeScore}
                aria-label={t('saveGrade') || 'Save Grade'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  saving || !gradeScore ? 'opacity-50 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Save className="w-4 h-4" />
                {saving ? t('saving') || 'Saving...' : t('saveGrade') || 'Save Grade'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== T080: Lab Create/Edit Modal ====================
interface LabModalProps {
  isOpen: boolean;
  lab?: Lab | null;
  courses: { id: string; name: string; code: string }[];
  onSave: (data: Partial<Lab>) => Promise<void>;
  onClose: () => void;
}

function LabModal({ isOpen, lab, courses, onSave, onClose }: LabModalProps) {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    courseId: lab?.courseId || '',
    title: lab?.title || '',
    description: lab?.description || '',
    dueDate: lab?.dueDate ? lab.dueDate.slice(0, 16) : '',
    maxScore: lab?.maxScore || '100',
    status: lab?.status || 'draft',
  });

  useEffect(() => {
    if (lab) {
      setFormData({
        courseId: lab.courseId || '',
        title: lab.title || '',
        description: lab.description || '',
        dueDate: lab.dueDate ? lab.dueDate.slice(0, 16) : '',
        maxScore: lab.maxScore || '100',
        status: lab.status || 'draft',
      });
    } else {
      setFormData({ courseId: '', title: '', description: '', dueDate: '', maxScore: '100', status: 'draft' });
    }
  }, [lab]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId && !lab) {
      toast.error(t('courseRequired') || 'Please select a course');
      return;
    }
    if (!formData.title.trim()) {
      toast.error(t('titleRequired') || 'Title is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...formData,
        dueDate: formData.dueDate || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lab-modal-title"
    >
      <div className={`rounded-lg max-w-lg w-full ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <h2 id="lab-modal-title" className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {lab ? t('editLab') || 'Edit Lab' : t('createNewLab') || 'Create New Lab'}
          </h2>
          <button onClick={onClose} aria-label={t('close') || 'Close'} className={`p-1 rounded hover:bg-opacity-20 ${isDark ? 'hover:bg-white' : 'hover:bg-gray-200'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Course Selection - only show for new labs */}
          {!lab && (
            <div>
              <label htmlFor="lab-course" className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {t('course') || 'Course'} *
              </label>
              <select
                id="lab-course"
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                required
                aria-required="true"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'
                }`}
              >
                <option value="">{t('selectCourse') || 'Select a course...'}</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="lab-title" className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {t('title') || 'Title'} *
            </label>
            <input
              id="lab-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              aria-required="true"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'
              }`}
            />
          </div>

          <div>
            <label htmlFor="lab-description" className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {t('description') || 'Description'}
            </label>
            <textarea
              id="lab-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="lab-due-date" className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {t('dueDate') || 'Due Date'}
              </label>
              <input
                id="lab-due-date"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'
                }`}
              />
            </div>
            <div>
              <label htmlFor="lab-max-score" className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {t('maxScore') || 'Max Score'}
              </label>
              <input
                id="lab-max-score"
                type="number"
                min="0"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'
                }`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="lab-status" className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {t('status') || 'Status'}
            </label>
            <select
              id="lab-status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Lab['status'] })}
              aria-label={t('status') || 'Status'}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'
              }`}
            >
              <option value="draft">{t('draft') || 'Draft'}</option>
              <option value="published">{t('published') || 'Published'}</option>
              <option value="closed">{t('closed') || 'Closed'}</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: primaryHex }}
            >
              <Save className="w-4 h-4" />
              {saving ? t('saving') || 'Saving...' : t('save') || 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== T083: Instruction Modal ====================
interface InstructionModalProps {
  isOpen: boolean;
  labId: string;
  onSave: (data: { instructionText: string; orderIndex: number }) => Promise<void>;
  onClose: () => void;
}

function InstructionModal({ isOpen, labId, onSave, onClose }: InstructionModalProps) {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [instructionText, setInstructionText] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructionText.trim()) {
      toast.error(t('instructionRequired') || 'Instruction text is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({ instructionText, orderIndex });
      setInstructionText('');
      setOrderIndex(0);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="instruction-modal-title"
    >
      <div className={`rounded-lg max-w-lg w-full ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <h2 id="instruction-modal-title" className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('addInstruction') || 'Add Instruction'}
          </h2>
          <button onClick={onClose} aria-label={t('close') || 'Close'} className={`p-1 rounded hover:bg-opacity-20 ${isDark ? 'hover:bg-white' : 'hover:bg-gray-200'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="instruction-text" className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {t('instructionText') || 'Instruction Text'} *
            </label>
            <textarea
              id="instruction-text"
              value={instructionText}
              onChange={(e) => setInstructionText(e.target.value)}
              rows={4}
              required
              aria-required="true"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'
              }`}
            />
          </div>

          <div>
            <label htmlFor="instruction-order" className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {t('orderIndex') || 'Order Index'}
            </label>
            <input
              id="instruction-order"
              type="number"
              min="0"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'
              }`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: primaryHex }}
            >
              <Plus className="w-4 h-4" />
              {saving ? t('saving') || 'Saving...' : t('addInstruction') || 'Add Instruction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Main LabsPage Component ====================
export function LabsPage() {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();

  // State for filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'closed'>('all');
  const [courseFilter, setCourseFilter] = useState('all');

  // Modal states
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [selectedLabForGrading, setSelectedLabForGrading] = useState<Lab | null>(null);
  const [gradingSubmissions, setGradingSubmissions] = useState<LabSubmission[]>([]);
  const [instructionModalOpen, setInstructionModalOpen] = useState(false);
  const [selectedLabForInstruction, setSelectedLabForInstruction] = useState<Lab | null>(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [labToDelete, setLabToDelete] = useState<Lab | null>(null);

  // T078: Fetch labs using useApi hook with LabService.getAll()
  const { data: labs = [], loading, error, refetch } = useApi(() => LabService.getAll(), [], true);

  // Fetch all courses for the course dropdown
  const { data: allCourses = [] } = useApi(() => CourseService.getAll(), [], true);

  // T098: Handle error with toast
  useEffect(() => {
    if (error) {
      toast.error(t('errorLoadingLabs') || 'Failed to load labs');
    }
  }, [error, t]);

  // Filter labs based on search and filters
  const filteredLabs = labs.filter((lab) => {
    const matchesSearch =
      lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.course?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lab.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || lab.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || lab.courseId === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  // Get unique courses for filter (from labs) and merge with all courses
  const labCourses = Array.from(
    new Map(labs.filter((l) => l.course).map((l) => [l.course!.id, l.course!])).values()
  );
  // Merge lab courses with all courses, preferring lab courses for display
  const courses = allCourses.length > 0 
    ? allCourses.map((c: any) => ({ id: String(c.id), name: c.name, code: c.code }))
    : labCourses;

  // T087: Calculate analytics
  const getLabAnalytics = (lab: Lab) => {
    // TODO: Backend does not support lab analytics yet.
    // We are returning placeholder values until the backend provides an endpoint or includes this data in the Lab object.
    return {
      submissionCount: 0,
      averageGrade: 0,
    };
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      published: {
        color: isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800',
        label: t('active') || 'Active',
      },
      draft: {
        color: isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
        label: t('draft') || 'Draft',
      },
      closed: {
        color: isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-800',
        label: t('closed') || 'Closed',
      },
    };
    const statusInfo = statusMap[status] || statusMap.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  // T080: Handle lab creation
  const handleCreateLab = async (data: Partial<Lab>) => {
    try {
      await LabService.create(data);
      toast.success(t('labCreated') || 'Lab created successfully');
      setLabModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(t('errorCreatingLab') || 'Failed to create lab');
    }
  };

  // T081: Handle lab update
  const handleUpdateLab = async (data: Partial<Lab>) => {
    if (!editingLab) return;
    try {
      await LabService.update(editingLab.id, data);
      toast.success(t('labUpdated') || 'Lab updated successfully');
      setLabModalOpen(false);
      setEditingLab(null);
      refetch();
    } catch (err) {
      toast.error(t('errorUpdatingLab') || 'Failed to update lab');
    }
  };

  // T082: Handle lab delete with confirmation
  const handleDeleteLab = async () => {
    if (!labToDelete) return;
    try {
      await LabService.delete(labToDelete.id);
      toast.success(t('labDeleted') || 'Lab deleted successfully');
      setConfirmOpen(false);
      setLabToDelete(null);
      refetch();
    } catch (err) {
      toast.error(t('errorDeletingLab') || 'Failed to delete lab');
    }
  };

  const openDeleteConfirm = (lab: Lab) => {
    setLabToDelete(lab);
    setConfirmOpen(true);
  };

  // T085: Handle view submissions
  const handleViewSubmissions = async (lab: Lab) => {
    try {
      const submissions = await LabService.getSubmissions(lab.id);
      setSelectedLabForGrading(lab);
      setGradingSubmissions(submissions);
      setGradingModalOpen(true);
    } catch (err) {
      toast.error(t('errorLoadingSubmissions') || 'Failed to load submissions');
    }
  };

  // T086: Handle grade submission
  const handleGradeSubmission = async (submissionId: string, score: number, feedback: string) => {
    if (!selectedLabForGrading) return;
    try {
      await LabService.gradeSubmission(selectedLabForGrading.id, submissionId, score, feedback);
      toast.success(t('submissionGraded') || 'Submission graded successfully');
      const submissions = await LabService.getSubmissions(selectedLabForGrading.id);
      setGradingSubmissions(submissions);
      refetch();
    } catch (err) {
      toast.error(t('errorGradingSubmission') || 'Failed to grade submission');
    }
  };

  // T083: Handle add instruction
  const handleAddInstruction = async (data: { instructionText: string; orderIndex: number }) => {
    if (!selectedLabForInstruction) return;
    try {
      await LabService.addInstruction(selectedLabForInstruction.id, data);
      toast.success(t('instructionAdded') || 'Instruction added successfully');
      setInstructionModalOpen(false);
      setSelectedLabForInstruction(null);
      refetch();
    } catch (err) {
      toast.error(t('errorAddingInstruction') || 'Failed to add instruction');
    }
  };

  const openInstructionModal = (lab: Lab) => {
    setSelectedLabForInstruction(lab);
    setInstructionModalOpen(true);
  };

  const openEditModal = (lab: Lab) => {
    setEditingLab(lab);
    setLabModalOpen(true);
  };

  // T079: Loading skeleton
  if (loading) {
    return (
      <div className="p-6" role="status" aria-label={t('loading') || 'Loading'}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <div className={`h-8 w-48 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              <div className={`h-4 w-64 rounded animate-pulse mt-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
            </div>
            <div className={`h-10 w-32 rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
          </div>
          {/* Filter skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-12 rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
            ))}
          </div>
          {/* Cards skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`rounded-xl p-6 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-24 h-24 rounded-lg animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                  <div className="flex-1 space-y-3">
                    <div className={`h-6 w-64 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                    <div className={`h-4 w-32 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                    <div className={`h-4 w-full rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // T079: Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center py-12 rounded-xl border ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
            <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('errorLoadingLabs') || 'Failed to load labs'}
            </h3>
            <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <button
              onClick={refetch}
              aria-label={t('tryAgain') || 'Try Again'}
              className="px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: primaryHex }}
            >
              {t('tryAgain') || 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // T079: Empty state
  if (!loading && labs.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('labsManagement') || 'Labs Management'}
              </h1>
              <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {t('labsDescription') || 'Manage your lab sessions and submissions'}
              </p>
            </div>
            <button
              onClick={() => { setEditingLab(null); setLabModalOpen(true); }}
              aria-label={t('createNewLab') || 'Create New Lab'}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: primaryHex }}
            >
              <Plus size={20} />
              {t('createNewLab') || 'Create New Lab'}
            </button>
          </div>
          {/* Empty state */}
          <div className={`text-center py-16 rounded-xl border-2 border-dashed ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-300'}`}>
            <Beaker className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('noLabsYet') || 'No labs yet'}
            </h3>
            <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {t('createFirstLab') || 'Create your first lab to get started'}
            </p>
            <button
              onClick={() => { setEditingLab(null); setLabModalOpen(true); }}
              aria-label={t('createNewLab') || 'Create New Lab'}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors mx-auto"
              style={{ backgroundColor: primaryHex }}
            >
              <Plus size={20} />
              {t('createNewLab') || 'Create New Lab'}
            </button>
          </div>
        </div>

        {/* Lab Modal */}
        <LabModal
          isOpen={labModalOpen}
          lab={editingLab}
          courses={courses}
          onSave={editingLab ? handleUpdateLab : handleCreateLab}
          onClose={() => { setLabModalOpen(false); setEditingLab(null); }}
        />
      </div>
    );
  }

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with filters */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('labsManagement') || 'Labs Management'}
            </h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {t('labsDescription') || 'Manage your lab sessions and submissions'}
            </p>
          </div>
          <button
            onClick={() => { setEditingLab(null); setLabModalOpen(true); }}
            aria-label={t('createNewLab') || 'Create New Lab'}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: primaryHex }}
          >
            <Plus size={20} />
            {t('createNewLab') || 'Create New Lab'}
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CustomDropdown
            label={t('courseLabel') || 'Course'}
            value={courseFilter}
            options={[
              { value: 'all', label: t('allCourses') || 'All Courses' },
              ...courses.map((c) => ({ value: c.id, label: c.name })),
            ]}
            onChange={(v) => setCourseFilter(v)}
            stackLabel
            fullWidth
          />
          <CustomDropdown
            label={t('statusLabel') || 'Status'}
            value={statusFilter}
            options={[
              { value: 'all', label: t('all') || 'All' },
              { value: 'published', label: t('active') || 'Active' },
              { value: 'draft', label: t('draft') || 'Draft' },
              { value: 'closed', label: t('closed') || 'Closed' },
            ]}
            onChange={(v) => setStatusFilter(v as typeof statusFilter)}
            stackLabel
            fullWidth
          />
          <div className="w-full flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
            <label
              htmlFor="lab-search"
              className={`text-sm font-medium whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
            >
              {t('search') || 'Search'}
            </label>
            <div className="relative w-full">
              <Search
                className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                size={18}
                aria-hidden="true"
              />
              <input
                id="lab-search"
                type="text"
                placeholder={t('searchLabs') || 'Search labs...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t('searchLabs') || 'Search labs'}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'}`}
              />
            </div>
          </div>
        </div>

        {/* T087: Analytics Summary */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4`}>
          <div className={`rounded-lg p-4 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <Beaker className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {t('totalLabs') || 'Total Labs'}
                </p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {labs.length}
                </p>
              </div>
            </div>
          </div>
          <div className={`rounded-lg p-4 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {t('activeLabs') || 'Active Labs'}
                </p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {labs.filter((l) => l.status === 'published').length}
                </p>
              </div>
            </div>
          </div>
          <div className={`rounded-lg p-4 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {t('draftLabs') || 'Draft Labs'}
                </p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {labs.filter((l) => l.status === 'draft').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lab Cards */}
        <div className="space-y-4">
          {filteredLabs.length === 0 ? (
            <div className={`text-center py-12 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              <Search className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                {t('noLabsMatchFilter') || 'No labs match your filters'}
              </p>
            </div>
          ) : (
            filteredLabs.map((lab) => (
              <div
                key={lab.id}
                className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
                role="article"
                aria-label={lab.title}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
                    aria-hidden="true"
                  >
                    <Beaker size={32} className={isDark ? 'text-slate-400' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {lab.title}
                          </h3>
                          {lab.course && (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: isDark ? `${primaryHex}26` : `${primaryHex}1A`,
                                color: primaryHex,
                              }}
                            >
                              {lab.course.name}
                            </span>
                          )}
                          {lab.labNumber && (
                            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                              {t('lab') || 'Lab'} #{lab.labNumber}
                            </span>
                          )}
                        </div>
                        {lab.dueDate && (
                          <div className={`flex items-center gap-2 text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            <Calendar size={14} aria-hidden="true" />
                            {t('dueDate') || 'Due'}: {new Date(lab.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {getStatusBadge(lab.status)}
                    </div>
                    {lab.description && (
                      <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {lab.description}
                      </p>
                    )}
                    <div className="flex items-center gap-6 mb-4 flex-wrap">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText size={16} className={isDark ? 'text-slate-500' : 'text-gray-400'} aria-hidden="true" />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {lab.maxScore}
                        </span>
                        <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                          {t('maxScore') || 'Max Score'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleViewSubmissions(lab)}
                        aria-label={`${t('viewSubmissions') || 'View Submissions'} ${lab.title}`}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <Eye size={16} aria-hidden="true" />
                        {t('viewSubmissions') || 'View Submissions'}
                      </button>
                      <button
                        onClick={() => openEditModal(lab)}
                        aria-label={`${t('editLab') || 'Edit Lab'} ${lab.title}`}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <Edit size={16} aria-hidden="true" />
                        {t('editLab') || 'Edit Lab'}
                      </button>
                      <button
                        onClick={() => openInstructionModal(lab)}
                        aria-label={`${t('addInstruction') || 'Add Instruction'} ${lab.title}`}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <Upload size={16} aria-hidden="true" />
                        {t('addInstruction') || 'Add Instruction'}
                      </button>
                      <button
                        onClick={() => handleViewSubmissions(lab)}
                        aria-label={`${t('gradeLab') || 'Grade Lab'} ${lab.title}`}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {t('gradeLab') || 'Grade Lab'}
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(lab)}
                        aria-label={`${t('deleteLab') || 'Delete Lab'} ${lab.title}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        {t('delete') || 'Delete'}
                      </button>
                      <button
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                        style={{ color: primaryHex }}
                        aria-label={`${t('aiAutoGrading') || 'AI Auto-Grading'} ${lab.title}`}
                      >
                        <Sparkles size={16} aria-hidden="true" />
                        {t('aiAutoGrading') || 'AI Auto-Grading'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <LabModal
        isOpen={labModalOpen}
        lab={editingLab}
        courses={courses}
        onSave={editingLab ? handleUpdateLab : handleCreateLab}
        onClose={() => { setLabModalOpen(false); setEditingLab(null); }}
      />

      <GradingModal
        isOpen={gradingModalOpen}
        labTitle={selectedLabForGrading?.title || ''}
        maxScore={parseFloat(selectedLabForGrading?.maxScore || '100')}
        submissions={gradingSubmissions}
        onGrade={handleGradeSubmission}
        onClose={() => { setGradingModalOpen(false); setSelectedLabForGrading(null); }}
      />

      <InstructionModal
        isOpen={instructionModalOpen}
        labId={selectedLabForInstruction?.id || ''}
        onSave={handleAddInstruction}
        onClose={() => { setInstructionModalOpen(false); setSelectedLabForInstruction(null); }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={t('confirmDelete') || 'Confirm Delete'}
        message={t('confirmDeleteLabMessage') || `Are you sure you want to delete "${labToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteLab}
        onCancel={() => { setConfirmOpen(false); setLabToDelete(null); }}
        confirmText={t('delete') || 'Delete'}
        cancelText={t('cancel') || 'Cancel'}
        variant="danger"
      />
    </div>
  );
}

export default LabsPage;
