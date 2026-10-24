import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Clock, Plus, Trash2, Check } from 'lucide-react';
import { type CartItem, formatPrice, formatOrderDate, MOCK_MENU_ITEMS, type MenuItem, type SelectedOption, getCartSubtotal, getCartItemTotalPrice } from '@/types/menu';
import { OrderDetailsScreen } from '@/components/cart/OrderDetailsScreen';
import { PaymentScreen } from '@/components/cart/PaymentScreen';
import { OrderConfirmedScreen } from '@/components/cart/OrderConfirmedScreen';
import { EInvoiceModal } from '@/components/cart/EInvoiceModal';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { useLanguage } from '@/providers/LanguageContext';
import { QuantityControl } from '@/components/food/QuantityControl';
import SvgCartIcon from '@/components/ui/svg-icons/CartSvg';
import SvgPlacedIcon from '@/components/ui/svg-icons/PlacedSvg';
import SvgChairIcon from '@/components/ui/svg-icons/ChairSvg';
import PromoBadgeSvg from '@/components/ui/svg-icons/PromoBadgeSvg';
import { useWaiterTooltip } from '@/hooks/useWaiterTooltip';
import { useWaiterCooldown } from '@/hooks/useWaiterCooldown';
import { PoweredByFooter } from '@/components/common/PoweredByFooter';

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
    nameAr?: string;
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
  onIncrement: (itemId: any) => void;
  onDecrement: (itemId: any) => void;
  onRemove: (itemId: any) => void;
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingFor, setPayingFor] = useState<'cart' | 'ongoing'>('cart');
  const waiterTooltip = useWaiterTooltip();
  const { isCooldown, formattedTime } = useWaiterCooldown();

  React.useEffect(() => {
    if (isOpen) {
      if (initialShowCheckout) {
        setActiveTab('cart');
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
        { name: 'Shoyu Ramen', nameAr: 'شويو رامن', qty: 2, image: '/images/food/ramen.png', price: 15.99 },
        { name: 'Iced Green Tea', nameAr: 'شاي أخضر مثلج', qty: 1, image: '/images/food/iced-tea.png', price: 15.99 },
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
        { name: 'Shoyu Ramen', nameAr: 'شويو رامن', qty: 1, image: '/images/food/ramen.png', price: 15.99 },
        { name: 'Gyoza', nameAr: 'جيوزا', qty: 1, image: '/images/food/gyoza.png', price: 15.99 },
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
    isPaid: true,
    items: [
      { name: 'Shoyu Ramen', nameAr: 'شويو رامن', qty: 2, image: '/images/food/ramen.png', price: 15.99 },
      { name: 'Iced Green Tea', nameAr: 'شاي أخضر مثلج', qty: 1, image: '/images/food/iced-tea.png', price: 15.99 },
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

  // Split check & checkout states
  const [isSplitCheck, setIsSplitCheck] = useState(false);

  // Expand cart items into individual single-unit items when split check is ON
  const expandedSplitItems = React.useMemo(() => {
    const items: { splitId: string; cartItem: CartItem; singlePrice: number }[] = [];
    cart.forEach((ci, cartIdx) => {
      const singlePrice = getCartItemTotalPrice(ci) / ci.quantity;
      for (let i = 0; i < ci.quantity; i++) {
        items.push({
          splitId: `${ci.item.id}-${cartIdx}-${i}`,
          cartItem: ci,
          singlePrice,
        });
      }
    });
    return items;
  }, [cart]);

  const [selectedSplitIds, setSelectedSplitIds] = useState<Set<string>>(new Set());

  const handleToggleSplitCheck = () => {
    if (!isSplitCheck) {
      setSelectedSplitIds(new Set(expandedSplitItems.map((item) => item.splitId)));
    }
    setIsSplitCheck((prev) => !prev);
  };

  const toggleSplitItem = (splitId: string) => {
    setSelectedSplitIds((prev) => {
      const next = new Set(prev);
      if (next.has(splitId)) {
        next.delete(splitId);
      } else {
        next.add(splitId);
      }
      return next;
    });
  };

  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'none' | 'applied' | 'error'>('none');

  const [selectedTip, setSelectedTip] = useState<'0' | '10' | '15' | 'custom' | null>(null);
  const [customTipAmount, setCustomTipAmount] = useState<string>('');

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME20') {
      setPromoStatus('applied');
    } else if (code.length > 0) {
      setPromoStatus('error');
    }
  };

  const { selectedCart, paidItems: _paidItems } = React.useMemo(() => {
    if (!isSplitCheck) {
      return {
        selectedCart: cart,
        paidItems: cart.map((ci, idx) => ({ originalIndex: idx, quantity: ci.quantity })),
      };
    }
    const itemsToPay = expandedSplitItems.filter((item) => selectedSplitIds.has(item.splitId));

    // Group back by cartItem reference
    const grouped = new Map<CartItem, number>();
    for (const splitItem of itemsToPay) {
      grouped.set(splitItem.cartItem, (grouped.get(splitItem.cartItem) || 0) + 1);
    }

    const paidItemsInfo = Array.from(grouped.entries()).map(([ci, qty]) => ({
      originalIndex: cart.indexOf(ci),
      quantity: qty,
    }));

    const selectedCartArray = Array.from(grouped.entries()).map(([ci, qty]) => ({
      ...ci,
      quantity: qty,
    }));

    return { selectedCart: selectedCartArray, paidItems: paidItemsInfo };
  }, [isSplitCheck, expandedSplitItems, selectedSplitIds, cart]);

  if (!isOpen) return null;

  const isArabic = activeLanguage === 'ARABIC';

  const subtotal = isSplitCheck
    ? expandedSplitItems
        .filter((item) => selectedSplitIds.has(item.splitId))
        .reduce((sum, item) => sum + item.singlePrice, 0)
    : getCartSubtotal(cart);

  const activeItemCount = isSplitCheck
    ? expandedSplitItems.filter((item) => selectedSplitIds.has(item.splitId)).length
    : cart.reduce((sum, item) => sum + item.quantity, 0);

  const serviceCharge = Math.round(subtotal * 0.10 * 100) / 100;
  const vat = Math.round(subtotal * 0.05 * 100) / 100;

  let tipAmount = 0;
  if (selectedTip === '10') tipAmount = 10;
  else if (selectedTip === '15') tipAmount = 15;
  else if (selectedTip === 'custom') tipAmount = parseFloat(customTipAmount) || 0;

  const splitFee = 0;
  const discount = promoStatus === 'applied' ? Math.round(subtotal * 0.20 * 100) / 100 : 0;
  const grandTotal = Math.max(0, subtotal + serviceCharge + vat + tipAmount + splitFee - discount);

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#F4F4F5] antialiased select-none flex flex-col h-[100dvh] w-full overflow-hidden font-sans"
    >
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 w-full">
        <div className="w-full max-w-[440px] mx-auto px-4 pt-4 pb-8 space-y-5">
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
                ? 'bg-white text-[#026F4F] shadow-xs font-medium'
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
                ? 'bg-white text-[#026F4F] shadow-xs font-medium'
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
                ? 'bg-white text-[#026F4F] shadow-xs font-medium'
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
                      <bdi dir="ltr">{ongoingOrder.id}</bdi>
                    </h2>
                    <p className="text-[14px] text-[#989898] font-normal mt-0.5 leading-[140%]">
                      {formatOrderDate(ongoingOrder.date, activeLanguage)}
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
                        alt={isArabic ? it.nameAr || it.name : it.name}
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
                  waiterTooltip.show || isCooldown
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-90 translate-y-1 pointer-events-none'
                }`}
              >
                {isCooldown
                  ? isArabic
                    ? `يرجى الانتظار (${formattedTime})`
                    : `Please wait (${formattedTime})`
                  : isArabic
                  ? 'استدعاء النادل'
                  : 'Call a Waiter'}
              </div>
              <button
                type="button"
                disabled={isCooldown}
                onClick={() => {
                  if (isCooldown) return;
                  waiterTooltip.dismiss();
                  onCallWaiter?.();
                }}
                className={`w-[50px] h-[50px] rounded-full text-white flex items-center justify-center shadow-lg transition-all ${
                  isCooldown
                    ? 'bg-zinc-400 cursor-not-allowed opacity-85'
                    : 'bg-[#F6A743] hover:bg-[#e09230] active:scale-95 cursor-pointer'
                }`}
                aria-label={isCooldown ? `Wait ${formattedTime}` : 'Call a Waiter'}
              >
                <img src="/icons/solar_bell-bold.svg" alt="" className="w-6 h-6 object-contain" />
              </button>
            </div>

            {/* Footer Branding Line: POWERED BY EMSA7 */}
            <PoweredByFooter className="pt-10 pb-4" />
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
                    <h2 className="text-[19px] font-medium text-[#2D2F33] leading-[140%] text-center">
                      {isArabic ? 'سلتك فارغة' : 'Your Cart is empty'}
                    </h2>
                    <p className="text-[13px] font-normal text-[#989898] leading-[140%] text-center mt-1">
                      {isArabic ? 'أضف بعض الرامن اللذيذ للبدء!' : 'Add some delicious ramen to get started!'}
                    </p>
                  </div>

                  {/* Browse Menu Button (Figma Exact: 202px x 59px, radius 30px, bg #026F4F, 16px medium white) */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-[202px] h-[59px] rounded-[30px] bg-[#026F4F] hover:bg-[#025a40] text-white font-medium text-[16px] leading-[140%] shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center text-center"
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
              /* UNIFIED CART & CHECKOUT SCREEN */
              <div className="space-y-4">
                {/* 1. Dining Location Green Banner Box with SvgChairIcon */}
                <div className="bg-[#026F4F] rounded-[16px] p-4 flex items-center gap-3.5 text-white shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-xs">
                    <SvgChairIcon className="w-7 h-7 text-[#026F4F]" />
                  </div>
                  <div>
                    <p className="text-emerald-100 text-[13px] font-normal leading-[140%]">
                      {isArabic ? 'تناول الطعام في' : 'Dining at'}
                    </p>
                    <h2 className="text-white text-[18px] font-semibold tracking-tight leading-snug">
                      {_tableName}
                    </h2>
                    <p className="text-emerald-100/80 text-[12px] font-normal leading-[140%]">
                      {isArabic ? 'بجانب النافذة، الطابق الثاني' : 'Window Side, Floor 2'}
                    </p>
                  </div>
                </div>

                {/* 2. Split Check Toggle Card */}
                <div className="bg-white rounded-[13px] p-4 border border-[#E9E9E9] flex items-center justify-between shadow-2xs">
                  <span className="font-semibold text-[15px] text-[#2D2F33] leading-[140%]">
                    {isArabic ? 'تقسيم الفاتورة' : 'Split Check'}
                  </span>

                  <button
                    type="button"
                    onClick={handleToggleSplitCheck}
                    aria-label="Toggle Split Check"
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer p-0.5 ${
                      isSplitCheck ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                        isSplitCheck ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Order Summary Card */}
                <div className="bg-white rounded-[13px] p-4 shadow-2xs border border-[#E9E9E9] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[17px] font-semibold text-[#2D2F33] leading-[140%]">
                      {isArabic ? 'ملخص الطلب' : 'Order Summary'}
                    </h2>
                    {!isSplitCheck && onClearCart && (
                      <button
                        type="button"
                        onClick={onClearCart}
                        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#E53935] hover:text-[#C62828] hover:bg-red-50/80 px-2.5 py-1 rounded-full transition-colors cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>{isArabic ? 'مسح السلة' : 'Clear'}</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3.5 divide-y divide-zinc-100">
                    {isSplitCheck
                      ? expandedSplitItems.map((splitItem) => {
                          const isChecked = selectedSplitIds.has(splitItem.splitId);
                          const ci = splitItem.cartItem;

                          return (
                            <div
                              key={splitItem.splitId}
                              onClick={() => toggleSplitItem(splitItem.splitId)}
                              className="pt-3 first:pt-0 flex items-center justify-between gap-3 cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                                    isChecked
                                      ? 'bg-[#026F4F] text-white'
                                      : 'border border-zinc-400 bg-white'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>

                                <div className="w-[56px] h-[56px] rounded-[7px] bg-[#F1F1F1] p-1 flex items-center justify-center shrink-0">
                                  <img
                                    src={ci.item.imageUrl || '/images/food/ramen.png'}
                                    alt={ci.item.name}
                                    className="w-[44px] h-[44px] object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/images/food/ramen.png';
                                    }}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-[15px] text-[#2D2F33] truncate leading-[140%]">
                                    {isArabic ? ci.item.nameAr || ci.item.name : ci.item.name}
                                  </h3>
                                  <p className="text-[11px] text-[#989898] font-normal truncate leading-[140%]">
                                    {ci.selectedOptions && ci.selectedOptions.length > 0
                                      ? `“${ci.selectedOptions.map((so) => (isArabic && so.optionNameAr ? so.optionNameAr : so.optionName)).join(', ')}”`
                                      : ci.specialInstructions
                                      ? `“${ci.specialInstructions}”`
                                      : (isArabic ? '“بدون صلصة”' : '“No Sauce”')}
                                  </p>
                                  <span className="text-[11px] font-semibold text-[#2D2F33] block mt-0.5">
                                    {isArabic ? '1x' : 'x1'}
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0">
                                <span className="font-semibold text-[16px] text-[#026F4F]">
                                  {formatPrice(splitItem.singlePrice, activeLanguage)}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      : cart.map((ci, idx) => (
                          <div
                            key={`${ci.item.id}-${idx}`}
                            className="pt-3.5 first:pt-0 flex items-center justify-between gap-3"
                          >
                            <div
                              className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                              onClick={() => setEditingCartIndex(idx)}
                            >
                              <div className="w-[56px] h-[56px] rounded-[7px] bg-[#F1F1F1] p-1 flex items-center justify-center shrink-0">
                                <img
                                  src={ci.item.imageUrl || '/images/food/ramen.png'}
                                  alt={ci.item.name}
                                  className="w-[44px] h-[44px] object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/food/ramen.png';
                                  }}
                                />
                              </div>

                              <div className="min-w-0">
                                <h3 className="font-semibold text-[15px] text-[#2D2F33] truncate leading-[140%]">
                                  {isArabic ? ci.item.nameAr || ci.item.name : ci.item.name}
                                </h3>
                                <p className="text-[11px] text-[#989898] font-normal truncate leading-[140%]">
                                  {ci.selectedOptions && ci.selectedOptions.length > 0
                                    ? `“${ci.selectedOptions.map((o) => (isArabic && o.optionNameAr ? o.optionNameAr : o.optionName)).join(', ')}”`
                                    : ci.specialInstructions
                                    ? `“${ci.specialInstructions}”`
                                    : (isArabic ? '“بدون صلصة”' : '“No Sauce”')}
                                </p>
                                <span className="text-[16px] font-semibold text-[#026F4F] block mt-0.5">
                                  {formatPrice(getCartItemTotalPrice(ci), activeLanguage)}
                                </span>
                              </div>
                            </div>

                            <div>
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
                </div>

                {/* + Add More Items Button */}
                <div className="py-0.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-[12.7px] font-medium text-[#026F4F] hover:text-[#025a40] transition-colors cursor-pointer"
                  >
                    <img src="/icons/tabler_plus-filled.svg" alt="" className="w-[19px] h-[19px] object-contain" />
                    <span>{isArabic ? 'إضافة المزيد من الأصناف' : 'Add More Items'}</span>
                  </button>
                </div>

                {/* 4. Promo Code Card */}
                {promoStatus === 'applied' ? (
                  <div className="bg-[#EAF5F0] rounded-[10px] h-[61px] px-4 border border-[#D4EBE0] flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <PromoBadgeSvg className="w-6 h-6 text-[#026F4F] shrink-0" />
                      <span className="font-semibold text-[15px] text-[#026F4F] tracking-wider uppercase">
                        {promoCode || 'WELCOME20'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoStatus('none');
                        setPromoCode('');
                      }}
                      className="cursor-pointer"
                      title="Remove promo code"
                    >
                      <img src="/icons/icon-park-solid_check-one.svg" alt="" className="w-6 h-6 object-contain" />
                    </button>
                  </div>
                ) : promoStatus === 'error' ? (
                  <div className="bg-[#FDF0F0] rounded-[10px] h-[61px] px-4 border border-[#FADBD8] flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <PromoBadgeSvg className="w-6 h-6 text-[#D72929] shrink-0" />
                      <span className="font-semibold text-[15px] text-[#D72929] tracking-wider uppercase">
                        {promoCode || 'WELCOME20'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoStatus('none');
                        setPromoCode('');
                      }}
                      className="cursor-pointer"
                      title="Clear"
                    >
                      <img src="/icons/gridicons_cross-circle.svg" alt="" className="w-6 h-6 object-contain" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-[10px] h-[61px] px-3.5 border border-[#E9E9E9] shadow-2xs flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <PromoBadgeSvg className="w-6 h-6 text-[#989898] shrink-0" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder={isArabic ? 'أدخل رمز العرض' : 'ENTER PROMO CODE'}
                        className="flex-1 bg-transparent py-1.5 text-[15px] text-zinc-800 placeholder:text-[#989898] placeholder:font-medium font-medium uppercase outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="w-[71px] h-[42px] rounded-[7px] bg-[#026F4F] hover:bg-[#025a40] text-white text-[15px] font-medium transition-colors cursor-pointer shrink-0 shadow-xs active:scale-95 flex items-center justify-center"
                    >
                      {isArabic ? 'تطبيق' : 'APPLY'}
                    </button>
                  </div>
                )}

                {/* 5. Add a Tip Card */}
                <div className="bg-white rounded-[13px] p-4 border border-[#E9E9E9] space-y-3 shadow-2xs">
                  <span className="font-semibold text-[15px] text-[#2D2F33] block leading-[140%]">
                    {isArabic ? 'إضافة إكرامية' : 'Add a Tip'}
                  </span>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: '0', label: isArabic ? '0 ج.م' : '0 EGP' },
                      { id: '10', label: isArabic ? '10 ج.م' : '10 EGP' },
                      { id: '15', label: isArabic ? '15 ج.م' : '15 EGP' },
                      { id: 'custom', label: isArabic ? 'مخصص' : 'Custom' },
                    ].map((tip) => (
                      <button
                        key={tip.id}
                        type="button"
                        onClick={() => setSelectedTip(tip.id as any)}
                        className={`py-2.5 px-1 sm:px-2 rounded-full text-[13px] border transition-all cursor-pointer text-center ${
                          selectedTip === tip.id
                            ? 'bg-[#026F4F] border-[#026F4F] text-white font-semibold shadow-xs'
                            : 'bg-white border-[#E5E5EA] text-[#2D2F33] font-medium hover:bg-zinc-50'
                        }`}
                      >
                        {tip.label}
                      </button>
                    ))}
                  </div>

                  {selectedTip === 'custom' && (
                    <input
                      type="number"
                      value={customTipAmount}
                      onChange={(e) => setCustomTipAmount(e.target.value)}
                      placeholder={isArabic ? 'مبلغ الإكرامية (ج.م)' : 'Enter tip amount (EGP)'}
                      className="w-full bg-[#f4f4f5] border border-zinc-200/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 font-medium focus:outline-none focus:border-[#026F4F] focus:bg-white transition-all mt-2"
                    />
                  )}

                  {/* Highest tip today note */}
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#989898] pt-0.5">
                    <span className="text-[#FF4D4F] font-semibold">*</span>
                    <span>
                      {isArabic
                        ? 'أعلى إكرامية اليوم كانت 10.00 ج.م'
                        : 'Highest tip today was 10.00 EGP'}
                    </span>
                  </div>
                </div>

                {/* 6. Payments Details Card */}
                <div className="bg-white rounded-[13px] p-4 shadow-2xs border border-[#E9E9E9] space-y-3">
                  <h2 className="text-[17px] font-semibold text-[#2D2F33] leading-[140%]">
                    {isArabic ? 'تفاصيل الدفع' : 'Payments Details'}
                  </h2>

                  <div className="space-y-2 text-[14px] font-medium">
                    <div className="flex justify-between text-[#8E8E93]">
                      <span>{isArabic ? `المجموع الفرعي (${activeItemCount} أصناف)` : `Subtotal (${activeItemCount}Items)`}</span>
                      <span className="text-[#2D2F33] font-medium">{formatPrice(subtotal, activeLanguage)}</span>
                    </div>

                    <div className="flex justify-between text-[#8E8E93]">
                      <span>{isArabic ? 'رسوم الخدمة (10%)' : 'Service Charge (10%)'}</span>
                      <span className="text-[#2D2F33] font-medium">{formatPrice(serviceCharge, activeLanguage)}</span>
                    </div>

                    <div className="flex justify-between text-[#8E8E93]">
                      <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'VAT (5%)'}</span>
                      <span className="text-[#2D2F33] font-medium">{formatPrice(vat, activeLanguage)}</span>
                    </div>

                    {tipAmount > 0 && (
                      <div className="flex justify-between text-[#8E8E93]">
                        <span>{isArabic ? 'الإكرامية' : 'Tips'}</span>
                        <span className="text-[#2D2F33] font-medium">{formatPrice(tipAmount, activeLanguage)}</span>
                      </div>
                    )}

                    {isSplitCheck && (
                      <div className="flex justify-between text-[#FF6B6B] font-medium">
                        <span>{isArabic ? 'رسوم التقسيم' : 'Splitting Fees'}</span>
                        <span>{formatPrice(splitFee || 0, activeLanguage)}</span>
                      </div>
                    )}

                    {promoStatus === 'applied' && (
                      <div className="flex justify-between text-[#026F4F] font-medium">
                        <span>{isArabic ? 'خصم العرض (20%)' : 'Promo Discount'}</span>
                        <span className="font-semibold">-{formatPrice(discount, activeLanguage)}</span>
                      </div>
                    )}
                  </div>

                  {/* Dashed Separator Line */}
                  <div className="border-b border-dashed border-[#E5E5EA] my-2" />

                  {/* Total Line */}
                  <div className="flex justify-between items-center font-semibold text-[17px] pt-0.5">
                    <span className="text-[#2D2F33]">{isArabic ? 'المجموع' : 'Total'}</span>
                    <span className="text-[#026F4F] font-semibold text-[18px]">
                      {formatPrice(grandTotal, activeLanguage)}
                    </span>
                  </div>
                </div>

                {/* Footer Branding Line: POWERED BY EMSA7 */}
                <PoweredByFooter className="pt-8 pb-4" />
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDER HISTORY (FIGMA NODE 112:1243 EXACT LAYOUT) */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-in fade-in duration-200 relative pb-16">
            {historyOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-[13px] p-4.5 sm:p-5 shadow-2xs border border-[#F1F1F1] space-y-4"
              >
                {/* Header Row: #A102 and Price */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2
                      onClick={() => setSelectedInvoiceOrder(ord)}
                      className="text-[23px] font-semibold text-[#2D2F33] hover:text-[#026F4F] tracking-tight leading-[140%] cursor-pointer transition-colors"
                      title={isArabic ? 'عرض تفاصيل الطلب والإيصال' : 'Click to view order receipt'}
                    >
                      <bdi dir="ltr">{ord.id}</bdi>
                    </h2>
                    <p className="text-[13px] text-[#989898] font-normal mt-0.5 leading-[140%]">
                      {formatOrderDate(ord.date, activeLanguage)}
                    </p>
                    {(ord.tipAmount ?? 0) > 0 && (
                      <p className="text-[11px] text-[#026F4F] font-medium mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded-full border border-[#026F4F]/20">
                        {isArabic ? 'بما في ذلك إكرامية:' : 'Includes Tip:'} {formatPrice(ord.tipAmount || 0, activeLanguage)}
                      </p>
                    )}
                  </div>
                  <span className="text-[22px] font-semibold text-[#026F4F] leading-[140%]">
                    {formatPrice(ord.total, activeLanguage)}
                  </span>
                </div>

                {/* Thumbnails Row with Prominent White Circular Badges matching Figma Frame 1171277079 (59x64 box, rounded-[5px], x2/x1 badge) */}
                <div className="flex items-center gap-3 pt-1 pb-1">
                  {ord.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="relative w-[59px] h-[64px] rounded-[5px] bg-[#F1F1F1] shrink-0 p-1 flex items-center justify-center"
                    >
                      <img
                        src={it.image || '/images/food/ramen.png'}
                        alt={isArabic ? it.nameAr || it.name : it.name}
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

                {/* Reorder Button: Option A - Pill button with thin letters, cleanly underlined text, and clear clickable hover/tap styling per Client Note */}
                <button
                  type="button"
                  onClick={() => {
                    if (onReorder && ord.cartItems && ord.cartItems.length > 0) {
                      onReorder(ord.cartItems);
                    } else {
                      const itemsToReorder: CartItem[] = ord.items.map((it) => {
                        const matched =
                          MOCK_MENU_ITEMS.find((m) => m.name.toLowerCase() === it.name.toLowerCase()) ||
                          MOCK_MENU_ITEMS[0];
                        return { item: matched, quantity: it.qty };
                      });
                      if (onReorder) {
                        onReorder(itemsToReorder);
                      } else {
                        onClearCart?.();
                        itemsToReorder.forEach((ci) => onAddToCart?.(ci.item));
                      }
                    }
                    setActiveTab('cart');
                  }}
                  className="w-full h-[55px] rounded-[38px] bg-[#E9E9E9] hover:bg-[#dedede] text-black text-[16px] leading-[140%] flex items-center justify-center gap-2 transition-all cursor-pointer mt-3 active:scale-[0.99] group"
                >
                  <span className="font-normal underline underline-offset-4 decoration-black/60 group-hover:decoration-black">
                    {isArabic ? 'إعادة الطلب' : 'Reorder'}
                  </span>
                  <img
                    src="/icons/weui_arrow-outlined.svg"
                    alt=""
                    className="w-2.5 h-4 object-contain rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform"
                  />
                </button>
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
                  waiterTooltip.show || isCooldown
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-90 translate-y-1 pointer-events-none'
                }`}
              >
                {isCooldown
                  ? isArabic
                    ? `يرجى الانتظار (${formattedTime})`
                    : `Please wait (${formattedTime})`
                  : isArabic
                  ? 'استدعاء النادل'
                  : 'Call a Waiter'}
              </div>
              <button
                type="button"
                disabled={isCooldown}
                onClick={() => {
                  if (isCooldown) return;
                  waiterTooltip.dismiss();
                  onCallWaiter?.();
                }}
                className={`w-[50px] h-[50px] rounded-full text-white flex items-center justify-center shadow-lg transition-all ${
                  isCooldown
                    ? 'bg-zinc-400 cursor-not-allowed opacity-85'
                    : 'bg-[#F6A743] hover:bg-[#e09230] active:scale-95 cursor-pointer'
                }`}
                aria-label={isCooldown ? `Wait ${formattedTime}` : 'Call a Waiter'}
              >
                <img src="/icons/solar_bell-bold.svg" alt="" className="w-6 h-6 object-contain" />
              </button>
            </div>

            {/* Footer Branding Line: POWERED BY EMSA7 */}
            <PoweredByFooter className="pt-10 pb-4" />
          </div>
        )}
        </div>
      </div>

      {/* Pinned Bottom Action Bar when Cart Has Items */}
      {activeTab === 'cart' && cart.length > 0 && (
        <div className="shrink-0 bg-[#F4F4F5]/95 backdrop-blur-md border-t border-zinc-200/60 py-3.5 px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom))]">
          <div className="w-full max-w-[409px] mx-auto">
            <button
              type="button"
              onClick={() => {
                setPayingFor('cart');
                setShowPaymentModal(true);
              }}
              className="w-full h-[59px] rounded-[30px] bg-[#026F4F] hover:bg-[#025a40] text-white px-6 shadow-md flex items-center justify-between cursor-pointer transition-transform active:scale-[0.99]"
            >
              <span className="text-[16px] font-normal leading-[140%]">
                {isArabic ? 'متابعة للدفع' : 'Continue to Payment'}
              </span>
              <span className="text-[16px] font-semibold leading-[140%]">
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
        onPayNow={() => {
          setShowOrderDetailsModal(false);
          setPayingFor('ongoing');
          setShowPaymentModal(true);
        }}
        onAddItems={() => {
          setShowOrderDetailsModal(false);
          onClose();
        }}
        language={activeLanguage}
        orderId={ongoingOrder?.id || '#A102'}
        order={ongoingOrder}
      />

      {/* Payment Screen Modal */}
      <PaymentScreen
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cart={
          payingFor === 'ongoing'
            ? ongoingOrder?.cartItems && ongoingOrder.cartItems.length > 0
              ? ongoingOrder.cartItems
              : [
                  { item: MOCK_MENU_ITEMS[0], quantity: 2 },
                  { item: MOCK_MENU_ITEMS[1] || MOCK_MENU_ITEMS[0], quantity: 1 },
                ]
            : selectedCart
        }
        subtotal={payingFor === 'ongoing' ? (ongoingOrder?.subtotal || subtotal) : subtotal}
        serviceCharge={payingFor === 'ongoing' ? (ongoingOrder?.serviceCharge || serviceCharge) : serviceCharge}
        vat={payingFor === 'ongoing' ? (ongoingOrder?.vat || vat) : vat}
        tipAmount={payingFor === 'ongoing' ? (ongoingOrder?.tipAmount || 0) : tipAmount}
        splitFee={payingFor === 'ongoing' ? (ongoingOrder?.splitFee || 0) : splitFee}
        discount={payingFor === 'ongoing' ? (ongoingOrder?.discount || 0) : discount}
        grandTotal={payingFor === 'ongoing' ? (ongoingOrder?.total || grandTotal) : grandTotal}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);

          if (payingFor === 'ongoing') {
            if (ongoingOrder) {
              const updated = { ...ongoingOrder, isPaid: true };
              setOngoingOrder(updated);
              try {
                localStorage.setItem(LOCAL_STORAGE_ONGOING_KEY, JSON.stringify(updated));
              } catch (e) {
                console.error(e);
              }
            }
            setShowOrderConfirmedModal(true);
          } else {
            // Cart checkout payment
            const now = new Date();
            const timeStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            const newId = `#A${Math.floor(100 + Math.random() * 900)}`;

            const newOrder: StoredOrder = {
              id: newId,
              date: timeStr,
              total: grandTotal,
              subtotal,
              serviceCharge,
              vat,
              tipAmount,
              splitFee,
              discount,
              status: 'Preparing',
              isPaid: true,
              items: selectedCart.map((ci) => ({
                name: ci.item.name,
                nameAr: ci.item.nameAr,
                qty: ci.quantity,
                image: ci.item.imageUrl || '/images/food/ramen.png',
                price: ci.item.price,
              })),
              cartItems: [...selectedCart],
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
              onDeductPaidItems(selectedCart);
            }

            setConfirmedCart([...selectedCart]);
            setConfirmedGrandTotal(grandTotal);
            setConfirmedTipAmount(tipAmount);
            setConfirmedSplitFee(splitFee);
            setConfirmedDiscount(discount);
            setConfirmedSubtotal(subtotal);
            setShowOrderConfirmedModal(true);
          }
        }}
        language={activeLanguage}
        tableName={_tableName}
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
