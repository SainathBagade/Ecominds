import React, { useState, useEffect } from 'react';
import { Footprints, ArrowRight, RefreshCw, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const MATCH_ITEMS = [
    { id: 1, activity: 'Drive 10km (Car)', impact: 'High', co2: '2.5kg', color: 'bg-red-500' },
    { id: 2, activity: 'Walking 10km', impact: 'Zero', co2: '0kg', color: 'bg-green-500' },
    { id: 3, activity: 'Cycling 10km', impact: 'Low', co2: '0.1kg', color: 'bg-emerald-500' },
    { id: 4, activity: 'One Burger (Beef)', impact: 'High', co2: '3.0kg', color: 'bg-orange-500' },
    { id: 5, activity: 'One Salad (Local)', impact: 'Low', co2: '0.3kg', color: 'bg-lime-500' },
    { id: 6, activity: 'Domestic Flight', impact: 'Extreme', co2: '150kg', color: 'bg-red-800' },
];

const MiniGame3 = ({ onComplete }) => {
    const [selected, setSelected] = useState(null);
    const [matched, setMatched] = useState([]);
    const [scrambledImpacts, setScrambledImpacts] = useState([]);
    const [score, setScore] = useState(0);

    useEffect(() => {
        setScrambledImpacts([...MATCH_ITEMS].sort(() => Math.random() - 0.5));
    }, []);

    const handleSelectActivity = (item) => {
        if (matched.includes(item.id)) return;
        setSelected(item);
    };

    const handleSelectImpact = (impactItem) => {
        if (!selected) {
            toast.error('Select an activity first!');
            return;
        }

        if (selected.id === impactItem.id) {
            setMatched([...matched, selected.id]);
            setScore(s => s + 20);
            toast.success('Perfect Match! 🌍');
            setSelected(null);
        } else {
            setScore(s => Math.max(0, s - 5));
            toast.error('Mismatched impact!');
        }
    };

    useEffect(() => {
        if (matched.length === MATCH_ITEMS.length) {
            toast.success('You matched everything!');
        }
    }, [matched]);

    if (matched.length === MATCH_ITEMS.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-white">
                <Footprints className="w-20 h-20 text-emerald-500 mb-6" />
                <h2 className="text-4xl font-bold mb-2">Great Work!</h2>
                <p className="text-xl text-gray-400 mb-8">You understand the carbon footprint.</p>
                <div className="bg-white/10 p-6 rounded-2xl mb-8 text-center min-w-[200px]">
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Score</p>
                    <p className="text-5xl font-black text-emerald-500">{score}</p>
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

    return (
        <div className="p-8 text-white min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-black">
                        <Footprints className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-emerald-500">Carbon Matcher</h2>
                        <p className="text-gray-400 text-sm">Match activity with its CO2 impact</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">SCORE</p>
                    <p className="text-3xl font-bold text-emerald-500">{score}</p>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-12">
                {/* Activities Column */}
                <div className="space-y-4">
                    <h3 className="text-center text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">Activities</h3>
                    {MATCH_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            disabled={matched.includes(item.id)}
                            onClick={() => handleSelectActivity(item)}
                            className={`w-full p-4 rounded-xl font-medium border-2 transition-all text-left flex justify-between items-center
                                ${matched.includes(item.id) ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-500 opacity-50' :
                                    selected?.id === item.id ? 'bg-primary-600 border-primary-400 scale-105 shadow-xl text-white' :
                                        'bg-white/5 border-white/10 hover:border-white/30 text-white'}`}
                        >
                            {item.activity}
                            {matched.includes(item.id) && <RefreshCw className="w-4 h-4" />}
                        </button>
                    ))}
                </div>

                {/* Impacts Column */}
                <div className="space-y-4">
                    <h3 className="text-center text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">CO2 Impact</h3>
                    {scrambledImpacts.map((item) => (
                        <button
                            key={item.id}
                            disabled={matched.includes(item.id)}
                            onClick={() => handleSelectImpact(item)}
                            className={`w-full p-4 rounded-xl font-bold border-2 transition-all flex justify-between items-center
                                ${matched.includes(item.id) ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-500 opacity-50' :
                                    'bg-white/5 border-white/10 hover:border-white/30 text-white'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                                {item.co2} ({item.impact})
                            </div>
                            {matched.includes(item.id) && <Star className="w-4 h-4 fill-emerald-500" />}
                        </button>
                    ))}
                </div>
            </div>

            <p className="mt-8 text-center text-sm text-gray-500">
                {selected ? `Matching: "${selected.activity}"...` : "Select an activity to match its carbon footprint"}
            </p>
        </div>
    );
};

export default MiniGame3;
