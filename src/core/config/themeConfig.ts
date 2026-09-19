export interface ThemeConfig {
  primaryColor: string; // e.g., "#026F4F"
  primaryHsl: string;   // e.g., "162 96% 22%"
  primaryOklch?: string; // e.g., "oklch(0.44 0.11 166.5)"
  themeName: string;
  isDarkMode: boolean;
  brandName: string;
  logoUrl?: string;
}

export const PRESET_PRIMARY_COLORS = [
  { name: 'EMSA7 Emerald Green (Current Default)', hex: '#026F4F', hsl: '162 96% 22%', oklch: 'oklch(0.44 0.11 166.5)' },
  { name: 'Vibrant Green', hex: '#16a34a', hsl: '142 76% 36%', oklch: 'oklch(0.60 0.19 145)' },
  { name: 'Teal Emerald', hex: '#0d9488', hsl: '173 80% 36%', oklch: 'oklch(0.58 0.13 185)' },
  { name: 'Forest Dark', hex: '#14532d', hsl: '142 61% 20%', oklch: 'oklch(0.38 0.12 145)' },
  { name: 'Deep Royal Blue', hex: '#1e40af', hsl: '224 76% 40%', oklch: 'oklch(0.42 0.18 260)' },
  { name: 'Crimson Burgundy', hex: '#9f1239', hsl: '344 80% 35%', oklch: 'oklch(0.40 0.17 18)' },
];

export function hexToHsl(hex: string): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
}
