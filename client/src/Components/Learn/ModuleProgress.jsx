import React from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';

const ModuleProgress = ({ modules = [] }) => {
    if (!modules || modules.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="text-primary-600" size={24} />
                Module Mastery
            </h3>
            <div className="space-y-6">
                {modules.map((module, index) => {
                    const percentage = module.progress || 0;
                    const isCompleted = percentage === 100;

                    return (
                        <div key={index}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-gray-700">{module.title}</span>
                                {isCompleted ? (
                                    <CheckCircle size={16} className="text-green-500" />
                                ) : (
                                    <span className="text-xs font-bold text-gray-500">{percentage}%</span>
                                )}
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-primary-500'}`}
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

export default ModuleProgress;
