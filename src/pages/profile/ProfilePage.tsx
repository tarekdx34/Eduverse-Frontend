import { useNavigate } from 'react-router-dom';
import { AuthService, User } from '../../services/api/authService';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user: User | null = AuthService.getStoredUser();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">No User Data</h1>
          <button
            onClick={() => navigate('/login')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">User Profile</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600" />

          {/* Profile Content */}
          <div className="px-8 pb-8">
            {/* Avatar and Name */}
            <div className="flex items-end gap-6 -mt-16 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-4 border-slate-900 flex items-center justify-center text-white text-4xl font-bold">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div className="mb-2">
                <h2 className="text-3xl font-bold text-white">{user.fullName}</h2>
                <p className="text-purple-300/70">{user.email}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Status</p>
                <p className="text-white font-semibold capitalize">{user.status}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Email Verified</p>
                <p className="text-white font-semibold">{user.emailVerified ? '✓ Yes' : '✗ No'}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Role</p>
                <p className="text-white font-semibold capitalize">{user.roles[0]}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">User ID</p>
                <p className="text-white font-semibold">#{user.userId}</p>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-2">Contact Information</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Email:</span>
                    <span className="text-white">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Phone:</span>
                    <span className="text-white">{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">First Name:</span>
                    <span className="text-white">{user.firstName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Last Name:</span>
                    <span className="text-white">{user.lastName}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-2">Account Details</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Campus ID:</span>
                    <span className="text-white">{user.campusId || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Created At:</span>
                    <span className="text-white">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Last Login:</span>
                    <span className="text-white">
                      {new Date(user.lastLoginAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-3">Assigned Roles</p>
                <div className="flex gap-2 flex-wrap">
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      className="bg-purple-600/30 text-purple-300 px-4 py-2 rounded-full text-sm capitalize border border-purple-500/30"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Picture (if available) */}
            {user.profilePictureUrl && (
              <div className="bg-slate-800/50 rounded-lg p-4 mt-4">
                <p className="text-slate-400 text-sm mb-3">Profile Picture</p>
                <img src={user.profilePictureUrl} alt="Profile" className="max-w-xs rounded-lg" />
              </div>
            )}

            {/* JSON View */}
            <div className="bg-slate-800/50 rounded-lg p-4 mt-4">
              <p className="text-slate-400 text-sm mb-3">Full Data (JSON)</p>
              <pre className="bg-slate-900/50 rounded p-3 text-slate-300 text-xs overflow-auto max-h-64">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition"
          >
            ← Back to Home
          </button>
          <button
            onClick={handleLogout}
            className="ml-auto bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
