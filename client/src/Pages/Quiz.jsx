import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import QuizPage from '@components/Quizzes/QuizPage';
import QuizResult from '@components/Quizzes/QuizResult';
import Loader from '@components/Common/Loader';
import { Brain, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@services/api';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);

  useEffect(() => {
    if (id) {
      fetchQuiz();
    }
  }, [id]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/quizzes/${id}`);
      // Backend returns { quiz: {...}, questions: [...] }
      // We need to merge them so the UI can read quiz.questions
      const fullQuizData = {
        ...response.data.quiz,
        questions: response.data.questions
      };
      setQuiz(fullQuizData);
    } catch (error) {
      toast.error('Failed to load quiz');
      console.error('Error fetching quiz:', error);
      // Stay on page so user sees the error
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      const response = await api.post('/submissions/start', {
        quizId: id,
        userId: user._id
      });

      // Update quiz questions with the randomized set
      if (response.data.questions && response.data.questions.length > 0) {
        setQuiz(prev => ({
          ...prev,
          questions: response.data.questions
        }));
      }

      setSubmissionId(response.data.submission._id);
      setQuizStarted(true);
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to start quiz');
    }
  };

  const handleSubmitQuiz = async (answers) => {
    setSubmitting(true);
    try {
      const response = await api.post('/submissions/submit', {
        submissionId: submissionId,
        answers
      });

      setResult(response.data);

      // Refresh user data to update points in context/dashboard
      await fetchUser();

      if (response.data.passed) {
        toast.success('🎯 Quiz passed! +' + response.data.pointsEarned + ' points');
      } else {
        toast.error(`You need ${quiz.passingScore || 60}% to pass. Try again!`);
      }
    } catch (error) {
      toast.error('Failed to submit quiz');
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetakeQuiz = () => {
    setResult(null);
    setQuizStarted(false);
    fetchQuiz();
  };

  const handleBackToLessons = () => {
    navigate('/learn');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quiz not found
          </h2>
          <button onClick={handleBackToLessons} className="btn btn-primary">
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  // Show result if quiz is completed
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <QuizResult
            result={result}
            quiz={quiz}
            onRetake={handleRetakeQuiz}
            onBackToLessons={handleBackToLessons}
          />
        </div>
      </div>
    );
  }

  // Show quiz start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={handleBackToLessons}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Lessons
          </button>

          {/* Quiz Intro Card */}
          <div className="card animate-slide-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  {quiz.title}
                </h1>
                <p className="text-gray-600">
                  Test your knowledge
                </p>
              </div>
            </div>

            {quiz.description && (
              <p className="text-gray-700 mb-6">
                {quiz.description}
              </p>
            )}

            {/* Quiz Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Questions</div>
                <div className="text-2xl font-bold text-gray-900">
                  {quiz.questions?.length || 0}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Time Limit</div>
                <div className="text-2xl font-bold text-gray-900">
                  {quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Passing Score</div>
                <div className="text-2xl font-bold text-gray-900">
                  {quiz.passingScore || 60}%
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                Instructions:
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Read each question carefully before answering</li>
                <li>• You need to score at least {quiz.passingScore || 60}% to pass</li>
                <li>• Click "Submit Quiz" when you're done</li>
                {quiz.timeLimit && (
                  <li>• The quiz will auto-submit when time runs out</li>
                )}
                <li>• You can retake the quiz if you don't pass</li>
              </ul>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartQuiz}
              className="w-full btn btn-primary text-lg py-4"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show quiz questions
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <QuizPage
          quiz={quiz}
          onSubmit={handleSubmitQuiz}
          submitting={submitting}
        />
      </div>
    </div>
  );
};

export default Quiz;