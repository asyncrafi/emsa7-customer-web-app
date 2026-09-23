import React, { useState } from 'react';
import SvgEmsa7Icon from '@/components/ui/svg-icons/EMSA7Svg';
import { useDynamicTheme } from '@/providers/DynamicThemeProvider';
import { useLanguage } from '@/providers/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface TableConfirmedScreenProps {
  tableName?: string;
  onContinue?: () => void;
}

export const TableConfirmedScreen: React.FC<TableConfirmedScreenProps> = ({
  tableName = 'Table A8',
  onContinue,
}) => {
  const { themeConfig } = useDynamicTheme();
  const { language, setLanguage } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  return (
    <div className="w-full min-h-[100dvh] bg-[#f4f4f5] sm:bg-white flex flex-col justify-between items-center px-4 sm:px-8 md:px-10 py-5 sm:py-8 md:py-10 select-none antialiased overflow-x-hidden">
      {/* Top Header Row - Full Width Right Alignment for Mobile & Tablet */}
      <header className="w-full flex justify-end items-center max-w-6xl mx-auto">
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/25 bg-primary/10 text-primary text-[11px] sm:text-xs font-bold tracking-wide shadow-2xs hover:bg-primary/15 transition-colors cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/80" />
            <span>{language}</span>
            <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary/80" />
          </button>

          {/* Language Dropdown with English & Arabic */}
          {langDropdownOpen && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1.5 w-32 sm:w-36 bg-white border border-primary/20 rounded-2xl shadow-xl py-1.5 z-30 text-xs sm:text-sm overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setLanguage('ENGLISH');
                  setLangDropdownOpen(false);
                }}
                className={`w-full text-start px-3.5 sm:px-4 py-2 sm:py-2.5 transition-colors font-medium flex items-center justify-between cursor-pointer ${
                  language === 'ENGLISH'
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-zinc-700 hover:bg-primary/5'
                }`}
              >
                <span>English</span>
                {language === 'ENGLISH' && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLanguage('ARABIC');
                  setLangDropdownOpen(false);
                }}
                className={`w-full text-start px-3.5 sm:px-4 py-2 sm:py-2.5 transition-colors font-medium flex items-center justify-between cursor-pointer ${
                  language === 'ARABIC'
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-zinc-700 hover:bg-primary/5'
                }`}
              >
                <span>العربية</span>
                {language === 'ARABIC' && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Center Content Section */}
      <main className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col items-center justify-center space-y-6 sm:space-y-8 md:space-y-10 my-auto text-center px-2">

        {/* Main Restaurant Logo */}
        <div className="flex justify-center items-center">
          <img
            src="/trash/restaurant-logo.png"
            alt="Restaurant Logo"
            className="h-14 sm:h-20 md:h-24 lg:h-28 w-auto object-contain transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/emsa7-logo.png';
            }}
          />
        </div>

        {/* Green Table Ticket Card Component - Precision Alignment for Mobile & Tablet */}
        <div className="relative w-full max-w-[310px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[480px] aspect-[2.1/1] flex items-center pl-16 sm:pl-20 md:pl-24 lg:pl-28 pr-16 md:pr-24 lg:pr-28 drop-shadow-md transition-transform duration-300 hover:scale-[1.02]">
          {/* Ticket Background Image from public/images/auth/table-bg.png / table-bg-arabic.png */}
          <img
            src={language === 'ARABIC' ? '/images/auth/table-bg-arabic.png' : '/images/auth/table-bg.png'}
            alt="Table Background Ticket"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none rounded-2xl"
          />

          {/* Ticket Content: Table Name aligned with optimal gap from stars on mobile */}
          <div className="relative z-10 flex items-center w-full">
            <span className="text-[17px] sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-xs text-left">
              {tableName}
            </span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5 sm:space-y-2 pt-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight">
            {language === 'ARABIC' ? 'تم تأكيد الطاولة!' : 'Table Confirmed!'}
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg font-medium text-zinc-400">
            {language === 'ARABIC' ? 'أهلاً بكم في إمساح 7' : 'Welcome to EMSA7'}
          </p>
        </div>
      </main>

      {/* Bottom Footer & Primary Action Button */}
      <footer className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col items-center space-y-4 sm:space-y-5 pt-4">
        {/* Powered By EMSA7 - High Resolution SVG */}
        <a
          href="https://emsa7.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 leading-none cursor-pointer hover:opacity-80 transition-opacity no-underline"
        >
          <span className="text-[11px] sm:text-xs md:text-sm font-bold tracking-wider uppercase text-[#989898] inline-flex items-center">
            POWERED BY
          </span>
          <div className="inline-flex items-center justify-center my-auto shrink-0">
            <SvgEmsa7Icon className="h-4.5 sm:h-5 md:h-6 lg:h-7 w-auto" />
          </div>
        </a>

        {/* Full-width Rounded Continue Button */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full h-12 sm:h-13 md:h-14 lg:h-16 rounded-full text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl tracking-wide shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center"
          style={{ backgroundColor: themeConfig.primaryColor || '#026F4F' }}
        >
          {language === 'ARABIC' ? 'متابعة' : 'Continue'}
        </button>
      </footer>
    </div>
  );
};
