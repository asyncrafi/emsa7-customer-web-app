import React from 'react';
import { type MenuItem, formatPrice } from '@/types/menu';
import { useLanguage } from '@/providers/LanguageContext';

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
      className="group relative bg-white border border-zinc-100/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all duration-200 flex items-center gap-3 cursor-pointer select-none overflow-hidden"
    >
      {/* Left Image Box: Centered food photo inside soft gray container matching Figma Frame 1171277079 (86x94 bg #f1f1f1) */}
      <div className="w-[86px] h-[94px] rounded-xl bg-[#F1F1F1] overflow-hidden shrink-0 relative flex items-center justify-center p-1.5">
        <img
          src={item.imageUrl}
          alt={title}
          className="w-[65px] h-[65px] object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/food/ramen.png';
          }}
        />
      </div>

      {/* Right Column: Title, Description, Price & Actions */}
      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5 h-full">
        <div>
          <h3 className="font-medium text-[#2D2F33] text-[15px] leading-[140%] line-clamp-1 tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] text-[#989898] font-normal line-clamp-2 mt-0.5 leading-[140%]">
            {description}
          </p>
        </div>

        {/* Bottom Row: Price & Quantity Controls matching Figma (Price semi-bold #026F4F) */}
        <div className="pt-2 flex items-center justify-between mt-auto gap-1">
          <span className="font-semibold text-[16px] sm:text-[18px] leading-[140%] tracking-tight text-[#026F4F] shrink-0">
            {formatPrice(item.price, activeLanguage)}
          </span>

          {quantity > 0 ? (
            /* Stepper with compact spacing matching Figma */
            <div
              dir="ltr"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 h-[28px] shrink-0"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDecrement?.(item);
                }}
                aria-label={`Decrease ${title} quantity`}
                className="w-[24px] h-[24px] rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform shrink-0"
              >
                <img src="/icons/lsicon_minus-filled.svg" alt="Decrease" className="w-[24px] h-[24px]" />
              </button>
              <span className="font-semibold text-[15px] text-[#2D2F33] min-w-[14px] text-center leading-none select-none">
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
                className="w-[24px] h-[24px] rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform shrink-0"
              >
                <img src="/icons/mynaui_plus-circle-solid.svg" alt="Increase" className="w-[24px] h-[24px]" />
              </button>
            </div>
          ) : (
            /* Single + Button when Item is not in Cart */
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (item.optionGroups && item.optionGroups.length > 0 && onClick) {
                  onClick(item);
                } else if (onAdd) {
                  onAdd(item);
                } else if (onIncrement) {
                  onIncrement(item);
                }
              }}
              aria-label={`Add ${title} to cart`}
              className="w-[28px] h-[28px] rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <img src="/icons/mynaui_plus-circle-solid.svg" alt="Add" className="w-[28px] h-[28px]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
