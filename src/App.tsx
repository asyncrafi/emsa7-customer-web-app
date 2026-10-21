import { useState, useEffect } from 'react';
import { AppProvider } from '@/providers/AppProvider';
import { SplashLoader } from '@/components/SplashLoader';
import { QrScannerScreen } from '@/components/qr/QrScannerScreen';
import { TableConfirmedScreen } from '@/components/TableConfirmedScreen';
import { MenuScreen } from '@/components/menu/MenuScreen';

function MainApp() {
  const urlParams = new URLSearchParams(window.location.search);
  const requestedScreen = urlParams.get('screen') || urlParams.get('step');
  const hasTableParam = urlParams.has('table');

  const [step, setStep] = useState<'splash' | 'scanner' | 'table-confirmed' | 'menu'>('splash');
  const [tableName, setTableName] = useState<string>(
    urlParams.get('table') ? `Table ${urlParams.get('table')}` : 'Table A8'
  );

  // Automatically transition from splash loader after 1 second
  useEffect(() => {
    if (requestedScreen === 'splash') {
      setStep('splash');
      return;
    }

    const timer = setTimeout(() => {
      if (requestedScreen === 'scanner' || requestedScreen === 'scan') {
        setStep('scanner');
      } else if (requestedScreen === 'menu') {
        setStep('menu');
      } else if (requestedScreen === 'table' || requestedScreen === 'table-confirmed' || hasTableParam) {
        setStep('table-confirmed');
      } else {
        // Default start at scanner so user can experience the full scan flow
        setStep('scanner');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [requestedScreen, hasTableParam]);

  if (step === 'splash') {
    return <SplashLoader />;
  }

  if (step === 'scanner') {
    return (
      <QrScannerScreen
        onScanSuccess={(scannedTable) => {
          setTableName(scannedTable || 'Table A8');
          setStep('table-confirmed');
        }}
        onSkipToTable={() => {
          setStep('table-confirmed');
        }}
      />
    );
  }

  if (step === 'table-confirmed') {
    return (
      <TableConfirmedScreen
        tableName={tableName}
        onContinue={() => {
          setStep('menu');
        }}
      />
    );
  }

  return (
    <MenuScreen
      tableName={tableName.replace(/Table\s+/i, '')}
      onBackToTableConfirmed={() => {
        setStep('table-confirmed');
      }}
    />
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
