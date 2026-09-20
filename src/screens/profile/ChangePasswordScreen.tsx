import React, { useState } from 'react';
import { Portal, Snackbar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CustomButton,
  PasswordInput,
  FormScrollView,
  FormIntro,
  FormErrorBanner,
  formScreenStyles,
} from '@/components/common';
import { authService } from '@/services/authService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import {
  validateLoginPassword,
  validateSecurePassword,
  validateConfirmPassword,
  withRequiredCheck,
} from '@/utils/validators';
import type { ProfileStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ChangePassword'>;

export const ChangePasswordScreen: React.FC<Props> = () => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
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
    <>
      <FormScrollView
        centerContent
        style={[formScreenStyles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={formScreenStyles.content}>
        <FormIntro
          icon="lock-reset"
          title={t('form.changePasswordTitle')}
          description={t('form.changePasswordHint')}
        />
        <FormErrorBanner message={error} />
        <Controller control={control} name="currentPassword" rules={{ validate: withRequiredCheck(validateLoginPassword, 'validation.passwordRequired') }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput label={t('profile.currentPassword')} value={value} onChangeText={onChange} onBlur={onBlur}
              autoComplete="current-password" required error={errors.currentPassword?.message as string} />
          )} />
        <Controller control={control} name="newPassword" rules={{ validate: withRequiredCheck(validateSecurePassword, 'validation.passwordRequired') }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput label={t('auth.newPassword')} value={value} onChangeText={onChange} onBlur={onBlur}
              showStrength autoComplete="password-new" required error={errors.newPassword?.message as string} />
          )} />
        <Controller control={control} name="confirmPassword" rules={{ validate: withRequiredCheck(v => validateConfirmPassword(newPassword, v), 'validation.confirmRequired') }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput label={t('auth.confirmPassword')} value={value} onChangeText={onChange} onBlur={onBlur}
              autoComplete="password-new" required error={errors.confirmPassword?.message as string} />
          )} />
        <CustomButton
          title={t('profile.changePassword')}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
          style={formScreenStyles.submit}
        />
      </FormScrollView>
      <Portal>
        <Snackbar visible={success} onDismiss={() => setSuccess(false)}>{t('profile.passwordChanged')}</Snackbar>
      </Portal>
    </>
  );
};
