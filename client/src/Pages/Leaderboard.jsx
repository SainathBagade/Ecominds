import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import ClassLeaderboard from '@components/Leaderoard/classLeaderboard';
import CompetitionLeaderboard from '@components/Leaderoard/CompetitionLeaderboard';
import Loader from '@components/Common/Loader';
import { Trophy, Users, Medal, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@services/api';
import { LEADERBOARD_TIMEFRAMES } from '@utils/constants';

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('class'); // class, competition
  const [timeFilter, setTimeFilter] = useState(LEADERBOARD_TIMEFRAMES.WEEKLY); // weekly, monthly, alltime
  const [selectedGrade, setSelectedGrade] = useState(user?.grade || '10');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    userPoints: 0,
    userRank: 0
  });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const endpoint = activeTab === 'class' ? '/leaderboard' : '/leaderboard/competition';
        const response = await api.get(endpoint, {
          params: {
            type: timeFilter,
            grade: activeTab === 'class' ? selectedGrade : undefined,
            limit: 50 // Show all students (usually 40, but handle more just in case)
          }
        });
        // Backend returns { success, data: { rankings, userRank, ... } }
        setLeaderboardData(response.data.data?.rankings || []);
        const uRank = response.data.data?.userRank;
        setStats({
          totalUsers: response.data.data?.rankings?.length || 0,
          userPoints: uRank?.score || 0,
          userRank: uRank?.rank || 0
        });
      } catch (error) {
        toast.error('Failed to load leaderboard');
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab, timeFilter, selectedGrade]);



  const tabs = [
    { id: 'class', label: 'Class Leaderboard', icon: Users },
    { id: 'competition', label: 'Competition Rankings', icon: Trophy }
  ];

  const timeFilters = [
    { id: LEADERBOARD_TIMEFRAMES.WEEKLY, label: 'This Week' },
    { id: LEADERBOARD_TIMEFRAMES.MONTHLY, label: 'This Month' },
    { id: LEADERBOARD_TIMEFRAMES.ALL_TIME, label: 'All Time' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                Leaderboard
              </h1>
              <p className="text-gray-600">
                See how you rank against other students
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Students</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalUsers}
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                  <Medal className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Your Rank</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.userRank ? `#${stats.userRank}` : 'Sai'}
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Your Points</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.userPoints || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>




        {/* Tabs & Filters */}
        <div className="card mb-6 animate-slide-up">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* View Filter (My Class vs Global) */}
          {activeTab === 'class' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select View
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedGrade(user?.grade || '10')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all border-2 ${selectedGrade
                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg scale-[1.02]'
                    : 'bg-white text-gray-600 border-gray-100 hover:border-primary-200'
                    }`}
                >
                  <Users className="w-5 h-5" />
                  My Class (Grade {user?.grade || '10'})
                </button>
                <button
                  onClick={() => setSelectedGrade('')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all border-2 ${!selectedGrade
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.02]'
                    : 'bg-white text-gray-600 border-gray-100 hover:border-primary-200'
                    }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  Global Board
                </button>
              </div>
            </div>
          )}

          {/* Time Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <div className="flex flex-wrap gap-2">
              {timeFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setTimeFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeFilter === filter.id
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="card text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No data available
            </h3>
            <p className="text-gray-600">
              Start completing lessons and quizzes to appear on the leaderboard!
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {activeTab === 'class' ? (
              <ClassLeaderboard
                data={leaderboardData}
                timeFilter={timeFilter}
                selectedGrade={selectedGrade}
                onGradeChange={setSelectedGrade}
                onTimeChange={setTimeFilter}
              />
            ) : (
              <CompetitionLeaderboard
                data={leaderboardData}
                timeFilter={timeFilter}
              />
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="card mt-6 bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to Climb the Leaderboard
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Complete lessons and quizzes to earn points</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Maintain your daily streak for bonus points</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Complete daily missions for extra rewards</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Participate in challenges and competitions</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>The more you learn, the higher you climb!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;