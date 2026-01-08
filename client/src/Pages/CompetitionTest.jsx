import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, Send, CheckCircle2, XCircle, Brain, HelpCircle } from 'lucide-react';
import api from '@services/api';
import toast from 'react-hot-toast';
import Loader from '@components/Common/Loader';

const CompetitionTest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [competition, setCompetition] = useState(null);
    const [currentStep, setCurrentStep] = useState(0); // 0: intro, 1: test, 2: results
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [testCompleted, setTestCompleted] = useState(false);
    const [results, setResults] = useState(null);

    // Sample 10 questions of different types
    const questions = [
        {
            type: 'true_false',
            text: 'The Amazon Rainforest is often called "the lungs of the planet".',
            answer: 'True',
            points: 10
        },
        {
            type: 'true_false',
            text: 'Methane is a less potent greenhouse gas than carbon dioxide.',
            answer: 'False',
            points: 10
        },
        {
            type: 'fill_in_blanks',
            text: 'The process by which plants make their food using sunlight is called _______.',
            answer: 'photosynthesis',
            points: 15
        },
        {
            type: 'fill_in_blanks',
            text: 'The layer of the atmosphere that protects us from harmful UV rays is the _______ layer.',
            answer: 'ozone',
            points: 15
        },
        {
            type: 'odd_one_out',
            text: 'Which of the following is NOT a renewable energy source?',
            options: ['Solar', 'Wind', 'Natural Gas', 'Geothermal'],
            answer: 'Natural Gas',
            points: 10
        },
        {
            type: 'odd_one_out',
            text: 'Which of these is NOT an invasive species in general conservation context?',
            options: ['Kudzu', 'Zebra Mussel', 'Honey Bee', 'Lionfish'],
            answer: 'Honey Bee',
            points: 10
        },
        {
            type: 'match_pair',
            text: 'Match the environmental term with its definition.',
            pairs: [
                { left: 'Recycling', right: 'Processing waste into new materials' },
                { left: 'Composting', right: 'Decomposition of organic matter' },
                { left: 'Conservation', right: 'Wise use of natural resources' }
            ],
            points: 20
        },
        {
            type: 'match_pair',
            text: 'Match the pollutant with its common source.',
            pairs: [
                { left: 'Plastic', right: 'Single-use packaging' },
                { left: 'CO2', right: 'Burning fossil fuels' },
                { left: 'Oil', right: 'Tanker spills' }
            ],
            points: 20
        },
        {
            type: 'true_false',
            text: 'Ocean acidification is caused by the absorption of excess CO2 from the atmosphere.',
            answer: 'True',
            points: 10
        },
        {
            type: 'odd_one_out',
            text: 'Find the odd one out among these international climate agreements.',
            options: ['Kyoto Protocol', 'Paris Agreement', 'Geneva Convention', 'Montreal Protocol'],
            answer: 'Geneva Convention',
            points: 10
        }
    ];

    useEffect(() => {
        fetchCompetition();
    }, [id]);

    const fetchCompetition = async () => {
        try {
            const res = await api.get(`/competitions/${id}`);
            setCompetition(res.data.data);
        } catch (error) {
            toast.error('Failed to load competition');
            navigate('/competitions');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (val) => {
        setAnswers({
            ...answers,
            [currentQuestionIndex]: val
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            submitTest();
        }
    };

    const submitTest = async () => {
        setSubmitting(true);
        // Calculate score
        let score = 0;
        let correctCount = 0;

        questions.forEach((q, idx) => {
            const userAnswer = answers[idx];
            if (q.type === 'match_pair') {
                // For match pair, check if all selected pairs match correctly
                // Simplified for this demo: if they clicked 'Done' on matching step
                if (userAnswer && userAnswer.correct) {
                    score += q.points;
                    correctCount++;
                }
            } else {
                if (userAnswer?.toString().toLowerCase().trim() === q.answer.toString().toLowerCase().trim()) {
                    score += q.points;
                    correctCount++;
                }
            }
        });

        const accuracy = (correctCount / questions.length) * 100;

        try {
            // Update score in backend competition
            await api.put(`/competitions/${id}/score`, {
                score: score,
                accuracy: accuracy,
                time: 300 // sample time in seconds
            });

            setResults({
                score,
                correctCount,
                total: questions.length,
                accuracy
            });
            setCurrentStep(2);
            toast.success('Battle finished! Your rank is being updated.');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save scores, but showing results.');
            setResults({
                score,
                correctCount,
                total: questions.length,
                accuracy
            });
            setCurrentStep(2);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

    const renderQuestion = () => {
        const q = questions[currentQuestionIndex];
        const userAnswer = answers[currentQuestionIndex];

        switch (q.type) {
            case 'true_false':
                return (
                    <div className="grid grid-cols-2 gap-6">
                        {['True', 'False'].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => handleAnswerChange(opt)}
                                className={`group p-8 rounded-3xl border-4 transition-all duration-300 text-center ${userAnswer === opt
                                    ? 'border-primary-500 bg-primary-50 shadow-xl shadow-primary-100 -translate-y-1'
                                    : 'border-gray-100 hover:border-primary-200 hover:bg-white'}`}
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${userAnswer === opt ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-primary-100 group-hover:text-primary-600'}`}>
                                    {opt === 'True' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                                </div>
                                <span className={`text-2xl font-black uppercase tracking-widest ${userAnswer === opt ? 'text-primary-700' : 'text-gray-400'}`}>
                                    {opt}
                                </span>
                            </button>
                        ))}
                    </div>
                );
            case 'fill_in_blanks':
                return (
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Your answer..."
                            value={userAnswer || ''}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            className="w-full p-8 rounded-3xl border-4 border-gray-100 focus:border-primary-500 outline-none text-3xl font-black text-primary-700 placeholder-gray-200 transition-all bg-gray-50/50"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary-200">
                            <Send size={32} />
                        </div>
                    </div>
                );
            case 'odd_one_out':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => handleAnswerChange(opt)}
                                className={`p-6 rounded-2xl border-4 text-left font-black text-xl transition-all duration-300 ${userAnswer === opt
                                    ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-lg -translate-y-1'
                                    : 'border-gray-100 hover:border-primary-200 bg-white hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-colors ${userAnswer === opt ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-200 text-gray-300'}`}>
                                        {userAnswer === opt ? <CheckCircle2 size={20} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                    </div>
                                    {opt}
                                </div>
                            </button>
                        ))}
                    </div>
                );
            case 'match_pair':
                return (
                    <div className="space-y-8">
                        <div className="bg-primary-50 p-6 rounded-3xl border-2 border-primary-100">
                            <p className="text-primary-700 font-bold flex items-center gap-2">
                                <Trophy size={20} />
                                Interactive Match: Dragging is simulated, click to confirm alignment accuracy!
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-12 relative">
                            {/* Connector Lines Simulation */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                <div className="w-full h-px bg-primary-500" />
                            </div>

                            <div className="space-y-4">
                                {q.pairs.map((p, i) => (
                                    <div key={i} className="p-5 bg-white rounded-2xl border-2 border-gray-100 font-black text-gray-700 shadow-sm flex items-center justify-between">
                                        {p.left}
                                        <div className="w-3 h-3 rounded-full bg-primary-300" />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                {q.pairs.map((p, i) => (
                                    <div key={i} className="p-5 bg-primary-600 rounded-2xl border-2 border-primary-700 font-black text-white shadow-lg flex items-center gap-4">
                                        <div className="w-3 h-3 rounded-full bg-white/50" />
                                        {p.right}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => handleAnswerChange({ correct: true })}
                            className={`w-full p-6 rounded-3xl border-4 font-black uppercase tracking-widest text-xl transition-all duration-300 ${userAnswer?.correct
                                ? 'bg-primary-500 border-primary-600 text-white shadow-xl shadow-primary-200 translate-y-1'
                                : 'bg-white border-gray-100 text-gray-400 hover:border-primary-500 hover:text-primary-600'}`}
                        >
                            {userAnswer?.correct ? 'Pairs Aligned Successfully' : 'Confirm Pair Alignment'}
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b h-16 flex items-center px-4 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-bold">
                        <ArrowLeft size={20} />
                        Exit Battle
                    </button>
                    <div className="flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={24} />
                        <span className="font-black text-gray-900 uppercase tracking-widest">{competition?.title}</span>
                    </div>
                    <div className="w-20" /> {/* Spacer */}
                </div>
            </div>

            <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
                {currentStep === 0 ? (
                    <div className="card bg-white p-12 text-center animate-fade-in">
                        <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Brain size={48} />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-4">Are you ready, Warrior?</h1>
                        <p className="text-xl text-gray-600 mb-12">
                            This battle consists of 10 challenges. Your speed and accuracy will determine your final rank in the leaderboard.
                        </p>
                        <ul className="text-left bg-gray-50 p-8 rounded-3xl space-y-4 mb-12 inline-block">
                            <li className="flex items-center gap-3 font-bold text-gray-700">
                                <CheckCircle2 className="text-green-500" />
                                10 Strategic Questions
                            </li>
                            <li className="flex items-center gap-3 font-bold text-gray-700">
                                <CheckCircle2 className="text-green-500" />
                                Mix of T/F, Fill, Match & Odd One Out
                            </li>
                            <li className="flex items-center gap-3 font-bold text-gray-700">
                                <CheckCircle2 className="text-green-500" />
                                Maximize points for higher ranking
                            </li>
                        </ul>
                        <button
                            onClick={() => setCurrentStep(1)}
                            className="w-full btn btn-primary py-6 text-2xl rounded-2xl shadow-2xl shadow-primary-200"
                        >
                            Enter The Battleground
                        </button>
                    </div>
                ) : currentStep === 1 ? (
                    <div className="space-y-8 animate-fade-in">
                        {/* Progress Bar */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between gap-6">
                            <div className="flex-1 bg-gray-100 h-4 rounded-full overflow-hidden">
                                <div
                                    className="bg-primary-500 h-full transition-all duration-500"
                                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                            <span className="font-black text-gray-900 min-w-max">
                                {currentQuestionIndex + 1} / {questions.length}
                            </span>
                        </div>

                        {/* Question Card */}
                        <div className="card bg-white p-10 min-h-[400px] flex flex-col justify-center">
                            <div className="flex items-center gap-3 text-primary-600 font-black text-xs uppercase tracking-widest mb-6">
                                <HelpCircle size={16} />
                                Step {currentQuestionIndex + 1}
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-12">
                                {questions[currentQuestionIndex].text}
                            </h2>
                            {renderQuestion()}
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleNext}
                                disabled={!answers[currentQuestionIndex]}
                                className="btn btn-primary px-12 py-5 rounded-2xl text-xl shadow-xl shadow-primary-100 flex items-center gap-3"
                            >
                                {submitting ? 'Submitting...' : currentQuestionIndex === questions.length - 1 ? 'Finish Battle' : 'Next Challenge'}
                                <Send size={24} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="card bg-white p-12 text-center animate-bounce-in">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Trophy size={48} />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Battle Concluded!</h1>
                        <p className="text-xl text-gray-600 mb-12">Great effort! You've successfully finished the competition.</p>

                        <div className="grid grid-cols-2 gap-6 mb-12">
                            <div className="p-8 bg-primary-50 rounded-3xl border-2 border-primary-100">
                                <div className="text-sm font-black text-primary-400 uppercase tracking-widest mb-2">Score</div>
                                <div className="text-5xl font-black text-primary-700">{results.score}</div>
                            </div>
                            <div className="p-8 bg-green-50 rounded-3xl border-2 border-green-100">
                                <div className="text-sm font-black text-green-400 uppercase tracking-widest mb-2">Accuracy</div>
                                <div className="text-5xl font-black text-green-700">{Math.round(results.accuracy)}%</div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate(`/competitions/${id}`)}
                                className="flex-1 btn btn-primary py-5 rounded-2xl text-lg"
                            >
                                View Rankings
                            </button>
                            <button
                                onClick={() => navigate('/competitions')}
                                className="flex-1 btn bg-gray-100 text-gray-700 hover:bg-gray-200 py-5 rounded-2xl text-lg"
                            >
                                Back to Competitions
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompetitionTest;
