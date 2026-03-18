import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../../../hooks/useApi';
import { LabService, Lab } from '../../../services/api/labService';
import { enrollmentService } from '../../../services/api/enrollmentService';
import {
  BookOpen,
  ChevronDown,
  FileText,
  Loader2,
  Upload,
  CheckCircle,
  Clock,
  Send,
  ArrowLeft,
} from 'lucide-react';

export function LabInstructions() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    data: enrolledCourses,
    loading: loadingCourses,
  } = useApi(() => enrollmentService.getMyCourses(), []);

  useEffect(() => {
    if (!selectedCourseId && enrolledCourses?.length) {
      const first = enrolledCourses[0];
      setSelectedCourseId(String(first.course?.id || ''));
    }
  }, [enrolledCourses, selectedCourseId]);

  const {
    data: labs,
    loading: loadingLabs,
  } = useApi(
    async () => {
      if (!selectedCourseId) return [];
      return LabService.getAll({ courseId: selectedCourseId });
    },
    [selectedCourseId]
  );

  const {
    data: selectedLab,
    loading: loadingLabDetail,
  } = useApi(
    async () => {
      if (!selectedLabId) return null;
      return LabService.getById(selectedLabId);
    },
    [selectedLabId]
  );

  const {
    data: mySubmission,
    refetch: refetchSubmission,
  } = useApi(
    async () => {
      if (!selectedLabId) return null;
      return LabService.getMySubmission(selectedLabId);
    },
    [selectedLabId]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLabId || (!submissionText && !selectedFile)) return;

    setSubmitting(true);
    try {
      await LabService.submit(selectedLabId, submissionText, selectedFile || undefined);
      setSubmitSuccess(true);
      setSubmissionText('');
      setSelectedFile(null);
      refetchSubmission();
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to submit lab:', error);
      alert('Failed to submit lab. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const cardClass = isDark ? 'bg-card-dark border border-white/5' : 'bg-white border border-slate-100';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

  if (loadingCourses) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!enrolledCourses?.length) {
    return (
      <div className={"rounded-2xl p-8 text-center " + cardClass}>
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <h3 className={"text-lg font-semibold mb-2 " + textPrimary}>No Enrolled Courses</h3>
        <p className={textSecondary}>Enroll in courses to view lab assignments.</p>
      </div>
    );
  }

  if (selectedLabId && selectedLab) {
    const isSubmitted = mySubmission !== null;

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedLabId(null)}
          className={"flex items-center gap-2 transition-colors hover:opacity-80 " + textSecondary}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Labs</span>
        </button>

        <div className={"rounded-2xl p-6 " + cardClass}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className={"text-2xl font-bold " + textPrimary}>{selectedLab.title}</h2>
              <p className={"mt-1 " + textSecondary}>
                {selectedLab.course?.name} ({selectedLab.course?.code})
              </p>
            </div>
            <div className="text-right">
              <p className={"text-sm " + textSecondary}>Max Score</p>
              <p className={"text-xl font-bold " + textPrimary}>{Number(selectedLab.maxScore)} pts</p>
            </div>
          </div>

          {selectedLab.dueDate && (
            <div className={"flex items-center gap-2 " + textSecondary}>
              <Clock className="w-4 h-4" />
              <span>Due: {new Date(selectedLab.dueDate).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}</span>
            </div>
          )}
        </div>

        {selectedLab.description && (
          <div className={"rounded-2xl p-6 " + cardClass}>
            <h3 className={"font-semibold mb-3 " + textPrimary}>Description</h3>
            <p className={textSecondary}>{selectedLab.description}</p>
          </div>
        )}

        {selectedLab.instructions && selectedLab.instructions.length > 0 && (
          <div className={"rounded-2xl p-6 " + cardClass}>
            <h3 className={"font-semibold mb-4 " + textPrimary}>Instructions</h3>
            <div className="space-y-3">
              {selectedLab.instructions
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((instruction, idx) => (
                  <div key={instruction.id} className={"flex gap-3 p-3 rounded-lg " + (isDark ? 'bg-white/5' : 'bg-slate-50')}>
                    <span className={"flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium " + (isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-700')}>
                      {idx + 1}
                    </span>
                    <p className={textSecondary}>{instruction.instructionText}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className={"rounded-2xl p-6 " + cardClass}>
          <h3 className={"font-semibold mb-4 " + textPrimary}>
            {isSubmitted ? 'Your Submission' : 'Submit Your Work'}
          </h3>

          {isSubmitted ? (
            <div className="space-y-4">
              <div className={"p-4 rounded-lg border " + (isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-emerald-50 border-emerald-200')}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className={"font-medium " + (isDark ? 'text-emerald-400' : 'text-emerald-700')}>
                    Submitted
                  </span>
                </div>
                <p className={"text-sm " + (isDark ? 'text-emerald-300' : 'text-emerald-600')}>
                  Submitted at: {new Date(mySubmission.submittedAt).toLocaleString()}
                </p>
                {mySubmission.score && (
                  <p className={"text-sm mt-1 font-medium " + (isDark ? 'text-emerald-300' : 'text-emerald-700')}>
                    Score: {mySubmission.score}/{selectedLab.maxScore}
                  </p>
                )}
                {mySubmission.feedback && (
                  <div className="mt-3">
                    <p className={"text-sm font-medium " + (isDark ? 'text-emerald-300' : 'text-emerald-700')}>Feedback:</p>
                    <p className={"text-sm " + (isDark ? 'text-emerald-200' : 'text-emerald-600')}>{mySubmission.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={"block text-sm font-medium mb-2 " + textSecondary}>
                  Submission Text
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Enter your submission text here..."
                  rows={6}
                  className={"w-full p-3 rounded-xl border focus:ring-2 focus:border-transparent " + (isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800')}
                  style={{ '--tw-ring-color': accentColor } as any}
                />
              </div>

              <div>
                <label className={"block text-sm font-medium mb-2 " + textSecondary}>
                  Attach File (optional)
                </label>
                <div className={"border-2 border-dashed rounded-xl p-4 text-center transition-colors " + (isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-slate-300')}>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="lab-file-upload"
                  />
                  <label htmlFor="lab-file-upload" className="cursor-pointer">
                    <Upload className={"w-8 h-8 mx-auto mb-2 " + textSecondary} />
                    <p className={textSecondary}>
                      {selectedFile ? selectedFile.name : 'Click to upload file'}
                    </p>
                  </label>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || (!submissionText && !selectedFile)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: accentColor }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Lab
                  </>
                )}
              </button>

              {submitSuccess && (
                <div className="flex items-center justify-center gap-2 text-emerald-500">
                  <CheckCircle className="w-5 h-5" />
                  <span>Lab submitted successfully!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={"rounded-2xl p-4 " + cardClass}>
        <label className={"block text-sm font-medium mb-2 " + textSecondary}>Select Course</label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className={"w-full p-3 rounded-xl border " + (isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800')}
        >
          {enrolledCourses.map((enrollment: any) => (
            <option key={enrollment.course?.id} value={enrollment.course?.id}>
              {enrollment.course?.name} ({enrollment.course?.code})
            </option>
          ))}
        </select>
      </div>

      {loadingLabs ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : !labs?.length ? (
        <div className={"rounded-2xl p-8 text-center " + cardClass}>
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className={"text-lg font-semibold mb-2 " + textPrimary}>No Labs Available</h3>
          <p className={textSecondary}>No lab assignments for this course yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {labs.map((lab: Lab) => (
            <div
              key={lab.id}
              onClick={() => setSelectedLabId(lab.id)}
              className={"rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg " + cardClass}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={"font-semibold " + textPrimary}>{lab.title}</h3>
                  <p className={"text-sm mt-1 " + textSecondary}>
                    {lab.description?.substring(0, 100)}{lab.description && lab.description.length > 100 ? '...' : ''}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    {lab.dueDate && (
                      <div className={"flex items-center gap-1 text-sm " + textSecondary}>
                        <Clock className="w-4 h-4" />
                        <span>{new Date(lab.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className={"text-sm " + textSecondary}>
                      Max: {Number(lab.maxScore)} pts
                    </div>
                    <span className={"px-2 py-0.5 rounded-full text-xs font-medium " + (
                      lab.status === 'published'
                        ? 'bg-emerald-100 text-emerald-700'
                        : lab.status === 'draft'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-red-100 text-red-700'
                    )}>
                      {lab.status}
                    </span>
                  </div>
                </div>

                <ChevronDown className={"w-5 h-5 " + textSecondary} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LabInstructions;
