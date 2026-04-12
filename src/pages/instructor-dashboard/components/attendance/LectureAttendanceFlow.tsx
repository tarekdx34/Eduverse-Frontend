import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Camera, CheckCircle2, CircleHelp, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { ApiClient } from '../../../../services/api/client';
import { AI_ATTENDANCE_BASE_URL } from '../../../../services/api/config';
import { toast } from 'sonner';
import { CustomDropdown } from '../../../../components/shared/CustomDropdown';
import { ConfirmDialog } from '../ConfirmDialog';
import { useTheme } from '../../contexts/ThemeContext';

const STATUSES = ['present', 'absent', 'late', 'excused'] as const;
type AttendanceStatus = (typeof STATUSES)[number];

const SESSION_TYPE_OPTIONS = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'lab', label: 'Lab' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'exam', label: 'Exam' },
];

type TeachingRow = {
  sectionId?: number;
  section?: { id?: number; sectionNumber?: string };
  course?: { code?: string; name?: string };
  semester?: { name?: string };
};

type AttendanceSessionRow = {
  id: number;
  sectionId: number;
  sessionDate: string;
  sessionType?: string;
  status: string;
};

type AttUser = {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type AttRecord = {
  userId: number;
  attendanceStatus?: string;
  user?: AttUser;
};

type SessionDetail = AttendanceSessionRow & { records?: AttRecord[] };

type RosterRow = {
  userId: number;
  name: string;
  email: string;
  status: AttendanceStatus;
  initial: AttendanceStatus;
};

type ConfirmConfig = {
  title: string;
  message: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
};

type AiFaceResult = {
  name?: string;
  confidence?: number;
  location?: number[];
};

type AiAttendanceResponse = {
  marked_ids?: string[];
  recognized_faces?: AiFaceResult[];
};

type AiReviewRow = {
  userId: number;
  name: string;
  suggested: AttendanceStatus;
  confidence: number | null;
};

function displayName(user: AttUser | undefined, userId: number): string {
  if (user && (user.firstName || user.lastName)) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  }
  if (user?.email) return user.email;
  return `Student #${userId}`;
}

function normalizeStatus(s: string | undefined): AttendanceStatus {
  const x = (s || 'absent').toLowerCase();
  return (STATUSES as readonly string[]).includes(x) ? (x as AttendanceStatus) : 'absent';
}

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

const STATUS_TOGGLE_META: Record<
  AttendanceStatus,
  { label: string; Icon: LucideIcon; selected: string; idle: string }
> = {
  present: {
    label: 'Present',
    Icon: CheckCircle2,
    selected:
      'border border-emerald-500/70 bg-emerald-950/80 text-emerald-100 shadow-md shadow-emerald-900/40 ring-1 ring-emerald-400/30',
    idle: 'border border-transparent text-emerald-500/70 hover:border-emerald-500/30 hover:bg-emerald-950/40 hover:text-emerald-400',
  },
  absent: {
    label: 'Absent',
    Icon: XCircle,
    selected:
      'border border-red-500/70 bg-red-950/80 text-red-100 shadow-md shadow-red-900/40 ring-1 ring-red-400/30',
    idle: 'border border-transparent text-red-500/70 hover:border-red-500/30 hover:bg-red-950/40 hover:text-red-400',
  },
  late: {
    label: 'Late',
    Icon: Clock,
    selected:
      'border border-amber-500/70 bg-amber-950/80 text-amber-100 shadow-md shadow-amber-900/40 ring-1 ring-amber-400/30',
    idle: 'border border-transparent text-amber-500/70 hover:border-amber-500/30 hover:bg-amber-950/40 hover:text-amber-300',
  },
  excused: {
    label: 'Excused',
    Icon: CircleHelp,
    selected:
      'border border-sky-500/70 bg-sky-950/80 text-sky-100 shadow-md shadow-sky-900/40 ring-1 ring-sky-400/30',
    idle: 'border border-transparent text-sky-500/70 hover:border-sky-500/30 hover:bg-sky-950/40 hover:text-sky-300',
  },
};

function StatusFourToggle({
  value,
  onChange,
  disabled,
  isDark,
}: {
  value: AttendanceStatus;
  onChange: (v: AttendanceStatus) => void;
  disabled?: boolean;
  isDark: boolean;
}) {
  const ease = 'cubic-bezier(0.4, 0, 0.2, 1)';
  /** Fixed total width + equal columns so nothing grows wider than the cell during transitions. */
  return (
    <div
      role="group"
      aria-label="Attendance status"
      className={`grid w-[15.75rem] shrink-0 grid-cols-4 gap-0.5 rounded-xl border p-1 shadow-inner sm:w-[16.75rem] ${
        isDark ? 'border-slate-600/80 bg-slate-950/90' : 'border-gray-300 bg-gray-100'
      }`}
      style={{ transitionTimingFunction: ease }}
    >
      {STATUSES.map((s) => {
        const selected = value === s;
        const meta = STATUS_TOGGLE_META[s];
        const { Icon, label } = meta;
        return (
          <button
            key={s}
            type="button"
            disabled={disabled}
            title={label}
            aria-pressed={selected}
            aria-label={label}
            onClick={() => onChange(s)}
            className={`flex h-[3.35rem] flex-col items-center justify-center overflow-hidden rounded-lg px-0.5 font-semibold transition-[box-shadow,background-color,border-color,ring-color] duration-300 sm:h-[3.5rem] ${
              selected ? meta.selected : meta.idle
            } disabled:cursor-not-allowed disabled:opacity-40`}
            style={{ transitionTimingFunction: ease }}
          >
            <Icon
              className={`shrink-0 transition-[width,height] duration-300 ${
                selected ? 'size-[1.1rem] sm:size-[1.2rem]' : 'size-4 sm:size-[1.05rem]'
              }`}
              style={{ transitionTimingFunction: ease }}
              strokeWidth={selected ? 2.25 : 2}
              aria-hidden
            />
            <span
              className={`w-full truncate text-center text-[0.6rem] font-semibold leading-tight transition-[opacity,margin,max-height] duration-300 sm:text-[0.65rem] ${
                selected ? 'mt-1 max-h-8 opacity-100' : 'mt-0 max-h-0 opacity-0'
              }`}
              style={{ transitionTimingFunction: ease }}
              aria-hidden={!selected}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export type LectureAttendanceFlowProps = {
  /** When true (default), omit full-page shell and sign-out; use dashboard theme. */
  embedded?: boolean;
};

export function LectureAttendanceFlow({ embedded = true }: LectureAttendanceFlowProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as { isDark: boolean; primaryHex?: string };

  type View = 'classes' | 'section' | 'roster';
  const [view, setView] = useState<View>('classes');
  const [teaching, setTeaching] = useState<TeachingRow[]>([]);
  const [loadingTeaching, setLoadingTeaching] = useState(false);
  const [selectedClass, setSelectedClass] = useState<{
    row: TeachingRow;
    sectionId: number;
  } | null>(null);
  const [openSessions, setOpenSessions] = useState<AttendanceSessionRow[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [newSessionType, setNewSessionType] = useState('lecture');

  const [activeSession, setActiveSession] = useState<{
    id: number;
    status: string;
    sectionId: number;
    sessionDate?: string;
    sessionType?: string;
  } | null>(null);
  const [rosterReadOnly, setRosterReadOnly] = useState(false);
  const [rosterRows, setRosterRows] = useState<RosterRow[]>([]);
  const [rosterDirty, setRosterDirty] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiAttendanceResponse | null>(null);
  const [aiFaceThumbs, setAiFaceThumbs] = useState<Record<number, string>>({});
  const [aiUnknownCount, setAiUnknownCount] = useState(0);

  useEffect(() => {
    setAiFile(null);
    setAiError(null);
    setAiResult(null);
    setAiUnknownCount(0);
    if (Object.keys(aiFaceThumbs).length > 0) {
      Object.values(aiFaceThumbs).forEach((u) => URL.revokeObjectURL(u));
      setAiFaceThumbs({});
    }
  }, [activeSession?.id]);

  const openConfirm = useCallback((cfg: ConfirmConfig) => {
    setConfirmConfig(cfg);
    setConfirmOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
    setConfirmConfig(null);
  }, []);

  const loadTeaching = useCallback(async () => {
    setLoadingTeaching(true);
    try {
      const data = await ApiClient.get<TeachingRow[]>('/enrollments/teaching');
      setTeaching(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(errMessage(e));
      setTeaching([]);
    } finally {
      setLoadingTeaching(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadTeaching();
      setView('classes');
    } else {
      setTeaching([]);
      setView('classes');
    }
  }, [isAuthenticated, loadTeaching]);

  const loadOpenSessions = useCallback(async (sectionId: number) => {
    setLoadingSessions(true);
    try {
      const res = await ApiClient.get<{ data?: AttendanceSessionRow[] }>(
        '~/attendance/sessions',
        {
          params: {
            sectionId,
            limit: 30,
            sortBy: 'sessionDate',
            sortOrder: 'DESC',
          },
        },
      );
      const rows = res.data ?? [];
      setOpenSessions(rows.filter((s) => s.status === 'scheduled' || s.status === 'in_progress'));
    } catch (e) {
      toast.error(errMessage(e));
      setOpenSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const openSection = (row: TeachingRow, sectionId: number) => {
    setRosterDirty(false);
    setSelectedClass({ row, sectionId });
    setNewSessionDate(new Date().toISOString().slice(0, 10));
    setView('section');
    void loadOpenSessions(sectionId);
  };

  const backToClasses = () => {
    setSelectedClass(null);
    setView('classes');
  };

  const openRosterFromSession = (session: AttendanceSessionRow) => {
    setActiveSession({
      id: session.id,
      status: session.status,
      sectionId: session.sectionId,
      sessionDate: session.sessionDate,
      sessionType: session.sessionType,
    });
    setRosterReadOnly(session.status === 'completed' || session.status === 'cancelled');
    setView('roster');
    void loadRosterData(session.id, session.status === 'completed' || session.status === 'cancelled');
  };

  const loadRosterData = async (sessionId: number, readOnly: boolean) => {
    setRosterReadOnly(readOnly);
    setRosterDirty(false);
    try {
      const session = await ApiClient.get<SessionDetail>(`~/attendance/sessions/${sessionId}`);
      const records = session.records ?? [];
      const mapped: RosterRow[] = records
        .map((r) => {
          const st = normalizeStatus(r.attendanceStatus);
          return {
            userId: r.userId,
            name: displayName(r.user, r.userId),
            email: r.user?.email ?? '—',
            status: st,
            initial: st,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      setRosterRows(mapped);
    } catch (e) {
      toast.error(errMessage(e));
      setRosterRows([]);
    }
  };

  const backToSection = () => {
    if (selectedClass) void loadOpenSessions(selectedClass.sectionId);
    setView('section');
  };

  const applyStatus = (userId: number, next: AttendanceStatus) => {
    const row = rosterRows.find((r) => r.userId === userId);
    if (row?.status === next) return;
    setRosterRows((rows) => rows.map((r) => (r.userId === userId ? { ...r, status: next } : r)));
    setRosterDirty(true);
  };

  const setAllStatus = (status: AttendanceStatus) => {
    if (rosterReadOnly) return;
    if (status === 'present') {
      openConfirm({
        title: 'Everyone present',
        message:
          'Mark every student as present? You can still change individuals before saving.',
        variant: 'info',
        confirmText: 'Mark all present',
        onConfirm: () => {
          closeConfirm();
          setRosterRows((rows) => rows.map((r) => ({ ...r, status })));
          setRosterDirty(true);
          toast.success('All set to present locally — remember to Save.');
        },
      });
      return;
    }
    openConfirm({
      title: 'Everyone absent',
      message:
        'Mark every student absent? This resets the sheet — only continue if you mean it.',
      variant: 'warning',
      confirmText: 'Mark all absent',
      onConfirm: () => {
        closeConfirm();
        setRosterRows((rows) => rows.map((r) => ({ ...r, status })));
        setRosterDirty(true);
      },
    });
  };

  const saveBatch = async () => {
    if (rosterReadOnly || !activeSession) return;
    const records = rosterRows.map((r) => ({
      userId: r.userId,
      attendanceStatus: r.status,
    }));
    try {
      await ApiClient.post('~/attendance/records/batch', {
        sessionId: activeSession.id,
        records,
      });
      setRosterDirty(false);
      setRosterRows((rows) => rows.map((r) => ({ ...r, initial: r.status })));
      toast.success('Attendance saved.');
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const closeSession = async () => {
    if (rosterReadOnly || !activeSession) return;
    try {
      await ApiClient.patch(`~/attendance/sessions/${activeSession.id}/close`, {});
      toast.success('Session closed.');
      setRosterReadOnly(true);
      setActiveSession((s) => (s ? { ...s, status: 'completed' } : null));
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const runLocalAiAttendance = async () => {
    if (!aiFile) {
      toast.error('Choose a class photo first.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const fd = new FormData();
      fd.append('image', aiFile);
      const res = await fetch(`${AI_ATTENDANCE_BASE_URL}/attendance`, {
        method: 'POST',
        body: fd,
      });
      const text = await res.text();
      let data: AiAttendanceResponse;
      try {
        data = JSON.parse(text) as AiAttendanceResponse;
      } catch {
        throw new Error(text.slice(0, 200) || `HTTP ${res.status}`);
      }
      if (!res.ok) {
        throw new Error(
          typeof data === 'object' && data && 'detail' in data
            ? String((data as { detail: unknown }).detail)
            : text.slice(0, 200) || `HTTP ${res.status}`,
        );
      }
      const recognizedFaces = data.recognized_faces ?? [];
      const nextThumbs = aiFile ? await buildAiFaceThumbs(aiFile, recognizedFaces) : { thumbs: {}, unknownCount: 0 };
      if (Object.keys(aiFaceThumbs).length > 0) {
        Object.values(aiFaceThumbs).forEach((u) => URL.revokeObjectURL(u));
      }
      setAiFaceThumbs(nextThumbs.thumbs);
      setAiUnknownCount(nextThumbs.unknownCount);
      setAiResult(data);
      toast.success('AI response received.');
    } catch (e) {
      const msg = errMessage(e);
      setAiError(msg);
      toast.error(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const aiReviewRows = useMemo<AiReviewRow[]>(() => {
    if (!aiResult) return [];
    const markedSet = new Set((aiResult.marked_ids ?? []).map((x) => String(x).trim()));
    const confidenceByUser = new Map<number, number>();
    for (const face of aiResult.recognized_faces ?? []) {
      const idStr = String(face.name ?? '').trim();
      if (!/^\d+$/.test(idStr)) continue;
      const uid = Number(idStr);
      if (!Number.isFinite(uid)) continue;
      const conf = typeof face.confidence === 'number' ? face.confidence : 0;
      const prev = confidenceByUser.get(uid);
      if (prev == null || conf > prev) confidenceByUser.set(uid, conf);
    }
    return rosterRows.map((r) => ({
      userId: r.userId,
      name: r.name,
      suggested: markedSet.has(String(r.userId)) ? 'present' : 'absent',
      confidence: confidenceByUser.has(r.userId) ? confidenceByUser.get(r.userId)! : null,
    }));
  }, [aiResult, rosterRows]);

  const aiNeedsReviewRows = useMemo(() => {
    return [...aiReviewRows]
      .filter((row) => row.suggested !== 'present' || row.confidence == null || row.confidence < 85)
      .sort((a, b) => {
        const ca = a.confidence ?? -1;
        const cb = b.confidence ?? -1;
        return ca - cb;
      });
  }, [aiReviewRows]);

  const aiReviewByUserId = useMemo(() => {
    const m = new Map<number, AiReviewRow>();
    for (const row of aiReviewRows) m.set(row.userId, row);
    return m;
  }, [aiReviewRows]);

  const needsReviewIdSet = useMemo(
    () => new Set(aiNeedsReviewRows.map((r) => r.userId)),
    [aiNeedsReviewRows],
  );

  /** Flagged-for-review rows first after AI runs; otherwise preserve roster order. */
  const sortedRosterRows = useMemo(() => {
    const rows = [...rosterRows];
    if (!aiResult || needsReviewIdSet.size === 0) return rows;
    return rows.sort((a, b) => {
      const aFlag = needsReviewIdSet.has(a.userId) ? 0 : 1;
      const bFlag = needsReviewIdSet.has(b.userId) ? 0 : 1;
      if (aFlag !== bFlag) return aFlag - bFlag;
      return a.name.localeCompare(b.name);
    });
  }, [rosterRows, aiResult, needsReviewIdSet]);

  const applyAiReviewToRoster = () => {
    if (rosterReadOnly) {
      toast.error('Session is closed - open an active session to apply.');
      return;
    }
    if (!aiReviewRows.length) {
      toast.error('No AI results to review yet.');
      return;
    }
    let changed = 0;
    const next = rosterRows.map((r) => {
      const ai = aiReviewByUserId.get(r.userId);
      if (!ai) return r;
      if (r.status !== ai.suggested) changed += 1;
      return { ...r, status: ai.suggested };
    });
    setRosterRows(next);
    if (changed > 0) setRosterDirty(true);
    toast.success(
      changed > 0
        ? `Applied AI suggestions to ${changed} student(s). Adjust any row below, then Save.`
        : 'Roster already matches AI suggestions. Adjust statuses if needed, then Save.',
    );
  };

  const buildAiFaceThumbs = async (
    file: File,
    recognizedFaces: AiFaceResult[],
  ): Promise<{ thumbs: Record<number, string>; unknownCount: number }> => {
    const faceByUser = new Map<number, AiFaceResult>();
    let unknownCount = 0;
    for (const face of recognizedFaces) {
      const rawName = String(face.name ?? '').trim();
      if (rawName === 'Unknown') {
        unknownCount += 1;
        continue;
      }
      if (!/^\d+$/.test(rawName) || !Array.isArray(face.location) || face.location.length < 4) continue;
      const uid = Number(rawName);
      const conf = typeof face.confidence === 'number' ? face.confidence : 0;
      const prev = faceByUser.get(uid);
      const prevConf = typeof prev?.confidence === 'number' ? prev.confidence : -1;
      if (!prev || conf > prevConf) faceByUser.set(uid, face);
    }

    if (faceByUser.size === 0) return { thumbs: {}, unknownCount };

    const imgUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error('Failed to load uploaded image for face previews.'));
        el.src = imgUrl;
      });

      const thumbs: Record<number, string> = {};
      faceByUser.forEach((face, uid) => {
        const loc = face.location ?? [];
        const [topRaw, rightRaw, bottomRaw, leftRaw] = loc as number[];
        const top = Math.max(0, Math.floor(topRaw));
        const left = Math.max(0, Math.floor(leftRaw));
        const width = Math.max(1, Math.floor(rightRaw - leftRaw));
        const height = Math.max(1, Math.floor(bottomRaw - topRaw));
        const padX = Math.floor(width * 0.25);
        const padY = Math.floor(height * 0.25);
        const sx = Math.max(0, left - padX);
        const sy = Math.max(0, top - padY);
        const sw = Math.min(img.width - sx, width + padX * 2);
        const sh = Math.min(img.height - sy, height + padY * 2);
        if (sw <= 0 || sh <= 0) return;

        const canvas = document.createElement('canvas');
        const size = 88;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
        thumbs[uid] = canvas.toDataURL('image/jpeg', 0.9);
      });
      return { thumbs, unknownCount };
    } finally {
      URL.revokeObjectURL(imgUrl);
    }
  };

  const createSession = async () => {
    if (!selectedClass) return;
    const { sectionId } = selectedClass;
    if (!newSessionDate) {
      toast.error('Pick a date.');
      return;
    }
    try {
      const session = await ApiClient.post<AttendanceSessionRow>('~/attendance/sessions', {
        sectionId,
        sessionDate: newSessionDate,
        sessionType: newSessionType,
      });
      toast.success('Session created.');
      await loadOpenSessions(sectionId);
      openRosterFromSession(session);
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const sectionTitle = useMemo(() => {
    if (!selectedClass) return '';
    const c = selectedClass.row.course ?? {};
    return `${c.code ?? ''} — ${c.name ?? 'Course'}`.trim();
  }, [selectedClass]);

  const rosterTitle = useMemo(() => {
    const c = selectedClass?.row.course ?? {};
    return `${c.code || 'Course'} — roster`;
  }, [selectedClass]);

  const rosterSubtitle = useMemo(() => {
    if (!activeSession) return '';
    const parts = [
      `Session ${activeSession.id}`,
      activeSession.sessionDate,
      activeSession.sessionType,
      activeSession.status,
    ].filter(Boolean);
    return parts.join(' · ');
  }, [activeSession]);

  const card = isDark ? 'rounded-xl border border-white/10 bg-card-dark' : 'rounded-xl border border-gray-200 bg-white shadow-sm';
  const muted = isDark ? 'text-slate-400' : 'text-gray-600';
  const subMuted = isDark ? 'text-slate-500' : 'text-gray-500';
  const textMain = isDark ? 'text-slate-100' : 'text-gray-900';
  const borderInner = isDark ? 'border-slate-800' : 'border-gray-200';
  const inputBg = isDark ? 'border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100' : 'border-gray-300 bg-white px-3 py-2 text-sm text-gray-900';

  if (isLoading) {
    return (
      <div
        className={`flex min-h-[40vh] items-center justify-center ${isDark ? 'text-slate-300' : 'text-gray-600'}`}
      >
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`rounded-xl border p-6 ${isDark ? 'border-white/10 bg-card-dark' : 'border-gray-200 bg-white'}`}>
        <h2 className={`text-lg font-semibold ${textMain}`}>Lecture attendance</h2>
        <p className={`mt-1 text-sm ${muted}`}>Sign in to manage attendance for your sections.</p>
        <Link
          to="/login"
          className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: primaryHex }}
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`${embedded ? '' : 'min-h-screen px-4 py-8'} ${isDark ? 'text-slate-100' : 'text-gray-900'}`}
    >
      <div
        className={embedded ? 'w-full' : 'mx-auto w-full max-w-3xl'}
      >
        {view === 'classes' && (
          <>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className={`text-xl font-semibold tracking-tight ${textMain}`}>Your sections</h1>
                <p className={`text-sm ${muted}`}>Choose a class to take attendance.</p>
                {user && (
                  <p className={`mt-1 text-xs ${subMuted}`}>
                    {user.firstName} {user.lastName} · {user.email}
                  </p>
                )}
              </div>
            </div>
            {loadingTeaching ? (
              <p className={`text-sm ${subMuted}`}>Loading your sections…</p>
            ) : teaching.length === 0 ? (
              <p className={`${card} p-4 text-sm ${muted}`}>
                No sections are assigned to your account as instructor or TA.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {teaching.map((row) => {
                  const sid = row.sectionId ?? row.section?.id;
                  if (sid == null) return null;
                  const course = row.course ?? {};
                  const sec = row.section ?? {};
                  const sem = row.semester ?? {};
                  return (
                    <button
                      key={sid}
                      type="button"
                      onClick={() => openSection(row, sid)}
                      className={`${card} p-4 text-left transition hover:opacity-95`}
                    >
                      <div className={`text-[0.7rem] font-semibold uppercase tracking-wider ${subMuted}`}>
                        {course.code}
                      </div>
                      <div className={`mt-0.5 font-semibold ${textMain}`}>{course.name ?? 'Course'}</div>
                      <div className={`mt-1 text-xs ${subMuted}`}>
                        Section {sec.sectionNumber ?? sid} · {sem.name ?? ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {view === 'section' && selectedClass && (
          <>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className={`text-lg font-semibold ${textMain}`}>{sectionTitle}</h2>
                <p className={`text-sm ${muted}`}>
                  Section {selectedClass.row.section?.sectionNumber ?? selectedClass.sectionId} ·
                  Take or resume attendance
                </p>
              </div>
              <button
                type="button"
                onClick={backToClasses}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  isDark
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-800/80'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                ← All sections
              </button>
            </div>

            <div className={`mb-4 ${card} p-4`}>
              <h3 className={`text-sm font-semibold ${textMain}`}>Open sessions</h3>
              <p className={`mt-1 text-xs ${subMuted}`}>
                Sessions that are not closed yet. Resume to keep editing.
              </p>
              {loadingSessions ? (
                <p className={`mt-3 text-sm ${subMuted}`}>Loading…</p>
              ) : openSessions.length === 0 ? (
                <p className={`mt-3 text-sm ${subMuted}`}>No open sessions. Start a new lecture below.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {openSessions.map((s) => (
                    <li
                      key={s.id}
                      className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 ${
                        isDark ? 'border-slate-700 bg-slate-950/40' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="text-sm">
                        <span
                          className={`mr-2 inline-block rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${
                            s.status === 'scheduled'
                              ? 'bg-blue-950 text-blue-300'
                              : 'bg-amber-950 text-amber-200'
                          }`}
                        >
                          {s.status}
                        </span>
                        <span className={`font-medium ${textMain}`}>{s.sessionDate}</span>
                        <span className={subMuted}>
                          {' '}
                          · {s.sessionType} · id {s.id}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openRosterFromSession(s)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                        style={{ backgroundColor: primaryHex }}
                      >
                        Open roster
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`${card} p-4`}>
              <h3 className={`text-sm font-semibold ${textMain}`}>Start new lecture attendance</h3>
              <label className={`mt-3 block text-xs font-semibold uppercase tracking-wide ${subMuted}`}>
                Date
              </label>
              <input
                type="date"
                value={newSessionDate}
                onChange={(e) => setNewSessionDate(e.target.value)}
                className={`mt-1 w-full max-w-xs rounded-lg border ${inputBg}`}
              />
              <div className="mt-3 max-w-xs">
                <CustomDropdown
                  label="Type"
                  options={SESSION_TYPE_OPTIONS}
                  value={newSessionType}
                  onChange={setNewSessionType}
                  isDark={isDark}
                  accentColor={primaryHex}
                />
              </div>
              <button
                type="button"
                onClick={() => void createSession()}
                className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: primaryHex }}
              >
                Create session &amp; open roster
              </button>
            </div>
          </>
        )}

        {view === 'roster' && activeSession && (
          <>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className={`text-lg font-semibold ${textMain}`}>{rosterTitle}</h2>
                <p className={`text-sm ${muted}`}>{rosterSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={backToSection}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  isDark
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-800/80'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                ← Back
              </button>
            </div>

            <div className={`${card} p-5`}>
              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={rosterReadOnly}
                  onClick={() => setAllStatus('present')}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: primaryHex }}
                >
                  Everyone present
                </button>
                <button
                  type="button"
                  disabled={rosterReadOnly}
                  onClick={() => setAllStatus('absent')}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40 ${
                    isDark
                      ? 'border-slate-600 text-slate-200 hover:bg-slate-800'
                      : 'border-gray-300 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Everyone absent
                </button>
                <button
                  type="button"
                  disabled={rosterReadOnly}
                  onClick={() => void saveBatch()}
                  className="ml-auto rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-40"
                >
                  Save attendance
                </button>
                <button
                  type="button"
                  disabled={rosterReadOnly}
                  onClick={() => void closeSession()}
                  className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-950 disabled:opacity-40"
                >
                  Close &amp; lock session
                </button>
              </div>

              {!rosterReadOnly && (
                <p className={`mb-4 text-sm ${muted}`}>
                  Use a class photo to run AI and see suggestions in the roster below. Click{' '}
                  <strong className={textMain}>Apply AI suggestions</strong> to copy them into attendance, or set
                  statuses manually at any time. Save when done.
                </p>
              )}

              <div
                className={`mb-4 rounded-xl border p-5 ${
                  isDark ? 'border-slate-600/80 bg-slate-900/60' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Camera className="size-5 shrink-0" style={{ color: primaryHex }} aria-hidden />
                    <h3 className={`text-lg font-semibold ${textMain}`}>AI from class photo</h3>
                  </div>
                  <div className={`text-sm ${muted}`}>
                    Last column fills in after you run AI on a photo
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={aiLoading || rosterReadOnly}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (Object.keys(aiFaceThumbs).length > 0) {
                        Object.values(aiFaceThumbs).forEach((u) => URL.revokeObjectURL(u));
                        setAiFaceThumbs({});
                      }
                      setAiFile(f ?? null);
                      setAiError(null);
                      setAiResult(null);
                      setAiUnknownCount(0);
                    }}
                    className={`max-w-full text-sm file:mr-2 file:rounded-lg file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white ${
                      isDark
                        ? 'text-slate-300 file:bg-slate-600 file:hover:file:bg-slate-500'
                        : 'text-gray-800 file:bg-gray-700 file:hover:file:bg-gray-600'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={aiLoading || !aiFile || rosterReadOnly}
                    onClick={() => void runLocalAiAttendance()}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                    style={{ backgroundColor: primaryHex }}
                  >
                    {aiLoading ? 'Running...' : 'Run AI'}
                  </button>
                  <button
                    type="button"
                    disabled={rosterReadOnly || !aiReviewRows.length}
                    onClick={applyAiReviewToRoster}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition disabled:opacity-40 ${
                      isDark
                        ? 'border-slate-500 text-slate-100 hover:bg-slate-800'
                        : 'border-gray-300 text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    Apply AI suggestions
                  </button>
                </div>
                {aiError && (
                  <p
                    className={`mt-2 text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}
                    role="alert"
                  >
                    {aiError}
                  </p>
                )}
              </div>

              {aiResult ? (
                <div className="mb-4 grid gap-3 sm:grid-cols-3">
                  <div
                    className={`rounded-lg border p-4 ${
                      isDark ? 'border-slate-700 bg-slate-950/60' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                      {aiReviewRows.length}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      On roster
                    </div>
                  </div>
                  <div
                    className={`rounded-lg border p-4 ${
                      isDark ? 'border-amber-800/60 bg-amber-950/25' : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <div
                      className={`text-2xl font-bold ${isDark ? 'text-amber-200' : 'text-amber-900'}`}
                    >
                      {aiNeedsReviewRows.length}
                    </div>
                    <div
                      className={`text-sm ${isDark ? 'text-amber-100/80' : 'text-amber-800'}`}
                    >
                      Flagged for review
                    </div>
                  </div>
                  <div
                    className={`rounded-lg border p-4 ${
                      isDark ? 'border-slate-700 bg-slate-950/60' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                      {aiUnknownCount}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Unknown faces
                    </div>
                  </div>
                </div>
              ) : null}

              {rosterReadOnly ? (
                <p
                  className={`mb-3 text-sm ${isDark ? 'text-amber-200/90' : 'text-amber-800'}`}
                >
                  This session is closed (view only). Open another session from the section screen to edit.
                </p>
              ) : null}

              <div className={`overflow-x-auto rounded-lg border ${borderInner}`}>
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`border-b text-left text-[0.7rem] font-semibold uppercase tracking-wide ${isDark ? 'border-slate-800' : 'border-gray-200'} ${subMuted}`}
                    >
                      <th className="px-3 py-2">Student</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="min-w-[16.5rem] px-3 py-2 sm:min-w-[17.5rem]">Status</th>
                      <th className="min-w-[9rem] px-3 py-2">AI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rosterRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={`px-3 py-6 text-center ${subMuted}`}>
                          No enrolled students (no attendance rows).
                        </td>
                      </tr>
                    ) : (
                      sortedRosterRows.map((row) => {
                        const ai = aiResult ? aiReviewByUserId.get(row.userId) : undefined;
                        const needsHighlight = Boolean(aiResult && needsReviewIdSet.has(row.userId));
                        return (
                          <tr
                            key={row.userId}
                            className={`border-b ${borderInner} ${
                              needsHighlight
                                ? isDark
                                  ? 'bg-amber-950/25'
                                  : 'bg-amber-50/90'
                                : ''
                            }`}
                          >
                            <td className={`px-3 py-2 ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                              <div className="flex items-center gap-2">
                                {aiFaceThumbs[row.userId] ? (
                                  <img
                                    src={aiFaceThumbs[row.userId]}
                                    alt=""
                                    className={`size-9 shrink-0 rounded-full object-cover ${
                                      isDark ? 'border border-slate-600' : 'border border-gray-200'
                                    }`}
                                  />
                                ) : null}
                                <div>
                                  <div className="flex flex-wrap items-center gap-2 font-medium">
                                    <span>{row.name}</span>
                                    {needsHighlight ? (
                                      <span
                                        className={`rounded px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${
                                          isDark
                                            ? 'bg-amber-950/80 text-amber-200'
                                            : 'bg-amber-100 text-amber-900'
                                        }`}
                                      >
                                        Review
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className={`px-3 py-2 text-xs ${subMuted}`}>{row.email}</td>
                            <td className="px-3 py-2 align-middle">
                              <StatusFourToggle
                                value={row.status}
                                disabled={rosterReadOnly}
                                isDark={isDark}
                                onChange={(v) => applyStatus(row.userId, v)}
                              />
                            </td>
                            <td className={`px-3 py-2 align-top ${muted}`}>
                              {aiLoading ? (
                                <span className={`text-xs italic ${subMuted}`}>Running…</span>
                              ) : !aiResult ? (
                                <span className={`text-xs leading-snug ${subMuted}`}>
                                  Not run yet. Choose a photo and click <strong className={textMain}>Run AI</strong>{' '}
                                  above.
                                </span>
                              ) : ai ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className={`font-medium capitalize ${textMain}`}>{ai.suggested}</span>
                                  {typeof ai.confidence === 'number' ? (
                                    <span className="text-xs">{ai.confidence.toFixed(0)}% confidence</span>
                                  ) : (
                                    <span className="text-xs italic">No confidence</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {confirmConfig && (
        <ConfirmDialog
          open={confirmOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          variant={confirmConfig.variant ?? 'warning'}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          onConfirm={confirmConfig.onConfirm}
          onCancel={closeConfirm}
        />
      )}
    </div>
  );
}
