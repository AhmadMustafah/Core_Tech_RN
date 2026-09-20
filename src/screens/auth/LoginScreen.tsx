import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import {
  CustomButton,
  CustomInput,
  PasswordInput,
  FormScrollView,
  FormIntro,
  FormErrorBanner,
  formScreenStyles,
} from '@/components/common';
import { useAppDispatch } from '@/redux/hooks';
import { login as loginAction } from '@/redux/slices/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { validateEmail, validateLoginPassword, withRequiredCheck } from '@/utils/validators';
import { APP_NAME } from '@/constants';
import type { AuthStackParamList } from '@/types/navigation';
import type { LoginRequest } from '@/types';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const { isLoading, error, clearError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    defaultValues: { email: 'ahmed@coretech.com', password: 'password123' },
  });

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data: LoginRequest) => {
    const result = await dispatch(loginAction(data));
    if (loginAction.fulfilled.match(result)) {
      navigation.getParent()?.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }),
      );
    }
  };

  return (
    <FormScrollView
      centerContent
      style={[formScreenStyles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={formScreenStyles.content}>
        <FormIntro
          icon="office-building-outline"
          title={t('auth.welcomeBack')}
          description={t('auth.signInTo', { app: APP_NAME })}
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
              maxLength={100}
              left={<CustomInput.Icon icon="email-outline" />}
              required
              error={errors.email?.message as string}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
            rules={{ validate: withRequiredCheck(validateLoginPassword, 'validation.passwordRequired') }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label={t('auth.password')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoComplete="current-password"
              required
              error={errors.password?.message as string}
            />
          )}
        />

        <CustomButton
          title={t('auth.forgotPassword')}
          variant="text"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotButton}
        />

        <CustomButton
          title={t('auth.signIn')}
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          fullWidth
        />

        <View style={styles.footer}>
          <Text style={{ color: colors.textSecondary }}>{t('auth.noAccount')} </Text>
          <CustomButton
            title={t('auth.register')}
            variant="text"
            onPress={() => navigation.navigate('Register')}
            style={styles.registerLink}
          />
        </View>
    </FormScrollView>
  );
};

const styles = StyleSheet.create({
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  registerLink: {
    marginStart: -spacing.sm,
  },
});
