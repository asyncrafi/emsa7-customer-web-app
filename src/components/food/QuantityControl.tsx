import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityControlProps {
  quantity: number;
  onIncrement: (e: React.MouseEvent) => void;
  onDecrement: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
}

export const QuantityControl: React.FC<QuantityControlProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  size = 'md',
}) => {
  const buttonSizeClass =
    size === 'sm'
      ? 'w-7 h-7 text-xs'
      : 'w-8 h-8 sm:w-8.5 sm:h-8.5 text-xs sm:text-sm';

  return (
    <div
      dir="ltr"
      className="inline-flex items-center gap-2 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Minus Button (Soft Primary Green Variant) */}
      <button
        type="button"
        onClick={onDecrement}
        aria-label="Decrease quantity"
        className={`${buttonSizeClass} rounded-full bg-primary/70 hover:bg-primary/85 active:scale-90 transition-all text-white flex items-center justify-center font-bold shadow-2xs cursor-pointer shrink-0`}
      >
        <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
      </button>

      {/* Quantity Display */}
      <span className="text-xs sm:text-sm font-medium text-[#2D2F33] min-w-[16px] text-center">
        {quantity}
      </span>

      {/* Plus Button (Solid Primary Green) */}
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
        className={`${buttonSizeClass} rounded-full bg-primary text-white hover:bg-primary/90 active:scale-90 transition-all flex items-center justify-center font-bold shadow-2xs cursor-pointer shrink-0`}
      >
        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
      </button>
    </div>
  );
};
