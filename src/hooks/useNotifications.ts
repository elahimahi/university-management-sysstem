import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const add = useCallback((
    title: string,
    type: Notification['type'] = 'info',
    options?: {
      message?: string;
      duration?: number;
      action?: Notification['action'];
    }
  ) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      type,
      title,
      message: options?.message,
      duration: options?.duration ?? 5000,
      action: options?.action,
    };

    setNotifications((prev) => [...prev, notification]);
    return id;
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const success = useCallback((title: string, options?: any) => {
    return add(title, 'success', options);
  }, [add]);

  const error = useCallback((title: string, options?: any) => {
    return add(title, 'error', options);
  }, [add]);

  const warning = useCallback((title: string, options?: any) => {
    return add(title, 'warning', options);
  }, [add]);

  const info = useCallback((title: string, options?: any) => {
    return add(title, 'info', options);
  }, [add]);

  const clear = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    add,
    remove,
    success,
    error,
    warning,
    info,
    clear,
  };
};
