import React, { useRef } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { formatPrice } from '@/types/menu';
import { useLanguage } from '@/providers/LanguageContext';
import SvgEmsa7Icon from '@/components/ui/svg-icons/EMSA7Svg';

export interface EInvoiceItem {
  name: string;
  nameAr?: string;
  qty: number;
  price: number;
}

export interface EInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  date?: string;
  tableName?: string;
  items: EInvoiceItem[];
  subtotal?: number;
  vat?: number;
  serviceCharge?: number;
  tipAmount?: number;
  discount?: number;
  total: number;
  language?: 'ENGLISH' | 'ARABIC';
}

export const EInvoiceModal: React.FC<EInvoiceModalProps> = ({
  isOpen,
  onClose,
  orderId = '#A102',
  date = 'Today, 7:42 PM',
  tableName = 'Table A08',
  items,
  subtotal: propSubtotal,
  vat: propVat,
  serviceCharge: propServiceCharge,
  tipAmount = 0,
  discount = 0,
  total,
  language: propLanguage,
}) => {
  const { language: contextLanguage } = useLanguage();
  const activeLanguage = propLanguage || contextLanguage;
  const isArabic = activeLanguage === 'ARABIC';
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const itemsSum = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  let calculatedSubtotal: number;
  let calculatedServiceCharge: number;
  let calculatedVat: number;

  const netTotal = Math.max(0, total - tipAmount + discount);

  if (propServiceCharge === undefined && propVat === undefined) {
    if (propSubtotal !== undefined) {
      calculatedSubtotal = propSubtotal;
      calculatedServiceCharge = propSubtotal * 0.10;
      calculatedVat = propSubtotal * 0.05;
    } else {
      calculatedSubtotal = netTotal / 1.15;
      calculatedServiceCharge = calculatedSubtotal * 0.10;
      calculatedVat = calculatedSubtotal * 0.05;
    }
  } else {
    calculatedSubtotal = propSubtotal ?? itemsSum;
    calculatedServiceCharge = propServiceCharge ?? 0;
    calculatedVat = propVat ?? 0;
  }

  const invoiceNumber = `INV-${orderId.replace('#', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const formattedDate = date || new Date().toLocaleString(isArabic ? 'ar-EG' : 'en-US');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-container, #printable-invoice-container * {
            visibility: visible !important;
          }
          #printable-invoice-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Dialog Card */}
      <div className="bg-white w-full max-w-md md:max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] border border-zinc-100">
        {/* Header Bar */}
        <div className="no-print bg-zinc-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm sm:text-base tracking-wide">
              {isArabic ? 'الفاتورة الإلكترونية' : 'E-Invoice'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Printable Invoice Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 bg-white text-zinc-800" id="printable-invoice-container" ref={printRef}>
          {/* Header Branding & Restaurant Info */}
          <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-extrabold text-lg sm:text-xl text-primary tracking-tight">
                  EMSA7
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">Tax Reg #: 394-819-204</p>
              <p className="text-xs text-zinc-500 font-medium">{tableName}</p>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="bg-zinc-50 rounded-2xl p-3.5 sm:p-4 text-xs space-y-2 border border-zinc-100">
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">{isArabic ? 'رقم الفاتورة' : 'Invoice No:'}</span>
              <span className="font-bold text-zinc-900 font-mono">{invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">{isArabic ? 'رقم الطلب' : 'Order ID:'}</span>
              <span className="font-bold text-zinc-900">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">{isArabic ? 'التاريخ والوقت' : 'Date & Time:'}</span>
              <span className="font-medium text-zinc-800">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">{isArabic ? 'حالة الدفع' : 'Payment Status:'}</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {isArabic ? 'مدفوع' : 'PAID'}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
              {isArabic ? 'الأصناف' : 'Items'}
            </h3>
            <div className="border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-100 text-xs sm:text-sm">
              <div className="bg-zinc-100 px-3.5 py-2.5 font-bold text-zinc-700 flex justify-between">
                <span className="flex-1">{isArabic ? 'الصنف' : 'Item'}</span>
                <span className="w-12 text-center">{isArabic ? 'العدد' : 'Qty'}</span>
                <span className="w-20 text-right">{isArabic ? 'السعر' : 'Price'}</span>
              </div>
              {items.map((it, i) => (
                <div key={i} className="px-3.5 py-2.5 flex justify-between items-center text-zinc-800">
                  <span className="flex-1 font-semibold truncate pr-2">
                    {isArabic ? it.nameAr || it.name : it.name}
                  </span>
                  <span className="w-12 text-center font-bold text-zinc-600">x{it.qty}</span>
                  <span className="w-20 text-right font-bold text-zinc-900">
                    {formatPrice(it.price * it.qty, activeLanguage)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-2 text-xs sm:text-sm border-t border-zinc-200 pt-3">
            <div className="flex justify-between text-zinc-500">
              <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span className="font-semibold text-zinc-800">
                {formatPrice(calculatedSubtotal, activeLanguage)}
              </span>
            </div>

            {calculatedServiceCharge > 0 && (
              <div className="flex justify-between text-zinc-500">
                <span>{isArabic ? 'رسوم الخدمة' : 'Service Charge'}</span>
                <span className="font-semibold text-zinc-800">
                  {formatPrice(calculatedServiceCharge, activeLanguage)}
                </span>
              </div>
            )}

            {calculatedVat > 0 && (
              <div className="flex justify-between text-zinc-500">
                <span>{isArabic ? 'الضريبة' : 'Taxes'}</span>
                <span className="font-semibold text-zinc-800">
                  {formatPrice(calculatedVat, activeLanguage)}
                </span>
              </div>
            )}

            {tipAmount !== undefined && (
              <div className="flex justify-between text-zinc-500">
                <span>{isArabic ? 'الإكرامية' : 'Tip'}</span>
                <span className="font-semibold text-zinc-800">
                  {formatPrice(tipAmount, activeLanguage)}
                </span>
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>{isArabic ? 'الخصم' : 'Discount'}</span>
                <span className="font-semibold">
                  -{formatPrice(discount, activeLanguage)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm sm:text-base font-extrabold text-zinc-900 pt-2 border-t border-zinc-200">
              <span>{isArabic ? 'الإجمالي الشامل' : 'Grand Total'}</span>
              <span className="text-[#026F4F] text-base sm:text-lg">
                {formatPrice(total, activeLanguage)}
              </span>
            </div>
          </div>

          {/* E-Invoice Footer & Branding */}
          <div className="pt-4 border-t border-zinc-200/80 text-center space-y-2">
            <p className="text-xs text-zinc-500 font-medium">
              {isArabic ? 'شكراً لكم! نأمل رؤيتكم قريباً.' : 'Thank you! See you again.'}
            </p>

            <div className="inline-flex items-center justify-center gap-2 pt-1 select-none">
              <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">
                POWERED BY
              </span>
              <SvgEmsa7Icon className="h-4 w-auto" />
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (Hidden on Print) */}
        <div className="no-print bg-zinc-50 p-4 border-t border-zinc-200/80 flex items-center justify-between gap-3 shrink-0">
          {/* <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-3 px-4 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-zinc-600" />}
            <span>{copied ? (isArabic ? 'تم النسخ!' : 'Copied!') : (isArabic ? 'مشاركة' : 'Share')}</span>
          </button> */}

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl bg-[#026F4F] hover:bg-[#025a40] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isArabic ? 'تحميل الفاتورة' : 'Download Invoice'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
