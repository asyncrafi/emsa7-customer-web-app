import { type ThemeConfig, PRESET_PRIMARY_COLORS, hexToHsl } from '../config/themeConfig';

// In-memory backend simulation store initialized with #026F4F
let currentBackendTheme: ThemeConfig = {
  primaryColor: PRESET_PRIMARY_COLORS[0].hex, // #026F4F
  primaryHsl: PRESET_PRIMARY_COLORS[0].hsl,  // 162 96% 22%
  primaryOklch: PRESET_PRIMARY_COLORS[0].oklch,
  themeName: 'EMSA7 Emerald Green',
  isDarkMode: false,
  brandName: 'EMSA7 Customer App',
};

export const themeApi = {
  // Simulates fetching theme configuration from backend API
  getThemeConfig: async (): Promise<ThemeConfig> => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return { ...currentBackendTheme };
  },

  // Simulates updating backend primary color dynamically
  updateBackendPrimaryColor: async (hexColor: string, themeName?: string): Promise<ThemeConfig> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const hsl = hexToHsl(hexColor);
    currentBackendTheme = {
      ...currentBackendTheme,
      primaryColor: hexColor,
      primaryHsl: hsl,
      themeName: themeName || `Custom (${hexColor})`,
    };
    return { ...currentBackendTheme };
  },
};

export function applyThemeToDom(theme: ThemeConfig) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Dynamically set CSS variables for primary color & ring accent
  root.style.setProperty('--primary', theme.primaryHsl);
  root.style.setProperty('--ring', theme.primaryHsl);
}
