import React, { memo, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { ActivityIndicator, Icon, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { isTranslationKey } from '@/localization';
import { borderRadius, spacing } from '@/theme';
import { EmptyState } from './EmptyState';
import { FieldLabel } from './FieldLabel';

export type AppSelectOption = {
  value: string;
  label: string;
  subtitle?: string;
};

type AppSelectProps = {
  label?: string;
  placeholder: string;
  value: string | null;
  options: AppSelectOption[];
  onChange: (value: string | null, option?: AppSelectOption) => void;
  variant?: 'sheet' | 'compact';
  searchable?: boolean;
  loading?: boolean;
  clearable?: boolean;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  icon?: string;
  error?: string;
  resetOnSelect?: boolean;
};

const SEARCH_THRESHOLD = 6;

export const AppSelect: React.FC<AppSelectProps> = memo(
  ({
    label,
    placeholder,
    value,
    options,
    onChange,
    variant,
    searchable,
    loading = false,
    clearable = false,
    required = false,
    optional = false,
    disabled = false,
    icon,
    error,
    resetOnSelect = false,
  }) => {
    const { colors } = useAppTheme();
    const { t, isRTL, directionStyle } = useLocalization();
    const insets = useSafeAreaInsets();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    const resolvedVariant =
      variant ?? (options.length > SEARCH_THRESHOLD ? 'sheet' : 'compact');
    const showSearch = searchable ?? resolvedVariant === 'sheet';
    const selected = options.find(option => option.value === value);
    const textAlign = isRTL ? 'right' : 'left';
    const errorText = error && isTranslationKey(error) ? t(error) : error;

    const filtered = useMemo(() => {
      const needle = query.trim().toLowerCase();
      if (!needle) {
        return options;
      }
      return options.filter(
        option =>
          option.label.toLowerCase().includes(needle) ||
          (option.subtitle || '').toLowerCase().includes(needle),
      );
    }, [options, query]);

    const close = () => {
      setOpen(false);
      setQuery('');
    };

    const selectOption = (option: AppSelectOption) => {
      onChange(resetOnSelect ? null : option.value, option);
      close();
    };

    const clearSelection = () => {
      onChange(null);
      close();
    };

    return (
      <View style={styles.field}>
        <FieldLabel label={label} required={required} optional={optional} />

        <Pressable
          disabled={disabled || loading}
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={label || placeholder}
          style={({ pressed }) => [
            styles.trigger,
            {
              backgroundColor: colors.surface,
              borderColor: error ? colors.error : colors.border,
              opacity: disabled ? 0.55 : pressed ? 0.86 : 1,
            },
          ]}>
          {icon ? <Icon source={icon} size={20} color={colors.primary} /> : null}
          <View style={styles.triggerCopy}>
            <Text
              numberOfLines={1}
              style={[
                selected ? styles.valueText : styles.placeholder,
                { color: selected ? colors.text : colors.textMuted, textAlign },
                directionStyle,
              ]}>
              {selected?.label || placeholder}
            </Text>
            {selected?.subtitle ? (
              <Text
                numberOfLines={1}
                style={[{ color: colors.textSecondary, textAlign, marginTop: 2 }, directionStyle]}>
                {selected.subtitle}
              </Text>
            ) : null}
          </View>
          {loading ? (
            <ActivityIndicator size={18} color={colors.primary} />
          ) : (
            <Icon source="chevron-down" size={22} color={colors.textMuted} />
          )}
        </Pressable>

        {errorText ? (
          <Text style={[styles.error, { color: colors.error, textAlign }, directionStyle]}>{errorText}</Text>
        ) : null}

        <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
          <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={close}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetWrap}>
              <Pressable
                onPress={event => event.stopPropagation()}
                style={[
                  styles.sheet,
                  {
                    backgroundColor: colors.surface,
                    maxHeight: resolvedVariant === 'compact' ? '56%' : '78%',
                    paddingBottom: Math.max(insets.bottom, spacing.md),
                  },
                ]}>
                <View style={[styles.handle, { backgroundColor: colors.border }]} />
                <View style={styles.sheetHeader}>
                  <Text variant="titleMedium" style={[{ color: colors.text, flex: 1, textAlign }, directionStyle]}>
                    {label || placeholder}
                  </Text>
                  <Pressable onPress={close} hitSlop={8} accessibilityRole="button">
                    <Icon source="close" size={22} color={colors.textSecondary} />
                  </Pressable>
                </View>

                {showSearch ? (
                  <TextInput
                    mode="outlined"
                    value={query}
                    onChangeText={setQuery}
                    placeholder={t('select.search')}
                    left={<TextInput.Icon icon="magnify" />}
                    style={[styles.search, { backgroundColor: colors.background }]}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                    placeholderTextColor={colors.textMuted}
                  />
                ) : null}

                {clearable && value ? (
                  <Pressable onPress={clearSelection} style={styles.clearRow}>
                    <Icon source="close-circle-outline" size={18} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{t('select.clear')}</Text>
                  </Pressable>
                ) : null}

                {loading ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, marginTop: spacing.sm }}>
                      {t('select.loading')}
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={filtered}
                    keyExtractor={item => item.value}
                    keyboardShouldPersistTaps="handled"
                    initialNumToRender={12}
                    windowSize={7}
                    ListEmptyComponent={
                      <EmptyState icon="magnify" title={t('select.empty')} message={t('select.emptyMsg')} />
                    }
                    renderItem={({ item }) => {
                      const isSelected = item.value === value;
                      return (
                        <Pressable
                          onPress={() => selectOption(item)}
                          style={({ pressed }) => [
                            styles.option,
                            {
                              backgroundColor: isSelected
                                ? colors.primaryMuted
                                : pressed
                                  ? colors.surfaceVariant
                                  : 'transparent',
                            },
                          ]}>
                          <View style={styles.optionCopy}>
                            <Text
                              style={[
                                { color: colors.text, fontWeight: isSelected ? '700' : '600', textAlign },
                                directionStyle,
                              ]}>
                              {item.label}
                            </Text>
                            {item.subtitle ? (
                              <Text
                                variant="bodySmall"
                                style={[{ color: colors.textSecondary, marginTop: 2, textAlign }, directionStyle]}>
                                {item.subtitle}
                              </Text>
                            ) : null}
                          </View>
                          {isSelected ? (
                            <Icon source="check" size={20} color={colors.primary} />
                          ) : null}
                        </Pressable>
                      );
                    }}
                  />
                )}
              </Pressable>
            </KeyboardAvoidingView>
          </Pressable>
        </Modal>
      </View>
    );
  },
);

AppSelect.displayName = 'AppSelect';

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.md,
  },
  trigger: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  triggerCopy: {
    flex: 1,
    minWidth: 0,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    fontSize: 16,
  },
  error: {
    marginTop: spacing.xs,
    fontSize: 12,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  search: {
    marginBottom: spacing.sm,
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  loadingBox: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  optionCopy: {
    flex: 1,
    minWidth: 0,
  },
});
