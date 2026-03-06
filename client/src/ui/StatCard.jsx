import React from 'react';

const StatCard = ({ label, value, icon, className = '' }) => (
  <div className={`bg-white rounded shadow p-4 flex items-center gap-4 ${className}`}>
    {icon && <span className="text-2xl text-blue-500">{icon}</span>}
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  </div>
);

export default StatCard;
