/**
 * LabsPage - Instructor Dashboard Labs Tab
 * 
 * This is the new modular labs implementation.
 * The old monolithic component has been moved to LabsPage.legacy.tsx for reference.
 */

import React from 'react';
import { LabsDashboard } from './labs';

export interface LabsPageProps {
  courses?: any[];
  isMockMode?: boolean;
}

export function LabsPage({ courses = [], isMockMode = false }: LabsPageProps) {
  return <LabsDashboard courses={courses} isMockMode={isMockMode} />;
}

export default LabsPage;
