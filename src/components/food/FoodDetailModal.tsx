import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Plus, Minus } from 'lucide-react';
import { type MenuItem, type SelectedOption, formatPrice } from '@/types/menu';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface FoodDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    instructions: string,
    selectedOptions?: SelectedOption[]
  ) => void;
  language?: 'ENGLISH' | 'ARABIC';
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
  language = 'ENGLISH',
}) => {
  // Lock body scroll when modal is open
  useBodyScrollLock(isOpen);

  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<string, string[]>>({});

  const isArabic = language === 'ARABIC';

  // Initialize option group defaults whenever item opens
  useEffect(() => {
    if (!item) return;

    setQuantity(1);
    setInstructions('');

    const initialSelections: Record<string, string[]> = {};

    if (item.optionGroups && item.optionGroups.length > 0) {
      item.optionGroups.forEach((group) => {
        if (group.required && group.options.length > 0) {
          // Default select first option for required groups
          initialSelections[group.id] = [group.options[0].id];
        } else {
          initialSelections[group.id] = [];
        }
      });
    }

    setSelectedOptionsMap(initialSelections);
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const title = isArabic ? item.nameAr || item.name : item.name;
  const description = isArabic ? item.descriptionAr || item.description : item.description;

  // Toggle or select option item
  const handleSelectOption = (groupId: string, optionId: string, isSingle: boolean) => {
    setSelectedOptionsMap((prev) => {
      const current = prev[groupId] || [];
      if (isSingle) {
        return { ...prev, [groupId]: [optionId] };
      }
      // Multiple selection toggle
      const exists = current.includes(optionId);
      const updated = exists ? current.filter((id) => id !== optionId) : [...current, optionId];
      return { ...prev, [groupId]: updated };
    });
  };

  // Compute total price including selected options & quantity
  let extrasTotal = 0;
  const selectedOptionsList: SelectedOption[] = [];

  if (item.optionGroups) {
    item.optionGroups.forEach((group) => {
      const selectedOptionIds = selectedOptionsMap[group.id] || [];
      group.options.forEach((opt) => {
        if (selectedOptionIds.includes(opt.id)) {
          extrasTotal += opt.price;
          selectedOptionsList.push({
            groupId: group.id,
            groupTitle: group.title,
            optionId: opt.id,
            optionName: opt.name,
            price: opt.price,
          });
        }
      });
    });
  }

  const unitPrice = item.price + extrasTotal;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCart(item, quantity, instructions, selectedOptionsList);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg bg-white rounded-t-[2.25rem] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[92vh] sm:max-h-[88vh] relative ${
          isArabic ? 'font-sans rtl' : 'ltr'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Food Image Container */}
        <div className="relative w-full h-56 sm:h-64 bg-[#f4f4f5] flex items-center justify-center p-6 shrink-0">
          {/* Back Circular Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-zinc-700 backdrop-blur-md shadow-md flex items-center justify-center cursor-pointer transition-all active:scale-95 rtl:left-auto rtl:right-4"
          >
            {isArabic ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>

          {/* Large Center Dish Image */}
          <img
            src={item.imageUrl}
            alt={title}
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/food/ramen.png';
            }}
          />
        </div>

        {/* Scrollable Content Body Area */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 pt-5 pb-4 space-y-5 bg-white -mt-5 rounded-t-[2rem] relative z-10">
          {/* Title & Base Price Row */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                {title}
              </h2>
              <span className="text-lg sm:text-xl font-extrabold text-[#026F4F] shrink-0">
                {formatPrice(item.price, language)}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed mt-1.5">
              {description}
            </p>
          </div>

          {/* Dynamic Option Groups (Noodle Texture, Add Extras, etc.) */}
          {item.optionGroups &&
            item.optionGroups.map((group) => {
              const groupTitle = isArabic ? group.titleAr || group.title : group.title;
              const selectedIds = selectedOptionsMap[group.id] || [];

              return (
                <div key={group.id} className="pt-2 border-t border-zinc-100/80">
                  {/* Option Group Header & Badge */}
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
                      {groupTitle}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide ${
                        group.required
                          ? 'bg-[#27272a] text-white'
                          : 'bg-[#f4f4f5] text-zinc-500'
                      }`}
                    >
                      {group.required
                        ? isArabic
                          ? 'مطلوب'
                          : 'Required'
                        : isArabic
                        ? 'اختياري'
                        : 'Optional'}
                    </span>
                  </div>

                  {/* Options List */}
                  <div className="space-y-1">
                    {group.options.map((opt) => {
                      const optName = isArabic ? opt.nameAr || opt.name : opt.name;
                      const isSelected = selectedIds.includes(opt.id);
                      const isSingle = group.type === 'single';

                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectOption(group.id, opt.id, isSingle)}
                          className="flex items-center justify-between py-2.5 px-1 cursor-pointer hover:bg-zinc-50 rounded-xl transition-colors select-none"
                        >
                          <span className="text-xs sm:text-sm font-semibold text-zinc-700">
                            {optName}
                          </span>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-zinc-400">
                              {opt.price === 0
                                ? isArabic
                                  ? 'مجاني'
                                  : 'Free'
                                : `+${formatPrice(opt.price, language)}`}
                            </span>

                            {/* Radio / Checkbox Indicator Circle */}
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                                isSelected ? 'border-[#026F4F]' : 'border-zinc-300'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#026F4F]" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          {/* Special Instructions Field */}
          <div className="pt-2 border-t border-zinc-100/80">
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight mb-2">
              {isArabic ? 'تعليمات خاصة' : 'Special instructions'}
            </h3>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={
                isArabic
                  ? 'أضف ملاحظة (مثال: بدون فلفل حار، ملح أقل)'
                  : 'Add note (e.g. no spicy, less salt)'
              }
              className="w-full bg-[#f4f4f5] border border-zinc-200/60 rounded-2xl p-3.5 text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#026F4F] focus:bg-white transition-all min-h-[85px] resize-none"
            />
          </div>
        </div>

        {/* Sticky Bottom Action Footer Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-zinc-100 flex items-center gap-3 shrink-0">
          {/* Quantity Stepper Pill */}
          <div className="bg-[#f4f4f5] rounded-full p-1.5 flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#509B82] disabled:opacity-50 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <span className="font-bold text-sm sm:text-base text-zinc-800 w-5 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#026F4F] text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Add to Cart Primary Button */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 bg-[#026F4F] hover:bg-[#025a40] text-white py-3 sm:py-3.5 px-5 rounded-full font-bold text-xs sm:text-base flex items-center justify-between shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>{isArabic ? 'إضافة إلى السلة' : 'Add to Cart'}</span>
            <span className="font-extrabold">{formatPrice(totalPrice, language)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
