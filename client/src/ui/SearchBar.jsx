import React from 'react';

const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '', ...props }) => (
  <div className="flex items-center gap-2">
    <input
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label="Search"
      className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      {...props}
    />
  </div>
);

export default SearchBar;
