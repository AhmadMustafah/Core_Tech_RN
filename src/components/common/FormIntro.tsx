import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { borderRadius, spacing, typography } from '@/theme';

type Props = {
  icon: string;
  description: string;
};

export const FormIntro: React.FC<Props> = ({ icon, description }) => {
  const { colors } = useAppTheme();
  const { directionStyle } = useLocalization();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}>
        <Icon source={icon} size={22} color={colors.primary} />
      </View>
      <Text style={[styles.text, directionStyle, { color: colors.textSecondary }]}>{description}</Text>
    </View>
  );
};

export const FormCard: React.FC<{ title?: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.cardWrap}>
      {title ? (
        <Text style={[styles.cardTitle, { color: colors.textMuted }]}>{title}</Text>
      ) : null}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...(typography.bodySmall as object),
    flex: 1,
    lineHeight: 20,
  },
  cardWrap: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...(typography.label as object),
    marginBottom: spacing.sm,
    marginStart: spacing.xs,
  },
  card: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
});
