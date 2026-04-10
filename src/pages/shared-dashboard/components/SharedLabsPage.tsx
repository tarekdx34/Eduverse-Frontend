import React from 'react';
import { ThemeProvider as InstructorThemeProvider } from '../../instructor-dashboard/contexts/ThemeContext';
import { LanguageProvider as InstructorLanguageProvider } from '../../instructor-dashboard/contexts/LanguageContext';
import { LabsPage } from '../../instructor-dashboard/components/LabsPage';

interface SharedLabsPageProps {
  role?: 'INSTRUCTOR' | 'TA';
}

export function SharedLabsPage({ role = 'INSTRUCTOR' }: SharedLabsPageProps) {
  return (
    <InstructorThemeProvider>
      <InstructorLanguageProvider>
        <div data-role={role}>
          <LabsPage />
        </div>
      </InstructorLanguageProvider>
    </InstructorThemeProvider>
  );
}

export default SharedLabsPage;
