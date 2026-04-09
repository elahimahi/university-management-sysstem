# Approval System Implementation

## Overview
A new approval system has been implemented where:
- **Superadmin** can login immediately with auto-approval
- **Faculty, Student, Admin** users must be approved by Superadmin before accessing dashboards
- Users with pending/rejected status see a special page instead of their dashboard

## New Components & Files

### Frontend Changes

1. **New Page: `PendingApprovalPage.tsx`**
   - Shows when user login status is 'pending' or 'rejected'
   - Displays approval status and rejection reason
   - Provides option to logout

2. **Updated Type: `auth.types.ts`**
   - Added 'superadmin' to UserRole
   - Added `approvalStatus` field (approved | pending | rejected)
   - Added `rejectionReason` field

3. **Updated Service: `auth.service.ts`**
   - Maps approval_status from backend response
   - Maps rejection_reason from backend response

4. **Updated Router: `AppRoutes.tsx`**
   - Added `/pending-approval` route
   - Updated DashboardRedirect to check approval status
   - Redirects unapproved users to pending-approval page

5. **Updated Component: `ProtectedRoute.tsx`**
   - Checks approval status before rendering protected content
   - Redirects unapproved users to pending-approval page

### Backend Changes

1. **Updated `login.php`**
   - Added 'superadmin' to allowed roles
   - Changed auto-approval logic: only superadmin auto-approved
   - All other roles (faculty, admin, student) require explicit approval
   - Returns approval_status and rejection_reason in response
   - No longer returns 403 for pending users - they can login and will be redirected

2. **New Script: `alter_role_constraint.php`**
   - Updated database constraint to allow 'superadmin' role

3. **New Script: `create_superadmin.php`**
   - Creates a superadmin user for testing
   - Default credentials: superadmin@university.edu / superadmin123

## Login Flow

### Superadmin
1. Login with superadmin role
2. Auto-approved (approval_status = 'approved')
3. Redirected to SuperAdmin dashboard

### Faculty/Student/Admin
1. Login with respective role
2. If first time: approval_status set to 'pending'
3. Redirected to pending-approval page
4. Superadmin must approve via admin dashboard
5. After approval: can access dashboard on next login

## Approval Management

Superadmin can:
- View all pending users in "User Management" page
- Approve pending users
- Reject users with optional reason
- See rejection reason in user management

## Testing Credentials

### Superadmin
- Email: `superadmin@university.edu`
- Password: `superadmin123`
- Role: `superadmin`
- Status: Auto-approved

### Regular Users (for testing)
Can login with any email/password and will be auto-registered as:
- Role: student (default) or specified role
- Status: pending (waiting for superadmin approval)

## Files Modified

- `src/types/auth.types.ts` - Added approval fields
- `src/services/auth.service.ts` - Map approval status
- `src/contexts/AuthContext.tsx` - Handle pending users
- `src/routes/AppRoutes.tsx` - Added pending-approval route
- `src/components/auth/ProtectedRoute.tsx` - Check approval status
- `backend/auth/login.php` - Updated approval logic
- `backend/alter_role_constraint.php` - Updated role constraint
- `backend/create_superadmin.php` - Create superadmin user

## Files Created

- `src/pages/PendingApprovalPage.tsx` - UI for pending/rejected users
