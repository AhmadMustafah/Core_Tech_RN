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
  secondary: '#0F766E',
  accent: '#92400E',
  background: '#F3F5F8',
  surface: '#FFFFFF',
  surfaceVariant: '#E9EEF3',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#D5DCE5',
  error: '#B42318',
  success: '#176C45',
  warning: '#B45309',
  info: '#0369A1',
  lowStock: '#C2410C',
  cardShadow: 'rgba(15, 23, 42, 0.07)',
};

const darkSemantic: SemanticColors = {
  secondary: '#3DABA0',
  accent: '#D4A373',
  background: '#0F1419',
  surface: '#171D24',
  surfaceVariant: '#24303C',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#2D3946',
  error: '#E86A64',
  success: '#5EC98A',
  warning: '#E0A454',
  info: '#5BA8D4',
  lowStock: '#E8956A',
  cardShadow: 'rgba(0, 0, 0, 0.4)',
};

const lightExtended: ExtendedBaseColors = {
  ...lightSemantic,
  surfaceElevated: '#FFFFFF',
  drawerSurface: '#FFFFFF',
  textMuted: '#64748B',
  borderLight: '#E8EDF3',
  overlay: 'rgba(15, 23, 42, 0.48)',
};

const darkExtended: ExtendedBaseColors = {
  ...darkSemantic,
  surfaceElevated: '#1E2630',
  drawerSurface: '#171D24',
  textMuted: '#7D8B9C',
  borderLight: '#24303C',
  overlay: 'rgba(2, 6, 12, 0.62)',
};

const primaryPalettes: Record<
  ThemePreset,
  { light: PrimaryColors; dark: PrimaryColors }
> = {
  default: {
    light: {
      primary: '#1565C0',
      primaryDark: '#0D47A1',
      primaryMuted: '#E8F1FA',
      drawerHeader: '#0D47A1',
    },
    dark: {
      primary: '#4D9DE0',
      primaryDark: '#1565C0',
      primaryMuted: '#13283C',
      drawerHeader: '#0D47A1',
    },
  },
  ocean: {
    light: {
      primary: '#0274B3',
      primaryDark: '#0369A1',
      primaryMuted: '#E4F3FB',
      drawerHeader: '#0369A1',
    },
    dark: {
      primary: '#4DB5E0',
      primaryDark: '#0284C7',
      primaryMuted: '#0C3A54',
      drawerHeader: '#0369A1',
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
  { id: 'default', label: 'Default', swatch: '#1565C0' },
  { id: 'ocean', label: 'Ocean', swatch: '#0274B3' },
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
