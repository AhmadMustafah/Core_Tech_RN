import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, FormCard, FormIntro, FormScrollView, PasswordInput } from '@/components/common';
import { authService } from '@/services/authService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import {
  validateSecurePassword,
  validateConfirmPassword,
} from '@/utils/validators';
import type { AuthStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

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
    if (loading) return;
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
    <FormScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <FormIntro icon="lock-reset" description={t('auth.resetPasswordHint')} />
      {error ? (
        <View style={[styles.errorBox, { backgroundColor: colors.error + '15' }]}>
          <Text style={{ color: colors.error }}>{error}</Text>
        </View>
      ) : null}
      <FormCard title={t('form.securitySection')}>
        <Controller
          control={control}
          name="password"
          rules={{ validate: validateSecurePassword }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label={t('auth.newPassword')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              showStrength
              autoComplete="password-new"
              error={errors.password?.message as string}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          rules={{ validate: v => validateConfirmPassword(password, v) }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label={t('auth.confirmPassword')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoComplete="password-new"
              error={errors.confirmPassword?.message as string}
            />
          )}
        />
      </FormCard>
      <CustomButton title={t('auth.resetPassword')} onPress={handleSubmit(onSubmit)} loading={loading} fullWidth />
      <Snackbar visible={success} onDismiss={() => setSuccess(false)}>
        {t('auth.resetSuccess')}
      </Snackbar>
    </FormScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  errorBox: { padding: spacing.md, borderRadius: 8, marginBottom: spacing.md },
});
