import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput } from '@/components/common';
import { authService } from '@/services/authService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { validateOtp } from '@/utils/validators';
import type { AuthStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export const OtpVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<{ otp: string }>();

  const onSubmit = async ({ otp }: { otp: string }) => {
    setLoading(true);
    setError(null);
    try {
      await authService.verifyOtp(email, otp);
      navigation.navigate('ResetPassword', { email, otp });
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
        <Text style={styles.icon}>📱</Text>
        <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700' }}>
          Verify OTP
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }}>
          Enter the 6-digit OTP sent to {email}. Demo OTP: 123456
        </Text>

        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.error + '15' }]}>
            <Text style={{ color: colors.error }}>{error}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="otp"
          rules={{ validate: validateOtp }}
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="OTP Code"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="number-pad"
              maxLength={6}
              left={<CustomInput.Icon icon="shield-check-outline" />}
              error={errors.otp?.message as string}
            />
          )}
        />

        <CustomButton title="Verify OTP" onPress={handleSubmit(onSubmit)} loading={loading} fullWidth />
        <CustomButton title="Back" variant="text" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  icon: { fontSize: 56, textAlign: 'center', marginBottom: spacing.lg },
  errorBox: { padding: spacing.md, borderRadius: 8, marginBottom: spacing.md },
});
