import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  Edit2,
  Save,
  X,
  Camera,
  Lock,
  Bell,
  Globe,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type InstructorProfile = {
  name: string;
  email: string;
  phone: string;
  department: string;
  office: string;
  officeHours: string;
  bio: string;
  specialization: string[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  joinDate: string;
};

type ProfilePageProps = {
  instructor: InstructorProfile;
};

export function ProfilePage({ instructor }: ProfilePageProps) {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<InstructorProfile>(instructor);
  const [editedProfile, setEditedProfile] = useState<InstructorProfile>(instructor);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const cardClass = `rounded-xl border p-6 shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`;
  const headingClass = `text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`;
  const subHeadingClass = `text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`;
  const labelClass = `flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`;
  const valueClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const secondaryClass = isDark ? 'text-gray-300' : 'text-gray-600';
  const inputClass = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' : 'border-gray-300'}`;
  const borderClass = isDark ? 'border-white/10' : 'border-gray-200';
  const borderSubtleClass = isDark ? 'border-white/5' : 'border-gray-100';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className={headingClass}>Profile</h2>
          <p className={`text-sm ${mutedClass} mt-1`}>
            Manage your account information and preferences
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${isDark ? 'border-white/20 text-gray-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 flex justify-center lg:justify-start">
          <div className={`${cardClass} w-full max-w-sm lg:max-w-none`}>
            {/* Avatar */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors">
                  <Camera size={18} />
                </button>
              )}
            </div>

            <div className="text-center mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile.name}</h3>
              <p className={`text-sm ${mutedClass}`}>{profile.department}</p>
              <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Active
              </div>
            </div>

            {/* Quick Stats */}
            <div className={`space-y-3 pt-6 border-t ${borderClass}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${secondaryClass}`}>Member Since</span>
                <span className={`text-sm font-semibold ${valueClass}`}>{profile.joinDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${secondaryClass}`}>Sections Teaching</span>
                <span className={`text-sm font-semibold ${valueClass}`}>3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${secondaryClass}`}>Total Students</span>
                <span className={`text-sm font-semibold ${valueClass}`}>310</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`mt-6 pt-6 border-t ${borderClass} space-y-2`}>
              <button className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}>
                <Lock size={18} className={secondaryClass} />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Change Password</span>
              </button>
              <button className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}>
                <Bell size={18} className={secondaryClass} />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Notification Settings</span>
              </button>
              <button className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}>
                <Globe size={18} className={secondaryClass} />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Language & Region</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className={cardClass}>
            <h3 className={`${subHeadingClass} mb-6`}>Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>
                  <User size={16} />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    className={inputClass}
                  />
                ) : (
                  <p className={valueClass}>{profile.name}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  <Mail size={16} />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className={inputClass}
                  />
                ) : (
                  <p className={valueClass}>{profile.email}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  <Phone size={16} />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    className={inputClass}
                  />
                ) : (
                  <p className={valueClass}>{profile.phone}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  <Briefcase size={16} />
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.department}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, department: e.target.value })
                    }
                    className={inputClass}
                  />
                ) : (
                  <p className={valueClass}>{profile.department}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  <MapPin size={16} />
                  Office Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.office}
                    onChange={(e) => setEditedProfile({ ...editedProfile, office: e.target.value })}
                    className={inputClass}
                  />
                ) : (
                  <p className={valueClass}>{profile.office}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  <Calendar size={16} />
                  Office Hours
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.officeHours}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, officeHours: e.target.value })
                    }
                    className={inputClass}
                  />
                ) : (
                  <p className={valueClass}>{profile.officeHours}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2 block`}>Bio</label>
              {isEditing ? (
                <textarea
                  value={editedProfile.bio}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                  rows={4}
                  className={inputClass}
                />
              ) : (
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className={cardClass}>
            <h3 className={`${subHeadingClass} mb-6`}>Education</h3>
            <div className="space-y-4">
              {profile.education.map((edu, index) => (
                <div key={index} className={`flex gap-4 pb-4 border-b ${borderSubtleClass} last:border-0`}>
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                    <Award size={24} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${valueClass}`}>{edu.degree}</h4>
                    <p className={`text-sm ${secondaryClass}`}>{edu.institution}</p>
                    <p className={`text-xs ${mutedClass} mt-1`}>{edu.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialization */}
          <div className={cardClass}>
            <h3 className={`${subHeadingClass} mb-4`}>Areas of Specialization</h3>
            <div className="flex flex-wrap gap-2">
              {profile.specialization.map((spec, index) => (
                <span
                  key={index}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
