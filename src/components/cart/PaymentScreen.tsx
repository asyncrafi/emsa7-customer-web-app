import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, User, Phone, Mail, AlertCircle } from 'lucide-react';
import { type CartItem, formatPrice, getCartItemTotalPrice } from '@/types/menu';
import { useLanguage } from '@/providers/LanguageContext';

export interface PaymentScreenProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  serviceCharge: number;
  vat: number;
  tipAmount: number;
  splitFee?: number;
  discount?: number;
  grandTotal: number;
  onPaymentSuccess: (details?: { fullName?: string; phoneNumber?: string; email?: string }) => void;
  language?: 'ENGLISH' | 'ARABIC';
  tableName?: string;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  isOpen,
  onClose,
  cart,
  subtotal,
  serviceCharge,
  vat,
  tipAmount,
  splitFee: _splitFee = 0,
  discount: _discount = 0,
  grandTotal,
  onPaymentSuccess,
  language: propLanguage,
  tableName = 'Table A8',
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = propLanguage || contextLanguage;
  const isArabic = activeLanguage === 'ARABIC';

  // Customer Information State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  // Accordion state
  const [payOnlineOpen, setPayOnlineOpen] = useState(true);
  const [getCheckOpen, setGetCheckOpen] = useState(false);

  // Payment Method selection: 'card' (online), 'apple_pay', 'google_pay', 'cash' (check), 'pos_card' (check)
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'apple_pay' | 'google_pay' | 'cash' | 'pos_card'>('card');

  // Waiting for Confirmation cash modal
  const [showCashWaitingModal, setShowCashWaitingModal] = useState(false);

  if (!isOpen) return null;

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePayNow = () => {
    if (!fullName.trim() || !phoneNumber.trim()) {
      setShowErrors(true);
      return;
    }

    if (selectedMethod === 'cash') {
      setShowCashWaitingModal(true);
      setTimeout(() => {
        setShowCashWaitingModal(false);
        onPaymentSuccess({ fullName, phoneNumber, email });
      }, 3500);
    } else {
      onPaymentSuccess({ fullName, phoneNumber, email });
    }
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#F4F4F5] antialiased select-none flex flex-col font-sans h-full w-full overflow-hidden"
    >
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 w-full">
        <div className="w-full max-w-[440px] mx-auto px-4 pt-4 pb-8 space-y-4">
          {/* Header Row: 42x42 Back Circle Button (bg #EEEEEE) + Centered Title & Subtitle */}
          <header className="relative flex items-center justify-center py-2 min-h-[46px]">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[42px] h-[42px] rounded-full bg-[#EEEEEE] hover:bg-zinc-200 text-[#2D2F33] flex items-center justify-center cursor-pointer transition-transform active:scale-95 rtl:left-auto rtl:right-0 shadow-xs"
            >
              {isArabic ? <ArrowRight className="w-5 h-5 text-[#2D2F33]" /> : <ArrowLeft className="w-5 h-5 text-[#2D2F33]" />}
            </button>

            <div className="text-center">
              <h1 className="text-[23px] font-semibold text-[#2D2F33] tracking-tight leading-[130%]">
                {isArabic ? 'الدفع' : 'Payment'}
              </h1>
              <p className="text-[13px] text-[#989898] font-normal leading-[140%]">
                {isArabic ? `هذه الجلسة • ${tableName}` : `This session • ${tableName}`}
              </p>
            </div>
          </header>

          {/* 1. Customer Information Card matching Figma Group 197:1351 / 932:1392 */}
          <div className="space-y-3 pt-1">
            <h2 className="text-[19px] font-semibold text-[#2D2F33] leading-[140%]">
              {isArabic ? 'معلومات العميل' : 'Customer Information'}
            </h2>

            <div className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#686868] flex items-center gap-1">
                  <span>{isArabic ? 'الاسم الكامل' : 'Full Name'}</span>
                  <span className="text-[#E05656]">*</span>
                </label>
                <div
                  className={`w-full h-[50px] rounded-[24px] bg-[#E9E9E9] px-4 flex items-center gap-3 transition-colors ${
                    showErrors && !fullName.trim() ? 'border border-[#E05656]' : 'border border-transparent'
                  }`}
                >
                  <User className="w-4.5 h-4.5 text-[#989898] shrink-0" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isArabic ? 'أدخل اسمك' : 'Enter your name'}
                    className="w-full bg-transparent text-[15px] text-[#2D2F33] placeholder:text-[#989898] font-medium outline-none"
                  />
                </div>
                {showErrors && !fullName.trim() && (
                  <p className="text-[11px] text-[#E05656] flex items-center gap-1 px-2 pt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{isArabic ? 'يرجى إدخال اسمك' : 'Please enter your full name'}</span>
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#686868] flex items-center gap-1">
                  <span>{isArabic ? 'رقم الهاتف' : 'Phone Number'}</span>
                  <span className="text-[#E05656]">*</span>
                </label>
                <div
                  className={`w-full h-[50px] rounded-[24px] bg-[#E9E9E9] px-4 flex items-center gap-3 transition-colors ${
                    showErrors && !phoneNumber.trim() ? 'border border-[#E05656]' : 'border border-transparent'
                  }`}
                >
                  <Phone className="w-4.5 h-4.5 text-[#989898] shrink-0" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={isArabic ? 'أدخل رقم هاتفك' : 'Enter your number'}
                    className="w-full bg-transparent text-[15px] text-[#2D2F33] placeholder:text-[#989898] font-medium outline-none"
                  />
                </div>
                {showErrors && !phoneNumber.trim() && (
                  <p className="text-[11px] text-[#E05656] flex items-center gap-1 px-2 pt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{isArabic ? 'يرجى إدخال رقم هاتفك' : 'Please enter your phone number'}</span>
                  </p>
                )}
              </div>

              {/* Send Receipt to Email (Optional) */}
              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#686868] flex items-center gap-1">
                  <span>{isArabic ? 'إرسال الإيصال إلى البريد (اختياري)' : 'Send Receipt to Email (Optional)'}</span>
                </label>
                <div className="w-full h-[50px] rounded-[24px] bg-[#E9E9E9] px-4 flex items-center gap-3 border border-transparent">
                  <Mail className="w-4.5 h-4.5 text-[#989898] shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isArabic ? 'أدخل بريدك الإلكتروني...' : 'Enter your email...'}
                    className="w-full bg-transparent text-[15px] text-[#2D2F33] placeholder:text-[#989898] font-medium outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Order Summary Card matching Figma */}
          <div className="bg-white rounded-[13px] p-4 shadow-2xs border border-[#E9E9E9] space-y-3.5">
            <h2 className="text-[17px] font-semibold text-[#2D2F33] leading-[140%]">
              {isArabic ? 'ملخص الطلب' : 'Order Summary'}
            </h2>

            <div className="space-y-3.5 divide-y divide-zinc-100">
              {cart.map((ci, idx) => (
                <div
                  key={`${ci.item.id}-${idx}`}
                  className="pt-3.5 first:pt-0 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-[56px] h-[56px] rounded-[7px] bg-[#F1F1F1] p-1 flex items-center justify-center shrink-0">
                      <img
                        src={ci.item.imageUrl || '/images/food/ramen.png'}
                        alt={ci.item.name}
                        className="w-[44px] h-[44px] object-contain"
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
                      <span className="text-[12px] font-semibold text-[#2D2F33] block mt-0.5 leading-[140%]">
                        x{ci.quantity}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-[16px] font-semibold text-[#026F4F] block leading-[140%]">
                      {formatPrice(getCartItemTotalPrice(ci), activeLanguage)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Payments Details Card matching Figma Frame 1171277086 */}
          <div className="bg-white rounded-[13px] p-4 shadow-2xs border border-[#E9E9E9] space-y-3">
            <h2 className="text-[17px] font-semibold text-[#2D2F33] leading-[140%]">
              {isArabic ? 'تفاصيل الدفع' : 'Payments Details'}
            </h2>

            <div className="space-y-2 text-[14px] font-normal leading-[140%]">
              <div className="flex justify-between items-center text-[#989898]">
                <span>{isArabic ? `المجموع الفرعي (${totalItemCount} أصناف)` : `Subtotal (${totalItemCount}items)`}</span>
                <span className="text-[#2D2F33] font-medium">{formatPrice(subtotal, activeLanguage)}</span>
              </div>

              <div className="flex justify-between items-center text-[#989898]">
                <span>{isArabic ? 'رسوم الخدمة (10%)' : 'Service Charge (10%)'}</span>
                <span className="text-[#2D2F33] font-medium">{formatPrice(serviceCharge, activeLanguage)}</span>
              </div>

              <div className="flex justify-between items-center text-[#989898]">
                <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'VAT (5%)'}</span>
                <span className="text-[#2D2F33] font-medium">{formatPrice(vat, activeLanguage)}</span>
              </div>

              {tipAmount > 0 && (
                <div className="flex justify-between items-center text-[#989898]">
                  <span>{isArabic ? 'الإكرامية' : 'Tips'}</span>
                  <span className="text-[#2D2F33] font-medium">{formatPrice(tipAmount, activeLanguage)}</span>
                </div>
              )}
            </div>

            {/* Dashed Separator Line matching Vector 13 */}
            <div className="border-b border-dashed border-[#E9E9E9] my-2" />

            {/* Total Line */}
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-[17px] font-medium text-[#2D2F33] leading-[140%]">
                {isArabic ? 'المجموع' : 'Total'}
              </span>
              <span className="text-[18px] font-semibold text-[#026F4F] leading-[140%]">
                {formatPrice(grandTotal, activeLanguage)}
              </span>
            </div>
          </div>

          {/* 4. Payment Method Accordion Section matching Figma Frame 2147226390 */}
          <div className="space-y-3">
            <h2 className="text-[19px] font-semibold text-[#2D2F33] leading-[140%]">
              {isArabic ? 'طريقة الدفع' : 'Payment Method'}
            </h2>

            {/* Accordion 1: Pay Online */}
            <div
              className={`bg-white rounded-[13px] border transition-colors overflow-hidden ${
                payOnlineOpen ? 'border-[#026F4F]' : 'border-[#E9E9E9]'
              }`}
            >
              <button
                type="button"
                onClick={() => setPayOnlineOpen((prev) => !prev)}
                className="w-full p-4 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#F1F1F1] flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                    <img
                      src="/src/assets/8d330a1ecbca2cbf06d3bbe653ba94cc9d1c45ce.png"
                      alt="Pay Online"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/logos_mastercard.svg';
                      }}
                    />
                  </div>
                  <span className="text-[15px] font-semibold text-[#2D2F33]">
                    {isArabic ? 'الدفع الإلكتروني' : 'Pay Online'}
                  </span>
                </div>
                {payOnlineOpen ? (
                  <ChevronUp className="w-5 h-5 text-[#2D2F33]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#2D2F33]" />
                )}
              </button>

              {payOnlineOpen && (
                <div className="px-4 pb-4 space-y-2.5 border-t border-zinc-100 pt-3">
                  {/* Option: Credit / Debit Card */}
                  <div
                    onClick={() => setSelectedMethod('card')}
                    className={`p-3.5 rounded-[12px] border flex items-center justify-between cursor-pointer transition-all ${
                      selectedMethod === 'card'
                        ? 'border-[#026F4F] bg-[#F8FAF9]'
                        : 'border-[#E9E9E9] bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-[#F4F4F5] px-2 py-1 rounded-[6px]">
                        <img src="/src/assets/logos_mastercard.svg" alt="Mastercard" className="h-4 w-auto object-contain" />
                        <img src="/src/assets/meeza-seeklogo 1.svg" alt="Meeza" className="h-4 w-auto object-contain" />
                      </div>
                      <span className="text-[14px] font-medium text-[#2D2F33]">
                        {isArabic ? 'بطاقة ائتمان / خصم' : 'Credit / Debit Card'}
                      </span>
                    </div>

                    <div className="w-5 h-5 rounded-full border-2 border-[#989898] flex items-center justify-center">
                      {selectedMethod === 'card' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#026F4F]" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Get the Check */}
            <div
              className={`bg-white rounded-[13px] border transition-colors overflow-hidden ${
                getCheckOpen ? 'border-[#026F4F]' : 'border-[#E9E9E9]'
              }`}
            >
              <button
                type="button"
                onClick={() => setGetCheckOpen((prev) => !prev)}
                className="w-full p-4 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#F1F1F1] flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                    <img
                      src="/src/assets/aacb11b1986c4fbe89e7246d2b7b4a8fdad3cb42.png"
                      alt="Get the Check"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icons/solar_bill-list-linear.svg';
                      }}
                    />
                  </div>
                  <span className="text-[15px] font-semibold text-[#2D2F33]">
                    {isArabic ? 'طلب الحساب' : 'Get the Check'}
                  </span>
                </div>
                {getCheckOpen ? (
                  <ChevronUp className="w-5 h-5 text-[#2D2F33]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#2D2F33]" />
                )}
              </button>

              {getCheckOpen && (
                <div className="px-4 pb-4 space-y-2.5 border-t border-zinc-100 pt-3">
                  {/* Cash Option */}
                  <div
                    onClick={() => setSelectedMethod('cash')}
                    className={`p-3.5 rounded-[12px] border flex items-center justify-between cursor-pointer transition-all ${
                      selectedMethod === 'cash'
                        ? 'border-[#026F4F] bg-[#F8FAF9]'
                        : 'border-[#E9E9E9] bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E9E9E9] flex items-center justify-center shrink-0">
                        <span className="text-base font-bold text-[#026F4F]">💵</span>
                      </div>
                      <span className="text-[14px] font-medium text-[#2D2F33]">
                        {isArabic ? 'نقداً (كاش)' : 'Cash'}
                      </span>
                    </div>

                    <div className="w-5 h-5 rounded-full border-2 border-[#989898] flex items-center justify-center">
                      {selectedMethod === 'cash' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#026F4F]" />
                      )}
                    </div>
                  </div>

                  {/* Card on POS Option */}
                  <div
                    onClick={() => setSelectedMethod('pos_card')}
                    className={`p-3.5 rounded-[12px] border flex items-center justify-between cursor-pointer transition-all ${
                      selectedMethod === 'pos_card'
                        ? 'border-[#026F4F] bg-[#F8FAF9]'
                        : 'border-[#E9E9E9] bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E9E9E9] flex items-center justify-center shrink-0">
                        <span className="text-base font-bold text-[#026F4F]">💳</span>
                      </div>
                      <span className="text-[14px] font-medium text-[#2D2F33]">
                        {isArabic ? 'بطاقة عند الاستلام' : 'Credit / Debit Card (at table)'}
                      </span>
                    </div>

                    <div className="w-5 h-5 rounded-full border-2 border-[#989898] flex items-center justify-center">
                      {selectedMethod === 'pos_card' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#026F4F]" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Bottom Action Bar: Always visible in viewport */}
      <div className="shrink-0 bg-[#F4F4F5]/95 backdrop-blur-md border-t border-zinc-200/60 py-3.5 px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom))]">
        <div className="w-full max-w-[409px] mx-auto">
          <button
            type="button"
            onClick={handlePayNow}
            className="w-full h-[59px] rounded-[30px] bg-[#026F4F] hover:bg-[#025a40] text-white px-6 shadow-md flex items-center justify-between cursor-pointer transition-transform active:scale-[0.99]"
          >
            <span className="text-[16px] font-normal leading-[140%]">
              {isArabic ? 'الدفع الآن' : 'Pay Now'}
            </span>
            <span className="text-[16px] font-semibold leading-[140%]">
              {formatPrice(grandTotal, activeLanguage)}
            </span>
          </button>
        </div>
      </div>

      {/* Cash payment Confirmation from manager modal (Figma Frame 202:65) */}
      {showCashWaitingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] p-6 max-w-[340px] w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-4 border-[#D9D9D9] border-t-[#026F4F] animate-spin" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-[18px] font-semibold text-[#2D2F33] leading-[140%]">
                {isArabic ? 'في انتظار التأكيد' : 'Waiting for Confirmation'}
              </h3>
              <p className="text-[13px] text-[#989898] leading-[140%]">
                {isArabic
                  ? 'يرجى الانتظار حتى يؤكد الموظف الدفع نقداً.'
                  : 'Please wait while staff confirms your cash payment.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
