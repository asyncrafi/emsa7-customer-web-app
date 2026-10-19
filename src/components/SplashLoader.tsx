import React from 'react';
import emsa7Logo from '@/assets/logo.png';

export const SplashLoader: React.FC = () => {

  return (
    <div className="w-full min-h-[100dvh] bg-[#f4f4f5] flex flex-col justify-between items-center px-4 py-8 select-none antialiased overflow-hidden font-sans">
      {/* Top Spacer */}
      <div className="h-4" />

      {/* Main Center Branding & Loading Section */}
      <div className="flex flex-col items-center justify-center space-y-4 max-w-sm w-full my-auto text-center">
        {/* Main EMSA7 Brand Logo */}
        <div className="flex justify-center items-center">
          <img
            src={emsa7Logo}
            alt="EMSA7"
            className="h-16 sm:h-20 max-w-[220px] sm:max-w-[250px] w-auto object-contain"
          />
        </div>

        {/* Powered By EMSA7 */}
        <div dir="ltr" className="inline-flex items-center justify-center gap-1.5 leading-none">
          <span className="text-[11px] sm:text-xs font-semibold tracking-[0.12em] uppercase text-[#989898] inline-flex items-center">
            POWERED BY
          </span>
          <div className="inline-flex items-center justify-center my-auto shrink-0">
            <img
              src="/emsa7-logo-grey.png"
              alt="EMSA7"
              className="h-4 w-auto object-contain"
            />
          </div>
        </div>

        {/* Animated Circular Spinner with #026F4F Primary Arc matching Figma */}
        <div className="pt-12 flex flex-col items-center space-y-3">
          <div className="relative w-10 h-10">
            {/* Background Light Ring */}
            <div className="absolute inset-0 rounded-full border-3 border-[#E5E5EA]" />
            {/* Active Spinning Arc */}
            <div
              className="absolute inset-0 rounded-full border-3 border-transparent border-t-[#026F4F] border-r-[#026F4F] animate-spin"
            />
          </div>

          {/* Subtitle Text */}
          <p className="text-xs sm:text-sm font-normal text-zinc-400">
            Preparing your experience...
          </p>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-4" />
    </div>
  );
};
