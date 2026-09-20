import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CustomButton,
  CustomInput,
  FormScrollView,
  FormIntro,
  FormErrorBanner,
  formScreenStyles,
} from '@/components/common';
import { authService } from '@/services/authService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { validateEmail, withRequiredCheck } from '@/utils/validators';
import type { AuthStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '' },
  });

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
      centerContent
      style={[formScreenStyles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={formScreenStyles.content}>
        <FormIntro
          icon="email-lock"
          title={t('auth.forgotPasswordTitle')}
          description={t('auth.forgotPasswordHint')}
        />

        <FormErrorBanner message={error} />

        <Controller
          control={control}
          name="email"
          rules={{ validate: withRequiredCheck(validateEmail, 'validation.emailRequired') }}
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label={t('auth.email')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<CustomInput.Icon icon="email-outline" />}
              required
              error={errors.email?.message as string}
            />
          )}
        />

        <CustomButton
          title={t('auth.sendOtp')}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
          style={formScreenStyles.submit}
        />
        <CustomButton title={t('auth.backToLogin')} variant="text" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
    </FormScrollView>
  );
};
