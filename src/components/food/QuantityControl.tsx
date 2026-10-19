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
  if (size === 'sm') {
    return (
      <div
        dir="ltr"
        className="w-[79px] h-[31px] rounded-[42px] bg-[#F2F2F2] px-[5px] py-[4px] inline-flex items-center justify-between select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minus Button: Figma Vector 22.5x22.5 circle, fill #559F89 */}
        <button
          type="button"
          onClick={onDecrement}
          aria-label="Decrease quantity"
          className="w-[22.5px] h-[22.5px] rounded-full bg-[#559F89] hover:bg-[#468673] active:scale-90 transition-transform text-white flex items-center justify-center cursor-pointer shrink-0"
        >
          <div className="w-[8px] h-[2px] bg-white rounded-full" />
        </button>

        {/* Quantity Display: Figma 14.9px SemiBold #2D2F33 */}
        <span className="text-[14px] font-semibold text-[#2D2F33] text-center leading-none">
          {quantity}
        </span>

        {/* Plus Button: Figma Vector 22.5x22.5 circle, fill #026F4F */}
        <button
          type="button"
          onClick={onIncrement}
          aria-label="Increase quantity"
          className="w-[22.5px] h-[22.5px] rounded-full bg-[#026F4F] hover:bg-[#025a40] active:scale-90 transition-transform text-white flex items-center justify-center cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    );
  }

  return (
    <div
      dir="ltr"
      className="inline-flex items-center gap-2 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Minus Button */}
      <button
        type="button"
        onClick={onDecrement}
        aria-label="Decrease quantity"
        className="w-8 h-8 rounded-full bg-[#559F89] hover:bg-[#468673] active:scale-90 transition-all text-white flex items-center justify-center font-medium shadow-2xs cursor-pointer shrink-0"
      >
        <Minus className="w-4 h-4 stroke-2" />
      </button>

      {/* Quantity Display */}
      <span className="text-sm font-semibold text-[#2D2F33] min-w-[16px] text-center">
        {quantity}
      </span>

      {/* Plus Button */}
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
        className="w-8 h-8 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white active:scale-90 transition-all flex items-center justify-center font-medium shadow-2xs cursor-pointer shrink-0"
      >
        <Plus className="w-4 h-4 stroke-2" />
      </button>
    </div>
  );
};
