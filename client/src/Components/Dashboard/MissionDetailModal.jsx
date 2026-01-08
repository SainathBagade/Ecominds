import React from 'react';
import { X, Target, Award, Clock, Lightbulb, CheckCircle, Info } from 'lucide-react';

const MissionDetailModal = ({ isOpen, onClose, mission, onAction }) => {
    if (!isOpen || !mission) return null;

    const {
        title,
        description,
        type,
        target,
        reward = { xp: 0, coins: 0 },
        status = 'active',
        requiresProof = false,
        progress = 0
    } = mission;

    const getGuide = (type) => {
        switch (type) {
            case 'complete_lessons':
                return "Head over to the 'Learn' tab and finish any lesson and its accompanying content.";
            case 'earn_xp':
                return "You can earn XP by completing lessons, taking quizzes, or participating in challenges. Any activity that awards points counts!";
            case 'perfect_score':
                return "Take any quiz in the 'Quizzes' section and make sure to get every question right (100%). Study the material first!";
            case 'streak_maintain':
                return "Just log in and complete at least one activity every day to keep your streak alive!";
            default:
                return "Follow the mission description to contribute to the environment and earn rewards!";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-br from-primary-600 to-primary-800 p-6 flex items-end">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4 text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30">
                            <Target size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{title}</h2>
                            <p className="text-primary-100 flex items-center gap-1">
                                <Clock size={14} />
                                Expires at midnight
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Description */}
                    <div>
                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Description</h4>
                        <p className="text-gray-700 leading-relaxed">{description || "No specific description provided."}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Rewards</div>
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-yellow-500" />
                                <span className="font-bold text-gray-900">{reward.xp} XP / {reward.coins} Coins</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Progress</div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-600 transition-all duration-500"
                                        style={{ width: `${Math.min((progress / target) * 100, 100)}%` }}
                                    />
                                </div>
                                <span className="font-bold text-gray-900 text-sm">{progress}/{target}</span>
                            </div>
                        </div>
                    </div>

                    {/* How to Complete (Guide) - Only show if not completed */}
                    {status !== 'completed' && (
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                            <h4 className="text-blue-900 font-bold flex items-center gap-2 mb-2">
                                <Lightbulb className="w-5 h-5 text-blue-600" />
                                How to Complete
                            </h4>
                            <p className="text-blue-800/80 text-sm leading-relaxed">
                                {getGuide(type)}
                            </p>
                        </div>
                    )}

                    {/* Submission Details */}
                    {mission.proof && mission.proof.url && (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h4 className="text-gray-900 font-bold flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-primary-600" />
                                Your Submission
                            </h4>
                            <div className="space-y-4">
                                <img
                                    src={mission.proof.url.startsWith('http') ? mission.proof.url : `http://localhost:5000${mission.proof.url}`}
                                    alt="Submission"
                                    className="w-full h-48 object-cover rounded-xl border border-gray-200"
                                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'}
                                />
                                {mission.proof.description && (
                                    <p className="text-sm text-gray-600 italic">"{mission.proof.description}"</p>
                                )}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400">Score: {mission.proof.verificationScore}/100</span>
                                    <span className={`font-bold ${mission.proof.verificationStatus === 'approved' ? 'text-green-600' :
                                            mission.proof.verificationStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                                        }`}>
                                        {mission.proof.verificationStatus?.toUpperCase().replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4">
                        {status === 'completed' ? (
                            <div className="w-full py-4 bg-green-50 text-green-600 font-bold rounded-xl flex items-center justify-center gap-2 border border-green-100">
                                <CheckCircle className="w-6 h-6" />
                                Mission Completed!
                            </div>
                        ) : status === 'pending' ? (
                            <div className="space-y-3">
                                <div className="w-full py-4 bg-yellow-50 text-yellow-600 font-bold rounded-xl flex items-center justify-center gap-2 border border-yellow-100">
                                    <Clock className="w-6 h-6" />
                                    Awaiting Review
                                </div>
                                <p className="text-xs text-center text-gray-500">
                                    Our instructors are reviewing your proof. You'll get your rewards once approved!
                                </p>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    onAction(mission);
                                    onClose();
                                }}
                                className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
                            >
                                {requiresProof ? (
                                    <>
                                        Upload Proof to Finish
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                ) : (
                                    <>
                                        Mark as Completed
                                        <CheckCircle className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="bg-gray-50 p-4 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-1">
                        <Info size={10} />
                        Complete all missions for a +50 bonus
                    </p>
                </div>
            </div>
        </div>
    );
};

const ArrowRight = ({ size = 20, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);

export default MissionDetailModal;
