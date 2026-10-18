import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { type MenuItem, formatPrice } from '@/types/menu';
import { useLanguage } from '@/providers/LanguageContext';

interface FoodCardVerticalProps {
  item: MenuItem;
  quantity?: number;
  language?: 'ENGLISH' | 'ARABIC';
  onAdd?: (item: MenuItem) => void;
  onIncrement?: (item: MenuItem) => void;
  onDecrement?: (item: MenuItem) => void;
  onClick?: (item: MenuItem) => void;
}

export const FoodCardVertical: React.FC<FoodCardVerticalProps> = ({
  item,
  quantity = 0,
  language: propLanguage,
  onAdd,
  onIncrement,
  onDecrement,
  onClick,
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = propLanguage || contextLanguage;
  const title = activeLanguage === 'ARABIC' ? item.nameAr || item.name : item.name;
  const description = activeLanguage === 'ARABIC' ? item.descriptionAr || item.description : item.description;

  return (
    <div
      onClick={() => onClick && onClick(item)}
      className="group relative bg-white border border-zinc-100/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between cursor-pointer select-none overflow-hidden"
    >
      {/* Top Image Container: Centered food photo inside soft gray container */}
      <div className="w-full aspect-[4/3] rounded-xl bg-[#F4F5F7] overflow-hidden relative flex items-center justify-center p-2 mb-2">
        <img
          src={item.imageUrl}
          alt={title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/food/ramen.png';
          }}
        />
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-zinc-900 text-xs sm:text-sm leading-snug line-clamp-1 tracking-tight">
            {title}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-zinc-400 font-normal line-clamp-1 mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Price & Action Button Footer */}
        <div className="pt-2 flex items-center justify-between mt-auto">
          <span className="font-bold text-xs sm:text-sm tracking-tight text-[#026F4F]">
            {formatPrice(item.price, activeLanguage)}
          </span>

          {quantity > 0 ? (
            /* Stepper Pill when Item is in Cart */
            <div
              dir="ltr"
              onClick={(e) => e.stopPropagation()}
              className="bg-[#f4f4f5] rounded-full p-0.5 flex items-center gap-1 shrink-0 border border-zinc-200/60 shadow-2xs"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDecrement?.(item);
                }}
                aria-label={`Decrease ${title} quantity`}
                className="w-5.5 h-5.5 rounded-full bg-[#509B82] hover:bg-[#025a40] text-white flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              >
                <Minus className="w-3 h-3 stroke-[2.5]" />
              </button>
              <span className="font-bold text-xs text-zinc-900 min-w-[1rem] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onIncrement) onIncrement(item);
                  else if (onAdd) onAdd(item);
                }}
                aria-label={`Increase ${title} quantity`}
                className="w-5.5 h-5.5 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            /* Single + Button when Item is not in Cart */
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onAdd) onAdd(item);
                else if (onIncrement) onIncrement(item);
              }}
              aria-label={`Add ${title} to cart`}
              className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
