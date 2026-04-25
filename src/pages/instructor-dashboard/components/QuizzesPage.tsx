/**
 * QuizzesPage - Instructor Dashboard Quizzes Tab
 * 
 * This is the new modular quizzes implementation.
 * The old monolithic component has been moved to QuizzesPage.legacy.tsx for reference.
 */

import React from 'react';
import { QuizzesDashboard } from './quizzes';

export interface QuizzesPageProps {
  courses?: any[];
  isMockMode?: boolean;
}

export function QuizzesPage({ courses = [], isMockMode }: QuizzesPageProps) {
  return <QuizzesDashboard courses={courses} isMockMode={isMockMode} />;
}

export default QuizzesPage;
