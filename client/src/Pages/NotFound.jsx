import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8 animate-bounce-slow">
          <div className="text-9xl font-bold text-primary-600 mb-4">
            404
          </div>
          <div className="text-6xl mb-4">🌿</div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          The page you're looking for seems to have wandered off into the forest. 
          Let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 btn btn-primary text-lg px-8 py-3"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link
            to="/learn"
            className="inline-flex items-center justify-center gap-2 btn btn-secondary text-lg px-8 py-3"
          >
            <Search className="w-5 h-5" />
            Browse Lessons
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            You might be looking for:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/dashboard"
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-900">Dashboard</div>
            </Link>
            <Link
              to="/learn"
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="text-sm font-medium text-gray-900">Lessons</div>
            </Link>
            <Link
              to="/challenges"
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-medium text-gray-900">Challenges</div>
            </Link>
            <Link
              to="/profile"
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="text-sm font-medium text-gray-900">Profile</div>
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mt-8 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;