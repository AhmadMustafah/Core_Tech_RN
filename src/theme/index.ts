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
  onPrimary: string;
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
  secondary: '#3D5A73',
  accent: '#5B7C99',
  background: '#F4F6F8',
  surface: '#FFFFFF',
  surfaceVariant: '#E8EDF3',
  text: '#1A2332',
  textSecondary: '#4A5568',
  border: '#D2DBE5',
  error: '#A33B32',
  success: '#2A6B4F',
  warning: '#8F6B24',
  info: '#2B5F8A',
  lowStock: '#8F4E2A',
  cardShadow: 'rgba(16, 32, 54, 0.06)',
};

const darkSemantic: SemanticColors = {
  secondary: '#8FA8C0',
  accent: '#A8B8C8',
  background: '#0C121A',
  surface: '#141C26',
  surfaceVariant: '#223040',
  text: '#E8EEF4',
  textSecondary: '#9AA8B8',
  border: '#2A3644',
  error: '#D97A74',
  success: '#6BA88A',
  warning: '#C4A35A',
  info: '#7BA3C9',
  lowStock: '#C48A68',
  cardShadow: 'rgba(0, 0, 0, 0.42)',
};

const lightExtended: ExtendedBaseColors = {
  ...lightSemantic,
  surfaceElevated: '#FFFFFF',
  drawerSurface: '#FFFFFF',
  textMuted: '#6B7785',
  borderLight: '#E6EBF1',
  overlay: 'rgba(16, 32, 54, 0.46)',
};

const darkExtended: ExtendedBaseColors = {
  ...darkSemantic,
  surfaceElevated: '#1B2532',
  drawerSurface: '#141C26',
  textMuted: '#7D8B9A',
  borderLight: '#223040',
  overlay: 'rgba(6, 10, 16, 0.64)',
};

const primaryPalettes: Record<
  ThemePreset,
  { light: PrimaryColors; dark: PrimaryColors }
> = {
  default: {
    light: {
      primary: '#1E4B7B',
      primaryDark: '#16365A',
      primaryMuted: '#E8F0F8',
      drawerHeader: '#16365A',
    },
    dark: {
      primary: '#7BA3C9',
      primaryDark: '#4A7FA8',
      primaryMuted: '#1A2838',
      drawerHeader: '#122033',
    },
  },
  ocean: {
    light: {
      primary: '#1F5F8B',
      primaryDark: '#174A6C',
      primaryMuted: '#E6F2F8',
      drawerHeader: '#174A6C',
    },
    dark: {
      primary: '#7BB3D0',
      primaryDark: '#3D87A8',
      primaryMuted: '#163040',
      drawerHeader: '#123040',
    },
  },
  emerald: {
    light: {
      primary: '#047857',
      primaryDark: '#065F46',
      primaryMuted: '#DDF4EA',
      drawerHeader: '#047857',
    },
    dark: {
      primary: '#4BC49A',
      primaryDark: '#059669',
      primaryMuted: '#0B3D30',
      drawerHeader: '#065F46',
    },
  },
  purple: {
    light: {
      primary: '#6D28D9',
      primaryDark: '#5B21B6',
      primaryMuted: '#EDE7FB',
      drawerHeader: '#5B21B6',
    },
    dark: {
      primary: '#9D86E8',
      primaryDark: '#7C3AED',
      primaryMuted: '#2A1658',
      drawerHeader: '#5B21B6',
    },
  },
  sunset: {
    light: {
      primary: '#C2410C',
      primaryDark: '#9A3412',
      primaryMuted: '#F8E6D8',
      drawerHeader: '#9A3412',
    },
    dark: {
      primary: '#E8A05A',
      primaryDark: '#C2410C',
      primaryMuted: '#3A1C0C',
      drawerHeader: '#9A3412',
    },
  },
};

export const THEME_PRESET_OPTIONS: {
  id: ThemePreset;
  label: string;
  swatch: string;
}[] = [
  { id: 'default', label: 'Default', swatch: '#1E4B7B' },
  { id: 'ocean', label: 'Ocean', swatch: '#1F5F8B' },
  { id: 'emerald', label: 'Emerald', swatch: '#047857' },
  { id: 'purple', label: 'Purple', swatch: '#6D28D9' },
  { id: 'sunset', label: 'Sunset', swatch: '#C2410C' },
];

export const isThemePreset = (value: unknown): value is ThemePreset =>
  typeof value === 'string' &&
  (THEME_PRESETS as readonly string[]).includes(value);

export const normalizeThemePreset = (value: unknown): ThemePreset =>
  isThemePreset(value) ? value : 'default';

const hexToChannel = (value: string, start: number) =>
  parseInt(value.slice(start, start + 2), 16) / 255;

const linearize = (channel: number) =>
  channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const relativeLuminance = (hex: string) => {
  const value = hex.replace('#', '');
  if (value.length < 6) {
    return 0;
  }
  return (
    0.2126 * linearize(hexToChannel(value, 0)) +
    0.7152 * linearize(hexToChannel(value, 2)) +
    0.0722 * linearize(hexToChannel(value, 4))
  );
};

export const contrastText = (background: string) =>
  relativeLuminance(background) > 0.54 ? '#102027' : '#FFFFFF';

export const getThemeColors = (preset: ThemePreset, isDark: boolean): AppColors => {
  const safePreset = normalizeThemePreset(preset);
  const base = isDark ? darkExtended : lightExtended;
  const primary = primaryPalettes[safePreset][isDark ? 'dark' : 'light'];
  return {
    ...base,
    ...primary,
    onPrimary: contrastText(primary.primary),
  };
};

export const lightColors: AppColors = getThemeColors('default', false);
export const darkColors: AppColors = getThemeColors('default', true);
export const AppLightTheme = lightColors;
export const AppDarkTheme = darkColors;

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
    shadowColor: '#102036',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#102036',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#102036',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  drawer: {
    shadowColor: '#102036',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 16,
  },
};

export const getDrawerShadow = (isRTL: boolean): ShadowStyle => ({
  ...shadows.drawer,
  shadowOffset: { width: isRTL ? -4 : 4, height: 0 },
});

export const layout = {
  drawerWidth: 300,
  maxContentWidth: 760,
  headerHeight: 56,
  tabBarHeight: 58,
};

export const stackAnimationOptions = {
  animation: 'slide_from_right' as const,
  animationDuration: 220,
  freezeOnBlur: true,
  fullScreenGestureEnabled: true,
};

export const tabPerformanceOptions = {
  lazy: true,
  freezeOnBlur: true,
  animation: 'fade' as const,
};

export const getStackScreenOptions = (colors: AppColors, isRTL = false) => ({
  ...stackAnimationOptions,
  animation: (isRTL ? 'slide_from_left' : 'slide_from_right') as 'slide_from_left' | 'slide_from_right',
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
  headerTitleAlign: 'center' as const,
  headerBackButtonDisplayMode: 'minimal' as const,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
});
