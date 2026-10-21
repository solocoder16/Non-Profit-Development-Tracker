import React, { useState } from 'react';

export interface VineyardLogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const VineyardLogo: React.FC<VineyardLogoProps> = ({
  className = '',
  variant = 'horizontal',
  size = 'md',
  showSubtitle = false,
}) => {
  // Sizing definitions
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-xs tracking-wider font-extrabold',
    md: 'text-base sm:text-lg tracking-wide font-black',
    lg: 'text-xl sm:text-2xl tracking-wide font-black',
    xl: 'text-2xl sm:text-3xl tracking-wide font-black',
  };

  // High-precision SVG representation of the NGO Data Tracker emblem
  // Features the signature emerald circle (#00B074) with white metric columns & connected network nodes
  const SvgEmblem = ({ extraClass = '' }: { extraClass?: string }) => (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconSizes[size]} shrink-0 select-none drop-shadow-xs ${extraClass}`}
      aria-label="NGO Data Tracker Logo Emblem"
    >
      <circle cx="50" cy="50" r="48" fill="#00B074" />
      <path
        d="M24 74 C 36 78, 64 78, 76 74"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeOpacity="0.9"
      />
      <rect x="29" y="46" width="9" height="24" rx="4" fill="#FFFFFF" />
      <rect x="45.5" y="32" width="9" height="38" rx="4" fill="#FFFFFF" />
      <rect x="62" y="20" width="9" height="50" rx="4" fill="#FFFFFF" />
      <path
        d="M33.5 40 L50 26 L66.5 14"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="33.5" cy="40" r="3.5" fill="#FFFFFF" />
      <circle cx="50" cy="26" r="4" fill="#FFFFFF" />
      <circle cx="66.5" cy="14" r="4.5" fill="#FFFFFF" />
    </svg>
  );

  // If user requests icon only
  if (variant === 'icon') {
    return <SvgEmblem extraClass={className} />;
  }

  // Full stacked logo variant (Circle with NGO DATA TRACKER text beneath)
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center justify-center select-none ${className}`}>
        <div className="flex flex-col items-center justify-center gap-2">
          <SvgEmblem />
          <span className={`${textSizes[size]} text-slate-800 uppercase font-sans font-black leading-tight text-center`}>
            NGO DATA TRACKER
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] font-bold text-emerald-800 tracking-normal uppercase mt-1 text-center">
            Beneficiaries &amp; Community Activities
          </span>
        )}
      </div>
    );
  }

  // Default 'horizontal' variant (Emblem + text lockup)
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      <SvgEmblem />
      <div className="flex flex-col justify-center">
        <span className={`${textSizes[size]} text-slate-900 uppercase font-sans font-black leading-none tracking-wide whitespace-nowrap`}>
          NGO DATA TRACKER
        </span>
        {showSubtitle && (
          <span className="text-[10px] font-bold text-emerald-700 tracking-tight leading-tight mt-1 whitespace-nowrap">
            Beneficiaries &amp; Community Activities
          </span>
        )}
      </div>
    </div>
  );
};

// Clean semantic export
export const NgoDataTrackerLogo = VineyardLogo;
