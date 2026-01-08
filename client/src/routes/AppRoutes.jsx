import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

// Layout
import Navbar from '@components/Common/Navbar';
import Footer from '@components/Common/Footer';
import ProtectedRoute from '@components/Common/ProtectedRoute';

// Pages
import Home from '@pages/Home';
import Login from '@pages/Login';
import Register from '@pages/Register';
import Dashboard from '@pages/Dashboard';
import Learn from '@pages/Learn';
import Quiz from '@pages/Quiz';
import Quizzes from '@pages/Quizzes';
import Challenges from '@pages/Challenges';
import Competitions from '@pages/Competitions';
import Leaderboard from '@pages/Leaderboard';
import Profile from '@pages/Profile';
import DailyMissions from '@pages/DailyMissions';
import ProofReview from '@pages/ProofReview';
import About from '@pages/About';
import LessonDetail from '@pages/LessonDetail';
import CompetitionDetail from '@pages/CompetitionDetail';
import CompetitionTest from '@pages/CompetitionTest';
import NotFound from '@pages/NotFound';
import CreateChallenge from '@pages/CreateChallenge';
import ForgotPassword from '@components/Auth/ForgotPassword';
import ResetPassword from '@components/Auth/ResetPassword';
import PrivacyPolicy from '@pages/PrivacyPolicy';
import TermsOfService from '@pages/TermsOfService';

// Import USER_ROLES
import { USER_ROLES } from '@utils/constants';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Navbar - Show on all pages except login/register */}
      {user && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route path="/about" element={<About />} />
        <Route
          path="/forgot-password"
          element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={user ? <Navigate to="/dashboard" /> : <ResetPassword />}
        />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Protected Routes - All Users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Student Only */}
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <Learn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lesson/:id"
          element={
            <ProtectedRoute>
              <LessonDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:id"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <Quizzes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/challenges"
          element={
            <ProtectedRoute>
              <Challenges />
            </ProtectedRoute>
          }
        />
        <Route
          path="/competitions"
          element={
            <ProtectedRoute>
              <Competitions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/competitions/:id"
          element={
            <ProtectedRoute>
              <CompetitionDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/competitions/:id/test"
          element={
            <ProtectedRoute>
              <CompetitionTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/missions"
          element={
            <ProtectedRoute>
              <DailyMissions />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Teacher Only */}
        <Route
          path="/proof-review"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.TEACHER}>
              <ProofReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-assignment"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.TEACHER}>
              <CreateChallenge />
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Footer - Show on all pages */}
      {user && <Footer />}
    </>
  );
};

export default AppRoutes;