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
}

export function QuizzesPage({ courses = [] }: QuizzesPageProps) {
  return <QuizzesDashboard courses={courses} />;
}

export default QuizzesPage;
