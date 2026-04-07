import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Camera, CheckCircle2, CircleHelp, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../services/api/client';
import { AI_ATTENDANCE_BASE_URL } from '../../services/api/config';
import { toast } from 'sonner';
import { CustomDropdown } from '../../components/shared/CustomDropdown';
import { ConfirmDialog } from '../instructor-dashboard/components/ConfirmDialog';

const STATUSES = ['present', 'absent', 'late', 'excused'] as const;
type AttendanceStatus = (typeof STATUSES)[number];

const SESSION_TYPE_OPTIONS = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'lab', label: 'Lab' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'exam', label: 'Exam' },
];

/** Attendance page uses a dark shell; match dropdown styling without dashboard theme context. */
const DROPDOWN_IS_DARK = true;
const DROPDOWN_ACCENT = '#3b82f6';

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
      'border border-violet-500/70 bg-violet-950/80 text-violet-100 shadow-md shadow-violet-900/40 ring-1 ring-violet-400/30',
    idle: 'border border-transparent text-violet-500/70 hover:border-violet-500/30 hover:bg-violet-950/40 hover:text-violet-300',
  },
};

function StatusFourToggle({
  value,
  onChange,
  disabled,
}: {
  value: AttendanceStatus;
  onChange: (v: AttendanceStatus) => void;
  disabled?: boolean;
}) {
  const ease = 'cubic-bezier(0.4, 0, 0.2, 1)';
  /** Fixed total width + equal columns so nothing grows wider than the cell during transitions. */
  return (
    <div
      role="group"
      aria-label="Attendance status"
      className="grid w-[15.75rem] shrink-0 grid-cols-4 gap-0.5 rounded-xl border border-slate-600/80 bg-slate-950/90 p-1 shadow-inner sm:w-[16.75rem]"
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

export default function AttendancePage() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

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

  useEffect(() => {
    setAiFile(null);
    setAiError(null);
    setAiResult(null);
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

  const applyAiMarkedIdsToRoster = () => {
    if (rosterReadOnly) {
      toast.error('Session is closed — open an active session to apply.');
      return;
    }
    const ids = aiResult?.marked_ids ?? [];
    if (ids.length === 0) {
      toast.error('No marked_ids to apply. Check your dataset folder and photo.');
      return;
    }
    const idSet = new Set(ids.map((s) => String(s).trim()).filter(Boolean));
    let changed = 0;
    const next = rosterRows.map((r) => {
      if (idSet.has(String(r.userId))) {
        if (r.status !== 'present') changed += 1;
        return { ...r, status: 'present' as const };
      }
      return r;
    });
    setRosterRows(next);
    if (changed > 0) setRosterDirty(true);
    toast.success(
      changed > 0
        ? `Marked ${changed} student(s) present (IDs matched roster). Save when ready.`
        : 'No roster userIds matched marked_ids — name dataset files as {userId}.jpg',
    );
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

  const handleLogout = async () => {
    await logout();
    setSelectedClass(null);
    setActiveSession(null);
    setRosterRows([]);
    setRosterDirty(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);
    try {
      await login(authEmail.trim(), authPassword, false);
      toast.success('Signed in.');
      setAuthPassword('');
    } catch (err) {
      toast.error(errMessage(err));
    } finally {
      setAuthSubmitting(false);
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

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-950 text-slate-300">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
        <div className="mx-auto max-w-md">
          <h1 className="text-xl font-semibold tracking-tight">Lecture attendance</h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in as an instructor or TA to manage attendance. Uses the same account as the main
            app.
          </p>
          <form
            onSubmit={handleLogin}
            className="mt-6 space-y-4 rounded-xl border border-slate-800 bg-slate-900/80 p-5"
          >
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Password
              </label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {authSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-3xl">
        {view === 'classes' && (
          <>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Your sections</h1>
                <p className="text-sm text-slate-400">Choose a class to take attendance.</p>
                {user && (
                  <p className="mt-1 text-xs text-slate-500">
                    {user.firstName} {user.lastName} · {user.email}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900"
              >
                Sign out
              </button>
            </div>
            {loadingTeaching ? (
              <p className="text-sm text-slate-500">Loading your sections…</p>
            ) : teaching.length === 0 ? (
              <p className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
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
                      className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-left transition hover:border-blue-600/60 hover:shadow-md"
                    >
                      <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500">
                        {course.code}
                      </div>
                      <div className="mt-0.5 font-semibold text-slate-100">{course.name ?? 'Course'}</div>
                      <div className="mt-1 text-xs text-slate-500">
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
                <h2 className="text-lg font-semibold">{sectionTitle}</h2>
                <p className="text-sm text-slate-400">
                  Section {selectedClass.row.section?.sectionNumber ?? selectedClass.sectionId} ·
                  Take or resume attendance
                </p>
              </div>
              <button
                type="button"
                onClick={backToClasses}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900"
              >
                ← All sections
              </button>
            </div>

            <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <h3 className="text-sm font-semibold text-slate-200">Open sessions</h3>
              <p className="mt-1 text-xs text-slate-500">
                Sessions that are not closed yet. Resume to keep editing.
              </p>
              {loadingSessions ? (
                <p className="mt-3 text-sm text-slate-500">Loading…</p>
              ) : openSessions.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No open sessions. Start a new lecture below.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {openSessions.map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2"
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
                        <span className="font-medium text-slate-200">{s.sessionDate}</span>
                        <span className="text-slate-500">
                          {' '}
                          · {s.sessionType} · id {s.id}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openRosterFromSession(s)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                      >
                        Open roster
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <h3 className="text-sm font-semibold text-slate-200">Start new lecture attendance</h3>
              <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </label>
              <input
                type="date"
                value={newSessionDate}
                onChange={(e) => setNewSessionDate(e.target.value)}
                className="mt-1 w-full max-w-xs rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
              <div className="mt-3 max-w-xs">
                <CustomDropdown
                  label="Type"
                  options={SESSION_TYPE_OPTIONS}
                  value={newSessionType}
                  onChange={setNewSessionType}
                  isDark={DROPDOWN_IS_DARK}
                  accentColor={DROPDOWN_ACCENT}
                />
              </div>
              <button
                type="button"
                onClick={() => void createSession()}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
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
                <h2 className="text-lg font-semibold">{rosterTitle}</h2>
                <p className="text-sm text-slate-400">{rosterSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={backToSection}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900"
              >
                ← Back
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={rosterReadOnly}
                  onClick={() => setAllStatus('present')}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-40"
                >
                  Everyone present
                </button>
                <button
                  type="button"
                  disabled={rosterReadOnly}
                  onClick={() => setAllStatus('absent')}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-40"
                >
                  Everyone absent
                </button>
                <button
                  type="button"
                  disabled={rosterReadOnly}
                  onClick={() => void saveBatch()}
                  className="ml-auto rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-40"
                >
                  Save attendance
                </button>
                <button
                  type="button"
                  disabled={rosterReadOnly}
                  onClick={() => void closeSession()}
                  className="rounded-lg border border-red-900 bg-red-950/50 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-950 disabled:opacity-40"
                >
                  Close &amp; lock session
                </button>
              </div>

              <div className="mb-4 rounded-xl border border-violet-800/60 bg-violet-950/25 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Camera className="size-4 text-violet-300" aria-hidden />
                  <h3 className="text-sm font-semibold text-violet-100">AI attendance (local test)</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-violet-200/80">
                  Runs against the Python service on port <strong className="text-violet-100">8000</strong>{' '}
                  (<code className="rounded bg-slate-950/80 px-1 text-[0.65rem]">npm run attendance</code> in
                  EduVerse-Backend). Put reference face images in{' '}
                  <code className="rounded bg-slate-950/80 px-1 text-[0.65rem]">ai-services/attendance/dataset</code>{' '}
                  named <code className="text-[0.65rem]">{'{userId}'}.jpg</code> so IDs match this roster.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={aiLoading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setAiFile(f ?? null);
                      setAiError(null);
                      setAiResult(null);
                    }}
                    className="max-w-full text-xs text-slate-300 file:mr-2 file:rounded-lg file:border-0 file:bg-violet-700 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-violet-600"
                  />
                  <button
                    type="button"
                    disabled={aiLoading || !aiFile}
                    onClick={() => void runLocalAiAttendance()}
                    className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-40"
                  >
                    {aiLoading ? 'Running…' : 'Run AI'}
                  </button>
                  <button
                    type="button"
                    disabled={rosterReadOnly || !aiResult?.marked_ids?.length}
                    onClick={applyAiMarkedIdsToRoster}
                    className="rounded-lg border border-violet-500/60 px-3 py-1.5 text-xs font-semibold text-violet-100 hover:bg-violet-950/60 disabled:opacity-40"
                  >
                    Apply marked IDs as present
                  </button>
                </div>
                {aiError && (
                  <p className="mt-2 text-xs text-red-300" role="alert">
                    {aiError}
                  </p>
                )}
                {aiResult && (
                  <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-xs text-slate-300">
                    <div className="font-semibold text-slate-200">marked_ids</div>
                    <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap break-all text-[0.7rem] text-slate-400">
                      {JSON.stringify(aiResult.marked_ids ?? [], null, 0)}
                    </pre>
                    <div className="mt-2 font-semibold text-slate-200">
                      Faces detected ({aiResult.recognized_faces?.length ?? 0})
                    </div>
                    <ul className="mt-1 max-h-28 space-y-0.5 overflow-auto text-[0.7rem] text-slate-400">
                      {(aiResult.recognized_faces ?? []).slice(0, 12).map((f, i) => (
                        <li key={i}>
                          {f.name ?? '?'} · {typeof f.confidence === 'number' ? f.confidence.toFixed(1) : '—'}%
                        </li>
                      ))}
                      {(aiResult.recognized_faces?.length ?? 0) > 12 ? (
                        <li className="text-slate-500">…</li>
                      ) : null}
                    </ul>
                  </div>
                )}
              </div>

              {rosterReadOnly ? (
                <p className="mb-3 text-sm text-amber-200/90">
                  This session is closed. View only. Open another session from the section screen.
                </p>
              ) : (
                <p className="mb-3 text-xs text-slate-500">
                  Tap an icon to change status — the active choice shows the full label.{' '}
                  <strong className="text-slate-400">Everyone present</strong> and{' '}
                  <strong className="text-slate-400">Everyone absent</strong> ask for confirmation.
                </p>
              )}

              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Student</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="min-w-[16.5rem] px-3 py-2 sm:min-w-[17.5rem]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rosterRows.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                          No enrolled students (no attendance rows).
                        </td>
                      </tr>
                    ) : (
                      rosterRows.map((row) => (
                        <tr key={row.userId} className="border-b border-slate-800/80">
                          <td className="px-3 py-2 text-slate-200">{row.name}</td>
                          <td className="px-3 py-2 text-xs text-slate-500">{row.email}</td>
                          <td className="px-3 py-2 align-middle">
                            <StatusFourToggle
                              value={row.status}
                              disabled={rosterReadOnly}
                              onChange={(v) => applyStatus(row.userId, v)}
                            />
                          </td>
                        </tr>
                      ))
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
