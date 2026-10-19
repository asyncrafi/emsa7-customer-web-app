import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { type CartItem, formatPrice, getCartItemTotalPrice } from '@/types/menu';
import { useLanguage } from '@/providers/LanguageContext';

// Import downloaded Figma assets
import payOnlineThumb from '@/assets/8d330a1ecbca2cbf06d3bbe653ba94cc9d1c45ce.png';
import getCheckThumb from '@/assets/aacb11b1986c4fbe89e7246d2b7b4a8fdad3cb42.png';
import cardPosThumb from '@/assets/043670cd1f7fdd0f435d0395cb8b3e0cd98c0960.png';
import banknoteSvg from '@/assets/noto_dollar-banknote.svg';
import visaLogo from '@/assets/selfhst_visa.svg';
import mastercardLogo from '@/assets/logos_mastercard.svg';
import meezaLogo from '@/assets/meeza-seeklogo 1.svg';
import googlePayLogo from '@/assets/logos_google-pay.svg';
import applePayLogo from '@/assets/cib_cc-apple-pay.svg';
import arrowRightSvg from '@/assets/weui_arrow-outlined.svg';

export interface PaymentScreenProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onPaymentSuccess: () => void;
  language?: 'ENGLISH' | 'ARABIC';
  subtotal: number;
  serviceCharge: number;
  vat?: number;
  tipAmount?: number;
  splitFee?: number;
  discount?: number;
  grandTotal: number;
  tableName?: string;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  isOpen,
  onClose,
  cart,
  onPaymentSuccess,
  language: propLanguage,
  subtotal,
  serviceCharge: propServiceCharge,
  vat: propVat,
  tipAmount = 0,
  splitFee = 0,
  discount = 0,
  grandTotal,
  tableName = 'Table 07',
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = propLanguage || contextLanguage;
  const isArabic = activeLanguage === 'ARABIC';

  const serviceCharge =
    propServiceCharge !== undefined && propServiceCharge > 0
      ? propServiceCharge
      : Math.round(subtotal * 0.10 * 100) / 100;
  const vat =
    propVat !== undefined && propVat > 0
      ? propVat
      : Math.round(subtotal * 0.05 * 100) / 100;

  // Accordion open states matching Figma: Pay Online is primary open, Get the Check can toggle
  const [isPayOnlineOpen, setIsPayOnlineOpen] = useState(true);
  const [isGetCheckOpen, setIsGetCheckOpen] = useState(true);

  // Selected payment method
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'gpay' | 'applepay' | 'cash' | 'pos_card'>('cash');

  // Cash payment confirmation modal (Figma Frame 202:65)
  const [showWaitingModal, setShowWaitingModal] = useState(false);

  // Auto transition when waiting for confirmation from manager
  useEffect(() => {
    if (!showWaitingModal) return;
    const timer = setTimeout(() => {
      setShowWaitingModal(false);
      onPaymentSuccess();
    }, 3200);
    return () => clearTimeout(timer);
  }, [showWaitingModal, onPaymentSuccess]);

  if (!isOpen) return null;

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePayNow = () => {
    if (selectedMethod === 'cash' || selectedMethod === 'pos_card') {
      setShowWaitingModal(true);
    } else {
      // Simulate quick online transaction and succeed
      setShowWaitingModal(true);
    }
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#F4F4F5] antialiased select-none overflow-y-auto flex flex-col justify-between font-sans"
    >
      {/* Main Page Container: Strictly responsive mobile 440px width matching Figma Frame Payment (904:154) */}
      <div className="w-full max-w-[440px] mx-auto px-4 pt-4 pb-28 space-y-4 flex-1">
        {/* Header Row: 50x50 Back Circle Button (bg #E9E9E9) + Centered Title & Subtitle */}
        <header className="relative flex items-center justify-center py-2 min-h-[50px]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-full bg-[#E9E9E9] hover:bg-[#dedede] text-[#2D2F33] flex items-center justify-center cursor-pointer transition-transform active:scale-95 rtl:left-auto rtl:right-0 shadow-2xs"
          >
            {isArabic ? <ArrowRight className="w-5 h-5 text-[#2D2F33]" /> : <ArrowLeft className="w-5 h-5 text-[#2D2F33]" />}
          </button>

          <div className="text-center">
            <h1 className="text-[28px] font-medium text-[#2D2F33] tracking-tight leading-[130%]">
              {isArabic ? 'الدفع' : 'Payment'}
            </h1>
            <p className="text-[14px] text-[#686868] font-normal leading-[140%]">
              {isArabic ? `هذه الجلسة • ${tableName}` : `This session • ${tableName}`}
            </p>
          </div>
        </header>

        {/* 1. Order Summary Card matching Figma Frame 1171277086 (radius 13px bg white border #E9E9E9) */}
        <div className="bg-white rounded-[13px] p-4 shadow-2xs border border-[#E9E9E9] space-y-3.5">
          <h2 className="text-[19px] font-semibold text-[#2D2F33] leading-[140%]">
            {isArabic ? 'ملخص الطلب' : 'Order Summary'}
          </h2>

          <div className="space-y-3.5 divide-y divide-zinc-100">
            {cart.map((ci, idx) => (
              <div
                key={`${ci.item.id}-${idx}`}
                className="pt-3.5 first:pt-0 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-[64px] h-[64px] rounded-[7px] bg-[#F1F1F1] p-1 flex items-center justify-center shrink-0">
                    <img
                      src={ci.item.imageUrl || '/images/food/ramen.png'}
                      alt={ci.item.name}
                      className="w-[48px] h-[48px] object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/food/ramen.png';
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-[15px] font-medium text-[#2D2F33] leading-[140%] truncate">
                      {isArabic ? ci.item.nameAr || ci.item.name : ci.item.name}
                    </h3>
                    <p className="text-[11px] font-normal text-[#989898] leading-[140%] truncate">
                      {ci.selectedOptions && ci.selectedOptions.length > 0
                        ? `“${ci.selectedOptions.map((o) => o.optionName).join(', ')}”`
                        : ci.specialInstructions
                        ? `“${ci.specialInstructions}”`
                        : '“No Sauce”'}
                    </p>
                    <span className="text-[15px] font-medium text-[#000000] block mt-0.5 leading-[140%]">
                      x{ci.quantity}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[18px] font-semibold text-[#026F4F] leading-[140%]">
                    {formatPrice(getCartItemTotalPrice(ci), activeLanguage)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Payments Details Card matching Figma Frame 2147226327 */}
        <div className="bg-white rounded-[13px] p-4 shadow-2xs border border-[#E9E9E9] space-y-3">
          <h2 className="text-[19px] font-semibold text-[#2D2F33] leading-[140%]">
            {isArabic ? 'تفاصيل الدفع' : 'Payments Details'}
          </h2>

          <div className="space-y-2 text-[16px] font-normal leading-[140%]">
            <div className="flex justify-between items-center text-[#989898]">
              <span>{isArabic ? `المجموع الفرعي (${totalCartCount} أصناف)` : `Subtotal (${totalCartCount}items)`}</span>
              <span className="text-[#686868] font-semibold">{formatPrice(subtotal, activeLanguage)}</span>
            </div>

            <div className="flex justify-between items-center text-[#989898]">
              <span>{isArabic ? 'رسوم الخدمة (10%)' : 'Service Charge (10%)'}</span>
              <span className="text-[#686868] font-semibold">{formatPrice(serviceCharge, activeLanguage)}</span>
            </div>

            {vat > 0 && (
              <div className="flex justify-between items-center text-[#989898]">
                <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'VAT (5%)'}</span>
                <span className="text-[#686868] font-semibold">{formatPrice(vat, activeLanguage)}</span>
              </div>
            )}

            {tipAmount > 0 && (
              <div className="flex justify-between items-center text-[#989898]">
                <span>{isArabic ? 'الإكرامية' : 'Tips'}</span>
                <span className="text-[#686868] font-semibold">{formatPrice(tipAmount, activeLanguage)}</span>
              </div>
            )}

            {splitFee > 0 && (
              <div className="flex justify-between items-center text-rose-500">
                <span>{isArabic ? 'رسوم التقسيم' : 'Splitting Fees'}</span>
                <span className="font-semibold">{formatPrice(splitFee, activeLanguage)}</span>
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between items-center text-[#026F4F]">
                <span>{isArabic ? 'خصم العرض' : 'Promo Discount'}</span>
                <span className="font-semibold">-{formatPrice(discount, activeLanguage)}</span>
              </div>
            )}
          </div>

          {/* Dashed Separator Line matching Vector 13 */}
          <div className="border-b border-dashed border-[#989898] my-2" />

          {/* Total Line matching Figma Frame 2147226322 */}
          <div className="flex justify-between items-center pt-0.5">
            <span className="text-[17px] font-medium text-[#000000] leading-[140%]">
              {isArabic ? 'المجموع' : 'Total'}
            </span>
            <span className="text-[17px] font-semibold text-[#026F4F] leading-[140%]">
              {formatPrice(grandTotal, activeLanguage)}
            </span>
          </div>
        </div>

        {/* 3. Payment Method Section matching Figma Frame 2147226389 */}
        <div className="space-y-3.5 pt-1">
          <h2 className="text-[19px] font-semibold text-[#2D2F33] leading-[140%]">
            {isArabic ? 'طريقة الدفع' : 'Payment Method'}
          </h2>

          <div className="space-y-3.5">
            {/* Accordion 1: Pay Online (Frame 2147226332: radius 10px, border #026F4F) */}
            <div
              className={`bg-white rounded-[10px] border transition-all overflow-hidden ${
                isPayOnlineOpen ? 'border-[#026F4F] shadow-xs' : 'border-[#E9E9E9]'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsPayOnlineOpen(!isPayOnlineOpen)}
                className="w-full p-4 flex items-center justify-between cursor-pointer select-none bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-[42px] h-[42px] rounded-[5px] bg-[#E9E9E9] p-1.5 flex items-center justify-center shrink-0">
                    <img src={payOnlineThumb} alt="Pay Online" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[15px] font-medium text-[#2D2F33] leading-[140%]">
                    {isArabic ? 'الدفع عبر الإنترنت' : 'Pay Online'}
                  </span>
                </div>
                <div className="w-5 h-5 flex items-center justify-center text-[#2D2F33]">
                  {isPayOnlineOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Accordion Items List */}
              {isPayOnlineOpen && (
                <div className="px-4 pb-4 pt-1 space-y-2 border-t border-zinc-100/80">
                  {/* Option 1: Credit / Debit Card (Frame 2147226611) */}
                  <div
                    onClick={() => setSelectedMethod('card')}
                    className={`p-3 rounded-[8px] flex items-center justify-between cursor-pointer transition-colors ${
                      selectedMethod === 'card' ? 'bg-[#F1F9F6]' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-[28px] px-2 rounded-[5.3px] bg-[#F1F1F1] flex items-center gap-1.5">
                        <img src={visaLogo} alt="Visa" className="h-3 w-auto object-contain" />
                        <img src={mastercardLogo} alt="Mastercard" className="h-3 w-auto object-contain" />
                        <img src={meezaLogo} alt="Meeza" className="h-3 w-auto object-contain" />
                      </div>
                      <span className="text-[15px] font-medium text-[#2D2F33] leading-[140%]">
                        {isArabic ? 'بطاقة ائتمان / خصم' : 'Credit / Debit Card'}
                      </span>
                    </div>
                    <img src={arrowRightSvg} alt="" className="w-2.5 h-4 object-contain opacity-60 rtl:rotate-180" />
                  </div>

                  {/* Option 2: Google Pay (Frame 2147226379) */}
                  <div
                    onClick={() => setSelectedMethod('gpay')}
                    className={`p-3 rounded-[8px] flex items-center justify-between cursor-pointer transition-colors ${
                      selectedMethod === 'gpay' ? 'bg-[#F1F9F6]' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-[42px] h-[28px] rounded-[6px] bg-[#F1F1F1] flex items-center justify-center">
                        <img src={googlePayLogo} alt="Google Pay" className="h-4 w-auto object-contain" />
                      </div>
                      <span className="text-[15px] font-medium text-[#2D2F33] leading-[140%]">
                        Google Pay
                      </span>
                    </div>
                    <img src={arrowRightSvg} alt="" className="w-2.5 h-4 object-contain opacity-60 rtl:rotate-180" />
                  </div>

                  {/* Option 3: Apple Pay (Frame 2147226373) */}
                  <div
                    onClick={() => setSelectedMethod('applepay')}
                    className={`p-3 rounded-[8px] flex items-center justify-between cursor-pointer transition-colors ${
                      selectedMethod === 'applepay' ? 'bg-[#F1F9F6]' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-[42px] h-[28px] rounded-[6px] bg-[#F1F1F1] flex items-center justify-center">
                        <img src={applePayLogo} alt="Apple Pay" className="h-4 w-auto object-contain" />
                      </div>
                      <span className="text-[15px] font-medium text-[#2D2F33] leading-[140%]">
                        Apple Pay
                      </span>
                    </div>
                    <img src={arrowRightSvg} alt="" className="w-2.5 h-4 object-contain opacity-60 rtl:rotate-180" />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Get the Check (Frame 2147226329: radius 10px) */}
            <div
              className={`bg-white rounded-[10px] border transition-all overflow-hidden ${
                selectedMethod === 'cash' || selectedMethod === 'pos_card'
                  ? 'border-[#026F4F] shadow-xs'
                  : 'border-[#E9E9E9]'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsGetCheckOpen(!isGetCheckOpen)}
                className="w-full p-4 flex items-center justify-between cursor-pointer select-none bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-[42px] h-[42px] rounded-[5px] bg-[#E9E9E9] p-1.5 flex items-center justify-center shrink-0">
                    <img src={getCheckThumb} alt="Get the Check" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[15px] font-medium text-[#2D2F33] leading-[140%]">
                    {isArabic ? 'طلب الفاتورة' : 'Get the Check'}
                  </span>
                </div>
                <div className="w-5 h-5 flex items-center justify-center text-[#2D2F33]">
                  {isGetCheckOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Accordion Items List */}
              {isGetCheckOpen && (
                <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-zinc-100/80">
                  {/* Option 1: Cash (Frame 2147226364) */}
                  <div
                    onClick={() => setSelectedMethod('cash')}
                    className={`p-3 rounded-[8px] flex items-center justify-between cursor-pointer transition-colors ${
                      selectedMethod === 'cash' ? 'bg-[#F1F9F6]' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#E9E9E9] flex items-center justify-center shrink-0 p-1.5">
                        <img src={banknoteSvg} alt="Cash" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[15px] font-medium text-[#2D2F33] leading-[140%]">
                        {isArabic ? 'نقداً' : 'Cash'}
                      </span>
                    </div>

                    {/* Radio Button */}
                    <div className="w-5 h-5 rounded-full border-2 border-[#989898] flex items-center justify-center">
                      {selectedMethod === 'cash' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2D2F33]" />
                      )}
                    </div>
                  </div>

                  {/* Option 2: Card POS (Frame 2147226365) */}
                  <div
                    onClick={() => setSelectedMethod('pos_card')}
                    className={`p-3 rounded-[8px] flex items-center justify-between cursor-pointer transition-colors ${
                      selectedMethod === 'pos_card' ? 'bg-[#F1F9F6]' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#E9E9E9] flex items-center justify-center shrink-0 p-1.5">
                        <img src={cardPosThumb} alt="Card POS" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[15px] font-medium text-[#2D2F33] leading-[140%]">
                        {isArabic ? 'بطاقة عند الطاولة' : 'Card'}
                      </span>
                    </div>

                    {/* Radio Button */}
                    <div className="w-5 h-5 rounded-full border-2 border-[#989898] flex items-center justify-center">
                      {selectedMethod === 'pos_card' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2D2F33]" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar with Button: Pay Now matching Figma Button 904:182 */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-[#F4F4F5]/90 backdrop-blur-md border-t border-zinc-200/60 py-3.5 px-4">
        <div className="w-full max-w-[440px] mx-auto">
          <button
            type="button"
            onClick={handlePayNow}
            className="w-full h-[59px] rounded-[30px] bg-[#026F4F] hover:bg-[#025a40] text-white px-6 shadow-md flex items-center justify-between cursor-pointer transition-transform active:scale-[0.99]"
          >
            <span className="text-[16px] font-normal leading-[140%]">
              {isArabic ? 'الدفع الآن' : 'Pay Now'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-semibold leading-[140%]">
                {formatPrice(grandTotal, activeLanguage)}
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Cash payment Confirmation from manager Modal matching Figma Frame 202:65 (408x259 radius 12px bg white) */}
      {showWaitingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[408px] bg-white rounded-[12px] p-8 text-center space-y-4 shadow-2xl border border-zinc-100 animate-in zoom-in-95 duration-200">
            {/* Spinning Indicator matching Figma Group 1171276390 (56x56 Ellipse 689 #D9D9D9, Ellipse 690 #026F4F) */}
            <div className="relative w-14 h-14 mx-auto my-2">
              <svg className="w-full h-full animate-spin" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="24" stroke="#D9D9D9" strokeWidth="4" />
                <path
                  d="M28 4C41.2548 4 52 14.7452 52 28"
                  stroke="#026F4F"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-[23px] font-semibold text-[#2D2F33] leading-[130%] tracking-tight">
                {isArabic ? 'في انتظار التأكيد' : 'Waiting for Confirmation'}
              </h3>
              <p className="text-[13px] text-[#989898] font-normal leading-[140%] max-w-xs mx-auto">
                {isArabic
                  ? 'يرجى الانتظار بينما يؤكد الموظفون دفعك.'
                  : 'Please wait while staff confirms your cash payment.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
