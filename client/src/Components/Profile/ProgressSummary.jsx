// ProgressSummary.jsx
import React, { useState, useEffect } from 'react';
import { Star, Calendar, Flame, Target, TrendingUp } from 'lucide-react';
import api from '@services/api';

const ProgressSummary = ({ stats = {}, userId, loading: propLoading = false }) => {
  const [internalStats, setInternalStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch if no stats are passed via props and we have a userId
    if (userId && (!stats || Object.keys(stats).length === 0)) {
      fetchProgress();
    }
  }, [userId, stats]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await api.get('/progress/stats');
      setInternalStats(response.data.data);
    } catch (error) {
      console.error('Error fetching progress summary:', error);
      setInternalStats({});
    } finally {
      setLoading(false);
    }
  };

  // Normalize data between internal fetch and parent props
  const normalizeData = (rawStats) => {
    if (!rawStats) return {};

    // If it's already normalized (previous struct)
    if (rawStats.level !== undefined && rawStats.totalPoints !== undefined && !rawStats.userProgress) {
      return rawStats;
    }

    // If it's the raw API response (passed from Profile.jsx or set by internal fetch)
    const prog = rawStats.userProgress;
    const streak = rawStats.streak;
    const moduleStats = rawStats.moduleStats || {};

    return {
      level: prog?.level || 1,
      totalPoints: prog?.totalXP || 0,
      nextLevelPoints: (prog?.level || 1) * 100,
      rank: (prog?.totalXP || 0) > 1000 ? 'Climate Hero' : (prog?.totalXP || 0) > 500 ? 'Eco Warrior' : 'Climate Advocate',
      joinDate: prog?.createdAt,
      daysActive: prog?.createdAt ? Math.floor((new Date() - new Date(prog.createdAt)) / (1000 * 60 * 60 * 24)) + 1 : 0,
      longestStreak: streak?.longest || 0,
      currentStreak: streak?.current || 0,
      completedLessons: prog?.lessonsCompleted || 0,
      totalLessons: moduleStats.totalLessonsCount || 10
    };
  };

  const data = normalizeData(Object.keys(stats || {}).length > 0 ? stats : internalStats);
  const isActuallyLoading = (loading || propLoading) && !data.level;

  if (isActuallyLoading) {
    return (
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl shadow-xl p-8 text-white min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="font-bold uppercase tracking-widest text-xs opacity-70">Syncing Progress...</p>
        </div>
      </div>
    );
  }

  const totalPoints = data.totalPoints || 0;
  const nextLevelPoints = data.nextLevelPoints || ((data.level || 1) * 100);
  const progressPercent = Math.min(100, (totalPoints / nextLevelPoints) * 100);
  const pointsNeeded = Math.max(0, nextLevelPoints - totalPoints);

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl shadow-2xl p-8 text-white animate-fade-in">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
            <TrendingUp className="w-6 h-6" />
          </div>
          Growth Statistics
        </h2>
        <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
          Rank: {data.rank}
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-10 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-4xl font-black leading-none">Level {data.level}</span>
            <p className="text-xs font-bold uppercase tracking-widest text-primary-200 mt-1">
              {pointsNeeded > 0 ? `${pointsNeeded} XP to reach level ${data.level + 1}` : 'Elite Tier Reached'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-black">{totalPoints}</span>
            <span className="text-xs font-bold text-white/40 uppercase"> / {nextLevelPoints} XP</span>
          </div>
        </div>
        <div className="w-full bg-white/10 rounded-full h-4 p-1 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-200 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(250,204,21,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Target, label: 'Lessons', value: `${data.completedLessons}/${data.totalLessons}` },
          { icon: Calendar, label: 'Days Active', value: data.daysActive },
          { icon: Flame, label: 'Current Streak', value: data.currentStreak, color: 'text-orange-400' },
          { icon: Star, label: 'Best Streak', value: data.longestStreak, color: 'text-yellow-400' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-2 opacity-60">
              <stat.icon className={`w-3.4 h-3.4 ${stat.color || ''}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="text-2xl font-black tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      {data.joinDate && (
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 opacity-50 text-[10px] font-bold uppercase tracking-widest">
          <Calendar className="w-3 h-3" />
          Member since {new Date(data.joinDate).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })}
        </div>
      )}
    </div>
  );
};

export default ProgressSummary;