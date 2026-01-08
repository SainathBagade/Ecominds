import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, Video, CheckCircle, ArrowRight, Play } from 'lucide-react';
import VideoPlayer from '@components/Learn/VideoPlayer';
import Loader from '@components/Common/Loader';
import api from '@services/api';
import toast from 'react-hot-toast';

import { useAuth } from '@hooks/useAuth';
import { ProgressContext } from '@context/ProgressContext';

const LessonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchUser } = useAuth();
    const { refreshProgress } = useContext(ProgressContext);
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [quizId, setQuizId] = useState(null);

    useEffect(() => {
        fetchLesson();
    }, [id]);

    const fetchLesson = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/lessons/${id}`);
            // Backend returns lesson directly or { success, data }
            const data = response.data.data || response.data;
            setLesson(data);
            if (data.status === 'completed' || data.completed) {
                setCompleted(true);
            }

            // Fetch associated quiz
            try {
                const quizRes = await api.get(`/quizzes/lesson/${id}`);
                if (quizRes.data && quizRes.data.length > 0) {
                    setQuizId(quizRes.data[0]._id);
                }
            } catch (err) {
                console.error('Error fetching quiz for lesson:', err);
            }
        } catch (error) {
            toast.error('Failed to load lesson');
            console.error(error);
            navigate('/learn');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (completed) return;
        try {
            await api.post(`/lessons/${id}/complete`);
            setCompleted(true);
            await fetchUser();
            if (refreshProgress) refreshProgress();
            toast.success('Lesson marked as completed! Points added.');
        } catch (error) {
            console.error('Error completing lesson:', error);
            // Even if it fails, show as completed on UI for better UX
            setCompleted(true);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
    if (!lesson) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Navigation */}
            <div className="bg-white border-b sticky top-16 z-30">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/learn')}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-medium"
                    >
                        <ArrowLeft size={20} />
                        Back to Learn
                    </button>
                    <div className="flex items-center gap-4">
                        {completed ? (
                            <span className="flex items-center gap-1.5 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full border border-green-100">
                                <CheckCircle size={18} />
                                Done
                            </span>
                        ) : (
                            <button
                                onClick={handleComplete}
                                className="btn btn-primary px-6"
                            >
                                Mark as Complete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Lesson Title & Info */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-widest mb-3">
                        {lesson.module?.subject?.name || 'ENVIRONMENT'} • {lesson.module?.title || 'MODULE'}
                    </div>
                    <h1 className="text-4xl font-display font-black text-gray-900 mb-4">{lesson.title}</h1>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            {lesson.duration} mins
                        </div>
                        <div className="flex items-center gap-2">
                            {lesson.type === 'video' ? <Video size={16} /> : <BookOpen size={16} />}
                            <span className="capitalize">{lesson.type}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Video Section */}
                        {lesson.type === 'video' && lesson.video?.url && (
                            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                <VideoPlayer
                                    url={lesson.video.url}
                                    title={lesson.title}
                                    thumbnail={lesson.video.thumbnail}
                                    onProgress={handleComplete}
                                />
                            </div>
                        )}

                        {/* Text Content */}
                        <div className="card bg-white p-8 prose prose-lg max-w-none shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <BookOpen className="text-primary-500" />
                                Lesson Content
                            </h2>
                            <div
                                className="text-gray-700 leading-relaxed space-y-4"
                                dangerouslySetInnerHTML={{ __html: lesson.content }}
                            />
                        </div>

                        {/* Interactive Section / Next Steps */}
                        {quizId && (
                            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white shadow-xl shadow-primary-200">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">Ready to test your knowledge?</h3>
                                        <p className="text-primary-100">Take the quiz for this lesson to earn points and badges!</p>
                                    </div>
                                    <Link
                                        to={`/quiz/${quizId}`}
                                        className="bg-white text-primary-700 px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-primary-50 transition-all flex items-center gap-2 shadow-lg"
                                    >
                                        Start Quiz
                                        <ArrowRight size={20} />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="card bg-white p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">What you'll learn</h3>
                            <ul className="space-y-3">
                                {[
                                    'Core concepts of environmental science',
                                    'Real-world impacts and scenarios',
                                    'Practical steps for sustainability',
                                    'Interactive knowledge checks'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                        <div className="mt-1 w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Attachments */}
                        {lesson.attachments && lesson.attachments.length > 0 && (
                            <div className="card bg-white p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">Resources</h3>
                                <div className="space-y-3">
                                    {lesson.attachments.map((file, i) => (
                                        <a
                                            key={i}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-50 hover:border-primary-200 hover:bg-primary-50 transition-all group"
                                        >
                                            <div className="p-2 bg-gray-50 rounded group-hover:bg-white transition-colors">
                                                <Play size={16} className="text-primary-500" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="text-sm font-semibold truncate text-gray-800">{file.name}</div>
                                                <div className="text-xs text-gray-400 capitalize">{file.type}</div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonDetail;
