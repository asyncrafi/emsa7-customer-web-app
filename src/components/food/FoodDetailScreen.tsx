import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Plus, Minus } from 'lucide-react';
import { type MenuItem, type SelectedOption, formatPrice } from '@/types/menu';

interface FoodDetailScreenProps {
  item: MenuItem;
  onBack: () => void;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    instructions: string,
    selectedOptions?: SelectedOption[]
  ) => void;
  language?: 'ENGLISH' | 'ARABIC';
}

export const FoodDetailScreen: React.FC<FoodDetailScreenProps> = ({
  item,
  onBack,
  onAddToCart,
  language = 'ENGLISH',
}) => {
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<string, string[]>>({});

  const isArabic = language === 'ARABIC';

  // Initialize option group defaults whenever item changes
  useEffect(() => {
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
  }, [item]);

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
    onBack();
  };

  return (
    <div
      className={`min-h-[100dvh] bg-[#f4f4f5] antialiased select-none pb-28 relative ${
        isArabic ? 'font-sans rtl' : 'ltr'
      }`}
    >
      {/* Top Section: Full Width Soft Cream Background with Food Image & Floating Back Arrow */}
      <div className="relative w-full bg-[#f4f4f5] pt-4 pb-8 sm:pt-6 sm:pb-10 flex flex-col items-center justify-center min-h-[35vh]">
        {/* Floating Back Circle Button */}
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 absolute top-4 inset-x-0 z-20 flex justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to menu"
            className="w-10 h-10 rounded-full bg-white/80 hover:bg-white text-zinc-800 backdrop-blur-md shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-95"
          >
            {isArabic ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Big Centered Dish Image */}
        <div className="w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 flex items-center justify-center p-2">
          <img
            src={item.imageUrl}
            alt={title}
            className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/food/ramen.png';
            }}
          />
        </div>
      </div>

      {/* Main White Content Sheet with Rounded Top Corners */}
      <div className="w-full bg-white rounded-t-[2.25rem] sm:rounded-t-[2.75rem] shadow-xs pt-6 sm:pt-8 pb-32 min-h-[65vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-6 sm:space-y-7">
          {/* Title & Base Price Row */}
          <div>
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                {title}
              </h1>
              <span className="text-xl sm:text-2xl font-extrabold text-[#026F4F] shrink-0">
                {formatPrice(item.price, language)}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed mt-2 max-w-2xl">
              {description}
            </p>
          </div>

          {/* Dynamic Option Groups (Noodle Texture, Add Extras, etc.) */}
          {item.optionGroups &&
            item.optionGroups.map((group) => {
              const groupTitle = isArabic ? group.titleAr || group.title : group.title;
              const selectedIds = selectedOptionsMap[group.id] || [];

              return (
                <div key={group.id} className="pt-4 border-t border-zinc-100/80">
                  {/* Option Group Header & Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                      {groupTitle}
                    </h2>
                    <span
                      className={`text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full tracking-wide ${
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
                          className="flex items-center justify-between py-3 px-2 cursor-pointer hover:bg-zinc-50 rounded-2xl transition-colors select-none"
                        >
                          <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                            {optName}
                          </span>

                          <div className="flex items-center gap-3">
                            <span className="text-xs sm:text-sm font-semibold text-zinc-400">
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
          <div className="pt-4 border-t border-zinc-100/80">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight mb-2.5">
              {isArabic ? 'تعليمات خاصة' : 'Special instructions'}
            </h2>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={
                isArabic
                  ? 'أضف ملاحظة (مثال: بدون فلفل حار، ملح أقل)'
                  : 'Add note (e.g. no spicy, less salt)'
              }
              className="w-full bg-[#f4f4f5] border border-zinc-200/60 rounded-2xl p-4 text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#026F4F] focus:bg-white transition-all min-h-[95px] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Footer Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-zinc-100 p-3.5 sm:p-5 z-40">
        <div className="max-w-4xl mx-auto flex items-center gap-2.5 sm:gap-4">
          {/* Quantity Stepper Pill */}
          <div className="bg-[#f4f4f5] rounded-full p-1 sm:p-1.5 flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-full bg-[#509B82] disabled:opacity-50 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
            <span className="font-bold text-xs sm:text-base text-zinc-800 w-4 sm:w-5 text-center shrink-0">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-full bg-[#026F4F] text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Add to Cart Primary Button */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 bg-[#026F4F] hover:bg-[#025a40] text-white py-3 sm:py-3.5 px-3.5 sm:px-6 rounded-full font-bold text-xs sm:text-base flex items-center justify-between shadow-md active:scale-[0.98] transition-all cursor-pointer min-w-0"
          >
            <span className="whitespace-nowrap shrink-0">{isArabic ? 'إضافة إلى السلة' : 'Add to Cart'}</span>
            <span className="font-extrabold text-xs sm:text-lg whitespace-nowrap shrink-0 ml-1.5 rtl:ml-0 rtl:mr-1.5">
              {formatPrice(totalPrice, language)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
