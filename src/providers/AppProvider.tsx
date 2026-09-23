import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DynamicThemeProvider } from './DynamicThemeProvider';
import { LanguageProvider } from './LanguageContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <DynamicThemeProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </DynamicThemeProvider>
    </QueryClientProvider>
  );
};

