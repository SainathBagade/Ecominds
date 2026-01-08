import React from 'react';
import { useAuth } from '@hooks/useAuth';
import StudentDashboard from '@components/Dashboard/StudentDashboard';
import TeacherDashboard from '@components/Dashboard/TeacherDashboard';
import AdminDashboard from '@components/Dashboard/AdminDashboard';
import SuperAdminDashboard from '@components/Dashboard/SuperAdminDashboard';
import Loader from '@components/Common/Loader';
import { USER_ROLES } from '@utils/constants';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please login to continue
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user.role === USER_ROLES.STUDENT ? (
        <StudentDashboard />
      ) : user.role === USER_ROLES.TEACHER ? (
        <TeacherDashboard />
      ) : user.role === USER_ROLES.ADMIN ? (
        <AdminDashboard />
      ) : user.role === USER_ROLES.SUPERADMIN ? (
        <SuperAdminDashboard />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Invalid user role
            </h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;