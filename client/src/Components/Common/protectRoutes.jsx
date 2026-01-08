import { useState } from 'react';
import { Lock, Shield, AlertTriangle } from 'lucide-react';

// Mock authentication hook (in real app, use context/redux)
const useAuth = () => {
  const [isAuthenticated] = useState(false);
  const [user] = useState(null);
  return { isAuthenticated, user };
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuth();

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Lock className="text-red-600" size={32} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Authentication Required
          </h2>
          
          <p className="text-gray-600 mb-6">
            You need to be logged in to access this page.
          </p>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Sign In
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Shield className="text-orange-600" size={32} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Access Denied
          </h2>
          
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
            <span className="block mt-2 font-semibold text-orange-600">
              Required role: {requiredRole}
            </span>
          </p>
          
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return children;
};

// Demo Component
const ProtectedRouteDemo = () => {
  const [selectedRoute, setSelectedRoute] = useState('protected');

  const routes = [
    { id: 'protected', name: 'Protected Page', requiresAuth: true, role: null },
    { id: 'admin', name: 'Admin Page', requiresAuth: true, role: 'admin' },
    { id: 'public', name: 'Public Page', requiresAuth: false, role: null }
  ];

  const renderContent = () => {
    const currentRoute = routes.find(r => r.id === selectedRoute);
    
    if (!currentRoute.requiresAuth) {
      return (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Public Page</h2>
          <p className="text-gray-600">This page is accessible to everyone!</p>
        </div>
      );
    }

    return (
      <ProtectedRoute requiredRole={currentRoute.role}>
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {currentRoute.role ? 'Admin Dashboard' : 'Protected Content'}
          </h2>
          <p className="text-gray-600">
            You have access to this {currentRoute.role ? 'admin' : 'protected'} content!
          </p>
        </div>
      </ProtectedRoute>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Demo Mode</h3>
              <p className="text-sm text-blue-800">
                Authentication is set to <strong>false</strong> for demo purposes. 
                Try different routes to see protection in action!
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Protected Route Component</h1>
        
        {/* Route Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Select a Route:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {routes.map(route => (
              <button
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedRoute === route.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-800 mb-1">{route.name}</div>
                <div className="text-xs text-gray-600">
                  {route.requiresAuth ? '🔒 Protected' : '🌍 Public'}
                  {route.role && ` • Role: ${route.role}`}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="mb-8">
          {renderContent()}
        </div>

        {/* Code Example */}
        <div className="bg-gray-900 rounded-xl p-6 text-white">
          <h3 className="font-semibold mb-4">Usage Example:</h3>
          <pre className="text-sm overflow-x-auto">
{`// Protect a route
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Protect with role requirement
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRouteDemo;