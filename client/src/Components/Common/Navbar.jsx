import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import api from '@services/api';
import {
  Menu,
  X,
  Home,
  BookOpen,
  Trophy,
  Users,
  User,
  LogOut,
  Bell,
  Settings,
  Leaf,
  Gamepad2,
  Target,
  Award,
  Calendar,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { USER_ROLES } from '@utils/constants';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Notification States
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      // Backend returns { success, data: { notifications: [], unreadCount: 0 } }
      const data = response.data.data || {};
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  // Student navigation links
  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Learn', path: '/learn', icon: BookOpen },
    { name: 'Quizzes', path: '/quizzes', icon: Gamepad2 },
    { name: 'Challenges', path: '/challenges', icon: Target },
    { name: 'Competitions', path: '/competitions', icon: Trophy },
    { name: 'Leaderboard', path: '/leaderboard', icon: Award },
    { name: 'Missions', path: '/missions', icon: Calendar },
  ];

  // Teacher navigation links
  const teacherLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Proof Review', path: '/proof-review', icon: Target },
  ];

  // Admin navigation links
  const adminLinks = [
    { name: 'Overview', path: '/dashboard?tab=overview', icon: Home },
    { name: 'Analytics', path: '/dashboard?tab=analytics', icon: Trophy },
    { name: 'Approvals', path: '/dashboard?tab=approvals', icon: UserCheck },
    { name: 'Create Staff', path: '/dashboard?tab=teachers', icon: UserPlus },
    { name: 'Competitions', path: '/dashboard?tab=competitions', icon: Trophy },
  ];

  // Super Admin navigation links
  const superAdminLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Organizations', path: '/dashboard', icon: Users },
    { name: 'System Status', path: '/dashboard', icon: Settings },
  ];

  // Determine which links to show
  const navLinks = user?.role === USER_ROLES.SUPERADMIN
    ? superAdminLinks
    : user?.role === USER_ROLES.ADMIN
      ? adminLinks
      : user?.role === USER_ROLES.TEACHER
        ? teacherLinks
        : studentLinks;

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-900">EcoMinds</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                    <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                      <h3 className="font-semibold text-gray-700">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => markAsRead(notif._id)}
                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className={`text-sm font-medium ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                                <p className="text-[10px] text-gray-400 mt-2">
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              {!notif.isRead && (
                                <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden lg:block">
                  {user.name || 'User'}
                </span>
              </button>

              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-20">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/profile?tab=settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${isActive(link.path)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
            <hr className="my-2" />
            <Link
              to="/profile"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              <User className="w-5 h-5" />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
