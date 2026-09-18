import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { borderRadius, spacing } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder,
}) => {
  const { colors } = useAppTheme();
  const { t, isRTL } = useLocalization();

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder ?? t('common.search')}
        onChangeText={onChangeText}
        value={value}
        style={[styles.searchbar, { backgroundColor: colors.surface }]}
        inputStyle={{
          color: colors.text,
          textAlign: isRTL ? 'right' : 'left',
          writingDirection: isRTL ? 'rtl' : 'ltr',
        }}
        iconColor={colors.textSecondary}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  searchbar: {
    borderRadius: borderRadius.md,
    elevation: 0,
  },
});
