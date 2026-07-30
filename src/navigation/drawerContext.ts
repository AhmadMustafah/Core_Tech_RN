import { createContext, useContext } from 'react';
import type { NavigationProp } from '@react-navigation/native';
import type { MainTabParamList } from '@/types/navigation';

export type DrawerContextValue = {
  openDrawer: () => void;
  closeDrawer: (onClosed?: () => void) => void;
  setTabNavigation: (navigation: NavigationProp<MainTabParamList> | null) => void;
};

export const DrawerContext = createContext<DrawerContextValue | null>(null);

export const useDrawer = (): DrawerContextValue => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within DrawerNavigator');
  }
  return context;
};
