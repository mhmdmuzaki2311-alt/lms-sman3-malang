import React from 'react';

export default function SmartiLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon: Blue Circular Ring with Swoosh & Checkmark */}
      <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Spiral / Swoosh in Cyan/Blue */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="#0284C7"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="220 50"
          />
          <circle
            cx="50"
            cy="50"
            r="30"
            stroke="#38BDF8"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="130 50"
            transform="rotate(45 50 50)"
          />
          {/* Inner Checkmark */}
          <path
            d="M36 50 L46 60 L66 40"
            stroke="#0284C7"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <span className="text-[19px] font-black tracking-tight text-[#0F172A]">
          SMARTI
        </span>
        <span className="text-[13px] font-semibold text-[#0284C7] tracking-normal -mt-0.5">
          Connect
        </span>
      </div>
    </div>
  );
}
