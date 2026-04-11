import React from 'react';
import AdminNotifications from './AdminNotifications';

/**
 * Registration Context Notifications
 * Shows only registration-related notifications
 * Used in: Registration approval pages, pending registration lists
 */
const RegistrationNotifications: React.FC = () => {
  return (
    <AdminNotifications
      type="registration"
      title="📋 Registration Approvals"
      subtitle="Pending faculty and student registrations • Monitor approval queue"
    />
  );
};

export default RegistrationNotifications;
