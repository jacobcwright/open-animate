export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  bgAlt: string;
  text: string;
  textMuted: string;
}

export const palettes = {
  dark: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    bg: '#0a0a0a',
    bgAlt: '#141414',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
  },
  light: {
    primary: '#4f46e5',
    secondary: '#7c3aed',
    accent: '#0891b2',
    bg: '#ffffff',
    bgAlt: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
  },
  midnight: {
    primary: '#818cf8',
    secondary: '#a78bfa',
    accent: '#22d3ee',
    bg: '#020617',
    bgAlt: '#0f172a',
    text: '#e2e8f0',
    textMuted: '#64748b',
  },
  sunset: {
    primary: '#f97316',
    secondary: '#f59e0b',
    accent: '#ef4444',
    bg: '#0c0a09',
    bgAlt: '#1c1917',
    text: '#fafaf9',
    textMuted: '#a8a29e',
  },
  ocean: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#14b8a6',
    bg: '#0c1222',
    bgAlt: '#162032',
    text: '#e0f2fe',
    textMuted: '#7dd3fc',
  },
} as const;

export type PaletteName = keyof typeof palettes;
