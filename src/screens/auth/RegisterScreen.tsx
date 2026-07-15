import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput, PasswordInput } from '@/components/common';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  validateEmail,
  validateSecurePassword,
  validatePhone,
  validateName,
  validateCompany,
  validateConfirmPassword,
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
    setFormError('Please fill in all required fields correctly.');
  };

  const onSubmit = (_data: RegisterRequest) => {
    setFormError(null);
    Alert.alert(
      'Registration Unavailable',
      'Backend APIs are not connected yet, so signup is not available at this time.\n\nPlease use the demo login account:\nEmail: ahmed@coretech.com\nPassword: password123',
      [{ text: 'OK' }],
    );
  };

  const fields = [
    {
      name: 'name' as const,
      label: 'Full Name',
      icon: 'account-outline',
      validate: (v: string) => validateName(v ?? '', 'Full name'),
      keyboard: 'default' as const,
      secure: false,
      showStrength: false,
    },
    {
      name: 'email' as const,
      label: 'Email',
      icon: 'email-outline',
      validate: (v: string) => validateEmail(v ?? ''),
      keyboard: 'email-address' as const,
      secure: false,
      showStrength: false,
    },
    {
      name: 'phone' as const,
      label: 'Phone',
      icon: 'phone-outline',
      validate: (v: string) => validatePhone(v ?? ''),
      keyboard: 'phone-pad' as const,
      secure: false,
      showStrength: false,
    },
    {
      name: 'company' as const,
      label: 'Company',
      icon: 'office-building-outline',
      validate: (v: string) => validateCompany(v ?? ''),
      keyboard: 'default' as const,
      secure: false,
      showStrength: false,
    },
    {
      name: 'password' as const,
      label: 'Password',
      icon: 'lock-outline',
      validate: (v: string) => validateSecurePassword(v ?? ''),
      keyboard: 'default' as const,
      secure: true,
      showStrength: true,
    },
    {
      name: 'confirmPassword' as const,
      label: 'Confirm Password',
      icon: 'lock-check-outline',
      validate: (v: string) => validateConfirmPassword(password, v ?? ''),
      keyboard: 'default' as const,
      secure: true,
      showStrength: false,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text variant="headlineMedium" style={{ color: colors.text, fontWeight: '700' }}>
          Create Account
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginBottom: spacing.lg }}>
          Register your business account
        </Text>

        {formError && (
          <View style={[styles.errorBox, { backgroundColor: colors.error + '15' }]}>
            <Text style={{ color: colors.error }}>{formError}</Text>
          </View>
        )}

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
                  error={errors[field.name]?.message as string}
                />
              )
            }
          />
        ))}

        <CustomButton
          title="Create Account"
          onPress={handleSubmit(onSubmit, onInvalid)}
          fullWidth
          style={{ marginTop: spacing.md }}
        />

        <CustomButton
          title="Already have an account? Sign In"
          variant="text"
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  errorBox: {
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
});
