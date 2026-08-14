import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput, FormScrollView } from '@/components/common';
import { authService } from '@/services/authService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { validateEmail } from '@/utils/validators';
import type { AuthStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<{ email: string }>();

  const onSubmit = async ({ email }: { email: string }) => {
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
      navigation.navigate('OtpVerification', { email });
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
        <Text style={styles.icon}>🔐</Text>
        <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700' }}>
          {t('auth.forgotPasswordTitle')}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }}>
          {t('auth.forgotPasswordHint')}
        </Text>

        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.error + '15' }]}>
            <Text style={{ color: colors.error }}>{error}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="email"
          rules={{ validate: validateEmail }}
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label={t('auth.email')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<CustomInput.Icon icon="email-outline" />}
              error={errors.email?.message as string}
            />
          )}
        />

        <CustomButton title={t('auth.sendOtp')} onPress={handleSubmit(onSubmit)} loading={loading} fullWidth />
        <CustomButton title={t('auth.backToLogin')} variant="text" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
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
