import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme';
import { useLocalization } from '@/hooks/useLocalization';
import { InitialsAvatar } from './InitialsAvatar';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showAvatar?: boolean;
  userName?: string;
  imageUri?: string | null;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showAvatar,
  userName,
  imageUri,
}) => {
  const { colors } = useAppTheme();
  const { directionStyle } = useLocalization();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text variant="headlineSmall" style={[{ color: colors.text, fontWeight: '700' }, directionStyle]}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodyMedium" style={[{ color: colors.textSecondary, marginTop: 4 }, directionStyle]}>
            {subtitle}
          </Text>
        )}
      </View>
      {showAvatar ? (
        <InitialsAvatar name={userName} imageUri={imageUri} size={44} />
      ) : null}
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
    paddingEnd: spacing.md,
  },
});
