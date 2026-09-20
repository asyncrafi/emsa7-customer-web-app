import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { type CartItem, formatPrice } from '@/types/menu';
import { QuantityControl } from '@/components/food/QuantityControl';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onClearCart: () => void;
  language?: 'ENGLISH' | 'ARABIC';
  tableName?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cart,
  onClose,
  onIncrement,
  onDecrement,
  onRemove,
  onClearCart,
  language = 'ENGLISH',
  tableName = 'Table A08',
}) => {
  if (!isOpen) return null;

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.14; // 14% VAT in Egypt
  const grandTotal = subtotal + tax;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-zinc-900 leading-tight">
                {language === 'ARABIC' ? 'طلبك الحالي' : 'My Order'}
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                {tableName} • {totalItemCount} {language === 'ARABIC' ? 'أصناف' : 'items'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-200/60 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <ShoppingBag className="w-16 h-16 stroke-1 mb-3 text-zinc-300" />
              <p className="font-bold text-base text-zinc-700">
                {language === 'ARABIC' ? 'سلة الطلب فارغة' : 'Your cart is empty'}
              </p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                {language === 'ARABIC'
                  ? 'أضف بعض الأطباق والمشروبات اللذيذة من القائمة للبدء.'
                  : 'Add some delicious ramen or drinks from the menu to get started.'}
              </p>
            </div>
          ) : (
            cart.map(({ item, quantity, specialInstructions }) => {
              const itemTitle =
                language === 'ARABIC' ? item.nameAr || item.name : item.name;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 bg-white shadow-2xs"
                >
                  <img
                    src={item.imageUrl}
                    alt={itemTitle}
                    className="w-16 h-16 rounded-xl bg-[#f4f4f5] object-contain p-1.5 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 truncate">
                        {itemTitle}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="text-zinc-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {specialInstructions && (
                      <p className="text-[11px] text-primary/80 font-medium line-clamp-1 italic mt-0.5">
                        "{specialInstructions}"
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-extrabold text-xs sm:text-sm text-primary">
                        {formatPrice(item.price * quantity, language)}
                      </span>

                      <QuantityControl
                        quantity={quantity}
                        onIncrement={() => onIncrement(item.id)}
                        onDecrement={() => onDecrement(item.id)}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Pricing Summary & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/80 space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs text-zinc-500 font-medium">
              <div className="flex justify-between">
                <span>{language === 'ARABIC' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="font-bold text-zinc-800">
                  {formatPrice(subtotal, language)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'ARABIC' ? 'ضريبة القيمة المضافة (14%)' : 'VAT (14%)'}</span>
                <span className="font-bold text-zinc-800">
                  {formatPrice(tax, language)}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-zinc-900 pt-1 border-t border-zinc-200">
                <span>{language === 'ARABIC' ? 'المجموع الكلي' : 'Total'}</span>
                <span className="text-primary font-black">
                  {formatPrice(grandTotal, language)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert(
                  language === 'ARABIC'
                    ? 'تم إرسال طلبك إلى المطبخ بنجاح!'
                    : 'Order sent to kitchen successfully!'
                );
                onClearCart();
                onClose();
              }}
              className="w-full py-3.5 px-4 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-sm sm:text-base tracking-wide shadow-md active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{language === 'ARABIC' ? 'إرسال الطلب للمطبخ' : 'Send Order to Kitchen'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
