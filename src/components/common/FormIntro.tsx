import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { borderRadius, spacing } from '@/theme';

type FormIntroProps = {
  icon: string;
  title: string;
  description: string;
};

export const FormIntro: React.FC<FormIntroProps> = ({ icon, title, description }) => {
  const { colors } = useAppTheme();
  const { isRTL, directionStyle } = useLocalization();
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}>
        <Icon source={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text
          variant="titleMedium"
          style={[styles.title, { color: colors.text, textAlign }, directionStyle]}>
          {title}
        </Text>
        <Text
          variant="bodySmall"
          style={[styles.description, { color: colors.textSecondary, textAlign }, directionStyle]}>
          {description}
        </Text>
      </View>
    </View>
  );
};

export const FormErrorBanner: React.FC<{ message?: string | null }> = ({ message }) => {
  const { colors } = useAppTheme();
  const { isRTL, directionStyle } = useLocalization();

  if (!message) {
    return null;
  }

  return (
    <View style={[styles.errorBox, { backgroundColor: `${colors.error}18` }]}>
      <Text style={[{ color: colors.error, textAlign: isRTL ? 'right' : 'left' }, directionStyle]}>
        {message}
      </Text>
    </View>
  );
};

export const formScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  submit: {
    marginTop: spacing.sm,
  },
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: spacing.md,
  },
  copy: {
    flex: 1,
    paddingTop: 1,
  },
  title: {
    fontWeight: '700',
  },
  description: {
    marginTop: 4,
    lineHeight: 18,
  },
  errorBox: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
});
