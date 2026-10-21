import React from 'react';

interface PoweredByFooterProps {
  className?: string;
  theme?: 'light' | 'dark';
}

export const PoweredByFooter: React.FC<PoweredByFooterProps> = ({
  className = 'pt-8 pb-4',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`text-center select-none flex justify-center items-center ${className}`}>
      <a
        href="https://emsa7.com"
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        className="inline-flex items-center justify-center gap-1.5 leading-none cursor-pointer hover:opacity-80 transition-opacity no-underline"
      >
        <span
          className={`text-[11px] sm:text-xs font-semibold tracking-[0.12em] uppercase inline-flex items-center ${
            isDark ? 'text-zinc-400' : 'text-[#989898]'
          }`}
        >
          POWERED BY
        </span>
        <div className="inline-flex items-center justify-center my-auto shrink-0">
          <img
            src="/emsa7-logo-grey.png"
            alt="EMSA7"
            className={`h-4 w-auto object-contain ${isDark ? 'brightness-125' : ''}`}
          />
        </div>
      </a>
    </div>
  );
};

export default PoweredByFooter;
