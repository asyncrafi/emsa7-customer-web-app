import React, { useState } from 'react';
import { X, Plus, Minus, Flame } from 'lucide-react';
import { type MenuItem, formatPrice } from '@/types/menu';

interface FoodDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, instructions: string) => void;
  language?: 'ENGLISH' | 'ARABIC';
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
  language = 'ENGLISH',
}) => {
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  if (!isOpen || !item) return null;

  const title = language === 'ARABIC' ? item.nameAr || item.name : item.name;
  const description = language === 'ARABIC' ? item.descriptionAr || item.description : item.description;

  const handleAdd = () => {
    onAddToCart(item, quantity, instructions);
    setQuantity(1);
    setInstructions('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Image Area */}
        <div className="relative w-full h-56 sm:h-64 bg-[#f4f4f5] flex items-center justify-center p-6 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-700 shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src={item.imageUrl}
            alt={title}
            className="w-full h-full object-contain drop-shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/food/ramen.png';
            }}
          />

          {item.isPopular && (
            <div className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold shadow-xs">
              <Flame className="w-3.5 h-3.5" />
              <span>{language === 'ARABIC' ? 'شعبية' : 'Popular'}</span>
            </div>
          )}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
                {title}
              </h2>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-semibold capitalize">
                {item.category}
              </span>
            </div>
            <span className="text-lg sm:text-xl font-black shrink-0 text-primary">
              {formatPrice(item.price * quantity, language)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-500 font-medium leading-relaxed">
            {description}
          </p>

          {/* Special Instructions Input */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              {language === 'ARABIC' ? 'ملاحظات خاصة' : 'Special Instructions'}
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={
                language === 'ARABIC'
                  ? 'مثال: بدون بصل، صلصة إضافية...'
                  : 'E.g. No onions, extra sauce on the side...'
              }
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
            />
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between gap-4 shrink-0">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3 bg-white border border-zinc-200 px-3 py-1.5 rounded-full shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-7 h-7 rounded-full bg-primary/70 hover:bg-primary/85 text-white flex items-center justify-center font-bold disabled:opacity-40 cursor-pointer active:scale-90 transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-extrabold text-sm text-zinc-800 min-w-[20px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center font-bold cursor-pointer active:scale-90 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 py-3 px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-sm sm:text-base tracking-wide shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between"
          >
            <span>{language === 'ARABIC' ? 'إضافة إلى الطلب' : 'Add to Order'}</span>
            <span>{formatPrice(item.price * quantity, language)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
