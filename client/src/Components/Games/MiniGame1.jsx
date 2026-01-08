import React, { useState, useEffect } from 'react';
import { Trash2, Recycle, Leaf, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const WASTE_ITEMS = [
    { id: 1, name: 'Plastic Bottle', type: 'recyclable', icon: '🥤' },
    { id: 2, name: 'Banana Peel', type: 'organic', icon: '🍌' },
    { id: 3, name: 'Glass Jar', type: 'recyclable', icon: '🫙' },
    { id: 4, name: 'Old Battery', type: 'hazardous', icon: '🔋' },
    { id: 5, name: 'Cardboard Box', type: 'recyclable', icon: '📦' },
    { id: 6, name: 'Apple Core', type: 'organic', icon: '🍎' },
    { id: 7, name: 'Chemical Bottle', type: 'hazardous', icon: '🧪' },
    { id: 8, name: 'Styrofoam Cup', type: 'general', icon: '☕' },
];

const BINS = [
    { id: 'organic', name: 'Organic', color: 'bg-green-500', icon: Leaf },
    { id: 'recyclable', name: 'Recyclable', color: 'bg-blue-500', icon: Recycle },
    { id: 'hazardous', name: 'Hazardous', color: 'bg-red-500', icon: AlertCircle },
    { id: 'general', name: 'General', color: 'bg-gray-500', icon: Trash2 },
];

const MiniGame1 = ({ onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [items, setItems] = useState([]);

    useEffect(() => {
        // Shuffle items
        setItems([...WASTE_ITEMS].sort(() => Math.random() - 0.5));
    }, []);

    const handleSort = (type) => {
        const item = items[currentIndex];
        if (item.type === type) {
            setScore(s => s + 10);
            toast.success('Correct! +10', { duration: 1000 });
        } else {
            toast.error(`Wrong! That was ${item.type}`, { duration: 1000 });
        }

        if (currentIndex < items.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            setGameOver(true);
        }
    };

    if (items.length === 0) return null;

    if (gameOver) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-white">
                <Trash2 className="w-20 h-20 text-primary-500 mb-6" />
                <h2 className="text-4xl font-bold mb-2">Game Over!</h2>
                <p className="text-xl text-gray-400 mb-8">You sorted all the waste.</p>
                <div className="bg-white/10 p-6 rounded-2xl mb-8 text-center min-w-[200px]">
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Score</p>
                    <p className="text-5xl font-black text-primary-500">{score}</p>
                </div>
                <button
                    onClick={() => onComplete(score)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all"
                >
                    Claim Points
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>
        );
    }

    const currentItem = items[currentIndex];

    return (
        <div className="p-8 text-white min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h2 className="text-2xl font-bold">Waste Sorter</h2>
                    <p className="text-gray-400">Sort items into correct bins</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Score</p>
                    <p className="text-3xl font-bold text-primary-500">{score}</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center mb-12">
                <div className="text-8xl mb-4 animate-bounce-slow">{currentItem.icon}</div>
                <h3 className="text-3xl font-bold">{currentItem.name}</h3>
                <p className="text-gray-400 mt-2">Where does this go?</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {BINS.map((bin) => {
                    const Icon = bin.icon;
                    return (
                        <button
                            key={bin.id}
                            onClick={() => handleSort(bin.id)}
                            className={`${bin.color} hover:brightness-110 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all active:scale-95`}
                        >
                            <Icon className="w-8 h-8" />
                            <span className="font-bold">{bin.name}</span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-8 bg-white/5 rounded-full h-2">
                <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex) / items.length) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default MiniGame1;
