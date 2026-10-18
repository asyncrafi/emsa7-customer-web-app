import React, { useState, useEffect } from 'react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useLanguage } from '@/providers/LanguageContext';

interface WaiterCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language?: 'ENGLISH' | 'ARABIC';
  tableName?: string;
}

export const WaiterCallModal: React.FC<WaiterCallModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language: propLanguage,
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = propLanguage || contextLanguage;

  useBodyScrollLock(isOpen);

  const [step, setStep] = useState<'confirm' | 'notifying' | 'success'>('confirm');

  // Reset step whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isArabic = activeLanguage === 'ARABIC';

  const handleCallNow = () => {
    setStep('notifying');
    // Simulate API notification delay
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1600);
    }, 1600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs select-none p-0 sm:p-4 animate-fade-in-overlay"
      onClick={onClose}
    >
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="w-full max-w-md bg-white rounded-t-[2.25rem] sm:rounded-3xl shadow-2xl p-5 sm:p-6 pb-7 animate-slide-up-modal relative overflow-hidden text-center transition-all font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Center Drag Handle Pill */}
        <div className="w-14 h-1 bg-zinc-300 rounded-full mx-auto mb-5" />

        {/* STEP 1: Confirmation View with Tall call-waiter.png Illustration */}
        {step === 'confirm' && (
          <div key="confirm" className="space-y-5 animate-slide-up-content">
            {/* Full Illustration Image Container matching Figma 100% without cropping */}
            <div className="w-full rounded-2xl overflow-hidden bg-[#fff6ee] flex items-center justify-center">
              <img
                src="/images/common/call-waiter.png"
                alt="Call Waiter Illustration"
                className="w-full h-auto object-contain rounded-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/food/ramen.png';
                }}
              />
            </div>

            {/* Title & Description */}
            <div className="pt-1 space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                {isArabic ? 'طلب النادل' : 'Call a Waiter'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-normal px-2 leading-relaxed max-w-xs mx-auto">
                {isArabic
                  ? 'هل تحتاج إلى مساعدة؟ سياتي أحد أفراد طاقمنا إلى طاولتك.'
                  : 'Do you need assistance? A staff member will come to your table.'}
              </p>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 sm:py-4 px-4 rounded-full border border-zinc-200 bg-[#eef0f2] hover:bg-zinc-200/90 text-zinc-800 font-bold text-sm sm:text-base tracking-wide transition-colors cursor-pointer text-center"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleCallNow}
                className="flex-1 py-3.5 sm:py-4 px-4 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-bold text-sm sm:text-base tracking-wide shadow-md transition-all active:scale-[0.98] cursor-pointer text-center"
              >
                {isArabic ? 'اطلب الآن' : 'Call Now'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Notifying Staff Loading View (Upwards Slide Animation) */}
        {step === 'notifying' && (
          <div key="notifying" className="py-14 sm:py-16 space-y-5 animate-slide-up-content">
            {/* Circular Spinner */}
            <div className="w-14 h-14 rounded-full border-4 border-emerald-100 border-t-[#026F4F] animate-spin mx-auto my-3" />

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                {isArabic ? 'جاري إبلاغ النادل' : 'Notifying Staff'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-normal">
                {isArabic ? 'يرجى الانتظار لحظة.' : 'Please wait a moment.'}
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Success View (Scaled Success Animation) */}
        {step === 'success' && (
          <div key="success" className="py-12 sm:py-14 space-y-5 animate-slide-up-content">
            {/* Green Scalloped Checkmark Badge Image */}
            <div className="w-20 h-20 mx-auto flex items-center justify-center animate-pop-success">
              <img
                src="/images/common/success.png"
                alt="Success Checkmark Badge"
                className="w-full h-full object-contain drop-shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                {isArabic ? 'تم بنجاح' : 'Success'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-normal">
                {isArabic ? 'تم إبلاغ النادل بنجاح' : 'Waiter has been notified'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
