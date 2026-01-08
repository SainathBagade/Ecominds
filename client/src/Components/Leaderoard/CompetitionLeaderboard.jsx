import React, { useState } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Users, Award } from 'lucide-react';

const CompetitionLeaderboard = ({ data = [], loading = false }) => {

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const leaderboardData = data.length > 0 ? data : [
    { rank: 1, name: 'Eco Champion', points: 1250, badge: 'gold' },
    { rank: 2, name: 'Green Warrior', points: 1100, badge: 'silver' },
    { rank: 3, name: 'Nature Lover', points: 980, badge: 'bronze' },
    { rank: 4, name: 'Student 4', points: 850 },
    { rank: 5, name: 'Student 5', points: 720 },
  ];

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-gray-600 font-bold">#{rank}</span>;
  };


  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Competition Leaderboard</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Trophy className="w-5 h-5 text-primary-600" />
            <span>Top Performers</span>
          </div>
        </div>

        <div className="space-y-3">
          {leaderboardData.map((entry, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${entry.rank <= 3
                ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-300'
                : 'bg-white border-gray-200 hover:border-primary-300'
                }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center w-10">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{entry.user?.name || entry.name || 'Unknown Student'}</span>
                    {entry.competitionTitle && (
                      <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full uppercase font-black">
                        {entry.competitionTitle}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1 font-bold">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      {entry.score || entry.points} XP
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {entry.rank <= 3 && (
                  <Trophy className={`w-5 h-5 ${entry.rank === 1 ? 'text-yellow-500' :
                    entry.rank === 2 ? 'text-gray-400' :
                      'text-orange-600'
                    }`} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {leaderboardData.length === 0 && (
        <div className="card text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Competition Data
          </h3>
          <p className="text-gray-600">
            Competition leaderboard will appear here once competitions are active.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompetitionLeaderboard;

