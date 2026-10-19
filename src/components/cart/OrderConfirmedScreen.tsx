import React from 'react';
import { formatPrice, type CartItem, getCartItemTotalPrice } from '@/types/menu';
import { useLanguage } from '@/providers/LanguageContext';

// Import downloaded original Figma Chef in kitchen banner
import chefKitchenBanner from '@/assets/719aa30438ca4acab531227c4dee63edb65a55fd.png';

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
  tipAmount = 0,
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
      className="fixed inset-0 z-50 bg-[#F4F4F5] antialiased select-none overflow-y-auto flex flex-col justify-between font-sans"
    >
      {/* Scrollable Container: Strictly responsive mobile 440px width matching Figma Frame 211:314 */}
      <div className="w-full max-w-[440px] mx-auto flex-1 flex flex-col pb-28">
        {/* 1. Full-Width Top Illustration Banner matching Figma Gemini_Generated_Image_vao39dvao39dvao3 1 */}
        <div className="w-full bg-[#fdfbf7] rounded-b-[28px] overflow-hidden shadow-xs border-b border-zinc-200/50 flex items-center justify-center">
          <img
            src={chefKitchenBanner}
            alt="Order Confirmed Kitchen"
            className="w-full h-auto object-cover mx-auto"
          />
        </div>

        {/* 2. Order Confirmation Header & Cards Container */}
        <div className="px-4 pt-5 space-y-3.5 flex-1">
          {/* Header Title & Subtitle matching Frame 2147226318 */}
          <div className="text-center space-y-1.5">
            <h1 className="text-[25px] font-semibold text-[#2D2F33] tracking-tight leading-[130%]">
              {isArabic ? 'تم تأكيد الطلب!' : 'Order Confirmed!'}
            </h1>
            <p className="text-[16px] text-[#989898] font-normal leading-[140%]">
              {isArabic ? 'استرخِ، نحن نطبخ طعامك!' : "Sit tight, we're cooking your food!"}
            </p>
          </div>

          {/* 3. Order Summary Card matching Frame 1171277086 (radius 13px bg white border #E9E9E9) */}
          <div className="bg-white rounded-[13px] p-4 shadow-2xs border border-[#E9E9E9] space-y-3.5">
            <h2 className="text-[19px] font-semibold text-[#2D2F33] leading-[140%]">
              {isArabic ? 'ملخص الطلب' : 'Order Summary'}
            </h2>

            <div className="space-y-3.5 divide-y divide-zinc-100">
              {cart.length > 0 ? (
                cart.map((ci, idx) => (
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
                            ? `“${ci.selectedOptions.map((o) => (isArabic && o.optionNameAr ? o.optionNameAr : o.optionName)).join(', ')}”`
                            : ci.specialInstructions
                            ? `“${ci.specialInstructions}”`
                            : (isArabic ? '“بدون صلصة”' : '“No Sauce”')}
                        </p>
                        <span className="text-[15px] font-medium text-[#000000] block mt-0.5 leading-[140%]">
                          {isArabic ? `${ci.quantity}x` : `x${ci.quantity}`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[18px] font-semibold text-[#026F4F] leading-[140%]">
                        {formatPrice(getCartItemTotalPrice(ci), activeLanguage)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                /* Fallback preview item matching Figma mockup */
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-[64px] h-[64px] rounded-[7px] bg-[#F1F1F1] p-1 flex items-center justify-center shrink-0">
                      <img src="/images/food/ramen.png" alt="Shoyu Ramen" className="w-[48px] h-[48px] object-contain" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-medium text-[#2D2F33]">{isArabic ? 'شويو رامن' : 'Shoyu Ramen'}</h3>
                      <p className="text-[11px] font-normal text-[#989898]">{isArabic ? '“بدون صلصة”' : '“No Sauce”'}</p>
                      <span className="text-[15px] font-medium text-[#000000] block mt-0.5">{isArabic ? '1x' : 'x1'}</span>
                    </div>
                  </div>
                  <span className="text-[18px] font-semibold text-[#026F4F]">
                    {formatPrice(15.99, activeLanguage)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 4. Payments Details Card matching Frame 1582:564 (radius 13px bg white border #E9E9E9) */}
          <div className="bg-white rounded-[13px] p-4 shadow-2xs border border-[#E9E9E9] space-y-3">
            <h2 className="text-[19px] font-semibold text-[#2D2F33] leading-[140%]">
              {isArabic ? 'تفاصيل الدفع' : 'Payments Details'}
            </h2>

            <div className="space-y-2 text-[16px] font-normal leading-[140%]">
              <div className="flex justify-between items-center text-[#989898]">
                <span>
                  {isArabic
                    ? `المجموع الفرعي (${totalCartCount || 3} أصناف)`
                    : `Subtotal (${totalCartCount || 3}items)`}
                </span>
                <span className="text-[#686868] font-semibold">
                  {formatPrice(subtotal || 25.99, activeLanguage)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#989898]">
                <span>{isArabic ? 'رسوم الخدمة (10%)' : 'Service Charge (10%)'}</span>
                <span className="text-[#686868] font-semibold">
                  {formatPrice(serviceCharge || 2.60, activeLanguage)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#989898]">
                <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'VAT (5%)'}</span>
                <span className="text-[#686868] font-semibold">
                  {formatPrice(vat || 1.30, activeLanguage)}
                </span>
              </div>

              {tipAmount > 0 && (
                <div className="flex justify-between items-center text-[#989898]">
                  <span>{isArabic ? 'الإكرامية' : 'Tips'}</span>
                  <span className="text-[#686868] font-semibold">
                    {formatPrice(tipAmount, activeLanguage)}
                  </span>
                </div>
              )}

              {splitFee > 0 && (
                <div className="flex justify-between items-center text-rose-500">
                  <span>{isArabic ? 'رسوم التقسيم' : 'Splitting Fees'}</span>
                  <span className="font-semibold">
                    {formatPrice(splitFee, activeLanguage)}
                  </span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between items-center text-[#026F4F]">
                  <span>{isArabic ? 'الخصم' : 'Discount'}</span>
                  <span className="font-semibold">
                    -{formatPrice(discount, activeLanguage)}
                  </span>
                </div>
              )}
            </div>

            {/* Dashed Separator Line matching Vector 13 */}
            <div className="border-b border-dashed border-[#989898] my-2" />

            {/* Total Line matching Frame 2147226322 */}
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-[17px] font-medium text-[#000000] leading-[140%]">
                {isArabic ? 'المجموع' : 'Total'}
              </span>
              <span className="text-[17px] font-semibold text-[#026F4F] leading-[140%]">
                {formatPrice(grandTotal || 45.99, activeLanguage)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Sticky Bottom Action Bar with 2 Buttons matching Frame 1171277297 */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-[#F4F4F5]/90 backdrop-blur-md border-t border-zinc-200/60 py-3.5 px-4">
        <div className="w-full max-w-[440px] mx-auto flex items-center gap-3">
          {/* Back to Menu Button (Button 211:370: radius 30px bg #E9E9E9 border #B9B9B9 text #2D2F33) */}
          <button
            type="button"
            onClick={onBackToMenu}
            className="flex-1 h-[59px] rounded-[30px] bg-[#E9E9E9] hover:bg-[#dedede] border border-[#B9B9B9] text-[#2D2F33] font-medium text-[19px] leading-[140%] cursor-pointer transition-transform active:scale-[0.98] text-center flex items-center justify-center"
          >
            {isArabic ? 'العودة للقائمة' : 'Back to Menu'}
          </button>

          {/* Track My Order Button (Button 211:371: radius 30px bg #026F4F text white) */}
          <button
            type="button"
            onClick={onTrackOrder}
            className="flex-1 h-[59px] rounded-[30px] bg-[#026F4F] hover:bg-[#025a40] text-white font-medium text-[19px] leading-[140%] shadow-md cursor-pointer transition-transform active:scale-[0.98] text-center flex items-center justify-center"
          >
            {isArabic ? 'تتبع طلبي' : 'Track My Order'}
          </button>
        </div>
      </div>
    </div>
  );
};
