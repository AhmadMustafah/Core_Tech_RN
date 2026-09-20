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
  validateSecurePassword,
  validateConfirmPassword,
  withRequiredCheck,
} from '@/utils/validators';
import type { AuthStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email, otp } = route.params;
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async ({ password: newPassword }: { password: string }) => {
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email, otp, newPassword);
      setSuccess(true);
      setTimeout(() => navigation.navigate('Login'), 2000);
    } catch (err) {
      setError(authService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormScrollView
        centerContent
        style={[formScreenStyles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={formScreenStyles.content}>
        <FormIntro
          icon="lock-reset"
          title={t('auth.resetPasswordTitle')}
          description={t('auth.resetPasswordHint')}
        />

        <FormErrorBanner message={error} />

        <Controller
          control={control}
          name="password"
          rules={{ validate: withRequiredCheck(validateSecurePassword, 'validation.passwordRequired') }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label={t('auth.newPassword')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              showStrength
              autoComplete="password-new"
              required
              error={errors.password?.message as string}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          rules={{ validate: withRequiredCheck(v => validateConfirmPassword(password, v), 'validation.confirmRequired') }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label={t('auth.confirmPassword')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoComplete="password-new"
              required
              error={errors.confirmPassword?.message as string}
            />
          )}
        />

        <CustomButton
          title={t('auth.resetPassword')}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
          style={formScreenStyles.submit}
        />
      </FormScrollView>
      <Portal>
        <Snackbar visible={success} onDismiss={() => setSuccess(false)}>
          {t('auth.resetSuccess')}
        </Snackbar>
      </Portal>
    </>
  );
};
