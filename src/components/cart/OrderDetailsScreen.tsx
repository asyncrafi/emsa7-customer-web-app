import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/types/menu';

export type OrderStatus = 'preparing' | 'ready' | 'served';

interface OrderDetailsScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onNewOrder: () => void;
  language?: 'ENGLISH' | 'ARABIC';
  orderId?: string;
}

export const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({
  isOpen,
  onClose,
  onNewOrder,
  language = 'ENGLISH',
  orderId: _orderId = '#A102',
}) => {
  const [status, setStatus] = useState<OrderStatus>('preparing');

  const isArabic = language === 'ARABIC';

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

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#f4f4f5] antialiased select-none overflow-y-auto w-full min-h-[100dvh] flex flex-col justify-between pb-8 sm:pb-10 md:pb-12 ${
        isArabic ? 'font-sans rtl' : 'ltr'
      }`}
    >
      <div className="w-full flex-1 flex flex-col justify-between">
        <div>
          {/* Top Chef Illustration Box: Clean Responsive Container matching card width */}
          <div className="relative w-full max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto">
            {/* Rounded Bottom Illustration Frame */}
            <div className="w-full aspect-square bg-[#fdfbf7] flex items-center justify-center rounded-b-3xl sm:rounded-b-[2.5rem] md:rounded-b-[3rem] overflow-hidden relative shadow-xs">
              {/* Floating Circle Back Button */}
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5 md:top-6 md:left-6 z-20 rtl:left-auto rtl:right-4 rtl:sm:right-5 rtl:md:right-6">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Back"
                  className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white text-zinc-800 backdrop-blur-md shadow-md flex items-center justify-center cursor-pointer transition-all active:scale-95 border border-zinc-200/50"
                >
                  {isArabic ? <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" /> : <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />}
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
              <div className="absolute -bottom-12 sm:-bottom-14 md:-bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-[#026F4F] border-[5px] border-[#6ca591]/80 text-white flex flex-col items-center justify-center shadow-lg animate-in zoom-in duration-300">
                  <span className="text-xs sm:text-sm md:text-base font-medium text-emerald-50 leading-tight mb-0.5">
                    {currentConfig.badge}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5 text-white">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">25</span>
                    <span className="text-sm sm:text-base md:text-lg font-semibold">min</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Container for Tablet & Mobile: Increased Width for Tablet as requested! */}
          <div className="w-full max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
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
                  {/* Item 1 */}
                  <div className="flex items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-5 min-w-0">
                      <div className="w-13 h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-[#f4f4f5] p-2 md:p-2.5 flex items-center justify-center shrink-0 border border-zinc-100">
                        <img
                          src="/images/food/ramen.png"
                          alt="Shoyu Ramen"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-zinc-900 truncate">
                          Shoyu Ramen
                        </h3>
                        <p className="text-[11px] sm:text-xs md:text-sm text-zinc-400 font-normal italic">"No Sauce"</p>
                        <span className="font-bold text-xs sm:text-sm md:text-base text-zinc-800 block mt-0.5">x1</span>
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-[#026F4F]">
                      {formatPrice(15.99, language)}
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between gap-3 md:gap-4 pt-3 md:pt-4 border-t border-zinc-50">
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-5 min-w-0">
                      <div className="w-13 h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-[#f4f4f5] p-2 md:p-2.5 flex items-center justify-center shrink-0 border border-zinc-100">
                        <img
                          src="/images/food/ramen.png"
                          alt="Shoyu Ramen"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-zinc-900 truncate">
                          Shoyu Ramen
                        </h3>
                        <p className="text-[11px] sm:text-xs md:text-sm text-zinc-400 font-normal italic">"No Sauce"</p>
                        <span className="font-bold text-xs sm:text-sm md:text-base text-zinc-800 block mt-0.5">x1</span>
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-[#026F4F]">
                      {formatPrice(15.99, language)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Payments Details */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs border border-zinc-100 space-y-3 md:space-y-4">
                <h2 className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-900">
                  {isArabic ? 'تفاصيل الدفع' : 'Payments Details'}
                </h2>

                <div className="space-y-2 md:space-y-3 text-xs sm:text-sm md:text-base lg:text-lg font-medium">
                  <div className="flex justify-between text-zinc-400">
                    <span>{isArabic ? 'المجموع الفرعي (3 أصناف)' : 'Subtotal (3items)'}</span>
                    <span className="text-zinc-800 font-bold">{formatPrice(25.99, language)}</span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>{isArabic ? 'رسوم الخدمة (10%)' : 'Service Charge (10%)'}</span>
                    <span className="text-zinc-800 font-bold">{formatPrice(25.99, language)}</span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'VAT (5%)'}</span>
                    <span className="text-zinc-800 font-bold">{formatPrice(1.3, language)}</span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>{isArabic ? 'الإكرامية' : 'Tips'}</span>
                    <span className="text-zinc-800 font-bold">{formatPrice(5.0, language)}</span>
                  </div>
                </div>

                {/* Dashed Separator Line */}
                <div className="border-b border-dashed border-zinc-200 my-2.5 md:my-3.5" />

                {/* Total Line */}
                <div className="flex justify-between items-center font-bold text-sm sm:text-base md:text-lg lg:text-xl pt-1">
                  <span className="text-zinc-900">{isArabic ? 'المجموع' : 'Total'}</span>
                  <span className="text-[#026F4F] font-bold text-base sm:text-lg md:text-xl lg:text-2xl">
                    {formatPrice(45.99, language)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Fixed Action Button: New Order */}
        <div className="w-full max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6">
          <button
            type="button"
            onClick={onNewOrder}
            className="w-full py-4 md:py-5 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl tracking-wide shadow-md active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            {isArabic ? 'طلب جديد' : 'New Order'}
          </button>
        </div>
      </div>
    </div>
  );
};
