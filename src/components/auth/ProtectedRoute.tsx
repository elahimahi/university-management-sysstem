import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  redirectAuthenticated?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
  redirectAuthenticated = true,
}) => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-semibold">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to dashboard if user is authenticated but tries to access auth pages
  if (!requireAuth && isAuthenticated && redirectAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0 && user && user.role) {
    const userRole = user.role.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
    if (!normalizedAllowedRoles.includes(userRole)) {
    const roleNames = (allowedRoles || [])
      .filter(r => r)
      .map(r => (r.charAt(0).toUpperCase() + r.slice(1)))
      .join(', ');
    const userRoleName = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown';
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900">
        <div className="text-center max-w-md p-8 bg-white dark:bg-navy-800 rounded-2xl shadow-xl">
          <div className="inline-block p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Your current role is <span className="font-semibold">{userRoleName}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This page requires <span className="font-semibold">{roleNames}</span> role.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-6 py-2 border border-gray-300 dark:border-navy-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-navy-700 transition-all"
            >
              Go Back
            </button>
            <button
              onClick={async () => {
                await logout();
                navigate('/login', { replace: true });
              }}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg transition-all"
            >
              Login as Different Role
            </button>
          </div>
        </div>
      </div>
    );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
