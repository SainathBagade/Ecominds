import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import UserProfile from '@components/Profile/UserProfile';
import BadgeCollection from '@components/Profile/BadgeCollection';
import EcoPointsHistory from '@components/Profile/EcoPointsHistory';
import AchievementsList from '@components/Profile/AchievementsList';
import StreakHistory from '@components/Profile/StreakHistory';
import ProgressSummary from '@components/Profile/ProgressSummary';
import ProofSubmissions from '@components/Profile/ProofSubmissions';
import Loader from '@components/Common/Loader';
import { User, Award, Trophy, TrendingUp, Flame, Image, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@services/api';
import { USER_ROLES } from '@utils/constants';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchProfileData();
    }
  }, [user?._id]);

  const fetchProfileData = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      // Fetch core profile data first
      const profileRes = await api.get(`/users/${user._id}`);
      setProfileData(profileRes.data);

      // Fetch stats separately so failure doesn't block the whole page
      try {
        const statsRes = await api.get('/progress/stats');
        if (statsRes.data && statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (statsError) {
        console.warn('Failed to fetch detailed stats:', statsError);
        // Page still works, just without detailed stats
      }
    } catch (error) {
      toast.error('Failed to load profile');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.password || !passwordData.confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (passwordData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setUpdatingPassword(true);
    try {
      // Using POST as per user.routes.js definition for updates
      await api.post(`/users/${user._id}`, { password: passwordData.password });
      toast.success("Password updated successfully");
      setPasswordData({ password: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    setDeletingAccount(true);
    try {
      await api.delete(`/users/${user._id}`);
      toast.success("Account deleted");
      logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account");
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleResetProgress = async () => {
    if (!window.confirm("Are you sure you want to RESTART your learning journey? All completed lessons, points, and badges will be reset. This cannot be undone.")) return;

    try {
      await api.post('/progress/reset');
      toast.success("Learning progress reset! You are back at the start.");

      // Refresh user data in context and local state
      await fetchProfileData();

      // Navigate to learn page to start over
      navigate('/learn');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reset progress");
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    ...(profileData?.role === USER_ROLES.STUDENT ? [
      { id: 'badges', label: 'Badges', icon: Award },
      { id: 'achievements', label: 'Achievements', icon: Trophy },
      { id: 'progress', label: 'Progress', icon: TrendingUp },
      { id: 'streak', label: 'Streak', icon: Flame },
      { id: 'proofs', label: 'Proofs', icon: Image },
    ] : []),
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Failed to load profile
          </h2>
          <button onClick={fetchProfileData} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header */}
        <div className="card mb-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              {(profileData.role === USER_ROLES.STUDENT && (stats?.streak?.current > 0 || profileData.streak > 0)) && (
                <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center border-4 border-white shadow-lg">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                {profileData.name}
              </h1>
              <p className="text-gray-600 mb-4">{profileData.email}</p>

              {/* Stats - Automatically hidden for Admins/Teachers/SuperAdmins */}
              {profileData.role === USER_ROLES.STUDENT && (
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="bg-primary-50 px-4 py-2 rounded-lg">
                    <div className="text-sm text-gray-600">EcoPoints</div>
                    <div className="text-xl font-bold text-primary-600">
                      {profileData.points || 0}
                    </div>
                  </div>
                  <div className="bg-yellow-50 px-4 py-2 rounded-lg">
                    <div className="text-sm text-gray-600">Level</div>
                    <div className="text-xl font-bold text-yellow-600">
                      {profileData.level || 1}
                    </div>
                  </div>
                  <div className="bg-blue-50 px-4 py-2 rounded-lg">
                    <div className="text-sm text-gray-600">Rank</div>
                    <div className="text-xl font-bold text-blue-600">
                      #{profileData.rank || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-orange-50 px-4 py-2 rounded-lg">
                    <div className="text-sm text-gray-600">Streak</div>
                    <div className="text-xl font-bold text-orange-600 flex items-center gap-1">
                      <Flame className="w-5 h-5" />
                      {stats?.streak?.current || profileData.streak || 0}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Role Badge */}
            <div>
              <span className="badge badge-info text-sm px-4 py-2 capitalize">
                {profileData.role}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-6 animate-slide-up">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <UserProfile
              user={profileData}
              onUpdate={fetchProfileData}
            />
          )}

          {activeTab === 'badges' && (
            <BadgeCollection userId={profileData._id} />
          )}

          {activeTab === 'achievements' && (
            <AchievementsList userId={profileData._id} />
          )}

          {activeTab === 'progress' && (
            <ProgressSummary userId={profileData._id} stats={stats} />
          )}

          {activeTab === 'streak' && (
            <StreakHistory userId={profileData._id} />
          )}

          {activeTab === 'proofs' && (
            <ProofSubmissions userId={profileData._id} />
          )}

          {activeTab === 'settings' && (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Account Settings
              </h2>

              <div className="space-y-6">
                {/* Change Password */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Change Password
                  </h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={passwordData.password}
                        onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                        className="input"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="input"
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      onClick={handleUpdatePassword}
                      disabled={updatingPassword}
                      className="btn btn-secondary"
                    >
                      {updatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Notification Preferences
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Mission completed</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Badge unlocked</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Streak reminders</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Weekly progress report</span>
                    </label>
                  </div>
                </div>

                {/* Privacy */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Privacy
                  </h3>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">Show me on leaderboard</span>
                  </label>
                </div>

                {/* Danger Zone */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-3">
                    Danger Zone
                  </h3>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <button
                      onClick={handleResetProgress}
                      className="btn bg-orange-100 text-orange-700 hover:bg-orange-200 border-none"
                    >
                      Restart Learning Journey
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      className="btn btn-danger"
                    >
                      {deletingAccount ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Restarting will reset all your lesson progress, points, and badges so you can start from the beginning. Deleting account is permanent.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;