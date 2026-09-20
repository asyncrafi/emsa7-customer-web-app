import React, { useEffect, useState } from 'react';
import SvgBellsIcon from '@/components/ui/svg-icons/BellsSvg';
import { X, CheckCircle2, Clock } from 'lucide-react';

interface WaiterCallToastProps {
  isOpen: boolean;
  tableName?: string;
  language?: 'ENGLISH' | 'ARABIC';
  onClose: () => void;
  onCancelCall?: () => void;
}

export const WaiterCallToast: React.FC<WaiterCallToastProps> = ({
  isOpen,
  tableName = 'Table A08',
  language = 'ENGLISH',
  onClose,
  onCancelCall,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(120);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in slide-in-from-top duration-300 select-none">
      <div className="relative bg-zinc-900 text-white rounded-2xl p-4 shadow-2xl border border-white/10 backdrop-blur-md flex items-start gap-3.5">
        {/* Animated Glowing Bell Icon Container */}
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 animate-pulse shadow-md">
          <div className="w-5 h-5 text-white flex items-center justify-center">
            <SvgBellsIcon className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {language === 'ARABIC'
                ? 'تم طلب النادل بنجاح!'
                : 'Waiter Called Successfully!'}
            </span>
          </div>
          <p className="text-xs text-zinc-300 font-medium mt-0.5 leading-tight">
            {language === 'ARABIC'
              ? `سيصل أحد أفراد الخدمة إلى ${tableName} قريباً.`
              : `A server is on their way to ${tableName}.`}
          </p>

          <div className="flex items-center gap-3 mt-2.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400 bg-white/10 px-2.5 py-0.5 rounded-full">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Est. {timeFormatted}</span>
            </span>

            {onCancelCall && (
              <button
                type="button"
                onClick={() => {
                  onCancelCall();
                  onClose();
                }}
                className="text-[11px] font-bold text-zinc-400 hover:text-white underline underline-offset-2 cursor-pointer transition-colors"
              >
                {language === 'ARABIC' ? 'إلغاء الطلب' : 'Cancel Request'}
              </button>
            )}
          </div>
        </div>

        {/* Dismiss Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors p-1 rounded-full cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
