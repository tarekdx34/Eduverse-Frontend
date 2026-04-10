import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ThemeProvider as InstructorThemeProvider } from '../../instructor-dashboard/contexts/ThemeContext';
import { LanguageProvider as InstructorLanguageProvider } from '../../instructor-dashboard/contexts/LanguageContext';
import { LabsPage } from '../../instructor-dashboard/components/LabsPage';
import { EnrollmentService } from '../../../services/api/enrollmentService';

interface SharedLabsPageProps {
  role?: 'INSTRUCTOR' | 'TA';
}

const normalizeTeachingCoursesPayload = (payload: unknown): any[] => {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as any[];

    if (obj.data && typeof obj.data === 'object') {
      const nested = obj.data as Record<string, unknown>;
      if (Array.isArray(nested.data)) return nested.data as any[];
    }
  }

  return [];
};

function SharedLabsPageContent({ role = 'INSTRUCTOR' }: SharedLabsPageProps) {
  const { data: teachingCoursesRaw, isLoading, error } = useQuery<unknown>({
    queryKey: ['shared-labs-teaching-courses', role],
    queryFn: () => EnrollmentService.getTeachingCourses(),
    enabled: role === 'TA',
  });

  const teachingCourses = useMemo(
    () => normalizeTeachingCoursesPayload(teachingCoursesRaw),
    [teachingCoursesRaw]
  );

  const mappedCourses = useMemo(() => {
    const unique = new Map<string, { courseId: string; courseName: string; courseCode: string }>();

    teachingCourses.forEach((course: any) => {
      const courseId = String(course?.courseId ?? course?.course?.id ?? course?.id ?? '');
      const courseName = String(course?.course?.name ?? course?.courseName ?? course?.name ?? '').trim();
      const courseCode = String(course?.course?.code ?? course?.courseCode ?? '').trim();

      if (!courseId || !courseName || unique.has(courseId)) return;

      unique.set(courseId, {
        courseId,
        courseName,
        courseCode,
      });
    });

    return Array.from(unique.values());
  }, [teachingCourses]);

  return (
    <div data-role={role}>
      {role === 'TA' && (
        <details className="mb-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
          <summary className="cursor-pointer font-medium">Debug: TA labs course API shape</summary>
          <div className="mt-2 space-y-2">
            <div>
              loading: {String(isLoading)} | error: {error ? String((error as Error).message || error) : 'none'}
            </div>
            <div>
              rawCount: {Array.isArray(teachingCoursesRaw) ? teachingCoursesRaw.length : 'non-array'} | normalizedCount:{' '}
              {teachingCourses.length} | mappedCount: {mappedCourses.length}
            </div>
            <pre className="max-h-56 overflow-auto rounded bg-white/70 p-2 text-[11px] leading-4">
{JSON.stringify(
  {
    rawSample: Array.isArray(teachingCoursesRaw) ? teachingCoursesRaw.slice(0, 2) : teachingCoursesRaw,
    normalizedSample: teachingCourses.slice(0, 3),
    mappedSample: mappedCourses.slice(0, 3),
  },
  null,
  2
)}
            </pre>
          </div>
        </details>
      )}

      <LabsPage courses={role === 'TA' ? mappedCourses : []} />
    </div>
  );
}

export function SharedLabsPage({ role = 'INSTRUCTOR' }: SharedLabsPageProps) {
  return (
    <InstructorThemeProvider>
      <InstructorLanguageProvider>
        <SharedLabsPageContent role={role} />
      </InstructorLanguageProvider>
    </InstructorThemeProvider>
  );
}

export default SharedLabsPage;
