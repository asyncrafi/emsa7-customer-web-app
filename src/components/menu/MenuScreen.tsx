import React, { useState, useMemo, useRef, useEffect } from 'react';
import SvgEmsa7Icon from '@/components/ui/svg-icons/EMSA7Svg';
import SvgCartIcon from '@/components/ui/svg-icons/CartSvg';
import SvgFilterIcon from '@/components/ui/svg-icons/FilterSvg';
import SvgBellsIcon from '@/components/ui/svg-icons/BellsSvg';
import { useLanguage } from '@/providers/LanguageContext';
import {
  Globe,
  ChevronDown,
  Check,
  Search,
  X,
} from 'lucide-react';
import {
  type MenuItem,
  type CartItem,
  type CategoryId,
  type SelectedOption,
  CATEGORIES,
  MOCK_MENU_ITEMS,
} from '@/types/menu';
import { FoodCardVertical } from '@/components/food/FoodCardVertical';
import { FoodCardHorizontal } from '@/components/food/FoodCardHorizontal';
import { FoodDetailScreen } from '@/components/food/FoodDetailScreen';
import { WaiterCallModal } from './WaiterCallModal';
import { MyOrderScreen } from '@/components/cart/MyOrderScreen';
import { FloatingCartBar } from '@/components/cart/FloatingCartBar';
import { SortFilterModal, type SortOption, type FilterTag } from './SortFilterModal';
import { useUrlModalState } from '@/hooks/useUrlModalState';

interface MenuScreenProps {
  tableName?: string;
  onBackToTableConfirmed?: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  tableName = 'A08',
  onBackToTableConfirmed,
}) => {
  // Global Language Management
  const { language, setLanguage } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('popular');
  const [searchQuery, setSearchQuery] = useState('');

  // ScrollSpy section refs
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const catPillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pillContainerRef = useRef<HTMLDivElement | null>(null);
  const isManualScrolling = useRef(false);

  // URL-based Modal state management
  const {
    isFilterOpen,
    isCartOpen,
    isFoodDetailOpen,
    isWaiterModalOpen,
    activeItemId,
    openFilterModal,
    openCartModal,
    openFoodDetailModal,
    openWaiterModal,
    closeModal,
  } = useUrlModalState();

  const selectedFoodItem = useMemo(
    () => MOCK_MENU_ITEMS.find((item) => item.id === activeItemId) || null,
    [activeItemId]
  );

  // Modals state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [openCheckoutDirectly, setOpenCheckoutDirectly] = useState(false);

  // Sort & Filter State
  const [selectedSort, setSelectedSort] = useState<SortOption>(null);
  const [selectedTags, setSelectedTags] = useState<FilterTag[]>([]);

  // Filter items per category for continuous scrolling
  const categorySectionsData = useMemo(() => {
    return CATEGORIES.map((cat) => {
      let items =
        cat.id === 'popular'
          ? MOCK_MENU_ITEMS.filter((item) => item.isPopular)
          : MOCK_MENU_ITEMS.filter((item) => item.category === cat.id);

      if (selectedTags.length > 0) {
        items = items.filter((item) =>
          selectedTags.some((tag) => item.tags?.includes(tag))
        );
      }

      if (selectedSort === 'popularity') {
        items = [...items].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
      } else if (selectedSort === 'price_low_high') {
        items = [...items].sort((a, b) => a.price - b.price);
      } else if (selectedSort === 'price_high_low') {
        items = [...items].sort((a, b) => b.price - a.price);
      }

      return {
        category: cat,
        items,
      };
    });
  }, [selectedTags, selectedSort]);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    let result = MOCK_MENU_ITEMS.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.nameAr && item.nameAr.toLowerCase().includes(query));

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => item.tags?.includes(tag));

      return matchesSearch && matchesTags;
    });

    if (selectedSort === 'popularity') {
      result = [...result].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    } else if (selectedSort === 'price_low_high') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price_high_low') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [searchQuery, selectedTags, selectedSort]);

  // ScrollSpy Listener: Auto update active category pill when scrolling
  useEffect(() => {
    if (searchQuery) return;

    const handleScroll = () => {
      if (isManualScrolling.current) return;

      const categoryIds = CATEGORIES.map((c) => c.id);
      let currentActive = categoryIds[0];

      for (const id of categoryIds) {
        const el = categoryRefs.current[id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 230) {
            currentActive = id as CategoryId;
          }
        }
      }

      setSelectedCategory(currentActive as CategoryId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchQuery]);

  // Scroll active category pill tab into view horizontally inside pill container
  useEffect(() => {
    const activePill = catPillRefs.current[selectedCategory];
    const container = pillContainerRef.current;
    if (activePill && container) {
      const pillLeft = activePill.offsetLeft;
      const pillWidth = activePill.offsetWidth;
      const containerWidth = container.offsetWidth;
      const targetScrollLeft = pillLeft - containerWidth / 2 + pillWidth / 2;
      container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    }
  }, [selectedCategory]);

  const scrollToCategory = (catId: CategoryId) => {
    setSelectedCategory(catId);
    isManualScrolling.current = true;

    const el = categoryRefs.current[catId];
    if (el) {
      const yOffset = -70; // Height of top bar offset
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset + yOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }

    setTimeout(() => {
      isManualScrolling.current = false;
    }, 800);
  };
  // Helper: check if two selected option arrays are identical
  const areSelectedOptionsEqual = (
    opts1?: SelectedOption[],
    opts2?: SelectedOption[]
  ): boolean => {
    const arr1 = opts1 || [];
    const arr2 = opts2 || [];
    if (arr1.length !== arr2.length) return false;

    const sorted1 = [...arr1].sort((a, b) =>
      `${a.groupId}:${a.optionId}`.localeCompare(`${b.groupId}:${b.optionId}`)
    );
    const sorted2 = [...arr2].sort((a, b) =>
      `${a.groupId}:${a.optionId}`.localeCompare(`${b.groupId}:${b.optionId}`)
    );

    return sorted1.every(
      (opt, idx) =>
        opt.groupId === sorted2[idx].groupId && opt.optionId === sorted2[idx].optionId
    );
  };

  // Helper: check if cart item is identical in item ID, selected options, and special instructions
  const isSameCartItemVariant = (
    ci: CartItem,
    item: MenuItem,
    specialInstructions?: string,
    selectedOptions?: SelectedOption[]
  ): boolean => {
    if (ci.item.id !== item.id) return false;
    const inst1 = (ci.specialInstructions || '').trim();
    const inst2 = (specialInstructions || '').trim();
    if (inst1 !== inst2) return false;
    return areSelectedOptionsEqual(ci.selectedOptions, selectedOptions);
  };

  // Cart operations
  const handleAddToCart = (
    item: MenuItem,
    qty = 1,
    specialInstructions?: string,
    selectedOptions?: SelectedOption[]
  ) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((ci) =>
        isSameCartItemVariant(ci, item, specialInstructions, selectedOptions)
      );
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
        };
        return updated;
      }
      return [...prevCart, { item, quantity: qty, specialInstructions, selectedOptions }];
    });
  };

  const handleCardAdd = (food: MenuItem) => {
    const hasOptions = Boolean(food.optionGroups && food.optionGroups.length > 0);
    if (hasOptions) {
      openFoodDetailModal(food.id);
    } else {
      handleAddToCart(food, 1);
    }
  };

  const handleIncrement = (item: MenuItem) => {
    handleCardAdd(item);
  };

  const handleCartItemIncrement = (target: string | number) => {
    setCart((prevCart) => {
      if (typeof target === 'number') {
        if (!prevCart[target]) return prevCart;
        const updated = [...prevCart];
        updated[target] = { ...updated[target], quantity: updated[target].quantity + 1 };
        return updated;
      }
      const existingIndex = prevCart.findIndex((ci) => ci.item.id === target);
      if (existingIndex === -1) return prevCart;
      const updated = [...prevCart];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + 1,
      };
      return updated;
    });
  };

  const handleDecrement = (target: string | number | MenuItem) => {
    setCart((prevCart) => {
      if (typeof target === 'number') {
        if (!prevCart[target]) return prevCart;
        if (prevCart[target].quantity === 1) {
          return prevCart.filter((_, idx) => idx !== target);
        }
        const updated = [...prevCart];
        updated[target] = { ...updated[target], quantity: updated[target].quantity - 1 };
        return updated;
      }
      const id = typeof target === 'string' ? target : target.id;
      const existingIndex = prevCart.findIndex((ci) => ci.item.id === id);
      if (existingIndex === -1) return prevCart;
      if (prevCart[existingIndex].quantity === 1) {
        return prevCart.filter((_, idx) => idx !== existingIndex);
      }
      const updated = [...prevCart];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity - 1,
      };
      return updated;
    });
  };

  const handleRemoveFromCart = (target: string | number) => {
    setCart((prevCart) => {
      if (typeof target === 'number') {
        return prevCart.filter((_, idx) => idx !== target);
      }
      return prevCart.filter((ci) => ci.item.id !== target);
    });
  };

  const handleUpdateCartItem = (
    index: number,
    qty: number,
    specialInstructions?: string,
    selectedOptions?: SelectedOption[]
  ) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          quantity: qty,
          specialInstructions,
          selectedOptions,
        };
      }
      return updated;
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getItemQuantity = (itemId: string): number => {
    return cart
      .filter((ci) => ci.item.id === itemId)
      .reduce((sum, ci) => sum + ci.quantity, 0);
  };

  // Dedicated Full Page View for Food Details
  if (isFoodDetailOpen && selectedFoodItem) {
    return (
      <FoodDetailScreen
        item={selectedFoodItem}
        onBack={closeModal}
        onAddToCart={(item, qty, instructions, options) => {
          handleAddToCart(item, qty, instructions, options);
        }}
        language={language}
      />
    );
  }

  return (
    <div
      className={`min-h-[100dvh] bg-[#e8f5ee] antialiased select-none relative flex flex-col ${
        language === 'ARABIC' ? 'font-sans rtl' : 'ltr'
      }`}
    >
      {/* Top Header Soft Green Section Container */}
      <div className="w-full bg-[#e8f5ee] pt-5 pb-5 sm:pt-7 sm:pb-6 shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-4 sm:space-y-5">
          {/* Top Header Row */}
          <header className="flex items-center justify-between gap-3">
            {/* Brand Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-95 transition-opacity"
              onClick={onBackToTableConfirmed}
            >
              <SvgEmsa7Icon className="h-6 sm:h-7 md:h-8" />
            </div>

            {/* Right Header Buttons: Language Dropdown & My Order Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Switcher Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-emerald-200/60 bg-white text-[#026F4F] text-xs sm:text-sm font-bold shadow-2xs hover:bg-emerald-50/50 transition-colors cursor-pointer"
                >
                  <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#026F4F]" />
                  <span>{language === 'ARABIC' ? 'AR' : 'EN'}</span>
                  <ChevronDown className="h-3 w-3 text-[#026F4F]" />
                </button>

                {/* Language Options Dropdown */}
                {langDropdownOpen && (
                  <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1.5 w-36 bg-white border border-emerald-200/50 rounded-2xl shadow-xl py-1.5 z-40 text-xs overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('ENGLISH');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-start px-3.5 py-2 transition-colors font-medium flex items-center justify-between cursor-pointer ${
                        language === 'ENGLISH'
                          ? 'bg-emerald-50 text-[#026F4F] font-bold'
                          : 'text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <span>English</span>
                      {language === 'ENGLISH' && <Check className="h-3.5 w-3.5 text-[#026F4F]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('ARABIC');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-start px-3.5 py-2 transition-colors font-medium flex items-center justify-between cursor-pointer ${
                        language === 'ARABIC'
                          ? 'bg-emerald-50 text-[#026F4F] font-bold'
                          : 'text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <span>العربية</span>
                      {language === 'ARABIC' && <Check className="h-3.5 w-3.5 text-[#026F4F]" />}
                    </button>
                  </div>
                )}
              </div>

              {/* My Order Button with SvgCartIcon */}
              <button
                type="button"
                onClick={() => {
                  setOpenCheckoutDirectly(false);
                  openCartModal();
                }}
                className="relative inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4.5 sm:py-2 rounded-full text-white text-xs sm:text-sm font-bold shadow-md bg-[#026F4F] hover:bg-[#025a40] active:scale-95 transition-all cursor-pointer"
              >
                <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <SvgCartIcon className="w-4 h-4 fill-current" />
                </div>
                <span>{language === 'ARABIC' ? 'طلباتي' : 'My Order'}</span>

                {totalCartCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-[#026F4F] font-extrabold text-[11px] flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </div>
          </header>

          {/* Table Seating Greeting & Large Number */}
          <section className="pt-2">
            <p className="text-xs sm:text-sm text-zinc-500 font-medium tracking-normal">
              {language === 'ARABIC' ? 'أنت جالس في الطاولة' : "You're seated at table"}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#026F4F] mt-1 mb-2">
              {tableName}
            </h1>
          </section>

          {/* Integrated Search & Filter Controls Pill Bar */}
          <section>
            <div className="relative w-full bg-white rounded-full border border-emerald-100/80 shadow-xs flex items-center p-1 ps-4 pe-1.5">
              <Search className="h-4 w-4 text-zinc-400 shrink-0 me-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'ARABIC'
                    ? 'ابحث عن رامن، غيوزا، مشروبات...'
                    : 'Search ramen, gyoza, drinks...'
                }
                className="w-full text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 font-medium bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer me-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Filter SVG Icon Button embedded inside Search Pill */}
              <button
                type="button"
                onClick={openFilterModal}
                aria-label="Filter menu"
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#e2e8f0]/60 hover:bg-[#d8e0e8] text-zinc-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <SvgFilterIcon className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600" />
                {(selectedSort || selectedTags.length > 0) && (
                  <span className="absolute top-1 right-1 rtl:right-auto rtl:left-1 w-2.5 h-2.5 bg-[#026F4F] rounded-full border border-white" />
                )}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Main White Content Sheet Container with ROUNDED TOP CORNERS matching Figma */}
      <div className={`w-full bg-white rounded-t-[2.25rem] sm:rounded-t-[2.75rem] shadow-xs pt-5 sm:pt-6 flex-1 transition-all ${totalCartCount > 0 ? 'pb-20 sm:pb-24' : 'pb-4 sm:pb-6'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-5 sm:space-y-6">
        {/* Category Pills Slider / Filter (Sticky for smooth navigation) */}
        <section
          ref={pillContainerRef}
          className="sticky top-0 z-30 bg-white/95 backdrop-blur-md py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 border-b border-zinc-100/80 overflow-x-auto no-scrollbar"
        >
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-max">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const catName = language === 'ARABIC' ? cat.nameAr : cat.name;

              let catImage = '';
              if (cat.id === 'ramen') catImage = '/images/food/ramen.png';
              else if (cat.id === 'sides') catImage = '/images/food/gyoza.png';
              else if (cat.id === 'drinks') catImage = '/images/food/iced-tea.png';

              return (
                <button
                  key={cat.id}
                  type="button"
                  ref={(el) => {
                    catPillRefs.current[cat.id] = el;
                  }}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer shadow-2xs shrink-0 ${
                    isActive
                      ? 'bg-[#026F4F] text-white shadow-sm scale-[1.02]'
                      : 'bg-[#f3f4f6] hover:bg-zinc-200/80 text-zinc-700'
                  }`}
                >
                  {catImage ? (
                    <img
                      src={catImage}
                      alt={catName}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <span className="text-sm leading-none">{cat.emoji}</span>
                  )}
                  <span>{catName}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Content View: Search Mode OR Continuous Sequential Category Sections */}
        {searchQuery ? (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                {language === 'ARABIC' ? 'نتائج البحث' : 'Search Results'}
              </h2>
              <span className="text-xs font-semibold text-zinc-400">
                {searchResults.length} {language === 'ARABIC' ? 'صنف' : 'items'}
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 bg-white rounded-2xl border border-zinc-100 p-6">
                <p className="font-bold text-sm text-zinc-700">
                  {language === 'ARABIC'
                    ? 'لم يتم العثور على أطباق مطابقة'
                    : 'No food items found'}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {language === 'ARABIC'
                    ? 'جرب البحث عن كلمة أخرى.'
                    : 'Try searching with another keyword.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {searchResults.map((item) => (
                  <FoodCardHorizontal
                    key={item.id}
                    item={item}
                    quantity={getItemQuantity(item.id)}
                    language={language}
                    onAdd={handleCardAdd}
                    onIncrement={(food) => handleCartItemIncrement(food.id)}
                    onDecrement={(food) => handleDecrement(food.id)}
                    onClick={(food) => {
                      openFoodDetailModal(food.id);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="space-y-8 pt-2">
            {categorySectionsData.map(({ category, items }) => {
              if (items.length === 0) return null;

              if (category.id === 'popular') {
                return (
                  <section
                    key={category.id}
                    ref={(el) => {
                      categoryRefs.current[category.id] = el;
                    }}
                    className="space-y-3 pt-2 scroll-mt-36"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔥</span>
                        <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                          {language === 'ARABIC' ? 'الأكثر شعبية' : 'Popular Now'}
                        </h2>
                      </div>
                      <span className="text-xs font-semibold text-zinc-400">
                        {items.length} {language === 'ARABIC' ? 'صنف' : 'items'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {items.map((item) => (
                        <FoodCardVertical
                          key={item.id}
                          item={item}
                          quantity={getItemQuantity(item.id)}
                          language={language}
                          onAdd={handleCardAdd}
                          onIncrement={(food) => handleCartItemIncrement(food.id)}
                          onDecrement={(food) => handleDecrement(food.id)}
                          onClick={(food) => {
                            openFoodDetailModal(food.id);
                          }}
                        />
                      ))}
                    </div>
                  </section>
                );
              }

              return (
                <section
                  key={category.id}
                  ref={(el) => {
                    categoryRefs.current[category.id] = el;
                  }}
                  className="space-y-3 pt-4 border-t border-zinc-100/80 scroll-mt-36"
                >
                  <div className="flex items-center justify-between pb-1">
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                      <span className="text-lg">{category.emoji}</span>
                      <span>{language === 'ARABIC' ? category.nameAr : category.name}</span>
                    </h2>
                    <span className="text-xs font-semibold text-zinc-400">
                      {items.length} {language === 'ARABIC' ? 'صنف' : 'items'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {items.map((item) => (
                      <FoodCardHorizontal
                        key={item.id}
                        item={item}
                        quantity={getItemQuantity(item.id)}
                        language={language}
                        onAdd={handleCardAdd}
                        onIncrement={(food) => handleCartItemIncrement(food.id)}
                        onDecrement={(food) => handleDecrement(food.id)}
                        onClick={(food) => {
                          openFoodDetailModal(food.id);
                        }}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Footer Branding Line: POWERED BY EMSA7 */}
        <div className="pt-4 pb-2 text-center select-none flex justify-center items-center">
          <a
            href="https://emsa7.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-[11px] sm:text-xs md:text-sm font-bold tracking-wider uppercase text-[#989898] inline-flex items-center">
              POWERED BY
            </span>
            <div className="inline-flex items-center justify-center my-auto shrink-0">
              <SvgEmsa7Icon className="h-4.5 sm:h-5 md:h-6 w-auto" />
            </div>
          </a>
        </div>
      </div>
    </div>

      {/* Floating Waiter Call Button (Adjusts position when Floating Cart Bar is present) */}
      <div
        className={`fixed end-5 sm:end-8 z-40 flex items-center gap-2.5 transition-all duration-300 ${
          totalCartCount > 0 ? 'bottom-20 sm:bottom-22' : 'bottom-6'
        }`}
      >
        {/* Floating Tooltip Label: Call a Waiter */}
        <div className="hidden sm:flex items-center px-3.5 py-1.5 rounded-full bg-zinc-900/90 backdrop-blur-xs text-white text-xs font-bold shadow-xl border border-white/10">
          <span>{language === 'ARABIC' ? 'طلب النادل' : 'Call a Waiter'}</span>
        </div>

        {/* Bell Button (Amber Accent Color Button matching design mockup - Optimized mobile size) */}
        <button
          type="button"
          onClick={openWaiterModal}
          aria-label="Call Waiter"
          className="relative group w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#f3a832] hover:bg-[#e29924] active:scale-95 text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer"
        >
          {/* Pulse Ripple Effect */}
          <span className="absolute inset-0 rounded-full bg-[#f3a832]/40 animate-ping opacity-75 pointer-events-none" />

          {/* Bell Icon */}
          <div className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
            <SvgBellsIcon className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-white" />
          </div>
        </button>
      </div>



      {/* My Order Screen (Figma Design matching 3 tabs & client feedback) */}
      <MyOrderScreen
        isOpen={isCartOpen}
        onClose={() => {
          setOpenCheckoutDirectly(false);
          closeModal();
        }}
        initialShowCheckout={openCheckoutDirectly}
        initialTab="cart"
        cart={cart}
        onIncrement={handleCartItemIncrement}
        onDecrement={handleDecrement}
        onRemove={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onAddToCart={(item) => handleIncrement(item)}
        onUpdateCartItem={handleUpdateCartItem}
        onReorder={(itemsToReorder) => {
          setCart((prevCart) => {
            const updated = [...prevCart];
            itemsToReorder.forEach((rItem) => {
              const idx = updated.findIndex((c) => c.item.id === rItem.item.id);
              if (idx > -1) {
                updated[idx].quantity += rItem.quantity;
              } else {
                updated.push({ ...rItem });
              }
            });
            return updated;
          });
        }}
        onCallWaiter={openWaiterModal}
        language={language}
        tableName={`Table ${tableName}`}
      />

      {/* Sort & Filter Modal Bottom Sheet */}
      <SortFilterModal
        isOpen={isFilterOpen}
        onClose={closeModal}
        language={language}
        selectedSort={selectedSort}
        selectedTags={selectedTags}
        onApply={(sort, tags) => {
          setSelectedSort(sort);
          setSelectedTags(tags);
        }}
        onClear={() => {
          setSelectedSort(null);
          setSelectedTags([]);
        }}
      />

      {/* Waiter Call Interactive Flow Modal */}
      <WaiterCallModal
        isOpen={isWaiterModalOpen}
        onClose={closeModal}
        onSuccess={() => {}}
        language={language}
        tableName={`Table ${tableName}`}
      />

      {/* Floating Cart Bar (Appears at bottom when cart has items) */}
      <FloatingCartBar
        cart={cart}
        onOpenCart={() => {
          setOpenCheckoutDirectly(true);
          openCartModal();
        }}
        language={language}
      />
    </div>
  );
};
