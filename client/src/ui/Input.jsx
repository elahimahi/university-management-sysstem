import React from 'react';

const Input = React.forwardRef(({ label, id, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <input
      id={id}
      ref={ref}
      className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      {...props}
    />
  </div>
));

export default Input;
