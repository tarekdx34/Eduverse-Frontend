import React, { useState, useEffect } from 'react';

export type StudentModel = {
  id: number;
  name: string;
  email: string;
  status: string;
  grade?: string;
};

export function StudentEditModal({
  open,
  student,
  onClose,
  onSave,
}: {
  open: boolean;
  student: StudentModel | null;
  onClose: () => void;
  onSave: (updated: StudentModel) => void;
}) {
  const [form, setForm] = useState<StudentModel>({
    id: 0,
    name: '',
    email: '',
    status: 'enrolled',
    grade: undefined,
  });

  useEffect(() => {
    if (student) setForm(student);
  }, [student]);

  if (!open || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Edit Student</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              className="mt-1 w-full border rounded-md px-3 py-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              className="mt-1 w-full border rounded-md px-3 py-2"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <select
                className="mt-1 w-full border rounded-md px-3 py-2 bg-white"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="enrolled">Enrolled</option>
                <option value="auditing">Auditing</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Grade</label>
              <select
                className="mt-1 w-full border rounded-md px-3 py-2 bg-white"
                value={form.grade || ''}
                onChange={(e) => setForm({ ...form, grade: e.target.value || undefined })}
              >
                <option value="">-</option>
                {['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={() => onSave(form)}
          >
            Save (Demo)
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Note: This is demo-only and does not persist to a backend.
        </p>
      </div>
    </div>
  );
}

export default StudentEditModal;
