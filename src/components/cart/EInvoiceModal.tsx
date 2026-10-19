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
        {/* Header Row: 50x50 Back Circle Button (bg #E9E9E9) + Centered Title Receipt (Satoshi 28px font-medium #2D2F33) */}
        <header className="relative flex items-center justify-center py-2 min-h-[50px] no-print">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-full bg-[#E9E9E9] hover:bg-[#dedede] text-[#2D2F33] flex items-center justify-center cursor-pointer transition-transform active:scale-95 rtl:left-auto rtl:right-0 shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180 text-[#2D2F33]" />
          </button>

          <h1 className="text-[28px] font-medium text-[#2D2F33] tracking-tight leading-[140%]">
            {isArabic ? 'الإيصال' : 'Receipt'}
          </h1>
        </header>

        {/* White Receipt Card matching Figma Reciept.png (radius 11.1px bg white border #E9E9E9) */}
        <div
          id="printable-invoice-container"
          ref={printRef}
          className="bg-white rounded-[11px] p-6 shadow-2xs border border-[#E9E9E9] space-y-4 text-center text-[#2D2F33]"
        >
          {/* EMSA7 Brand Logo */}
          <div className="flex justify-center pt-2">
            <SvgEmsa7Icon className="h-7 w-auto" />
          </div>

          <div className="space-y-0.5">
            <p className="text-[17px] font-light text-[#000000] leading-[140%]">
              {isArabic ? 'شكراً لتناولك الطعام معنا !' : 'Thank you for dining With us !'}
            </p>
            <p className="text-[14px] text-[#686868] font-normal leading-[140%]">
              Follow us @EMSA7
            </p>
          </div>

          {/* Dashed Divider 1 matching Vector 16 */}
          <div className="border-b border-dashed border-[#686868] my-3" />

          {/* Itemized List */}
          <div className="space-y-2.5 text-[17px] text-left rtl:text-right text-[#686868]">
            {items.map((it, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="font-normal">
                  {it.qty}x {isArabic ? it.nameAr || it.name : it.name}
                </span>
                <span className="font-medium text-[#686868]">
                  {formatPrice(it.price * it.qty, activeLanguage)}
                </span>
              </div>
            ))}
          </div>

          {/* Dashed Divider 2 matching Vector 17 */}
          <div className="border-b border-dashed border-[#686868] my-3" />

          {/* Financial Breakdown */}
          <div className="space-y-2 text-[17px] text-left rtl:text-right text-[#686868]">
            <div className="flex justify-between items-center">
              <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span className="font-medium">{formatPrice(calculatedSubtotal, activeLanguage)}</span>
            </div>

            {calculatedVat > 0 && (
              <div className="flex justify-between items-center">
                <span>{isArabic ? 'ضريبة القيمة المضافة (10%)' : 'Vat (10%)'}</span>
                <span className="font-medium">{formatPrice(calculatedVat, activeLanguage)}</span>
              </div>
            )}

            {calculatedServiceCharge > 0 && (
              <div className="flex justify-between items-center">
                <span>{isArabic ? 'الخدمة (5%)' : 'Service (5%)'}</span>
                <span className="font-medium">{formatPrice(calculatedServiceCharge, activeLanguage)}</span>
              </div>
            )}

            {/* Total Line (Bold 21px font-medium #000000) matching Frame 2147226588 */}
            <div className="flex justify-between items-center font-medium text-[21px] text-[#000000] pt-2">
              <span>{isArabic ? 'المجموع' : 'Total'}</span>
              <span>{formatPrice(total, activeLanguage)}</span>
            </div>
          </div>

          {/* Dashed Divider 3 matching Vector 18 */}
          <div className="border-b border-dashed border-[#686868] my-3" />

          {/* Footer note */}
          <div className="space-y-1 text-[17px] text-[#000000] font-light pt-1">
            <p className="font-light">{isArabic ? 'يرجى الحضور مرة أخرى' : 'Please Come Again'}</p>
            <p className="font-light">Wifi: 12345678</p>
          </div>
        </div>

        {/* Bottom Action Buttons matching Frame 1171277297: Add Items & Save */}
        <div className="no-print pt-4 pb-2 flex items-center gap-3">
          {/* Add Items Button (Button 1585:990: radius 30px bg #E9E9E9 border #B9B9B9 text #2D2F33) */}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[59px] rounded-[30px] bg-[#E9E9E9] hover:bg-[#dedede] border border-[#B9B9B9] text-[#2D2F33] font-medium text-[19px] leading-[140%] text-center cursor-pointer transition-transform active:scale-[0.98] flex items-center justify-center"
          >
            {isArabic ? 'إضافة أصناف' : 'Add Items'}
          </button>

          {/* Save Button (Button 1585:1010: radius 30px bg #026F4F text white) */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 h-[59px] rounded-[30px] bg-[#026F4F] hover:bg-[#025a40] text-white font-medium text-[19px] leading-[140%] flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-[0.98]"
          >
            <Printer className="w-5 h-5" />
            <span>{isArabic ? 'حفظ' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
