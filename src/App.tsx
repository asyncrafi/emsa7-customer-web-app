import { useState, useEffect } from 'react';
import { AppProvider } from '@/providers/AppProvider';
import { SplashLoader } from '@/components/SplashLoader';
import { TableConfirmedScreen } from '@/components/TableConfirmedScreen';
import { MenuScreen } from '@/components/menu/MenuScreen';

function MainApp() {
  const [step, setStep] = useState<'splash' | 'table-confirmed' | 'menu'>('splash');

  // Automatically transition from splash loader to table-confirmed after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep('table-confirmed');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (step === 'splash') {
    return <SplashLoader />;
  }

  if (step === 'table-confirmed') {
    return (
      <TableConfirmedScreen
        tableName="Table A08"
        onContinue={() => {
          setStep('menu');
        }}
      />
    );
  }

  return (
    <MenuScreen
      tableName="A08"
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
