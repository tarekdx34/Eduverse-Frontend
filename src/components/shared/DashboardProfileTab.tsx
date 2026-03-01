import { useState } from 'react';
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
  TrendingUp,
  Download,
} from 'lucide-react';

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
  bannerGradient = 'from-[#3b82f6] to-[#06b6d4]',
  profileData,
}: DashboardProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(profileData);

  const handleSave = () => setIsEditing(false);
  const handleCancel = () => {
    setData(profileData);
    setIsEditing(false);
  };

  const cardClass = isDark
    ? 'bg-white/5 backdrop-blur-xl border border-white/5 shadow-none'
    : 'glass shadow-xl shadow-slate-200/50';

  const labelClass = isDark ? 'text-slate-500' : 'text-slate-400';
  const valueClass = isDark ? 'text-white' : 'text-slate-800';
  const inputClass = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-2'
    : 'bg-white border-slate-200 text-slate-800 focus:ring-2';

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className={`${cardClass} p-6 rounded-2xl`}>
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
                  className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className={`px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.gpa && (
          <div
            className={`${cardClass} p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
          >
            <div
              className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl"
              style={{ backgroundColor: `${accentColor}15` }}
            />
            <p className={`${labelClass} font-bold text-sm uppercase tracking-wider mb-4`}>
              Overall GPA
            </p>
            <div className="flex items-end gap-2 mb-4">
              <h2 className="text-5xl font-black" style={{ color: accentColor }}>
                {data.gpa}
                <span className={`text-xl font-normal ${labelClass}`}>/4.00</span>
              </h2>
            </div>
            <div
              className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r"
                style={{
                  width: `${(parseFloat(data.gpa) / 4.0) * 100}%`,
                  backgroundImage: `linear-gradient(to right, ${accentColor}80, ${accentColor})`,
                }}
              />
            </div>
          </div>
        )}

        {data.totalCredits && (
          <div
            className={`${cardClass} p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
            <p className={`${labelClass} font-bold text-sm uppercase tracking-wider mb-4`}>
              Total Credits
            </p>
            <div className="flex items-end gap-2 mb-4">
              <h2 className="text-5xl font-black text-blue-600">
                {data.totalCredits}
                <span className={`text-xl font-normal ${labelClass}`}>
                  /{data.maxCredits || '144'}
                </span>
              </h2>
            </div>
            <div className="flex gap-1.5 h-3">
              <div
                className="bg-blue-500 rounded-full"
                style={{
                  flex: parseInt(data.totalCredits),
                }}
              />
              <div
                className={`rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                style={{
                  flex: parseInt(data.maxCredits || '144') - parseInt(data.totalCredits),
                }}
              />
            </div>
          </div>
        )}

        {data.rank && (
          <div
            className={`${cardClass} p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl" />
            <p className={`${labelClass} font-bold text-sm uppercase tracking-wider mb-4`}>
              Global Rank
            </p>
            <div className="flex items-end gap-2 mb-4">
              <h2 className="text-5xl font-black text-pink-500">
                #{data.rank}
                <span className={`text-xl font-normal ${labelClass}`}>
                  /{data.rankTotal || '1,200'}
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500">Top 4% in Department</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-10">
        {/* Main Content */}
        <div className="space-y-10">
          {/* Personal Information */}
          <div className={`${cardClass} p-8 rounded-[2.5rem]`}>
            <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${valueClass}`}>
              <span className="material-symbols-rounded" style={{ color: accentColor }}>
                contact_page
              </span>
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
          <div className={`${cardClass} p-8 rounded-[2.5rem]`}>
            <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${valueClass}`}>
              <span className="material-symbols-rounded" style={{ color: accentColor }}>
                info
              </span>
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
            <div className={`${cardClass} p-8 rounded-2xl`}>
              <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${valueClass}`}>
                <span className="material-symbols-rounded" style={{ color: accentColor }}>
                  psychology
                </span>
                {data.specialization ? 'Specialization' : 'Academic Interests'}
              </h3>
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
            </div>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className={`${cardClass} p-8 rounded-2xl`}>
              <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${valueClass}`}>
                <span className="material-symbols-rounded" style={{ color: accentColor }}>
                  code
                </span>
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className={`px-4 py-2 rounded-xl font-medium text-sm border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-slate-300'
                        : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default DashboardProfileTab;
