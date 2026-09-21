import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { type CartItem, formatPrice, getCartItemTotalPrice } from '@/types/menu';

export interface PaymentScreenProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onPaymentSuccess: () => void;
  language?: 'ENGLISH' | 'ARABIC';
  subtotal: number;
  serviceCharge: number;
  vat: number;
  tipAmount: number;
  discount?: number;
  grandTotal: number;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  isOpen,
  onClose,
  cart,
  onPaymentSuccess,
  language = 'ENGLISH',
  subtotal,
  serviceCharge,
  vat,
  tipAmount,
  discount = 0,
  grandTotal,
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  // Refs for auto-scrolling & focusing on validation error
  const customerFormRef = useRef<HTMLDivElement>(null);
  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Accordion open states
  const [isPayOnlineOpen, setIsPayOnlineOpen] = useState(true);
  const [isGetCheckOpen, setIsGetCheckOpen] = useState(true);

  // Selected payment option
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'gpay' | 'applepay' | 'cash' | 'pos_card'>('cash');

  // Confirmation modal state
  const [showWaitingModal, setShowWaitingModal] = useState(false);

  // Form validation error state
  const [showErrors, setShowErrors] = useState(false);

  const isArabic = language === 'ARABIC';

  // Handle auto confirmation transition when waiting modal is shown
  useEffect(() => {
    if (!showWaitingModal) return;
    const timer = setTimeout(() => {
      setShowWaitingModal(false);
      onPaymentSuccess();
    }, 3000);
    return () => clearTimeout(timer);
  }, [showWaitingModal, onPaymentSuccess]);

  if (!isOpen) return null;

  const handlePayNow = () => {
    if (!fullName.trim() || !phoneNumber.trim()) {
      setShowErrors(true);

      // Smooth scroll up to the customer information form section
      customerFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Focus the first empty required field
      setTimeout(() => {
        if (!fullName.trim()) {
          fullNameInputRef.current?.focus();
        } else if (!phoneNumber.trim()) {
          phoneInputRef.current?.focus();
        }
      }, 350);
      return;
    }

    setShowWaitingModal(true);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#f4f4f5] antialiased select-none overflow-y-auto flex flex-col justify-between ${
        isArabic ? 'font-sans rtl' : 'ltr'
      }`}
    >
      {/* Main Page Container: Responsive max-width for Mobile and Tablet */}
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-5 sm:pt-7 md:pt-10 pb-28 md:pb-36 space-y-5 md:space-y-7 flex-1">
        {/* Header Row: Back Arrow + Centered Title */}
        <header className="relative flex items-center justify-center py-2 md:py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white hover:bg-zinc-100 text-zinc-800 shadow-xs border border-zinc-200/60 flex items-center justify-center cursor-pointer transition-transform active:scale-95 rtl:left-auto rtl:right-0"
          >
            {isArabic ? <ArrowRight className="w-5 h-5 md:w-6 md:h-6" /> : <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />}
          </button>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
            {isArabic ? 'الدفع' : 'Payment'}
          </h1>
        </header>

        {/* 1. Customer Information Form Card */}
        <div ref={customerFormRef} className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs border border-zinc-100 space-y-4 md:space-y-5 scroll-mt-6">
          <h2 className="font-bold text-base sm:text-lg md:text-xl text-zinc-900">
            {isArabic ? 'معلومات العميل' : 'Customer Information'}
          </h2>

          <div className="space-y-3.5 sm:space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-zinc-800 mb-1.5">
                {isArabic ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
              </label>
              <div
                className={`bg-[#f4f4f5] rounded-2xl px-4 py-3 sm:py-3.5 flex items-center gap-3 border transition-colors ${
                  showErrors && !fullName.trim() ? 'border-red-400 bg-red-50/70 shadow-xs' : 'border-transparent focus-within:border-[#026F4F]'
                }`}
              >
                <User className={`w-5 h-5 shrink-0 ${showErrors && !fullName.trim() ? 'text-red-500' : 'text-zinc-400'}`} />
                <input
                  ref={fullNameInputRef}
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (showErrors) setShowErrors(false);
                  }}
                  placeholder={isArabic ? 'أدخل اسمك' : 'Enter your name'}
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none"
                />
              </div>
              {showErrors && !fullName.trim() && (
                <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'الاسم مطلوب' : 'Full name is required'}</span>
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-zinc-800 mb-1.5">
                {isArabic ? 'رقم الهاتف' : 'Phone Number'} <span className="text-red-500">*</span>
              </label>
              <div
                className={`bg-[#f4f4f5] rounded-2xl px-4 py-3 sm:py-3.5 flex items-center gap-3 border transition-colors ${
                  showErrors && !phoneNumber.trim() ? 'border-red-400 bg-red-50/70 shadow-xs' : 'border-transparent focus-within:border-[#026F4F]'
                }`}
              >
                <Phone className={`w-5 h-5 shrink-0 ${showErrors && !phoneNumber.trim() ? 'text-red-500' : 'text-zinc-400'}`} />
                <input
                  ref={phoneInputRef}
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (showErrors) setShowErrors(false);
                  }}
                  placeholder={isArabic ? 'أدخل رقم هاتفك' : 'Enter your number'}
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none"
                />
              </div>
              {showErrors && !phoneNumber.trim() && (
                <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'رقم الهاتف مطلوب' : 'Phone number is required'}</span>
                </p>
              )}
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-zinc-500 mb-1.5">
                {isArabic ? 'إرسال الإيصال إلى البريد الإلكتروني (اختياري)' : 'Send Receipt to Email (Optional)'}
              </label>
              <div className="bg-[#f4f4f5] rounded-2xl px-4 py-3 sm:py-3.5 flex items-center gap-3 border border-transparent focus-within:border-[#026F4F] transition-colors">
                <Mail className="w-5 h-5 text-zinc-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isArabic ? 'أدخل بريدك الإلكتروني...' : 'Enter your email...'}
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Order Summary Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs border border-zinc-100 space-y-4">
          <h2 className="font-bold text-base sm:text-lg md:text-xl text-zinc-900">
            {isArabic ? 'ملخص الطلب' : 'Order Summary'}
          </h2>

          <div className="space-y-3 sm:space-y-4 divide-y divide-zinc-100">
            {cart.map((ci) => (
              <div key={ci.item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 md:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-zinc-50 p-1.5 flex items-center justify-center shrink-0 border border-zinc-100">
                    <img
                      src={ci.item.imageUrl}
                      alt={ci.item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm md:text-base text-zinc-900 truncate">
                      {isArabic ? ci.item.nameAr || ci.item.name : ci.item.name}
                    </h3>
                    {ci.selectedOptions && ci.selectedOptions.length > 0 && (
                      <p className="text-[11px] sm:text-xs text-zinc-500 font-medium truncate">
                        {ci.selectedOptions.map((so) => so.optionName).join(', ')}
                      </p>
                    )}
                    {ci.specialInstructions && (
                      <p className="text-[11px] sm:text-xs text-zinc-400 font-normal italic truncate">
                        "{ci.specialInstructions}"
                      </p>
                    )}
                    <span className="text-xs sm:text-sm text-zinc-500 font-semibold block mt-0.5">
                      x{ci.quantity}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-extrabold text-xs sm:text-sm md:text-base text-[#026F4F]">
                    {formatPrice(getCartItemTotalPrice(ci), language)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-zinc-200 my-2 pt-3 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-zinc-400 font-medium">
              <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span className="text-zinc-800 font-bold">{formatPrice(subtotal, language)}</span>
            </div>

            <div className="flex justify-between text-zinc-400 font-medium">
              <span>{isArabic ? 'رسوم الخدمة (10%)' : 'Service Charge (10%)'}</span>
              <span className="text-zinc-800 font-bold">{formatPrice(serviceCharge, language)}</span>
            </div>

            <div className="flex justify-between text-zinc-400 font-medium">
              <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'VAT (5%)'}</span>
              <span className="text-zinc-800 font-bold">{formatPrice(vat, language)}</span>
            </div>

            <div className="flex justify-between text-zinc-400 font-medium">
              <span>{isArabic ? 'الإكرامية' : 'Tips'}</span>
              <span className="text-zinc-800 font-bold">{formatPrice(tipAmount, language)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-[#026F4F] font-medium">
                <span>{isArabic ? 'خصم العرض' : 'Promo Discount'}</span>
                <span className="font-bold">-{formatPrice(discount, language)}</span>
              </div>
            )}
          </div>

          {/* Dashed Separator Line */}
          <div className="border-b border-dashed border-zinc-200 my-2.5 md:my-3.5" />

          {/* Total Line */}
          <div className="flex justify-between items-center font-bold text-sm sm:text-base md:text-lg lg:text-xl pt-1">
            <span className="text-zinc-900">{isArabic ? 'المجموع' : 'Total'}</span>
            <span className="text-[#026F4F] font-bold text-base sm:text-lg md:text-xl lg:text-2xl">
              {formatPrice(grandTotal, language)}
            </span>
          </div>
        </div>

        {/* 3. Payment Method Options */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="font-bold text-base sm:text-lg md:text-xl text-zinc-900 px-1">
            {isArabic ? 'طريقة الدفع' : 'Payment Method'}
          </h2>

          {/* Accordion 1: Pay Online */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 overflow-hidden shadow-2xs">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => setIsPayOnlineOpen(!isPayOnlineOpen)}
              className="w-full p-4 sm:p-5 flex items-center justify-between bg-white cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden">
                  <img src="/images/payment/pay-online.svg" alt="Pay Online" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-sm sm:text-base text-zinc-900">
                  {isArabic ? 'الدفع عبر الإنترنت' : 'Pay Online'}
                </span>
              </div>
              {isPayOnlineOpen ? (
                <ChevronUp className="w-5 h-5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-400" />
              )}
            </button>

            {/* Accordion Content */}
            {isPayOnlineOpen && (
              <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 space-y-2.5 sm:space-y-3 border-t border-zinc-100">
                {/* Option 1: Credit / Debit Card */}
                <div
                  onClick={() => setSelectedMethod('card')}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedMethod === 'card'
                      ? 'border-[#026F4F] bg-emerald-50/40 shadow-xs'
                      : 'border-zinc-100 hover:border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src="/images/payment/credit-debit-pay.svg" alt="Credit / Debit Card" className="h-7 w-auto object-contain" />
                    <span className="font-bold text-xs sm:text-sm text-zinc-800">
                      {isArabic ? 'بطاقة ائتمان / خصم' : 'Credit / Debit Card'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 rtl:rotate-180" />
                </div>

                {/* Option 2: Google Pay */}
                <div
                  onClick={() => setSelectedMethod('gpay')}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedMethod === 'gpay'
                      ? 'border-[#026F4F] bg-emerald-50/40 shadow-xs'
                      : 'border-zinc-100 hover:border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src="/images/payment/google-pay.svg" alt="Google Pay" className="h-7 w-auto object-contain" />
                    <span className="font-bold text-xs sm:text-sm text-zinc-800">
                      Google Pay
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 rtl:rotate-180" />
                </div>

                {/* Option 3: Apple Pay */}
                <div
                  onClick={() => setSelectedMethod('applepay')}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedMethod === 'applepay'
                      ? 'border-[#026F4F] bg-emerald-50/40 shadow-xs'
                      : 'border-zinc-100 hover:border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src="/images/payment/apple-pay.svg" alt="Apple Pay" className="h-7 w-auto object-contain" />
                    <span className="font-bold text-xs sm:text-sm text-zinc-800">
                      Apple Pay
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 rtl:rotate-180" />
                </div>
              </div>
            )}
          </div>

          {/* Accordion 2: Get the Check */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 overflow-hidden shadow-2xs">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => setIsGetCheckOpen(!isGetCheckOpen)}
              className="w-full p-4 sm:p-5 flex items-center justify-between bg-white cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden">
                  <img src="/images/payment/get-check.svg" alt="Get the Check" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-sm sm:text-base text-zinc-900">
                  {isArabic ? 'الحصول على الفاتورة' : 'Get the Check'}
                </span>
              </div>
              {isGetCheckOpen ? (
                <ChevronUp className="w-5 h-5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-400" />
              )}
            </button>

            {/* Accordion Content */}
            {isGetCheckOpen && (
              <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 space-y-2.5 sm:space-y-3 border-t border-zinc-100">
                {/* Option 1: Cash */}
                <div
                  onClick={() => setSelectedMethod('cash')}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedMethod === 'cash'
                      ? 'border-[#026F4F] bg-emerald-50/40 shadow-xs'
                      : 'border-zinc-100 hover:border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src="/images/payment/cash.svg" alt="Cash" className="w-7 h-7 object-contain" />
                    <span className="font-bold text-xs sm:text-sm text-zinc-800">
                      {isArabic ? 'نقداً' : 'Cash'}
                    </span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-zinc-300 flex items-center justify-center">
                    {selectedMethod === 'cash' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                    )}
                  </div>
                </div>

                {/* Option 2: Card */}
                <div
                  onClick={() => setSelectedMethod('pos_card')}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedMethod === 'pos_card'
                      ? 'border-[#026F4F] bg-emerald-50/40 shadow-xs'
                      : 'border-zinc-100 hover:border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src="/images/payment/card-pay.svg" alt="Card" className="w-7 h-7 object-contain" />
                    <span className="font-bold text-xs sm:text-sm text-zinc-800">
                      {isArabic ? 'بطاقة' : 'Card'}
                    </span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-zinc-300 flex items-center justify-center">
                    {selectedMethod === 'pos_card' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar: Pay Now */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-[#f4f4f5]/90 backdrop-blur-md border-t border-zinc-200/60 py-3 sm:py-4 px-4 sm:px-6">
        <div className="w-full max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto">
          <button
            type="button"
            onClick={handlePayNow}
            className="w-full py-4 sm:py-4.5 px-6 sm:px-8 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-extrabold text-sm sm:text-base md:text-lg tracking-wide shadow-md flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
          >
            <span>{isArabic ? 'الدفع الآن' : 'Pay Now'}</span>
            <span className="font-extrabold text-base sm:text-lg md:text-xl">
              {formatPrice(grandTotal, language)}
            </span>
          </button>
        </div>
      </div>

      {/* Waiting for Confirmation Modal */}
      {showWaitingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl border border-zinc-100 animate-in zoom-in-95 duration-200">
            {/* Circular Green Spinner */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-emerald-100 border-t-[#026F4F] animate-spin mx-auto my-2" />

            <div>
              <h3 className="font-extrabold text-xl sm:text-2xl text-zinc-900 tracking-tight">
                {isArabic ? 'في انتظار التأكيد' : 'Waiting for Confirmation'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-2 max-w-xs mx-auto leading-relaxed">
                {isArabic
                  ? 'يرجى الانتظار بينما يؤكد الموظفون دفعك.'
                  : 'Please wait while staff confirms your payment.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
