import React, { memo, createContext, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import type { NavigationProp } from '@react-navigation/native';
import type { MainTabParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { layout } from '@/theme';

export type ActiveRoute = {
  tab: keyof MainTabParamList;
  screen?: string;
};

export type DrawerContextValue = {
  openDrawer: () => void;
  closeDrawer: (onClosed?: () => void) => void;
  setTabNavigation: (navigation: NavigationProp<MainTabParamList> | null) => void;
  activeRoute: ActiveRoute | null;
  setActiveRoute: (route: ActiveRoute | null) => void;
};

export const DrawerContext = createContext<DrawerContextValue | null>(null);

export const useDrawer = (): DrawerContextValue => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within DrawerNavigator');
  }
  return context;
};

export const DrawerMenuButton = memo(() => {
  const { openDrawer } = useDrawer();
  const { colors } = useAppTheme();
  const { t } = useLocalization();

  return (
    <IconButton
      icon="menu"
      iconColor={colors.text}
      size={22}
      onPress={openDrawer}
      accessibilityLabel={t('nav.openMenu')}
      style={styles.menuButton}
    />
  );
});

DrawerMenuButton.displayName = 'DrawerMenuButton';

/** Native stack requires headerLeft to be a render function, not a component reference. */
export const renderDrawerHeaderLeft = () => <DrawerMenuButton />;

const styles = StyleSheet.create({
  menuButton: {
    marginStart: -4,
  },
});

export { layout };
