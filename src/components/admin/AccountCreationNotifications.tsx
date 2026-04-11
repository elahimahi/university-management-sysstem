import React from 'react';
import AdminNotifications from './AdminNotifications';

/**
 * Account Creation Notifications
 * Shows only new faculty and student account creation alerts
 * Used in: User Management page, Account dashboard
 */
const AccountCreationNotifications: React.FC = () => {
  return (
    <AdminNotifications
      type="account_creation"
      title="👥 New Account Creations"
      subtitle="Faculty and student account creation alerts • Monitor new registrations"
    />
  );
};

export default AccountCreationNotifications;
