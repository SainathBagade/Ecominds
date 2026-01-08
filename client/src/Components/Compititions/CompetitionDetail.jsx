import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@services/api';
import Loader from '@components/Common/Loader';
import { Calendar, Clock, Trophy, Target, AlertCircle, ChevronLeft } from 'lucide-react';
import Round1Quiz from './Round1Quiz';
import Round2Puzzle from './Round2Puzzle';
import Round3Scenario from './Round3Scenario';
import CompetitionResult from './CompetitionResult';

const CompetitionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [competition, setCompetition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentRound, setCurrentRound] = useState(1);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        fetchCompetition();
    }, [id]);

    const fetchCompetition = async () => {
        try {
            const response = await api.get(`/competitions/${id}`);
            setCompetition(response.data.data);
            // Determine user status/round logic here later
        } catch (error) {
            console.error('Error fetching competition:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader /></div>;
    if (!competition) return <div className="text-center p-10">Competition not found</div>;

    const renderRound = () => {
        if (completed) return <CompetitionResult competition={competition} />;

        switch (currentRound) {
            case 1: return <Round1Quiz onComplete={() => setCurrentRound(2)} />;
            case 2: return <Round2Puzzle onComplete={() => setCurrentRound(3)} />;
            case 3: return <Round3Scenario onComplete={() => setCompleted(true)} />;
            default: return <Round1Quiz onComplete={() => setCurrentRound(2)} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <button onClick={() => navigate('/competitions')} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Competitions
                    </button>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-full md:w-1/3 rounded-2xl overflow-hidden shadow-lg">
                            <img
                                src={competition.image ? `${process.env.REACT_APP_API_URL.replace('/api', '')}/${competition.image}` : (competition.thumbnail || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800")}
                                alt={competition.title}
                                className="w-full h-48 md:h-64 object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                    {competition.type}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${competition.status === 'in_progress' ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {competition.status.replace('_', ' ')}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{competition.title}</h1>
                            <p className="text-gray-600 mb-6 leading-relaxed bg-white/50">{competition.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Event Start</div>
                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary-500" />
                                        {new Date(competition.startDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Event End</div>
                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-orange-500" />
                                        {new Date(competition.endDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Format</div>
                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-purple-500" />
                                        {competition.format.replace('_', ' ')}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Prize Pool</div>
                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-yellow-500" />
                                        {competition.prizes?.first?.xp || 0} XP
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {competition.status === 'registration' ? (
                    <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Event hasn't started yet</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">This competition is currently in registration phase. The battle arena will open on {new Date(competition.startDate).toLocaleDateString()}.</p>
                        <div className="flex justify-center gap-4 text-sm font-medium text-gray-400">
                            <span>Get Ready!</span>
                            <span>•</span>
                            <span>Prepare your team</span>
                            <span>•</span>
                            <span>Review rules</span>
                        </div>
                    </div>
                ) : (
                    renderRound()
                )}
            </div>
        </div>
    );
};

export default CompetitionDetail;
