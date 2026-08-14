import React, { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setNotificationsEnabled, updateAppPreferences } from '@/redux/slices/settingsSlice';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';
import { SettingsHint, SettingsNavRow, SettingsSection, SettingsToggleRow } from './settingsUi';

type Props = NativeStackScreenProps<ProfileStackParamList, 'NotificationSettings'>;

export const NotificationSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const notificationsEnabled = useAppSelector(state => state.settings.notificationsEnabled);
  const preferences = useAppSelector(state => state.settings.preferences);

  const handleMaster = useCallback(
    async (value: boolean) => {
      dispatch(setNotificationsEnabled(value));
      await storage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, value);
    },
    [dispatch],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <SettingsHint>{t('settings.notificationsHint')}</SettingsHint>
      <SettingsSection title={t('settings.notifications')}>
        <SettingsToggleRow
          icon="bell-outline"
          title={t('settings.notificationsMaster')}
          description={t('settings.notificationsMasterDesc')}
          value={notificationsEnabled}
          onValueChange={handleMaster}
          last
        />
      </SettingsSection>

      <SettingsSection title={t('settings.notificationTypes')}>
        <SettingsToggleRow
          icon="cart-outline"
          title={t('settings.notifySales')}
          description={t('settings.notifySalesDesc')}
          value={preferences.notifySales}
          disabled={!notificationsEnabled}
          onValueChange={value => dispatch(updateAppPreferences({ notifySales: value }))}
        />
        <SettingsToggleRow
          icon="truck-outline"
          title={t('settings.notifyPurchases')}
          description={t('settings.notifyPurchasesDesc')}
          value={preferences.notifyPurchases}
          disabled={!notificationsEnabled}
          onValueChange={value => dispatch(updateAppPreferences({ notifyPurchases: value }))}
        />
        <SettingsToggleRow
          icon="alert-outline"
          title={t('settings.notifyLowStock')}
          description={t('settings.notifyLowStockDesc')}
          value={preferences.notifyLowStock}
          disabled={!notificationsEnabled}
          onValueChange={value => dispatch(updateAppPreferences({ notifyLowStock: value }))}
        />
        <SettingsToggleRow
          icon="clipboard-text-outline"
          title={t('settings.notifyOrders')}
          description={t('settings.notifyOrdersDesc')}
          value={preferences.notifyOrders}
          disabled={!notificationsEnabled}
          onValueChange={value => dispatch(updateAppPreferences({ notifyOrders: value }))}
          last
        />
      </SettingsSection>

      <SettingsSection>
        <SettingsNavRow
          icon="inbox-outline"
          title={t('settings.viewInbox')}
          description={t('settings.viewInboxDesc')}
          last
          onPress={() => navigation.navigate('Notifications')}
        />
      </SettingsSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xxl },
});
