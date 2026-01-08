
// BadgeCollection.jsx
import React, { useState, useEffect } from 'react';
import { Award, Trophy } from 'lucide-react';
import api from '@services/api';
import { useAuth } from '@hooks/useAuth';

const BadgeCollection = ({ userId }) => {
  const { user } = useAuth();
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await api.get('/badges');
        setAllBadges(response.data.badges || []);
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-600" />
            Eco-Badge Collection
          </h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">
            {user?.badges?.length || 0} / {allBadges.length} UNLOCKED
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {allBadges.length > 0 ? (
          allBadges.map((badge) => {
            const isEarned = user?.badges?.includes(badge.name) || user?.badges?.includes(badge._id);
            return (
              <div key={badge._id} className="group relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 ${isEarned
                    ? 'bg-gradient-to-br from-primary-50 to-primary-100 shadow-sm shadow-primary-200/50 scale-100 hover:scale-110'
                    : 'bg-gray-50 border border-gray-100 opacity-40 grayscale'
                  }`}>
                  {badge.icon || '🏅'}
                </div>

                {/* Tiny Label (Only on Hover) */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-[8px] font-black uppercase tracking-tighter rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 whitespace-nowrap">
                  {badge.name}
                </div>

                {/* Tooltip Background */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-3 bg-white border border-gray-100 shadow-2xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">{badge.name}</p>
                  <p className="text-[9px] text-gray-500 leading-tight font-medium">{badge.description}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isEarned ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-[8px] font-black uppercase text-gray-400">
                      {isEarned ? 'Earned' : 'Locked'}
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
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No badges available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeCollection;