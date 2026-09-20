import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getInitials } from '@/utils/formatters';

type InitialsAvatarProps = {
  name?: string | null;
  imageUri?: string | null;
  size?: number;
  backgroundColor?: string;
  labelColor?: string;
};

export const InitialsAvatar: React.FC<InitialsAvatarProps> = memo(
  ({ name, imageUri, size = 40, backgroundColor, labelColor }) => {
    const { colors } = useAppTheme();
    const trimmedImage = imageUri?.trim();

    if (trimmedImage) {
      return <Avatar.Image size={size} source={{ uri: trimmedImage }} />;
    }

    const initials = getInitials(name);
    const fontSize = Math.max(11, Math.round(size * 0.36));

    return (
      <Avatar.Text
        size={size}
        label={initials || '•'}
        color={labelColor || colors.onPrimary}
        labelStyle={[styles.label, { fontSize, lineHeight: fontSize + 2 }]}
        style={{ backgroundColor: backgroundColor || colors.primary }}
      />
    );
  },
);

InitialsAvatar.displayName = 'InitialsAvatar';

const styles = StyleSheet.create({
  label: {
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
