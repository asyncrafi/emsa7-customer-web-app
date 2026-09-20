import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export type SortOption = 'popularity' | 'price_low_high' | 'price_high_low' | null;
export type FilterTag = 'bestseller' | 'seafood' | 'sweet' | 'chefs_pick' | 'sharing';

export interface SortFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'ENGLISH' | 'ARABIC';
  selectedSort: SortOption;
  selectedTags: FilterTag[];
  onApply: (sort: SortOption, tags: FilterTag[]) => void;
  onClear: () => void;
}

export const SortFilterModal: React.FC<SortFilterModalProps> = ({
  isOpen,
  onClose,
  language = 'ENGLISH',
  selectedSort,
  selectedTags,
  onApply,
  onClear,
}) => {
  // Lock body scroll when modal is open
  useBodyScrollLock(isOpen);

  const [tempSort, setTempSort] = useState<SortOption>(selectedSort);
  const [tempTags, setTempTags] = useState<FilterTag[]>(selectedTags);

  // Sync internal state whenever modal opens or props change
  useEffect(() => {
    setTempSort(selectedSort);
    setTempTags(selectedTags);
  }, [isOpen, selectedSort, selectedTags]);

  if (!isOpen) return null;

  const isArabic = language === 'ARABIC';

  const SORT_OPTIONS: { id: SortOption; labelEn: string; labelAr: string }[] = [
    { id: 'popularity', labelEn: 'Popularity', labelAr: 'الأكثر شعبية' },
    { id: 'price_low_high', labelEn: 'Price: Low → High', labelAr: 'السعر: من الأقل للأعلى' },
    { id: 'price_high_low', labelEn: 'Price: High → Low', labelAr: 'السعر: من الأعلى للأقل' },
  ];

  const FILTER_TAGS: { id: FilterTag; labelEn: string; labelAr: string }[] = [
    { id: 'bestseller', labelEn: 'Bestseller', labelAr: 'الأكثر مبيعاً' },
    { id: 'seafood', labelEn: 'Seafood', labelAr: 'مأكولات بحرية' },
    { id: 'sweet', labelEn: 'Sweet', labelAr: 'حلويات' },
    { id: 'chefs_pick', labelEn: "Chef's pick", labelAr: 'اختيار الشيف' },
    { id: 'sharing', labelEn: 'Sharing', labelAr: 'مشاركة' },
  ];

  const toggleTag = (tag: FilterTag) => {
    setTempTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 select-none p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl p-5 sm:p-6 animate-in slide-in-from-bottom duration-300 relative overflow-y-auto max-h-[85vh] ${
          isArabic ? 'font-sans rtl' : 'ltr'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Center Drag Handle Pill */}
        <div className="w-12 h-1 bg-zinc-300 rounded-full mx-auto mb-4" />

        {/* Header Title */}
        <div className="relative mb-3 text-center">
          <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">
            {isArabic ? 'الفرز والتصفية' : 'Sort & Filter'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-0 top-0 text-zinc-400 hover:text-zinc-600 p-1 rounded-full cursor-pointer transition-colors rtl:right-auto rtl:left-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtle Horizontal Divider */}
        <div className="border-b border-zinc-100 my-3" />

        {/* Section 1: Sort By */}
        <div className="space-y-1 my-4">
          <p className="text-xs font-semibold text-zinc-400 mb-2 tracking-wide">
            {isArabic ? 'ترتيب حسب' : 'Sort By'}
          </p>

          <div className="space-y-1">
            {SORT_OPTIONS.map((option) => {
              const isSelected = tempSort === option.id;
              return (
                <div
                  key={option.id as string}
                  onClick={() => setTempSort(isSelected ? null : option.id)}
                  className="flex items-center justify-between py-2.5 px-1 cursor-pointer hover:bg-zinc-50/70 rounded-xl transition-colors"
                >
                  <span className="text-sm font-semibold text-zinc-800">
                    {isArabic ? option.labelAr : option.labelEn}
                  </span>

                  {/* Radio Circle Icon */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                      isSelected ? 'border-[#026F4F]' : 'border-zinc-300'
                    }`}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#026F4F]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Filter */}
        <div className="my-5">
          <p className="text-xs font-semibold text-zinc-400 mb-3 tracking-wide">
            {isArabic ? 'تصفية' : 'Filter'}
          </p>

          <div className="flex flex-wrap gap-2.5">
            {FILTER_TAGS.map((tag) => {
              const isSelected = tempTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-[#026F4F] text-white shadow-sm scale-[1.02]'
                      : 'bg-[#f3f4f6] text-zinc-600 hover:bg-zinc-200/80'
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
            className="flex-1 py-3.5 px-4 rounded-full bg-[#eef0f2] hover:bg-zinc-200/90 text-zinc-800 font-bold text-sm tracking-wide transition-colors cursor-pointer text-center"
          >
            {isArabic ? 'إعادة ضبط' : 'Clear Filters'}
          </button>

          {/* Apply Filters Button */}
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3.5 px-4 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-bold text-sm tracking-wide shadow-md transition-all active:scale-[0.98] cursor-pointer text-center"
          >
            {isArabic ? 'تطبيق التصفية' : 'Apply Filters'}
          </button>
        </div>
      </div>
    </div>
  );
};
