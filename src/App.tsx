import { useState, useEffect } from 'react';
import { AppProvider } from '@/providers/AppProvider';
import { SplashLoader } from '@/components/SplashLoader';
import { TableConfirmedScreen } from '@/components/TableConfirmedScreen';

function MainApp() {
  const [step, setStep] = useState<'splash' | 'table-confirmed'>('splash');

  // Automatically transition from splash loader to table-confirmed after 2 seconds (2000ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep('table-confirmed');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (step === 'splash') {
    return <SplashLoader />;
  }

  return (
    <TableConfirmedScreen
      tableName="Table A8"
      onContinue={() => {
        // Optional action handler for continue
        console.log('Continue clicked');
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
