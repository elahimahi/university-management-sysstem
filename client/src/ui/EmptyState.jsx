import React from 'react';

const EmptyState = ({ icon, title, description, children }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
    {icon && <div className="mb-4 text-5xl">{icon}</div>}
    {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
    {description && <p className="mb-4">{description}</p>}
    {children}
  </div>
);

export default EmptyState;
