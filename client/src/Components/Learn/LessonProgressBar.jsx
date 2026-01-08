import React from 'react';

const LessonProgressBar = ({ current, total }) => {
    const percentage = Math.min(Math.round((current / total) * 100), 100);

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span>Course Progress</span>
                <span className="text-primary-600">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200">
                <div
                    className="bg-primary-600 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default LessonProgressBar;
