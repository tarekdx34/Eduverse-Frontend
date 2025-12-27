import React from 'react';

export type SectionSummary = {
  courseCode: string;
  courseName: string;
  sectionLabel: string;
  schedule: string;
  capacity: number;
  enrolled: number;
};

export function SelectedSectionSummary({ section }: { section: SectionSummary | null }) {
  if (!section) return null;
  return (
    <div className="rounded-lg border bg-white p-4 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm text-gray-600">Selected Section</div>
          <div className="text-lg font-semibold">{section.courseName} • {section.sectionLabel}</div>
          <div className="text-sm text-gray-600">{section.courseCode} • {section.schedule}</div>
        </div>
        <div className="text-sm">
          <span className="px-2 py-1 rounded bg-purple-100 text-purple-700">Enrolled: {section.enrolled}</span>
          <span className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-700">Capacity: {section.capacity}</span>
        </div>
      </div>
    </div>
  );
}

export default SelectedSectionSummary;