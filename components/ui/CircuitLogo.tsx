import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const CircuitLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-Tech Circuit Icon */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center`}>
        <div className="absolute inset-0 bg-cyan-500/10 rounded-lg border border-cyan-500/30 backdrop-blur-sm group-hover:border-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.15)]" />
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* IC Package Square */}
          <rect
            x="8"
            y="8"
            width="24"
            height="24"
            rx="4"
            className="stroke-cyan-500"
            strokeWidth="1.8"
            fill="#090e17"
          />

          {/* IC Pins */}
          <path d="M4 14H8M4 20H8M4 26H8" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M32 14H36M32 20H36M32 26H36" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 4V8M20 4V8M26 4V8" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 32V36M20 32V36M26 32V36" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />

          {/* Electronic Oscilloscope Waveform Inside Chip */}
          <path
            d="M12 20H15L17 15L20 25L23 17L25 22L27 20H28"
            stroke="#22d3ee"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circuit Node Dot */}
          <circle cx="20" cy="20" r="1.5" fill="#38bdf8" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className={`font-mono font-bold tracking-tight ${textSizes[size]} flex items-center`}>
          <span className="text-slate-100">CIRCUIT</span>
          <span className="text-cyan-400 font-extrabold ml-0.5 relative">
            IQ
            <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] tracking-wider text-slate-400 uppercase font-medium">
            Understand. Analyze. Master.
          </span>
        )}
      </div>
    </div>
  );
};
