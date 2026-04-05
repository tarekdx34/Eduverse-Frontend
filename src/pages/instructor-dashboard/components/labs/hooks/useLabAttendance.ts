import { useState, useEffect, useCallback } from 'react';
import { LabService } from '../../../../../services/api/labService';
import { LabAttendance, AttendanceStatus } from '../types';

interface UseLabAttendanceOptions {
  labId: string | null;
  autoFetch?: boolean;
}

interface UseLabAttendanceReturn {
  attendance: LabAttendance[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAttendance: (userId: number, status: AttendanceStatus, notes?: string) => Promise<void>;
  getStudentStatus: (userId: number) => AttendanceStatus | null;
}

export function useLabAttendance({ labId, autoFetch = true }: UseLabAttendanceOptions): UseLabAttendanceReturn {
  const [attendance, setAttendance] = useState<LabAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    if (!labId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await LabService.getAttendance(labId);
      setAttendance(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance');
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    if (autoFetch && labId) {
      fetchAttendance();
    }
  }, [autoFetch, labId, fetchAttendance]);

  const markAttendance = useCallback(async (
    userId: number,
    status: AttendanceStatus,
    notes?: string
  ) => {
    if (!labId) throw new Error('No lab selected');
    
    await LabService.markAttendance(labId, userId, status, notes);
    
    // Update local state
    setAttendance(prev => {
      const existing = prev.findIndex(a => a.userId === userId);
      const newRecord: LabAttendance = {
        attendanceId: Date.now(), // temp ID until refresh
        labId,
        userId,
        status,
        notes,
        markedBy: 0, // will be set by server
        markedAt: new Date().toISOString(),
      };
      
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], status, notes };
        return updated;
      }
      return [...prev, newRecord];
    });
  }, [labId]);

  const getStudentStatus = useCallback((userId: number): AttendanceStatus | null => {
    const record = attendance.find(a => a.userId === userId);
    return record?.status || null;
  }, [attendance]);

  return {
    attendance,
    loading,
    error,
    refresh: fetchAttendance,
    markAttendance,
    getStudentStatus,
  };
}

export default useLabAttendance;
