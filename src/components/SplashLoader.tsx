import React from 'react';
import { useDynamicTheme } from '@/providers/DynamicThemeProvider';
import SvgEmsa7Icon from '@/components/ui/svg-icons/EMSA7Svg';

export const SplashLoader: React.FC = () => {
  const { themeConfig } = useDynamicTheme();

  return (
    <div className="w-full min-h-[100dvh] bg-white flex flex-col justify-between items-center px-4 py-8 sm:py-12 md:py-16 select-none antialiased overflow-hidden">
      {/* Top Spacer for vertical balance */}
      <div className="h-2 sm:h-6" />

      {/* Main Center Branding & Loading Section */}
      <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 max-w-sm sm:max-w-md w-full my-auto text-center">
        {/* Main Restaurant / Brand Logo */}
        <div className="flex justify-center items-center px-2">
          <img
            src="/trash/restaurant-logo.png"
            alt="Restaurant Logo"
            className="h-14 sm:h-20 md:h-24 w-auto max-w-[85vw] object-contain transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/emsa7-logo.png';
            }}
          />
        </div>

        {/* Powered By EMSA7 */}
        <div dir="ltr" className="inline-flex items-center justify-center gap-2 pt-1 leading-none">
          <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#989898] inline-flex items-center my-auto">
            POWERED BY
          </span>
          <div className="inline-flex items-center justify-center my-auto opacity-90 shrink-0">
            <SvgEmsa7Icon className="h-4 sm:h-5 w-auto" />
          </div>
        </div>

        {/* Animated Circular Spinner with #026F4F Primary Arc */}
        <div className="pt-8 sm:pt-12 flex flex-col items-center space-y-3 sm:space-y-4">
          <div className="relative w-9 h-9 sm:w-11 sm:h-11">
            {/* Background Light Ring */}
            <div className="absolute inset-0 rounded-full border-3 sm:border-4 border-[#e5e5e5]" />
            {/* Active Spinning Arc */}
            <div
              className="absolute inset-0 rounded-full border-3 sm:border-4 border-transparent animate-spin"
              style={{
                borderTopColor: themeConfig.primaryColor || '#026F4F',
                borderRightColor: themeConfig.primaryColor || '#026F4F',
              }}
            />
          </div>

          {/* Subtitle Text (#989898) */}
          <p className="text-xs sm:text-sm md:text-base font-medium tracking-wide pt-1 text-[#989898]">
            Preparing your experience...
          </p>
        </div>
      </div>

      {/* Bottom Spacer for perfect vertical alignment */}
      <div className="h-2 sm:h-6" />
    </div>
  );
};
