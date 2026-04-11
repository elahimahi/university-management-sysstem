import React from 'react';
import AdminNotifications from './AdminNotifications';

/**
 * Payment Context Notifications
 * Shows only payment-related notifications
 * Used in: Payment management pages, fees dashboard, payment status pages
 */
const PaymentNotifications: React.FC = () => {
  return (
    <AdminNotifications
      type="payment"
      title="💳 Payment Updates"
      subtitle="Real-time student payment tracking • Monitor transactions and status"
    />
  );
};

export default PaymentNotifications;
