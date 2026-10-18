import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { formatPrice, type CartItem, getCartItemTotalPrice } from '@/types/menu';
import { useLanguage } from '@/providers/LanguageContext';
import { EInvoiceModal } from '@/components/cart/EInvoiceModal';

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
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
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
      className={`fixed inset-0 z-50 bg-[#f4f4f5] antialiased select-none overflow-y-auto flex flex-col justify-between ${
        isArabic ? 'font-sans rtl' : 'ltr'
      }`}
    >
      {/* Scrollable Container with max-width optimization for Mobile & Tablet */}
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto flex-1 flex flex-col pb-28 md:pb-36">
        
        {/* 1. Full-Width Top Illustration Banner matching Figma */}
        <div className="w-full bg-[#fdfbf7] rounded-b-3xl sm:rounded-b-[2.5rem] overflow-hidden shadow-xs border-b border-zinc-200/50 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <img
            src="/images/common/confirm-order-kitcken.png"
            alt="Order Confirmed Kitchen"
            className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl h-auto aspect-square object-contain mx-auto"
          />
        </div>

        {/* 2. Order Confirmation Header & Summary Cards Container */}
        <div className="px-4 sm:px-6 md:px-8 pt-5 sm:pt-7 md:pt-8 space-y-5 md:space-y-6 flex-1">
          {/* Header Title & Subtitle */}
          <div className="text-center space-y-1.5 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight">
              {isArabic ? 'تم تأكيد الطلب!' : 'Order Confirmed!'}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-zinc-500 font-medium">
              {isArabic ? 'استرخِ، نحن نطبخ طعامك!' : "Sit tight, we're cooking your food!"}
            </p>
          </div>

          {/* 3. Order Summary Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs border border-zinc-100 space-y-4">
            <h2 className="font-bold text-base sm:text-lg md:text-xl text-zinc-900">
              {isArabic ? 'ملخص الطلب' : 'Order Summary'}
            </h2>

            <div className="space-y-3 sm:space-y-4 divide-y divide-zinc-100">
              {cart.length > 0 ? (
                cart.map((ci) => (
                  <div
                    key={ci.item.id}
                    className="pt-3 first:pt-0 flex items-center justify-between gap-3 md:gap-4"
                  >
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
                        {ci.specialInstructions && (
                          <p className="text-[11px] sm:text-xs text-zinc-400 font-normal italic">
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
                        {formatPrice(getCartItemTotalPrice(ci), activeLanguage)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                /* Fallback demo item if cart was cleared before rendering */
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 p-1.5 flex items-center justify-center shrink-0 border border-zinc-100">
                      <img src="/images/ramen/shoyu-ramen.png" alt="Shoyu Ramen" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-zinc-900">Shoyu Ramen</h3>
                      <span className="text-xs text-zinc-500 font-semibold block">x1</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm text-[#026F4F]">
                    {formatPrice(15.99, activeLanguage)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 4. Payments Details Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs border border-zinc-100 space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base sm:text-lg md:text-xl text-zinc-900">
                {isArabic ? 'تفاصيل الدفع' : 'Payments Details'}
              </h2>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#026F4F] font-bold text-xs sm:text-sm border border-emerald-200/60 transition-colors cursor-pointer shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>{isArabic ? 'الفاتورة الإلكترونية' : 'E-Invoice'}</span>
              </button>
            </div>

            <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm md:text-base font-medium">
              <div className="flex justify-between text-zinc-400">
                <span>
                  {isArabic
                    ? `المجموع الفرعي (${totalCartCount || 1} أصناف)`
                    : `Subtotal (${totalCartCount || 1} items)`}
                </span>
                <span className="text-zinc-800 font-bold">
                  {formatPrice(subtotal || 25.99, activeLanguage)}
                </span>
              </div>



              <div className="flex justify-between text-zinc-400">
                <span>{isArabic ? 'رسوم الخدمة (10%)' : 'Service Charge (10%)'}</span>
                <span className="text-zinc-800 font-bold">
                  {formatPrice(serviceCharge, activeLanguage)}
                </span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'VAT (5%)'}</span>
                <span className="text-zinc-800 font-bold">
                  {formatPrice(vat, activeLanguage)}
                </span>
              </div>

              {tipAmount > 0 && (
                <div className="flex justify-between text-zinc-400">
                  <span>{isArabic ? 'الإكرامية' : 'Tips'}</span>
                  <span className="text-zinc-800 font-bold">
                    {formatPrice(tipAmount, activeLanguage)}
                  </span>
                </div>
              )}

              {splitFee > 0 && (
                <div className="flex justify-between text-rose-500 font-medium">
                  <span>{isArabic ? 'رسوم التقسيم' : 'Splitting Fees'}</span>
                  <span className="font-bold">
                    {formatPrice(splitFee, activeLanguage)}
                  </span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>{isArabic ? 'الخصم' : 'Discount'}</span>
                  <span className="font-bold">
                    -{formatPrice(discount, activeLanguage)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-100 flex justify-between items-center text-sm sm:text-base md:text-lg">
                <span className="font-bold text-zinc-900">{isArabic ? 'الإجمالي' : 'Total'}</span>
                <span className="font-extrabold text-[#026F4F]">
                  {formatPrice(grandTotal || 29.89, activeLanguage)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Sticky Bottom Action Bar with 2 Buttons: Back to Menu & Track My Order */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-[#f4f4f5]/90 backdrop-blur-md border-t border-zinc-200/60 py-3 sm:py-4 px-4 sm:px-6">
        <div className="w-full max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto flex items-center gap-3 sm:gap-4">
          {/* Back to Menu Button */}
          <button
            type="button"
            onClick={onBackToMenu}
            className="flex-1 py-3.5 sm:py-4 px-4 sm:px-6 rounded-full bg-[#eef0f2] hover:bg-zinc-200 text-zinc-800 font-bold text-xs sm:text-sm md:text-base tracking-wide border border-zinc-200/80 cursor-pointer transition-all active:scale-[0.98] text-center"
          >
            {isArabic ? 'العودة للقائمة' : 'Back to Menu'}
          </button>

          {/* Track My Order Button */}
          <button
            type="button"
            onClick={onTrackOrder}
            className="flex-1 py-3.5 sm:py-4 px-4 sm:px-6 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-extrabold text-xs sm:text-sm md:text-base tracking-wide shadow-md cursor-pointer transition-all active:scale-[0.98] text-center"
          >
            {isArabic ? 'تتبع طلبي' : 'Track My Order'}
          </button>
        </div>
      </div>

      {/* E-Invoice Modal */}
      <EInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        items={cart.map((ci) => ({
          name: ci.item.name,
          nameAr: ci.item.nameAr,
          qty: ci.quantity,
          price: ci.item.price,
        }))}
        subtotal={subtotal}
        tipAmount={tipAmount}
        splitFee={splitFee}
        discount={discount}
        total={grandTotal}
        language={activeLanguage}
      />
    </div>
  );
};
