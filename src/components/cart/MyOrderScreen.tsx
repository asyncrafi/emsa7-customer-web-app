import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight, Clock, Trash2, Plus, Pencil, FileText } from 'lucide-react';
import { type CartItem, formatPrice, MOCK_MENU_ITEMS, type MenuItem, type SelectedOption, getCartSubtotal, getCartItemTotalPrice } from '@/types/menu';
import { QuantityControl } from '@/components/food/QuantityControl';
import { OrderDetailsScreen } from '@/components/cart/OrderDetailsScreen';
import { CheckoutScreen } from '@/components/cart/CheckoutScreen';
import { OrderConfirmedScreen } from '@/components/cart/OrderConfirmedScreen';
import { EInvoiceModal } from '@/components/cart/EInvoiceModal';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { useLanguage } from '@/providers/LanguageContext';
import SvgCartIcon from '@/components/ui/svg-icons/CartSvg';
import SvgEmsa7Icon from '@/components/ui/svg-icons/EMSA7Svg';
import SvgPlacedIcon from '@/components/ui/svg-icons/PlacedSvg';
import SvgPrepIcon from '@/components/ui/svg-icons/PrepSvg';
import SvgServedIcon from '@/components/ui/svg-icons/ServedSvg';

export interface StoredOrder {
  id: string;
  date: string;
  total: number;
  status: 'Placed' | 'Preparing' | 'Ready' | 'Served';
  isPaid?: boolean;
  items: {
    name: string;
    qty: number;
    image: string;
    price: number;
  }[];
  cartItems?: CartItem[];
}

export interface MyOrderScreenProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onClearCart: () => void;
  onAddToCart?: (item: MenuItem) => void;
  onUpdateCartItem?: (
    index: number,
    quantity: number,
    instructions: string,
    selectedOptions?: SelectedOption[]
  ) => void;
  onReorder?: (items: CartItem[]) => void;
  onCallWaiter?: () => void;
  language?: 'ENGLISH' | 'ARABIC';
  tableName?: string;
  initialTab?: 'ongoing' | 'cart' | 'history';
  initialShowCheckout?: boolean;
}

export const MyOrderScreen: React.FC<MyOrderScreenProps> = ({
  isOpen,
  onClose,
  cart,
  onIncrement,
  onDecrement,
  onRemove: _onRemove,
  onClearCart,
  onAddToCart,
  onUpdateCartItem,
  onReorder,
  onCallWaiter: _onCallWaiter,
  language: propLanguage,
  tableName: _tableName = 'Table A08',
  initialTab = 'ongoing',
  initialShowCheckout = false,
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = propLanguage || contextLanguage;
  const [activeTab, setActiveTab] = useState<'ongoing' | 'cart' | 'history'>(initialTab);
  const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (initialShowCheckout) {
        setActiveTab('cart');
        setShowCheckoutModal(true);
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, initialShowCheckout, initialTab]);
  const [showOrderConfirmedModal, setShowOrderConfirmedModal] = useState(false);
  const [confirmedCart, setConfirmedCart] = useState<CartItem[]>([]);
  const [confirmedGrandTotal, setConfirmedGrandTotal] = useState(0);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<StoredOrder | null>(null);

  // LocalStorage Keys
  const LOCAL_STORAGE_HISTORY_KEY = 'emsa7_order_history';
  const LOCAL_STORAGE_ONGOING_KEY = 'emsa7_ongoing_order';

  // Default Mock History Orders with clean valid food images
  const DEFAULT_HISTORY_ORDERS: StoredOrder[] = [
    {
      id: '#A102',
      date: 'Today, 7:42 PM',
      total: 15.99,
      status: 'Served',
      items: [
        { name: 'Shoyu Ramen', qty: 2, image: '/images/food/ramen.png', price: 15.99 },
        { name: 'Iced Green Tea', qty: 1, image: '/images/food/iced-tea.png', price: 15.99 },
      ],
      cartItems: [
        { item: MOCK_MENU_ITEMS[0], quantity: 2 },
        { item: MOCK_MENU_ITEMS[2] || MOCK_MENU_ITEMS[0], quantity: 1 },
      ],
    },
    {
      id: '#A098',
      date: 'Yesterday, 8:15 PM',
      total: 31.98,
      status: 'Served',
      items: [
        { name: 'Shoyu Ramen', qty: 1, image: '/images/food/ramen.png', price: 15.99 },
        { name: 'Gyoza', qty: 1, image: '/images/food/gyoza.png', price: 15.99 },
      ],
      cartItems: [
        { item: MOCK_MENU_ITEMS[0], quantity: 1 },
      ],
    },
  ];

  // Load history orders from localStorage
  const [historyOrders, setHistoryOrders] = useState<StoredOrder[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading history orders from localStorage:', e);
    }
    return DEFAULT_HISTORY_ORDERS;
  });

  // Load ongoing order from localStorage
  const [ongoingOrder, setOngoingOrder] = useState<StoredOrder | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ONGOING_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading ongoing order from localStorage:', e);
    }
    return null;
  });

  if (!isOpen) return null;

  const isArabic = activeLanguage === 'ARABIC';

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getCartSubtotal(cart);
  const serviceCharge = 0;
  const grandTotal = subtotal;

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#f4f4f5] antialiased select-none overflow-y-auto flex flex-col justify-between ${
        isArabic ? 'font-sans rtl' : 'ltr'
      }`}
    >
      {/* Top Main Page Container with Expanded Tablet & Desktop responsive max-width */}
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-5 sm:pt-7 md:pt-10 pb-28 md:pb-36 space-y-6 md:space-y-8 flex-1">
        {/* Header Row: Back Arrow + Centered Title */}
        <header className="relative flex items-center justify-center py-2 md:py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white hover:bg-zinc-100 text-zinc-800 shadow-xs border border-zinc-200/60 flex items-center justify-center cursor-pointer transition-transform active:scale-95 rtl:left-auto rtl:right-0"
          >
            {isArabic ? <ArrowRight className="w-5 h-5 md:w-6 md:h-6" /> : <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />}
          </button>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-zinc-800 tracking-tight">
            {isArabic ? 'طلباتي' : 'My Order'}
          </h1>
        </header>

        {/* 3-Segment Tab Bar (Ongoing, Cart, History) */}
        <div className="bg-[#e2e4e8] p-1 md:p-1.5 rounded-full flex items-center shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('ongoing')}
            className={`flex-1 py-2.5 md:py-3.5 rounded-full text-xs sm:text-sm md:text-base font-medium tracking-wide transition-all cursor-pointer text-center ${
              activeTab === 'ongoing'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-700 font-normal'
            }`}
          >
            {isArabic ? 'الجاري' : 'Ongoing'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cart')}
            className={`flex-1 py-2.5 md:py-3.5 rounded-full text-xs sm:text-sm md:text-base tracking-wide transition-all cursor-pointer text-center relative inline-flex items-center justify-center gap-1.5 ${
              activeTab === 'cart'
                ? 'bg-white text-zinc-900 shadow-xs font-medium'
                : 'text-zinc-500 hover:text-zinc-700 font-normal'
            }`}
          >
            <span>{isArabic ? 'السلة' : 'Cart'}</span>
            {totalCartCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#026F4F] text-white text-[10px] sm:text-xs font-medium rounded-full shrink-0">
                {totalCartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 md:py-3.5 rounded-full text-xs sm:text-sm md:text-base tracking-wide transition-all cursor-pointer text-center ${
              activeTab === 'history'
                ? 'bg-white text-zinc-900 shadow-xs font-medium'
                : 'text-zinc-500 hover:text-zinc-700 font-normal'
            }`}
          >
            {isArabic ? 'الطلبات السابقة' : 'History'}
          </button>
        </div>

        {/* TAB 1: ONGOING ORDERS */}
        {activeTab === 'ongoing' && (
          <div className="space-y-4 md:space-y-6 animate-in fade-in duration-200">
            {ongoingOrder ? (
              /* Active Order Card */
              <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs border border-zinc-100 space-y-5 md:space-y-7">
                {/* Order Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-800 tracking-tight">
                      {ongoingOrder.id}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 font-normal mt-0.5 md:mt-1">
                      {ongoingOrder.date}
                    </p>
                  </div>
                  <span className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#026F4F]">
                    {formatPrice(ongoingOrder.total, activeLanguage)}
                  </span>
                </div>

                {/* Items Thumbnails Row with Prominent White Circular Badges (Figma-Exact) */}
                <div className="flex items-center gap-6 sm:gap-8 pt-2 pb-3 overflow-x-auto no-scrollbar">
                  {ongoingOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl bg-[#f4f4f5] shrink-0 shadow-2xs p-2 flex items-center justify-center"
                    >
                      <img
                        src={it.image || '/images/food/ramen.png'}
                        alt={it.name}
                        className="w-full h-full object-contain rounded-2xl sm:rounded-3xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/food/ramen.png';
                        }}
                      />
                      {/* Big White Circular Badge matching Figma */}
                      <div className="absolute -top-3 -right-3 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-white shadow-md border border-zinc-100 flex items-center justify-center font-bold text-sm sm:text-base md:text-lg text-zinc-900 z-10">
                        x{it.qty}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Progress Stepper Bar (Figma-Exact Custom SVG Ring Icons) */}
                <div className="pt-4 md:pt-6">
                  <div className="flex items-center justify-between relative px-2 sm:px-4">
                    {/* Stepper Status 1: Placed */}
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-[3.5px] border-[#026F4F] bg-white text-[#026F4F] flex items-center justify-center shadow-2xs">
                        <SvgPlacedIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#026F4F]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[#026F4F]">
                        {isArabic ? 'تم الطلب' : 'Placed'}
                      </span>
                    </div>

                    {/* Connecting Line 1 */}
                    <div className="flex-1 h-0.5 border-b-[3px] border-dashed border-[#026F4F] -mt-6 sm:-mt-7 md:-mt-8 mx-1 sm:mx-2" />

                    {/* Stepper Status 2: Preparing */}
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-[3.5px] border-[#026F4F] bg-white text-[#026F4F] flex items-center justify-center shadow-2xs">
                        <SvgPrepIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#026F4F]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[#026F4F]">
                        {isArabic ? 'جاري التحضير' : 'Preparing'}
                      </span>
                    </div>

                    {/* Connecting Line 2 */}
                    <div className="flex-1 h-0.5 border-b-[3px] border-dashed border-zinc-200 -mt-6 sm:-mt-7 md:-mt-8 mx-1 sm:mx-2" />

                    {/* Stepper Status 3: Ready */}
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-[3.5px] border-zinc-200 bg-white text-zinc-300 flex items-center justify-center">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-300" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-zinc-400">
                        {isArabic ? 'جاهز' : 'Ready'}
                      </span>
                    </div>

                    {/* Connecting Line 3 */}
                    <div className="flex-1 h-0.5 border-b-[3px] border-dashed border-zinc-200 -mt-6 sm:-mt-7 md:-mt-8 mx-1 sm:mx-2" />

                    {/* Stepper Status 4: Served */}
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-[3.5px] border-zinc-200 bg-white text-zinc-300 flex items-center justify-center">
                        <SvgServedIcon className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-300" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-zinc-400">
                        {isArabic ? 'تم التقديم' : 'Served'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Details Button inside Order Card */}
                <button
                  type="button"
                  onClick={() => setShowOrderDetailsModal(true)}
                  className="w-full py-3.5 sm:py-4 px-4 rounded-full bg-[#eef0f2] hover:bg-zinc-200/80 text-zinc-700 font-medium text-sm md:text-base tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>{isArabic ? 'عرض التفاصيل' : 'View Details'}</span>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-zinc-500 rtl:rotate-180" />
                </button>
              </div>
            ) : (
              /* No Active Order Clean Card */
              <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs border border-zinc-100 text-center space-y-4 md:space-y-5">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-[#eef7f4] border border-emerald-100/80 flex items-center justify-center mx-auto text-[#026F4F]">
                  <Clock className="w-9 h-9 sm:w-10 sm:h-10 text-[#026F4F]" />
                </div>

                <div>
                  <h2 className="font-bold text-lg sm:text-xl md:text-2xl text-zinc-900 tracking-tight">
                    {isArabic ? 'لا توجد طلبات جارية' : 'No Active Order'}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 font-normal mt-1 max-w-xs sm:max-w-sm mx-auto">
                    {isArabic
                      ? 'قم بتقديم طلب وسظهر تتبعه المباشر هنا!'
                      : 'Place an order to track its real-time preparation here!'}
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-8 sm:px-10 py-3 sm:py-3.5 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-bold text-xs sm:text-sm md:text-base tracking-wide shadow-md active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center"
                  >
                    {isArabic ? 'تصفح القائمة' : 'Browse Menu'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CART ITEMS LIST (FIGMA-EXACT EMPTY & WITH ITEMS UI) */}
        {activeTab === 'cart' && (
          <div className="animate-in fade-in duration-200">
            {cart.length === 0 ? (
              /* EMPTY CART SCREEN MATCHING FIGMA DESIGN */
              <div className="space-y-6 md:space-y-8">
                {/* Empty Cart Card Container */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs border border-zinc-100 text-center space-y-4 md:space-y-5">
                  {/* SvgCartIcon Container */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-[#eef7f4] border border-emerald-100/80 flex items-center justify-center mx-auto text-[#026F4F]">
                    <SvgCartIcon className="w-9 h-9 sm:w-10 sm:h-10 text-[#026F4F]" />
                  </div>

                  <div>
                    <h2 className="font-bold text-lg sm:text-xl md:text-2xl text-zinc-900 tracking-tight">
                      {isArabic ? 'سلتك فارغة' : 'Your Cart is empty'}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 font-normal mt-1 max-w-xs sm:max-w-sm mx-auto">
                      {isArabic ? 'أضف بعض الرامن اللذيذ للبدء!' : 'Add some delicious ramen to get started!'}
                    </p>
                  </div>

                  {/* Browse Menu Button */}
                  <div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-8 sm:px-10 py-3 sm:py-3.5 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-bold text-xs sm:text-sm md:text-base tracking-wide shadow-md active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center"
                    >
                      {isArabic ? 'تصفح القائمة' : 'Browse Menu'}
                    </button>
                  </div>
                </div>

                {/* 🔥 Try Our Popular Menu Section */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-bold text-zinc-900">
                    <span className="text-lg sm:text-xl">🔥</span>
                    <span>{isArabic ? 'جرب قائمتنا الشهيرة' : 'Try Our Popular Menu'}</span>
                  </div>

                  {/* Popular Items Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                    {MOCK_MENU_ITEMS.filter((item) => item.isPopular).map((popItem) => (
                      <div
                        key={popItem.id}
                        className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-zinc-100 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all group"
                      >
                        <div className="space-y-2">
                          {/* Image Box: Full-width object-cover matching Figma screenshot */}
                          <div className="w-full aspect-[4/3] rounded-xl sm:rounded-2xl bg-zinc-100 overflow-hidden relative">
                            <img
                              src={popItem.imageUrl}
                              alt={popItem.name}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Item Title & Desc */}
                          <div>
                            <h3 className="font-bold text-xs sm:text-sm md:text-base text-zinc-900 truncate">
                              {isArabic ? popItem.nameAr || popItem.name : popItem.name}
                            </h3>
                            <p className="text-[10px] sm:text-xs text-zinc-400 font-normal line-clamp-1 mt-0.5">
                              {isArabic ? popItem.descriptionAr || popItem.description : popItem.description}
                            </p>
                          </div>
                        </div>

                        {/* Price & Add (+) Button */}
                        <div className="flex items-center justify-between pt-3 mt-1">
                          <span className="font-extrabold text-xs sm:text-sm md:text-base text-[#026F4F]">
                            {formatPrice(popItem.price, activeLanguage)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onAddToCart && onAddToCart(popItem)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white flex items-center justify-center cursor-pointer shadow-xs active:scale-90 transition-all"
                            aria-label="Add item"
                          >
                            <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* CART WITH ITEMS SCREEN MATCHING FIGMA DESIGN */
              <div className="space-y-4 md:space-y-6">
                {/* Card 1: Order Summary (Items List) */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs border border-zinc-100 space-y-4 md:space-y-5">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-50">
                    <h2 className="font-bold text-base sm:text-lg md:text-xl text-zinc-900">
                      {isArabic ? 'ملخص الطلب' : 'Order Summary'}
                    </h2>
                    <button
                      type="button"
                      onClick={onClearCart}
                      className="text-xs sm:text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{isArabic ? 'مسح' : 'Clear'}</span>
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3.5 md:space-y-4 divide-y divide-zinc-100">
                    {cart.map((ci, idx) => (
                      <div key={`${ci.item.id}-${idx}`} className="pt-3.5 first:pt-0 flex items-center justify-between gap-3 md:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div className="w-13 h-13 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl bg-zinc-50 p-2 flex items-center justify-center shrink-0 border border-zinc-100">
                            <img
                              src={ci.item.imageUrl}
                              alt={ci.item.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-xs sm:text-sm md:text-base text-zinc-900 truncate">
                                {isArabic ? ci.item.nameAr || ci.item.name : ci.item.name}
                              </h3>
                              <button
                                type="button"
                                onClick={() => setEditingCartIndex(idx)}
                                aria-label="Edit item"
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#eef7f4] hover:bg-[#026F4F]/20 text-[#026F4F] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                title={isArabic ? 'تعديل' : 'Edit'}
                              >
                                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                              </button>
                            </div>
                            {ci.selectedOptions && ci.selectedOptions.length > 0 && (
                              <p className="text-[11px] sm:text-xs text-zinc-500 font-medium truncate">
                                {ci.selectedOptions.map((so) => so.optionName).join(', ')}
                              </p>
                            )}
                            {ci.specialInstructions && (
                              <p className="text-[11px] sm:text-xs text-zinc-400 font-normal italic truncate">
                                "{ci.specialInstructions}"
                              </p>
                            )}
                            <span className="font-extrabold text-xs sm:text-sm md:text-base text-[#026F4F] block mt-0.5">
                              {formatPrice(getCartItemTotalPrice(ci), activeLanguage)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          <QuantityControl
                            quantity={ci.quantity}
                            onIncrement={() => onIncrement(ci.item.id)}
                            onDecrement={() => onDecrement(ci.item.id)}
                            size="sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* + Add More Items Link Button */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#026F4F] hover:text-[#025a40] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>{isArabic ? 'إضافة المزيد من الأصناف' : 'Add More Items'}</span>
                    </button>
                  </div>

                  {/* Dashed Separator Line */}
                  <div className="border-b border-dashed border-zinc-200 my-2.5 md:my-3.5" />

                  {/* Subtotal Line */}
                  <div className="flex justify-between items-center text-xs sm:text-sm md:text-base font-bold text-zinc-900 pt-0.5">
                    <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span className="text-[#026F4F] font-extrabold text-sm sm:text-base md:text-lg">
                      {formatPrice(subtotal, activeLanguage)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDER HISTORY (FIGMA SCREENSHOT 3 EXACT LAYOUT) */}
        {activeTab === 'history' && (
          <div className="space-y-4 md:space-y-5 animate-in fade-in duration-200">
            {historyOrders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-3xl p-5 sm:p-6 md:p-7 shadow-xs border border-zinc-100 space-y-4">
                {/* Header Row: #A102 and Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base md:text-lg text-zinc-900">{ord.id}</h3>
                    <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">{ord.date}</p>
                  </div>
                  <span className="font-extrabold text-base sm:text-lg md:text-xl text-[#026F4F]">
                    {formatPrice(ord.total, activeLanguage)}
                  </span>
                </div>

                {/* Thumbnails Row with Quantity Badges & Fallback Images */}
                <div className="flex items-center gap-3 sm:gap-4 py-1">
                  {ord.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-50 p-1.5 border border-zinc-100 flex items-center justify-center shrink-0"
                    >
                      <img
                        src={it.image || '/images/food/ramen.png'}
                        alt={it.name}
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/food/ramen.png';
                        }}
                      />
                      <span className="absolute -top-2 -right-2 text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-white shadow-xs border border-zinc-200 rounded-full text-zinc-800 z-10">
                        x{it.qty}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons: E-Invoice & Reorder */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceOrder(ord)}
                    className="flex-1 py-3 sm:py-3.5 px-3 sm:px-4 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold text-xs sm:text-sm md:text-base tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-4 h-4 text-[#026F4F] shrink-0" />
                    <span>{isArabic ? 'الفاتورة الإلكترونية' : 'E-Invoice'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onReorder && ord.cartItems && ord.cartItems.length > 0) {
                        onReorder(ord.cartItems);
                      } else {
                        // Fallback: build cart items from order.items
                        const itemsToReorder: CartItem[] = ord.items.map((it) => {
                          const matched =
                            MOCK_MENU_ITEMS.find((m) => m.name.toLowerCase() === it.name.toLowerCase()) ||
                            MOCK_MENU_ITEMS[0];
                          return { item: matched, quantity: it.qty };
                        });
                        if (onReorder) {
                          onReorder(itemsToReorder);
                        } else {
                          itemsToReorder.forEach((ci) => onAddToCart?.(ci.item));
                        }
                      }
                      setActiveTab('cart');
                    }}
                    className="flex-1 py-3 sm:py-3.5 px-3 sm:px-4 rounded-full bg-[#eef0f2] hover:bg-zinc-200 text-zinc-800 font-bold text-xs sm:text-sm md:text-base tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{isArabic ? 'إعادة الطلب' : 'Reorder'}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-500 rtl:rotate-180 shrink-0" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* Sticky Bottom Action Bar when Cart Has Items */}
      {activeTab === 'cart' && cart.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 z-40 bg-[#f4f4f5]/90 backdrop-blur-md border-t border-zinc-200/60 py-3 sm:py-4 px-4 sm:px-6">
          <div className="w-full max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto">
            <button
              type="button"
              onClick={() => setShowCheckoutModal(true)}
              className="w-full py-4 sm:py-4.5 px-6 sm:px-8 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-extrabold text-sm sm:text-base md:text-lg tracking-wide shadow-md flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
            >
              <span>{isArabic ? 'متابعة الشراء' : 'Continue to Checkout'}</span>
              <span className="font-extrabold text-base sm:text-lg md:text-xl">
                {formatPrice(grandTotal, activeLanguage)}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Footer Branding Line: POWERED BY EMSA7 */}
      <footer className="w-full text-center py-3 sm:py-4 bg-[#f4f4f5] border-t border-zinc-200/50 select-none flex justify-center items-center">
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
      </footer>

      {/* Order Details Screen Popup */}
      <OrderDetailsScreen
        isOpen={showOrderDetailsModal}
        onClose={() => setShowOrderDetailsModal(false)}
        onNewOrder={() => {
          setShowOrderDetailsModal(false);
          onClose();
        }}
        language={activeLanguage}
        orderId={ongoingOrder?.id || '#A102'}
      />

      {/* Order Confirmed Screen Modal */}
      <OrderConfirmedScreen
        isOpen={showOrderConfirmedModal}
        onClose={() => setShowOrderConfirmedModal(false)}
        onBackToMenu={() => {
          setShowOrderConfirmedModal(false);
          onClearCart();
          onClose();
        }}
        onTrackOrder={() => {
          setShowOrderConfirmedModal(false);
          onClearCart();
          setActiveTab('ongoing');
        }}
        cart={confirmedCart.length > 0 ? confirmedCart : cart}
        subtotal={confirmedGrandTotal ? confirmedGrandTotal / 1.15 : subtotal}
        serviceCharge={confirmedGrandTotal ? (confirmedGrandTotal / 1.15) * 0.1 : serviceCharge}
        vat={confirmedGrandTotal ? (confirmedGrandTotal / 1.15) * 0.05 : subtotal * 0.05}
        tipAmount={5.0}
        grandTotal={confirmedGrandTotal || grandTotal}
        language={activeLanguage}
      />

      {/* Checkout Screen Modal */}
      <CheckoutScreen
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cart={cart}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        onRemove={_onRemove}
        onClearCart={onClearCart}
        onAddMoreItems={() => {
          setShowCheckoutModal(false);
          onClose();
        }}
        onOrderSuccess={() => {
          const now = new Date();
          const timeStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          const newId = `#A${Math.floor(100 + Math.random() * 900)}`;

          const newOrder: StoredOrder = {
            id: newId,
            date: timeStr,
            total: grandTotal,
            status: 'Preparing',
            isPaid: true,
            items: cart.map((ci) => ({
              name: ci.item.name,
              qty: ci.quantity,
              image: ci.item.imageUrl || '/images/food/ramen.png',
              price: ci.item.price,
            })),
            cartItems: [...cart],
          };

          // Save to ongoing state & localStorage
          setOngoingOrder(newOrder);
          setHistoryOrders((prev) => {
            const updated = [newOrder, ...prev];
            try {
              localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
            } catch (e) {
              console.error('Error saving history to localStorage:', e);
            }
            return updated;
          });

          try {
            localStorage.setItem(LOCAL_STORAGE_ONGOING_KEY, JSON.stringify(newOrder));
          } catch (e) {
            console.error('Error saving ongoing order to localStorage:', e);
          }

          setConfirmedCart([...cart]);
          setConfirmedGrandTotal(grandTotal);
          setShowCheckoutModal(false);
          setShowOrderConfirmedModal(true);
        }}
        language={activeLanguage}
        tableName={_tableName}
      />

      {/* Edit Food Item Modal */}
      {editingCartIndex !== null && cart[editingCartIndex] && (
        <FoodDetailModal
          item={cart[editingCartIndex].item}
          isOpen={editingCartIndex !== null}
          onClose={() => setEditingCartIndex(null)}
          initialQuantity={cart[editingCartIndex].quantity}
          initialInstructions={cart[editingCartIndex].specialInstructions}
          initialSelectedOptions={cart[editingCartIndex].selectedOptions}
          isEditing={true}
          language={activeLanguage}
          onAddToCart={(_item, qty, instructions, options) => {
            if (onUpdateCartItem && editingCartIndex !== null) {
              onUpdateCartItem(editingCartIndex, qty, instructions, options);
            }
            setEditingCartIndex(null);
          }}
        />
      )}
      {/* E-Invoice Modal */}
      {selectedInvoiceOrder && (
        <EInvoiceModal
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          orderId={selectedInvoiceOrder.id}
          date={selectedInvoiceOrder.date}
          items={selectedInvoiceOrder.items.map((it) => ({
            name: it.name,
            qty: it.qty,
            price: it.price,
          }))}
          total={selectedInvoiceOrder.total}
          language={activeLanguage}
        />
      )}
    </div>
  );
};
