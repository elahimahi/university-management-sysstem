import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import ThemeDemo from '../pages/ThemeDemo';
import ComponentDemo from '../pages/ComponentDemo';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import StudentDashboard from '../pages/student/StudentDashboard';
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import DatabaseViewer from '../pages/DatabaseViewer';
import PendingApprovalPage from '../pages/PendingApprovalPage';
import { ProtectedRoute, SessionTimeout } from '../components/auth';
import { useAuth } from '../contexts/AuthContext';
import ProgramsPage from '../pages/ProgramsPage';
import NewsPage from '../pages/NewsPage';
import EventsPage from '../pages/EventsPage';
import AboutPage from '../pages/AboutPage';
import FacultyCoursesPage from '../pages/faculty/FacultyCoursesPage';
import FacultyCoursesManagementPage from '../pages/faculty/FacultyCoursesManagementPage';
import FacultyStudentsPage from '../pages/faculty/FacultyStudentsPage';
import FacultyStudentsManagementPage from '../pages/faculty/FacultyStudentsManagementPage';
import FacultyAttendancePage from '../pages/faculty/FacultyAttendancePage';
import FacultyAttendanceMarkingPage from '../pages/faculty/FacultyAttendanceMarkingPage';
import FacultyGradesPage from '../pages/faculty/FacultyGradesPage';
import FacultyGradesSubmissionPage from '../pages/faculty/FacultyGradesSubmissionPage';
import SubmitGradePage from '../pages/faculty/SubmitGradePage';
import FacultyReportsPage from '../pages/faculty/FacultyReportsPage';
import StudentOverviewPage from '../pages/student/StudentOverviewPage';
import StudentRegistrationPage from '../pages/student/StudentRegistrationPage';
import StudentGradesPage from '../pages/student/StudentGradesPage';
import StudentAttendancePage from '../pages/student/StudentAttendancePage';
import StudentFeesPage from '../pages/student/StudentFeesPage';


import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminFeesPage from '../pages/admin/AdminFeesPage';
import AdminVerificationPage from '../pages/admin/AdminVerificationPage';
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard';
import UserManagementPage from '../pages/admin/UserManagementPage';
import CoursesManagementPage from '../pages/admin/CoursesManagementPage';
import FeesManagementPage from '../pages/admin/FeesManagementPage';

const DashboardRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Check if user is pending approval or rejected
  if (user?.approvalStatus === 'pending' || user?.approvalStatus === 'rejected') {
    return <Navigate to="/pending-approval" replace />;
  }

  const role = user?.role?.toLowerCase();
  if (role === 'admin' || role === 'superadmin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <SessionTimeout />
      <Routes>
        {/* Protected Home Page - requires authentication */}
        <Route
          path="/"
          element={
            <ProtectedRoute requireAuth={true}>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute requireAuth={true}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAuth={true}>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/dashboard"
          element={
            <ProtectedRoute requireAuth={true}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/my-courses"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['faculty']}>
              <FacultyCoursesManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/my-students"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['faculty']}>
              <FacultyStudentsManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Auth Routes (redirect to home if already authenticated) */}
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false} redirectAuthenticated={true}>
              <LoginPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute requireAuth={false} redirectAuthenticated={true}>
              <RegisterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute requireAuth={false}>
              <ForgotPasswordPage />
            </ProtectedRoute>
          }
        />

        {/* Pending Approval Page - for users waiting for superadmin approval */}
        <Route
          path="/pending-approval"
          element={
            <ProtectedRoute requireAuth={true}>
              <PendingApprovalPage />
            </ProtectedRoute>
          }
        />

        {/* Demo Routes */}
        <Route path="/demo" element={<ThemeDemo />} />
        <Route path="/components" element={<ComponentDemo />} />

        {/* Database Viewer Route */}
        <Route path="/database" element={<DatabaseViewer />} />

        {/* Main Navigation Sections */}
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Faculty Section Routes */}
        <Route
          path="/faculty/courses"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['faculty']}>
              <FacultyCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/students"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['faculty']}>
              <FacultyStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/attendance"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['faculty']}>
              <FacultyAttendanceMarkingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/grades"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['faculty']}>
              <FacultyGradesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/submit-grades"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['faculty']}>
              <FacultyGradesSubmissionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/submit-grade"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['faculty']}>
              <SubmitGradePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/reports"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['faculty']}>
              <FacultyReportsPage />
            </ProtectedRoute>
          }
        />


        {/* Student Section Routes */}
        <Route
          path="/student/overview"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['student']}>
              <StudentOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/registration"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['student']}>
              <StudentRegistrationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/grades"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['student']}>
              <StudentGradesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['student']}>
              <StudentAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/fees"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['student']}>
              <StudentFeesPage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['admin', 'superadmin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['admin', 'superadmin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/fees"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['admin', 'superadmin']}>
              <FeesManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verify"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['superadmin']}>
              <AdminVerificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['admin', 'superadmin']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute requireAuth={true} allowedRoles={['admin', 'superadmin']}>
              <CoursesManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
