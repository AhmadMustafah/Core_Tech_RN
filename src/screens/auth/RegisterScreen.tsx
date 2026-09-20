import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CustomButton,
  CustomInput,
  PasswordInput,
  FormScrollView,
  FormIntro,
  FormErrorBanner,
  formScreenStyles,
} from '@/components/common';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import {
  validateEmail,
  validateSecurePassword,
  validatePhone,
  validateName,
  validateCompany,
  validateConfirmPassword,
  withRequiredCheck,
} from '@/utils/validators';
import type { AuthStackParamList } from '@/types/navigation';
import type { RegisterRequest } from '@/types';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const defaultValues: RegisterRequest = {
  name: '',
  email: '',
  phone: '',
  company: '',
  password: '',
  confirmPassword: '',
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterRequest>({
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const password = watch('password') ?? '';

  const onInvalid = () => {
    setFormError(t('auth.formError'));
  };

  const onSubmit = (_data: RegisterRequest) => {
    setFormError(null);
    Alert.alert(t('auth.registrationUnavailable'), t('auth.registrationUnavailableBody'), [
      { text: t('auth.ok') },
    ]);
  };

  const fields = [
    {
      name: 'name' as const,
      label: t('auth.fullName'),
      icon: 'account-outline',
      validate: withRequiredCheck((v: string) => validateName(v ?? '', t('auth.fullName')), 'validation.nameRequired'),
      keyboard: 'default' as const,
      secure: false,
      showStrength: false,
    },
    {
      name: 'email' as const,
      label: t('auth.email'),
      icon: 'email-outline',
      validate: withRequiredCheck((v: string) => validateEmail(v ?? ''), 'validation.emailRequired'),
      keyboard: 'email-address' as const,
      secure: false,
      showStrength: false,
    },
    {
      name: 'phone' as const,
      label: t('auth.phone'),
      icon: 'phone-outline',
      validate: withRequiredCheck((v: string) => validatePhone(v ?? ''), 'validation.phoneRequired'),
      keyboard: 'phone-pad' as const,
      secure: false,
      showStrength: false,
    },
    {
      name: 'company' as const,
      label: t('auth.company'),
      icon: 'office-building-outline',
      validate: withRequiredCheck((v: string) => validateCompany(v ?? ''), 'validation.companyRequired'),
      keyboard: 'default' as const,
      secure: false,
      showStrength: false,
    },
    {
      name: 'password' as const,
      label: t('auth.password'),
      icon: 'lock-outline',
      validate: withRequiredCheck((v: string) => validateSecurePassword(v ?? ''), 'validation.passwordRequired'),
      keyboard: 'default' as const,
      secure: true,
      showStrength: true,
    },
    {
      name: 'confirmPassword' as const,
      label: t('auth.confirmPassword'),
      icon: 'lock-check-outline',
      validate: withRequiredCheck((v: string) => validateConfirmPassword(password, v ?? ''), 'validation.confirmRequired'),
      keyboard: 'default' as const,
      secure: true,
      showStrength: false,
    },
  ];

  return (
    <FormScrollView
      style={[formScreenStyles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={formScreenStyles.content}>
        <FormIntro
          icon="account-plus-outline"
          title={t('auth.createAccount')}
          description={t('auth.registerSubtitle')}
        />

        <FormErrorBanner message={formError} />

        {fields.map(field => (
          <Controller
            key={field.name}
            control={control}
            name={field.name}
            rules={{ validate: field.validate }}
            render={({ field: { onChange, onBlur, value } }) =>
              field.secure ? (
                <PasswordInput
                  label={field.label}
                  value={value ?? ''}
                  onChangeText={text => {
                    onChange(text);
                    if (formError) setFormError(null);
                  }}
                  onBlur={onBlur}
                  showStrength={field.showStrength}
                  autoComplete={field.name === 'password' ? 'password-new' : 'password'}
                  required
                  error={errors[field.name]?.message as string}
                />
              ) : (
                <CustomInput
                  label={field.label}
                  value={value ?? ''}
                  onChangeText={text => {
                    onChange(text);
                    if (formError) setFormError(null);
                  }}
                  onBlur={onBlur}
                  keyboardType={field.keyboard}
                  autoCapitalize={field.name === 'email' ? 'none' : 'sentences'}
                  left={<CustomInput.Icon icon={field.icon} />}
                  required
                  error={errors[field.name]?.message as string}
                />
              )
            }
          />
        ))}

        <CustomButton
          title={t('auth.createAccount')}
          onPress={handleSubmit(onSubmit, onInvalid)}
          fullWidth
          style={formScreenStyles.submit}
        />

        <CustomButton
          title={t('auth.alreadyHaveAccount')}
          variant="text"
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: spacing.md }}
        />
    </FormScrollView>
  );
};
