import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

const QuizPage = ({ quiz, onSubmit, submitting }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});

    const questions = quiz.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    const handleOptionSelect = (option) => {
        setAnswers({
            ...answers,
            [currentQuestionIndex]: option
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const isComplete = questions.every((_, index) => answers[index] !== undefined);

    if (!currentQuestion) return null;

    return (
        <div className="card animate-fade-in">
            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="text-sm font-bold text-primary-600">
                        {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                    </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {currentQuestion.text}
                </h2>

                <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleOptionSelect(option)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQuestionIndex] === option
                                ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold'
                                : 'border-gray-100 hover:border-primary-200'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${answers[currentQuestionIndex] === option
                                    ? 'border-primary-600 bg-primary-600 text-white'
                                    : 'border-gray-200 text-gray-400'
                                    }`}>
                                    {String.fromCharCode(65 + index)}
                                </div>
                                {option.text}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors ${currentQuestionIndex === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                </button>

                {currentQuestionIndex === questions.length - 1 ? (
                    <button
                        onClick={() => {
                            const formattedAnswers = questions.map((q, index) => ({
                                questionId: q._id,
                                selectedAnswer: answers[index]?.text
                            })).filter(a => a.selectedAnswer);
                            onSubmit(formattedAnswers);
                        }}
                        disabled={!isComplete || submitting}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-green-200"
                    >
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                        {!submitting && <Send className="w-5 h-5" />}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-200"
                    >
                        Next
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizPage;
