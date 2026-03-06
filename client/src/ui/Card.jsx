import React from 'react';


const Card = ({ children, className = '', ...props }) => (
  <div
    tabIndex={0}
    className={`bg-white rounded shadow p-4 transition-transform duration-300 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 hover:-translate-y-1 hover:shadow-lg ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
