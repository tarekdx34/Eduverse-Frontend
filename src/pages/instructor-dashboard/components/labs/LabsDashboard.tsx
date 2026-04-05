/**
 * LabsDashboard - Main container component for labs management
 * Orchestrates all lab sub-components
 */

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LabList } from './LabList';
import { LabCreate } from './LabCreate';
import { LabEdit } from './LabEdit';
import { LabDetail } from './LabDetail';
import { InstructionEditor } from './InstructionEditor';
import { TaMaterialUpload } from './TaMaterialUpload';
import { SubmissionList } from './SubmissionList';
import { GradingPanel } from './GradingPanel';
import { AttendanceSheet } from './AttendanceSheet';
import { useLabs } from './hooks/useLabs';
import { LabUIData, LabFormData, LabSubmission } from './types';
import { ConfirmDialog } from '../ConfirmDialog';
import LabService from '../../../../services/api/labService';

export interface LabsDashboardProps {
  courses?: { id?: string; courseId?: string; name?: string; courseName?: string }[];
}

interface CourseForModal {
  id: string;
  name: string;
  code: string;
}

export function LabsDashboard({ courses = [] }: LabsDashboardProps) {
  const { t } = useLanguage();
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;

  // Normalize course options
  const courseOptions = React.useMemo(() => {
    const seen = new Set<string>();
    return courses
      .map((c) => {
        const value = String(c.courseId ?? c.id ?? '');
        const label = c.courseName || c.name || '';
        if (!value || !label) return null;
        return { value, label };
      })
      .filter((item): item is { value: string; label: string } => {
        if (!item || seen.has(item.value)) return false;
        seen.add(item.value);
        return true;
      });
  }, [courses]);

  // Transform course options to CourseForModal format
  const coursesForModal = React.useMemo(() => {
    return courses
      .map((c) => {
        const id = String(c.courseId ?? c.id ?? '');
        const name = c.courseName || c.name || '';
        const code = name.split(' - ')[0] || '';
        if (!id || !name) return null;
        return { id, name, code };
      })
      .filter((item): item is CourseForModal => item !== null);
  }, [courses]);

  // Labs data hook
  const {
    filteredLabs,
    loading,
    error,
    selectedCourse,
    setSelectedCourse,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    refresh,
    deleteLab,
    changeStatus,
  } = useLabs();

  // Modal states
  const [showCreate, setShowCreate] = useState(false);
  const [editingLab, setEditingLab] = useState<LabUIData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [labToDelete, setLabToDelete] = useState<LabUIData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Detail and feature modals
  const [detailLab, setDetailLab] = useState<LabUIData | null>(null);
  const [instructionLab, setInstructionLab] = useState<LabUIData | null>(null);
  const [taMaterialLab, setTaMaterialLab] = useState<LabUIData | null>(null);
  const [submissionLab, setSubmissionLab] = useState<LabUIData | null>(null);
  const [attendanceLab, setAttendanceLab] = useState<LabUIData | null>(null);
  
  // Grading state
  const [gradingLab, setGradingLab] = useState<LabUIData | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<LabSubmission | null>(null);

  // Action handlers
  const handleCreateClick = useCallback(() => {
    setShowCreate(true);
  }, []);

  const handleEditClick = useCallback((lab: LabUIData) => {
    setEditingLab(lab);
  }, []);

  const handleDeleteClick = useCallback((lab: LabUIData) => {
    setLabToDelete(lab);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!labToDelete) return;

    try {
      setIsDeleting(true);
      await deleteLab(labToDelete.id);
      toast.success('Lab deleted successfully');
      setShowDeleteConfirm(false);
      setLabToDelete(null);
    } catch (err) {
      console.error('Failed to delete lab:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete lab');
    } finally {
      setIsDeleting(false);
    }
  }, [labToDelete, deleteLab]);

  const handleStatusChange = useCallback(async (lab: LabUIData, newStatus: string) => {
    try {
      await changeStatus(lab.id, newStatus as any);
      toast.success(`Lab status changed to ${newStatus}`);
    } catch (err) {
      console.error('Failed to change lab status:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to change lab status');
    }
  }, [changeStatus]);

  const handleLabSaved = useCallback(() => {
    setShowCreate(false);
    setEditingLab(null);
    refresh();
    toast.success('Lab saved successfully');
  }, [refresh]);

  const handleCreateCancel = useCallback(() => {
    setShowCreate(false);
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingLab(null);
  }, []);

  const handleLabCreateSave = useCallback(async (data: LabFormData) => {
    try {
      await LabService.create(data);
      handleLabSaved();
    } catch (err) {
      console.error('Failed to create lab:', err);
      throw err;
    }
  }, [handleLabSaved]);

  const handleLabEditSave = useCallback(async (data: Partial<LabUIData>) => {
    try {
      if (editingLab) {
        await LabService.update(editingLab.id, data);
        handleLabSaved();
      }
    } catch (err) {
      console.error('Failed to update lab:', err);
      throw err;
    }
  }, [editingLab, handleLabSaved]);

  // Detail and feature handlers
  const handleViewDetails = useCallback((lab: LabUIData) => {
    setDetailLab(lab);
  }, []);

  const handleViewSubmissions = useCallback((lab: LabUIData) => {
    setSubmissionLab(lab);
  }, []);

  const handleManageInstructions = useCallback((lab: LabUIData) => {
    setInstructionLab(lab);
    setDetailLab(null); // Close detail modal if open
  }, []);

  const handleUploadTaMaterials = useCallback((lab: LabUIData) => {
    setTaMaterialLab(lab);
    setDetailLab(null); // Close detail modal if open
  }, []);

  const handleViewAttendance = useCallback((lab: LabUIData) => {
    setAttendanceLab(lab);
    setDetailLab(null); // Close detail modal if open
  }, []);

  const handleGradeSubmission = useCallback((submission: LabSubmission) => {
    setGradingLab(submissionLab);
    setGradingSubmission(submission);
  }, [submissionLab]);

  const handleGradingComplete = useCallback(() => {
    setGradingSubmission(null);
    setGradingLab(null);
    // Refresh submissions if submission list is still open
    if (submissionLab) {
      refresh();
    }
  }, [submissionLab, refresh]);

  const handleInstructionsUpdated = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleTaMaterialUploaded = useCallback(() => {
    toast.success(t('taMaterialUploaded') || 'TA material uploaded successfully');
  }, [t]);

  return (
    <div className="space-y-6">
      {/* Lab List with integrated actions */}
      <LabList
        labs={filteredLabs}
        loading={loading}
        error={error}
        courses={coursesForModal}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        selectedStatus={selectedStatus as any}
        onStatusChange={setSelectedStatus as any}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onViewSubmissions={handleViewSubmissions}
        onViewDetails={handleViewDetails}
        onStatusChangeClick={(lab) => handleStatusChange(lab, lab.status === 'draft' ? 'published' : 'closed')}
        onRefresh={refresh}
      />

      {/* Create Lab Modal */}
      <LabCreate
        isOpen={showCreate}
        courses={coursesForModal}
        onSave={handleLabCreateSave}
        onClose={handleCreateCancel}
      />

      {/* Edit Lab Modal */}
      <LabEdit
        isOpen={editingLab !== null}
        lab={editingLab}
        courses={coursesForModal}
        onSave={handleLabEditSave}
        onClose={handleEditCancel}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Lab"
        message={`Are you sure you want to delete "${labToDelete?.title}"? This action cannot be undone and will remove all associated submissions and data.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Lab Detail Modal */}
      {detailLab && (
        <LabDetail
          isOpen={detailLab !== null}
          lab={detailLab}
          onClose={() => setDetailLab(null)}
          onEditClick={() => {
            setEditingLab(detailLab);
            setDetailLab(null);
          }}
          onViewSubmissions={() => {
            setSubmissionLab(detailLab);
            setDetailLab(null);
          }}
          onManageInstructions={() => handleManageInstructions(detailLab)}
          onUploadTaMaterials={() => handleUploadTaMaterials(detailLab)}
          onViewAttendance={() => handleViewAttendance(detailLab)}
        />
      )}

      {/* Instruction Editor */}
      {instructionLab && (
        <InstructionEditor
          isOpen={instructionLab !== null}
          lab={instructionLab}
          onClose={() => setInstructionLab(null)}
          onInstructionsUpdated={handleInstructionsUpdated}
        />
      )}

      {/* TA Material Upload */}
      {taMaterialLab && (
        <TaMaterialUpload
          isOpen={taMaterialLab !== null}
          lab={taMaterialLab}
          onClose={() => setTaMaterialLab(null)}
          onUploadComplete={handleTaMaterialUploaded}
        />
      )}

      {/* Submission List */}
      {submissionLab && (
        <SubmissionList
          isOpen={submissionLab !== null}
          lab={submissionLab}
          onClose={() => setSubmissionLab(null)}
          onGradeSubmission={handleGradeSubmission}
        />
      )}

      {/* Grading Panel */}
      {gradingLab && gradingSubmission && (
        <GradingPanel
          isOpen={gradingSubmission !== null}
          lab={gradingLab}
          submission={gradingSubmission}
          onClose={() => {
            setGradingSubmission(null);
            setGradingLab(null);
          }}
          onGraded={handleGradingComplete}
        />
      )}

      {/* Attendance Sheet */}
      {attendanceLab && (
        <AttendanceSheet
          isOpen={attendanceLab !== null}
          lab={attendanceLab}
          onClose={() => setAttendanceLab(null)}
        />
      )}
    </div>
  );
}

export default LabsDashboard;
