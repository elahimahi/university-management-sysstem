import React from 'react';

const Rules = ({ rules = [] }) => (
  <ul className="list-disc pl-5 text-sm text-gray-600">
    {rules.map((rule, idx) => (
      <li key={idx}>{rule}</li>
    ))}
  </ul>
);

export default Rules;
