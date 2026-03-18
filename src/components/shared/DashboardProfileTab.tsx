import { useMemo, useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Edit,
  Camera,
  Save,
  X,
  Download,
  UserCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileData {
  fullName: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  bio: string;
  gpa?: string;
  totalCredits?: string;
  maxCredits?: string;
  rank?: string;
  rankTotal?: string;
  enrollmentDate?: string;
  expectedGraduation?: string;
  studentId?: string;
  officeHours?: string;
  office?: string;
  specialization?: string[];
  skills?: string[];
  interests?: string[];
}

interface DashboardProfileTabProps {
  isDark: boolean;
  accentColor?: string;
  bannerGradient?: string;
  profileData: ProfileData;
}

export function DashboardProfileTab({
  isDark,
  accentColor = '#3b82f6',
  profileData,
}: DashboardProfileTabProps) {
  const { user } = useAuth();
  const mergedProfileData: ProfileData = {
    ...profileData,
    ...(user
      ? {
          fullName: user.fullName || `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.roles?.[0] || profileData.role,
          studentId: String(user.userId),
        }
      : {}),
  };

  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(mergedProfileData);

  const handleSave = () => setIsEditing(false);
  const handleCancel = () => {
    setData(mergedProfileData);
    setIsEditing(false);
  };

  const cardClass = isDark
    ? 'rounded-2xl border border-white/10 bg-white/5'
    : 'rounded-2xl border border-gray-200 bg-white';
  const mutedClass = isDark ? 'text-slate-400' : 'text-gray-600';
  const strongClass = isDark ? 'text-white' : 'text-gray-900';
  const inputClass = isDark
    ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-500'
    : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400';

  const initials = useMemo(
    () =>
      data.fullName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [data.fullName]
  );

  const stats = [
    data.gpa
      ? { label: 'GPA', value: `${data.gpa}/4.00`, helper: 'Academic average' }
      : null,
    data.totalCredits
      ? {
          label: 'Credits',
          value: `${data.totalCredits}/${data.maxCredits || '144'}`,
          helper: 'Completed credits',
        }
      : null,
    data.rank
      ? {
          label: 'Rank',
          value: `#${data.rank}${data.rankTotal ? ` / ${data.rankTotal}` : ''}`,
          helper: 'Department standing',
        }
      : null,
    data.office
      ? { label: 'Office', value: data.office, helper: data.officeHours || 'Office location' }
      : null,
  ].filter(Boolean) as { label: string; value: string; helper: string }[];

  const infoRows = [
    { key: 'email', label: 'Email', value: data.email, icon: Mail },
    { key: 'phone', label: 'Phone', value: data.phone, icon: Phone },
    { key: 'address', label: 'Address', value: data.address, icon: MapPin },
    {
      key: 'dateOfBirth',
      label: 'Date of Birth',
      value: data.dateOfBirth
        ? new Date(data.dateOfBirth).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'Not available',
      icon: Calendar,
    },
  ];

  const renderBadgeList = (title: string, items?: string[], tone: 'accent' | 'neutral' = 'neutral') => {
    if (!items || items.length === 0) return null;

    return (
      <div className={cardClass}>
        <div className="p-5">
          <h3 className={`text-base font-semibold ${strongClass}`}>{title}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  tone === 'accent'
                    ? isDark
                      ? 'bg-blue-500/15 text-blue-300'
                      : 'bg-blue-50 text-blue-700'
                    : isDark
                      ? 'bg-white/10 text-slate-300'
                      : 'bg-gray-100 text-gray-700'
                }`}
                style={tone === 'accent' ? { color: accentColor } : undefined}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold text-white"
                style={{ backgroundColor: accentColor }}
              >
                {initials || <UserCircle2 className="h-8 w-8" />}
              </div>
              <button
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm"
                style={{ backgroundColor: accentColor }}
                title="Profile photo upload is not connected yet"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <h2 className={`text-2xl font-semibold ${strongClass}`}>{data.fullName}</h2>
              <p className={`mt-1 text-sm font-medium ${mutedClass}`}>
                {data.role} • {data.department}
              </p>
              {data.studentId && <p className={`mt-2 text-sm ${mutedClass}`}>ID: {data.studentId}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium ${
                isDark
                  ? 'border-white/10 text-slate-300 hover:bg-white/5'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              title="Profile export is not connected yet"
            >
              <Download className="h-4 w-4" />
              Download CV
            </button>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: accentColor }}
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                    isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className={cardClass}>
              <div className="p-5">
                <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>
                  {stat.label}
                </p>
                <p className={`mt-3 text-2xl font-semibold ${strongClass}`}>{stat.value}</p>
                <p className={`mt-1 text-sm ${mutedClass}`}>{stat.helper}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className={cardClass}>
            <div className="p-5">
              <h3 className={`text-base font-semibold ${strongClass}`}>Contact Information</h3>
              <div className="mt-5 space-y-4">
                {infoRows.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          isDark ? 'bg-white/5 text-slate-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-medium uppercase tracking-wide ${mutedClass}`}>
                          {item.label}
                        </p>
                        {isEditing && item.key !== 'dateOfBirth' ? (
                          <input
                            type="text"
                            value={data[item.key as keyof ProfileData] as string}
                            onChange={(event) =>
                              setData({ ...data, [item.key]: event.target.value })
                            }
                            className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${inputClass}`}
                            style={{ ['--tw-ring-color' as string]: accentColor }}
                          />
                        ) : (
                          <p className={`mt-1 text-sm font-medium ${strongClass}`}>{item.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {data.office && (
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        isDark ? 'bg-white/5 text-slate-300' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium uppercase tracking-wide ${mutedClass}`}>Office</p>
                      <p className={`mt-1 text-sm font-medium ${strongClass}`}>{data.office}</p>
                      {data.officeHours && <p className={`mt-1 text-sm ${mutedClass}`}>{data.officeHours}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="p-5">
              <h3 className={`text-base font-semibold ${strongClass}`}>About</h3>
              {isEditing ? (
                <textarea
                  value={data.bio}
                  onChange={(event) => setData({ ...data, bio: event.target.value })}
                  rows={5}
                  className={`mt-4 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 ${inputClass}`}
                  style={{ ['--tw-ring-color' as string]: accentColor }}
                />
              ) : (
                <p className={`mt-4 text-sm leading-7 ${mutedClass}`}>{data.bio}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {renderBadgeList(data.specialization ? 'Specialization' : 'Academic Interests', data.specialization || data.interests, 'accent')}
          {renderBadgeList('Skills', data.skills)}
        </div>
      </div>
    </div>
  );
}

export default DashboardProfileTab;
