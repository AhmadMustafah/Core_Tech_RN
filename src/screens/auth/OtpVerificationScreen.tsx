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
import { validateOtp, withRequiredCheck } from '@/utils/validators';
import type { AuthStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export const OtpVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { otp: '' },
  });

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
      centerContent
      style={[formScreenStyles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={formScreenStyles.content}>
        <FormIntro
          icon="shield-key-outline"
          title={t('auth.verifyOtpTitle')}
          description={t('auth.verifyOtpHint', { email })}
        />

        <FormErrorBanner message={error} />

        <Controller
          control={control}
          name="otp"
          rules={{ validate: withRequiredCheck(validateOtp, 'validation.otpRequired') }}
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label={t('auth.otpCode')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="number-pad"
              maxLength={6}
              left={<CustomInput.Icon icon="shield-check-outline" />}
              required
              error={errors.otp?.message as string}
            />
          )}
        />

        <CustomButton
          title={t('auth.verifyOtp')}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
          style={formScreenStyles.submit}
        />
        <CustomButton title={t('auth.back')} variant="text" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
    </FormScrollView>
  );
};
