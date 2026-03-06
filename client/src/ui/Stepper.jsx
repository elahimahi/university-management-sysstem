import React from 'react';

const Stepper = ({ steps = [], current = 0 }) => (
  <nav aria-label="Progress" className="flex items-center gap-2">
    {steps.map((step, idx) => (
      <div key={step} className="flex items-center gap-1">
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
            idx <= current ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-300'
          }`}
          aria-current={idx === current ? 'step' : undefined}
        >
          {idx + 1}
        </div>
        {idx < steps.length - 1 && <span className="w-8 h-1 bg-gray-200" />}
      </div>
    ))}
  </nav>
);

export default Stepper;
