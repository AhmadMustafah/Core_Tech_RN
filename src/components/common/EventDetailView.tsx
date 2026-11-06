import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { borderRadius, spacing, typography } from '@/theme';

export type EventDetailRow = {
  icon?: string;
  label: string;
  value?: unknown;
};

export type EventDetailSection = {
  title?: string;
  rows: EventDetailRow[];
};

type Props = {
  icon: string;
  accent?: string;
  title: string;
  subtitle?: string;
  sections: EventDetailSection[];
};

export const formatDetailValue = (value: unknown): string | null => {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return null;
  }
};

export const EventDetailView: React.FC<Props> = ({
  icon,
  accent,
  title,
  subtitle,
  sections,
}) => {
  const { colors } = useAppTheme();
  const { directionStyle } = useLocalization();
  const tint = accent || colors.primary;

  const visibleSections = sections
    .map(section => ({
      ...section,
      rows: section.rows.filter(row => {
        const formatted = formatDetailValue(row.value);
        return formatted != null;
      }),
    }))
    .filter(section => section.rows.length > 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <View style={[styles.heroIcon, { backgroundColor: tint + '18' }]}>
          <Icon source={icon} size={28} color={tint} />
        </View>
        <Text style={[styles.heroTitle, directionStyle, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.heroSubtitle, directionStyle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {visibleSections.map((section, index) => (
        <View
          key={`${section.title ?? 'section'}-${index}`}
          style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          {section.title ? (
            <Text style={[styles.sectionTitle, directionStyle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
          ) : null}
          {section.rows.map((row, rowIndex) => (
            <View
              key={`${row.label}-${rowIndex}`}
              style={[
                styles.row,
                rowIndex < section.rows.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.borderLight,
                },
              ]}>
              {row.icon ? (
                <View style={[styles.rowIcon, { backgroundColor: colors.surfaceVariant }]}>
                  <Icon source={row.icon} size={18} color={colors.primary} />
                </View>
              ) : null}
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, directionStyle, { color: colors.textSecondary }]}>
                  {row.label}
                </Text>
                <Text style={[styles.rowValue, directionStyle, { color: colors.text }]}>
                  {formatDetailValue(row.value)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  hero: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...(typography.h3 as object),
    textAlign: 'center',
  },
  heroSubtitle: {
    ...(typography.body as object),
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  section: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  sectionTitle: {
    ...(typography.caption as object),
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    ...(typography.caption as object),
    marginBottom: 4,
  },
  rowValue: {
    ...(typography.body as object),
  },
});
