import React, { useState } from 'react';
import SvgEmsa7Icon from '@/components/ui/svg-icons/EMSA7Svg';
import { useDynamicTheme } from '@/providers/DynamicThemeProvider';
import { useLanguage } from '@/providers/LanguageContext';
import { Languages, ChevronDown, Check } from 'lucide-react';

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

  // Normalize tableName to match Figma format (e.g. Table A08 -> Table A8)
  const displayTableName = tableName.replace(/Table\s+([A-Za-z])0+(\d+)/i, 'Table $1$2');

  return (
    <div className="w-full min-h-[100dvh] bg-[#f4f4f5] flex flex-col justify-between items-center px-4 sm:px-6 py-5 select-none antialiased overflow-x-hidden font-sans">
      {/* Top Header Row - Right-aligned Language Selector (aligned with ticket & button) */}
      <header className="w-full max-w-[360px] sm:max-w-[408px] flex justify-end items-center pt-1">
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-zinc-200/90 bg-white text-[#026F4F] text-[11px] sm:text-xs font-semibold tracking-wider shadow-2xs hover:border-zinc-300 transition-colors cursor-pointer"
          >
            <Languages className="h-3.5 w-3.5 text-[#026F4F]" />
            <span>{language === 'ARABIC' ? 'العربية' : 'ENGLISH'}</span>
            <ChevronDown
              className={`h-3 w-3 text-[#026F4F] transition-transform duration-200 ${
                langDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Backdrop for closing dropdown */}
          {langDropdownOpen && (
            <div
              className="fixed inset-0 z-20"
              onClick={() => setLangDropdownOpen(false)}
            />
          )}

          {/* Language Dropdown with English & Arabic */}
          {langDropdownOpen && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-36 bg-white border border-zinc-200/80 rounded-2xl shadow-xl py-1.5 z-30 text-xs sm:text-sm overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setLanguage('ENGLISH');
                  setLangDropdownOpen(false);
                }}
                className={`w-full text-start px-3.5 py-2.5 transition-colors font-medium flex items-center justify-between cursor-pointer ${
                  language === 'ENGLISH'
                    ? 'bg-[#026F4F]/10 text-[#026F4F] font-semibold'
                    : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <span>English</span>
                {language === 'ENGLISH' && (
                  <Check className="h-3.5 w-3.5 text-[#026F4F]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLanguage('ARABIC');
                  setLangDropdownOpen(false);
                }}
                className={`w-full text-start px-3.5 py-2.5 transition-colors font-medium flex items-center justify-between cursor-pointer ${
                  language === 'ARABIC'
                    ? 'bg-[#026F4F]/10 text-[#026F4F] font-semibold'
                    : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <span>العربية</span>
                {language === 'ARABIC' && (
                  <Check className="h-3.5 w-3.5 text-[#026F4F]" />
                )}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Center Content Section */}
      <main className="w-full max-w-[360px] sm:max-w-[408px] flex flex-col items-center justify-center my-auto text-center py-4">
        {/* Main EMSA7 Logo matching Figma */}
        <div className="flex justify-center items-center mb-7 sm:mb-8">
          <SvgEmsa7Icon className="h-12 sm:h-14 w-auto" />
        </div>

        {/* Green Table Ticket Card Component - Precision Alignment matching Figma */}
        <div className="relative w-full aspect-[408/212] flex items-center drop-shadow-md transition-transform duration-300 hover:scale-[1.01] mb-7 sm:mb-8">
          {/* Ticket Background Image from public/images/auth/table-bg.png / table-bg-arabic.png */}
          <img
            src={
              language === 'ARABIC'
                ? '/images/auth/table-bg-arabic.png'
                : '/images/auth/table-bg.png'
            }
            alt="Table Background Ticket"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          {/* Ticket Content: Table Name positioned next to the stars matching Figma */}
          <div
            className={`absolute inset-y-0 flex items-center z-10 ${
              language === 'ARABIC'
                ? 'right-[20%] sm:right-[21%] justify-end'
                : 'left-[20%] sm:left-[21%] justify-start'
            }`}
          >
            <span className="text-[20px] sm:text-2xl font-semibold text-white tracking-tight drop-shadow-xs">
              {displayTableName}
            </span>
          </div>
        </div>

        {/* Title & Subtitle matching Figma Properties (Satoshi/Cairo, 28px/600 #2D2F33 & 16px/500 #989898) */}
        <div className="text-center w-full max-w-[280px]">
          <h1 className="text-[28px] font-semibold text-[#2D2F33] tracking-normal leading-[140%]">
            {language === 'ARABIC' ? 'تم تأكيد الطاولة!' : 'Table Confirmed!'}
          </h1>
          <p className="text-[16px] font-medium text-[#989898] tracking-normal leading-[140%] mt-1">
            {language === 'ARABIC' ? 'أهلاً بكم في EMSA7' : 'Welcome to EMSA7'}
          </p>
        </div>
      </main>

      {/* Bottom Footer & Primary Action Button */}
      <footer className="w-full max-w-[360px] sm:max-w-[408px] flex flex-col items-center pt-4 pb-2 sm:pb-3">
        {/* Powered By EMSA7 (Strictly LTR brand lockup matching #989898 in Figma) */}
        <div className="mb-4 sm:mb-5">
          <a
            href="https://emsa7.com"
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="inline-flex items-center justify-center gap-1.5 leading-none cursor-pointer hover:opacity-80 transition-opacity no-underline"
          >
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.1em] uppercase text-[#989898] inline-flex items-center">
              POWERED BY
            </span>
            <div className="inline-flex items-center justify-center my-auto shrink-0">
              <SvgEmsa7Icon className="h-3.5 w-auto bg-[#989898]" />
            </div>
          </a>
        </div>

        {/* Full-width Rounded Continue Button */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full h-[52px] sm:h-14 rounded-full text-white font-semibold text-base sm:text-[17px] tracking-wide shadow-md shadow-[#026F4F]/15 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center"
          style={{ backgroundColor: themeConfig.primaryColor || '#026F4F' }}
        >
          {language === 'ARABIC' ? 'متابعة' : 'Continue'}
        </button>

        {/* iOS Home Indicator Bar */}
        <div className="w-32 h-1 bg-black/80 rounded-full mx-auto mt-4" />
      </footer>
    </div>
  );
};
