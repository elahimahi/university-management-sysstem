import React from 'react';

const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded shadow p-4 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
