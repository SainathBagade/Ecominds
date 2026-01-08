import React from 'react';
import { Flame } from 'lucide-react';

const StreakCounter = ({ count = 0 }) => {
    return (
        <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 transition-transform hover:scale-105">
            <Flame className="text-orange-600 fill-orange-600" size={20} />
            <div className="flex flex-col -space-y-1">
                <span className="text-lg font-black text-orange-700">{count}</span>
                <span className="text-[10px] uppercase font-black text-orange-600 tracking-wider">Streak</span>
            </div>
        </div>
    );
};

export default StreakCounter;
