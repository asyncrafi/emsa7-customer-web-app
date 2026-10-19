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

            {/* Title & Description matching Figma (30px Bold #2D2F33, 16px #888888) */}
            <div className="pt-1 space-y-1.5 text-center">
              <h2 className="text-[26px] sm:text-[30px] font-bold text-[#2D2F33] leading-[140%] tracking-tight">
                {isArabic ? 'طلب النادل' : 'Call a Waiter'}
              </h2>
              <p className="text-[15px] sm:text-[16px] text-[#888888] font-normal px-2 leading-[140%] max-w-sm mx-auto">
                {isArabic
                  ? 'هل تحتاج إلى مساعدة؟ سياتي أحد أفراد طاقمنا إلى طاولتك.'
                  : 'Do you need assistance? A staff member will come to your table.'}
              </p>
            </div>

            {/* Action Buttons Row matching Figma Frame 1171277297 (h-59px, rounded-full, 19px medium) */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-[59px] rounded-full bg-[#E9E9E9] hover:bg-[#dedede] text-[#2D2F33] font-medium text-[17px] sm:text-[19px] leading-[140%] transition-colors cursor-pointer flex items-center justify-center text-center"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleCallNow}
                className="flex-1 h-[59px] rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-medium text-[17px] sm:text-[19px] leading-[140%] shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center text-center"
              >
                {isArabic ? 'اطلب الآن' : 'Call Now'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Notifying Staff Loading View (Figma id=224:595) */}
        {step === 'notifying' && (
          <div key="notifying" className="py-12 sm:py-14 space-y-5 animate-slide-up-content text-center">
            {/* Circular Spinner from Figma Group 1171276390 */}
            <img src="/icons/spinner-waiter.svg" alt="" className="w-14 h-14 mx-auto my-3 animate-spin" />

            <div className="space-y-1">
              <h2 className="text-[26px] sm:text-[30px] font-bold text-[#2D2F33] leading-[140%] tracking-tight">
                {isArabic ? 'جاري إبلاغ النادل' : 'Notifying Staff'}
              </h2>
              <p className="text-[16px] text-[#888888] font-normal leading-[140%]">
                {isArabic ? 'يرجى الانتظار لحظة.' : 'Please wait a moment.'}
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Success View (Figma id=224:620) */}
        {step === 'success' && (
          <div key="success" className="py-12 sm:py-14 space-y-5 animate-slide-up-content text-center">
            {/* Green Scalloped Checkmark Badge Image from Figma Group 105x105 */}
            <div className="w-[105px] h-[105px] mx-auto flex items-center justify-center animate-pop-success">
              <img
                src="/icons/success-badge.svg"
                alt="Success"
                className="w-[105px] h-[105px] object-contain drop-shadow-md"
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-[26px] sm:text-[30px] font-bold text-[#2D2F33] leading-[140%] tracking-tight">
                {isArabic ? 'تم بنجاح' : 'Success'}
              </h2>
              <p className="text-[16px] text-[#888888] font-normal leading-[140%]">
                {isArabic ? 'تم إبلاغ النادل بنجاح' : 'Waiter has been notified'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
