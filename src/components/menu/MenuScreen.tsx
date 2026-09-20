import React, { useState, useMemo } from 'react';
import SvgCartIcon from '@/components/ui/svg-icons/CartSvg';
import SvgFilterIcon from '@/components/ui/svg-icons/FilterSvg';
import SvgBellsIcon from '@/components/ui/svg-icons/BellsSvg';
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
  CATEGORIES,
  MOCK_MENU_ITEMS,
} from '@/types/menu';
import { FoodCardVertical } from '@/components/food/FoodCardVertical';
import { FoodCardHorizontal } from '@/components/food/FoodCardHorizontal';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { WaiterCallToast } from './WaiterCallToast';
import { CartDrawer } from '@/components/cart/CartDrawer';

interface MenuScreenProps {
  tableName?: string;
  onBackToTableConfirmed?: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  tableName = 'A08',
  onBackToTableConfirmed,
}) => {
  // State Management
  const [language, setLanguage] = useState<'ENGLISH' | 'ARABIC'>('ENGLISH');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Floating Toast state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<MenuItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Waiter Bell Call State
  const [isWaiterCalled, setIsWaiterCalled] = useState(false);

  // Filter items
  const popularItems = useMemo(() => {
    return MOCK_MENU_ITEMS.filter((item) => item.isPopular);
  }, []);

  const filteredItems = useMemo(() => {
    return MOCK_MENU_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.nameAr && item.nameAr.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Cart Helper Functions
  const getItemQuantity = (itemId: string) => {
    const found = cart.find((ci) => ci.item.id === itemId);
    return found ? found.quantity : 0;
  };

  const handleAddToCart = (
    item: MenuItem,
    quantity = 1,
    instructions = ''
  ) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (ci) => ci.item.id === item.id
      );
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        if (instructions) {
          updated[existingIndex].specialInstructions = instructions;
        }
        return updated;
      }
      return [
        ...prevCart,
        { item, quantity, specialInstructions: instructions },
      ];
    });
  };

  const handleIncrement = (item: MenuItem) => {
    handleAddToCart(item, 1);
  };

  const handleDecrement = (itemId: string) => {
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.item.id === itemId);
      if (!existing) return prevCart;
      if (existing.quantity <= 1) {
        return prevCart.filter((ci) => ci.item.id !== itemId);
      }
      return prevCart.map((ci) =>
        ci.item.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci
      );
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className={`min-h-[100dvh] bg-[#f8f9fa] sm:bg-[#f4f5f7] antialiased select-none pb-28 relative ${
        language === 'ARABIC' ? 'font-sans rtl' : 'ltr'
      }`}
    >
      {/* Waiter Call Toast Alert Banner */}
      <WaiterCallToast
        isOpen={isWaiterCalled}
        tableName={`Table ${tableName}`}
        language={language}
        onClose={() => setIsWaiterCalled(false)}
        onCancelCall={() => setIsWaiterCalled(false)}
      />

      {/* Main Container Wrapper */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 space-y-5 sm:space-y-6">
        
        {/* Top Header Row */}
        <header className="flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToTableConfirmed}>
            <img
              src="/trash/restaurant-logo.png"
              alt="Restaurant Logo"
              className="h-9 sm:h-11 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/emsa7-logo.png';
              }}
            />
          </div>

          {/* Right Header Buttons: Language Dropdown & My Order Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switcher Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold shadow-2xs hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-primary/80" />
                <span>{language === 'ARABIC' ? 'AR' : 'EN'}</span>
                <ChevronDown className="h-3 w-3 text-primary/80" />
              </button>

              {/* Language Options Dropdown */}
              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white border border-primary/20 rounded-2xl shadow-xl py-1.5 z-40 text-xs overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('ENGLISH');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 transition-colors font-medium flex items-center justify-between cursor-pointer ${
                      language === 'ENGLISH'
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span>English</span>
                    {language === 'ENGLISH' && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('ARABIC');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 transition-colors font-medium flex items-center justify-between cursor-pointer ${
                      language === 'ARABIC'
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span>العربية</span>
                    {language === 'ARABIC' && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                </div>
              )}
            </div>

            {/* My Order Button with SvgCartIcon */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-bold shadow-md bg-primary hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                <SvgCartIcon className="w-4 h-4 fill-current" />
              </div>
              <span>{language === 'ARABIC' ? 'طلباتي' : 'My Order'}</span>

              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-primary font-extrabold text-[11px] flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Table Seating Greeting */}
        <section className="space-y-0.5 pt-1">
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            {language === 'ARABIC' ? 'أنت جالس في الطاولة' : "You're seated at table"}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-primary">
            {tableName}
          </h1>
        </section>

        {/* Search & Filter Controls */}
        <section className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ARABIC'
                  ? 'ابحث عن رامن، غيوزا، مشروبات...'
                  : 'Search ramen, gyoza, drinks...'
              }
              className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-full bg-white border border-zinc-200/80 text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter SVG Icon Button */}
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Filter menu"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <SvgFilterIcon className="w-5 h-5 text-white" />
          </button>
        </section>

        {/* Category Pills Slider / Filter */}
        <section className="overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-2 min-w-max">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const catName = language === 'ARABIC' ? cat.nameAr : cat.name;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer shadow-2xs ${
                    isActive
                      ? 'bg-primary text-white shadow-xs scale-[1.02]'
                      : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200/60'
                  }`}
                >
                  <span className="text-base leading-none">{cat.emoji}</span>
                  <span>{catName}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 1: 🔥 Popular Now (Card Design 1 - Vertical Cards Grid) */}
        {!searchQuery && selectedCategory === 'all' && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                {language === 'ARABIC' ? 'الشعبية الآن' : 'Popular Now'}
              </h2>
            </div>

            {/* Grid for Vertical Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {popularItems.map((item) => (
                <FoodCardVertical
                  key={item.id}
                  item={item}
                  quantity={getItemQuantity(item.id)}
                  language={language}
                  onAdd={(food) => handleAddToCart(food, 1)}
                  onIncrement={handleIncrement}
                  onDecrement={(food) => handleDecrement(food.id)}
                  onClick={(food) => {
                    setSelectedFoodItem(food);
                    setIsDetailModalOpen(true);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Section 2: All Items (Card Design 2 - Horizontal Cards List) */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
              {searchQuery
                ? language === 'ARABIC'
                  ? 'نتائج البحث'
                  : 'Search Results'
                : selectedCategory === 'all'
                ? language === 'ARABIC'
                  ? 'جميع الأصناف'
                  : 'All Items'
                : CATEGORIES.find((c) => c.id === selectedCategory)?.name}
            </h2>
            <span className="text-xs font-semibold text-zinc-400">
              {filteredItems.length} {language === 'ARABIC' ? 'صنف' : 'items'}
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 bg-white rounded-2xl border border-zinc-100 p-6">
              <p className="font-bold text-sm text-zinc-700">
                {language === 'ARABIC'
                  ? 'لم يتم العثور على أطباق مطابقة'
                  : 'No food items found'}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                {language === 'ARABIC'
                  ? 'جرب البحث عن كلمة أخرى أو تغيير الفئة.'
                  : 'Try searching with another keyword or change category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredItems.map((item) => (
                <FoodCardHorizontal
                  key={item.id}
                  item={item}
                  quantity={getItemQuantity(item.id)}
                  language={language}
                  onAdd={(food) => handleAddToCart(food, 1)}
                  onIncrement={handleIncrement}
                  onDecrement={(food) => handleDecrement(food.id)}
                  onClick={(food) => {
                    setSelectedFoodItem(food);
                    setIsDetailModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Floating Waiter Call Button (Anchored Bottom Right - Uses Primary Brand Color) */}
      <div className="fixed bottom-6 right-5 sm:right-8 z-40 flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-300">
        {/* Floating Tooltip Label: Call a Waiter */}
        <div className="hidden sm:flex items-center px-3.5 py-1.5 rounded-full bg-zinc-900/90 backdrop-blur-xs text-white text-xs font-bold shadow-xl border border-white/10">
          <span>{language === 'ARABIC' ? 'طلب النادل' : 'Call a Waiter'}</span>
        </div>

        {/* Bell Button (Primary Brand Color Button) */}
        <button
          type="button"
          onClick={() => setIsWaiterCalled(true)}
          aria-label="Call Waiter"
          className="relative group w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-primary hover:bg-primary/90 active:scale-95 text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer"
        >
          {/* Pulse Ripple Effect */}
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-75 pointer-events-none" />

          {/* Bell Icon */}
          <div className="relative z-10 w-6 h-6 flex items-center justify-center">
            <SvgBellsIcon className="w-6 h-6 fill-current text-white" />
          </div>
        </button>
      </div>

      {/* Food Detail Modal */}
      <FoodDetailModal
        item={selectedFoodItem}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAddToCart={(item, qty, instructions) => {
          handleAddToCart(item, qty, instructions);
        }}
        language={language}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onIncrement={(itemId) => {
          const found = cart.find((ci) => ci.item.id === itemId);
          if (found) handleIncrement(found.item);
        }}
        onDecrement={handleDecrement}
        onRemove={handleRemoveFromCart}
        onClearCart={handleClearCart}
        language={language}
        tableName={`Table ${tableName}`}
      />
    </div>
  );
};
