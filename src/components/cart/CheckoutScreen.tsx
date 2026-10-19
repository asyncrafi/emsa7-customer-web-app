import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { type CartItem, formatPrice, getCartSubtotal, getCartItemTotalPrice } from '@/types/menu';
import { QuantityControl } from '@/components/food/QuantityControl';
import { PaymentScreen } from '@/components/cart/PaymentScreen';
import { useLanguage } from '@/providers/LanguageContext';
import SvgChairIcon from '@/components/ui/svg-icons/ChairSvg';

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
    customerName?: string;
    customerPhone?: string;
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

  const splitFee = 0;
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
        paidItems: cart.map((ci, idx) => ({ originalIndex: idx, quantity: ci.quantity })),
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
      quantity: qty,
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
      className="fixed inset-0 z-50 bg-[#F4F4F5] antialiased select-none flex flex-col h-full w-full overflow-hidden font-sans"
    >
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 w-full">
        <div className="w-full max-w-[440px] mx-auto px-4 pt-4 pb-8 space-y-4">
        {/* Header Row: Back Arrow + Centered Title Checkout */}
        <header className="relative flex items-center justify-center py-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[42px] h-[42px] rounded-full bg-[#EEEEEE] hover:bg-zinc-200 text-[#2D2F33] flex items-center justify-center cursor-pointer transition-transform active:scale-95 rtl:left-auto rtl:right-0 shadow-xs"
          >
            {isArabic ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>

          <h1 className="text-[23px] font-semibold text-[#2D2F33] tracking-tight leading-[140%]">
            {isArabic ? 'إتمام الطلب' : 'Checkout'}
          </h1>
        </header>

        {/* 1. Dining Location Green Banner Box with SvgChairIcon matching Figma */}
        <div className="bg-[#026F4F] rounded-[16px] p-4 flex items-center gap-3.5 text-white shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-xs">
            <SvgChairIcon className="w-7 h-7 text-[#026F4F]" />
          </div>
          <div>
            <p className="text-emerald-100 text-[13px] font-normal leading-[140%]">
              {isArabic ? 'تناول الطعام في' : 'Dining at'}
            </p>
            <h2 className="text-white text-[18px] font-semibold tracking-tight leading-snug">
              {tableName}
            </h2>
            <p className="text-emerald-100/80 text-[12px] font-normal leading-[140%]">
              {isArabic ? 'بجانب النافذة، الطابق الثاني' : 'Window Side, Floor 2'}
            </p>
          </div>
        </div>

        {/* 2. Split Check Toggle Card matching Figma */}
        <div className="bg-white rounded-[13px] p-4 border border-[#E9E9E9] flex items-center justify-between shadow-2xs">
          <span className="font-semibold text-[15px] text-[#2D2F33] leading-[140%]">
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

        {/* 3. Order Summary Card matching Figma Frame */}
        <div className="bg-white rounded-[13px] p-4 shadow-2xs border border-[#E9E9E9] space-y-3.5">
          <h2 className="text-[17px] font-semibold text-[#2D2F33] leading-[140%]">
            {isArabic ? 'ملخص الطلب' : 'Order Summary'}
          </h2>

          <div className="space-y-3.5 divide-y divide-zinc-100">
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

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[15px] text-[#2D2F33] truncate leading-[140%]">
                            {isArabic ? ci.item.nameAr || ci.item.name : ci.item.name}
                          </h3>
                          <p className="text-[11px] text-[#989898] font-normal truncate leading-[140%]">
                            {ci.selectedOptions && ci.selectedOptions.length > 0
                              ? `“${ci.selectedOptions.map((so) => so.optionName).join(', ')}”`
                              : ci.specialInstructions
                              ? `“${ci.specialInstructions}”`
                              : '“No Sauce”'}
                          </p>
                          <span className="text-[11px] font-semibold text-[#2D2F33] block mt-0.5">
                            x1
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <span className="font-semibold text-[16px] text-[#026F4F]">
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
                      className="pt-3.5 first:pt-0 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
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
                          <h3 className="font-semibold text-[15px] text-[#2D2F33] truncate leading-[140%]">
                            {isArabic ? ci.item.nameAr || ci.item.name : ci.item.name}
                          </h3>
                          <p className="text-[11px] text-[#989898] font-normal truncate leading-[140%]">
                            {ci.selectedOptions && ci.selectedOptions.length > 0
                              ? `“${ci.selectedOptions.map((so) => so.optionName).join(', ')}”`
                              : ci.specialInstructions
                              ? `“${ci.specialInstructions}”`
                              : '“No Sauce”'}
                          </p>
                          <span className="text-[16px] font-semibold text-[#026F4F] block mt-0.5">
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

        {/* + Add More Items Link directly below card matching Figma */}
        <div className="py-0.5">
          <button
            type="button"
            onClick={onAddMoreItems || onClose}
            className="inline-flex items-center gap-1.5 text-[12.7px] font-medium text-[#026F4F] hover:text-[#025a40] transition-colors cursor-pointer"
          >
            <img src="/icons/tabler_plus-filled.svg" alt="" className="w-[19px] h-[19px] object-contain" />
            <span>{isArabic ? 'إضافة المزيد من الأصناف' : 'Add More Items'}</span>
          </button>
        </div>

        {/* 4. Promo Code Card matching Figma Frame 2147226326 */}
        {promoStatus === 'applied' ? (
          <div className="bg-[#EAF5F0] rounded-[10px] h-[61px] px-4 border border-[#D4EBE0] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <img
                src="/icons/lsicon_badge-promotion-filled.svg"
                alt=""
                className="w-6 h-6 object-contain"
                style={{ filter: 'invert(27%) sepia(85%) saturate(1487%) hue-rotate(136deg) brightness(92%) contrast(98%)' }}
              />
              <span className="font-semibold text-[15px] text-[#026F4F] tracking-wider uppercase">
                {promoCode || 'WELCOME20'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPromoStatus('none');
                setPromoCode('');
              }}
              className="cursor-pointer"
              title="Remove promo code"
            >
              <img src="/icons/icon-park-solid_check-one.svg" alt="" className="w-6 h-6 object-contain" />
            </button>
          </div>
        ) : promoStatus === 'error' ? (
          <div className="bg-[#FDF0F0] rounded-[10px] h-[61px] px-4 border border-[#FADBD8] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <img
                src="/icons/lsicon_badge-promotion-filled.svg"
                alt=""
                className="w-6 h-6 object-contain"
                style={{ filter: 'invert(37%) sepia(76%) saturate(2314%) hue-rotate(334deg) brightness(95%) contrast(92%)' }}
              />
              <span className="font-semibold text-[15px] text-[#E05656] tracking-wider uppercase">
                {promoCode || 'WELCOME20'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPromoStatus('none');
                setPromoCode('');
              }}
              className="cursor-pointer"
              title="Clear"
            >
              <img src="/icons/gridicons_cross-circle.svg" alt="" className="w-6 h-6 object-contain" />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[10px] h-[61px] px-3.5 border border-[#E9E9E9] shadow-2xs flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <img src="/icons/lsicon_badge-promotion-filled.svg" alt="" className="w-6 h-6 object-contain shrink-0" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder={isArabic ? 'أدخل رمز العرض' : 'ENTER PROMO CODE'}
                className="flex-1 bg-transparent py-1.5 text-[15px] text-zinc-800 placeholder:text-[#989898] placeholder:font-medium font-medium uppercase outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyPromo}
              className="w-[71px] h-[42px] rounded-[7px] bg-[#026F4F] hover:bg-[#025a40] text-white text-[15px] font-medium transition-colors cursor-pointer shrink-0 shadow-xs active:scale-95 flex items-center justify-center"
            >
              {isArabic ? 'تطبيق' : 'APPLY'}
            </button>
          </div>
        )}

        {/* 5. Add a Tip Card matching Figma */}
        <div className="bg-white rounded-[13px] p-4 border border-[#E9E9E9] space-y-3 shadow-2xs">
          <span className="font-semibold text-[15px] text-[#2D2F33] block leading-[140%]">
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
                className={`py-2.5 px-2 rounded-full text-[13px] border transition-all cursor-pointer text-center ${
                  selectedTip === tip.id
                    ? 'bg-[#026F4F] border-[#026F4F] text-white font-semibold shadow-xs'
                    : 'bg-white border-[#E5E5EA] text-[#2D2F33] font-medium hover:bg-zinc-50'
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
          <div className="flex items-center gap-1 text-[11px] font-medium text-[#989898] pt-0.5">
            <span className="text-[#FF4D4F] font-semibold">*</span>
            <span>
              {isArabic
                ? 'أعلى إكرامية اليوم كانت $10.00'
                : 'Highest tip today was $10.00'}
            </span>
          </div>
        </div>

        {/* 6. Payments Details Card matching Figma Frame */}
        <div className="bg-white rounded-[13px] p-4 shadow-2xs border border-[#E9E9E9] space-y-3">
          <h2 className="text-[17px] font-semibold text-[#2D2F33] leading-[140%]">
            {isArabic ? 'تفاصيل الدفع' : 'Payments Details'}
          </h2>

          <div className="space-y-2 text-[14px] font-medium">
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

            {tipAmount > 0 && (
              <div className="flex justify-between text-[#8E8E93]">
                <span>{isArabic ? 'الإكرامية' : 'Tips'}</span>
                <span className="text-[#2D2F33] font-medium">{formatPrice(tipAmount, activeLanguage)}</span>
              </div>
            )}

            {isSplitCheck && splitFee > 0 && (
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
          <div className="border-b border-dashed border-[#E5E5EA] my-2" />

          {/* Total Line */}
          <div className="flex justify-between items-center font-semibold text-[17px] pt-0.5">
            <span className="text-[#2D2F33]">{isArabic ? 'المجموع' : 'Total'}</span>
            <span className="text-[#026F4F] font-semibold text-[18px]">
              {formatPrice(grandTotal, activeLanguage)}
            </span>
          </div>
        </div>
      </div>
    </div>

      {/* Pinned Bottom Action Bar: Continue to Payment (Always visible in viewport) */}
      <div className="shrink-0 bg-[#F4F4F5]/95 backdrop-blur-md border-t border-zinc-200/60 py-3.5 px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom))]">
        <div className="w-full max-w-[409px] mx-auto">
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="w-full h-[59px] rounded-[30px] bg-[#026F4F] hover:bg-[#025a40] text-white px-6 shadow-md flex items-center justify-between cursor-pointer transition-transform active:scale-[0.99]"
          >
            <span className="text-[16px] font-normal leading-[140%]">
              {isArabic ? 'متابعة للدفع' : 'Continue to Payment'}
            </span>
            <span className="text-[16px] font-semibold leading-[140%]">
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
          onOrderSuccess({ subtotal, serviceCharge, vat, tipAmount, splitFee, discount, grandTotal, selectedCart, paidItems });
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
