import type { TextStyle, ViewStyle } from 'react-native';

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

const NAVY = '#1A3E66';
const NAVY_DEEP = '#122C4A';
const STEEL = '#4E8BC4';

const brightColors: AppColors = {
  primary: NAVY,
  primaryDark: NAVY_DEEP,
  primaryMuted: '#E6EEF6',
  secondary: '#3D5A73',
  accent: NAVY,
  background: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceVariant: '#EEF1F5',
  drawerSurface: '#FFFFFF',
  drawerHeader: NAVY_DEEP,
  text: '#1A2332',
  textSecondary: '#4A5568',
  textMuted: '#6B7785',
  border: '#D7DEE6',
  borderLight: '#E8EDF2',
  error: '#9B3B34',
  success: '#2F6B52',
  warning: '#8A6A24',
  info: NAVY,
  lowStock: '#8A4A28',
  cardShadow: 'rgba(18, 32, 48, 0.05)',
  overlay: 'rgba(18, 32, 48, 0.44)',
  onPrimary: '#FFFFFF',
};

const darkColors: AppColors = {
  primary: STEEL,
  primaryDark: '#3A6FA3',
  primaryMuted: '#1A2838',
  secondary: '#8AA4BB',
  accent: STEEL,
  background: '#0D131A',
  surface: '#151C26',
  surfaceElevated: '#1B2430',
  surfaceVariant: '#222C38',
  drawerSurface: '#151C26',
  drawerHeader: '#101820',
  text: '#EEF2F6',
  textSecondary: '#A7B3C2',
  textMuted: '#7E8B99',
  border: '#2A3542',
  borderLight: '#222C38',
  error: '#D08A84',
  success: '#7AAF96',
  warning: '#C4A66A',
  info: STEEL,
  lowStock: '#C49674',
  cardShadow: 'rgba(0, 0, 0, 0.36)',
  overlay: 'rgba(5, 8, 12, 0.62)',
  onPrimary: '#FFFFFF',
};

export const lightColors = brightColors;
export const AppLightTheme = brightColors;
export const AppDarkTheme = darkColors;

export const getThemeColors = (isDark: boolean): AppColors =>
  isDark ? darkColors : brightColors;

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
  tabBarHeight: 62,
};

export const listPerformanceProps = {
  initialNumToRender: 10,
  maxToRenderPerBatch: 8,
  windowSize: 7,
  updateCellsBatchingPeriod: 50,
  removeClippedSubviews: true,
};

export const listContentStyle = {
  padding: spacing.md,
  paddingBottom: 88,
  flexGrow: 1,
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
  animation: (isRTL ? 'slide_from_left' : 'slide_from_right') as
    | 'slide_from_left'
    | 'slide_from_right',
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
