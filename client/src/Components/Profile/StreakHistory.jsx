// StreakHistory.jsx
import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Target, ShieldCheck } from 'lucide-react';
import api from '@services/api';

const StreakHistory = ({ userId }) => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchStreakStats();
    }
  }, [userId]);

  const fetchStreakStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/streaks/stats');
      if (response.data && response.data.success) {
        setStreakData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching streak stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Streak Data...</p>
      </div>
    );
  }

  const data = streakData || {
    currentStreak: 0,
    longestStreak: 0,
    freezesAvailable: 0,
    freezesUsed: 0,
    milestones: []
  };

  const statCards = [
    {
      label: 'Current Streak',
      value: data.currentStreak,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100'
    },
    {
      label: 'Longest Streak',
      value: data.longestStreak,
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-100'
    },
    {
      label: 'Freezes Available',
      value: data.freezesAvailable,
      icon: ShieldCheck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      label: 'Milestones Reached',
      value: data.milestones?.length || 0,
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          Streak Journey
        </h2>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Last Updated: Today
        </div>
      </div>

      {/* Hero Streak Card */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="absolute right-[-20px] top-[-20px] opacity-10">
          <Flame size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <p className="text-orange-100 font-bold uppercase tracking-widest text-xs mb-1">Your Fire is Burning</p>
            <h3 className="text-5xl font-black">{data.currentStreak} Day Streak!</h3>
            <p className="text-orange-100/80 text-sm mt-2 max-w-sm font-medium">
              {data.currentStreak === 0
                ? "Start your journey today by completing a lesson!"
                : data.currentStreak < 3
                  ? "Great start! Keep it up to earn exclusive rewards."
                  : "You're on fire! Don't let the flame go out!"}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 text-center min-w-[150px]">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Best Record</p>
            <p className="text-4xl font-black">{data.longestStreak}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Days</p>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl border ${stat.borderColor} ${stat.bgColor} flex flex-col items-center justify-center text-center transition-all hover:shadow-md`}
          >
            <div className={`p-3 rounded-xl bg-white mb-3 shadow-sm`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-[10px] font-black text-gray-400 underline decoration-2 decoration-gray-100 underline-offset-4 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Milestones Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          Recent Milestones
        </h4>
        {data.milestones && data.milestones.length > 0 ? (
          <div className="space-y-3">
            {data.milestones.slice(-3).reverse().map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <Trophy size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{m.days} Day Milestone</p>
                    <p className="text-[10px] text-gray-500">{new Date(m.achievedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-green-600">+{m.reward?.xp} XP</p>
                  <p className="text-[10px] font-bold text-yellow-600">+{m.reward?.coins} Coins</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-400">
            <p className="text-[10px] font-bold uppercase tracking-widest">No milestones yet. Keep going!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakHistory;
