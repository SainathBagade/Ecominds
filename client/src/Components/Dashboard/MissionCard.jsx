import React from 'react';
import { Target, CheckCircle, Clock, Award, Camera } from 'lucide-react';

const MissionCard = ({ mission, onClick, onAction }) => {
    const {
        _id,
        title,
        description,
        type,
        target, // e.g., 100 points, 2 lessons
        reward = { xp: 0, coins: 0 },
        status = 'active', // active, pending, completed
        requiresProof = false
    } = mission;

    const typeIcons = {
        complete_lessons: '📚',
        perfect_score: '📝',
        earn_xp: '⭐',
        streak_maintain: '🔥',
        complete_challenge: '🎯'
    };

    const getStatusDisplay = () => {
        switch (status) {
            case 'completed':
                return {
                    color: 'text-green-600 bg-green-100',
                    label: 'Completed',
                    icon: CheckCircle
                };
            case 'pending':
                return {
                    color: 'text-yellow-600 bg-yellow-100',
                    label: 'Pending Review',
                    icon: Clock
                };
            default:
                return {
                    color: 'text-blue-600 bg-blue-100',
                    label: 'In Progress',
                    icon: Target
                };
        }
    };

    const statusInfo = getStatusDisplay();
    const StatusIcon = statusInfo.icon;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="text-3xl group-hover:scale-110 transition-transform">{typeIcons[type] || '🎯'}</div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusInfo.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{title}</h3>
            <p className="text-sm text-gray-600 mb-6 line-clamp-2">{description}</p>

            {/* Rewards */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-sm font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">
                    <Award className="w-4 h-4" />
                    {reward.xp} XP
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                    <Target className="w-4 h-4" />
                    {reward.coins} Coins
                </div>
            </div>

            {/* Action */}
            {status === 'active' && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAction && onAction(mission);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary-600 text-white font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-100"
                >
                    {requiresProof ? (
                        <>
                            <Camera className="w-5 h-5" />
                            Upload Proof
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Mark Complete
                        </>
                    )}
                </button>
            )}

            {status === 'pending' && (
                <div className="w-full text-center py-2 rounded-lg bg-yellow-50 text-yellow-600 font-semibold border border-yellow-100">
                    Awaiting Review
                </div>
            )}

            {status === 'completed' && (
                <div className="w-full text-center py-2 rounded-lg bg-green-50 text-green-600 font-bold border border-green-100 flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Completed
                </div>
            )}
        </div>
    );
};

export default MissionCard;
