import React from 'react';

const SectionHeading = ({ children, className = '', level = 2, id, ...props }) => {
  const Tag = `h${level}`;
  return (
    <Tag className={`text-xl font-semibold mb-4 ${className}`} id={id} {...props}>
      {children}
    </Tag>
  );
};

export default SectionHeading;
