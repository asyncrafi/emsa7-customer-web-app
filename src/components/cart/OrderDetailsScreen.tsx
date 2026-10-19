import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { formatPrice, getCartItemTotalPrice } from '@/types/menu';
import { useLanguage } from '@/providers/LanguageContext';
import type { StoredOrder } from '@/components/cart/MyOrderScreen';

export type OrderStatus = 'preparing' | 'ready' | 'served';

interface OrderDetailsScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onNewOrder: () => void;
  onPayNow?: () => void;
  onAddItems?: () => void;
  language?: 'ENGLISH' | 'ARABIC';
  orderId?: string;
  order?: StoredOrder | null;
}

export const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({
  isOpen,
  onClose,
  onNewOrder,
  onPayNow,
  onAddItems,
  language: propLanguage,
  orderId: _orderId = '#A102',
  order,
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = propLanguage || contextLanguage;
  const [status, setStatus] = useState<OrderStatus>(() => {
    if (order?.status) {
      const s = order.status.toLowerCase();
      if (s === 'ready') return 'ready';
      if (s === 'served') return 'served';
    }
    return 'preparing';
  });
  const [manualOverride, setManualOverride] = useState(false);

  const isArabic = activeLanguage === 'ARABIC';

  // Auto-transition status only if not manually switched: preparing -> ready -> served
  useEffect(() => {
    if (!isOpen || manualOverride) return;

    const timer = setTimeout(() => {
      setStatus((current) => {
        if (current === 'preparing') return 'ready';
        if (current === 'ready') return 'served';
        return 'served';
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [isOpen, status, manualOverride]);

  if (!isOpen) return null;

  // Configuration for each status state matching Figma screenshots
  const statusConfig = {
    preparing: {
      image: '/images/ongoing/preparing.png',
      title: isArabic ? 'نحن نعد طلبك' : "We're preparing your order",
      subtitle: isArabic
        ? 'سنحضره إلى طاولتك عندما يكون جاهزاً'
        : "We'll bring it to your table when it's ready",
      badge: isArabic ? 'تقديم خلال' : 'Serve in',
      badgeTime: isArabic ? '25 دقيقة' : '25 min',
    },
    ready: {
      image: '/images/ongoing/ready.png',
      title: isArabic ? 'طلبك جاهز' : 'Your order is ready',
      subtitle: isArabic ? 'سيتم تقديمه قريباً' : 'It will be served shortly',
      badge: null,
      badgeTime: null,
    },
    served: {
      image: '/images/ongoing/served.png',
      title: isArabic ? 'تم تقديم طلبك' : 'Your order has been served',
      subtitle: isArabic ? 'استمتع بوجبتك!' : 'Enjoy your meal!',
      badge: null,
      badgeTime: null,
    },
  };

  const currentConfig = statusConfig[status];

  const orderItemCount =
    order?.cartItems?.reduce((sum, ci) => sum + ci.quantity, 0) ??
    order?.items?.reduce((sum, it) => sum + it.qty, 0) ??
    3;

  const orderSubtotal =
    order?.subtotal ??
    (order?.items?.reduce((sum, it) => sum + it.price * it.qty, 0) || 25.99);
  const orderServiceCharge =
    order?.serviceCharge !== undefined && order.serviceCharge > 0
      ? order.serviceCharge
      : 25.99;
  const orderVat =
    order?.vat !== undefined && order.vat > 0
      ? order.vat
      : 1.30;
  const orderTips =
    order?.tipAmount !== undefined && order.tipAmount > 0
      ? order.tipAmount
      : 5.00;
  const orderTotal =
    order?.total !== undefined && order.total > 0
      ? order.total
      : 45.99;

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#F4F4F5] antialiased select-none overflow-y-auto w-full min-h-[100dvh] flex flex-col justify-between pb-8 font-sans"
    >
      <div className="w-full flex-1 flex flex-col justify-between">
        <div>
          {/* Top Chef Hero Container matching Figma (440px wide) */}
          <div className="relative w-full max-w-[440px] mx-auto">
            {/* Hero Image Container */}
            <div className="w-full aspect-[440/410] bg-[#fdfbf7] flex items-center justify-center overflow-hidden relative shadow-xs">
              {/* Floating Circle Back Button (50x50 matching Figma Ellipse 145) */}
              <div className="absolute top-4 left-4 z-20 rtl:left-auto rtl:right-4">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Back"
                  className="w-[42px] h-[42px] rounded-full bg-white/90 hover:bg-white text-[#2D2F33] flex items-center justify-center cursor-pointer shadow-md transition-transform active:scale-95"
                >
                  {isArabic ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                </button>
              </div>

              {/* Status Switcher Mini Floating Pills (Allows user to toggle between Preparing, Ready, Served easily) */}
              <div className="absolute top-4 right-4 z-20 rtl:right-auto rtl:left-4 flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-full">
                {(['preparing', 'ready', 'served'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatus(st);
                      setManualOverride(true);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all capitalize cursor-pointer ${
                      status === st
                        ? 'bg-[#026F4F] text-white shadow-xs'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Authentic Figma Chef Illustration */}
              <img
                src={currentConfig.image}
                alt={currentConfig.title}
                className="w-full h-full object-cover object-top transition-all duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/food/ramen.png';
                }}
              />
            </div>

            {/* Floating "Serve in 25 min" Green Circular Badge over Image (Figma Group 1171276391: 142x142 circle #026F4F) */}
            {status === 'preparing' && (
              <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <div className="w-[124px] h-[124px] rounded-full bg-[#026F4F] border-[5px] border-[#559F89] text-white flex flex-col items-center justify-center shadow-lg animate-in zoom-in-95 duration-200">
                  <span className="text-[14px] font-normal text-white leading-tight">
                    {currentConfig.badge}
                  </span>
                  <span className="text-[24px] font-semibold text-white tracking-tight leading-none mt-0.5">
                    {currentConfig.badgeTime || '25 min'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content Container: Strictly responsive mobile 440px width matching Figma */}
          <div className="w-full max-w-[440px] mx-auto px-4">
            {/* Status Title & Description matching Figma (Title 23px w=600 #2D2F33, Subtitle 13px w=400 #989898) */}
            <div
              className={`text-center space-y-1 animate-in fade-in duration-300 ${
                status === 'preparing' ? 'pt-16' : 'pt-5'
              }`}
            >
              <h1 className="text-[23px] font-semibold text-[#2D2F33] leading-[140%] tracking-tight">
                {currentConfig.title}
              </h1>
              <p className="text-[13px] text-[#989898] font-normal leading-[140%]">
                {currentConfig.subtitle}
              </p>
            </div>

            {/* Cards Container */}
            <div className="pt-5 space-y-3.5">
              {/* Card 1: Order Summary (Figma Frame 1171277086: border-radius 13px bg white) */}
              <div className="bg-white rounded-[13px] p-4 shadow-2xs border border-[#F1F1F1] space-y-3.5">
                <h2 className="font-semibold text-[19px] text-[#2D2F33] leading-[140%]">
                  {isArabic ? 'ملخص الطلب' : 'Order Summary'}
                </h2>

                <div className="space-y-3">
                  {order?.cartItems && order.cartItems.length > 0 ? (
                    order.cartItems.map((ci, idx) => (
                      <div
                        key={`${ci.item.id}-${idx}`}
                        className={`flex items-center justify-between gap-3 ${idx > 0 ? 'pt-3 border-t border-zinc-100/80' : 'pt-1'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-[70px] h-[70px] rounded-[7px] bg-[#F1F1F1] p-1.5 flex items-center justify-center shrink-0">
                            <img
                              src={ci.item.imageUrl || '/images/food/ramen.png'}
                              alt={ci.item.name}
                              className="w-[49px] h-[49px] object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/food/ramen.png';
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-[15px] text-[#2D2F33] leading-[140%] truncate">
                              {isArabic ? ci.item.nameAr || ci.item.name : ci.item.name}
                            </h3>
                            <p className="text-[11px] text-[#989898] font-normal leading-[140%] truncate">
                              {ci.selectedOptions && ci.selectedOptions.length > 0
                                ? `“${ci.selectedOptions.map((o) => (isArabic && o.optionNameAr ? o.optionNameAr : o.optionName)).join(', ')}”`
                                : ci.specialInstructions
                                ? `“${ci.specialInstructions}”`
                                : (isArabic ? '“بدون صلصة”' : '“No Sauce”')}
                            </p>
                            <span className="font-medium text-[15px] text-[#000000] block mt-0.5 leading-[140%]">
                              {isArabic ? `${ci.quantity}x` : `x${ci.quantity}`}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-[18px] text-[#026F4F] leading-[140%] shrink-0">
                          {formatPrice(getCartItemTotalPrice(ci), activeLanguage)}
                        </span>
                      </div>
                    ))
                  ) : order?.items && order.items.length > 0 ? (
                    order.items.map((it, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between gap-3 ${idx > 0 ? 'pt-3 border-t border-zinc-100/80' : 'pt-1'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-[70px] h-[70px] rounded-[7px] bg-[#F1F1F1] p-1.5 flex items-center justify-center shrink-0">
                            <img
                              src={it.image || '/images/food/ramen.png'}
                              alt={it.name}
                              className="w-[49px] h-[49px] object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/food/ramen.png';
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-[15px] text-[#2D2F33] leading-[140%] truncate">
                              {isArabic ? it.nameAr || it.name : it.name}
                            </h3>
                            <p className="text-[11px] text-[#989898] font-normal leading-[140%] truncate">
                              {isArabic ? '“بدون صلصة”' : '“No Sauce”'}
                            </p>
                            <span className="font-medium text-[15px] text-[#000000] block mt-0.5 leading-[140%]">
                              {isArabic ? `${it.qty}x` : `x${it.qty}`}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-[18px] text-[#026F4F] leading-[140%] shrink-0">
                          {formatPrice(it.price * it.qty, activeLanguage)}
                        </span>
                      </div>
                    ))
                  ) : (
                    /* Fallback items */
                    <>
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-[70px] h-[70px] rounded-[7px] bg-[#F1F1F1] p-1.5 flex items-center justify-center shrink-0">
                            <img
                              src="/images/food/ramen.png"
                              alt="Shoyu Ramen"
                              className="w-[49px] h-[49px] object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-[15px] text-[#2D2F33] leading-[140%] truncate">
                              {isArabic ? 'شويو رامن' : 'Shoyu Ramen'}
                            </h3>
                            <p className="text-[11px] text-[#989898] font-normal leading-[140%] truncate">
                              {isArabic ? '“بدون صلصة”' : '“No Sauce”'}
                            </p>
                            <span className="font-medium text-[15px] text-[#000000] block mt-0.5 leading-[140%]">
                              {isArabic ? '1x' : 'x1'}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-[18px] text-[#026F4F] leading-[140%] shrink-0">
                          {formatPrice(15.99, activeLanguage)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-100/80">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-[70px] h-[70px] rounded-[7px] bg-[#F1F1F1] p-1.5 flex items-center justify-center shrink-0">
                            <img
                              src="/images/food/ramen.png"
                              alt="Shoyu Ramen"
                              className="w-[49px] h-[49px] object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-[15px] text-[#2D2F33] leading-[140%] truncate">
                              {isArabic ? 'شويو رامن' : 'Shoyu Ramen'}
                            </h3>
                            <p className="text-[11px] text-[#989898] font-normal leading-[140%] truncate">
                              {isArabic ? '“بدون صلصة”' : '“No Sauce”'}
                            </p>
                            <span className="font-medium text-[15px] text-[#000000] block mt-0.5 leading-[140%]">
                              {isArabic ? '1x' : 'x1'}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-[18px] text-[#026F4F] leading-[140%] shrink-0">
                          {formatPrice(15.99, activeLanguage)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Card 2: Payments Details (Figma Frame 2147226328: border-radius 13px bg white) */}
              <div className="bg-white rounded-[13px] p-4 shadow-2xs border border-[#F1F1F1] space-y-2.5">
                <h2 className="font-semibold text-[19px] text-[#2D2F33] leading-[140%]">
                  {isArabic ? 'تفاصيل الدفع' : 'Payments Details'}
                </h2>

                <div className="space-y-2 text-[16px] font-normal">
                  <div className="flex justify-between text-[#989898]">
                    <span>{isArabic ? `المجموع الفرعي (${orderItemCount} أصناف)` : `Subtotal (${orderItemCount}items)`}</span>
                    <span className="text-[#686868] font-semibold">{formatPrice(orderSubtotal, activeLanguage)}</span>
                  </div>

                  <div className="flex justify-between text-[#989898]">
                    <span>{isArabic ? 'رسوم الخدمة (10%)' : 'Service Charge (10%)'}</span>
                    <span className="text-[#686868] font-semibold">{formatPrice(orderServiceCharge, activeLanguage)}</span>
                  </div>

                  <div className="flex justify-between text-[#989898]">
                    <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'VAT (5%)'}</span>
                    <span className="text-[#686868] font-semibold">{formatPrice(orderVat, activeLanguage)}</span>
                  </div>

                  {orderTips > 0 && (
                    <div className="flex justify-between text-[#989898]">
                      <span>{isArabic ? 'الإكرامية' : 'Tips'}</span>
                      <span className="text-[#686868] font-semibold">{formatPrice(orderTips, activeLanguage)}</span>
                    </div>
                  )}
                </div>

                {/* Dashed Separator Line matching Figma Vector 13 */}
                <div className="border-b border-dashed border-zinc-200 my-2" />

                {/* Total Line matching Figma Frame 2147226322 */}
                <div className="flex justify-between items-center text-[17px] pt-0.5">
                  <span className="text-[#000000] font-medium">{isArabic ? 'المجموع' : 'Total'}</span>
                  <span className="text-[#026F4F] font-semibold text-[17px]">
                    {formatPrice(orderTotal, activeLanguage)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar matching Figma Frame 1171277297 (841:660): Add Items + Pay Now */}
        <div className="w-full max-w-[440px] mx-auto px-4 pt-5 pb-2">
          <div className="flex items-center gap-3">
            {/* Add Items Button (Button 841:723: radius 30px bg #E9E9E9 border #B9B9B9 text #2D2F33) */}
            <button
              type="button"
              onClick={onAddItems || onNewOrder}
              className="flex-1 h-[59px] rounded-[30px] bg-[#E9E9E9] hover:bg-[#dedede] border border-[#B9B9B9] text-[#2D2F33] font-medium text-[19px] leading-[140%] cursor-pointer transition-transform active:scale-[0.98] text-center flex items-center justify-center"
            >
              {isArabic ? 'إضافة أصناف' : 'Add Items'}
            </button>

            {/* Pay Now Button (Button 841:662: radius 30px bg #026F4F text white) */}
            <button
              type="button"
              onClick={onPayNow || onNewOrder}
              className="flex-1 h-[59px] rounded-[30px] bg-[#026F4F] hover:bg-[#025a40] text-white font-medium text-[19px] leading-[140%] shadow-md cursor-pointer transition-transform active:scale-[0.98] text-center flex items-center justify-center"
            >
              {isArabic ? 'الدفع الآن' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
