import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Plus, Percent, X } from 'lucide-react';
import { type CartItem, formatPrice, getCartSubtotal, getCartItemTotalPrice } from '@/types/menu';
import { QuantityControl } from '@/components/food/QuantityControl';
import { PaymentScreen } from '@/components/cart/PaymentScreen';
import { useLanguage } from '@/providers/LanguageContext';
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
  onOrderSuccess: (details: { subtotal: number; tipAmount: number; splitFee: number; discount: number; grandTotal: number; selectedCart: CartItem[]; paidItems: { originalIndex: number; quantity: number }[] }) => void;
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
  language: propLanguage,
  tableName = 'Table A8',
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = propLanguage || contextLanguage;
  const isArabic = activeLanguage === 'ARABIC';

  const [isSplitCheck, setIsSplitCheck] = useState(false);

  // Expand cart items into individual single-unit items when split check is ON
  const expandedSplitItems = React.useMemo(() => {
    const items: { splitId: string; cartItem: CartItem; singlePrice: number }[] = [];
    cart.forEach((ci, cartIdx) => {
      const singlePrice = getCartItemTotalPrice(ci) / ci.quantity;
      for (let i = 0; i < ci.quantity; i++) {
        items.push({
          splitId: `${ci.item.id}-${cartIdx}-${i}`,
          cartItem: ci,
          singlePrice,
        });
      }
    });
    return items;
  }, [cart]);

  const [selectedSplitIds, setSelectedSplitIds] = useState<Set<string>>(new Set());

  const handleToggleSplitCheck = () => {
    if (!isSplitCheck) {
      setSelectedSplitIds(new Set(expandedSplitItems.map((item) => item.splitId)));
    }
    setIsSplitCheck((prev) => !prev);
  };

  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'none' | 'applied' | 'error'>('none');

  const [selectedTip, setSelectedTip] = useState<'0' | '10' | '15' | 'custom' | null>(null);
  const [customTipAmount, setCustomTipAmount] = useState<string>('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!isOpen) return null;

  // Toggle single item selection for split check
  const toggleSplitItem = (splitId: string) => {
    setSelectedSplitIds((prev) => {
      const next = new Set(prev);
      if (next.has(splitId)) {
        next.delete(splitId);
      } else {
        next.add(splitId);
      }
      return next;
    });
  };

  const subtotal = isSplitCheck
    ? expandedSplitItems
        .filter((item) => selectedSplitIds.has(item.splitId))
        .reduce((sum, item) => sum + item.singlePrice, 0)
    : getCartSubtotal(cart);

  const activeItemCount = isSplitCheck
    ? expandedSplitItems.filter((item) => selectedSplitIds.has(item.splitId)).length
    : cart.reduce((sum, item) => sum + item.quantity, 0);

  const serviceCharge = Math.round(subtotal * 0.10 * 100) / 100;
  const vat = Math.round(subtotal * 0.05 * 100) / 100;

  let tipAmount = 0;
  if (selectedTip === '10') tipAmount = Math.round(subtotal * 0.10 * 100) / 100;
  else if (selectedTip === '15') tipAmount = Math.round(subtotal * 0.15 * 100) / 100;
  else if (selectedTip === 'custom') tipAmount = parseFloat(customTipAmount) || 0;

  const splitFee = isSplitCheck ? 0 : 0;
  const discount = promoStatus === 'applied' ? Math.round(subtotal * 0.20 * 100) / 100 : 0;
  const grandTotal = Math.max(0, subtotal + serviceCharge + vat + tipAmount + splitFee - discount);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME20') {
      setPromoStatus('applied');
    } else if (code.length > 0) {
      setPromoStatus('error');
    }
  };

  const { selectedCart, paidItems } = React.useMemo(() => {
    if (!isSplitCheck) {
      return { 
        selectedCart: cart,
        paidItems: cart.map((ci, idx) => ({ originalIndex: idx, quantity: ci.quantity }))
      };
    }
    const itemsToPay = expandedSplitItems.filter((item) => selectedSplitIds.has(item.splitId));
    
    // Group back by cartItem reference
    const grouped = new Map<CartItem, number>();
    for (const splitItem of itemsToPay) {
      grouped.set(splitItem.cartItem, (grouped.get(splitItem.cartItem) || 0) + 1);
    }
    
    const paidItemsInfo = Array.from(grouped.entries()).map(([ci, qty]) => ({
      originalIndex: cart.indexOf(ci),
      quantity: qty
    }));

    const selectedCartArray = Array.from(grouped.entries()).map(([ci, qty]) => ({
      ...ci,
      quantity: qty,
    }));

    return { selectedCart: selectedCartArray, paidItems: paidItemsInfo };
  }, [isSplitCheck, expandedSplitItems, selectedSplitIds, cart]);

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#f4f4f5] antialiased select-none overflow-y-auto flex flex-col justify-between font-sans"
    >
      {/* Top Page Container: Strictly responsive mobile 440px width matching Figma */}
      <div className="w-full max-w-[440px] mx-auto px-4 pt-4 pb-28 space-y-4">
        {/* Header Row: Back Arrow + Centered Title */}
        <header className="relative flex items-center justify-center py-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#EEEEEE] hover:bg-zinc-200 text-zinc-800 flex items-center justify-center cursor-pointer transition-transform active:scale-95 rtl:left-auto rtl:right-0"
          >
            {isArabic ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>

          <h1 className="text-xl sm:text-2xl font-semibold text-[#2D2F33] tracking-tight">
            {isArabic ? 'إتمام الطلب' : 'Checkout'}
          </h1>
        </header>

        {/* 1. Dining Location Green Banner Box with SvgChairIcon */}
        <div className="bg-[#026F4F] rounded-[16px] p-4 flex items-center gap-3.5 text-white shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] flex items-center justify-center shrink-0">
            <SvgChairIcon className="w-7 h-7 text-[#026F4F]" />
          </div>
          <div>
            <p className="text-emerald-100 text-xs font-normal">
              {isArabic ? 'تناول الطعام في' : 'Dining at'}
            </p>
            <h2 className="text-white text-base font-semibold tracking-tight leading-snug">
              {tableName}
            </h2>
            <p className="text-emerald-100/80 text-xs font-normal">
              {isArabic ? 'بجانب النافذة، الطابق الثاني' : 'Window Side, Floor 2'}
            </p>
          </div>
        </div>

        {/* 2. Split Check Toggle Card matching Figma */}
        <div className="bg-white rounded-[16px] p-4 border border-[#F4F4F5] flex items-center justify-between shadow-2xs">
          <span className="font-semibold text-sm text-[#2D2F33]">
            {isArabic ? 'تقسيم الفاتورة' : 'Split Check'}
          </span>

          <button
            type="button"
            onClick={handleToggleSplitCheck}
            aria-label="Toggle Split Check"
            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer p-0.5 ${
              isSplitCheck ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                isSplitCheck ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 3. Order Summary Card */}
        <div className="bg-white rounded-[16px] p-4 shadow-2xs border border-[#F4F4F5] space-y-3">
          <h2 className="font-semibold text-base text-[#2D2F33]">
            {isArabic ? 'ملخص الطلب' : 'Order Summary'}
          </h2>

          <div className="space-y-3 divide-y divide-zinc-100">
            {isSplitCheck
              ? expandedSplitItems.map((splitItem) => {
                  const isChecked = selectedSplitIds.has(splitItem.splitId);
                  const ci = splitItem.cartItem;

                  return (
                    <div
                      key={splitItem.splitId}
                      onClick={() => toggleSplitItem(splitItem.splitId)}
                      className="pt-3 first:pt-0 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Checkbox matching Figma Checkout ( Split Bill ).png */}
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                            isChecked
                              ? 'bg-[#026F4F] text-white'
                              : 'border border-zinc-400 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="w-14 h-14 rounded-xl bg-[#F4F5F7] p-1.5 flex items-center justify-center shrink-0">
                          <img
                            src={ci.item.imageUrl}
                            alt={ci.item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm text-[#2D2F33] truncate">
                            {isArabic ? ci.item.nameAr || ci.item.name : ci.item.name}
                          </h3>
                          <p className="text-xs text-[#8E8E93] font-normal truncate">
                            {ci.selectedOptions && ci.selectedOptions.length > 0
                              ? `"${ci.selectedOptions.map((so) => so.optionName).join(', ')}"`
                              : ci.specialInstructions
                              ? `"${ci.specialInstructions}"`
                              : '"No Sauce"'}
                          </p>
                          <span className="text-xs font-semibold text-[#2D2F33] block mt-0.5">
                            x1
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <span className="font-semibold text-sm text-[#026F4F]">
                          {formatPrice(splitItem.singlePrice, activeLanguage)}
                        </span>
                      </div>
                    </div>
                  );
                })
              : cart.map((ci) => {
                  return (
                    <div
                      key={ci.item.id}
                      className="pt-3 first:pt-0 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-[#F4F5F7] p-1.5 flex items-center justify-center shrink-0">
                          <img
                            src={ci.item.imageUrl}
                            alt={ci.item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-[#2D2F33] truncate">
                            {isArabic ? ci.item.nameAr || ci.item.name : ci.item.name}
                          </h3>
                          {ci.selectedOptions && ci.selectedOptions.length > 0 && (
                            <p className="text-xs text-zinc-500 font-normal truncate">
                              {ci.selectedOptions.map((so) => so.optionName).join(', ')}
                            </p>
                          )}
                          {ci.specialInstructions && (
                            <p className="text-xs text-zinc-400 font-normal italic truncate">
                              "{ci.specialInstructions}"
                            </p>
                          )}
                          <span className="font-semibold text-sm sm:text-base text-[#026F4F] block mt-0.5">
                            {formatPrice(getCartItemTotalPrice(ci), activeLanguage)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <QuantityControl
                          quantity={ci.quantity}
                          onIncrement={() => onIncrement(ci.item.id)}
                          onDecrement={() => onDecrement(ci.item.id)}
                          size="sm"
                        />
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* + Add More Items Link (Figma-Exact: Directly below card on page background) */}
        <div className="py-0.5">
          <button
            type="button"
            onClick={onAddMoreItems}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#026F4F] hover:text-[#025a40] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isArabic ? 'إضافة المزيد من الأصناف' : 'Add More Items'}</span>
          </button>
        </div>

        {/* 4. Promo Code Card (Figma-Exact 3 states: Default, Applied, Denied) */}
        {promoStatus === 'applied' ? (
          <div className="bg-[#EAF5F0] rounded-[16px] p-3 border border-[#D4EBE0] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#D4EBE0] flex items-center justify-center text-[#026F4F]">
                <Percent className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-semibold text-xs text-[#026F4F] tracking-wider uppercase">
                {promoCode || 'WELCOME20'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPromoStatus('none');
                setPromoCode('');
              }}
              className="w-6 h-6 rounded-full bg-[#026F4F] text-white flex items-center justify-center cursor-pointer shadow-2xs hover:bg-[#025a40] transition-colors"
              title="Remove promo code"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        ) : promoStatus === 'error' ? (
          <div className="bg-[#FDF0F0] rounded-[16px] p-3 border border-[#FADBD8] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FADBD8] flex items-center justify-center text-[#E05656]">
                <Percent className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-semibold text-xs text-[#E05656] tracking-wider uppercase">
                {promoCode || 'WELCOME20'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPromoStatus('none');
                setPromoCode('');
              }}
              className="w-6 h-6 rounded-full bg-[#E05656] text-white flex items-center justify-center cursor-pointer shadow-2xs hover:bg-[#c93f3f] transition-colors"
              title="Clear"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[16px] p-2 pl-3 border border-[#F4F4F5] shadow-2xs flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
              <Percent className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder={isArabic ? 'أدخل رمز العرض' : 'ENTER PROMO CODE'}
              className="flex-1 bg-transparent px-2 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 placeholder:font-medium font-medium uppercase outline-none"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="px-5 py-2.5 rounded-xl bg-[#026F4F] hover:bg-[#025a40] text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer shrink-0 shadow-xs active:scale-95"
            >
              {isArabic ? 'تطبيق' : 'APPLY'}
            </button>
          </div>
        )}

        {/* 5. Add a Tip Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-100 space-y-3 shadow-2xs">
          <span className="font-semibold text-xs sm:text-sm text-[#2D2F33] block">
            {isArabic ? 'إضافة إكرامية' : 'Add a Tip'}
          </span>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: '0', label: '0%' },
              { id: '10', label: '10%' },
              { id: '15', label: '15%' },
              { id: 'custom', label: isArabic ? 'مخصص' : 'Custom' },
            ].map((tip) => (
              <button
                key={tip.id}
                type="button"
                onClick={() => setSelectedTip(tip.id as any)}
                className={`py-2.5 px-2 rounded-full text-xs sm:text-sm border transition-all cursor-pointer text-center ${
                  selectedTip === tip.id
                    ? 'bg-[#026F4F] border-[#026F4F] text-white font-semibold shadow-xs'
                    : 'bg-white border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50'
                }`}
              >
                {tip.label}
              </button>
            ))}
          </div>

          {selectedTip === 'custom' && (
            <input
              type="number"
              value={customTipAmount}
              onChange={(e) => setCustomTipAmount(e.target.value)}
              placeholder={isArabic ? 'مبلغ الإكرامية' : 'Enter tip amount ($)'}
              className="w-full bg-[#f4f4f5] border border-zinc-200/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 font-medium focus:outline-none focus:border-[#026F4F] focus:bg-white transition-all mt-2"
            />
          )}

          {/* Highest tip today note */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-zinc-400 pt-0.5">
            <span className="text-rose-500 font-semibold">*</span>
            <span>
              {isArabic
                ? 'أعلى إكرامية اليوم كانت $10.00'
                : 'Highest tip today was $10.00'}
            </span>
          </div>
        </div>

        {/* 6. Payments Details Card (Figma-Exact Frame 1171277086) */}
        <div className="bg-white rounded-[16px] p-4 sm:p-5 shadow-2xs border border-[#F4F4F5] space-y-3">
          <h2 className="font-semibold text-base text-[#2D2F33]">
            {isArabic ? 'تفاصيل الدفع' : 'Payments Details'}
          </h2>

          <div className="space-y-2 text-sm font-medium">
            <div className="flex justify-between text-[#8E8E93]">
              <span>{isArabic ? `المجموع الفرعي (${activeItemCount} أصناف)` : `Subtotal (${activeItemCount}Items)`}</span>
              <span className="text-[#2D2F33] font-medium">{formatPrice(subtotal, activeLanguage)}</span>
            </div>

            <div className="flex justify-between text-[#8E8E93]">
              <span>{isArabic ? 'رسوم الخدمة (10%)' : 'Service Charge (10%)'}</span>
              <span className="text-[#2D2F33] font-medium">{formatPrice(serviceCharge, activeLanguage)}</span>
            </div>

            <div className="flex justify-between text-[#8E8E93]">
              <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'VAT (5%)'}</span>
              <span className="text-[#2D2F33] font-medium">{formatPrice(vat, activeLanguage)}</span>
            </div>

            <div className="flex justify-between text-[#8E8E93]">
              <span>{isArabic ? 'الإكرامية' : 'Tips'}</span>
              <span className="text-[#2D2F33] font-medium">{formatPrice(tipAmount, activeLanguage)}</span>
            </div>

            {isSplitCheck && (
              <div className="flex justify-between text-[#FF6B6B] font-medium">
                <span>{isArabic ? 'رسوم التقسيم' : 'Splitting Fees'}</span>
                <span>{formatPrice(splitFee, activeLanguage)}</span>
              </div>
            )}

            {promoStatus === 'applied' && (
              <div className="flex justify-between text-[#026F4F] font-medium">
                <span>{isArabic ? 'خصم العرض (20%)' : 'Promo Discount'}</span>
                <span className="font-semibold">-{formatPrice(discount, activeLanguage)}</span>
              </div>
            )}
          </div>

          {/* Dashed Separator Line */}
          <div className="border-b border-dashed border-[#E5E5EA] my-3" />

          {/* Total Line */}
          <div className="flex justify-between items-center font-semibold text-base pt-0.5">
            <span className="text-[#2D2F33]">{isArabic ? 'المجموع' : 'Total'}</span>
            <span className="text-[#026F4F] font-semibold text-lg">
              {formatPrice(grandTotal, activeLanguage)}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar: Continue to Payment */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-[#f4f4f5]/90 backdrop-blur-md border-t border-zinc-200/60 py-3 sm:py-4 px-4">
        <div className="w-full max-w-[440px] mx-auto">
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="w-full py-4 px-6 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-semibold text-sm sm:text-base tracking-wide shadow-md flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
          >
            <span>{isArabic ? 'متابعة للدفع' : 'Continue to Payment'}</span>
            <span className="font-semibold text-base sm:text-lg">
              {formatPrice(grandTotal, activeLanguage)}
            </span>
          </button>
        </div>
      </div>

      {/* Payment Screen Modal */}
      <PaymentScreen
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cart={selectedCart}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          onOrderSuccess({ subtotal, tipAmount, splitFee, discount, grandTotal, selectedCart, paidItems });
        }}
        language={activeLanguage}
        subtotal={subtotal}
        serviceCharge={serviceCharge}
        vat={vat}
        tipAmount={tipAmount}
        splitFee={splitFee}
        discount={discount}
        grandTotal={grandTotal}
      />
    </div>
  );
};
