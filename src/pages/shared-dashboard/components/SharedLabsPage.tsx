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

    const result = Array.from(unique.values());
    console.debug('[SharedLabs] Role:', role, 'Mapped courses count:', result.length, 'Results:', result);
    return result;
  }, [teachingCourses, role]);

  return (
    <div data-role={role}>
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
