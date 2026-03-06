import React from 'react';

const Table = ({ children, className = '', ...props }) => (
  <div className="overflow-x-auto">
    <table className={`min-w-full border border-gray-200 ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export default Table;
