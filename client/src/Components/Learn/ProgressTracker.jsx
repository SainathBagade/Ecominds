import React from 'react';
import { TrendingUp, Award, Clock } from 'lucide-react';

const ProgressTracker = ({ userStats = {} }) => {
    const {
        rank = 'Beginner',
        nextRankPoints = 500,
        currentPoints = 320,
        level = 5,
        xpToNextLevel = 1000,
        currentXp = 450
    } = userStats;

    const levelProgress = Math.round((currentXp / xpToNextLevel) * 100);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900">Your Progress</h3>
                <div className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Level {level}
                </div>
            </div>

            <div className="space-y-8">
                {/* Tier Progress */}
                <div>
                    <div className="flex justify-between items-end mb-3">
                        <div>
                            <div className="text-xs text-gray-500 font-bold uppercase">Current Tier</div>
                            <div className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <Award className="text-yellow-500" size={20} />
                                {rank}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-gray-400 font-bold uppercase">Next: Explorer</div>
                            <div className="text-sm font-bold text-gray-700">{nextRankPoints - currentPoints} pts to go</div>
                        </div>
                    </div>
                    <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                        <div
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-1000 shadow-inner"
                            style={{ width: `${(currentPoints / nextRankPoints) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Level XP */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                            <TrendingUp size={14} className="text-blue-500" />
                            Experience Points
                        </span>
                        <span className="text-xs font-bold text-blue-600">{currentXp} / {xpToNextLevel} XP</span>
                    </div>
                    <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                        <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-1000 shadow-inner"
                            style={{ width: `${levelProgress}%` }}
                        />
                    </div>
                </div>

                {/* Weekly Goal Placeholder */}
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg text-primary-600 shadow-sm border border-gray-100">
                        <Clock size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-900 uppercase">Weekly Goal</div>
                        <div className="text-xs text-gray-500 mt-0.5">3 / 5 lessons completed</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressTracker;
