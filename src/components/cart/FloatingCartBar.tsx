import React from 'react';
import SvgCartIcon from '@/components/ui/svg-icons/CartSvg';
import { ArrowRight } from 'lucide-react';
import { formatPrice, type CartItem, getCartSubtotal } from '@/types/menu';
import { useLanguage } from '@/providers/LanguageContext';

interface FloatingCartBarProps {
  cart: CartItem[];
  onOpenCart: () => void;
  language?: 'ENGLISH' | 'ARABIC';
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  cart,
  onOpenCart,
  language: propLanguage,
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = propLanguage || contextLanguage;
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItemCount === 0) return null;

  const subtotal = getCartSubtotal(cart);
  const grandTotal = subtotal;

  const isArabic = activeLanguage === 'ARABIC';

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
      <div className="w-full h-[59px] bg-[#559F89] rounded-full shadow-2xl flex items-center p-1 overflow-hidden transition-all hover:opacity-98 active:scale-[0.99]">
        {/* Left Segment: Bag Icon & Item Count matching Figma (16px normal white) */}
        <div className="flex items-center gap-2 px-3.5 sm:px-4 text-white text-[15px] sm:text-[16px] font-normal shrink-0">
          <div className="w-5 h-5 flex items-center justify-center text-white">
            <SvgCartIcon className="w-5 h-5 fill-current" />
          </div>
          <span className="whitespace-nowrap tracking-tight">{dishesText}</span>
        </div>

        {/* Right Segment: Dark Emerald Green Overlap Pill matching Figma (h-full bg #026F4F, 16px medium white) */}
        <div className="flex-1 h-full bg-[#026F4F] rounded-full px-4 sm:px-5 flex items-center justify-between text-white font-medium text-[15px] sm:text-[16px] leading-[140%] shadow-md ml-1 rtl:ml-0 rtl:mr-1">
          <span className="tracking-tight">{viewCartText}</span>
          <ArrowRight className="w-4.5 h-4.5 text-white shrink-0 ml-2 rtl:ml-0 rtl:mr-2 rtl:rotate-180" />
        </div>
      </div>
    </div>
  );
};
