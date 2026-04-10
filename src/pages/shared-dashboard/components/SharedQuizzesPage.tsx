import React from 'react';
import { ThemeProvider as InstructorThemeProvider } from '../../instructor-dashboard/contexts/ThemeContext';
import { LanguageProvider as InstructorLanguageProvider } from '../../instructor-dashboard/contexts/LanguageContext';
import { QuizzesPage } from '../../instructor-dashboard/components/QuizzesPage';

interface SharedQuizzesPageProps {
  role?: 'INSTRUCTOR' | 'TA';
}

export function SharedQuizzesPage({ role = 'INSTRUCTOR' }: SharedQuizzesPageProps) {
  return (
    <InstructorThemeProvider>
      <InstructorLanguageProvider>
        <div data-role={role}>
          <QuizzesPage />
        </div>
      </InstructorLanguageProvider>
    </InstructorThemeProvider>
  );
}

export default SharedQuizzesPage;
