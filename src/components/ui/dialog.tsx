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
  const childArray = React.Children.toArray(children);
  const triggerChildren = childArray.filter(
    (child) => !React.isValidElement(child) || child.type !== DialogContent
  );
  const contentChildren = childArray.filter(
    (child): child is React.ReactElement => React.isValidElement(child) && child.type === DialogContent
  );

  return (
    <>
      {triggerChildren}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 rounded-3xl shadow-2xl shadow-slate-950/50 border border-slate-700/60 max-w-md w-full mx-4">
            {contentChildren}
          </div>
        </div>
      )}
    </>
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
  <h2 className="text-lg font-semibold text-slate-100">
    {children}
  </h2>
);

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, asChild }) => (
  <>{children}</>
);