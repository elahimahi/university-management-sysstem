import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

/**
 * ProtectedRoute component
 * @param {ReactNode} children - The protected content
 * @param {Array<string>} allowedRoles - Roles allowed to access this route
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const token = localStorage.getItem('token');

  if (loading) return null; // or a loading spinner

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
