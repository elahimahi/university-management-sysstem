import React, { useState } from 'react';

const Tabs = ({ tabs, initial = 0, onChange }) => {
  const [active, setActive] = useState(initial);
  return (
    <div>
      <div className="flex border-b">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={`px-4 py-2 -mb-px border-b-2 focus:outline-none ${
              idx === active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
            aria-selected={idx === active}
            tabIndex={0}
            onClick={() => {
              setActive(idx);
              onChange && onChange(idx);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4">{tabs[active].content}</div>
    </div>
  );
};

export default Tabs;
