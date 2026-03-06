import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';

// Lazy load pages (replace with actual imports as you create pages)
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const Settings = lazy(() => import('./pages/Settings'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminDepartments = lazy(() => import('./pages/admin/Departments'));
const AdminCourses = lazy(() => import('./pages/admin/Courses'));
const AdminSemesters = lazy(() => import('./pages/admin/Semesters'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AuditLogs'));

// Student
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));
const StudentEnrollments = lazy(() => import('./pages/student/Enrollments'));
const StudentResults = lazy(() => import('./pages/student/Results'));

// Teacher
const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'));
const TeacherProfile = lazy(() => import('./pages/teacher/Profile'));
const TeacherOfferings = lazy(() => import('./pages/teacher/Offerings'));
const TeacherGrade = lazy(() => import('./pages/teacher/Grade'));

const AppRoutes = () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* Shared Route */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Teacher", "Student"]}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]}><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/departments" element={<AdminDepartments />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/semesters" element={<AdminSemesters />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        </Route>

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Student"]}><StudentLayout /></ProtectedRoute>}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/enrollments" element={<StudentEnrollments />} />
          <Route path="/student/results" element={<StudentResults />} />
        </Route>

        {/* Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Teacher"]}><TeacherLayout /></ProtectedRoute>}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/profile" element={<TeacherProfile />} />
          <Route path="/teacher/offerings" element={<TeacherOfferings />} />
          <Route path="/teacher/grade/:enrollment_id" element={<TeacherGrade />} />
        </Route>
      </Routes>
    </Suspense>
  </Router>
);

export default AppRoutes;
