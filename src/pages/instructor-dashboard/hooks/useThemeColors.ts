import { useTheme } from '../contexts/ThemeContext';

export interface ThemeColorSet {
  light: string;
  main: string;
  dark: string;
  darker: string;
  bg50: string;
  bg10: string;
  bg20: string;
  bg900: string;
  border800: string;
  text300: string;
  text400: string;
  text500: string;
  text600: string;
  text700: string;
  darkText400: string;
  hover50: string;
  hover600: string;
  ring: string;
  bgSolid: string;
  bgSolidHover: string;
}

const themeColors: Record<string, ThemeColorSet> = {
  blue: {
    light: '#93c5fd',
    main: '#3b82f6',
    dark: '#2563eb',
    darker: '#1d4ed8',
    bg50: 'bg-blue-50',
    bg10: 'bg-blue-500/10',
    bg20: 'bg-blue-500/20',
    bg900: 'bg-blue-900',
    border800: 'border-blue-800',
    text300: 'text-blue-300',
    text400: 'text-blue-400',
    text500: 'text-blue-500',
    text600: 'text-blue-600',
    text700: 'text-blue-700',
    darkText400: 'dark:text-blue-400',
    hover50: 'hover:bg-blue-50/50',
    hover600: 'hover:text-blue-600',
    ring: 'focus:ring-blue-500',
    bgSolid: 'bg-blue-600',
    bgSolidHover: 'hover:bg-blue-700',
  },
  emerald: {
    light: '#6ee7b7',
    main: '#10b981',
    dark: '#059669',
    darker: '#047857',
    bg50: 'bg-emerald-50',
    bg10: 'bg-emerald-500/10',
    bg20: 'bg-emerald-500/20',
    bg900: 'bg-emerald-900',
    border800: 'border-emerald-800',
    text300: 'text-emerald-300',
    text400: 'text-emerald-400',
    text500: 'text-emerald-500',
    text600: 'text-emerald-600',
    text700: 'text-emerald-700',
    darkText400: 'dark:text-emerald-400',
    hover50: 'hover:bg-emerald-50/50',
    hover600: 'hover:text-emerald-600',
    ring: 'focus:ring-emerald-500',
    bgSolid: 'bg-emerald-600',
    bgSolidHover: 'hover:bg-emerald-700',
  },
  violet: {
    light: '#93c5fd',
    main: '#3b82f6',
    dark: '#2563eb',
    darker: '#1d4ed8',
    bg50: 'bg-blue-50',
    bg10: 'bg-blue-500/10',
    bg20: 'bg-blue-500/20',
    bg900: 'bg-blue-900',
    border800: 'border-blue-800',
    text300: 'text-blue-300',
    text400: 'text-blue-400',
    text500: 'text-blue-500',
    text600: 'text-blue-600',
    text700: 'text-blue-700',
    darkText400: 'dark:text-blue-400',
    hover50: 'hover:bg-blue-50/50',
    hover600: 'hover:text-blue-600',
    ring: 'focus:ring-blue-500',
    bgSolid: 'bg-blue-600',
    bgSolidHover: 'hover:bg-blue-700',
  },
  rose: {
    light: '#fda4af',
    main: '#f43f5e',
    dark: '#e11d48',
    darker: '#be123c',
    bg50: 'bg-rose-50',
    bg10: 'bg-rose-500/10',
    bg20: 'bg-rose-500/20',
    bg900: 'bg-rose-900',
    border800: 'border-rose-800',
    text300: 'text-rose-300',
    text400: 'text-rose-400',
    text500: 'text-rose-500',
    text600: 'text-rose-600',
    text700: 'text-rose-700',
    darkText400: 'dark:text-rose-400',
    hover50: 'hover:bg-rose-50/50',
    hover600: 'hover:text-rose-600',
    ring: 'focus:ring-rose-500',
    bgSolid: 'bg-rose-600',
    bgSolidHover: 'hover:bg-rose-700',
  },
  amber: {
    light: '#fcd34d',
    main: '#f59e0b',
    dark: '#d97706',
    darker: '#b45309',
    bg50: 'bg-amber-50',
    bg10: 'bg-amber-500/10',
    bg20: 'bg-amber-500/20',
    bg900: 'bg-amber-900',
    border800: 'border-amber-800',
    text300: 'text-amber-300',
    text400: 'text-amber-400',
    text500: 'text-amber-500',
    text600: 'text-amber-600',
    text700: 'text-amber-700',
    darkText400: 'dark:text-amber-400',
    hover50: 'hover:bg-amber-50/50',
    hover600: 'hover:text-amber-600',
    ring: 'focus:ring-amber-500',
    bgSolid: 'bg-amber-600',
    bgSolidHover: 'hover:bg-amber-700',
  },
};

export function useThemeColors(): ThemeColorSet {
  const { primaryColor = 'blue' } = useTheme() as any;
  return themeColors[primaryColor] || themeColors.blue;
}

export default useThemeColors;
