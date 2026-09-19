import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, RefreshCw, QrCode, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDynamicTheme } from '@/providers/DynamicThemeProvider';

interface QrScannerScreenProps {
  onScanSuccess: (decodedText: string) => void;
}

export const QrScannerScreen: React.FC<QrScannerScreenProps> = ({ onScanSuccess }) => {
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied' | 'no-device'>('prompt');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { themeConfig } = useDynamicTheme();
  const readerElementId = 'emsa7-landing-qr-reader';

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
          { facingMode: 'environment' }, // Prefer back camera
          {
            fps: 15,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            stopScanner();
            onScanSuccess(decodedText);
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
    onScanSuccess('EMSA7-TABLE-12');
  };

  return (
    <div className="relative w-full min-h-screen bg-zinc-950 flex flex-col justify-between items-center text-white overflow-hidden select-none">

      {/* Top EMSA7 Minimal Brand Indicator */}
      <header className="z-30 w-full pt-6 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-lg">
            E7
          </div>
          <span className="font-extrabold text-lg tracking-tight">EMSA7</span>
        </div>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <span
            className="h-2.5 w-2.5 rounded-full border border-white/40 shadow-xs inline-block"
            style={{ backgroundColor: themeConfig.primaryColor }}
          />
          <span className="text-xs font-mono text-zinc-300 font-semibold">{themeConfig.primaryColor}</span>
        </div>
      </header>

      {/* Main Scanner Container matching uploaded image */}
      <main className="relative z-20 w-full max-w-md px-4 flex flex-col items-center justify-center my-auto py-4">

        {/* Live Camera Stream Container */}
        <div className="relative w-full h-[360px] sm:h-[400px] rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl flex items-center justify-center">

          {/* Html5Qrcode video mounting element */}
          <div id={readerElementId} className="w-full h-full object-cover" />

          {/* Screenshot-Matched Scanner Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">

            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Scanning Target Reticle (250x250 square with rounded corners & white brackets) */}
            <div className="relative w-[250px] h-[250px] z-20 border border-white/20 shadow-2xl rounded-2xl overflow-hidden flex items-center justify-center">

              {/* Corner 1: Top-Left */}
              <div className="absolute top-0 left-0 w-9 h-9 border-t-4 border-l-4 border-white rounded-tl-xl shadow-lg" />
              {/* Corner 2: Top-Right */}
              <div className="absolute top-0 right-0 w-9 h-9 border-t-4 border-r-4 border-white rounded-tr-xl shadow-lg" />
              {/* Corner 3: Bottom-Left */}
              <div className="absolute bottom-0 left-0 w-9 h-9 border-b-4 border-l-4 border-white rounded-bl-xl shadow-lg" />
              {/* Corner 4: Bottom-Right */}
              <div className="absolute bottom-0 right-0 w-9 h-9 border-b-4 border-r-4 border-white rounded-br-xl shadow-lg" />

              {/* Animated Glowing Red Laser Line */}
              {isScanning && (
                <div className="absolute inset-x-0 h-12 bg-gradient-to-b from-red-500/90 via-red-500/40 to-transparent shadow-[0_0_25px_rgba(239,68,68,1)] animate-scan-laser" />
              )}

              {/* Camera Initializing State */}
              {!isScanning && cameraPermission === 'prompt' && (
                <div className="flex flex-col items-center gap-2 text-white/80 animate-pulse">
                  <Camera className="h-10 w-10 text-primary" />
                  <span className="text-xs font-semibold">Opening Camera...</span>
                </div>
              )}
            </div>
          </div>

          {/* Permission Denied / No Camera Fallback Overlay */}
          {(cameraPermission === 'denied' || cameraPermission === 'no-device') && (
            <div className="absolute inset-0 z-30 bg-zinc-950/95 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-3.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Camera Access Required</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                  {errorMessage || 'Camera access is required to scan table QR code.'}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2 w-full max-w-xs">
                <Button onClick={handleSimulateScan} className="gap-2 bg-primary text-primary-foreground font-semibold text-xs py-2.5">
                  <Sparkles className="h-4 w-4" /> Simulate QR Scan (Table #12)
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()} className="gap-2 text-xs border-white/20 text-white hover:bg-white/10">
                  <RefreshCw className="h-3.5 w-3.5" /> Retry Camera Permission
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Text Prompt matching Screenshot exact wording */}
        <div className="text-center space-y-2 pt-6">
          <h1 className="text-white font-bold text-xl sm:text-2xl tracking-tight">
            Point camera at the QR code on your table
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-medium">
            Make sure the QR code is within the frame
          </p>
        </div>
      </main>

      {/* Bottom Action Footer */}
      <footer className="z-30 w-full pb-8 px-4 flex flex-col items-center gap-3">
        <Button
          onClick={handleSimulateScan}
          variant="outline"
          size="sm"
          className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs rounded-full py-2.5 px-5 backdrop-blur-md cursor-pointer"
        >
          <QrCode className="h-4 w-4 text-primary" /> Simulate Table #12 Scan
        </Button>
      </footer>
    </div>
  );
};
