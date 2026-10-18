import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/types/menu';
import { useLanguage } from '@/providers/LanguageContext';
import type { StoredOrder } from '@/components/cart/MyOrderScreen';

export type OrderStatus = 'preparing' | 'ready' | 'served';

interface OrderDetailsScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onNewOrder: () => void;
  language?: 'ENGLISH' | 'ARABIC';
  orderId?: string;
  order?: StoredOrder | null;
}

export const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({
  isOpen,
  onClose,
  onNewOrder,
  language: propLanguage,
  orderId: _orderId = '#A102',
  order,
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = propLanguage || contextLanguage;
  const [status, setStatus] = useState<OrderStatus>('preparing');

  const isArabic = activeLanguage === 'ARABIC';

  // Auto-transition status after 3 seconds per status: preparing -> ready -> served
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setStatus((current) => {
        if (current === 'preparing') return 'ready';
        if (current === 'ready') return 'served';
        return 'served';
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [isOpen, status]);

  if (!isOpen) return null;

  // Configuration for each status state matching Figma screenshots
  const statusConfig = {
    preparing: {
      image: '/images/common/preparing.png',
      title: isArabic ? 'نحن نعد طلبك' : "We're preparing your order",
      subtitle: isArabic
        ? 'سنحضره إلى طاولتك عندما يكون جاهزاً'
        : "We'll bring it to your table when it's ready",
      badge: isArabic ? 'تقديم خلال' : 'Serve in',
      badgeTime: '25 min',
    },
    ready: {
      image: '/images/common/ready.png',
      title: isArabic ? 'طلبك جاهز' : 'Your order is ready',
      subtitle: isArabic ? 'سيتم تقديمه قريباً' : 'It will be served shortly',
      badge: null,
      badgeTime: null,
    },
    served: {
      image: '/images/common/served.png',
      title: isArabic ? 'تم تقديم طلبك' : 'Your order has been served',
      subtitle: isArabic ? 'استمتع بوجبتك!' : 'Enjoy your meal!',
      badge: null,
      badgeTime: null,
    },
  };

  const currentConfig = statusConfig[status];

  const orderSubtotal =
    order?.subtotal ??
    (order?.items?.reduce((sum, it) => sum + it.price * it.qty, 0) || 25.99);
  const orderServiceCharge =
    order?.serviceCharge !== undefined && order.serviceCharge > 0
      ? order.serviceCharge
      : Math.round(orderSubtotal * 0.10 * 100) / 100;
  const orderVat =
    order?.vat !== undefined && order.vat > 0
      ? order.vat
      : Math.round(orderSubtotal * 0.05 * 100) / 100;

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#f4f4f5] antialiased select-none overflow-y-auto w-full min-h-[100dvh] flex flex-col justify-between pb-8 sm:pb-10 md:pb-12 font-sans"
    >
      <div className="w-full flex-1 flex flex-col justify-between">
        <div>
          {/* Top Chef Illustration Box: Strictly responsive mobile 440px container matching Figma */}
          <div className="relative w-full max-w-[440px] mx-auto">
            {/* Rounded Bottom Illustration Frame */}
            <div className="w-full aspect-square bg-[#fdfbf7] flex items-center justify-center rounded-b-3xl sm:rounded-b-[2.5rem] overflow-hidden relative shadow-xs">
              {/* Floating Circle Back Button */}
              <div className="absolute top-4 left-4 z-20 rtl:left-auto rtl:right-4">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Back"
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-zinc-800 backdrop-blur-md shadow-md flex items-center justify-center cursor-pointer transition-all active:scale-95 border border-zinc-200/50"
                >
                  {isArabic ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                </button>
              </div>

              {/* Chef Illustration Image: aspect-square matches source 660x660 image perfectly so full image is shown */}
              <img
                src={currentConfig.image}
                alt={currentConfig.title}
                className="w-full h-full object-contain transition-all duration-500 animate-in fade-in"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/food/ramen.png';
                }}
              />
            </div>

            {/* Overlapping Serve Badge */}
            {status === 'preparing' && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <div className="w-28 h-28 sm:w-30 sm:h-30 rounded-full bg-[#026F4F] border-[5px] border-[#6ca591]/80 text-white flex flex-col items-center justify-center shadow-lg animate-in zoom-in duration-300">
                  <span className="text-xs sm:text-sm font-medium text-emerald-50 leading-tight mb-0.5">
                    {currentConfig.badge}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5 text-white">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">25</span>
                    <span className="text-sm font-semibold">min</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Container: Strictly responsive mobile 440px width matching Figma */}
          <div className="w-full max-w-[440px] mx-auto px-4">
            {/* Status Title & Description */}
            <div
              className={`text-center space-y-1.5 animate-in fade-in duration-300 ${
                status === 'preparing' ? 'pt-16 sm:pt-18 md:pt-20' : 'pt-6 sm:pt-8 md:pt-10'
              }`}
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight">
                {currentConfig.title}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-zinc-400 font-medium">
                {currentConfig.subtitle}
              </p>
            </div>

            {/* Cards Container with MORE WIDTH for Tablet! */}
            <div className="pt-6 space-y-4 md:space-y-6">
              {/* Card 1: Order Summary */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs border border-zinc-100 space-y-4 md:space-y-5">
                <h2 className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-900">
                  {isArabic ? 'ملخص الطلب' : 'Order Summary'}
                </h2>

                <div className="space-y-3.5 md:space-y-4">
                  {order?.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 md:gap-4 pt-3 md:pt-4 first:pt-0 first:border-0 border-t border-zinc-50">
                      <div className="flex items-center gap-3 sm:gap-4 md:gap-5 min-w-0">
                        <div className="w-13 h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-[#f4f4f5] p-2 md:p-2.5 flex items-center justify-center shrink-0 border border-zinc-100">
                          <img
                            src={item.image || '/images/food/ramen.png'}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-zinc-900 truncate">
                            {item.name}
                          </h3>
                          <span className="font-bold text-xs sm:text-sm md:text-base text-zinc-800 block mt-0.5">x{item.qty}</span>
                        </div>
                      </div>
                      <span className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-[#026F4F]">
                        {formatPrice(item.price * item.qty, activeLanguage)}
                      </span>
                    </div>
                  ))}
                  {!order?.items?.length && (
                    <div className="text-sm text-zinc-500">{isArabic ? 'لا توجد أصناف' : 'No items found'}</div>
                  )}
                </div>
              </div>

              {/* Card 2: Payments Details (Figma-Exact) */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs border border-zinc-100 space-y-3 md:space-y-4">
                <h2 className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-900">
                  {isArabic ? 'تفاصيل الدفع' : 'Payments Details'}
                </h2>

                <div className="space-y-2 md:space-y-3 text-xs sm:text-sm md:text-base lg:text-lg font-medium">
                  <div className="flex justify-between text-zinc-400">
                    <span>{isArabic ? `المجموع الفرعي (${order?.items?.length || 0} أصناف)` : `Subtotal (${order?.items?.length || 0} items)`}</span>
                    <span className="text-zinc-800 font-bold">{formatPrice(orderSubtotal, activeLanguage)}</span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>{isArabic ? `رسوم الخدمة (10%)` : 'Service Charge (10%)'}</span>
                    <span className="text-zinc-800 font-bold">{formatPrice(orderServiceCharge, activeLanguage)}</span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'VAT (5%)'}</span>
                    <span className="text-zinc-800 font-bold">{formatPrice(orderVat, activeLanguage)}</span>
                  </div>

                  {(order?.tipAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-zinc-400">
                      <span>{isArabic ? 'الإكرامية' : 'Tips'}</span>
                      <span className="text-zinc-800 font-bold">{formatPrice(order?.tipAmount || 0, activeLanguage)}</span>
                    </div>
                  )}

                  {(order?.splitFee ?? 0) > 0 && (
                    <div className="flex justify-between text-rose-500 font-medium">
                      <span>{isArabic ? 'رسوم التقسيم' : 'Splitting Fees'}</span>
                      <span className="font-bold">{formatPrice(order?.splitFee || 0, activeLanguage)}</span>
                    </div>
                  )}

                  {(order?.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>{isArabic ? 'الخصم' : 'Discount'}</span>
                      <span className="font-bold">-{formatPrice(order?.discount || 0, activeLanguage)}</span>
                    </div>
                  )}
                </div>

                {/* Dashed Separator Line */}
                <div className="border-b border-dashed border-zinc-200 my-2.5 md:my-3.5" />

                {/* Total Line */}
                <div className="flex justify-between items-center font-bold text-sm sm:text-base md:text-lg lg:text-xl pt-1">
                  <span className="text-zinc-900">{isArabic ? 'المجموع' : 'Total'}</span>
                  <span className="text-[#026F4F] font-bold text-base sm:text-lg md:text-xl lg:text-2xl">
                    {formatPrice(order?.total || 45.99, activeLanguage)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Fixed Action Button: New Order */}
        <div className="w-full max-w-[440px] mx-auto px-4 pt-6">
          <button
            type="button"
            onClick={onNewOrder}
            className="w-full py-4 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-bold text-sm sm:text-base tracking-wide shadow-md active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            {isArabic ? 'طلب جديد' : 'New Order'}
          </button>
        </div>
      </div>
    </div>
  );
};
