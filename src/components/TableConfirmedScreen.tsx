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

  return (
    <div className="w-full min-h-[100dvh] bg-[#F8F9FA] flex flex-col justify-between items-center px-5 sm:px-6 py-4 sm:py-6 select-none antialiased overflow-x-hidden">
      {/* Top Header Row - Right-aligned Language Selector */}
      <header className="w-full max-w-sm sm:max-w-md flex justify-end items-center pt-1">
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200/90 bg-white text-[#026F4F] text-[11px] sm:text-xs font-semibold tracking-wider shadow-xs hover:border-zinc-300 transition-colors cursor-pointer"
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
                    ? 'bg-[#026F4F]/10 text-[#026F4F] font-bold'
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
                    ? 'bg-[#026F4F]/10 text-[#026F4F] font-bold'
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
      <main className="w-full max-w-sm sm:max-w-md flex flex-col items-center justify-center my-auto text-center px-2 py-4">
        {/* Main Restaurant Logo */}
        <div className="flex justify-center items-center mb-7 sm:mb-8">
          <img
            src="/restaurant-logo.png"
            alt="EMSA7 Logo"
            className="h-11 sm:h-13 w-auto object-contain transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/emsa7-logo.svg';
            }}
          />
        </div>

        {/* Green Table Ticket Card Component - Precision Alignment matching Figma */}
        <div className="relative w-full max-w-[325px] sm:max-w-[360px] aspect-[1632/849] flex items-center drop-shadow-md transition-transform duration-300 hover:scale-[1.01] mb-7 sm:mb-8">
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

          {/* Ticket Content: Table Name aligned between stars and checkmark badge */}
          <div
            className={`relative z-10 w-full flex items-center ${
              language === 'ARABIC'
                ? 'pr-[22%] pl-[34%] justify-end text-right'
                : 'pl-[22%] pr-[34%] justify-start text-left'
            }`}
          >
            <span className="text-[19px] sm:text-2xl font-bold text-white tracking-tight drop-shadow-sm">
              {tableName}
            </span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5 text-center">
          <h1 className="text-[26px] sm:text-[28px] font-bold text-zinc-900 tracking-tight leading-tight">
            {language === 'ARABIC' ? 'تم تأكيد الطاولة!' : 'Table Confirmed!'}
          </h1>
          <p className="text-sm sm:text-[15px] font-normal text-zinc-400">
            {language === 'ARABIC' ? 'أهلاً بكم في إمساح 7' : 'Welcome to EMSA7'}
          </p>
        </div>
      </main>

      {/* Bottom Footer & Primary Action Button */}
      <footer className="w-full max-w-sm sm:max-w-md flex flex-col items-center pt-4 pb-2 sm:pb-4">
        {/* Powered By EMSA7 */}
        <div className="mb-4 sm:mb-5">
          <a
            href="https://emsa7.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 leading-none cursor-pointer hover:opacity-80 transition-opacity no-underline"
          >
            <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 inline-flex items-center">
              POWERED BY
            </span>
            <div className="inline-flex items-center justify-center my-auto shrink-0">
              <SvgEmsa7Icon className="h-3.5 sm:h-4 w-auto" />
            </div>
          </a>
        </div>

        {/* Full-width Rounded Continue Button */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full h-13 sm:h-14 rounded-full text-white font-semibold text-base sm:text-[17px] tracking-wide shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center"
          style={{ backgroundColor: themeConfig.primaryColor || '#026F4F' }}
        >
          {language === 'ARABIC' ? 'متابعة' : 'Continue'}
        </button>
      </footer>
    </div>
  );
};
