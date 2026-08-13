import type { TextStyle, ViewStyle } from 'react-native';

export const THEME_PRESETS = [
  'default',
  'ocean',
  'emerald',
  'purple',
  'sunset',
] as const;

export type ThemePreset = (typeof THEME_PRESETS)[number];

export type AppColors = {
  primary: string;
  primaryDark: string;
  primaryMuted: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceVariant: string;
  drawerSurface: string;
  drawerHeader: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  lowStock: string;
  cardShadow: string;
  overlay: string;
};

type SemanticColors = Pick<
  AppColors,
  | 'secondary'
  | 'accent'
  | 'background'
  | 'surface'
  | 'surfaceVariant'
  | 'text'
  | 'textSecondary'
  | 'border'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'lowStock'
  | 'cardShadow'
>;

type PrimaryColors = Pick<
  AppColors,
  'primary' | 'primaryDark' | 'primaryMuted' | 'drawerHeader'
>;

type ExtendedBaseColors = SemanticColors &
  Pick<
    AppColors,
    'surfaceElevated' | 'drawerSurface' | 'textMuted' | 'borderLight' | 'overlay'
  >;

const lightSemantic: SemanticColors = {
  secondary: '#00897B',
  accent: '#FF6F00',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceVariant: '#E8EDF2',
  text: '#1A1D21',
  textSecondary: '#5F6B7A',
  border: '#DDE3EA',
  error: '#D32F2F',
  success: '#2E7D32',
  warning: '#ED6C02',
  info: '#0288D1',
  lowStock: '#E65100',
  cardShadow: 'rgba(21, 101, 192, 0.08)',
};

const darkSemantic: SemanticColors = {
  secondary: '#26A69A',
  accent: '#FFB74D',
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  text: '#F5F5F5',
  textSecondary: '#B0BEC5',
  border: '#3A3A3A',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  info: '#29B6F6',
  lowStock: '#FF8A65',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
};

const lightExtended: ExtendedBaseColors = {
  ...lightSemantic,
  surfaceElevated: '#FFFFFF',
  drawerSurface: '#FFFFFF',
  textMuted: '#8A96A3',
  borderLight: '#EEF2F6',
  overlay: 'rgba(26, 29, 33, 0.52)',
};

const darkExtended: ExtendedBaseColors = {
  ...darkSemantic,
  surfaceElevated: '#252525',
  drawerSurface: '#1E1E1E',
  textMuted: '#78909C',
  borderLight: '#2C2C2C',
  overlay: 'rgba(0, 0, 0, 0.62)',
};

const primaryPalettes: Record<
  ThemePreset,
  { light: PrimaryColors; dark: PrimaryColors }
> = {
  default: {
    light: {
      primary: '#1565C0',
      primaryDark: '#0D47A1',
      primaryMuted: '#E3F2FD',
      drawerHeader: '#1565C0',
    },
    dark: {
      primary: '#42A5F5',
      primaryDark: '#1565C0',
      primaryMuted: '#0D2137',
      drawerHeader: '#0D47A1',
    },
  },
  ocean: {
    light: {
      primary: '#0284C7',
      primaryDark: '#0369A1',
      primaryMuted: '#E0F2FE',
      drawerHeader: '#0284C7',
    },
    dark: {
      primary: '#38BDF8',
      primaryDark: '#0EA5E9',
      primaryMuted: '#0C4A6E',
      drawerHeader: '#0369A1',
    },
  },
  emerald: {
    light: {
      primary: '#059669',
      primaryDark: '#047857',
      primaryMuted: '#D1FAE5',
      drawerHeader: '#059669',
    },
    dark: {
      primary: '#34D399',
      primaryDark: '#10B981',
      primaryMuted: '#064E3B',
      drawerHeader: '#047857',
    },
  },
  purple: {
    light: {
      primary: '#7C3AED',
      primaryDark: '#5B21B6',
      primaryMuted: '#EDE9FE',
      drawerHeader: '#7C3AED',
    },
    dark: {
      primary: '#A78BFA',
      primaryDark: '#8B5CF6',
      primaryMuted: '#2E1065',
      drawerHeader: '#5B21B6',
    },
  },
  sunset: {
    light: {
      primary: '#EA580C',
      primaryDark: '#C2410C',
      primaryMuted: '#FFEDD5',
      drawerHeader: '#EA580C',
    },
    dark: {
      primary: '#FB923C',
      primaryDark: '#F97316',
      primaryMuted: '#431407',
      drawerHeader: '#C2410C',
    },
  },
};

export const THEME_PRESET_OPTIONS: {
  id: ThemePreset;
  label: string;
  swatch: string;
}[] = [
  { id: 'default', label: 'Default', swatch: '#1565C0' },
  { id: 'ocean', label: 'Ocean', swatch: '#0284C7' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669' },
  { id: 'purple', label: 'Purple', swatch: '#7C3AED' },
  { id: 'sunset', label: 'Sunset', swatch: '#EA580C' },
];

export const isThemePreset = (value: unknown): value is ThemePreset =>
  typeof value === 'string' &&
  (THEME_PRESETS as readonly string[]).includes(value);

export const normalizeThemePreset = (value: unknown): ThemePreset =>
  isThemePreset(value) ? value : 'default';

export const getThemeColors = (preset: ThemePreset, isDark: boolean): AppColors => {
  const safePreset = normalizeThemePreset(preset);
  const base = isDark ? darkExtended : lightExtended;
  const primary = primaryPalettes[safePreset][isDark ? 'dark' : 'light'];
  return { ...base, ...primary };
};

export const lightColors: AppColors = getThemeColors('default', false);
export const darkColors: AppColors = getThemeColors('default', true);

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2 },
  h4: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.4 },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1.1,
    textTransform: 'uppercase' as const,
  },
  kpiValue: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.4 },
  kpiValueCompact: { fontSize: 18, fontWeight: '700' as const, letterSpacing: -0.3 },
};

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export const shadows: Record<'sm' | 'md' | 'lg' | 'drawer', ShadowStyle> = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  drawer: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 16,
  },
};

export const layout = {
  drawerWidth: 300,
  maxContentWidth: 760,
  headerHeight: 56,
  tabBarHeight: 62,
};

export const stackAnimationOptions = {
  animation: 'simple_push' as const,
  animationDuration: 200,
  freezeOnBlur: true,
};

export const tabPerformanceOptions = {
  lazy: true,
  freezeOnBlur: true,
};

export const getStackScreenOptions = (colors: AppColors) => ({
  ...stackAnimationOptions,
  headerStyle: {
    backgroundColor: colors.surface,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitleStyle: {
    ...(typography.h4 as TextStyle),
    color: colors.text,
  },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
});
