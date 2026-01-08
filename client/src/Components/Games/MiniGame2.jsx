import React, { useState, useEffect } from 'react';
import { Target, Trophy, Zap, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const QUESTIONS = [
    {
        id: 1,
        question: "Which gas is most responsible for global warming?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
        answer: "Carbon Dioxide"
    },
    {
        id: 2,
        question: "What is the primary source of renewable energy?",
        options: ["Coal", "Natural Gas", "Solar", "Nuclear"],
        answer: "Solar"
    },
    {
        id: 3,
        question: "Which ecosystem absorbs the most carbon?",
        options: ["Deserts", "Rainforests", "Grasslands", "Oceans"],
        answer: "Oceans"
    },
    {
        id: 4,
        question: "How long does a plastic bottle take to decompose?",
        options: ["10 years", "50 years", "450 years", "Never"],
        answer: "450 years"
    }
];

const MiniGame2 = ({ onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [selection, setSelection] = useState(null);

    useEffect(() => {
        if (timeLeft > 0 && !gameOver && !selection) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !selection) {
            handleAnswer("");
        }
    }, [timeLeft, gameOver, selection]);

    const handleAnswer = (option) => {
        setSelection(option);
        const correct = option === QUESTIONS[currentIndex].answer;

        if (correct) {
            setScore(s => s + timeLeft * 10);
            toast.success(`Correct! Points: ${timeLeft * 10}`);
        } else {
            toast.error('Opps! Wrong answer');
        }

        setTimeout(() => {
            if (currentIndex < QUESTIONS.length - 1) {
                setCurrentIndex(i => i + 1);
                setTimeLeft(10);
                setSelection(null);
            } else {
                setGameOver(true);
            }
        }, 1500);
    };

    if (gameOver) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-white">
                <Trophy className="w-20 h-20 text-yellow-500 mb-6" />
                <h2 className="text-4xl font-bold mb-2">Quiz Finished!</h2>
                <p className="text-xl text-gray-400 mb-8">You answered all questions.</p>
                <div className="bg-white/10 p-6 rounded-2xl mb-8 text-center min-w-[200px]">
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Final Score</p>
                    <p className="text-5xl font-black text-yellow-500">{score}</p>
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

    const currentQ = QUESTIONS[currentIndex];

    return (
        <div className="p-8 text-white min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Zap className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-yellow-500">Eco Flash Quiz</h2>
                        <p className="text-gray-400 text-sm">Question {currentIndex + 1} of {QUESTIONS.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase">Time</p>
                        <p className={`text-2xl font-mono font-bold ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {timeLeft}s
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase">Score</p>
                        <p className="text-2xl font-bold text-primary-500">{score}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center mb-8">
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl w-full max-w-2xl text-center">
                    <h3 className="text-2xl font-bold leading-tight">{currentQ.question}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
                {currentQ.options.map((option) => {
                    const isSelected = selection === option;
                    const isCorrect = option === currentQ.answer;
                    const showCorrect = selection && isCorrect;
                    const showWrong = selection && isSelected && !isCorrect;

                    return (
                        <button
                            key={option}
                            disabled={!!selection}
                            onClick={() => handleAnswer(option)}
                            className={`p-5 rounded-2xl font-bold text-lg border-2 transition-all flex items-center justify-between
                                ${isSelected ? 'scale-95' : 'hover:scale-102'}
                                ${showCorrect ? 'bg-green-600/20 border-green-500 text-green-500' :
                                    showWrong ? 'bg-red-600/20 border-red-500 text-red-500' :
                                        'bg-white/5 border-white/10 hover:border-white/30 text-white'}`}
                        >
                            {option}
                            {showCorrect && <CheckCircle2 className="w-6 h-6" />}
                            {showWrong && <XCircle className="w-6 h-6" />}
                        </button>
                    );
                })}
            </div>

            <div className="mt-12 bg-white/5 rounded-full h-1">
                <div
                    className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex) / QUESTIONS.length) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default MiniGame2;
