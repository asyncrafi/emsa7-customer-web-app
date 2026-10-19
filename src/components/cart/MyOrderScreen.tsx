import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight, Clock, Plus } from 'lucide-react';
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
import { useWaiterTooltip } from '@/hooks/useWaiterTooltip';

export interface StoredOrder {
  id: string;
  date: string;
  total: number;
  subtotal?: number;
  serviceCharge?: number;
  vat?: number;
  tipAmount?: number;
  splitFee?: number;
  discount?: number;
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
  onDeductPaidItems?: (paidCart: CartItem[]) => void;
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
  onDeductPaidItems,
  onAddToCart,
  onUpdateCartItem,
  onReorder,
  onCallWaiter,
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
  const waiterTooltip = useWaiterTooltip();

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
  const [confirmedTipAmount, setConfirmedTipAmount] = useState(0);
  const [confirmedSplitFee, setConfirmedSplitFee] = useState(0);
  const [confirmedDiscount, setConfirmedDiscount] = useState(0);
  const [confirmedSubtotal, setConfirmedSubtotal] = useState(0);
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

  // Default Mock Ongoing Order matching Figma #A102 with Preparing status
  const DEFAULT_ONGOING_ORDER: StoredOrder = {
    id: '#A102',
    date: 'Today, 7:42 PM',
    total: 35.48,
    subtotal: 31.98,
    serviceCharge: 3.20,
    vat: 1.60,
    tipAmount: 0,
    status: 'Preparing',
    items: [
      { name: 'Shoyu Ramen', qty: 2, image: '/images/food/ramen.png', price: 15.99 },
      { name: 'Iced Green Tea', qty: 1, image: '/images/food/iced-tea.png', price: 15.99 },
    ],
    cartItems: [
      { item: MOCK_MENU_ITEMS[0], quantity: 2 },
      { item: MOCK_MENU_ITEMS[1] || MOCK_MENU_ITEMS[0], quantity: 1 },
    ],
  };

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
    return DEFAULT_ONGOING_ORDER;
  });

  if (!isOpen) return null;

  const isArabic = activeLanguage === 'ARABIC';

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getCartSubtotal(cart);
  const serviceCharge = Math.round(subtotal * 0.10 * 100) / 100;
  const grandTotal = subtotal + serviceCharge;

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#f4f4f5] antialiased select-none overflow-y-auto flex flex-col justify-between font-sans"
    >
      {/* Main Page Container: Strictly responsive mobile 440px width matching Figma */}
      <div className="w-full max-w-[440px] mx-auto px-4 pt-4 pb-28 space-y-5 flex-1">
        {/* Header Row: Back Arrow + Centered Title matching Figma (Back 42x42 circle, Title 23px semi-bold) */}
        <header className="relative flex items-center justify-center py-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[42px] h-[42px] rounded-full bg-[#EEEEEE] hover:bg-zinc-200 text-[#2D2F33] flex items-center justify-center cursor-pointer transition-transform active:scale-95 rtl:left-auto rtl:right-0 shadow-xs"
          >
            {isArabic ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>

          <h1 className="text-[23px] font-semibold text-[#2D2F33] tracking-tight leading-[140%]">
            {isArabic ? 'طلباتي' : 'My Order'}
          </h1>
        </header>

        {/* 3-Segment Tab Bar matching Figma Frame 2147226313 (408x52 radius 37px bg #EFEFEF) */}
        <div className="bg-[#EFEFEF] p-1.5 rounded-[37px] flex items-center shadow-2xs h-[52px]">
          <button
            type="button"
            onClick={() => setActiveTab('ongoing')}
            className={`flex-1 h-[42px] rounded-[23px] text-[14px] leading-[140%] transition-all cursor-pointer flex items-center justify-center text-center ${
              activeTab === 'ongoing'
                ? 'bg-white text-[#2D2F33] shadow-xs font-normal'
                : 'text-[#989898] hover:text-[#2D2F33] font-normal'
            }`}
          >
            {isArabic ? 'الجاري' : 'Ongoing'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cart')}
            className={`flex-1 h-[42px] rounded-[23px] text-[14px] leading-[140%] transition-all cursor-pointer flex items-center justify-center text-center ${
              activeTab === 'cart'
                ? 'bg-white text-[#2D2F33] shadow-xs font-normal'
                : 'text-[#989898] hover:text-[#2D2F33] font-normal'
            }`}
          >
            <span>{isArabic ? 'السلة' : 'Cart'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 h-[42px] rounded-[23px] text-[14px] leading-[140%] transition-all cursor-pointer flex items-center justify-center text-center ${
              activeTab === 'history'
                ? 'bg-white text-[#2D2F33] shadow-xs font-normal'
                : 'text-[#989898] hover:text-[#2D2F33] font-normal'
            }`}
          >
            {isArabic ? 'الطلبات السابقة' : 'History'}
          </button>
        </div>

        {/* TAB 1: ONGOING ORDERS */}
        {activeTab === 'ongoing' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {ongoingOrder ? (
              /* Active Order Card matching Figma Frame 1171277102 (408x280 radius 13px bg white) */
              <div className="bg-white rounded-[13px] p-4.5 sm:p-5 shadow-2xs border border-[#F1F1F1] space-y-4">
                {/* Order Card Header: #A102 (23px w=600 #2D2F33), Today 7:42 PM (14px #989898), $15.99 (22px w=600 #026F4F) */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-[23px] font-semibold text-[#2D2F33] tracking-tight leading-[140%]">
                      {ongoingOrder.id}
                    </h2>
                    <p className="text-[14px] text-[#989898] font-normal mt-0.5 leading-[140%]">
                      {ongoingOrder.date}
                    </p>
                    {(ongoingOrder.tipAmount ?? 0) > 0 && (
                      <p className="text-[11px] text-[#026F4F] font-medium mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded-full border border-[#026F4F]/20">
                        {isArabic ? 'بما في ذلك إكرامية:' : 'Includes Tip:'} {formatPrice(ongoingOrder.tipAmount || 0, activeLanguage)}
                      </p>
                    )}
                  </div>
                  <span className="text-[22px] font-semibold text-[#026F4F] leading-[140%]">
                    {formatPrice(ongoingOrder.total, activeLanguage)}
                  </span>
                </div>

                {/* Items Thumbnails Row with Prominent White Circular Badges matching Figma Frame 1171277079 (59x64 box, cornerRadius 4.77px -> rounded-[5px], x2/x1 badge) */}
                <div className="flex items-center gap-3 pt-1 pb-1">
                  {ongoingOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="relative w-[59px] h-[64px] rounded-[5px] bg-[#F1F1F1] shrink-0 p-1 flex items-center justify-center"
                    >
                      <img
                        src={it.image || '/images/food/ramen.png'}
                        alt={it.name}
                        className="w-[45px] h-[45px] object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/food/ramen.png';
                        }}
                      />
                      {/* White Badge matching Figma */}
                      <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1.5 rounded-full bg-white shadow-xs border border-[#E5E7EB] flex items-center justify-center font-normal text-[11px] text-[#2D2F33] z-10">
                        x{it.qty}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Progress Stepper Bar (Figma Group 1171276316) */}
                <div className="pt-2">
                  <div className="flex items-center justify-between relative px-1">
                    {/* Stepper Status 1: Placed */}
                    <div className="flex flex-col items-center gap-1.5 z-10">
                      <div className="w-10 h-10 rounded-full border-2 border-[#026F4F] bg-white text-[#026F4F] flex items-center justify-center shadow-2xs">
                        <SvgPlacedIcon className="w-5 h-5 text-[#026F4F]" />
                      </div>
                      <span className="text-[12px] font-normal text-[#026F4F] leading-[140%]">
                        {isArabic ? 'تم الطلب' : 'Placed'}
                      </span>
                    </div>

                    {/* Connecting Line 1: Green Dashes */}
                    <div className="flex-1 border-b-2 border-dashed border-[#026F4F] -mt-5 mx-1" />

                    {/* Stepper Status 2: Preparing */}
                    <div className="flex flex-col items-center gap-1.5 z-10">
                      <div className="w-10 h-10 rounded-full border-2 border-[#026F4F] bg-white flex items-center justify-center shadow-2xs">
                        <img src="/icons/ph_cooking-pot-fill.svg" alt="" className="w-5 h-5" />
                      </div>
                      <span className="text-[12px] font-normal text-[#026F4F] leading-[140%]">
                        {isArabic ? 'جاري التحضير' : 'Preparing'}
                      </span>
                    </div>

                    {/* Connecting Line 2: Gray Dashes */}
                    <div className="flex-1 border-b-2 border-dashed border-[#B8B8B8] -mt-5 mx-1" />

                    {/* Stepper Status 3: Ready */}
                    <div className="flex flex-col items-center gap-1.5 z-10">
                      <div className="w-10 h-10 rounded-full border-2 border-[#B8B8B8] bg-white flex items-center justify-center">
                        <Clock className="w-4 h-4 text-[#B8B8B8]" />
                      </div>
                      <span className="text-[12px] font-normal text-[#B8B8B8] leading-[140%]">
                        {isArabic ? 'جاهز' : 'Ready'}
                      </span>
                    </div>

                    {/* Connecting Line 3: Gray Dashes */}
                    <div className="flex-1 border-b-2 border-dashed border-[#B8B8B8] -mt-5 mx-1" />

                    {/* Stepper Status 4: Served */}
                    <div className="flex flex-col items-center gap-1.5 z-10">
                      <div className="w-10 h-10 rounded-full border-2 border-[#B8B8B8] bg-white flex items-center justify-center">
                        <img src="/icons/emojione-monotone_fork-and-knife-with-plate.svg" alt="" className="w-5 h-5 opacity-70" />
                      </div>
                      <span className="text-[12px] font-normal text-[#B8B8B8] leading-[140%]">
                        {isArabic ? 'تم التقديم' : 'Served'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Long BTN: View Details > matching Figma Frame 107:128 (372x55 radius 38px bg #E9E9E9) */}
                <button
                  type="button"
                  onClick={() => setShowOrderDetailsModal(true)}
                  className="w-full h-[55px] rounded-[38px] bg-[#E9E9E9] hover:bg-[#dedede] text-black font-medium text-[16px] leading-[140%] flex items-center justify-center gap-2 transition-colors cursor-pointer mt-4"
                >
                  <span>{isArabic ? 'عرض التفاصيل' : 'View Details'}</span>
                  <img src="/icons/weui_arrow-outlined.svg" alt="" className="w-2.5 h-4 object-contain rtl:rotate-180" />
                </button>
              </div>
            ) : (
              /* No Active Order Clean Card */
              <div className="bg-white rounded-[16px] p-6 shadow-2xs border border-[#F4F4F5] text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#eef7f4] border border-emerald-100/80 flex items-center justify-center mx-auto text-[#026F4F]">
                  <Clock className="w-8 h-8 text-[#026F4F]" />
                </div>

                <div>
                  <h2 className="font-semibold text-base sm:text-lg text-[#2D2F33] tracking-tight">
                    {isArabic ? 'لا توجد طلبات جارية' : 'No Active Order'}
                  </h2>
                  <p className="text-xs text-zinc-400 font-normal mt-1 max-w-xs mx-auto">
                    {isArabic
                      ? 'قم بتقديم طلب وسظهر تتبعه المباشر هنا!'
                      : 'Place an order to track its real-time preparation here!'}
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-8 py-3 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-medium text-sm tracking-wide shadow-md active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center"
                  >
                    {isArabic ? 'تصفح القائمة' : 'Browse Menu'}
                  </button>
                </div>
              </div>
            )}

            {/* Floating Call a Waiter Action Button with Tooltip (Figma-Exact Frame 99:27) */}
            <div
              onMouseEnter={waiterTooltip.onMouseEnter}
              onMouseLeave={waiterTooltip.onMouseLeave}
              className="fixed bottom-6 right-4 sm:right-auto sm:left-1/2 sm:translate-x-[150px] rtl:sm:translate-x-[-150px] z-40 flex flex-col items-end gap-1.5 animate-in fade-in duration-300"
            >
              <div
                className={`bg-[#2D2F33] text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-md relative transition-all duration-500 origin-bottom after:content-[''] after:absolute after:top-full after:right-5 after:border-4 after:border-transparent after:border-t-[#2D2F33] select-none ${
                  waiterTooltip.show
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-90 translate-y-1 pointer-events-none'
                }`}
              >
                {isArabic ? 'استدعاء النادل' : 'Call a Waiter'}
              </div>
              <button
                type="button"
                onClick={() => {
                  waiterTooltip.dismiss();
                  onCallWaiter?.();
                }}
                className="w-[50px] h-[50px] rounded-full bg-[#F6A743] hover:bg-[#e09230] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
                aria-label="Call a Waiter"
              >
                <img src="/icons/solar_bell-bold.svg" alt="" className="w-6 h-6 object-contain" />
              </button>
            </div>

            {/* Footer Branding Line: POWERED BY EMSA7 (Figma-Exact) */}
            <div className="pt-10 pb-4 text-center select-none flex justify-center items-center">
              <a
                href="https://emsa7.com"
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity no-underline"
              >
                <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#989898] inline-flex items-center">
                  POWERED BY
                </span>
                <div className="inline-flex items-center justify-center my-auto shrink-0">
                  <SvgEmsa7Icon className="h-4.5 sm:h-5 w-auto" />
                </div>
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: CART ITEMS LIST (FIGMA-EXACT EMPTY & WITH ITEMS UI) */}
        {activeTab === 'cart' && (
          <div className="animate-in fade-in duration-200">
            {cart.length === 0 ? (
              /* EMPTY CART SCREEN MATCHING FIGMA DESIGN: Directly on background */
              <div className="space-y-6 pt-6">
                <div className="text-center space-y-4">
                  {/* SvgCartIcon Container: No box, exactly like Empty Cart.png */}
                  <div className="flex items-center justify-center mx-auto text-[#026F4F] py-2">
                    <SvgCartIcon className="w-16 h-16 text-[#026F4F]" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-lg text-[#2D2F33] tracking-tight">
                      {isArabic ? 'سلتك فارغة' : 'Your Cart is empty'}
                    </h2>
                    <p className="text-xs text-zinc-400 font-normal mt-1 max-w-xs mx-auto">
                      {isArabic ? 'أضف بعض الرامن اللذيذ للبدء!' : 'Add some delicious ramen to get started!'}
                    </p>
                  </div>

                  {/* Browse Menu Button */}
                  <div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-8 py-3 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-medium text-sm tracking-wide shadow-md active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center"
                    >
                      {isArabic ? 'تصفح القائمة' : 'Browse Menu'}
                    </button>
                  </div>
                </div>

                {/* 🔥 Try Our Popular Menu Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-base font-semibold text-[#2D2F33]">
                    <span className="text-base">🔥</span>
                    <span>{isArabic ? 'جرب قائمتنا الشهيرة' : 'Try Our Popular Menu'}</span>
                  </div>

                  {/* Popular Items Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {MOCK_MENU_ITEMS.filter((item) => item.isPopular).map((popItem) => (
                      <div
                        key={popItem.id}
                        className="bg-white rounded-[16px] p-3 border border-[#F4F4F5] shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all group"
                      >
                        <div className="space-y-2">
                          {/* Image Box */}
                          <div className="w-full aspect-[4/3] rounded-xl bg-[#F4F4F5] overflow-hidden relative p-1.5 flex items-center justify-center">
                            <img
                              src={popItem.imageUrl}
                              alt={popItem.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Item Title & Desc */}
                          <div>
                            <h3 className="font-semibold text-sm text-[#2D2F33] truncate">
                              {isArabic ? popItem.nameAr || popItem.name : popItem.name}
                            </h3>
                            <p className="text-[11px] text-[#8E8E93] font-normal line-clamp-1 mt-0.5">
                              {isArabic ? popItem.descriptionAr || popItem.description : popItem.description}
                            </p>
                          </div>
                        </div>

                        {/* Price & Add (+) Button */}
                        <div className="flex items-center justify-between pt-2 mt-1">
                          <span className="font-semibold text-sm text-[#026F4F]">
                            {formatPrice(popItem.price, activeLanguage)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onAddToCart && onAddToCart(popItem)}
                            className="w-7 h-7 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white flex items-center justify-center cursor-pointer shadow-xs active:scale-90 transition-all"
                            aria-label="Add item"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* CART WITH ITEMS SCREEN MATCHING FIGMA DESIGN */
              <div className="space-y-3">
                {/* Card 1: Order Summary (Items List) */}
                <div className="bg-white rounded-[16px] p-4 shadow-2xs border border-[#F4F4F5] space-y-3">
                  <h2 className="font-semibold text-base text-[#2D2F33]">
                    {isArabic ? 'ملخص الطلب' : 'Order Summary'}
                  </h2>

                  {/* Items List */}
                  <div className="space-y-3 divide-y divide-zinc-100">
                    {cart.map((ci, idx) => (
                      <div key={`${ci.item.id}-${idx}`} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                        <div
                          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                          onClick={() => setEditingCartIndex(idx)}
                        >
                          <div className="w-14 h-14 rounded-xl bg-[#F4F4F5] p-1.5 flex items-center justify-center shrink-0">
                            <img
                              src={ci.item.imageUrl}
                              alt={ci.item.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-[#2D2F33] truncate">
                              {isArabic ? ci.item.nameAr || ci.item.name : ci.item.name}
                            </h3>
                            <p className="text-xs text-[#8E8E93] font-normal truncate">
                              {ci.selectedOptions && ci.selectedOptions.length > 0
                                ? `"${ci.selectedOptions.map((o) => o.optionName).join(', ')}"`
                                : ci.specialInstructions
                                ? `"${ci.specialInstructions}"`
                                : '"No Sauce"'}
                            </p>
                            <span className="font-semibold text-sm text-[#026F4F] block mt-0.5">
                              {formatPrice(getCartItemTotalPrice(ci), activeLanguage)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <QuantityControl
                            quantity={ci.quantity}
                            onIncrement={() => onIncrement(idx as any)}
                            onDecrement={() => onDecrement(idx as any)}
                            size="sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* + Add More Items Button (Figma-Exact: Directly below Card 1 on background) */}
                <div className="pt-1 pb-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#026F4F] hover:text-[#025a40] transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>{isArabic ? 'إضافة المزيد من الأصناف' : 'Add More Items'}</span>
                  </button>
                </div>

                {/* Card 2: Order Summary (Financial breakdown matching Figma) */}
                <div className="bg-white rounded-[16px] p-4 shadow-2xs border border-[#F4F4F5] space-y-3">
                  <h2 className="font-semibold text-base text-[#2D2F33]">
                    {isArabic ? 'ملخص الطلب' : 'Order Summary'}
                  </h2>

                  <div className="space-y-2 text-sm font-normal">
                    <div className="flex justify-between text-[#8E8E93]">
                      <span>{isArabic ? `المجموع الفرعي (${totalCartCount} أصناف)` : `Subtotal (${totalCartCount}items)`}</span>
                      <span className="text-zinc-800 font-semibold">{formatPrice(subtotal, activeLanguage)}</span>
                    </div>

                    <div className="flex justify-between text-[#8E8E93]">
                      <span>{isArabic ? 'رسوم الخدمة (10%)' : 'Service Charge (10%)'}</span>
                      <span className="text-zinc-800 font-semibold">{formatPrice(Math.round(subtotal * 0.10 * 100) / 100, activeLanguage)}</span>
                    </div>
                  </div>

                  {/* Dashed Separator Line */}
                  <div className="border-b border-dashed border-[#E5E5EA] my-3" />

                  {/* Total Line */}
                  <div className="flex justify-between items-center font-semibold text-base pt-0.5">
                    <span className="text-[#2D2F33]">{isArabic ? 'المجموع' : 'Total'}</span>
                    <span className="text-[#026F4F] font-semibold text-lg">
                      {formatPrice(subtotal + Math.round(subtotal * 0.10 * 100) / 100, activeLanguage)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDER HISTORY (FIGMA SCREENSHOT 3 EXACT LAYOUT) */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-in fade-in duration-200 relative pb-16">
            {historyOrders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-[16px] p-4 sm:p-5 shadow-2xs border border-[#F4F4F5] space-y-4">
                {/* Header Row: #A102 and Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-base text-[#2D2F33]">{ord.id}</h3>
                    <p className="text-xs text-zinc-400 font-normal mt-0.5">{ord.date}</p>
                    {(ord.tipAmount ?? 0) > 0 && (
                      <p className="text-[10px] sm:text-xs text-[#026F4F] font-medium mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded-full border border-[#026F4F]/20">
                        {isArabic ? 'بما في ذلك إكرامية:' : 'Includes Tip:'} {formatPrice(ord.tipAmount || 0, activeLanguage)}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-base text-[#026F4F]">
                    {formatPrice(ord.total, activeLanguage)}
                  </span>
                </div>

                {/* Thumbnails Row with Quantity Badges & Fallback Images */}
                <div className="flex items-center gap-3 sm:gap-4 py-1">
                  {ord.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="relative w-[59px] h-[64px] rounded-[5px] bg-[#F1F1F1] p-1 flex items-center justify-center shrink-0"
                    >
                      <img
                        src={it.image || '/images/food/ramen.png'}
                        alt={it.name}
                        className="w-[45px] h-[45px] object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/food/ramen.png';
                        }}
                      />
                      <span className="absolute -top-2 -right-2 text-[10px] sm:text-xs font-semibold px-2 py-0.5 bg-white shadow-xs border border-zinc-200 rounded-full text-zinc-800 z-10">
                        x{it.qty}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Button: Full-Width Reorder > matching Figma */}
                <div className="pt-1">
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
                    className="w-full py-3.5 px-4 rounded-full bg-[#eef0f2] hover:bg-zinc-200 text-zinc-800 font-medium text-xs sm:text-sm md:text-base tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{isArabic ? 'إعادة الطلب' : 'Reorder'}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-500 rtl:rotate-180 shrink-0" />
                  </button>
                </div>
              </div>
            ))}

            {/* Floating Call a Waiter Action Button with Tooltip (Figma-Exact) */}
            <div
              onMouseEnter={waiterTooltip.onMouseEnter}
              onMouseLeave={waiterTooltip.onMouseLeave}
              className="fixed bottom-6 right-4 sm:right-auto sm:left-1/2 sm:translate-x-[150px] rtl:sm:translate-x-[-150px] z-40 flex flex-col items-end gap-1.5 animate-in fade-in duration-300"
            >
              <div
                className={`bg-[#2D2F33] text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-md relative transition-all duration-500 origin-bottom after:content-[''] after:absolute after:top-full after:right-5 after:border-4 after:border-transparent after:border-t-[#2D2F33] select-none ${
                  waiterTooltip.show
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-90 translate-y-1 pointer-events-none'
                }`}
              >
                {isArabic ? 'استدعاء النادل' : 'Call a Waiter'}
              </div>
              <button
                type="button"
                onClick={() => {
                  waiterTooltip.dismiss();
                  onCallWaiter?.();
                }}
                className="w-[50px] h-[50px] rounded-full bg-[#F6A743] hover:bg-[#e09230] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
                aria-label="Call a Waiter"
              >
                <img src="/icons/solar_bell-bold.svg" alt="" className="w-6 h-6 object-contain" />
              </button>
            </div>

            {/* Footer Branding Line: POWERED BY EMSA7 */}
            <div className="pt-10 pb-4 text-center select-none flex justify-center items-center">
              <a
                href="https://emsa7.com"
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity no-underline"
              >
                <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#989898] inline-flex items-center">
                  POWERED BY
                </span>
                <div className="inline-flex items-center justify-center my-auto shrink-0">
                  <SvgEmsa7Icon className="h-4.5 sm:h-5 w-auto" />
                </div>
              </a>
            </div>
          </div>
        )}
      </div>



      {/* Sticky Bottom Action Bar when Cart Has Items */}
      {activeTab === 'cart' && cart.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 z-40 bg-[#f4f4f5]/90 backdrop-blur-md border-t border-zinc-200/60 py-3 sm:py-4 px-4">
          <div className="w-full max-w-[440px] mx-auto">
            <button
              type="button"
              onClick={() => setShowCheckoutModal(true)}
              className="w-full py-4 px-6 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-semibold text-sm sm:text-base tracking-wide shadow-md flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
            >
              <span>{isArabic ? 'متابعة الشراء' : 'Continue to Checkout'}</span>
              <span className="font-semibold text-base sm:text-lg">
                {formatPrice(grandTotal, activeLanguage)}
              </span>
            </button>
          </div>
        </div>
      )}

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
        order={ongoingOrder}
      />

      {/* Order Confirmed Screen Modal */}
      <OrderConfirmedScreen
        isOpen={showOrderConfirmedModal}
        onClose={() => setShowOrderConfirmedModal(false)}
        onBackToMenu={() => {
          setShowOrderConfirmedModal(false);
          onClose();
        }}
        onTrackOrder={() => {
          setShowOrderConfirmedModal(false);
          setActiveTab('ongoing');
        }}
        cart={confirmedCart.length > 0 ? confirmedCart : cart}
        subtotal={confirmedSubtotal || subtotal}
        serviceCharge={confirmedSubtotal ? confirmedSubtotal * 0.1 : serviceCharge}
        vat={confirmedSubtotal ? confirmedSubtotal * 0.05 : subtotal * 0.05}
        tipAmount={confirmedTipAmount}
        splitFee={confirmedSplitFee}
        discount={confirmedDiscount}
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
        onOrderSuccess={(details) => {
          const now = new Date();
          const timeStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          const newId = `#A${Math.floor(100 + Math.random() * 900)}`;

          const newOrder: StoredOrder = {
            id: newId,
            date: timeStr,
            total: details.grandTotal,
            subtotal: details.subtotal,
            tipAmount: details.tipAmount,
            splitFee: details.splitFee,
            discount: details.discount,
            status: 'Preparing',
            isPaid: true,
            items: details.selectedCart.map((ci) => ({
              name: ci.item.name,
              qty: ci.quantity,
              image: ci.item.imageUrl || '/images/food/ramen.png',
              price: ci.item.price,
            })),
            cartItems: [...details.selectedCart],
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

          // Deduct paid items from the global cart
          if (onDeductPaidItems) {
            onDeductPaidItems(details.selectedCart);
          }

          setConfirmedCart([...details.selectedCart]);
          setConfirmedGrandTotal(details.grandTotal);
          setConfirmedTipAmount(details.tipAmount);
          setConfirmedSplitFee(details.splitFee);
          setConfirmedDiscount(details.discount);
          setConfirmedSubtotal(details.subtotal);
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
          subtotal={selectedInvoiceOrder.subtotal}
          serviceCharge={selectedInvoiceOrder.serviceCharge}
          vat={selectedInvoiceOrder.vat}
          tipAmount={selectedInvoiceOrder.tipAmount ?? 0}
          splitFee={selectedInvoiceOrder.splitFee ?? 0}
          discount={selectedInvoiceOrder.discount}
          total={selectedInvoiceOrder.total}
          language={activeLanguage}
        />
      )}
    </div>
  );
};
