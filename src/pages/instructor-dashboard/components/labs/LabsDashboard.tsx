/**
 * LabsDashboard - Main container component for labs management
 * Orchestrates all lab sub-components
 */

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import { LabList } from './LabList';
import { LabCreate } from './LabCreate';
import { LabEdit } from './LabEdit';
import { LabDetail } from './LabDetail';
import { InstructionEditor } from './InstructionEditor';
import { SubmissionList } from './SubmissionList';
import { GradingPanel } from './GradingPanel';
import { AttendanceSheet } from './AttendanceSheet';
import { useLabs } from './hooks/useLabs';
import { LabUIData, LabFormData, LabSubmission } from './types';
import { ConfirmDialog } from '../ConfirmDialog';
import LabService from '../../../../services/api/labService';

export interface LabsDashboardProps {
  courses?: { id?: string; courseId?: string; name?: string; courseName?: string; courseCode?: string }[];
}

interface CourseForModal {
  id: string;
  name: string;
  code: string;
}

export function LabsDashboard({ courses = [] }: LabsDashboardProps) {
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
        const rawName = (c.courseName || c.name || '').trim();
        const explicitCode = (c.courseCode || '').trim();

        if (!id || !rawName) return null;

        const hasInlineCode = rawName.includes(' - ');
        const codeFromName = hasInlineCode ? rawName.split(' - ')[0].trim() : '';
        const displayName = hasInlineCode ? rawName.split(' - ').slice(1).join(' - ').trim() : rawName;

        return {
          id,
          name: displayName || rawName,
          code: explicitCode || codeFromName || 'COURSE',
        };
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
  const [submissionLab, setSubmissionLab] = useState<LabUIData | null>(null);
  const [attendanceLab, setAttendanceLab] = useState<LabUIData | null>(null);
  
  // Grading state
  const [gradingLab, setGradingLab] = useState<LabUIData | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<LabSubmission | null>(null);

  // Action handlers
  const handleCreateClick = useCallback(() => {
    setShowCreate(true);
  }, []);

  const handleEditClick = useCallback(async (lab: LabUIData) => {
    setEditingLab(lab);
    try {
      const fullLab = await LabService.getById(lab.id);
      setEditingLab(fullLab as unknown as LabUIData);
    } catch (err) {
      // Keep modal usable with list data if details fetch fails.
      console.warn('Failed to load full lab details for edit modal:', err);
    }
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

  const handleLabCreateSave = useCallback(async (data: LabFormData, instructionFiles: File[] = []) => {
    try {
      const createdLab = await LabService.create(data);

      if (instructionFiles.length > 0) {
        const failedUploads: string[] = [];
        for (const file of instructionFiles) {
          try {
            await LabService.uploadInstructionFile(createdLab.id, file);
          } catch (uploadErr) {
            console.error('Failed to upload lab instruction file:', uploadErr);
            failedUploads.push(file.name);
          }
        }

        if (failedUploads.length > 0) {
          toast.error(
            `Lab created, but ${failedUploads.length} instruction file(s) failed to upload: ${failedUploads.join(', ')}`
          );
        }
      }

      handleLabSaved();
    } catch (err) {
      console.error('Failed to create lab:', err);
      throw err;
    }
  }, [handleLabSaved]);

  const handleLabEditSave = useCallback(async (data: Partial<LabUIData>, instructionFiles: File[] = [], instructionsToDelete?: string[]) => {
    try {
      if (editingLab) {
        await LabService.update(editingLab.id, data);

        // Delete marked instructions
        if (instructionsToDelete && instructionsToDelete.length > 0) {
          console.log('[LabsDashboard] Deleting instructions:', instructionsToDelete);
          console.log('[LabsDashboard] Editing lab ID:', editingLab.id);
          const failedDeletions: string[] = [];

          for (const instructionId of instructionsToDelete) {
            try {
              console.log('[LabsDashboard] Calling deleteInstruction API:', { labId: editingLab.id, instructionId });
              await LabService.deleteInstruction(editingLab.id, instructionId);
              console.log('[LabsDashboard] deleteInstruction succeeded');
            } catch (deleteErr) {
              console.error('[LabsDashboard] Failed to delete instruction:', deleteErr);
              console.error('[LabsDashboard] Error details:', JSON.stringify(deleteErr, null, 2));
              failedDeletions.push(instructionId);
            }
          }

          if (failedDeletions.length > 0) {
            toast.error(
              `Lab updated, but ${failedDeletions.length} instruction(s) failed to delete`
            );
          } else {
            toast.success(`${instructionsToDelete.length} instruction(s) deleted`);
          }
        }

        // Upload new instruction files
        if (instructionFiles.length > 0) {
          const existingInstructionCount = Array.isArray((editingLab as any)?.instructions)
            ? (editingLab as any).instructions.length
            : 0;

          const failedUploads: string[] = [];

          for (let index = 0; index < instructionFiles.length; index += 1) {
            try {
              await LabService.uploadInstructionFile(editingLab.id, instructionFiles[index], {
                title: instructionFiles[index].name,
                orderIndex: existingInstructionCount + index,
              });
            } catch (uploadErr) {
              console.error('Failed to upload lab instruction file:', uploadErr);
              failedUploads.push(instructionFiles[index].name);
            }
          }

          if (failedUploads.length > 0) {
            toast.error(
              `Lab updated, but ${failedUploads.length} instruction file(s) failed to upload: ${failedUploads.join(', ')}`
            );
          }
        }

        handleLabSaved();
      }
    } catch (err) {
      console.error('Failed to update lab:', err);
      throw err;
    }
  }, [editingLab, handleLabSaved]);

  // Detail and feature handlers
  const handleViewDetails = useCallback(async (lab: LabUIData) => {
    setDetailLab(lab);
    try {
      const fullLab = await LabService.getById(lab.id);
      setDetailLab(fullLab as unknown as LabUIData);
    } catch (err) {
      // Keep modal usable with list data if details fetch fails.
      console.warn('Failed to load full lab details for detail modal:', err);
    }
  }, []);

  const handleViewSubmissions = useCallback((lab: LabUIData) => {
    setSubmissionLab(lab);
  }, []);

  const handleManageInstructions = useCallback((lab: LabUIData) => {
    setInstructionLab(lab);
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
