import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { borderRadius } from '@/theme';

type Props = {
  size?: number;
  inverted?: boolean;
};

export const BrandMark: React.FC<Props> = ({ size = 40, inverted = false }) => {
  const { colors } = useAppTheme();
  const box = size + 28;
  const backgroundColor = inverted ? 'rgba(255,255,255,0.14)' : colors.primary;
  const iconColor = inverted ? '#FFFFFF' : colors.onPrimary;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: box,
          height: box,
          borderRadius: borderRadius.lg,
          backgroundColor,
        },
      ]}>
      <Icon source="office-building" size={size} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
