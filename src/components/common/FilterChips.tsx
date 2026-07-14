import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Chip } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme';

interface FilterChipsProps {
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  showAll?: boolean;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  selected,
  onSelect,
  showAll = true,
}) => {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}>
      {showAll && (
        <Chip
          selected={selected === null}
          onPress={() => onSelect(null)}
          style={styles.chip}
          selectedColor={colors.primary}
          showSelectedOverlay>
          All
        </Chip>
      )}
      {options.map(option => (
        <Chip
          key={option}
          selected={selected === option}
          onPress={() => onSelect(option)}
          style={styles.chip}
          selectedColor={colors.primary}
          showSelectedOverlay>
          {option}
        </Chip>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  content: {
    paddingRight: spacing.md,
  },
  chip: {
    marginRight: spacing.sm,
  },
});
