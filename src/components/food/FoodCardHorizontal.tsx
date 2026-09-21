import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { type MenuItem, formatPrice } from '@/types/menu';

interface FoodCardHorizontalProps {
  item: MenuItem;
  quantity?: number;
  language?: 'ENGLISH' | 'ARABIC';
  onAdd?: (item: MenuItem) => void;
  onIncrement?: (item: MenuItem) => void;
  onDecrement?: (item: MenuItem) => void;
  onClick?: (item: MenuItem) => void;
}

export const FoodCardHorizontal: React.FC<FoodCardHorizontalProps> = ({
  item,
  quantity = 0,
  language = 'ENGLISH',
  onAdd,
  onIncrement,
  onDecrement,
  onClick,
}) => {
  const title = language === 'ARABIC' ? item.nameAr || item.name : item.name;
  const description = language === 'ARABIC' ? item.descriptionAr || item.description : item.description;

  return (
    <div
      onClick={() => onClick && onClick(item)}
      className="group relative bg-white border border-zinc-100 rounded-2xl p-3 sm:p-3.5 shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-3 sm:gap-4 cursor-pointer select-none overflow-hidden"
    >
      {/* Left Image Box Container: Full-width object-cover matching Figma design */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-xl sm:rounded-2xl bg-zinc-100 overflow-hidden shrink-0 relative">
        <img
          src={item.imageUrl}
          alt={title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/food/ramen.png';
          }}
        />
      </div>

      {/* Right Column: Title, Description, Price & Actions */}
      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5 h-full">
        <div>
          <h3 className="font-bold text-zinc-900 text-xs sm:text-sm md:text-base leading-snug line-clamp-1 tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-400 font-medium line-clamp-2 mt-0.5 sm:mt-1 leading-normal">
            {description}
          </p>
        </div>

        {/* Bottom Row: Price & Quantity Controls (Blue Zone) */}
        <div className="pt-2 sm:pt-3 flex items-center justify-between mt-auto">
          <span className="font-extrabold text-xs sm:text-sm md:text-base tracking-tight text-primary">
            {formatPrice(item.price, language)}
          </span>

          {quantity > 0 ? (
            /* Stepper Pill when Item is in Cart */
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#f4f4f5] rounded-full p-1 flex items-center gap-1.5 sm:gap-2 shrink-0 border border-zinc-200/60 shadow-2xs"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDecrement?.(item);
                }}
                aria-label={`Decrease ${title} quantity`}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#509B82] hover:bg-[#025a40] text-white flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span className="font-extrabold text-xs sm:text-sm text-zinc-900 min-w-[1.1rem] text-center">
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
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
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
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
