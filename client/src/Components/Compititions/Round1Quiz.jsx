import { useState, useEffect } from 'react';
import { Clock, Check, X, AlertCircle } from 'lucide-react';

const Round1Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes in seconds
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: 1,
      question: 'What percentage of Earth\'s water is fresh water?',
      options: ['2.5%', '10%', '25%', '50%'],
      correctAnswer: 0,
      explanation: 'Only about 2.5% of Earth\'s water is fresh water, and most of that is frozen in glaciers.'
    },
    {
      id: 2,
      question: 'Which greenhouse gas is most responsible for climate change?',
      options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Helium'],
      correctAnswer: 2,
      explanation: 'Carbon dioxide (CO2) is the primary greenhouse gas emitted through human activities.'
    },
    {
      id: 3,
      question: 'What is the largest source of plastic pollution in oceans?',
      options: ['Fishing nets', 'Plastic bottles', 'Plastic bags', 'Straws'],
      correctAnswer: 0,
      explanation: 'Abandoned fishing nets and gear account for about 46% of ocean plastic.'
    },
    {
      id: 4,
      question: 'How long does it take for a plastic bottle to decompose?',
      options: ['10 years', '50 years', '100 years', '450 years'],
      correctAnswer: 3,
      explanation: 'Plastic bottles can take up to 450 years to decompose in landfills.'
    },
    {
      id: 5,
      question: 'Which renewable energy source is the fastest growing?',
      options: ['Wind', 'Solar', 'Hydro', 'Geothermal'],
      correctAnswer: 1,
      explanation: 'Solar energy is currently the fastest-growing renewable energy source globally.'
    }
  ];

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !showResults) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining, showResults]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100)
    };
  };

  if (showResults) {
    const score = calculateScore();
    const passed = score.percentage >= 80;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {passed ? (
                <Check className="text-green-600" size={64} />
              ) : (
                <X className="text-red-600" size={64} />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {passed ? 'Congratulations! 🎉' : 'Keep Trying! 💪'}
            </h2>
            <p className="text-gray-600">
              {passed 
                ? 'You passed Round 1! Proceed to the next round.'
                : 'Score 80% or higher to unlock the next round.'
              }
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{score.correct}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{score.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{score.percentage}%</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="font-bold text-gray-800">Review Answers:</h3>
            {questions.map((q, index) => {
              const userAnswer = selectedAnswers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div key={q.id} className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    {isCorrect ? (
                      <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                    ) : (
                      <X className="text-red-600 flex-shrink-0 mt-1" size={20} />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-2">Q{index + 1}: {q.question}</p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Your answer:</span> {q.options[userAnswer] || 'Not answered'}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Correct answer:</span> {q.options[q.correctAnswer]}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-2 italic">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4">
            {passed ? (
              <button className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
                Proceed to Round 2
              </button>
            ) : (
              <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                Retry Quiz
              </button>
            )}
            <button className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition">
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Round 1: Quick Quiz</h1>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${
              timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock size={20} />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(question.id, index)}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  selectedAnswers[question.id] === index
                    ? 'bg-blue-600 text-white border-2 border-blue-600'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    selectedAnswers[question.id] === index
                      ? 'bg-white text-blue-600'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  selectedAnswers[questions[index].id] !== undefined
                    ? 'bg-green-500'
                    : index === currentQuestion
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Next
            </button>
          )}
        </div>

        {/* Warning */}
        {Object.keys(selectedAnswers).length < questions.length && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-yellow-800">
              You have {questions.length - Object.keys(selectedAnswers).length} unanswered question(s). 
              Make sure to answer all questions before submitting!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Round1Quiz;