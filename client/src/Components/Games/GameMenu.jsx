import React from 'react';
import { Gamepad2, Play, Trophy, Star } from 'lucide-react';

const GameMenu = ({ games = [], userScores = [], onPlay }) => {
    if (!games || games.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Gamepad2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">No games available</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2">
                    New educational games are being prepared. Check back soon!
                </p>
            </div>
        );
    }

    const getGameScore = (gameId) => {
        return userScores.find(s => s.gameId === gameId)?.highScore || 0;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
                <div key={game._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                    {/* Thumbnail placeholder */}
                    <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center relative">
                        <Gamepad2 className="w-16 h-16 text-white/50" />
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold capitalize">
                            {game.type}
                        </div>
                        <div className="absolute bottom-4 left-4 bg-yellow-400 px-3 py-1 rounded-full text-yellow-900 text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-900" />
                            {game.difficulty}
                        </div>
                    </div>

                    <div className="p-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                            {game.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {game.description}
                        </p>

                        <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <span>Best: {getGameScore(game._id)}</span>
                            </div>
                            <span className="capitalize">{game.category}</span>
                        </div>

                        <button
                            onClick={() => onPlay && onPlay(game)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gray-900 text-white font-bold hover:bg-gray-800 transition shadow-lg hover:shadow-gray-200"
                        >
                            <Play className="w-5 h-5 fill-white" />
                            Play Now
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GameMenu;
