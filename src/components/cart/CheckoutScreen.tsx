import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react';
import { type CartItem, formatPrice } from '@/types/menu';
import { QuantityControl } from '@/components/food/QuantityControl';
import { PaymentScreen } from '@/components/cart/PaymentScreen';
import SvgChairIcon from '@/components/ui/svg-icons/ChairSvg';

export interface CheckoutScreenProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onClearCart: () => void;
  onAddMoreItems: () => void;
  onOrderSuccess: () => void;
  language?: 'ENGLISH' | 'ARABIC';
  tableName?: string;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  isOpen,
  onClose,
  cart,
  onIncrement,
  onDecrement,
  onRemove: _onRemove,
  onClearCart: _onClearCart,
  onAddMoreItems,
  onOrderSuccess,
  language = 'ENGLISH',
  tableName = 'Table A8',
}) => {
  const [isSplitCheck, setIsSplitCheck] = useState(false);
  const [selectedSplitItemIds, setSelectedSplitItemIds] = useState<Set<string>>(
    new Set(cart.map((ci) => ci.item.id))
  );

  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'none' | 'applied' | 'error'>('none');

  const [selectedTip, setSelectedTip] = useState<'0' | '10' | '15' | 'custom'>('10');
  const [customTipAmount, setCustomTipAmount] = useState<string>('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!isOpen) return null;

  const isArabic = language === 'ARABIC';

  // Toggle single item selection for split check
  const toggleSplitItem = (itemId: string) => {
    setSelectedSplitItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Filter items if split check is ON
  const activeItems = isSplitCheck
    ? cart.filter((ci) => selectedSplitItemIds.has(ci.item.id))
    : cart;

  const subtotal = activeItems.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  const serviceCharge = subtotal * 0.1; // 10% Service Charge
  const vat = subtotal * 0.05; // 5% VAT

  let tipAmount = 0;
  if (selectedTip === '10') tipAmount = 10;
  else if (selectedTip === '15') tipAmount = 15;
  else if (selectedTip === 'custom') tipAmount = parseFloat(customTipAmount) || 0;

  const discount = promoStatus === 'applied' ? subtotal * 0.2 : 0;
  const grandTotal = Math.max(0, subtotal + serviceCharge + vat + tipAmount - discount);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME20') {
      setPromoStatus('applied');
    } else if (code.length > 0) {
      setPromoStatus('error');
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#f4f4f5] antialiased select-none overflow-y-auto flex flex-col justify-between ${
        isArabic ? 'font-sans rtl' : 'ltr'
      }`}
    >
      {/* Top Page Container with Responsive Max-Width for Mobile and Tablet */}
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
            {isArabic ? 'الدفع' : 'Checkout'}
          </h1>
        </header>

        {/* 1. Dining Location Green Banner Box with SvgChairIcon */}
        <div className="bg-[#026F4F] rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 text-white shadow-xs">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-2xs">
            <SvgChairIcon className="w-6 h-7 sm:w-7 sm:h-8 text-[#026F4F]" />
          </div>
          <div>
            <p className="text-emerald-100 text-xs sm:text-sm font-medium">
              {isArabic ? 'تناول الطعام في' : 'Dining at'}
            </p>
            <h2 className="text-white text-base sm:text-lg md:text-xl font-extrabold tracking-tight leading-snug">
              {tableName}
            </h2>
            <p className="text-emerald-100/80 text-[11px] sm:text-xs font-normal">
              {isArabic ? 'بجانب النافذة، الطابق الثاني' : 'Window Side, Floor 2'}
            </p>
          </div>
        </div>

        {/* 2. Split Check Toggle Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-100 flex items-center justify-between shadow-2xs">
          <span className="font-bold text-sm sm:text-base text-zinc-900">
            {isArabic ? 'تقسيم الفاتورة' : 'Split Check'}
          </span>

          <button
            type="button"
            onClick={() => setIsSplitCheck(!isSplitCheck)}
            aria-label="Toggle Split Check"
            className={`relative w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-colors cursor-pointer p-0.5 ${
              isSplitCheck ? 'bg-[#026F4F]' : 'bg-zinc-200'
            }`}
          >
            <span
              className={`block w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                isSplitCheck ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 3. Order Summary Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs border border-zinc-100 space-y-4">
          <h2 className="font-bold text-base sm:text-lg md:text-xl text-zinc-900">
            {isArabic ? 'ملخص الطلب' : 'Order Summary'}
          </h2>

          <div className="space-y-3.5 md:space-y-4 divide-y divide-zinc-100">
            {cart.map((ci) => {
              const isChecked = selectedSplitItemIds.has(ci.item.id);
              return (
                <div key={ci.item.id} className="pt-3.5 first:pt-0 flex items-center justify-between gap-3 md:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Checkbox for Split Check */}
                    {isSplitCheck && (
                      <button
                        type="button"
                        onClick={() => toggleSplitItem(ci.item.id)}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 border ${
                          isChecked ? 'bg-[#026F4F] border-[#026F4F] text-white' : 'border-zinc-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    )}

                    <div className="w-13 h-13 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl bg-zinc-50 p-2 flex items-center justify-center shrink-0 border border-zinc-100">
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
                      <p className="text-[11px] sm:text-xs text-zinc-400 font-normal italic">"No Sauce"</p>
                      <span className="font-extrabold text-xs sm:text-sm md:text-base text-[#026F4F] block mt-0.5">
                        {formatPrice(ci.item.price * ci.quantity, language)}
                      </span>
                    </div>
                  </div>

                  <div>
                    {isSplitCheck ? (
                      <span className="text-xs sm:text-sm font-bold text-zinc-500">
                        x{ci.quantity}
                      </span>
                    ) : (
                      <QuantityControl
                        quantity={ci.quantity}
                        onIncrement={() => onIncrement(ci.item.id)}
                        onDecrement={() => onDecrement(ci.item.id)}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* + Add More Items Link */}
          <div className="pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onAddMoreItems}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#026F4F] hover:text-[#025a40] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isArabic ? 'إضافة المزيد من الأصناف' : 'Add More Items'}</span>
            </button>
          </div>
        </div>

        {/* 4. Promo Code Card (Handles 3 states: Default, Valid, Error) */}
        <div>
          {promoStatus === 'applied' ? (
            <div className="bg-[#eef7f4] border border-emerald-200 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#026F4F] text-white flex items-center justify-center font-bold text-sm">
                  %
                </div>
                <span className="font-extrabold text-sm sm:text-base text-[#026F4F] tracking-wide">
                  {promoCode.toUpperCase()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPromoStatus('none');
                  setPromoCode('');
                }}
                className="w-6 h-6 rounded-full bg-[#026F4F] text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✓
              </button>
            </div>
          ) : promoStatus === 'error' ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm">
                  %
                </div>
                <span className="font-extrabold text-sm sm:text-base text-red-600 tracking-wide">
                  {promoCode.toUpperCase()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPromoStatus('none');
                  setPromoCode('');
                }}
                className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-zinc-200/80 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2.5 px-3 flex-1">
                <span className="text-zinc-400 font-bold text-sm">%</span>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder={isArabic ? 'أدخل رمز الترويجي' : 'ENTER PROMO CODE'}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-900 placeholder:text-zinc-400 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#026F4F] hover:bg-[#025a40] text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {isArabic ? 'تطبيق' : 'APPLY'}
              </button>
            </div>
          )}
        </div>

        {/* 5. Add a Tip Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs border border-zinc-100 space-y-3">
          <h2 className="font-bold text-base sm:text-lg md:text-xl text-zinc-900">
            {isArabic ? 'إضافة إكرامية' : 'Add a Tip'}
          </h2>

          <div className="grid grid-cols-4 gap-2 sm:gap-3 pt-1">
            {(['0', '10', '15', 'custom'] as const).map((tipOpt) => {
              const isSelected = selectedTip === tipOpt;
              const label = tipOpt === 'custom' ? (isArabic ? 'مخصص' : 'Custom') : tipOpt;
              return (
                <button
                  key={tipOpt}
                  type="button"
                  onClick={() => setSelectedTip(tipOpt)}
                  className={`py-2.5 sm:py-3 px-3 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-[#026F4F] text-white shadow-xs'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {selectedTip === 'custom' && (
            <div className="pt-2 animate-in fade-in duration-200">
              <input
                type="number"
                value={customTipAmount}
                onChange={(e) => setCustomTipAmount(e.target.value)}
                placeholder={isArabic ? 'مبلغ الإكرامية' : 'Tip Amount (EGP)'}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-semibold outline-none focus:border-[#026F4F]"
              />
            </div>
          )}

          <p className="text-[11px] sm:text-xs text-zinc-400 font-medium pt-1">
            {isArabic ? '* أعلى إكرامية اليوم كانت 10.00 ج.م' : '* Highest tip today was EGP 10.00'}
          </p>
        </div>

        {/* 6. Payments Details Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs border border-zinc-100 space-y-3 md:space-y-4">
          <h2 className="font-bold text-base sm:text-lg md:text-xl text-zinc-900">
            {isArabic ? 'تفاصيل الدفع' : 'Payments Details'}
          </h2>

          <div className="space-y-2 md:space-y-3 text-xs sm:text-sm md:text-base font-medium">
            <div className="flex justify-between text-zinc-400">
              <span>{isArabic ? `المجموع الفرعي (${activeItems.length} أصناف)` : `Subtotal (${activeItems.length}items)`}</span>
              <span className="text-zinc-800 font-bold">{formatPrice(subtotal, language)}</span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span>{isArabic ? 'رسوم الخدمة (10%)' : 'Service Charge (10%)'}</span>
              <span className="text-zinc-800 font-bold">{formatPrice(serviceCharge, language)}</span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'VAT (5%)'}</span>
              <span className="text-zinc-800 font-bold">{formatPrice(vat, language)}</span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span>{isArabic ? 'الإكرامية' : 'Tips'}</span>
              <span className="text-zinc-800 font-bold">{formatPrice(tipAmount, language)}</span>
            </div>

            {isSplitCheck && (
              <div className="flex justify-between text-rose-500 font-medium">
                <span>{isArabic ? 'رسوم التقسيم' : 'Splitting Fees'}</span>
                <span className="font-bold">{formatPrice(0, language)}</span>
              </div>
            )}

            {promoStatus === 'applied' && (
              <div className="flex justify-between text-[#026F4F] font-medium">
                <span>{isArabic ? 'خصم العرض (20%)' : 'Promo Discount (20%)'}</span>
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
      </div>

      {/* Sticky Bottom Action Bar: Continue to Payment */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-[#f4f4f5]/90 backdrop-blur-md border-t border-zinc-200/60 py-3 sm:py-4 px-4 sm:px-6">
        <div className="w-full max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="w-full py-4 sm:py-4.5 px-6 sm:px-8 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-extrabold text-sm sm:text-base md:text-lg tracking-wide shadow-md flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
          >
            <span>{isArabic ? 'متابعة الشراء' : 'Continue to Checkout'}</span>
            <span className="font-extrabold text-base sm:text-lg md:text-xl">
              {formatPrice(grandTotal, language)}
            </span>
          </button>
        </div>
      </div>

      {/* Payment Screen Modal */}
      <PaymentScreen
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cart={cart}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          onOrderSuccess();
        }}
        language={language}
        subtotal={subtotal}
        serviceCharge={serviceCharge}
        vat={vat}
        tipAmount={tipAmount}
        discount={discount}
        grandTotal={grandTotal}
      />
    </div>
  );
};
