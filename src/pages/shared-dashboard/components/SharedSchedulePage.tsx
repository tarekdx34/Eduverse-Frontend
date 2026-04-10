import React from 'react';
import { ThemeProvider as InstructorThemeProvider } from '../../instructor-dashboard/contexts/ThemeContext';
import { LanguageProvider as InstructorLanguageProvider } from '../../instructor-dashboard/contexts/LanguageContext';
import { SchedulePage } from '../../instructor-dashboard/components/SchedulePage';

interface SharedSchedulePageProps {
  role?: 'INSTRUCTOR' | 'TA';
}

export function SharedSchedulePage({ role = 'INSTRUCTOR' }: SharedSchedulePageProps) {
  return (
    <InstructorThemeProvider>
      <InstructorLanguageProvider>
        <div data-role={role}>
          <SchedulePage />
        </div>
      </InstructorLanguageProvider>
    </InstructorThemeProvider>
  );
}

export default SharedSchedulePage;
