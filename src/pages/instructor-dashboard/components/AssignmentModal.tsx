import React, { useState, useEffect } from 'react';
import { X, FileText, FlaskConical, FolderKanban, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { CleanSelect } from '../../../components/shared';


export type AssignmentFormData = {
  id?: number;
  title: string;
  dueDate: string;
  submissions: number;
  status: 'draft' | 'open' | 'closed';
  assignmentType?: 'assignment' | 'lab' | 'project';
  description?: string;
  course?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  autoGrading?: boolean;
  plagiarismDetection?: boolean;
  labRoom?: string;
  objectives?: string;
  equipment?: string;
  procedure?: string;
  estimatedDuration?: number;
  requireLabCoat?: boolean;
  requireSafetyGlasses?: boolean;
  requireGloves?: boolean;
  safetyInstructions?: string;
  requireLabReport?: boolean;
  scope?: string;
  learningObjectives?: string;
  resources?: string;
  minTeamSize?: number;
  maxTeamSize?: number;
  allowIndividual?: boolean;
  milestones?: Array<{ title: string; weight: number }>;
  deliverables?: string[];
  requirePresentation?: boolean;
  requireDocumentation?: boolean;
  enablePeerReview?: boolean;
  allowLateSubmissions?: boolean;
  groupWork?: boolean;
  attachments?: string[];
};

type AssignmentModalProps = {
  open: boolean;
  assignment: AssignmentFormData | null;
  courseOptions?: Array<{ value: string; label: string }>;
  onClose: () => void;
  onSave: (data: AssignmentFormData) => void;
};

function Toggle({ value, onChange, isDark }: { value: boolean; onChange: (v: boolean) => void; isDark: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-indigo-600' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : ''}`} />
    </button>
  );
}

const TYPE_CONFIG = {
  assignment: { label: 'Assignment', icon: FileText, color: 'blue' },
  lab: { label: 'Lab', icon: FlaskConical, color: 'green' },
  project: { label: 'Project', icon: FolderKanban, color: 'amber' },
} as const;

const MOCK_COURSES = ['CS101', 'CS201', 'CS301'];
const LAB_ROOMS = ['Lab A-101', 'Lab A-102', 'Lab B-201', 'Lab C-301', 'Virtual Lab'];
const DELIVERABLE_OPTIONS = ['Documentation', 'Code', 'Report', 'Presentation'];

const defaultFormData: AssignmentFormData = {
  title: '',
  dueDate: '',
  submissions: 0,
  status: 'draft',
  assignmentType: 'assignment',
  description: '',
  course: '',
  difficulty: undefined,
  autoGrading: false,
  plagiarismDetection: false,
  allowLateSubmissions: false,
  labRoom: '',
  objectives: '',
  equipment: '',
  procedure: '',
  estimatedDuration: undefined,
  requireLabCoat: false,
  requireSafetyGlasses: false,
  requireGloves: false,
  safetyInstructions: '',
  requireLabReport: false,
  scope: '',
  learningObjectives: '',
  minTeamSize: 2,
  maxTeamSize: 4,
  allowIndividual: false,
  milestones: [],
  deliverables: [],
  requirePresentation: false,
  requireDocumentation: false,
  enablePeerReview: false,
};

export function AssignmentModal({ open, assignment, courseOptions, onClose, onSave }: AssignmentModalProps) {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState<AssignmentFormData>({ ...defaultFormData });

  const resolvedCourseOptions =
    courseOptions && courseOptions.length > 0
      ? courseOptions
      : MOCK_COURSES.map((course) => ({ value: course, label: course }));

  useEffect(() => {
    if (assignment) {
      setFormData({ ...defaultFormData, ...assignment });
    } else {
      setFormData({ ...defaultFormData });
    }
  }, [assignment, open]);

  useEffect(() => {
    if (!open || assignment) return;
    if ((formData.course || '').trim()) return;
    if (resolvedCourseOptions.length === 0) return;
    setFormData((prev) => ({ ...prev, course: resolvedCourseOptions[0].value }));
  }, [open, assignment, formData.course, resolvedCourseOptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleSaveDraft = () => {
    onSave({ ...formData, status: 'draft' });
  };

  const update = <K extends keyof AssignmentFormData>(key: K, value: AssignmentFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const addMilestone = () => {
    update('milestones', [...(formData.milestones || []), { title: '', weight: 0 }]);
  };

  const removeMilestone = (index: number) => {
    update('milestones', (formData.milestones || []).filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: 'title' | 'weight', value: string | number) => {
    const updated = [...(formData.milestones || [])];
    updated[index] = { ...updated[index], [field]: value };
    update('milestones', updated);
  };

  const toggleDeliverable = (item: string) => {
    const current = formData.deliverables || [];
    update('deliverables', current.includes(item) ? current.filter(d => d !== item) : [...current, item]);
  };

  if (!open) return null;

  const assignmentType = formData.assignmentType || 'assignment';
  const labelCls = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const inputCls = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500' : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400'}`;
  const selectCls = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-white/10 text-white' : 'border-gray-300 bg-white text-gray-900'}`;
  const optionStyle: React.CSSProperties = { backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? '#ffffff' : '#111827' };
  const sectionTitle = `text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`;

  const typeLabel = TYPE_CONFIG[assignmentType].label;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`rounded-lg shadow-xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh] ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className={`flex items-center justify-between p-6 border-b shrink-0 ${isDark ? 'border-white/10' : ''}`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {assignment ? `Edit ${typeLabel}` : `Create New ${typeLabel}`}
          </h2>
          <button onClick={onClose} className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Assignment Type Selector */}
          <div>
            <label className={labelCls}>Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TYPE_CONFIG) as Array<keyof typeof TYPE_CONFIG>).map(type => {
                const cfg = TYPE_CONFIG[type];
                const Icon = cfg.icon;
                const selected = assignmentType === type;
                const colorMap = {
                  blue: selected ? 'bg-blue-50 border-blue-500 text-blue-700' : '',
                  green: selected ? 'bg-green-50 border-green-500 text-green-700' : '',
                  amber: selected ? 'bg-amber-50 border-amber-500 text-amber-700' : '',
                };
                const darkColorMap = {
                  blue: selected ? 'bg-blue-900/30 border-blue-500 text-blue-300' : '',
                  green: selected ? 'bg-green-900/30 border-green-500 text-green-300' : '',
                  amber: selected ? 'bg-amber-900/30 border-amber-500 text-amber-300' : '',
                };
                const activeColor = isDark ? darkColorMap[cfg.color] : colorMap[cfg.color];
                const base = isDark
                  ? `border-white/10 text-gray-400 hover:border-white/30`
                  : `border-gray-200 text-gray-500 hover:border-gray-400`;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => update('assignmentType', type)}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${selected ? activeColor : base}`}
                  >
                    <Icon size={16} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Common Section */}
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => update('title', e.target.value)}
                className={inputCls}
                placeholder={`e.g., ${assignmentType === 'lab' ? 'Lab 3: Circuit Analysis' : assignmentType === 'project' ? 'Final Project: Web App' : 'Quiz 1: Variables'}`}
              />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={e => update('description', e.target.value)}
                className={inputCls}
                placeholder="Provide a brief description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Course</label>
                <CleanSelect value={formData.course || ''} onChange={e => update('course', e.target.value)} className={selectCls}>
                  <option value="" style={optionStyle}>Select course</option>
                  {resolvedCourseOptions.map((course) => (
                    <option key={course.value} value={course.value} style={optionStyle}>
                      {course.label}
                    </option>
                  ))}
                </CleanSelect>
              </div>

              <div>
                <label className={labelCls}>Difficulty</label>
                <div className="flex gap-1">
                  {(['easy', 'medium', 'hard'] as const).map(d => {
                    const selected = formData.difficulty === d;
                    const colors = {
                      easy: selected ? 'bg-green-100 text-green-700 border-green-400' : '',
                      medium: selected ? 'bg-yellow-100 text-yellow-700 border-yellow-400' : '',
                      hard: selected ? 'bg-red-100 text-red-700 border-red-400' : '',
                    };
                    const darkColors = {
                      easy: selected ? 'bg-green-900/30 text-green-300 border-green-500' : '',
                      medium: selected ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500' : '',
                      hard: selected ? 'bg-red-900/30 text-red-300 border-red-500' : '',
                    };
                    const active = isDark ? darkColors[d] : colors[d];
                    const base = isDark ? 'border-white/10 text-gray-400' : 'border-gray-200 text-gray-500';
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => update('difficulty', d)}
                        className={`flex-1 px-2 py-2 text-xs font-medium rounded-md border capitalize transition-all ${selected ? active : base}`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Due Date</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={e => update('dueDate', e.target.value)}
                  className={inputCls}
                  style={isDark ? { colorScheme: 'dark' } : undefined}
                />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <CleanSelect
                  value={formData.status}
                  onChange={e => update('status', e.target.value as 'draft' | 'open' | 'closed')}
                  className={selectCls}
                >
                  <option value="draft" style={optionStyle}>Draft</option>
                  <option value="open" style={optionStyle}>Open</option>
                  <option value="closed" style={optionStyle}>Closed</option>
                </CleanSelect>
              </div>
            </div>

            {assignment && (
              <div>
                <label className={labelCls}>Submissions</label>
                <input
                  type="number"
                  min="0"
                  value={formData.submissions}
                  onChange={e => update('submissions', parseInt(e.target.value) || 0)}
                  className={inputCls}
                />
              </div>
            )}
          </div>

          {/* Assignment-specific fields */}
          {assignmentType === 'assignment' && (
            <div className={`border rounded-lg p-4 space-y-3 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <p className={sectionTitle}>Assignment Options</p>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Auto-Grading</span>
                <Toggle value={!!formData.autoGrading} onChange={v => update('autoGrading', v)} isDark={isDark} />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Plagiarism Detection</span>
                <Toggle value={!!formData.plagiarismDetection} onChange={v => update('plagiarismDetection', v)} isDark={isDark} />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Allow Late Submissions</span>
                <Toggle value={!!formData.allowLateSubmissions} onChange={v => update('allowLateSubmissions', v)} isDark={isDark} />
              </div>
            </div>
          )}

          {/* Lab-specific fields */}
          {assignmentType === 'lab' && (
            <div className={`border rounded-lg p-4 space-y-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <p className={sectionTitle}>Lab Details</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Lab Room</label>
                  <CleanSelect value={formData.labRoom || ''} onChange={e => update('labRoom', e.target.value)} className={selectCls}>
                    <option value="" style={optionStyle}>Select room</option>
                    {LAB_ROOMS.map(r => <option key={r} value={r} style={optionStyle}>{r}</option>)}
                  </CleanSelect>
                </div>
                <div>
                  <label className={labelCls}>Estimated Duration (hours)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimatedDuration ?? ''}
                    onChange={e => update('estimatedDuration', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className={inputCls}
                    placeholder="e.g., 2"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Objectives</label>
                <textarea rows={2} value={formData.objectives || ''} onChange={e => update('objectives', e.target.value)} className={inputCls} placeholder="Lab objectives..." />
              </div>
              <div>
                <label className={labelCls}>Equipment Needed</label>
                <textarea rows={2} value={formData.equipment || ''} onChange={e => update('equipment', e.target.value)} className={inputCls} placeholder="Required equipment..." />
              </div>
              <div>
                <label className={labelCls}>Procedure / Steps</label>
                <textarea rows={3} value={formData.procedure || ''} onChange={e => update('procedure', e.target.value)} className={inputCls} placeholder="Step-by-step procedure..." />
              </div>

              <div className={`border rounded-lg p-3 space-y-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Safety Requirements</p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Require Lab Coat</span>
                  <Toggle value={!!formData.requireLabCoat} onChange={v => update('requireLabCoat', v)} isDark={isDark} />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Require Safety Glasses</span>
                  <Toggle value={!!formData.requireSafetyGlasses} onChange={v => update('requireSafetyGlasses', v)} isDark={isDark} />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Require Gloves</span>
                  <Toggle value={!!formData.requireGloves} onChange={v => update('requireGloves', v)} isDark={isDark} />
                </div>
                <div>
                  <label className={labelCls}>Safety Instructions</label>
                  <textarea rows={2} value={formData.safetyInstructions || ''} onChange={e => update('safetyInstructions', e.target.value)} className={inputCls} placeholder="Additional safety instructions..." />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Require Lab Report</span>
                <Toggle value={!!formData.requireLabReport} onChange={v => update('requireLabReport', v)} isDark={isDark} />
              </div>
            </div>
          )}

          {/* Project-specific fields */}
          {assignmentType === 'project' && (
            <div className={`border rounded-lg p-4 space-y-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <p className={sectionTitle}>Project Details</p>

              <div>
                <label className={labelCls}>Scope</label>
                <textarea rows={2} value={formData.scope || ''} onChange={e => update('scope', e.target.value)} className={inputCls} placeholder="Define the project scope..." />
              </div>
              <div>
                <label className={labelCls}>Learning Objectives</label>
                <textarea rows={2} value={formData.learningObjectives || ''} onChange={e => update('learningObjectives', e.target.value)} className={inputCls} placeholder="What students will learn..." />
              </div>

              <div className={`border rounded-lg p-3 space-y-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Team Configuration</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Min Team Size</label>
                    <input type="number" min="1" value={formData.minTeamSize ?? 2} onChange={e => update('minTeamSize', parseInt(e.target.value) || 1)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Max Team Size</label>
                    <input type="number" min="1" value={formData.maxTeamSize ?? 4} onChange={e => update('maxTeamSize', parseInt(e.target.value) || 1)} className={inputCls} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Allow Individual Work</span>
                  <Toggle value={!!formData.allowIndividual} onChange={v => update('allowIndividual', v)} isDark={isDark} />
                </div>
              </div>

              {/* Milestones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls}>Milestones</label>
                  <button type="button" onClick={addMilestone} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    <Plus size={14} /> Add Milestone
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.milestones || []).map((m, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={m.title}
                        onChange={e => updateMilestone(i, 'title', e.target.value)}
                        className={`flex-1 px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'}`}
                        placeholder="Milestone title"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={m.weight}
                          onChange={e => updateMilestone(i, 'weight', parseInt(e.target.value) || 0)}
                          className={`w-16 px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'border-gray-300 bg-white'}`}
                        />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
                      </div>
                      <button type="button" onClick={() => removeMilestone(i)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <label className={labelCls}>Deliverables</label>
                <div className="flex flex-wrap gap-2">
                  {DELIVERABLE_OPTIONS.map(item => {
                    const checked = (formData.deliverables || []).includes(item);
                    return (
                      <label
                        key={item}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm cursor-pointer transition-all ${
                          checked
                            ? isDark ? 'bg-indigo-900/30 border-indigo-500 text-indigo-300' : 'bg-indigo-50 border-indigo-400 text-indigo-700'
                            : isDark ? 'border-white/10 text-gray-400' : 'border-gray-200 text-gray-500'
                        }`}
                      >
                        <input type="checkbox" checked={checked} onChange={() => toggleDeliverable(item)} className="sr-only" />
                        {item}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Additional toggles */}
              <div className="space-y-3">
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Additional</p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Require Presentation</span>
                  <Toggle value={!!formData.requirePresentation} onChange={v => update('requirePresentation', v)} isDark={isDark} />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Require Documentation</span>
                  <Toggle value={!!formData.requireDocumentation} onChange={v => update('requireDocumentation', v)} isDark={isDark} />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Enable Peer Review</span>
                  <Toggle value={!!formData.enablePeerReview} onChange={v => update('enablePeerReview', v)} isDark={isDark} />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded-md transition-colors ${isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className={`px-4 py-2 border rounded-md transition-colors ${isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {assignment ? 'Save Changes' : `Create ${typeLabel}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignmentModal;
