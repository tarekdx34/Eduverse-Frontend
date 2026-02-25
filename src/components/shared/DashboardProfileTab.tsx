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
  achievements?: { title: string; description: string; emoji: string }[];
  badges?: { name: string; description: string; icon: string; color: string; unlocked: boolean }[];
}

interface DashboardProfileTabProps {
  isDark: boolean;
  accentColor?: string;
  bannerGradient?: string;
  profileData: ProfileData;
}

export function DashboardProfileTab({
  isDark,
  accentColor = '#7C3AED',
  bannerGradient = 'from-[#7C3AED] to-[#3B82F6]',
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
      {/* Banner + Avatar */}
      <div className="relative">
        <div
          className={`h-48 md:h-64 rounded-[2.5rem] bg-gradient-to-br ${bannerGradient} shadow-2xl overflow-hidden relative`}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        </div>

        <div className="px-8 -mt-20 relative z-10 flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Avatar */}
          <div className="relative">
            <div
              className={`w-40 h-40 rounded-full border-8 overflow-hidden shadow-2xl ${
                isDark ? 'border-[#0a0a0c]' : 'border-[#F3F4F6]'
              }`}
            >
              <div
                className={`w-full h-full bg-gradient-to-br ${bannerGradient} flex items-center justify-center`}
              >
                <span className="text-white text-5xl font-black">
                  {data.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </span>
              </div>
            </div>
            <button
              className="absolute bottom-2 right-2 w-10 h-10 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              style={{ backgroundColor: accentColor }}
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          {/* Name + Role */}
          <div className="pb-4 flex-1">
            <h2
              className={`text-4xl font-black tracking-tight drop-shadow-md md:drop-shadow-none ${
                isDark ? 'text-white' : 'text-white md:text-slate-800'
              }`}
            >
              {data.fullName}
            </h2>
            <p className="font-bold text-lg" style={{ color: accentColor }}>
              {data.role} • {data.department}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pb-4 flex gap-3">
            <button className={`px-6 py-3 backdrop-blur-md border font-bold rounded-2xl transition-all flex items-center gap-2 ${isDark ? 'bg-white/20 border-white/30 text-white hover:bg-white/30' : 'bg-white/80 border-slate-200 text-[#7C3AED] hover:bg-white'}`}>
              <Download className="w-4 h-4" />
              Download CV
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2"
                style={{ backgroundColor: accentColor, boxShadow: `0 4px 12px ${accentColor}50` }}
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-5 py-3 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className={`px-5 py-3 font-bold rounded-2xl transition-all flex items-center gap-2 ${
                    isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
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
                <span className={`text-xl font-normal ${labelClass}`}>/{data.maxCredits || '144'}</span>
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
                <span className={`text-xl font-normal ${labelClass}`}>/{data.rankTotal || '1,200'}</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-10">
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
                { icon: <Mail className="w-5 h-5" />, label: 'Email Address', value: data.email, field: 'email' },
                { icon: <Phone className="w-5 h-5" />, label: 'Phone Number', value: data.phone, field: 'phone' },
                { icon: <MapPin className="w-5 h-5" />, label: 'Address', value: data.address, field: 'address' },
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
            <div className={`${cardClass} p-8 rounded-[2.5rem]`}>
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
            <div className={`${cardClass} p-8 rounded-[2.5rem]`}>
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

        {/* Right Column - Badges & Achievements */}
        <div className="lg:col-span-7">
          <div className={`${cardClass} p-8 rounded-[2.5rem] h-full`}>
            <div className="flex justify-between items-center mb-10">
              <h3 className={`text-2xl font-bold flex items-center gap-3 ${valueClass}`}>
                <span className="material-symbols-rounded" style={{ color: accentColor }}>
                  military_tech
                </span>
                Badges & Achievements
              </h3>
              <button className="font-bold hover:underline text-sm" style={{ color: accentColor }}>
                View All
              </button>
            </div>

            {/* Badges Grid */}
            {data.badges && data.badges.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-12">
                {data.badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center p-6 rounded-3xl border group hover:scale-105 transition-all ${
                      !badge.unlocked ? 'opacity-40 grayscale' : ''
                    } ${
                      isDark
                        ? 'bg-slate-800/50 border-slate-700/50'
                        : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                      style={{
                        backgroundColor: badge.unlocked ? `${badge.color}20` : undefined,
                        color: badge.unlocked ? badge.color : undefined,
                      }}
                    >
                      <span className="material-symbols-rounded text-5xl">{badge.icon}</span>
                    </div>
                    <p className={`font-bold text-center ${valueClass}`}>{badge.name}</p>
                    <p className={`text-xs mt-1 ${labelClass}`}>{badge.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Achievements List */}
            {data.achievements && data.achievements.length > 0 && (
              <div className="space-y-4 mb-12">
                <h4 className={`text-lg font-bold ${valueClass}`}>Awards</h4>
                {data.achievements.map((achievement, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-4 border ${
                      isDark
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.emoji}</span>
                      <div>
                        <h4 className={`text-sm font-bold ${valueClass}`}>{achievement.title}</h4>
                        <p className={`text-xs ${labelClass}`}>{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Next Milestone CTA */}
            <div
              className="p-8 rounded-3xl text-white relative overflow-hidden group"
              style={{
                backgroundImage: `linear-gradient(135deg, ${accentColor}, #6366F1)`,
              }}
            >
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
              <div className="relative z-10">
                <h4 className="text-xl font-extrabold mb-2">Next Milestone</h4>
                <p className="text-white/80 mb-6 max-w-md">
                  Keep up the great work! Complete your current goals to unlock the next achievement level.
                </p>
                <div className="w-full bg-white/20 h-2.5 rounded-full mb-2 overflow-hidden">
                  <div className="bg-white h-full rounded-full" style={{ width: '75%' }} />
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span>75% Progress</span>
                  <span>18 / 24 Tasks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardProfileTab;
