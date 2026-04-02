import React from 'react';

interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => (
  <div className="mb-4">
    {children}
  </div>
);

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => (
  <h2 className="text-lg font-semibold">
    {children}
  </h2>
);

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, asChild }) => (
  <>{children}</>
);