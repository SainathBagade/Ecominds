import React from 'react';
import { Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DailyMission = ({ mission }) => {
    if (!mission) {
        return (
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <Target size={180} />
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">No active mission</h3>
                    <p className="text-white/80 mb-4 max-w-md">
                        Check back later for new sustainability challenges and earn bonus points.
                    </p>
                    <Link
                        to="/missions"
                        className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-all shadow-md"
                    >
                        Go to Missions
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <Target size={180} />
            </div>
            <div className="relative z-10">
                <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                    Daily Mission
                </div>
                <h3 className="text-2xl font-bold mb-2">{mission.title}</h3>
                <p className="text-white/80 mb-6 max-w-lg line-clamp-2">
                    {mission.description}
                </p>
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Target size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] text-white/60 uppercase font-bold">Reward</div>
                            <div className="font-bold">{mission.reward?.xp || 0} XP</div>
                        </div>
                    </div>
                    <Link
                        to="/missions"
                        className="bg-white text-primary-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-xl flex items-center gap-2"
                    >
                        Complete Now
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DailyMission;
