import React, { useState, useMemo, useRef } from 'react';
import SvgBellsIcon from '@/components/ui/svg-icons/BellsSvg';
import emsa7Logo from '@/assets/logo.png';
import { useLanguage } from '@/providers/LanguageContext';
import {
  Check,
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
import { SortFilterModal, type SortOption } from './SortFilterModal';
import { useUrlModalState } from '@/hooks/useUrlModalState';
import { useWaiterTooltip } from '@/hooks/useWaiterTooltip';
import { useWaiterCooldown } from '@/hooks/useWaiterCooldown';
import { PoweredByFooter } from '@/components/common/PoweredByFooter';

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
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('q') || p.get('search') || '';
    }
    return '';
  });

  // Scroll/pill refs
  const catPillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pillContainerRef = useRef<HTMLDivElement | null>(null);

  // URL-based Modal state management
  const {
    isFilterOpen,
    isCartOpen,
    isOngoingOpen,
    isCheckoutOpen,
    isFoodDetailOpen,
    isWaiterModalOpen,
    activeItemId,
    openFilterModal,
    openCartModal,
    openOngoingModal: _openOngoingModal,
    openCheckoutModal: _openCheckoutModal,
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
  const waiterTooltip = useWaiterTooltip();
  const { isCooldown, formattedTime } = useWaiterCooldown();

  // Sort & Filter State
  const [selectedSort, setSelectedSort] = useState<SortOption>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Sorting helper
  const sortItems = (items: MenuItem[]) => {
    if (selectedSort === 'price_low_high') {
      return [...items].sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price_high_low') {
      return [...items].sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'popularity') {
      return [...items].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    }
    return items;
  };

  // Tag filter helper
  const filterByTags = (items: MenuItem[]) => {
    if (selectedTags.length === 0) return items;
    return items.filter((item) =>
      selectedTags.some((tag) => item.tags?.includes(tag))
    );
  };

  // Popular items (top 2 popular items matching Figma mockup: Shoyu Ramen & Iced Green Tea)
  const popularItems = useMemo(() => {
    let items = MOCK_MENU_ITEMS.filter((item) => item.isPopular);
    items = filterByTags(items);
    return sortItems(items).slice(0, 2);
  }, [selectedTags, selectedSort]);

  // All items sorted & filtered
  const allItems = useMemo(() => {
    let items = [...MOCK_MENU_ITEMS];
    items = filterByTags(items);
    return sortItems(items);
  }, [selectedTags, selectedSort]);

  // Items for selected category
  const categoryFilteredItems = useMemo(() => {
    let items = selectedCategory === 'all'
      ? MOCK_MENU_ITEMS
      : MOCK_MENU_ITEMS.filter((item) => item.category === selectedCategory);
    items = filterByTags(items);
    return sortItems(items);
  }, [selectedCategory, selectedTags, selectedSort]);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    let result = MOCK_MENU_ITEMS.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.nameAr && item.nameAr.toLowerCase().includes(query))
      );
    });
    result = filterByTags(result);
    return sortItems(result);
  }, [searchQuery, selectedTags, selectedSort]);

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
    if (food.optionGroups && food.optionGroups.length > 0) {
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

  const handleDeductPaidItems = (paidItems: CartItem[]) => {
    setCart((prevCart) => {
      let updatedCart = [...prevCart];
      paidItems.forEach((paid) => {
        const matchIndex = updatedCart.findIndex((ci) =>
          isSameCartItemVariant(ci, paid.item, paid.specialInstructions, paid.selectedOptions)
        );
        if (matchIndex > -1) {
          const remainingQty = updatedCart[matchIndex].quantity - paid.quantity;
          if (remainingQty <= 0) {
            updatedCart = updatedCart.filter((_, idx) => idx !== matchIndex);
          } else {
            updatedCart[matchIndex] = {
              ...updatedCart[matchIndex],
              quantity: remainingQty,
            };
          }
        }
      });
      return updatedCart;
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
      dir={language === 'ARABIC' ? 'rtl' : 'ltr'}
      className="min-h-[100dvh] bg-[#E6F1ED] antialiased select-none relative flex flex-col font-sans"
    >
      {/* Top Header Soft Mint Section Container */}
      <div className="w-full bg-[#E6F1ED] pt-3 pb-5 sm:pt-4 sm:pb-5 shrink-0">
        <div className="max-w-md mx-auto w-full px-5 space-y-3.5">
          {/* Top Header Row: Logo on Left, Language & Order Pills on Right */}
          <header className="flex items-center justify-between gap-3 pt-1">
            {/* Brand Logo matching Figma Menu.png */}
            <div
              className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
              onClick={onBackToTableConfirmed}
            >
              <img
                src={emsa7Logo}
                alt="EMSA7"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </div>

            {/* Right Header Buttons: Language Pill & My Order Pill */}
            <div className="flex items-center gap-2">
              {/* Language Switcher Pill [ 🌐 EN ] matching Figma */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 h-8.5 rounded-full border border-zinc-200/90 bg-white text-[#026F4F] text-xs font-medium shadow-2xs hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <img src="/icons/lsicon_earth-outline.svg" alt="" className="h-4 w-4" />
                  <span>{language === 'ARABIC' ? 'AR' : 'EN'}</span>
                </button>

                {/* Backdrop for closing dropdown */}
                {langDropdownOpen && (
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setLangDropdownOpen(false)}
                  />
                )}

                {/* Language Options Dropdown */}
                {langDropdownOpen && (
                  <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-32 bg-white border border-zinc-200/80 rounded-2xl shadow-xl py-1.5 z-30 text-xs overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('ENGLISH');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-start px-3.5 py-2 transition-colors font-medium flex items-center justify-between cursor-pointer ${
                        language === 'ENGLISH'
                          ? 'bg-[#026F4F]/10 text-[#026F4F] font-semibold'
                          : 'text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <span>English</span>
                      {language === 'ENGLISH' && (
                        <Check className="h-3.5 w-3.5 text-[#026F4F]" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('ARABIC');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-start px-3.5 py-2 transition-colors font-medium flex items-center justify-between cursor-pointer ${
                        language === 'ARABIC'
                          ? 'bg-[#026F4F]/10 text-[#026F4F] font-semibold'
                          : 'text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <span>العربية</span>
                      {language === 'ARABIC' && (
                        <Check className="h-3.5 w-3.5 text-[#026F4F]" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* My Order Button with shopping bag / container icon matching Figma */}
              <button
                type="button"
                onClick={() => {
                  setOpenCheckoutDirectly(false);
                  openCartModal();
                }}
                className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 h-8.5 rounded-full text-white text-xs font-medium shadow-2xs bg-[#026F4F] hover:bg-[#025a40] active:scale-95 transition-all cursor-pointer"
              >
                <img src="/icons/solar_cart-outline.svg" alt="" className="w-3.5 h-3.5 brightness-0 invert" />
                <span>{language === 'ARABIC' ? 'طلباتي' : 'My Order'}</span>

                {totalCartCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-[#026F4F] font-semibold text-[10px] flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </div>
          </header>

          {/* Table Seating Greeting & Large Number matching Figma Frame 22 (155x116) */}
          <section className="pt-1">
            <p className="text-[15px] text-[#686868] font-normal leading-[140%] tracking-normal">
              {language === 'ARABIC' ? 'أنت جالس في الطاولة' : "You're seated at table"}
            </p>
            <h1 className="text-[60px] font-semibold tracking-tight text-[#026F4F] leading-[140%] mt-0.5 mb-2">
              {tableName.replace(/^Table\s*/i, '').replace(/^([A-Za-z])(\d)$/, '$10$2')}
            </h1>
          </section>

          {/* Integrated Search & Filter Controls Pill Bar matching Figma Frame 1171277067 (408x52, radius 27px, border #B1D2C8) */}
          <section>
            <div className="relative w-full h-[52px] bg-white rounded-[27px] border border-[#B1D2C8] flex items-center p-1 ps-4 pe-1.5">
              <img src="/icons/mdi_magnify.svg" alt="" className="h-5 w-5 shrink-0 opacity-60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'ARABIC'
                    ? 'ابحث عن رامن، غيوزا، مشروبات...'
                    : 'Search ramen, gyoza, drinks...'
                }
                className="w-full text-[16px] text-[#2D2F33] placeholder-[#989898] font-normal bg-transparent focus:outline-none px-2 leading-[140%]"
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

              {/* Filter Icon Button (Ellipse 688: 43x43 bg #e9e9e9 matching Figma) */}
              <button
                type="button"
                onClick={openFilterModal}
                aria-label="Filter menu"
                className="relative w-[43px] h-[43px] rounded-full bg-[#E9E9E9] hover:bg-[#dfe1e5] text-[#555C68] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <img src="/icons/mage_filter.svg" alt="" className="w-5 h-5" />
                {(selectedSort || selectedTags.length > 0) && (
                  <span className="absolute top-1 right-1 rtl:right-auto rtl:left-1 w-2 h-2 bg-[#026F4F] rounded-full border border-white" />
                )}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Main White Content Sheet Container with ROUNDED TOP CORNERS matching Figma */}
      <div
        className={`w-full bg-white rounded-t-[32px] sm:rounded-t-[36px] pt-4 flex-1 transition-all overflow-clip ${
          totalCartCount > 0 ? 'pb-24' : 'pb-10'
        }`}
      >
        <div className="max-w-md mx-auto w-full px-5 space-y-4">
          {/* Category Pills Bar matching Figma - Clean with NO bottom shadow line */}
          <section
            ref={pillContainerRef}
            className="sticky top-0 z-30 bg-white py-1 -mx-5 px-5 overflow-x-auto no-scrollbar"
          >
            <div className="flex items-center gap-[6px] min-w-max pe-5 rtl:ps-5">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const catName = language === 'ARABIC' ? cat.nameAr : cat.name;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    ref={(el) => {
                      catPillRefs.current[cat.id] = el;
                    }}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-[6px] px-[11px] py-[6px] rounded-[40px] text-[16px] font-normal leading-[140%] tracking-normal transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#026F4F] text-white shadow-xs'
                        : 'bg-[#F3F4F6] hover:bg-zinc-200/80 text-[#686868]'
                    }`}
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={catName}
                        className="w-[22px] h-[22px] rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span className="text-[16px] leading-none">{cat.emoji}</span>
                    )}
                    <span>{catName}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Content View: Search Mode OR Figma-matched Sections */}
          {searchQuery ? (
            <section className="space-y-3 pt-1">
              {searchResults.length === 0 ? (
                /* Figma "No match: id=82:348" Screen */
                <div className="py-4 text-center flex flex-col items-center">
                  <div className="w-full text-start mb-2">
                    <h2 className="text-[19px] font-medium text-[#2D2F33] leading-[140%]">
                      {language === 'ARABIC' ? 'نتائج لـ ' : 'Results for '}
                      <span className="text-[#026F4F]">"{searchQuery}"</span>
                    </h2>
                  </div>

                  {/* Centered No Match Illustration from Figma (Objects: 264x236) */}
                  <img
                    src="/images/no-match.png"
                    alt="No match"
                    className="w-[200px] sm:w-[220px] h-auto object-contain mx-auto mt-6 mb-4"
                  />

                  {/* Subtitle matching Figma: No items match your filters (19px font-normal #2D2F33) */}
                  <p className="text-[19px] font-normal text-[#2D2F33] text-center leading-[140%] pb-4">
                    {language === 'ARABIC'
                      ? 'لا توجد أصناف تطابق بحثك'
                      : 'No items match your filters'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-[19px] font-medium text-[#2D2F33] leading-[140%]">
                      {language === 'ARABIC' ? 'نتائج لـ ' : 'Results for '}
                      <span className="text-[#026F4F]">"{searchQuery}"</span>
                    </h2>
                    <span className="text-xs font-medium text-zinc-400">
                      {searchResults.length} {language === 'ARABIC' ? 'صنف' : 'items'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
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
                </>
              )}
            </section>
          ) : selectedCategory === 'all' ? (
            <div className="space-y-5 pt-1">
              {/* Section 1: 🔥 Popular Now (2-column vertical cards) */}
              <section className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <img src="/icons/noto_fire.svg" alt="" className="w-5 h-5 object-contain" />
                  <h2 className="text-[19px] font-medium text-[#2D2F33] leading-[140%]">
                    {language === 'ARABIC' ? 'الأكثر شعبية' : 'Popular Now'}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {popularItems.map((item) => (
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

              {/* Section 2: All Items (horizontal cards matching Figma) */}
              <section className="space-y-3">
                <h2 className="text-[19px] font-medium text-[#2D2F33] leading-[140%]">
                  {language === 'ARABIC' ? 'جميع الأصناف' : 'All Items'}
                </h2>

                <div className="flex flex-col gap-3">
                  {allItems.map((item) => (
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
            </div>
          ) : (
            /* Filtered Category Section matching Figma Frame 42:527 (e.g. Ramen (3)) */
            <section className="space-y-3 pt-1">
              <h2 className="text-[19px] font-medium text-[#2D2F33] leading-[140%] capitalize">
                {language === 'ARABIC'
                  ? CATEGORIES.find((c) => c.id === selectedCategory)?.nameAr || selectedCategory
                  : CATEGORIES.find((c) => c.id === selectedCategory)?.name || selectedCategory}{' '}
                ({categoryFilteredItems.length})
              </h2>

              <div className="flex flex-col gap-3">
                {categoryFilteredItems.map((item) => (
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
          )}

          {/* POWERED BY EMSA7 footer branding */}
          <PoweredByFooter className="pt-10 pb-6" />
        </div>
      </div>

      {/* Floating Waiter Call Button & Tooltip matching Figma */}
      <div
        onMouseEnter={waiterTooltip.onMouseEnter}
        onMouseLeave={waiterTooltip.onMouseLeave}
        className={`fixed end-4 sm:end-6 z-40 flex flex-col items-end gap-1.5 transition-all duration-300 ${
          totalCartCount > 0 ? 'bottom-20 sm:bottom-22' : 'bottom-6 sm:bottom-7'
        }`}
      >
        {/* Floating Tooltip Label: Call a Waiter or Cooldown Timer */}
        <div
          className={`min-w-[98px] px-3 h-[38px] rounded-[12px] bg-[#2D2F33] text-white text-[13px] font-medium flex items-center justify-center leading-[140%] shadow-md select-none transition-all duration-500 origin-bottom ${
            waiterTooltip.show || isCooldown
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-90 translate-y-2 pointer-events-none'
          }`}
        >
          <span>
            {isCooldown
              ? language === 'ARABIC'
                ? `يرجى الانتظار (${formattedTime})`
                : `Please wait (${formattedTime})`
              : language === 'ARABIC'
              ? 'طلب النادل'
              : 'Call a Waiter'}
          </span>
        </div>

        {/* Bell Button (Ellipse 692: 50x50 bg #efac31) */}
        <button
          type="button"
          disabled={isCooldown}
          onClick={() => {
            if (isCooldown) return;
            waiterTooltip.dismiss();
            openWaiterModal();
          }}
          aria-label={isCooldown ? `Wait ${formattedTime}` : 'Call Waiter'}
          className={`relative group w-[50px] h-[50px] rounded-full text-white flex items-center justify-center shadow-lg transition-all ${
            isCooldown
              ? 'bg-zinc-400 cursor-not-allowed opacity-85'
              : 'bg-[#EFAC31] hover:bg-[#df9c21] active:scale-95 cursor-pointer'
          }`}
        >
          <SvgBellsIcon className="w-6 h-6 fill-current text-white" />
        </button>
      </div>

      {/* My Order Screen */}
      <MyOrderScreen
        isOpen={isCartOpen}
        onClose={() => {
          setOpenCheckoutDirectly(false);
          closeModal();
        }}
        initialShowCheckout={openCheckoutDirectly || isCheckoutOpen}
        initialTab={isOngoingOpen ? 'ongoing' : 'cart'}
        cart={cart}
        onIncrement={handleCartItemIncrement}
        onDecrement={handleDecrement}
        onRemove={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onDeductPaidItems={handleDeductPaidItems}
        onAddToCart={(item) => handleIncrement(item)}
        onUpdateCartItem={handleUpdateCartItem}
        onReorder={(itemsToReorder) => {
          // Replace existing cart items with reordered items (per client requirement)
          setCart(itemsToReorder.map((rItem) => ({ ...rItem })));
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
          setOpenCheckoutDirectly(false);
          openCartModal();
        }}
        language={language}
      />
    </div>
  );
};
