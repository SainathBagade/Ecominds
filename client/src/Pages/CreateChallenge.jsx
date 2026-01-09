import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Trophy, Clock, ArrowLeft, Send, Sparkles, AlertCircle } from 'lucide-react';
import api from '@services/api';
import toast from 'react-hot-toast';

const CreateChallenge = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'weekly',
        difficulty: 'medium',
        category: 'mastery',
        requirements: {
            type: 'complete_lessons',
            target: 1,
            timeLimit: 0
        },
        rewards: {
            xp: 100,
            coins: 50
        },
        isActive: true,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/challenges', formData);
            toast.success('Assignment created and broadcasted to class!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error creating challenge:', error);
            toast.error(error.response?.data?.message || 'Neural Link Error: Failed to create assignment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] py-12 pb-24">
            <div className="max-w-4xl mx-auto px-6">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-primary-600 transition-colors mb-8"
                >
                    <ArrowLeft size={16} />
                    Return to Hub
                </button>

                {/* Header */}
                <div className="mb-12 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Neural Deployment</span>
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight">
                        Create <span className="text-primary-600">Assignment</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg mt-2">
                        Initialize a new learning protocol for your students.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
                    {/* Basic Info */}
                    <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                            <Sparkles className="text-primary-600" size={24} />
                            Protocol Parameters
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Assignment Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Operation Green Canopy"
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-primary-500 transition-all shadow-inner"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Mission Objectives</label>
                                <textarea
                                    name="description"
                                    required
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the tasks and environmental impact..."
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 font-medium focus:ring-2 focus:ring-primary-500 transition-all shadow-inner resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Deployment Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-primary-500 transition-all shadow-inner"
                                    >
                                        <option value="daily">Daily Pulse</option>
                                        <option value="weekly">Weekly Campaign</option>
                                        <option value="special">Special Operation</option>
                                        <option value="community">Community Outreach</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Difficulty Level</label>
                                    <select
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-primary-500 transition-all shadow-inner"
                                    >
                                        <option value="easy">Easy (Recruit)</option>
                                        <option value="medium">Medium (Specialist)</option>
                                        <option value="hard">Hard (Elite)</option>
                                        <option value="expert">Expert (Titan)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requirements & Rewards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                                <Target className="text-primary-600" size={24} />
                                Target Metrics
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Metric Type</label>
                                    <select
                                        name="requirements.type"
                                        value={formData.requirements.type}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                                    >
                                        <option value="complete_lessons">Lessons Completed</option>
                                        <option value="earn_xp">XP Earned</option>
                                        <option value="perfect_scores">Perfect Quiz Scores</option>
                                        <option value="streak">Study Streak</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Target Value</label>
                                    <input
                                        type="number"
                                        name="requirements.target"
                                        value={formData.requirements.target}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                                <Trophy className="text-primary-600" size={24} />
                                Intel Rewards
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">XP Bonus</label>
                                    <input
                                        type="number"
                                        name="rewards.xp"
                                        value={formData.rewards.xp}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Neural Coins</label>
                                    <input
                                        type="number"
                                        name="rewards.coins"
                                        value={formData.rewards.coins}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Deadline */}
                    <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-rose-50 rounded-2xl text-rose-600">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">Assignment Expiration</h4>
                                <p className="text-sm text-gray-400 font-medium tracking-tight uppercase tracking-widest">Protocol ends on this orbit</p>
                            </div>
                        </div>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="bg-gray-50 border-none rounded-2xl px-8 py-4 text-gray-900 font-black focus:ring-2 focus:ring-primary-500 uppercase tracking-widest text-xs"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex items-center gap-3 bg-gray-900 text-white px-12 py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-gray-400 hover:bg-primary-600 hover:shadow-primary-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            )}
                            Initialize Protocol
                        </button>
                    </div>
                </form>

                {/* Warning Footer */}
                <div className="mt-12 flex items-center gap-4 bg-amber-50 rounded-3xl p-6 border border-amber-100">
                    <AlertCircle className="text-amber-500 shrink-0" size={24} />
                    <p className="text-xs text-amber-800 font-bold uppercase tracking-widest leading-loose">
                        Assignments are broadcasted to all students in your judicial circuit. Protocol cannot be terminated once initialized.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreateChallenge;
