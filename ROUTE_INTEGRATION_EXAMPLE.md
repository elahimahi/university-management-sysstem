// ============================================
// AppRoutes Update - Fee Management Routes
// ============================================
// This file shows exactly what to add to src/routes/AppRoutes.tsx
// to integrate the new fee management system.
//
// Copy the relevant sections into your AppRoutes.tsx file
// ============================================

// ============================================
// STEP 1: Add Imports at the Top
// ============================================

// Add these imports to the existing imports section:

import AdminFeeManagementPageProfessional from '../pages/admin/AdminFeeManagementPageProfessional';
import StudentFeesPortalProfessional from '../pages/student/StudentFeesPortalProfessional';
import StudentPaymentPageProfessional from '../pages/student/StudentPaymentPageProfessional';

// ============================================
// STEP 2: Add Admin Routes
// ============================================

// Find the section with admin routes and add this:
// (Usually around the admin dashboard and other admin pages)

<Route path="/admin/fees" element={<AdminFeeManagementPageProfessional />} />

// Example of where this goes (in context):
{/* Admin Routes */}
<Route path="/admin/dashboard" element={<AdminDashboard />} />
<Route path="/admin/users" element={<AdminUsersPage />} />
<Route path="/admin/fees" element={<AdminFeeManagementPageProfessional />} />  // ← ADD THIS
<Route path="/admin/approvals" element={<AdminApprovalsPage />} />

// ============================================
// STEP 3: Add Student Routes
// ============================================

// Find the section with student routes and add these:
// (Usually around the student dashboard and other student pages)

<Route path="/student/fees" element={<StudentFeesPortalProfessional />} />
<Route path="/student/pay-fee/:feeId" element={<StudentPaymentPageProfessional />} />

// Example of where this goes (in context):
{/* Student Routes */}
<Route path="/student/dashboard" element={<StudentDashboard />} />
<Route path="/student/courses" element={<StudentCoursesPage />} />
<Route path="/student/fees" element={<StudentFeesPortalProfessional />} />            // ← ADD THIS
<Route path="/student/pay-fee/:feeId" element={<StudentPaymentPageProfessional />} /> // ← ADD THIS
<Route path="/student/attendance" element={<StudentAttendancePage />} />

// ============================================
// COMPLETE EXAMPLE (AppRoutes.tsx structure)
// ============================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ===== Admin Pages =====
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminFeeManagementPageProfessional from '../pages/admin/AdminFeeManagementPageProfessional';
import AdminApprovalsPage from '../pages/admin/AdminApprovalsPage';

// ===== Faculty Pages =====
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import FacultyCoursesPageProfessional from '../pages/faculty/FacultyCoursesPageProfessional';
import FacultyGradesPageProfessional from '../pages/faculty/FacultyGradesPageProfessional';
import FacultyStudentsPageProfessional from '../pages/faculty/FacultyStudentsPageProfessional';
import FacultyAttendancePageProfessional from '../pages/faculty/FacultyAttendancePageProfessional';
import FacultyAssignmentsPageProfessional from '../pages/faculty/FacultyAssignmentsPageProfessional';
import FacultyReportsPageProfessional from '../pages/faculty/FacultyReportsPageProfessional';
import FacultyPostAssignmentPageProfessional from '../pages/faculty/FacultyPostAssignmentPageProfessional';
import FacultySendMessagePageProfessional from '../pages/faculty/FacultySendMessagePageProfessional';

// ===== Student Pages =====
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentCoursesPage from '../pages/student/StudentCoursesPage';
import StudentFeesPortalProfessional from '../pages/student/StudentFeesPortalProfessional';
import StudentPaymentPageProfessional from '../pages/student/StudentPaymentPageProfessional';
import StudentAttendancePage from '../pages/student/StudentAttendancePage';

// ===== Common Pages =====
import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ===== Public Routes ===== */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* ===== Admin Routes ===== */}
      {user?.role === 'super_admin' || user?.role === 'admin' ? (
        <>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/fees" element={<AdminFeeManagementPageProfessional />} />
          <Route path="/admin/approvals" element={<AdminApprovalsPage />} />
        </>
      ) : null}

      {/* ===== Faculty Routes ===== */}
      {user?.role === 'faculty' ? (
        <>
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/faculty/courses" element={<FacultyCoursesPageProfessional />} />
          <Route path="/faculty/grades" element={<FacultyGradesPageProfessional />} />
          <Route path="/faculty/students" element={<FacultyStudentsPageProfessional />} />
          <Route path="/faculty/attendance" element={<FacultyAttendancePageProfessional />} />
          <Route path="/faculty/assignments" element={<FacultyAssignmentsPageProfessional />} />
          <Route path="/faculty/reports" element={<FacultyReportsPageProfessional />} />
          <Route path="/faculty/post-assignment" element={<FacultyPostAssignmentPageProfessional />} />
          <Route path="/faculty/send-message" element={<FacultySendMessagePageProfessional />} />
        </>
      ) : null}

      {/* ===== Student Routes ===== */}
      {user?.role === 'student' ? (
        <>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<StudentCoursesPage />} />
          <Route path="/student/fees" element={<StudentFeesPortalProfessional />} />
          <Route path="/student/pay-fee/:feeId" element={<StudentPaymentPageProfessional />} />
          <Route path="/student/attendance" element={<StudentAttendancePage />} />
        </>
      ) : null}

      {/* ===== 404 Route ===== */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;

// ============================================
// STEP 4: Update Dashboard Navigation
// ============================================

// ===== In AdminDashboard.tsx =====
// Find the quickActions array and add:

const quickActions = [
  // ... existing actions
  {
    icon: CreditCard,
    label: 'Fee Management',
    path: '/admin/fees',
    color: 'text-purple-400'
  }
];

// ===== In StudentDashboard.tsx =====
// Find the quickActions array and add:

const quickActions = [
  // ... existing actions
  {
    icon: DollarSign,
    label: 'My Fees',
    path: '/student/fees',
    color: 'text-green-400'
  }
];

// ============================================
// STEP 5: Add Route Navigation Links
// ============================================

// In your navigation/menu component, add links to these routes:

// For Admin Menu:
<NavLink to="/admin/fees" label="Fee Management" icon={CreditCard} />

// For Student Menu:
<NavLink to="/student/fees" label="My Fees" icon={DollarSign} />

// ============================================
// VERIFICATION CHECKLIST
// ============================================

/*
After making these changes, verify:

✅ All imports are added at the top
✅ Admin fees route is added to admin section
✅ Student fees routes are added to student section
✅ Dashboard navigation is updated
✅ No duplicate routes
✅ TypeScript compiles without errors
✅ Components render when navigating to routes

Testing:
✅ Login as admin
✅ Navigate to /admin/fees - should show fee management page
✅ Login as student
✅ Navigate to /student/fees - should show fees portal
✅ Click "Pay Now" - should navigate to /student/pay-fee/{id}
*/

// ============================================
// COMMON ISSUES & SOLUTIONS
// ============================================

/*
ISSUE: "Cannot find module AdminFeeManagementPageProfessional"
SOLUTION: Ensure the file exists at:
  src/pages/admin/AdminFeeManagementPageProfessional.tsx

ISSUE: Route not working - shows 404
SOLUTION: 
  1. Check the route path matches exactly
  2. Verify imports are correct
  3. Check component export name
  4. Verify route is inside correct condition block

ISSUE: "useAuth() hook not available"
SOLUTION:
  1. Ensure component is wrapped with AuthProvider
  2. Check AuthContext is properly imported
  3. Verify AuthProvider is at root of app

ISSUE: Icons (CreditCard, DollarSign) not found
SOLUTION:
  Add import: import { CreditCard, DollarSign } from 'lucide-react';
*/

// ============================================
// END OF ROUTE CONFIGURATION
// ============================================
