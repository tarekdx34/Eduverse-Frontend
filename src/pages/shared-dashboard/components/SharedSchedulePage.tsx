import React from 'react';
import { ThemeProvider as InstructorThemeProvider } from '../../instructor-dashboard/contexts/ThemeContext';
import { LanguageProvider as InstructorLanguageProvider } from '../../instructor-dashboard/contexts/LanguageContext';
import { SchedulePage } from '../../instructor-dashboard/components/SchedulePage';

interface SharedSchedulePageProps {
  role?: 'INSTRUCTOR' | 'TA';
}

import { useTheme as useTaTheme } from '../../ta-dashboard/contexts/ThemeContext';
import { useLanguage as useTaLanguage } from '../../ta-dashboard/contexts/LanguageContext';

export function SharedSchedulePage({ role = 'INSTRUCTOR' }: SharedSchedulePageProps) {
  const taTheme = useTaTheme();
  const taLanguage = useTaLanguage();

  if (role === 'TA') {
    return (
      <InstructorThemeProvider
        initialTheme={taTheme.theme as any}
        initialPrimaryColor={taTheme.primaryColor}
      >
        <InstructorLanguageProvider initialLanguage={taLanguage.language as any}>
          <div data-role={role}>
            <SchedulePage />
          </div>
        </InstructorLanguageProvider>
      </InstructorThemeProvider>
    );
  }

  return (
    <div data-role={role}>
      <SchedulePage />
    </div>
  );
}

export default SharedSchedulePage;
