import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { APP_NAME } from '@/constants';
import { spacing } from '@/theme';

export const PrivacyPolicyScreen: React.FC = () => {
  const { colors } = useAppTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700', marginBottom: spacing.lg }}>Privacy Policy</Text>
      <Text variant="bodyMedium" style={{ color: colors.text, lineHeight: 24, marginBottom: spacing.md }}>
        {APP_NAME} respects your privacy. This policy describes how we collect, use, and protect your business data.
      </Text>
      <Text variant="titleMedium" style={{ color: colors.text, fontWeight: '600', marginBottom: spacing.sm }}>Data Collection</Text>
      <Text variant="bodyMedium" style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md }}>
        We collect business information you provide including products, sales, purchases, customers, and supplier data necessary for ERP functionality.
      </Text>
      <Text variant="titleMedium" style={{ color: colors.text, fontWeight: '600', marginBottom: spacing.sm }}>Data Security</Text>
      <Text variant="bodyMedium" style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md }}>
        Your data is encrypted in transit using HTTPS. Authentication tokens are stored securely on your device using AsyncStorage.
      </Text>
      <Text variant="titleMedium" style={{ color: colors.text, fontWeight: '600', marginBottom: spacing.sm }}>Contact</Text>
      <Text variant="bodyMedium" style={{ color: colors.textSecondary, lineHeight: 22 }}>
        For privacy concerns, contact support@coretech-enterprise.com
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.lg } });
