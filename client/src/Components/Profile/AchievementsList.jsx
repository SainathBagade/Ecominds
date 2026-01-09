
// AchievementList.jsx
import React, { useState, useEffect } from 'react';
import { Trophy, Star } from 'lucide-react';
import api from '@services/api';
import { useAuth } from '@hooks/useAuth';

const AchievementsList = ({ userId }) => {
  const { user } = useAuth();
  const [allAchievements, setAllAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await api.get('/achievements');
        setAllAchievements(response.data.achievements || []);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievement Collection
          </h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">
            {user?.achievements?.length || 0} / {allAchievements.length} UNLOCKED
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {allAchievements.length > 0 ? (
          allAchievements.map((achievement) => {
            const isUnlocked = user?.achievements?.includes(achievement.title) || user?.achievements?.includes(achievement._id);
            return (
              <div key={achievement._id} className="group relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 ${isUnlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-sm shadow-yellow-200/50 scale-100 hover:scale-110'
                  : 'bg-gray-50 border border-gray-100 opacity-40 grayscale'
                  }`}>
                  {achievement.icon || '🏆'}
                </div>

                {/* Tiny Label (Only on Hover) */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-[8px] font-black uppercase tracking-tighter rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 whitespace-nowrap">
                  {achievement.title}
                </div>

                {/* Tooltip Background */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-3 bg-white border border-gray-100 shadow-2xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">{achievement.title}</p>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-2 h-2 text-yellow-500 fill-yellow-500" />
                      <span className="text-[8px] font-bold text-gray-400">{achievement.points}</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-500 leading-tight font-medium mb-2">{achievement.description}</p>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                    <span className="text-[8px] font-black uppercase text-gray-400">
                      {isUnlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-10 text-center">
            <Trophy className="w-10 h-10 text-gray-100 mx-auto mb-2" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No achievements available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsList;