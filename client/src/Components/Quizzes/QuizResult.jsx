import React from 'react';
import { Trophy, RotateCcw, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const QuizResult = ({ result, quiz, onRetake, onBackToLessons }) => {
    const {
        score, // 0-100
        pointsEarned,
        passed,
        correctAnswers,
        totalQuestions
    } = result;

    return (
        <div className="card text-center animate-scale-up">
            <div className="mb-8">
                {passed ? (
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-12 h-12 text-green-600" />
                    </div>
                ) : (
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-12 h-12 text-red-600" />
                    </div>
                )}
                <h2 className="text-3xl font-bold text-gray-900">
                    {passed ? 'Congratulations!' : 'Keep Practicing!'}
                </h2>
                <p className="text-gray-600 mt-2">
                    {passed
                        ? `You've passed the "${quiz.title}" quiz.`
                        : `You need ${quiz.passingScore || 60}% to pass. You're doing great, try one more time!`}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-6 rounded-2xl">
                    <div className="text-sm text-gray-500 mb-1">Your Score</div>
                    <div className={`text-4xl font-black ${passed ? 'text-green-600' : 'text-red-600'}`}>
                        {score}%
                    </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl">
                    <div className="text-sm text-gray-500 mb-1">Points Earned</div>
                    <div className="text-4xl font-black text-primary-600">
                        +{pointsEarned}
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Performance Summary
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Correct Answers</span>
                        <span className="font-bold text-gray-900">{correctAnswers} / {totalQuestions}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${passed ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${score}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onRetake}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all"
                >
                    <RotateCcw className="w-5 h-5" />
                    Retake Quiz
                </button>
                <button
                    onClick={onBackToLessons}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Lessons
                </button>
            </div>
        </div>
    );
};

export default QuizResult;
