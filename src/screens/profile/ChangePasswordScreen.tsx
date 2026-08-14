import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, PasswordInput, FormScrollView } from '@/components/common';
import { authService } from '@/services/authService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import {
  validateLoginPassword,
  validateSecurePassword,
  validateConfirmPassword,
} from '@/utils/validators';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ChangePassword'>;

export const ChangePasswordScreen: React.FC<Props> = () => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { control, handleSubmit, watch, formState: { errors } } = useForm<{
    currentPassword: string; newPassword: string; confirmPassword: string;
  }>();
  const newPassword = watch('newPassword');

  const onSubmit = async ({ currentPassword, newPassword: pwd }: { currentPassword: string; newPassword: string }) => {
    setLoading(true); setError(null);
    try {
      await authService.changePassword(currentPassword, pwd);
      setSuccess(true);
    } catch (err) {
      setError(authService.getErrorMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <FormScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
        <Text variant="titleLarge" style={{ color: colors.text, marginBottom: spacing.lg }}>{t('profile.changePassword')}</Text>
        {error && <Text style={{ color: colors.error, marginBottom: spacing.md }}>{error}</Text>}
        <Controller control={control} name="currentPassword" rules={{ validate: validateLoginPassword }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput label={t('profile.currentPassword')} value={value} onChangeText={onChange} onBlur={onBlur}
              autoComplete="current-password" error={errors.currentPassword?.message as string} />
          )} />
        <Controller control={control} name="newPassword" rules={{ validate: validateSecurePassword }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput label={t('auth.newPassword')} value={value} onChangeText={onChange} onBlur={onBlur}
              showStrength autoComplete="password-new" error={errors.newPassword?.message as string} />
          )} />
        <Controller control={control} name="confirmPassword" rules={{ validate: v => validateConfirmPassword(newPassword, v) }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput label={t('auth.confirmPassword')} value={value} onChangeText={onChange} onBlur={onBlur}
              autoComplete="password-new" error={errors.confirmPassword?.message as string} />
          )} />
        <CustomButton title={t('profile.changePassword')} onPress={handleSubmit(onSubmit)} loading={loading} fullWidth />
      <Snackbar visible={success} onDismiss={() => setSuccess(false)}>{t('profile.passwordChanged')}</Snackbar>
    </FormScrollView>
  );
};

const styles = StyleSheet.create({ scroll: { padding: spacing.md, paddingBottom: spacing.xxl } });
