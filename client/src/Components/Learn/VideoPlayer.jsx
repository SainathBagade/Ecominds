import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize, PlayCircle, ShieldCheck } from 'lucide-react';

const VideoPlayer = ({ url, title, thumbnail, onProgress }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);
    const videoRef = useRef(null);
    const timerRef = useRef(null);
    const watchTimeRef = useRef(0);

    // Track time for internal video element
    useEffect(() => {
        if (isPlaying && !hasTriggered) {
            timerRef.current = setInterval(() => {
                watchTimeRef.current += 1;
                if (watchTimeRef.current >= 10 && !hasTriggered) {
                    setHasTriggered(true);
                    if (onProgress) onProgress(10);
                    clearInterval(timerRef.current);
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, hasTriggered, onProgress]);

    // YouTube tracking is harder with iframe, so we'll simulate it
    useEffect(() => {
        const isYouTube = url?.includes('youtube.com') || url?.includes('youtu.be');
        if (isYouTube && !hasTriggered) {
            const ytTimer = setTimeout(() => {
                setHasTriggered(true);
                if (onProgress) onProgress(10);
            }, 12000); // 12s to account for loading/buffer
            return () => clearTimeout(ytTimer);
        }
    }, [url, hasTriggered, onProgress]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const isYouTube = url?.includes('youtube.com') || url?.includes('youtu.be');

    const getEmbedUrl = (url) => {
        if (!url) return '';
        if (url.includes('embed')) return `${url}?autoplay=0&rel=0&modestbranding=1&showinfo=0`;
        const id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0&modestbranding=1&showinfo=0`;
    };

    if (!url) {
        return (
            <div className="aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white border-4 border-slate-800 p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent"></div>
                <PlayCircle size={80} className="text-slate-700 mb-6 relative z-10 animate-pulse" />
                <h3 className="text-2xl font-black mb-2 relative z-10 tracking-tight">Accessing Neural Archive...</h3>
                <p className="text-slate-500 max-w-sm relative z-10 font-medium">
                    The requested educational data stream is currently loading.
                </p>
            </div>
        );
    }

    return (
        <div className="relative group rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white dark:border-slate-800 transition-all duration-700 hover:shadow-primary-500/20">
            {/* Ambient Glow Effect */}
            <div className="absolute -inset-4 bg-primary-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

            <div className="relative aspect-video bg-black overflow-hidden z-10">
                {isYouTube ? (
                    <iframe
                        width="100%"
                        height="100%"
                        src={getEmbedUrl(url)}
                        title={title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full scale-[1.01]"
                    ></iframe>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            src={url}
                            poster={thumbnail}
                            className="w-full h-full cursor-pointer object-cover"
                            onClick={togglePlay}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />

                        {/* Custom Controls Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 flex items-center justify-center transition-all duration-500 ${isPlaying ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                            <button
                                onClick={togglePlay}
                                className="w-24 h-24 bg-white/10 backdrop-blur-xl text-white rounded-full flex items-center justify-center hover:scale-110 hover:bg-white/20 active:scale-95 transition-all shadow-2xl border border-white/30"
                            >
                                <Play size={40} fill="white" className="ml-2" />
                            </button>
                        </div>

                        {/* Bottom Bar */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 bg-gradient-to-t from-black/90 to-transparent">
                            <div className="flex items-center gap-6">
                                <button onClick={togglePlay} className="hover:text-primary-400 transition-colors">
                                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase tracking-widest text-primary-400 mb-0.5">Now Playing</span>
                                    <span className="text-sm font-bold truncate max-w-[200px]">{title}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                                    <ShieldCheck size={14} className="text-green-400" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Verified Content</span>
                                </div>
                                <Volume2 size={24} className="hover:text-primary-400 cursor-pointer transition-colors" />
                                <Maximize size={24} className="hover:text-primary-400 cursor-pointer transition-colors" />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Premium Badging Overlay */}
            <div className="absolute top-6 left-6 z-20 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-lg border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-3 animate-fade-in-out">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">4K Ultra-HD Stream</span>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
