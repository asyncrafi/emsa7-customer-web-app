import React, { useRef } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
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
  splitFee?: number;
  discount?: number;
  total: number;
  language?: 'ENGLISH' | 'ARABIC';
}

export const EInvoiceModal: React.FC<EInvoiceModalProps> = ({
  isOpen,
  onClose,
  orderId: _orderId = '#A102',
  date: _date = 'Today, 7:42 PM',
  tableName: _tableName = 'Table A08',
  items,
  subtotal: propSubtotal,
  vat: propVat,
  serviceCharge: propServiceCharge,
  tipAmount = 0,
  splitFee: _splitFee = 0,
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#f4f4f5] antialiased select-none overflow-y-auto flex flex-col justify-between font-sans p-4"
    >
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

      {/* Main Page Container: Strictly mobile 440px width matching Figma */}
      <div className="w-full max-w-[440px] mx-auto flex-1 flex flex-col justify-between space-y-4">
        {/* Header Row: Back Arrow + Centered Title */}
        <header className="relative flex items-center justify-center py-2 no-print">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#EEEEEE] hover:bg-zinc-200 text-zinc-800 flex items-center justify-center cursor-pointer transition-transform active:scale-95 rtl:left-auto rtl:right-0"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>

          <h1 className="text-xl font-semibold text-[#2D2F33] tracking-tight">
            {isArabic ? 'الإيصال' : 'Receipt'}
          </h1>
        </header>

        {/* White Receipt Card matching Figma Reciept.png */}
        <div
          id="printable-invoice-container"
          ref={printRef}
          className="bg-white rounded-[20px] p-6 shadow-2xs border border-[#F4F4F5] space-y-4 text-center text-[#2D2F33]"
        >
          {/* EMSA7 Brand Logo */}
          <div className="flex justify-center pt-2">
            <SvgEmsa7Icon className="h-7 w-auto" />
          </div>

          <div className="space-y-0.5">
            <p className="text-sm font-medium text-zinc-700">
              {isArabic ? 'شكراً لتناولك الطعام معنا !' : 'Thank you for dining With us !'}
            </p>
            <p className="text-xs text-zinc-500 font-normal">
              Follow us @EMSA7
            </p>
          </div>

          {/* Dashed Divider 1 */}
          <div className="border-b border-dashed border-zinc-200 my-3" />

          {/* Itemized List */}
          <div className="space-y-2.5 text-sm text-left rtl:text-right">
            {items.map((it, i) => (
              <div key={i} className="flex justify-between items-center text-zinc-700">
                <span className="font-normal">
                  {it.qty}x {isArabic ? it.nameAr || it.name : it.name}
                </span>
                <span className="font-medium text-zinc-800">
                  {formatPrice(it.price * it.qty, activeLanguage)}
                </span>
              </div>
            ))}
          </div>

          {/* Dashed Divider 2 */}
          <div className="border-b border-dashed border-zinc-200 my-3" />

          {/* Financial Breakdown */}
          <div className="space-y-2 text-sm text-left rtl:text-right text-zinc-600">
            <div className="flex justify-between">
              <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span className="font-medium text-zinc-800">{formatPrice(calculatedSubtotal, activeLanguage)}</span>
            </div>

            {calculatedVat > 0 && (
              <div className="flex justify-between">
                <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'Vat (5%)'}</span>
                <span className="font-medium text-zinc-800">{formatPrice(calculatedVat, activeLanguage)}</span>
              </div>
            )}

            {calculatedServiceCharge > 0 && (
              <div className="flex justify-between">
                <span>{isArabic ? 'الخدمة (10%)' : 'Service (10%)'}</span>
                <span className="font-medium text-zinc-800">{formatPrice(calculatedServiceCharge, activeLanguage)}</span>
              </div>
            )}

            {/* Total Line (Bold) */}
            <div className="flex justify-between items-center font-bold text-base text-zinc-900 pt-1">
              <span>{isArabic ? 'المجموع' : 'Total'}</span>
              <span>{formatPrice(total, activeLanguage)}</span>
            </div>
          </div>

          {/* Dashed Divider 3 */}
          <div className="border-b border-dashed border-zinc-200 my-3" />

          {/* Footer note */}
          <div className="space-y-1 text-xs text-zinc-500 pt-1">
            <p className="font-medium">{isArabic ? 'يرجى الحضور مرة أخرى' : 'Please Come Again'}</p>
            <p className="font-normal">Wifi: 12345678</p>
          </div>
        </div>

        {/* Bottom Action Buttons (Hidden on Print): Add Items & Save */}
        <div className="no-print pt-4 pb-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 px-4 rounded-full bg-[#EEEEEE] hover:bg-zinc-200 text-zinc-800 font-semibold text-sm tracking-wide text-center cursor-pointer transition-all active:scale-[0.98]"
          >
            {isArabic ? 'إضافة أصناف' : 'Add Items'}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3.5 px-4 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>{isArabic ? 'حفظ' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
