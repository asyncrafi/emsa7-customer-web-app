import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle, Minus, Plus } from 'lucide-react';
import { type CartItem, formatPrice, getCartSubtotal, getCartItemTotalPrice } from '@/types/menu';
import { useLanguage } from '@/providers/LanguageContext';

export interface CheckoutScreenProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onIncrement: (itemId: string | number) => void;
  onDecrement: (itemId: string | number) => void;
  onRemove?: (itemId: string | number) => void;
  onClearCart?: () => void;
  onAddMoreItems?: () => void;
  onOrderSuccess: (details: {
    customerName: string;
    customerPhone: string;
    subtotal: number;
    serviceCharge: number;
    vat: number;
    tipAmount: number;
    splitFee: number;
    discount: number;
    grandTotal: number;
    selectedCart: CartItem[];
    paidItems: { originalIndex: number; quantity: number }[];
  }) => void;
  language?: 'ENGLISH' | 'ARABIC';
  tableName?: string;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  isOpen,
  onClose,
  cart,
  onIncrement,
  onDecrement,
  onOrderSuccess,
  language: propLanguage,
  tableName: _tableName = 'Table A8',
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = propLanguage || contextLanguage;
  const isArabic = activeLanguage === 'ARABIC';

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getCartSubtotal(cart);
  const serviceCharge = Math.round(subtotal * 0.10 * 100) / 100;
  const grandTotal = subtotal + serviceCharge;

  const handleConfirmOrder = () => {
    if (!fullName.trim() || !phoneNumber.trim()) {
      setShowErrors(true);
      if (!fullName.trim()) {
        fullNameRef.current?.focus();
      } else if (!phoneNumber.trim()) {
        phoneRef.current?.focus();
      }
      return;
    }

    onOrderSuccess({
      customerName: fullName.trim(),
      customerPhone: phoneNumber.trim(),
      subtotal,
      serviceCharge,
      vat: Math.round(subtotal * 0.05 * 100) / 100,
      tipAmount: 0,
      splitFee: 0,
      discount: 0,
      grandTotal,
      selectedCart: cart,
      paidItems: cart.map((ci, idx) => ({ originalIndex: idx, quantity: ci.quantity })),
    });
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#F4F4F5] antialiased select-none overflow-y-auto flex flex-col justify-between font-sans"
    >
      {/* Top Page Container: Strictly responsive mobile 440px width matching Figma Frame Place Order (841:172) */}
      <div className="w-full max-w-[440px] mx-auto px-4 pt-4 pb-28 space-y-4 flex-1">
        {/* Header Row: Back Arrow Circle (50x50 bg #E9E9E9) + Centered Title Place Order (Satoshi 28px font-medium #2D2F33) */}
        <header className="relative flex items-center justify-center py-2 min-h-[50px]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-full bg-[#E9E9E9] hover:bg-[#dedede] text-[#2D2F33] flex items-center justify-center cursor-pointer transition-transform active:scale-95 rtl:left-auto rtl:right-0 shadow-2xs"
          >
            {isArabic ? <ArrowRight className="w-5 h-5 text-[#2D2F33]" /> : <ArrowLeft className="w-5 h-5 text-[#2D2F33]" />}
          </button>

          <h1 className="text-[28px] font-medium text-[#2D2F33] tracking-tight leading-[140%]">
            {isArabic ? 'تقديم الطلب' : 'Place Order'}
          </h1>
        </header>

        {/* 1. Customer Information Section matching Figma Group 932:1392 */}
        <div className="space-y-3 pt-1">
          <h2 className="text-[19px] font-semibold text-[#2D2F33] leading-[140%]">
            {isArabic ? 'معلومات العميل' : 'Customer Information'}
          </h2>

          <div className="space-y-3.5">
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label className="block text-[16px] font-normal text-[#686868] leading-[140%]">
                {isArabic ? 'الاسم الكامل *' : 'Full Name *'}
              </label>
              <div
                className={`w-full h-[54px] rounded-[24px] bg-[#E9E9E9] px-4.5 flex items-center gap-3 border transition-colors ${
                  showErrors && !fullName.trim()
                    ? 'border-red-400 bg-red-50/70 shadow-xs'
                    : 'border-transparent focus-within:border-[#026F4F]'
                }`}
              >
                {/* Profile Icon matching iconamoon:profile-light */}
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#989898" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  ref={fullNameRef}
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (showErrors) setShowErrors(false);
                  }}
                  placeholder={isArabic ? 'أدخل اسمك' : 'Enter your name'}
                  className="w-full bg-transparent text-[16px] font-medium text-[#2D2F33] placeholder:text-[#989898] outline-none"
                />
              </div>
              {showErrors && !fullName.trim() && (
                <p className="text-[12px] text-red-500 font-medium flex items-center gap-1 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'يرجى إدخال الاسم' : 'Please enter your name'}</span>
                </p>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="space-y-1.5">
              <label className="block text-[16px] font-normal text-[#686868] leading-[140%]">
                {isArabic ? 'رقم الهاتف *' : 'Phone Number *'}
              </label>
              <div
                className={`w-full h-[54px] rounded-[24px] bg-[#E9E9E9] px-4.5 flex items-center gap-3 border transition-colors ${
                  showErrors && !phoneNumber.trim()
                    ? 'border-red-400 bg-red-50/70 shadow-xs'
                    : 'border-transparent focus-within:border-[#026F4F]'
                }`}
              >
                {/* Phone Icon matching solar:phone-line-duotone */}
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#989898" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <input
                  ref={phoneRef}
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (showErrors) setShowErrors(false);
                  }}
                  placeholder={isArabic ? 'أدخل رقم هاتفك' : 'Enter your number'}
                  className="w-full bg-transparent text-[16px] font-medium text-[#2D2F33] placeholder:text-[#989898] outline-none"
                />
              </div>
              {showErrors && !phoneNumber.trim() && (
                <p className="text-[12px] text-red-500 font-medium flex items-center gap-1 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'يرجى إدخال رقم الهاتف' : 'Please enter your phone number'}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 2. Order Summary Card matching Figma Frame 1987:566 */}
        <div className="bg-white rounded-[13px] p-4 shadow-2xs border border-[#E9E9E9] space-y-3.5 mt-2">
          <h2 className="text-[19px] font-semibold text-[#2D2F33] leading-[140%]">
            {isArabic ? 'ملخص الطلب' : 'Order Summary'}
          </h2>

          <div className="space-y-3.5 divide-y divide-zinc-100">
            {cart.map((ci, idx) => (
              <div
                key={`${ci.item.id}-${idx}`}
                className="pt-3.5 first:pt-0 flex items-center justify-between gap-3"
              >
                {/* Thumbnail & Item Details */}
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
                    <span className="text-[18px] font-semibold text-[#026F4F] block mt-0.5 leading-[140%]">
                      {formatPrice(getCartItemTotalPrice(ci), activeLanguage)}
                    </span>
                  </div>
                </div>

                {/* Stepper matching Figma Frame 1171276394 (radius 42px, bg #F1F1F1, padding (4, 5)) */}
                <div className="rounded-[42px] bg-[#F1F1F1] px-2.5 py-1 flex items-center gap-2.5 shrink-0 select-none">
                  <button
                    type="button"
                    onClick={() => onDecrement(idx)}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[#559F89] hover:text-[#026F4F] transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <span className="text-[15px] font-semibold text-[#2D2F33] min-w-[14px] text-center">
                    {ci.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onIncrement(idx)}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[#026F4F] hover:text-[#015139] transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Payments Details Card matching Figma Frame 841:254 */}
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
      </div>

      {/* Sticky Bottom Action Bar with Button: Confirm Order matching Figma Button 841:421 */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-[#F4F4F5]/90 backdrop-blur-md border-t border-zinc-200/60 py-3.5 px-4">
        <div className="w-full max-w-[440px] mx-auto">
          <button
            type="button"
            onClick={handleConfirmOrder}
            className="w-full h-[59px] rounded-[30px] bg-[#026F4F] hover:bg-[#025a40] text-white font-medium text-[19px] leading-[140%] shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
          >
            <span>{isArabic ? 'تأكيد الطلب' : 'Confirm Order'}</span>
            <div className="w-5 h-5 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
