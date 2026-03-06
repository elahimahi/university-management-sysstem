import React from 'react';

const SectionHeading = ({ children, className = '', ...props }) => (
  <h2 className={`text-xl font-semibold mb-4 ${className}`} {...props}>
    {children}
  </h2>
);

export default SectionHeading;
