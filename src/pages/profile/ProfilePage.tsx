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
  ArrowLeft,
  Plus,
  Loader2,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../home/components/figma/ImageWithFallback';
import { UserService, type UserProfile } from '../../services/api/userService';
import { toast } from 'sonner';

// ──────────────────────────────────────────────────────────────
// TagInput: interactive chip input for skills / interests
// ──────────────────────────────────────────────────────────────
function TagInput({
  tags,
  onChange,
  placeholder,
  colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-100',
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  colorClass?: string;
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
      className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent min-h-[48px] cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm border ${colorClass}`}
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(idx); }}
            className="ml-0.5 hover:text-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent placeholder-gray-400 text-gray-900"
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main ProfilePage
// ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile state from API
  const [profileData, setProfileData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    enrollmentDate: '',
    major: '',
    minor: '',
    gpa: '',
    expectedGraduation: '',
    bio: '',
    academicInterests: [] as string[],
    skills: [] as string[],
    profileCompleteness: 0,
  });

  // Editable copy (only committed on Save)
  const [editData, setEditData] = useState({ ...profileData });

  // Load profile from backend
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const profile: UserProfile = await UserService.getProfile();
        const merged = {
          fullName: profile.fullName || `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim(),
          studentId: String(profile.userId ?? ''),
          email: profile.email ?? '',
          phone: '',
          address: '',
          dateOfBirth: '',
          enrollmentDate: '',
          major: '',
          minor: '',
          gpa: '',
          expectedGraduation: '',
          bio: profile.bio ?? '',
          academicInterests: profile.academicInterests ?? [],
          skills: profile.skills ?? [],
          profileCompleteness: profile.profileCompleteness ?? 0,
        };
        setProfileData(merged);
        setEditData(merged);
      } catch {
        // non-critical; continue with defaults
        toast.error('Could not load profile from server. Showing defaults.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const [firstName, ...rest] = editData.fullName.trim().split(' ');
      const lastName = rest.join(' ');
      const updated = await UserService.updateProfile({
        firstName,
        lastName,
        bio: editData.bio,
        academicInterests: Array.isArray(editData.academicInterests) ? editData.academicInterests : [],
        skills: Array.isArray(editData.skills) ? editData.skills : [],
      });
      const merged = {
        ...editData,
        fullName: updated.fullName || `${updated.firstName ?? ''} ${updated.lastName ?? ''}`.trim() || editData.fullName,
        academicInterests: updated.academicInterests ?? editData.academicInterests,
        skills: updated.skills ?? editData.skills,
        profileCompleteness: updated.profileCompleteness ?? editData.profileCompleteness,
      };
      setProfileData(merged);
      setEditData(merged);
      setIsEditing(false);
      toast.success('Profile saved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-gray-500">Loading profile…</p>
        </div>
      </div>
    );
  }

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
            <div className="h-48 bg-gradient-to-r from-indigo-500 via-blue-500 to-pink-500 relative">
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
                    <h1 className="text-gray-900 text-2xl mb-1">{profileData.fullName || 'Your Name'}</h1>
                    {profileData.studentId && (
                      <p className="text-gray-600 mb-2">ID: {profileData.studentId}</p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      {profileData.major && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {profileData.major}
                        </span>
                      )}
                      {profileData.gpa && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            GPA: {profileData.gpa}
                          </span>
                        </>
                      )}
                      {profileData.profileCompleteness > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            {profileData.profileCompleteness}% complete
                          </span>
                        </>
                      )}
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
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-60"
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
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Tell others about yourself…"
                  />
                ) : (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {profileData.bio || 'No bio yet. Click Edit Profile to add one.'}
                  </p>
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
                  <p className="text-2xl text-emerald-700">{profileData.gpa || '—'}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-pink-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Credits Earned</p>
                  <p className="text-2xl text-blue-700">95</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-sm text-gray-600 mb-1">Profile</p>
                  <p className="text-2xl text-orange-700">{profileData.profileCompleteness}%</p>
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
                      value={editData.fullName}
                      onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.fullName || '—'}</p>
                  )}
                </div>

                {profileData.studentId && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Student ID</label>
                    <p className="text-gray-900">{profileData.studentId}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <p className="text-gray-900">{profileData.email || '—'}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.phone || '—'}</p>
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
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.address || '—'}</p>
                  )}
                </div>

                {profileData.dateOfBirth && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date of Birth
                    </label>
                    <p className="text-gray-900">
                      {new Date(profileData.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Academic Information
              </h2>

              <div className="space-y-4">
                {profileData.major && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Major</label>
                    <p className="text-gray-900">{profileData.major}</p>
                  </div>
                )}

                {profileData.minor && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Minor</label>
                    <p className="text-gray-900">{profileData.minor}</p>
                  </div>
                )}

                {profileData.gpa && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Current GPA</label>
                    <p className="text-gray-900">{profileData.gpa}</p>
                  </div>
                )}

                {profileData.enrollmentDate && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Enrollment Date</label>
                    <p className="text-gray-900">
                      {new Date(profileData.enrollmentDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {profileData.expectedGraduation && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Expected Graduation</label>
                    <p className="text-gray-900">
                      {new Date(profileData.expectedGraduation).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Academic Standing</label>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm border border-green-200">
                    Good Standing
                  </span>
                </div>
              </div>
            </div>

            {/* Skills — backend connected */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-gray-900 mb-6 flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                Skills
                {!isEditing && profileData.skills.length === 0 && (
                  <span className="ml-auto text-xs text-gray-400">None yet</span>
                )}
              </h2>

              {isEditing ? (
                <div>
                  <p className="text-xs text-gray-500 mb-3">
                    Type a skill and press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> or{' '}
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">,</kbd> to add. Click{' '}
                    <X className="inline w-3 h-3" /> to remove.
                  </p>
                  <TagInput
                    tags={editData.skills}
                    onChange={(tags) => setEditData({ ...editData, skills: tags })}
                    placeholder="e.g. Python, React, Machine Learning…"
                    colorClass="bg-indigo-50 text-indigo-700 border-indigo-100"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Skills obtained from completed courses are automatically added by the system.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.length > 0 ? (
                    profileData.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm border border-indigo-100"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No skills listed yet. Click <strong>Edit Profile</strong> to add your skills.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Academic Interests — backend connected */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Academic Interests
              </h2>

              {isEditing ? (
                <div>
                  <p className="text-xs text-gray-500 mb-3">
                    Type an interest and press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> or{' '}
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">,</kbd> to add.
                  </p>
                  <TagInput
                    tags={editData.academicInterests}
                    onChange={(tags) => setEditData({ ...editData, academicInterests: tags })}
                    placeholder="e.g. Artificial Intelligence, Web Development…"
                    colorClass="bg-amber-50 text-amber-700 border-amber-100"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.academicInterests.length > 0 ? (
                    profileData.academicInterests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-100"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No interests listed yet. Click <strong>Edit Profile</strong> to add your academic interests.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
              <h2 className="text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Achievements &amp; Awards
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Dean's List", description: 'Fall 2023 Semester', emoji: '🏆' },
                  { title: 'Hackathon Winner', description: 'University Code Challenge 2023', emoji: '⭐' },
                  { title: 'Research Publication', description: 'AI Conference Paper', emoji: '📖' },
                  { title: 'Academic Scholarship', description: 'Merit-based Award', emoji: '🎖' },
                ].map((achievement, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.emoji}</span>
                      <div>
                        <h4 className="text-gray-900 text-sm mb-1">{achievement.title}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
