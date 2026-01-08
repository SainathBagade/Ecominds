import React, { useContext } from 'react';
import { Target, Trophy, Clock, BookOpen } from 'lucide-react';
import { ProgressContext } from '@context/ProgressContext';

const LearningProgress = ({ stats }) => {
    const { progress, loading } = useContext(ProgressContext);

    const displayStats = stats || {
        totalLessons: 36, // 3 subjects x 3 modules x 4 videos
        completedLessons: progress?.lessonsCompleted || 0,
        totalPoints: progress?.totalXP || progress?.points || 0,
        currentStreak: progress?.streak?.currentStreak || 0,
    };

    const {
        totalLessons = 12,
        completedLessons = 0,
        totalPoints = 0,
        currentStreak = 0,
    } = displayStats;

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    if (loading && !stats) {
        return <div className="h-24 flex items-center justify-center bg-white rounded-2xl border border-gray-100 mb-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 text-left">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <BookOpen className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-sm text-gray-500 font-medium font-sans">Lessons</div>
                    <div className="text-2xl font-bold text-gray-900 font-sans">{completedLessons}/{totalLessons || 0}</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
                    <Trophy className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-sm text-gray-500 font-medium font-sans">EcoPoints</div>
                    <div className="text-2xl font-bold text-gray-900 font-sans">{totalPoints}</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                    <Target className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-sm text-gray-500 font-medium font-sans">Streak</div>
                    <div className="text-2xl font-bold text-gray-900 font-sans">{currentStreak} days</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 font-medium font-sans">Total Progress</span>
                    <span className="text-sm font-bold text-primary-600 font-sans">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-primary-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LearningProgress;
