import React from 'react';
import { BookOpen, Trophy, Target } from 'lucide-react';

const OverallProgress = ({ stats = {} }) => {
    const {
        lessonsCompleted = 0,
        totalLessons = 10,
        quizScore = 0,
        assignmentsDone = 0
    } = stats;

    const cards = [
        {
            label: 'Lessons',
            value: lessonsCompleted,
            total: totalLessons,
            icon: BookOpen,
            color: 'blue'
        },
        {
            label: 'Avg. Quiz Score',
            value: quizScore,
            total: 100,
            suffix: '%',
            icon: Trophy,
            color: 'yellow'
        },
        {
            label: 'Challenges',
            value: assignmentsDone,
            total: 5,
            icon: Target,
            color: 'green'
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Learning Progress</h3>
            <div className="space-y-6">
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    const percentage = Math.min(Math.round((card.value / card.total) * 100), 100);

                    return (
                        <div key={index}>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-${card.color}-50 text-${card.color}-600`}>
                                        <Icon size={18} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{card.label}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">
                                    {card.value}{card.suffix || ''} {card.total ? `/ ${card.total}` : ''}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-${card.color}-500 rounded-full transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OverallProgress;
