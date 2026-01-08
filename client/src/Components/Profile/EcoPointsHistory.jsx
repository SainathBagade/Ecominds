
// EcoPointsHistory.jsx
import React from 'react';
import { Leaf, TrendingUp } from 'lucide-react';

const EcoPointsHistory = ({ history = [], totalPoints = 675, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const defaultHistory = [
    { id: 1, action: 'Completed "Solar Energy Basics"', points: 75, date: '2025-11-04', type: 'lesson' },
    { id: 2, action: 'Daily Mission Completed', points: 50, date: '2025-11-04', type: 'mission' },
    { id: 3, action: '7-Day Streak Bonus', points: 100, date: '2025-11-03', type: 'streak' },
    { id: 4, action: 'Completed "Wind Power Quiz"', points: 80, date: '2025-11-03', type: 'quiz' },
    { id: 5, action: 'Watched "Climate Action"', points: 60, date: '2025-11-02', type: 'video' },
    { id: 6, action: 'Finished Weekly Challenge', points: 150, date: '2025-11-01', type: 'challenge' },
    { id: 7, action: 'Completed Module 1', points: 200, date: '2025-10-31', type: 'module' }
  ];

  const data = history.length > 0 ? history : defaultHistory;

  const typeColors = {
    lesson: 'bg-blue-100 text-blue-700 border-blue-300',
    mission: 'bg-green-100 text-green-700 border-green-300',
    streak: 'bg-orange-100 text-orange-700 border-orange-300',
    quiz: 'bg-purple-100 text-purple-700 border-purple-300',
    video: 'bg-pink-100 text-pink-700 border-pink-300',
    challenge: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    module: 'bg-indigo-100 text-indigo-700 border-indigo-300'
  };

  const typeIcons = {
    lesson: '📖',
    mission: '🎯',
    streak: '🔥',
    quiz: '🧠',
    video: '📹',
    challenge: '🏆',
    module: '📚'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-600" />
          EcoPoints History
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border-2 border-green-200">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span className="text-2xl font-bold text-green-600">{totalPoints}</span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.map(item => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl">{typeIcons[item.type]}</div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.action}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">
                    {new Date(item.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${typeColors[item.type]}`}>
                    {item.type}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-green-600 font-bold text-lg ml-4">
              +{item.points}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EcoPointsHistory;

