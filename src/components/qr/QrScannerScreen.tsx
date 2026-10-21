import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, QrCode, Sparkles, Languages, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageContext';
import { PoweredByFooter } from '@/components/common/PoweredByFooter';

interface QrScannerScreenProps {
  onScanSuccess: (decodedText: string) => void;
  onSkipToTable?: () => void;
}

export const QrScannerScreen: React.FC<QrScannerScreenProps> = ({
  onScanSuccess,
  onSkipToTable,
}) => {
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied' | 'no-device'>('prompt');
  const [isScanning, setIsScanning] = useState(false);
  const [_errorMessage, setErrorMessage] = useState<string | null>(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { language, setLanguage } = useLanguage();
  const readerElementId = 'emsa7-landing-qr-reader';
  const isArabic = language === 'ARABIC';

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      setErrorMessage(null);
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          if (isMounted) setCameraPermission('no-device');
          return;
        }

        if (isMounted) setCameraPermission('granted');

        const html5Qrcode = new Html5Qrcode(readerElementId);
        scannerRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            stopScanner();
            onScanSuccess(decodedText || 'Table A8');
          },
          () => {}
        );

        if (isMounted) setIsScanning(true);
      } catch (err: any) {
        console.warn('Camera permission issue:', err);
        if (isMounted) {
          setCameraPermission('denied');
          setErrorMessage(err?.message || 'Camera permission denied or camera unavailable.');
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Error clearing scanner:', e);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleSimulateScan = () => {
    stopScanner();
    onScanSuccess('Table A8');
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="relative w-full min-h-[100dvh] bg-[#121417] flex flex-col justify-between items-center text-white overflow-hidden select-none font-sans px-4 sm:px-6 py-5"
    >
      {/* Top Header: Logo & Language Selector */}
      <header className="z-30 w-full max-w-[440px] flex items-center justify-between pt-1">
        <div className="flex items-center">
          <img
            src="/restaurant-logo.png"
            alt="EMSA7"
            className="h-8 sm:h-9 w-auto object-contain brightness-0 invert opacity-95"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/emsa7-logo.svg';
            }}
          />
        </div>

        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md hover:bg-white/15 transition-colors cursor-pointer"
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{isArabic ? 'العربية' : 'ENGLISH'}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-32 bg-zinc-900 border border-white/10 rounded-2xl shadow-xl py-1 z-40 text-xs overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setLanguage('ENGLISH');
                  setLangDropdownOpen(false);
                }}
                className={`w-full text-start px-3.5 py-2 font-medium ${
                  language === 'ENGLISH' ? 'text-[#026F4F] font-semibold bg-white/5' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage('ARABIC');
                  setLangDropdownOpen(false);
                }}
                className={`w-full text-start px-3.5 py-2 font-medium ${
                  language === 'ARABIC' ? 'text-[#026F4F] font-semibold bg-white/5' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                العربية
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Scanner Body */}
      <main className="relative z-20 w-full max-w-[440px] flex flex-col items-center justify-center my-auto py-2">
        {/* Scanner Viewport */}
        <div className="relative w-full aspect-square max-w-[340px] rounded-3xl overflow-hidden bg-black/80 border border-white/10 shadow-2xl flex items-center justify-center">
          {/* Html5Qrcode video mounting element */}
          <div id={readerElementId} className="w-full h-full object-cover" />

          {/* Scanner Overlay UI */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* Darkened edges */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Scanning Viewfinder Frame */}
            <div className="relative w-[230px] h-[230px] z-20 rounded-2xl overflow-hidden flex items-center justify-center">
              {/* Corner 1: Top-Left */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-[3.5px] border-l-[3.5px] border-[#026F4F] rounded-tl-xl shadow-lg" />
              {/* Corner 2: Top-Right */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-[3.5px] border-r-[3.5px] border-[#026F4F] rounded-tr-xl shadow-lg" />
              {/* Corner 3: Bottom-Left */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3.5px] border-l-[3.5px] border-[#026F4F] rounded-bl-xl shadow-lg" />
              {/* Corner 4: Bottom-Right */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3.5px] border-r-[3.5px] border-[#026F4F] rounded-br-xl shadow-lg" />

              {/* Animated Laser Scan Bar */}
              {isScanning && (
                <div className="absolute inset-x-0 h-8 bg-gradient-to-b from-[#026F4F]/80 via-[#026F4F]/40 to-transparent animate-scan-laser shadow-[0_0_20px_rgba(2,111,79,0.8)]" />
              )}

              {/* Camera status */}
              {!isScanning && cameraPermission === 'prompt' && (
                <div className="flex flex-col items-center gap-2 text-white/70 animate-pulse">
                  <Camera className="h-8 w-8 text-[#026F4F]" />
                  <span className="text-xs font-medium">{isArabic ? 'جاري فتح الكاميرا...' : 'Starting camera...'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Fallback if camera is unavailable or denied */}
          {(cameraPermission === 'denied' || cameraPermission === 'no-device') && (
            <div className="absolute inset-0 z-30 bg-zinc-950/95 p-5 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 rounded-full bg-emerald-500/10 text-[#026F4F] border border-[#026F4F]/20">
                <QrCode className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  {isArabic ? 'مسح رمز الاستجابة السريعة للطاولة' : 'Scan Table QR Code'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                  {isArabic
                    ? 'يمكنك تجربة الدخول المباشر إلى طاولة A8 بدون كاميرا'
                    : 'Experience dining at Table A8 instantly'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Instruction text matching Figma specifications */}
        <div className="text-center space-y-1.5 pt-5 max-w-xs">
          <h1 className="text-white font-semibold text-lg sm:text-xl tracking-tight">
            {isArabic ? 'وجه الكاميرا نحو رمز QR على طاولتك' : 'Point camera at table QR code'}
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-normal">
            {isArabic
              ? 'تأكد من وجود رمز الاستجابة السريعة داخل الإطار'
              : 'Make sure the QR code is centered inside the frame'}
          </p>
        </div>
      </main>

      {/* Footer Action: Quick Check-in to Table A8 */}
      <footer className="z-30 w-full max-w-[440px] pb-4 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleSimulateScan}
          className="w-full h-13 rounded-full bg-[#026F4F] hover:bg-[#025a40] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#026F4F]/20 transition-all active:scale-[0.99] cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isArabic ? 'مسح وتأكيد طاولة A8' : 'Scan Table A8'}</span>
        </button>

        {onSkipToTable && (
          <button
            type="button"
            onClick={onSkipToTable}
            className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {isArabic ? 'تخطي إلى الطاولة مباشرة' : 'Skip directly to Table'}
          </button>
        )}

        <PoweredByFooter theme="dark" className="pt-3 pb-2" />
      </footer>
    </div>
  );
};
