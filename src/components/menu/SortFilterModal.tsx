import React, { useState, useEffect } from 'react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useLanguage } from '@/providers/LanguageContext';

export type SortOption = 'popularity' | 'price_low_high' | 'price_high_low' | null;

export interface FilterTag {
  id: string;
  labelEn: string;
  labelAr: string;
}

export const FILTER_TAGS: FilterTag[] = [
  { id: 'bestseller', labelEn: 'Bestseller', labelAr: 'الأكثر مبيعاً' },
  { id: 'seafood', labelEn: 'Seafood', labelAr: 'مأكولات بحرية' },
  { id: 'sweet', labelEn: 'Sweet', labelAr: 'حلويات' },
  { id: 'chefs_pick', labelEn: "Chef's pick", labelAr: 'اختيار الشيف' },
  { id: 'sharing', labelEn: 'Sharing', labelAr: 'للمشاركة' },
];

export interface SortFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'ENGLISH' | 'ARABIC';
  selectedSort: SortOption;
  selectedTags?: string[];
  onApply: (sort: SortOption, tags: string[]) => void;
  onClear: () => void;
}

export const SortFilterModal: React.FC<SortFilterModalProps> = ({
  isOpen,
  onClose,
  language: propLanguage,
  selectedSort,
  selectedTags = [],
  onApply,
  onClear,
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = propLanguage || contextLanguage;

  // Lock body scroll when modal is open
  useBodyScrollLock(isOpen);

  const [tempSort, setTempSort] = useState<SortOption>(selectedSort);
  const [tempTags, setTempTags] = useState<string[]>(selectedTags);

  // Sync internal state whenever modal opens or props change
  useEffect(() => {
    setTempSort(selectedSort);
    setTempTags(selectedTags || []);
  }, [isOpen, selectedSort, selectedTags]);

  if (!isOpen) return null;

  const isArabic = activeLanguage === 'ARABIC';

  const SORT_OPTIONS: { id: SortOption; labelEn: string; labelAr: string }[] = [
    { id: 'popularity', labelEn: 'Popularity', labelAr: 'الأكثر شعبية' },
    { id: 'price_low_high', labelEn: 'Price: Low → High', labelAr: 'السعر: من الأقل للأعلى' },
    { id: 'price_high_low', labelEn: 'Price: High → Low', labelAr: 'السعر: من الأعلى للأقل' },
  ];

  const toggleTag = (tagId: string) => {
    setTempTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleClear = () => {
    setTempSort(null);
    setTempTags([]);
    onClear();
    onClose();
  };

  const handleApply = () => {
    onApply(tempSort, tempTags);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 select-none p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="w-full max-w-[440px] bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl p-5 sm:p-6 animate-in slide-in-from-bottom duration-300 relative overflow-y-auto max-h-[88vh] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Center Drag Handle Pill */}
        <div className="w-12 h-1 bg-zinc-300/80 rounded-full mx-auto mb-4" />

        {/* Header Title (Clean medium/semibold matching Figma) */}
        <div className="relative mb-3 text-center">
          <h2 className="text-[18px] sm:text-[19px] font-semibold text-[#1C1C1E] tracking-normal">
            {isArabic ? 'الفرز والتصفية' : 'Sort & Filter'}
          </h2>
        </div>

        {/* Subtle Horizontal Divider */}
        <div className="border-b border-zinc-100 my-3" />

        {/* Section 1: Sort By */}
        <div className="space-y-1 my-3">
          <p className="text-[12px] font-medium text-[#8E8E93] mb-2 tracking-normal">
            {isArabic ? 'ترتيب حسب' : 'Sort By'}
          </p>

          <div className="space-y-0.5">
            {SORT_OPTIONS.map((option) => {
              const isSelected = tempSort === option.id;
              return (
                <div
                  key={option.id as string}
                  onClick={() => setTempSort(isSelected ? null : option.id)}
                  className="flex items-center justify-between py-2 px-1 cursor-pointer hover:bg-zinc-50/70 rounded-xl transition-colors"
                >
                  <span className="text-[15px] font-medium text-[#2D2F33]">
                    {isArabic ? option.labelAr : option.labelEn}
                  </span>

                  {/* Radio Circle Icon */}
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                      isSelected ? 'border-2 border-[#026F4F]' : 'border-zinc-300'
                    }`}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#026F4F]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Filter Tags (Bestseller, Seafood, Sweet, Chef's pick, Sharing) */}
        <div className="mt-4 pt-1">
          <p className="text-[12px] font-medium text-[#8E8E93] mb-2.5 tracking-normal">
            {isArabic ? 'تصفية' : 'Filter'}
          </p>

          <div className="flex flex-wrap gap-2">
            {FILTER_TAGS.map((tag) => {
              const isSelected = tempTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#026F4F] text-white shadow-2xs'
                      : 'bg-[#F4F5F7] text-[#8E8E93] hover:bg-zinc-200/70'
                  }`}
                >
                  {isArabic ? tag.labelAr : tag.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-3 mt-7 pt-2">
          {/* Clear Filters Button */}
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 py-3 px-4 rounded-full bg-[#EEF0F2] hover:bg-zinc-200/80 text-[#2D2F33] font-medium text-[14px] transition-colors cursor-pointer text-center"
          >
            {isArabic ? 'إعادة ضبط' : 'Clear Filters'}
          </button>

          {/* Apply Filters Button */}
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 px-4 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-medium text-[14px] transition-all active:scale-[0.99] cursor-pointer text-center shadow-xs"
          >
            {isArabic ? 'تطبيق التصفية' : 'Apply Filters'}
          </button>
        </div>
      </div>
    </div>
  );
};
