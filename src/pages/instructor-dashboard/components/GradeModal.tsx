import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export type GradeFormData = {
  id?: number;
  student: string;
  email: string;
  assignment: string;
  score: number;
  grade: string;
};

type GradeModalProps = {
  open: boolean;
  gradeData: GradeFormData | null;
  onClose: () => void;
  onSave: (data: GradeFormData) => void;
};

function scoreToGrade(score: number): string {
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  return 'C-';
}

export function GradeModal({ open, gradeData, onClose, onSave }: GradeModalProps) {
  const [formData, setFormData] = useState<GradeFormData>({
    student: '',
    email: '',
    assignment: '',
    score: 0,
    grade: 'C-',
  });

  useEffect(() => {
    if (gradeData) {
      setFormData(gradeData);
    }
  }, [gradeData, open]);

  const handleScoreChange = (score: number) => {
    const grade = scoreToGrade(score);
    setFormData({ ...formData, score, grade });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Grade</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <input
              type="text"
              disabled
              value={formData.student}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
            <input
              type="text"
              disabled
              value={formData.assignment}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-100)</label>
            <input
              type="number"
              required
              min="0"
              max="100"
              value={formData.score}
              onChange={(e) => handleScoreChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Letter Grade</label>
            <input
              type="text"
              disabled
              value={formData.grade}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 font-semibold"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GradeModal;
