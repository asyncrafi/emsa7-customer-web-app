import React, { useRef, useState } from 'react';
import { ArrowLeft, Download, Printer, Loader2 } from 'lucide-react';
import { formatPrice } from '@/types/menu';
import { useLanguage } from '@/providers/LanguageContext';
import emsa7Logo from '@/assets/logo.png';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Print Preview / System Print handler
  const handlePrint = () => {
    window.print();
  };

  // Direct High-Resolution PDF Download handler
  const handleDownloadPdf = async () => {
    if (!printRef.current) {
      window.print();
      return;
    }

    try {
      setIsDownloading(true);
      const target = printRef.current;

      const canvas = await html2canvas(target, {
        scale: 3, // Ultra-sharp 300 DPI retina resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const cleanOrderId = (_orderId || 'A102').replace(/[^a-zA-Z0-9]/g, '');

      // Create PDF centered on A4 paper preserving Figma card layout
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // A4 is 210mm wide x 297mm high
      const cardWidthMm = 115;
      const cardHeightMm = (canvas.height * cardWidthMm) / canvas.width;
      const xOffset = (210 - cardWidthMm) / 2;
      const yOffset = Math.max(15, (297 - cardHeightMm) / 4);

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, cardWidthMm, cardHeightMm, undefined, 'FAST');
      pdf.save(`EMSA7-Receipt-${cleanOrderId}.pdf`);
    } catch (err) {
      console.error('Direct PDF generation error, falling back to print dialog:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#f4f4f5] antialiased select-none overflow-y-auto flex flex-col justify-between font-sans p-4"
    >
      <style>{`
        @page {
          size: portrait;
          margin: 12mm;
        }

        @media print {
          /* Enforce exact background and image printing in all browsers */
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          body * {
            visibility: hidden !important;
          }

          #printable-receipt-wrapper,
          #printable-receipt-wrapper * {
            visibility: visible !important;
          }

          #printable-receipt-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: flex-start !important;
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
          }

          #printable-invoice-container {
            width: 380px !important;
            max-width: 380px !important;
            margin: 10px auto !important;
            padding: 24px !important;
            background: #ffffff !important;
            border: 1px solid #D1D5DB !important;
            border-radius: 14px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Page Container: Strictly mobile 440px width matching Figma */}
      <div
        id="printable-receipt-wrapper"
        className="w-full max-w-[440px] mx-auto flex-1 flex flex-col justify-between space-y-4"
      >
        {/* Header Row: 50x50 Back Circle Button (bg #E9E9E9) + Centered Title Receipt + Print Button */}
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

          <button
            type="button"
            onClick={handlePrint}
            aria-label={isArabic ? 'طباعة' : 'Print'}
            title={isArabic ? 'طباعة الإيصال' : 'Print Receipt'}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-full bg-[#E9E9E9] hover:bg-[#dedede] text-[#2D2F33] flex items-center justify-center cursor-pointer transition-transform active:scale-95 rtl:right-auto rtl:left-0 shadow-2xs"
          >
            <Printer className="w-5 h-5 text-[#2D2F33]" />
          </button>
        </header>

        {/* White Receipt Card matching Figma Reciept.png (radius 14px bg white border #E9E9E9) */}
        <div
          id="printable-invoice-container"
          ref={printRef}
          className="bg-white rounded-[14px] p-6 shadow-2xs border border-[#E9E9E9] space-y-4 text-center text-[#2D2F33]"
        >
          {/* EMSA7 Brand Logo - Genuine Image for 100% Fidelity in Print & PDF */}
          <div className="flex justify-center items-center pt-2 pb-1">
            <img
              src={emsa7Logo}
              alt="EMSA7"
              className="h-8 max-h-[36px] w-auto object-contain mx-auto"
            />
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
                <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'VAT (5%)'}</span>
                <span className="font-medium">{formatPrice(calculatedVat, activeLanguage)}</span>
              </div>
            )}

            {calculatedServiceCharge > 0 && (
              <div className="flex justify-between items-center">
                <span>{isArabic ? 'رسوم الخدمة (10%)' : 'Service Charge (10%)'}</span>
                <span className="font-medium">{formatPrice(calculatedServiceCharge, activeLanguage)}</span>
              </div>
            )}

            {tipAmount > 0 && (
              <div className="flex justify-between items-center">
                <span>{isArabic ? 'الإكرامية' : 'Tips'}</span>
                <span className="font-medium">{formatPrice(tipAmount, activeLanguage)}</span>
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

        {/* Bottom Action Buttons matching Frame 1171277297: Add Items & Download Receipt */}
        <div className="no-print pt-4 pb-2 flex items-center gap-3">
          {/* Add Items Button (Button 1585:990: radius 30px bg #E9E9E9 border #B9B9B9 text #2D2F33) */}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[59px] rounded-[30px] bg-[#E9E9E9] hover:bg-[#dedede] border border-[#B9B9B9] text-[#2D2F33] font-medium text-[19px] leading-[140%] text-center cursor-pointer transition-transform active:scale-[0.98] flex items-center justify-center"
          >
            {isArabic ? 'إضافة أصناف' : 'Add Items'}
          </button>

          {/* Download Receipt Button (Button 1585:1010: radius 30px bg #026F4F text white matching Figma) */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex-1 h-[59px] rounded-[30px] bg-[#026F4F] hover:bg-[#025a40] text-white font-medium text-[19px] leading-[140%] flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-[0.98] disabled:opacity-75"
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>
              {isDownloading
                ? isArabic
                  ? 'جاري التحميل...'
                  : 'Downloading...'
                : isArabic
                ? 'تحميل الإيصال'
                : 'Download Receipt'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
