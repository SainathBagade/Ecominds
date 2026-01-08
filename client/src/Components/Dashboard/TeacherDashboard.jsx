import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { Users, FileCheck, Award, ArrowRight, Clock, Target, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@services/api';
import toast from 'react-hot-toast';
import Loader from '@components/Common/Loader';

const StatCard = ({ icon: Icon, label, value, color, link, linkText }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between transition-all hover:shadow-md">
        <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-2xl ${color} shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-gray-400 font-black uppercase tracking-widest">{label}</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
            </div>
        </div>
        {link && (
            <Link to={link} className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all">
                <ArrowRight className="w-5 h-5" />
            </Link>
        )}
    </div>
);

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalStudents: 0,
        pending: 0,
        totalPoints: 0
    });
    const [pendingProofs, setPendingProofs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showChallengeForm, setShowChallengeForm] = useState(false);
    const [challengeForm, setChallengeForm] = useState({
        title: '',
        description: '',
        type: 'weekly',
        difficulty: 'medium',
        category: 'speed',
        requirementType: 'complete_lessons',
        target: 1,
        xpReward: 100,
        coinsReward: 50,
        endDate: ''
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, proofsRes] = await Promise.all([
                api.get('/submissions/proofs/stats'),
                api.get('/submissions/proofs', { params: { status: 'pending' } })
            ]);

            setStats(statsRes.data.stats);
            setPendingProofs(proofsRes.data.proofs.slice(0, 5)); // Only show top 5 in dashboard
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChallenge = async (e) => {
        e.preventDefault();
        try {
            await api.post('/challenges', {
                title: challengeForm.title,
                description: challengeForm.description,
                type: challengeForm.type,
                difficulty: challengeForm.difficulty,
                category: challengeForm.category,
                requirements: {
                    type: challengeForm.requirementType,
                    target: parseInt(challengeForm.target)
                },
                rewards: {
                    xp: parseInt(challengeForm.xpReward),
                    coins: parseInt(challengeForm.coinsReward)
                },
                startDate: new Date(),
                endDate: new Date(challengeForm.endDate)
            });
            toast.success('Challenge created successfully!');
            setShowChallengeForm(false);
            setChallengeForm({
                title: '',
                description: '',
                type: 'weekly',
                difficulty: 'medium',
                category: 'speed',
                requirementType: 'complete_lessons',
                target: 1,
                xpReward: 100,
                coinsReward: 50,
                endDate: ''
            });
        } catch (error) {
            console.error('Error creating challenge:', error);
            toast.error(error.response?.data?.message || 'Failed to create challenge');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        {user?.subject || 'Eco'} <span className="text-primary-600">Hub</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg mt-1">
                        Welcome back, <span className="text-gray-900 font-bold">{user?.name}</span>. Your <span className="text-primary-600 font-black">{user?.subject}</span> class performance is optimal.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowChallengeForm(true)}
                        className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all flex items-center gap-2"
                    >
                        <Target className="w-5 h-5" />
                        Add Challenge
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    icon={Users}
                    label="Active Students"
                    value={stats.totalStudents}
                    color="bg-indigo-600"
                    link="/leaderboard"
                />
                <StatCard
                    icon={FileCheck}
                    label="Pending Reviews"
                    value={stats.pending}
                    color="bg-amber-500"
                    link="/proof-review"
                />
                <StatCard
                    icon={Award}
                    label="Class XP Points"
                    value={stats.totalPoints.toLocaleString()}
                    color="bg-emerald-600"
                />
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Reviews Preview */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-amber-500" />
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Recent Submissions</h2>
                        </div>
                        <Link to="/proof-review" className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline">
                            View All Review List
                        </Link>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {pendingProofs.length > 0 ? (
                            pendingProofs.map((proof) => (
                                <div key={proof._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all font-black">
                                            {proof.studentName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900">{proof.studentName}</p>
                                            <p className="text-sm text-gray-400 font-medium">Completed: <span className="text-gray-600">{proof.challengeTitle}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                            {new Date(proof.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <Link
                                            to="/proof-review"
                                            className="px-5 py-2 bg-primary-50 text-primary-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                                        >
                                            Review
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-20 text-center">
                                <FileCheck className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">All clear! No pending reviews.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Resources */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-6">Neural Protocol</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-black">01</span>
                                </div>
                                <p className="text-sm text-indigo-100 font-medium leading-relaxed">Ensure all proofs show physical evidence of eco-action.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-black">02</span>
                                </div>
                                <p className="text-sm text-indigo-100 font-medium leading-relaxed">Reward bonus coins for exceptional creativity or effort.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-black">03</span>
                                </div>
                                <p className="text-sm text-indigo-100 font-medium leading-relaxed">Assignments auto-expire after 7 orbital cycles.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-6">Global Leader</h3>
                        <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-amber-200">
                                1
                            </div>
                            <div>
                                <p className="font-black text-gray-900 italic">Sainath Bagade</p>
                                <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Master Eco Ranger</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Challenge Creation Modal */}
            {showChallengeForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Create New Challenge</h2>
                            <button onClick={() => setShowChallengeForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateChallenge} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Challenge Title</label>
                                <input
                                    type="text"
                                    required
                                    value={challengeForm.title}
                                    onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                                    placeholder="e.g., Plant 5 Trees Challenge"
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-primary-600"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Description</label>
                                <textarea
                                    required
                                    value={challengeForm.description}
                                    onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                                    placeholder="Describe what students need to do..."
                                    rows="3"
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-primary-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Type</label>
                                    <select
                                        value={challengeForm.type}
                                        onChange={(e) => setChallengeForm({ ...challengeForm, type: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-primary-600"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="special">Special</option>
                                        <option value="community">Community</option>
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Difficulty</label>
                                    <select
                                        value={challengeForm.difficulty}
                                        onChange={(e) => setChallengeForm({ ...challengeForm, difficulty: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-primary-600"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                        <option value="expert">Expert</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Category</label>
                                    <select
                                        value={challengeForm.category}
                                        onChange={(e) => setChallengeForm({ ...challengeForm, category: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-primary-600"
                                    >
                                        <option value="speed">Speed</option>
                                        <option value="accuracy">Accuracy</option>
                                        <option value="consistency">Consistency</option>
                                        <option value="mastery">Mastery</option>
                                        <option value="social">Social</option>
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Requirement Type</label>
                                    <select
                                        value={challengeForm.requirementType}
                                        onChange={(e) => setChallengeForm({ ...challengeForm, requirementType: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-primary-600"
                                    >
                                        <option value="complete_lessons">Complete Lessons</option>
                                        <option value="earn_xp">Earn XP</option>
                                        <option value="perfect_scores">Perfect Scores</option>
                                        <option value="streak">Maintain Streak</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Target (Number to Complete)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={challengeForm.target}
                                    onChange={(e) => setChallengeForm({ ...challengeForm, target: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-primary-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">XP Reward</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={challengeForm.xpReward}
                                        onChange={(e) => setChallengeForm({ ...challengeForm, xpReward: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-primary-600"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Coins Reward</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={challengeForm.coinsReward}
                                        onChange={(e) => setChallengeForm({ ...challengeForm, coinsReward: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-primary-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">End Date</label>
                                <input
                                    type="date"
                                    required
                                    value={challengeForm.endDate}
                                    onChange={(e) => setChallengeForm({ ...challengeForm, endDate: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-primary-600"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowChallengeForm(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
                                >
                                    Create Challenge
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;

