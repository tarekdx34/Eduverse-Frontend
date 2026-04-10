import { ArrowLeft, Calendar, Link as LinkIcon, Mail, MapPin, UserCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ScheduleService,
  type OfficeHoursSlot,
  type CreateOfficeHoursAppointmentPayload,
} from '../../../services/api/scheduleService';
import { UserService, type PublicUserProfile } from '../../../services/api/userService';
import { type SectionStaffMember } from '../../../services/api/enrollmentService';
import { useTheme } from '../contexts/ThemeContext';

interface LocationState {
  staff?: SectionStaffMember;
  course?: {
    id?: string;
    name?: string;
    code?: string;
  };
}

const DAY_TO_INDEX: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const toLocalDateInput = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getNextDateForDay = (dayOfWeek: string) => {
  const target = DAY_TO_INDEX[(dayOfWeek || '').toUpperCase()];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (target === undefined) {
    return toLocalDateInput(today);
  }

  const delta = (target - today.getDay() + 7) % 7;
  const result = new Date(today);
  result.setDate(today.getDate() + delta);
  return toLocalDateInput(result);
};

const getTimeLabel = (time: string) => {
  if (!time) return 'N/A';
  const parts = time.split(':');
  if (parts.length < 2) return time;
  const now = new Date();
  now.setHours(Number(parts[0]) || 0, Number(parts[1]) || 0, 0, 0);
  return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export default function PublicProfileView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { isDark } = useTheme() as any;

  const state = (location.state as LocationState) || {};
  const staffFromState = state.staff;

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [slots, setSlots] = useState<OfficeHoursSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [bookedKeys, setBookedKeys] = useState<Set<string>>(new Set());
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [booking, setBooking] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [topic, setTopic] = useState('Course guidance');
  const [notes, setNotes] = useState('');

  const staffId = Number(id || staffFromState?.id || 0);
  const fallbackFullName = useMemo(() => {
    return staffFromState?.fullName || `User #${staffId || 0}`;
  }, [staffFromState?.fullName, staffId]);

  const isInstructor = useMemo(() => {
    const roles = profile?.roles || [];
    if (roles.some((role) => role?.toUpperCase() === 'INSTRUCTOR')) return true;
    return staffFromState?.role === 'INSTRUCTOR';
  }, [profile?.roles, staffFromState?.role]);

  const socialLinks = useMemo(() => {
    const raw = profile?.socialLinks || {};
    return Object.entries(raw)
      .filter(([, value]) => typeof value === 'string' && value.trim() !== '')
      .map(([key, value]) => ({ key, value: String(value) }));
  }, [profile?.socialLinks]);

  const contactEmail = profile?.email || staffFromState?.email || '';
  const displayName =
    profile?.fullName ||
    `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() ||
    fallbackFullName;

  const loadAvailableOfficeHours = async (instructorId: number) => {
    try {
      setLoadingSlots(true);
      setSlotsError(null);
      const response = await ScheduleService.getAvailableOfficeHours({
        instructorId,
      });
      setSlots((response?.data || []).filter((slot) => slot.status !== 'inactive'));
    } catch (error) {
      setSlots([]);
      const message = error instanceof Error ? error.message : 'Failed to load office hours';
      setSlotsError(message);
      if (message.toLowerCase().includes('unauthorized')) {
        toast.error('Session expired. Please sign in again.');
      }
    } finally {
      setLoadingSlots(false);
    }
  };

  const resolvedStaff = useMemo(() => {
    return {
      id: staffId,
      role: staffFromState?.role || 'TA',
    };
  }, [staffFromState?.role, staffId]);

  const toBookingKey = (slotId: number, date: string) => `${slotId}__${date}`;

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!Number.isFinite(staffId) || staffId <= 0) {
        if (mounted) {
          setProfileError('Invalid profile id.');
          setProfileLoading(false);
        }
        return;
      }

      try {
        setProfileLoading(true);
        setProfileError(null);
        const response = await UserService.getPublicProfile(staffId);
        if (!mounted) return;
        setProfile(response);
      } catch (error) {
        if (!mounted) return;
        setProfile(null);
        const message = error instanceof Error ? error.message : 'Failed to load profile';
        setProfileError(message);
        if (message.toLowerCase().includes('unauthorized')) {
          toast.error('Session expired. Please sign in again.');
        } else if (message.toLowerCase().includes('forbidden')) {
          toast.error('You do not have access to this profile.');
        }
      } finally {
        if (mounted) setProfileLoading(false);
      }
    };

    void loadProfile();
    return () => {
      mounted = false;
    };
  }, [staffId]);

  useEffect(() => {
    let mounted = true;

    const loadMyAppointments = async () => {
      try {
        const appointments = await ScheduleService.getMyOfficeHoursAppointments();
        if (!mounted) return;
        const keys = new Set<string>();

        (appointments || []).forEach((appointment) => {
          if (appointment.status === 'cancelled') return;
          if (!appointment.slotId || !appointment.appointmentDate) return;
          keys.add(toBookingKey(appointment.slotId, appointment.appointmentDate));
        });

        setBookedKeys(keys);
      } catch {
        if (!mounted) return;
        setBookedKeys(new Set());
      }
    };

    void loadMyAppointments();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isInstructor || !resolvedStaff.id) {
      setSlots([]);
      setSlotsError(null);
      return;
    }
    void loadAvailableOfficeHours(resolvedStaff.id);
  }, [isInstructor, resolvedStaff.id]);

  const selectedSlot = slots.find((slot) => slot.slotId === selectedSlotId) || null;

  useEffect(() => {
    if (!selectedSlot) return;
    setAppointmentDate(getNextDateForDay(selectedSlot.dayOfWeek));
  }, [selectedSlot]);

  const reserveAppointment = async () => {
    if (!selectedSlot) {
      toast.error('Please choose an office hours slot first.');
      return;
    }

    if (!appointmentDate) {
      toast.error('Please choose appointment date.');
      return;
    }

    if (!topic.trim()) {
      toast.error('Please enter a topic.');
      return;
    }

    const payload: CreateOfficeHoursAppointmentPayload = {
      slotId: selectedSlot.slotId,
      appointmentDate,
      topic: topic.trim(),
      notes: notes.trim() || undefined,
    };

    const bookingKey = toBookingKey(payload.slotId, payload.appointmentDate);
    if (bookedKeys.has(bookingKey)) {
      toast.info('You already booked this slot on this date.');
      return;
    }

    try {
      setBooking(true);
      await ScheduleService.createOfficeHoursAppointment(payload);
      toast.success('Appointment reserved successfully.');
      setSelectedSlotId(null);
      setNotes('');
      setTopic('Course guidance');
      setBookedKeys((prev) => {
        const next = new Set(prev);
        next.add(bookingKey);
        return next;
      });
      if (isInstructor && resolvedStaff.id) {
        await loadAvailableOfficeHours(resolvedStaff.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reserve appointment';
      toast.error(message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <button
        onClick={() => navigate(-1)}
        className={`mb-5 inline-flex items-center gap-2 text-sm ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div
        className={`rounded-xl border p-6 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'}`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {displayName}
            </h1>
            <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {profile?.roles?.length ? profile.roles.join(', ') : resolvedStaff.role}
            </p>
            {state.course?.name && (
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {state.course.code ? `${state.course.code} • ` : ''}
                {state.course.name}
              </p>
            )}
          </div>
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${isDark ? 'border-white/10 text-slate-300' : 'border-gray-200 text-gray-700'}`}
          >
            <div className="flex items-center gap-2">
              <UserCircle2 size={16} />
              Academic Profile
            </div>
          </div>
        </div>

        {profileLoading && (
          <p className={`mt-4 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Loading profile...
          </p>
        )}
        {profileError && (
          <p className={`mt-4 text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
            {profileError}
          </p>
        )}

        {profile?.bio && (
          <div
            className={`mt-6 rounded-lg border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}
          >
            <p
              className={`text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Bio
            </p>
            <p className={`${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{profile.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div
            className={`rounded-lg border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}
          >
            <p
              className={`text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Contact
            </p>
            <p
              className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-200' : 'text-gray-800'}`}
            >
              <Mail size={15} />
              {contactEmail || 'No academic mail provided'}
            </p>
          </div>
          <div
            className={`rounded-lg border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}
          >
            <p
              className={`text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Social Links
            </p>
            {socialLinks.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                No social links provided.
              </p>
            ) : (
              <div className="space-y-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.key}
                    href={social.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 text-sm underline ${isDark ? 'text-slate-200 hover:text-white' : 'text-gray-800 hover:text-black'}`}
                  >
                    <LinkIcon size={14} />
                    {social.key}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`rounded-xl border p-6 mt-6 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'}`}
      >
        <h2 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Office Hours
        </h2>
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {isInstructor
            ? 'Pick a slot and reserve an appointment.'
            : 'Office hours can only be booked with instructors.'}
        </p>

        {!isInstructor ? (
          <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            This user is not an instructor.
          </p>
        ) : loadingSlots ? (
          <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Loading office hours...
          </p>
        ) : slotsError ? (
          <p className={`${isDark ? 'text-amber-300' : 'text-amber-700'}`}>{slotsError}</p>
        ) : slots.length === 0 ? (
          <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            No office hours currently available.
          </p>
        ) : (
          <div className="space-y-3">
            {slots.map((slot) => {
              const isSelected = selectedSlotId === slot.slotId;
              return (
                <button
                  key={slot.slotId}
                  type="button"
                  onClick={() => setSelectedSlotId(slot.slotId)}
                  className={`w-full text-left rounded-lg border p-4 transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : isDark
                        ? 'border-white/10 bg-white/5 hover:bg-white/10'
                        : 'border-gray-200 bg-gray-50 hover:bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p
                      className={`font-medium ${isDark && !isSelected ? 'text-white' : 'text-gray-900'}`}
                    >
                      {slot.dayOfWeek} • {getTimeLabel(slot.startTime)} -{' '}
                      {getTimeLabel(slot.endTime)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${isDark && !isSelected ? 'bg-white/10 text-slate-200' : 'bg-white text-gray-700 border border-gray-200'}`}
                    >
                      {slot.currentAppointments ?? 0}/{slot.maxAppointments} booked
                    </span>
                  </div>
                  <p
                    className={`text-sm mt-2 ${isDark && !isSelected ? 'text-slate-300' : 'text-gray-700'}`}
                  >
                    {slot.mode.replace('_', ' ')} • {slot.location || 'No location'}
                  </p>
                  {slot.meetingUrl && (
                    <p
                      className={`text-xs mt-1 ${isDark && !isSelected ? 'text-slate-400' : 'text-gray-500'}`}
                    >
                      Meeting link available
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selectedSlot && (
          <div
            className={`mt-6 rounded-lg border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}
          >
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Reserve Appointment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm">
                <span className={`block mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Date
                </span>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </label>
              <label className="text-sm">
                <span className={`block mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Topic
                </span>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="What do you need help with?"
                />
              </label>
            </div>
            <label className="text-sm block mt-4">
              <span className={`block mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Notes (optional)
              </span>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="Add details for the instructor or TA"
              />
            </label>

            <button
              type="button"
              disabled={booking}
              onClick={reserveAppointment}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Calendar size={16} />
              {booking ? 'Reserving...' : 'Reserve Appointment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
