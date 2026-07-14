import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getInitials } from '@/utils/formatters';
import { spacing } from '@/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showAvatar?: boolean;
  userName?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showAvatar,
  userName,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700' }}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginTop: 4 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {showAvatar && userName && (
        <Avatar.Text
          size={44}
          label={getInitials(userName)}
          style={{ backgroundColor: colors.primary }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
});
