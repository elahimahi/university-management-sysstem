import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ProtectedRoute } from '@/components'

// Pages
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'
import SettingsPage from '@/pages/SettingsPage'

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminDepartments from '@/pages/admin/AdminDepartments'
import AdminCourses from '@/pages/admin/AdminCourses'
import AdminSemesters from '@/pages/admin/AdminSemesters'
import AdminAuditLogs from '@/pages/admin/AdminAuditLogs'

// Student Pages
import StudentDashboard from '@/pages/student/StudentDashboard'
import StudentProfile from '@/pages/student/StudentProfile'
import StudentEnrollments from '@/pages/student/StudentEnrollments'
import StudentResults from '@/pages/student/StudentResults'

// Teacher Pages
import TeacherDashboard from '@/pages/teacher/TeacherDashboard'
import TeacherProfile from '@/pages/teacher/TeacherProfile'
import TeacherOfferings from '@/pages/teacher/TeacherOfferings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Shared Routes */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDepartments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/semesters"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSemesters />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminAuditLogs />
                  </ProtectedRoute>
                }
              />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/enrollments"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentEnrollments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/results"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentResults />
                  </ProtectedRoute>
                }
              />

              {/* Teacher Routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/profile"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/offerings"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherOfferings />
                  </ProtectedRoute>
                }
              />

              {/* Catch All - Redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
