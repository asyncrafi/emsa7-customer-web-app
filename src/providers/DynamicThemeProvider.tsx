import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ThemeConfig, PRESET_PRIMARY_COLORS } from '../core/config/themeConfig';
import { themeApi, applyThemeToDom } from '../core/services/themeService';

interface ThemeContextType {
  themeConfig: ThemeConfig;
  isLoading: boolean;
  isUpdating: boolean;
  updatePrimaryColor: (hexColor: string, themeName?: string) => void;
}

const DynamicThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const DynamicThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Fetch theme configuration from backend API via TanStack Query
  const { data: themeConfig, isLoading } = useQuery<ThemeConfig>({
    queryKey: ['theme-config'],
    queryFn: themeApi.getThemeConfig,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    initialData: {
      primaryColor: PRESET_PRIMARY_COLORS[0].hex, // #026F4F
      primaryHsl: PRESET_PRIMARY_COLORS[0].hsl,  // 162 96% 22%
      primaryOklch: PRESET_PRIMARY_COLORS[0].oklch,
      themeName: 'EMSA7 Emerald Green',
      isDarkMode: false,
      brandName: 'EMSA7 Customer App',
    },
  });

  // Mutation to update primary color (simulates backend API color change)
  const updateMutation = useMutation({
    mutationFn: ({ hex, name }: { hex: string; name?: string }) =>
      themeApi.updateBackendPrimaryColor(hex, name),
    onSuccess: (updatedTheme) => {
      queryClient.setQueryData(['theme-config'], updatedTheme);
      applyThemeToDom(updatedTheme);
    },
  });

  // Apply theme to DOM whenever themeConfig changes
  useEffect(() => {
    if (themeConfig) {
      applyThemeToDom(themeConfig);
    }
  }, [themeConfig]);

  const updatePrimaryColor = (hexColor: string, themeName?: string) => {
    updateMutation.mutate({ hex: hexColor, name: themeName });
  };

  return (
    <DynamicThemeContext.Provider
      value={{
        themeConfig: themeConfig || {
          primaryColor: PRESET_PRIMARY_COLORS[0].hex,
          primaryHsl: PRESET_PRIMARY_COLORS[0].hsl,
          themeName: 'EMSA7 Emerald Green',
          isDarkMode: false,
          brandName: 'EMSA7 Customer App',
        },
        isLoading,
        isUpdating: updateMutation.isPending,
        updatePrimaryColor,
      }}
    >
      {children}
    </DynamicThemeContext.Provider>
  );
};

export const useDynamicTheme = (): ThemeContextType => {
  const context = useContext(DynamicThemeContext);
  if (!context) {
    throw new Error('useDynamicTheme must be used within a DynamicThemeProvider');
  }
  return context;
};
