import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { APP_NAME, APP_VERSION } from '@/constants';
import { spacing } from '@/theme';

export const AboutAppScreen: React.FC = () => {
  const { colors } = useAppTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>🏢</Text>
        <Text variant="headlineMedium" style={{ color: colors.text, fontWeight: '700' }}>{APP_NAME}</Text>
        <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>Version {APP_VERSION}</Text>
      </View>
      <Text variant="bodyMedium" style={{ color: colors.text, lineHeight: 24, marginBottom: spacing.lg }}>
        CoreTech Enterprise is a comprehensive Business Management (ERP) mobile application designed for small and medium businesses. Manage inventory, sales, purchases, customers, and suppliers from your mobile device.
      </Text>
      <Text variant="titleMedium" style={{ color: colors.text, fontWeight: '600', marginBottom: spacing.sm }}>Features</Text>
      {['Dashboard & Analytics', 'Inventory Management', 'Sales & Invoicing', 'Purchase Orders', 'Customer Management', 'Supplier Management', 'Notifications', 'Dark Mode Support'].map(f => (
        <Text key={f} variant="bodyMedium" style={{ color: colors.textSecondary, marginBottom: spacing.xs }}>• {f}</Text>
      ))}
      <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: spacing.xl, textAlign: 'center' }}>
        © 2024 CoreTech Enterprise. Final Year Project.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { fontSize: 64, marginBottom: spacing.md },
});
