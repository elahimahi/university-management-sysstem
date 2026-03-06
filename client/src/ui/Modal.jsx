import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" role="dialog" aria-modal="true">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-6 relative">
        <button
          aria-label="Close modal"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          ×
        </button>
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
