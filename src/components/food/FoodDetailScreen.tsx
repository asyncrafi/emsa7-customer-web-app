import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Plus, Minus } from 'lucide-react';
import { type MenuItem, type SelectedOption, formatPrice } from '@/types/menu';
import { useLanguage } from '@/providers/LanguageContext';

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
  initialQuantity?: number;
  initialInstructions?: string;
  initialSelectedOptions?: SelectedOption[];
  isEditing?: boolean;
}

export const FoodDetailScreen: React.FC<FoodDetailScreenProps> = ({
  item,
  onBack,
  onAddToCart,
  language: propLanguage,
  initialQuantity,
  initialInstructions,
  initialSelectedOptions,
  isEditing = false,
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = propLanguage || contextLanguage;
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<string, string[]>>({});

  const isArabic = activeLanguage === 'ARABIC';

  // Initialize option group defaults whenever item changes
  useEffect(() => {
    setQuantity(initialQuantity && initialQuantity > 0 ? initialQuantity : 1);
    setInstructions(initialInstructions || '');

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

    if (initialSelectedOptions && initialSelectedOptions.length > 0) {
      initialSelectedOptions.forEach((so) => {
        const group = item.optionGroups?.find((g) => g.id === so.groupId);
        if (group?.type === 'single') {
          initialSelections[so.groupId] = [so.optionId];
        } else {
          if (!initialSelections[so.groupId]) {
            initialSelections[so.groupId] = [];
          }
          if (!initialSelections[so.groupId].includes(so.optionId)) {
            initialSelections[so.groupId].push(so.optionId);
          }
        }
      });
    }

    setSelectedOptionsMap(initialSelections);
  }, [item, initialQuantity, initialInstructions, initialSelectedOptions]);

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
      className={`fixed inset-0 z-[70] bg-white antialiased select-none flex flex-col h-full w-full overflow-hidden ${
        isArabic ? 'font-sans rtl' : 'ltr'
      }`}
    >
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 w-full">
        {/* Top Header Section with Dish Image & Floating Back Arrow */}
        <div className="relative w-full bg-white pt-5 pb-4 sm:pt-7 sm:pb-6 flex flex-col items-center justify-center shrink-0">
          {/* Floating Back Circle Button */}
          <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 absolute top-4 inset-x-0 z-20 flex justify-between items-center">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to menu"
              className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 shadow-sm flex items-center justify-center cursor-pointer transition-transform active:scale-95"
            >
              {isArabic ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Center Dish Image */}
          <div className="w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center p-2">
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

        {/* Main Content Body */}
        <div className="w-full bg-white pt-2 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-6 sm:space-y-7">
            {/* Title & Base Price Row */}
            <div>
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                  {title}
                </h1>
                <span className="text-xl sm:text-2xl font-extrabold text-[#026F4F] shrink-0">
                  {formatPrice(item.price, activeLanguage)}
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
                  <div key={group.id} className="pt-4 border-t border-zinc-100">
                    {/* Option Group Header & Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                        {groupTitle}
                      </h2>
                      <span
                        className={`text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full tracking-wide ${
                          group.required
                            ? 'bg-zinc-900 text-white'
                            : 'bg-zinc-100 text-zinc-600'
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
                                  : `+${formatPrice(opt.price, activeLanguage)}`}
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
            <div className="pt-4 border-t border-zinc-100">
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
                className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#026F4F] focus:bg-white transition-all min-h-[95px] resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Fixed Bottom Action Bar (Always visible at bottom) */}
      <div className="shrink-0 w-full bg-white border-t border-zinc-100 p-4 sm:p-5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-3 sm:gap-4">
          {/* Quantity Stepper Pill */}
          <div className="bg-zinc-100 rounded-full p-1.5 flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#509B82] disabled:opacity-50 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
            <span className="font-bold text-sm sm:text-base text-zinc-800 w-5 text-center shrink-0">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#026F4F] text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Add to Cart Primary Button */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 bg-[#026F4F] hover:bg-[#025a40] text-white py-3.5 sm:py-4 px-4 sm:px-6 rounded-full font-bold text-sm sm:text-base flex items-center justify-between shadow-md active:scale-[0.98] transition-all cursor-pointer min-w-0"
          >
            <span className="whitespace-nowrap shrink-0">
              {isEditing
                ? isArabic
                  ? 'تحديث الصنف'
                  : 'Update Item'
                : isArabic
                ? 'إضافة إلى السلة'
                : 'Add to Cart'}
            </span>
            <span className="font-extrabold text-sm sm:text-lg whitespace-nowrap shrink-0 ml-1.5 rtl:ml-0 rtl:mr-1.5">
              {formatPrice(totalPrice, activeLanguage)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
