import React from 'react';
import { AnimatePresence } from 'framer-motion';
import NotificationBar from './NotificationBar';
import { Notification } from '../../hooks/useNotifications';

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  maxNotifications?: number;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
  position = 'top-right',
  maxNotifications = 5,
}) => {
  // Show only the most recent N notifications
  const visibleNotifications = notifications.slice(-maxNotifications);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification) => (
          <NotificationBar
            key={notification.id}
            id={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            duration={notification.duration}
            position={position}
            onClose={onClose}
            action={notification.action}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationContainer;
