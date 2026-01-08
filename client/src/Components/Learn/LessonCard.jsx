import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Video, FileText, CheckCircle, Clock, Play } from 'lucide-react';

const LessonCard = ({ lesson }) => {
    const {
        _id,
        title,
        type,
        duration,
        status = 'not_started', // not_started, in_progress, completed
        module,
        video
    } = lesson;

    const typeIcons = {
        text: FileText,
        video: Video,
        interactive: BookOpen,
        quiz: CheckCircle
    };

    const Icon = typeIcons[type] || BookOpen;

    const statusColors = {
        completed: 'text-green-600 bg-green-100',
        in_progress: 'text-blue-600 bg-blue-100',
        not_started: 'text-gray-400 bg-gray-100'
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            {/* Thumbnail Header for Videos */}
            {type === 'video' && (
                <div className="relative aspect-video overflow-hidden">
                    <img
                        src={video?.thumbnail || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600'}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300">
                            <Play size={24} fill="currentColor" />
                        </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-bold">
                        {duration} MIN
                    </div>
                </div>
            )}

            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-xl scale-90 -ml-1 ${statusColors[status] || statusColors.not_started}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {status === 'completed' && (
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-green-600 tracking-widest bg-green-50 px-2 py-1 rounded-full border border-green-100">
                            <CheckCircle size={12} />
                            Done
                        </div>
                    )}
                </div>

                <h3 className="font-black text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2 text-lg leading-tight">
                    {title}
                </h3>

                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-4">
                    {module?.title || 'GENERAL MODULE'}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            <Clock size={12} />
                            {duration}M
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md uppercase">
                            <Icon size={12} />
                            {type}
                        </div>
                    </div>

                    <Link
                        to={`/lesson/${_id}`}
                        className="text-primary-600"
                    >
                        <Play size={20} className="hover:scale-125 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LessonCard;

