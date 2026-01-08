import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Trophy, Users, Clock, Award, Target, ArrowLeft, Shield, CheckCircle2, Brain } from 'lucide-react';
import Loader from '@components/Common/Loader';
import api from '@services/api';
import toast from 'react-hot-toast';
import { useAuth } from '@hooks/useAuth';

const CompetitionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [competition, setCompetition] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [isRegistered, setIsRegistered] = useState(false);
    const [hasCompleted, setHasCompleted] = useState(false);
    const [userResult, setUserResult] = useState(null);

    useEffect(() => {
        fetchCompetition();
    }, [id]);

    const fetchCompetition = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/competitions/${id}`);
            const comp = response.data.data;
            setCompetition(comp);

            // Check registration and completion status
            if (user && comp.participants) {
                const currentUserId = (user._id || user.id)?.toString();
                const participant = comp.participants.find(p => {
                    const pUserId = (p.user?._id || p.user || p)?.toString();
                    return pUserId === currentUserId;
                });
                setIsRegistered(!!participant);
                setHasCompleted(participant?.completed || false);
                if (participant?.completed) {
                    setUserResult({
                        score: participant.score,
                        accuracy: participant.accuracy,
                        rank: participant.rank
                    });
                }
            }
        } catch (error) {
            toast.error('Failed to load competition');
            console.error(error);
            navigate('/competitions');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            await api.post(`/competitions/${id}/register`);
            toast.success('Joined competition!');
            fetchCompetition();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
    if (!competition) return null;

    const statusMap = {
        registration: { label: 'Registration Open', color: 'text-blue-600 bg-blue-50 border-blue-200' },
        in_progress: { label: 'Live Battle', color: 'text-green-600 bg-green-50 border-green-200' },
        completed: { label: 'Challenge Ended', color: 'text-gray-600 bg-gray-50 border-gray-200' }
    };

    const currentStatus = statusMap[competition.status] || statusMap.registration;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <button
                        onClick={() => navigate('/competitions')}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-8 font-medium"
                    >
                        <ArrowLeft size={20} />
                        Back to Competitions
                    </button>

                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        {/* Image & Status */}
                        <div className="w-full lg:w-1/3">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-square">
                                <img
                                    src={competition.thumbnail || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800"}
                                    className="w-full h-full object-cover"
                                    alt={competition.title}
                                />
                                <div className="absolute top-4 right-4">
                                    <span className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest border shadow-lg backdrop-blur-md ${currentStatus.color}`}>
                                        {currentStatus.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border border-primary-200">
                                    {competition.type}
                                </span>
                                <span className="flex items-center gap-1.5 text-orange-600 font-bold text-sm bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                                    <Shield size={16} />
                                    Verified Tournament
                                </span>
                            </div>

                            <h1 className="text-5xl font-display font-black text-gray-900 leading-tight">
                                {competition.title}
                            </h1>

                            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
                                {competition.description}
                            </p>

                            <div className="flex flex-wrap gap-8 pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">Participants</div>
                                        <div className="text-xl font-black text-gray-900">{competition.participants?.length || 0}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl border border-yellow-100">
                                        <Trophy size={24} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">Grand Prize</div>
                                        <div className="text-xl font-black text-gray-900">{competition.prizes?.first?.xp || 0} XP</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl border border-green-100">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">Ends In</div>
                                        <div className="text-xl font-black text-gray-900">
                                            {new Date(competition.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {(competition.status === 'registration' || competition.status === 'in_progress') && !isRegistered && (
                                <button
                                    onClick={handleJoin}
                                    className="btn btn-primary text-xl px-12 py-5 rounded-2xl shadow-xl shadow-primary-200 hover:scale-105 transition-transform"
                                >
                                    {competition.status === 'in_progress' ? 'Join & Enter Battle' : 'Join Competition Now'}
                                </button>
                            )}

                            {isRegistered && competition.status === 'registration' && (
                                <div className="flex items-center gap-2 text-primary-600 font-bold bg-primary-50 px-6 py-4 rounded-2xl border border-primary-100">
                                    <CheckCircle2 size={24} />
                                    Successfully Registered
                                </div>
                            )}

                            {competition.status === 'in_progress' && isRegistered && !hasCompleted && (
                                <div className="space-y-4">
                                    <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-3xl">
                                        <h3 className="text-xl font-bold text-yellow-800 mb-2 flex items-center gap-2">
                                            <Target className="text-yellow-600" />
                                            Battle Round is LIVE!
                                        </h3>
                                        <p className="text-yellow-700 mb-6">
                                            You are registered for this competition. Take the strategic test now to secure your rank on the leaderboard!
                                        </p>
                                        <button
                                            onClick={() => navigate(`/competitions/${id}/test`)}
                                            className="w-full btn bg-yellow-500 hover:bg-yellow-600 text-white text-xl py-5 rounded-2xl shadow-xl shadow-yellow-200 flex items-center justify-center gap-3 animate-pulse"
                                        >
                                            <Brain size={24} />
                                            Take Battle Test
                                        </button>
                                    </div>
                                </div>
                            )}

                            {hasCompleted && userResult && (
                                <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-green-100 animate-slide-up">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                            <Trophy size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-wider">Your Performance</h3>
                                            <p className="text-white/80 text-sm font-bold">Battle Results Logged</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl border border-white/20">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Total Score</div>
                                            <div className="text-3xl font-black">{userResult.score}</div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl border border-white/20">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Accuracy</div>
                                            <div className="text-3xl font-black">{Math.round(userResult.accuracy)}%</div>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex items-center gap-2 text-sm font-bold bg-black/10 p-3 rounded-xl justify-center">
                                        <CheckCircle2 size={16} />
                                        Final rank will be announced at the end of competition.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard Table Section - Only show for completed competitions */}
            {competition.status === 'completed' && (
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-display font-black text-gray-900 flex items-center gap-3">
                            <Trophy className="text-yellow-500" size={32} />
                            Final Standings
                        </h2>
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                            Official Results
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                    <th className="px-8 py-6">Rank</th>
                                    <th className="px-8 py-6">Student</th>
                                    <th className="px-8 py-6 text-center">Score</th>
                                    <th className="px-8 py-6 text-center">Prize</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {competition.leaderboard && competition.leaderboard.length > 0 ? (
                                    competition.leaderboard.map((entry, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm
                            ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                                'text-gray-400'}`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={entry.user?.avatar || `https://ui-avatars.com/api/?name=${entry.user?.name}&background=random`}
                                                        className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                                                        alt={entry.user?.name}
                                                    />
                                                    <span className="font-bold text-gray-800 text-lg group-hover:text-primary-600 transition-colors">
                                                        {entry.user?.name || 'Unknown Student'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="font-black text-2xl text-gray-900">{entry.score}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center">
                                                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border
                              ${index === 0 ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                        {entry.prize || 'Participant'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Users className="text-gray-200" size={64} />
                                                <div className="text-gray-400 font-bold">No results available yet</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompetitionDetail;
