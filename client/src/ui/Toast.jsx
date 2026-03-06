import React, { useEffect } from 'react';

const Toast = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50" role="alert">
      {message}
      <button
        aria-label="Close toast"
        onClick={onClose}
        className="ml-2 text-gray-300 hover:text-white focus:outline-none"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
