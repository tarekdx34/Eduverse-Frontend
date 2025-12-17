import {
  User,
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
  ArrowLeft
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../home/components/figma/ImageWithFallback';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'Rohmad Khoirudin',
    studentId: 'STU2024001',
    email: 'rohmad.khoirudin@university.edu',
    phone: '+1 (555) 123-4567',
    address: '123 University Avenue, Campus City, ST 12345',
    dateOfBirth: '1999-05-15',
    enrollmentDate: '2020-09-01',
    major: 'Computer Science',
    minor: 'Mathematics',
    gpa: '3.85',
    expectedGraduation: '2024-06-15',
    bio: 'Passionate computer science student with a keen interest in artificial intelligence and software development. Active member of the programming club and participant in various hackathons.'
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <button
          onClick={() => navigate('/studentdashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
              <button className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 hover:bg-white rounded-lg text-sm flex items-center gap-2 transition-colors">
                <Camera className="w-4 h-4" />
                Change Cover
              </button>
            </div>

            {/* Profile Info */}
            <div className="px-8 pb-8">
              <div className="flex items-end justify-between -mt-16 mb-6">
                <div className="flex items-end gap-6">
                  <div className="relative">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
                      alt="Profile"
                      className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover"
                    />
                    <button className="absolute bottom-2 right-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center shadow-lg transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="pb-2">
                    <h1 className="text-gray-900 text-2xl mb-1">{profileData.fullName}</h1>
                    <p className="text-gray-600 mb-2">{profileData.studentId}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {profileData.major}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        GPA: {profileData.gpa}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pb-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="text-gray-900 mb-2">About</h3>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-600 text-sm leading-relaxed">{profileData.bio}</p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                  <p className="text-2xl text-indigo-700">6</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <p className="text-sm text-gray-600 mb-1">GPA</p>
                  <p className="text-2xl text-emerald-700">{profileData.gpa}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-sm text-gray-600 mb-1">Credits Earned</p>
                  <p className="text-2xl text-purple-700">95</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-sm text-gray-600 mb-1">Attendance</p>
                  <p className="text-2xl text-orange-700">92%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Personal Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Student ID</label>
                  <p className="text-gray-900">{profileData.studentId}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </label>
                  <p className="text-gray-900">
                    {new Date(profileData.dateOfBirth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Academic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Major</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.major}
                      onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.major}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Minor</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.minor}
                      onChange={(e) => setProfileData({ ...profileData, minor: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.minor}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Current GPA</label>
                  <p className="text-gray-900">{profileData.gpa}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Enrollment Date</label>
                  <p className="text-gray-900">
                    {new Date(profileData.enrollmentDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Expected Graduation</label>
                  <p className="text-gray-900">
                    {new Date(profileData.expectedGraduation).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Academic Advisor</label>
                  <p className="text-gray-900">Dr. Sarah Johnson</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Academic Standing</label>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm border border-green-200">
                    Good Standing
                  </span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Achievements & Awards
              </h2>

              <div className="space-y-4">
                {[
                  {
                    title: "Dean's List",
                    description: 'Fall 2023 Semester',
                    icon: 'Trophy'
                  },
                  {
                    title: 'Hackathon Winner',
                    description: 'University Code Challenge 2023',
                    icon: 'Star'
                  },
                  {
                    title: 'Research Publication',
                    description: 'AI Conference Paper',
                    icon: 'BookOpen'
                  },
                  {
                    title: 'Academic Scholarship',
                    description: 'Merit-based Award',
                    icon: 'Award'
                  }
                ].map((achievement, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {achievement.icon === 'Trophy' && '🏆'}
                        {achievement.icon === 'Star' && '⭐'}
                        {achievement.icon === 'BookOpen' && '📖'}
                        {achievement.icon === 'Award' && '🎖'}
                      </span>
                      <div>
                        <h4 className="text-gray-900 text-sm mb-1">{achievement.title}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-gray-900 mb-6">Skills & Interests</h2>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm text-gray-600 mb-3">Technical Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Python',
                      'Java',
                      'JavaScript',
                      'React',
                      'Node.js',
                      'SQL',
                      'Machine Learning',
                      'Data Structures'
                    ].map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm border border-indigo-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm text-gray-600 mb-3">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Artificial Intelligence',
                      'Web Development',
                      'Mobile Apps',
                      'Open Source',
                      'Competitive Programming'
                    ].map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm border border-purple-100"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm text-gray-600 mb-3">Clubs & Organizations</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Programming Club', role: 'President' },
                      { name: 'AI Research Group', role: 'Member' },
                      { name: 'Computer Science Society', role: 'Vice President' }
                    ].map((club, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-900">{club.name}</span>
                        <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                          {club.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
