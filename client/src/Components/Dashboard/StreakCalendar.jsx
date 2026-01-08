import React from 'react';
import { Flame } from 'lucide-react';

const StreakCalendar = ({ streakDays = [] }) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDay();

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Activity Streak</h3>
                <div className="flex items-center gap-1 text-orange-600 font-bold">
                    <Flame size={20} className="fill-orange-600" />
                    <span>{streakDays.length} Days</span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                    const isToday = index === today;
                    const isActive = streakDays.includes(index);

                    return (
                        <div key={index} className="flex flex-col items-center gap-2">
                            <span className={`text-[10px] font-bold ${isToday ? 'text-primary-600' : 'text-gray-400'}`}>
                                {day}
                            </span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                    : isToday
                                        ? 'bg-primary-50 text-primary-600 border-2 border-primary-200'
                                        : 'bg-gray-50 text-gray-300'
                                }`}>
                                {isActive ? (
                                    <Flame size={14} className="fill-white" />
                                ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="text-xs text-gray-500 mt-6 text-center">
                Complete a mission tomorrow to maintain your {streakDays.length} day streak!
            </p>
        </div>
    );
};

export default StreakCalendar;
