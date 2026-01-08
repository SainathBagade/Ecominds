import React from 'react';

const StatsCard = ({ icon: Icon, label, value, description, color = 'blue', trend }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-bold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </div>
                )}
            </div>
            <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {label}
                </h3>
                <p className="text-3xl font-black text-gray-900 mt-1">
                    {value}
                </p>
                {description && (
                    <p className="text-sm text-gray-500 mt-2">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
