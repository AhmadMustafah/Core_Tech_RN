import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput, FormScrollView } from '@/components/common';
import { authService } from '@/services/authService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { validateOtp } from '@/utils/validators';
import type { AuthStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export const OtpVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const { colors } = useAppTheme();
  const { t } = useLocalization();
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
    <FormScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.icon}>📱</Text>
        <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700' }}>
          {t('auth.verifyOtpTitle')}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }}>
          {t('auth.verifyOtpHint', { email })}
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
              label={t('auth.otpCode')}
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

        <CustomButton title={t('auth.verifyOtp')} onPress={handleSubmit(onSubmit)} loading={loading} fullWidth />
        <CustomButton title={t('auth.back')} variant="text" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
      </View>
    </FormScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  icon: { fontSize: 56, textAlign: 'center', marginBottom: spacing.lg },
  errorBox: { padding: spacing.md, borderRadius: 8, marginBottom: spacing.md },
});
