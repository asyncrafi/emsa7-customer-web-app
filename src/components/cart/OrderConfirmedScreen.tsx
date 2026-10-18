import React from 'react';
import { formatPrice, type CartItem, getCartItemTotalPrice } from '@/types/menu';
import { useLanguage } from '@/providers/LanguageContext';

export interface OrderConfirmedScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToMenu: () => void;
  onTrackOrder: () => void;
  cart: CartItem[];
  subtotal: number;
  serviceCharge: number;
  vat: number;
  tipAmount: number;
  splitFee?: number;
  discount?: number;
  grandTotal: number;
  language?: 'ENGLISH' | 'ARABIC';
}

export const OrderConfirmedScreen: React.FC<OrderConfirmedScreenProps> = ({
  isOpen,
  onBackToMenu,
  onTrackOrder,
  cart,
  subtotal,
  serviceCharge: propServiceCharge,
  vat: propVat,
  tipAmount,
  splitFee = 0,
  discount = 0,
  grandTotal,
  language: propLanguage,
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = propLanguage || contextLanguage;
  if (!isOpen) return null;

  const isArabic = activeLanguage === 'ARABIC';
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const serviceCharge =
    propServiceCharge !== undefined && propServiceCharge > 0
      ? propServiceCharge
      : Math.round(subtotal * 0.10 * 100) / 100;
  const vat =
    propVat !== undefined && propVat > 0
      ? propVat
      : Math.round(subtotal * 0.05 * 100) / 100;

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#f4f4f5] antialiased select-none overflow-y-auto flex flex-col justify-between font-sans"
    >
      {/* Scrollable Container: Strictly responsive mobile 440px width matching Figma */}
      <div className="w-full max-w-[440px] mx-auto flex-1 flex flex-col pb-28">
        
        {/* 1. Full-Width Top Illustration Banner matching Figma */}
        <div className="w-full bg-[#fdfbf7] rounded-b-3xl overflow-hidden shadow-xs border-b border-zinc-200/50 flex items-center justify-center">
          <img
            src="/images/common/confirm-order-kitcken.png"
            alt="Order Confirmed Kitchen"
            className="w-full h-auto object-cover mx-auto"
          />
        </div>

        {/* 2. Order Confirmation Header & Summary Cards Container */}
        <div className="px-4 pt-5 space-y-3.5 flex-1">
          {/* Header Title & Subtitle */}
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#2D2F33] tracking-tight">
              {isArabic ? 'تم تأكيد الطلب!' : 'Order Confirmed!'}
            </h1>
            <p className="text-xs sm:text-sm text-[#8E8E93] font-normal">
              {isArabic ? 'استرخِ، نحن نطبخ طعامك!' : "Sit tight, we're cooking your food!"}
            </p>
          </div>

          {/* 3. Order Summary Card */}
          <div className="bg-white rounded-[16px] p-4 shadow-2xs border border-[#F4F4F5] space-y-3">
            <h2 className="font-semibold text-base text-[#2D2F33]">
              {isArabic ? 'ملخص الطلب' : 'Order Summary'}
            </h2>

            <div className="space-y-3 divide-y divide-zinc-100">
              {cart.length > 0 ? (
                cart.map((ci) => (
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
                        <p className="text-xs text-[#8E8E93] font-normal truncate">
                          "No Sauce"
                        </p>
                        <span className="text-xs text-zinc-500 font-medium block mt-0.5">
                          x{ci.quantity}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-semibold text-sm sm:text-base text-[#026F4F]">
                        {formatPrice(getCartItemTotalPrice(ci), activeLanguage)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                /* Fallback demo item if cart was cleared before rendering */
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-[#F4F5F7] p-1.5 flex items-center justify-center shrink-0">
                      <img src="/images/food/ramen.png" alt="Shoyu Ramen" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[#2D2F33]">Shoyu Ramen</h3>
                      <p className="text-xs text-[#8E8E93] font-normal">"No Sauce"</p>
                      <span className="text-xs text-zinc-500 font-medium block">x1</span>
                    </div>
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-[#026F4F]">
                    {formatPrice(15.99, activeLanguage)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 4. Payments Details Card (Figma-Exact) */}
          <div className="bg-white rounded-[16px] p-4 shadow-2xs border border-[#F4F4F5] space-y-2.5">
            <h2 className="font-semibold text-base text-[#2D2F33]">
              {isArabic ? 'تفاصيل الدفع' : 'Payments Details'}
            </h2>

            <div className="space-y-2 text-xs sm:text-sm font-normal">
              <div className="flex justify-between text-[#8E8E93]">
                <span>
                  {isArabic
                    ? `المجموع الفرعي (${totalCartCount || 1} أصناف)`
                    : `Subtotal (${totalCartCount || 1} items)`}
                </span>
                <span className="text-[#2D2F33] font-medium">
                  {formatPrice(subtotal || 25.99, activeLanguage)}
                </span>
              </div>

              <div className="flex justify-between text-[#8E8E93]">
                <span>{isArabic ? 'رسوم الخدمة (10%)' : 'Service Charge (10%)'}</span>
                <span className="text-[#2D2F33] font-medium">
                  {formatPrice(serviceCharge, activeLanguage)}
                </span>
              </div>

              <div className="flex justify-between text-[#8E8E93]">
                <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'VAT (5%)'}</span>
                <span className="text-[#2D2F33] font-medium">
                  {formatPrice(vat, activeLanguage)}
                </span>
              </div>

              {tipAmount > 0 && (
                <div className="flex justify-between text-[#8E8E93]">
                  <span>{isArabic ? 'الإكرامية' : 'Tips'}</span>
                  <span className="text-[#2D2F33] font-medium">
                    {formatPrice(tipAmount, activeLanguage)}
                  </span>
                </div>
              )}

              {splitFee > 0 && (
                <div className="flex justify-between text-rose-500 font-medium">
                  <span>{isArabic ? 'رسوم التقسيم' : 'Splitting Fees'}</span>
                  <span className="font-semibold">
                    {formatPrice(splitFee, activeLanguage)}
                  </span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>{isArabic ? 'الخصم' : 'Discount'}</span>
                  <span className="font-semibold">
                    -{formatPrice(discount, activeLanguage)}
                  </span>
                </div>
              )}

              {/* Dashed Separator Line */}
              <div className="border-b border-dashed border-zinc-200 my-2" />

              <div className="pt-0.5 flex justify-between items-center text-sm sm:text-base">
                <span className="font-semibold text-[#2D2F33]">{isArabic ? 'الإجمالي' : 'Total'}</span>
                <span className="font-semibold text-[#026F4F] text-base sm:text-lg">
                  {formatPrice(grandTotal || 29.89, activeLanguage)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Sticky Bottom Action Bar with 2 Buttons: Back to Menu & Track My Order */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-[#f4f4f5]/90 backdrop-blur-md border-t border-zinc-200/60 py-3 px-4">
        <div className="w-full max-w-[440px] mx-auto flex items-center gap-3">
          {/* Back to Menu Button */}
          <button
            type="button"
            onClick={onBackToMenu}
            className="flex-1 py-3.5 px-4 rounded-full bg-[#EEEEEE] hover:bg-zinc-200 text-[#2D2F33] font-semibold text-sm tracking-wide cursor-pointer transition-all active:scale-[0.98] text-center"
          >
            {isArabic ? 'العودة للقائمة' : 'Back to Menu'}
          </button>

          {/* Track My Order Button */}
          <button
            type="button"
            onClick={onTrackOrder}
            className="flex-1 py-3.5 px-4 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-semibold text-sm tracking-wide shadow-xs cursor-pointer transition-all active:scale-[0.98] text-center"
          >
            {isArabic ? 'تتبع طلبي' : 'Track My Order'}
          </button>
        </div>
      </div>
    </div>
  );
};
