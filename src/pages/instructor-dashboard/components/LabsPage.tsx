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
}

export function LabsPage({ courses = [] }: LabsPageProps) {
  return <LabsDashboard courses={courses} />;
}

export default LabsPage;
