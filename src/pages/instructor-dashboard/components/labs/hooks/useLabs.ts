/**
 * useLabs Hook
 * Centralized data fetching and state management for labs list
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import LabService, { Lab, LabWithInstructions, LabSubmission } from '../../../../../services/api/labService';
import { LabUIData, LabStatus } from '../types';

export interface UseLabsOptions {
  courseId?: string;
  initialStatus?: 'all' | LabStatus;
  limitToCourseIds?: string[]; // Optional: limit results to these courses if 'all' is selected
}

export interface UseLabsReturn {
  // Data
  labs: LabUIData[];
  loading: boolean;
  error: string | null;

  // Filters
  selectedCourse: string;
  setSelectedCourse: (courseId: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Filtered results
  filteredLabs: LabUIData[];

  // Actions
  refresh: () => void;
  createLab: (data: Partial<Lab>) => Promise<Lab>;
  updateLab: (labId: string, data: Partial<Lab>) => Promise<Lab>;
  deleteLab: (labId: string) => Promise<void>;
  changeStatus: (labId: string, status: LabStatus) => Promise<Lab>;

  // Detailed data fetchers
  fetchLabDetails: (labId: string) => Promise<LabWithInstructions>;
  fetchSubmissions: (labId: string) => Promise<LabSubmission[]>;
}

export function useLabs(options: UseLabsOptions = {}): UseLabsReturn {
  const { courseId: initialCourseId, initialStatus = 'all', limitToCourseIds } = options;

  // State
  const [labs, setLabs] = useState<LabUIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch labs
  useEffect(() => {
    let cancelled = false;

    async function fetchLabs() {
      try {
        setLoading(true);
        setError(null);

        const params = selectedCourse !== 'all' ? { courseId: selectedCourse } : undefined;
        const response = await LabService.getAll(params);
        
        if (cancelled) return;

        const labs = Array.isArray(response) ? response : response.data || [];
        setLabs(labs);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load labs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load labs');
        setLabs([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchLabs();

    return () => {
      cancelled = true;
    };
  }, [selectedCourse, refreshKey]);

  // Filtered labs based on search and status
  const filteredLabs = useMemo(() => {
    return labs.filter((lab) => {
      // Search filter
      const matchesSearch = 
        searchQuery === '' ||
        lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.course?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = 
        selectedStatus === 'all' || 
        lab.status === selectedStatus;

      // Course access filter (for TA/Instructor limiting)
      const isAllowedCourse = 
        !limitToCourseIds || 
        limitToCourseIds.length === 0 || 
        limitToCourseIds.includes(String(lab.courseId));

      return matchesSearch && matchesStatus && isAllowedCourse;
    });
  }, [labs, searchQuery, selectedStatus, limitToCourseIds]);

  // Refresh function
  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Create lab
  const createLab = useCallback(async (data: Partial<Lab>) => {
    const newLab = await LabService.create(data);
    refresh();
    return newLab;
  }, [refresh]);

  // Update lab
  const updateLab = useCallback(async (labId: string, data: Partial<Lab>) => {
    const updated = await LabService.update(labId, data);
    refresh();
    return updated;
  }, [refresh]);

  // Delete lab
  const deleteLab = useCallback(async (labId: string) => {
    await LabService.delete(labId);
    refresh();
  }, [refresh]);

  // Change lab status
  const changeStatus = useCallback(async (labId: string, status: LabStatus) => {
    const updated = await LabService.update(labId, { status });
    refresh();
    return updated;
  }, [refresh]);

  // Fetch detailed lab with instructions
  const fetchLabDetails = useCallback(async (labId: string) => {
    return LabService.getById(labId);
  }, []);

  // Fetch submissions for a lab
  const fetchSubmissions = useCallback(async (labId: string) => {
    return LabService.getSubmissions(labId);
  }, []);

  return {
    labs,
    loading,
    error,
    selectedCourse,
    setSelectedCourse,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    filteredLabs,
    refresh,
    createLab,
    updateLab,
    deleteLab,
    changeStatus,
    fetchLabDetails,
    fetchSubmissions,
  };
}
