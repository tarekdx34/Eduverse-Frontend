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
  achievements: string[];
  joinDate: string;
};

type ProfilePageProps = {
  instructor: InstructorProfile;
};

export function ProfilePage({ instructor }: ProfilePageProps) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <p className="text-sm text-gray-500 mt-1">
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
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
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
              <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
              <p className="text-sm text-gray-500">{profile.department}</p>
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Active
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-semibold text-gray-900">{profile.joinDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sections Teaching</span>
                <span className="text-sm font-semibold text-gray-900">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Students</span>
                <span className="text-sm font-semibold text-gray-900">310</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Lock size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Change Password</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Bell size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Notification Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Globe size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Language & Region</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phone}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.department}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} />
                  Office Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.office}
                    onChange={(e) => setEditedProfile({ ...editedProfile, office: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.office}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.officeHours}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Bio</label>
              {isEditing ? (
                <textarea
                  value={editedProfile.bio}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-700">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Education</h3>
            <div className="space-y-4">
              {profile.education.map((edu, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Award size={24} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    <p className="text-xs text-gray-500 mt-1">{edu.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialization */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas of Specialization</h3>
            <div className="flex flex-wrap gap-2">
              {profile.specialization.map((spec, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements & Awards</h3>
            <ul className="space-y-3">
              {profile.achievements.map((achievement, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                  <span className="text-gray-700">{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
