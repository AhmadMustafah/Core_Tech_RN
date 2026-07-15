import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, PasswordInput } from '@/components/common';
import { authService } from '@/services/authService';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  validateSecurePassword,
  validateConfirmPassword,
  validateLoginPassword,
} from '@/utils/validators';
import type { AuthStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email, otp } = route.params;
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<{
    password: string;
    confirmPassword: string;
  }>();

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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Text style={styles.icon}>🔑</Text>
        <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700' }}>
          Reset Password
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }}>
          Create a new password for your account
        </Text>

        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.error + '15' }]}>
            <Text style={{ color: colors.error }}>{error}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="password"
          rules={{ validate: validateSecurePassword }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label="New Password"
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
              label="Confirm Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoComplete="password-new"
              error={errors.confirmPassword?.message as string}
            />
          )}
        />

        <CustomButton title="Reset Password" onPress={handleSubmit(onSubmit)} loading={loading} fullWidth />
      </View>

      <Snackbar visible={success} onDismiss={() => setSuccess(false)}>
        Password reset successfully! Redirecting to login...
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  icon: { fontSize: 56, textAlign: 'center', marginBottom: spacing.lg },
  errorBox: { padding: spacing.md, borderRadius: 8, marginBottom: spacing.md },
});
