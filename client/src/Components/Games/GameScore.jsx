import React from 'react';
import { Trophy, Star, ArrowRight, RotateCcw } from 'lucide-react';

const GameScore = ({ score, totalPossible, onRestart, onExit }) => {
    const percentage = Math.round((score / totalPossible) * 100);
    const stars = percentage >= 80 ? 3 : percentage >= 50 ? 2 : percentage >= 20 ? 1 : 0;

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-scale-up border border-gray-100">
            <div className="mb-8">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-yellow-200">
                    <Trophy className="w-12 h-12 text-yellow-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900">Game Over!</h2>
                <p className="text-gray-500 font-medium">Great effort, Eco Warrior!</p>
            </div>

            <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                    <Star
                        key={s}
                        size={40}
                        className={`${s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} transition-all`}
                    />
                ))}
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Your Score</div>
                <div className="text-5xl font-black text-primary-600 mb-2">{score}</div>
                <div className="text-xs font-bold text-gray-500 uppercase">Points Earned</div>
            </div>

            <div className="space-y-4">
                <button
                    onClick={onRestart}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                >
                    <RotateCcw size={20} />
                    Play Again
                </button>
                <button
                    onClick={onExit}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                >
                    Exit to Menu
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default GameScore;
