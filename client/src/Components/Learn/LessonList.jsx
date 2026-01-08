import React from 'react';
import LessonCard from './LessonCard';
import { BookOpen } from 'lucide-react';

const LessonList = ({ lessons, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-gray-200 h-64 rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (!lessons || lessons.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">No lessons found</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2">
                    We couldn't find any lessons matching your filters. Try adjusting them or check back later!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
                <LessonCard key={lesson._id} lesson={lesson} />
            ))}
        </div>
    );
};

export default LessonList;
