import React from 'react';


const Button = ({ type = 'button', children, className = '', ...props }) => (
  <button
    type={type}
    className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 transition-transform duration-200 motion-reduce:transition-none hover:scale-[1.03] focus:scale-[1.03] ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
