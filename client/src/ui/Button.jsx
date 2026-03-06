import React from 'react';

const Button = ({ type = 'button', children, className = '', ...props }) => (
  <button
    type={type}
    className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
