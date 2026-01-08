import React from 'react';
import { Trophy, Medal, Crown, TrendingUp, Users, Award } from 'lucide-react';

const ClassLeaderboard = ({ data = [], userRank, selectedGrade, timeFilter, onGradeChange, onTimeChange }) => {
  const students = data;

  const classData = {
    grade: selectedGrade,
    totalStudents: students.length,
    averagePoints: students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.score || 0), 0) / students.length) : 0,
    topScorer: students[0]?.user?.name || 'N/A'
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-100' };
    if (rank === 2) return { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-100' };
    if (rank === 3) return { icon: Medal, color: 'text-orange-600', bg: 'bg-orange-100' };
    return { icon: Trophy, color: 'text-blue-500', bg: 'bg-blue-100' };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8">
        {/* Header Content Removed - Parent Page handles it */}

        {/* Class Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Users className="mx-auto mb-3 text-blue-500" size={32} />
            <div className="text-3xl font-bold text-gray-800">{classData.totalStudents}</div>
            <div className="text-sm text-gray-600">Students</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Trophy className="mx-auto mb-3 text-yellow-500" size={32} />
            <div className="text-3xl font-bold text-gray-800">{classData.averagePoints}</div>
            <div className="text-sm text-gray-600">Avg Points</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Crown className="mx-auto mb-3 text-purple-500" size={32} />
            <div className="text-xl font-bold text-gray-800">{classData.topScorer}</div>
            <div className="text-sm text-gray-600">Top Scorer</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Award className="mx-auto mb-3 text-green-500" size={32} />
            <div className="text-3xl font-bold text-gray-800">{selectedGrade}</div>
            <div className="text-sm text-gray-600">Grade Level</div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Top Performers</h2>
          <div className="flex items-end justify-center gap-6">
            {/* 2nd Place */}
            {students[1] && (
              <div className="flex flex-col items-center">
                <Medal className="text-gray-400 mb-3 animate-bounce" size={40} />
                <img
                  src={students[1].user?.avatar || `https://ui-avatars.com/api/?name=${students[1].user?.name}&background=9ca3af&color=fff`}
                  alt={students[1].user?.name}
                  className="w-20 h-20 rounded-full border-4 border-gray-300 mb-3"
                />
                <div className="text-center">
                  <div className="font-bold text-gray-800">{students[1].user?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-600">{students[1].score || 0} pts</div>
                </div>
                <div className="h-32 w-24 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg mt-4" />
              </div>
            )}

            {/* 1st Place */}
            {students[0] && (
              <div className="flex flex-col items-center">
                <Crown className="text-yellow-500 mb-3 animate-bounce" size={48} />
                <img
                  src={students[0].user?.avatar || `https://ui-avatars.com/api/?name=${students[0].user?.name}&background=eab308&color=fff`}
                  alt={students[0].user?.name}
                  className="w-24 h-24 rounded-full border-4 border-yellow-400 mb-3"
                />
                <div className="text-center">
                  <div className="font-bold text-gray-800 text-lg">{students[0].user?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-600 font-semibold">{students[0].score || 0} pts</div>
                </div>
                <div className="h-40 w-24 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-lg mt-4" />
              </div>
            )}

            {/* 3rd Place */}
            {students[2] && (
              <div className="flex flex-col items-center">
                <Medal className="text-orange-600 mb-3 animate-bounce" size={40} />
                <img
                  src={students[2].user?.avatar || `https://ui-avatars.com/api/?name=${students[2].user?.name}&background=ea580c&color=fff`}
                  alt={students[2].user?.name}
                  className="w-20 h-20 rounded-full border-4 border-orange-300 mb-3"
                />
                <div className="text-center">
                  <div className="font-bold text-gray-800">{students[2].user?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-600">{students[2].score || 0} pts</div>
                </div>
                <div className="h-28 w-24 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg mt-4" />
              </div>
            )}
          </div>
        </div>

        {/* Full Rankings */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h2 className="text-xl font-bold">Complete Rankings</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Points</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Lessons</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Quizzes</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Streak</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Badges</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map(student => {
                  const badge = getRankBadge(student.rank);
                  return (
                    <tr
                      key={student.rank}
                      className={`${student.isCurrentUser
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50'
                        } transition`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badge.bg}`}>
                            <badge.icon className={badge.color} size={20} />
                          </div>
                          <span className="font-bold text-gray-800">{student.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.user?.avatar || `https://ui-avatars.com/api/?name=${student.user?.name}&background=3b82f6&color=fff`}
                            alt={student.user?.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className={`font-semibold ${student.isCurrentUser ? 'text-blue-700' : 'text-gray-800'}`}>
                              {student.user?.name || 'Unknown Student'}
                              {student.isCurrentUser && (
                                <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">YOU</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-lg text-gray-800">{student.score}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-700">{student.stats?.lessonsCompleted || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-700">{student.stats?.perfectScores || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm font-semibold">
                          🔥 {student.streak}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm font-semibold">
                          <Award size={14} />
                          {student.badges}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {student.change > 0 && (
                          <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                            <TrendingUp size={16} />
                            +{student.change}
                          </span>
                        )}
                        {student.change < 0 && (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                            <TrendingUp size={16} className="rotate-180" />
                            {student.change}
                          </span>
                        )}
                        {student.change === 0 && (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-6 text-center">
          <p className="text-purple-900 font-semibold text-lg">
            Keep learning and climbing! 🚀 Every lesson brings you closer to the top!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClassLeaderboard;