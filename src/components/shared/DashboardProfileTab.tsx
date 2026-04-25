import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  Edit,
  Camera,
  Save,
  X,
  Download,
  UserCircle2,
  Info,
  Sparkles,
  Code2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserService, type UserProfile } from '../../services/api/userService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

// ──────────────────────────────────────────────────────────────
// TagInput: used for interests and skills editing
// ──────────────────────────────────────────────────────────────
function TagInput({
  tags,
  onChange,
  placeholder,
  accentColor,
  isDark,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  accentColor: string;
  isDark: boolean;
}) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div
      className={`flex flex-wrap gap-2 p-3 border rounded-xl min-h-[48px] cursor-text transition-all ${
        isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
      } focus-within:ring-2`}
      style={{ '--tw-ring-color': `${accentColor}40` } as any}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-all hover:scale-105`}
          style={{
            backgroundColor: `${accentColor}10`,
            color: accentColor,
            borderColor: `${accentColor}30`,
          }}
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(idx);
            }}
            className="hover:text-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (inputValue.trim()) addTag(inputValue);
        }}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[140px] outline-none text-sm bg-transparent"
        style={{ color: isDark ? 'white' : '#1e293b' }}
      />
    </div>
  );
}

export function DashboardProfileTab({
  isDark,
  accentColor = '#3b82f6',
  bannerGradient: _bannerGradient = 'from-[#3b82f6] to-[#06b6d4]',
  profileData,
}: DashboardProfileTabProps) {
  const { user } = useAuth();
  const mergedProfileData: ProfileData = useMemo(() => {
    const nameFromAuth = user
      ? (user.fullName || `${user.firstName || ''} ${user.lastName || ''}`).trim()
      : '';
    return {
      ...profileData,
      fullName: nameFromAuth || profileData.fullName || 'Instructor',
      email: user?.email || profileData.email || '',
      role: user?.roles?.[0] || profileData.role || 'Instructor',
      studentId: user?.userId != null ? String(user.userId) : profileData.studentId,
    };
  }, [profileData, user]);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(mergedProfileData);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with backend on mount
  useEffect(() => {
    let mounted = true;
    UserService.getProfile()
      .then((profile) => {
        if (mounted) {
          setData((prev) => ({
            ...prev,
            fullName:
              profile.fullName ||
              [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() ||
              prev.fullName ||
              'Instructor',
            email: profile.email,
            bio: profile.bio || prev.bio,
            interests: profile.academicInterests || prev.interests,
            skills: profile.skills || prev.skills,
          }));
        }
      })
      .catch((err) => console.error('Failed to fetch profile:', err));

    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Split name back if changed
      const [firstName, ...rest] = data.fullName.split(' ');
      const lastName = rest.join(' ');

      await UserService.updateProfile({
        firstName,
        lastName,
        bio: data.bio,
        academicInterests: Array.isArray(data.interests) ? data.interests : [],
        skills: Array.isArray(data.skills) ? data.skills : [],
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setData(mergedProfileData);
    setIsEditing(false);
  };

  const cardClass = isDark
    ? 'rounded-xl border border-white/10 bg-white/5'
    : 'rounded-xl border border-gray-200 bg-white shadow-sm';

  const labelClass = isDark ? 'text-slate-500' : 'text-slate-400';
  const valueClass = isDark ? 'text-slate-100' : 'text-slate-900';
  const inputClass = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-2'
    : 'bg-white border-slate-200 text-slate-800 focus:ring-2';

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className={`${cardClass} p-6`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
              style={{ backgroundColor: accentColor }}
            >
              {data.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <button
              className="absolute bottom-0 right-0 w-8 h-8 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              style={{ backgroundColor: accentColor }}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Name + Role */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className={`text-2xl font-bold ${valueClass}`}>{data.fullName}</h2>
            <p className="text-sm font-medium mt-1" style={{ color: accentColor }}>
              {data.role} • {data.department}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              className={`px-4 py-2 border font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10 hover:text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <Download className="w-4 h-4" />
              Download CV
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
                style={{ backgroundColor: accentColor }}
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className={`px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50 ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className={`${cardClass} p-6`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${valueClass}`}>
              <UserCircle2 className="w-5 h-5" style={{ color: accentColor }} />
              Personal Information
            </h3>
            <div className="space-y-6">
              {[
                {
                  icon: <Mail className="w-5 h-5" />,
                  label: 'Email Address',
                  value: data.email,
                  field: 'email',
                },
                {
                  icon: <Phone className="w-5 h-5" />,
                  label: 'Phone Number',
                  value: data.phone,
                  field: 'phone',
                },
                {
                  icon: <MapPin className="w-5 h-5" />,
                  label: 'Address',
                  value: data.address,
                  field: 'address',
                },
                {
                  icon: <Calendar className="w-5 h-5" />,
                  label: 'Birthday',
                  value: data.dateOfBirth
                    ? new Date(data.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-',
                  field: 'dateOfBirth',
                },
              ].map((item) => (
                <div key={item.field} className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isDark ? 'bg-slate-800' : 'bg-slate-100'
                    }`}
                  >
                    <span className="text-slate-500">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold uppercase tracking-widest ${labelClass}`}>
                      {item.label}
                    </p>
                    {isEditing && item.field !== 'dateOfBirth' ? (
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => setData({ ...data, [item.field]: e.target.value })}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none ${inputClass}`}
                        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                      />
                    ) : (
                      <p className={`font-semibold ${valueClass}`}>{item.value}</p>
                    )}
                  </div>
                </div>
              ))}

              {data.office && (
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isDark ? 'bg-slate-800' : 'bg-slate-100'
                    }`}
                  >
                    <span className="text-slate-500">
                      <BookOpen className="w-5 h-5" />
                    </span>
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${labelClass}`}>
                      Office
                    </p>
                    <p className={`font-semibold ${valueClass}`}>{data.office}</p>
                    {data.officeHours && (
                      <p className={`text-sm ${labelClass}`}>Office Hours: {data.officeHours}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* About */}
          <div className={`${cardClass} p-6`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${valueClass}`}>
              <Info className="w-5 h-5" style={{ color: accentColor }} />
              About
            </h3>
            {isEditing ? (
              <textarea
                value={data.bio}
                onChange={(e) => setData({ ...data, bio: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none resize-none ${inputClass}`}
                rows={4}
                style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              />
            ) : (
              <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {data.bio}
              </p>
            )}
          </div>

          {/* Interests / Specialization */}
          {(data.interests || data.specialization) && (
            <div className={`${cardClass} p-6`}>
              <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${valueClass}`}>
                <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
                {data.specialization ? 'Specialization' : 'Academic Interests'}
              </h3>
              {isEditing ? (
                <TagInput
                  tags={data.interests || []}
                  onChange={(tags) => setData({ ...data, interests: tags })}
                  placeholder="Type an interest and press Enter..."
                  accentColor={accentColor}
                  isDark={isDark}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(data.specialization || data.interests || []).map((item, idx) => {
                    const colors = [
                      { bg: `${accentColor}15`, text: accentColor, border: `${accentColor}30` },
                      { bg: '#3B82F615', text: '#3B82F6', border: '#3B82F630' },
                      { bg: '#10B98115', text: '#10B981', border: '#10B98130' },
                      { bg: '#EC489915', text: '#EC4899', border: '#EC489930' },
                      { bg: '#F59E0B15', text: '#F59E0B', border: '#F59E0B30' },
                      { bg: '#6366F115', text: '#6366F1', border: '#6366F130' },
                    ];
                    const c = colors[idx % colors.length];
                    return (
                      <span
                        key={idx}
                        className="px-4 py-2 rounded-xl font-bold text-sm border"
                        style={{
                          backgroundColor: c.bg,
                          color: c.text,
                          borderColor: c.border,
                        }}
                      >
                        {item}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          <div className={`${cardClass} p-6`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${valueClass}`}>
              <Code2 className="w-5 h-5" style={{ color: accentColor }} />
              Skills
            </h3>
            {isEditing ? (
              <TagInput
                tags={data.skills || []}
                onChange={(tags) => setData({ ...data, skills: tags })}
                placeholder="Type a skill and press Enter..."
                accentColor={accentColor}
                isDark={isDark}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {(data.skills || []).map((skill, idx) => (
                  <span
                    key={idx}
                    className={`px-4 py-2 rounded-xl font-bold text-sm border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-slate-300'
                        : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
                {(!data.skills || data.skills.length === 0) && (
                  <p className={`text-sm ${labelClass}`}>No skills listed yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardProfileTab;
