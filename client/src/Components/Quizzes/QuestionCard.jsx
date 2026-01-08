import React from 'react';

const QuestionCard = ({ question, selectedOption, onOptionSelect, questionNumber, totalQuestions }) => {
    if (!question) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                    Question {questionNumber} of {totalQuestions}
                </span>
            </div>

            <h2 className="text-xl font-bold text-gray-900">
                {question.question}
            </h2>

            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => onOptionSelect(option)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedOption === option
                                ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold'
                                : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold ${selectedOption === option
                                    ? 'border-primary-600 bg-primary-600 text-white'
                                    : 'border-gray-200 text-gray-400'
                                }`}>
                                {String.fromCharCode(65 + index)}
                            </div>
                            <span>{option}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;
