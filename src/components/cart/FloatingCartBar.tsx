import React from 'react';
import SvgCartIcon from '@/components/ui/svg-icons/CartSvg';
import { ArrowRight } from 'lucide-react';
import { formatPrice, type CartItem } from '@/types/menu';

interface FloatingCartBarProps {
  cart: CartItem[];
  onOpenCart: () => void;
  language?: 'ENGLISH' | 'ARABIC';
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  cart,
  onOpenCart,
  language = 'ENGLISH',
}) => {
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItemCount === 0) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.14; // 14% VAT in Egypt
  const grandTotal = subtotal + tax;

  const isArabic = language === 'ARABIC';

  const dishesText = isArabic
    ? `${totalItemCount} ${totalItemCount === 1 ? 'طبق' : 'أطباق'}`
    : `${totalItemCount} ${totalItemCount === 1 ? 'dish' : 'dishes'}`;

  const viewCartText = isArabic
    ? `عرض السلة - ${formatPrice(grandTotal, 'ARABIC')}`
    : `View Cart - ${formatPrice(grandTotal, 'ENGLISH')}`;

  return (
    <div
      onClick={onOpenCart}
      className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 max-w-md mx-auto z-40 cursor-pointer animate-in slide-in-from-bottom duration-300 select-none"
    >
      <div className="w-full bg-[#509B82] rounded-full shadow-2xl flex items-center p-1 overflow-hidden transition-all hover:opacity-98 active:scale-[0.99]">
        {/* Left Segment: Bag Icon & Item Count */}
        <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2 text-white font-bold text-xs sm:text-sm shrink-0">
          <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-white">
            <SvgCartIcon className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          </div>
          <span className="whitespace-nowrap tracking-tight">{dishesText}</span>
        </div>

        {/* Right Segment: Dark Emerald Green Overlap Pill */}
        <div className="flex-1 bg-[#026F4F] rounded-full py-2.5 px-4 sm:px-5 flex items-center justify-between text-white font-extrabold text-xs sm:text-sm shadow-md ml-1 rtl:ml-0 rtl:mr-1">
          <span className="tracking-wide">{viewCartText}</span>
          <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white shrink-0 ml-2 rtl:ml-0 rtl:mr-2 rtl:rotate-180" />
        </div>
      </div>
    </div>
  );
};
