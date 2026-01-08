import React from 'react';
import { Clock, Book, Trophy, Zap } from 'lucide-react';

const RecentActivity = ({ activities = [] }) => {
    if (!activities || activities.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No activity recorded yet.</p>
                </div>
            </div>
        );
    }

    const getIcon = (type) => {
        switch (type) {
            case 'lesson': return { icon: Book, color: 'text-blue-600', bg: 'bg-blue-50' };
            case 'quiz': return { icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' };
            case 'badge': return { icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' };
            default: return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50' };
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-6">
                {activities.map((activity, index) => {
                    const { icon: Icon, color, bg } = getIcon(activity.type);
                    return (
                        <div key={index} className="flex gap-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${bg} flex items-center justify-center ${color}`}>
                                <Icon size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-bold text-gray-900">{activity.title}</h4>
                                    <span className="text-[10px] text-gray-400 font-medium uppercase">{activity.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                                {activity.points && (
                                    <span className="inline-block mt-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                        +{activity.points} EcoPoints
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecentActivity;
