import React from 'react';
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { CustomButton, CustomInput } from '@/components/common';
import { useAppDispatch } from '@/redux/hooks';
import { register as registerAction } from '@/redux/slices/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
  validateConfirmPassword,
} from '@/utils/validators';
import type { AuthStackParamList } from '@/types/navigation';
import type { RegisterRequest } from '@/types';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const { isLoading, error } = useAuth();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterRequest>();

  const password = watch('password');

  const onSubmit = async (data: RegisterRequest) => {
    const result = await dispatch(registerAction(data));
    if (registerAction.fulfilled.match(result)) {
      navigation.getParent()?.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }),
      );
    }
  };

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

        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.error + '15' }]}>
            <Text style={{ color: colors.error }}>{error}</Text>
          </View>
        )}

        {(
          [
            { name: 'name' as const, label: 'Full Name', icon: 'account-outline', validate: (v: string) => validateRequired(v, 'Name') },
            { name: 'email' as const, label: 'Email', icon: 'email-outline', validate: validateEmail, keyboard: 'email-address' as const },
            { name: 'phone' as const, label: 'Phone', icon: 'phone-outline', validate: validatePhone, keyboard: 'phone-pad' as const },
            { name: 'company' as const, label: 'Company', icon: 'office-building-outline', validate: (v: string) => validateRequired(v, 'Company') },
            { name: 'password' as const, label: 'Password', icon: 'lock-outline', validate: validatePassword, secure: true },
            { name: 'confirmPassword' as const, label: 'Confirm Password', icon: 'lock-check-outline', validate: (v: string) => validateConfirmPassword(password, v), secure: true },
          ] as const
        ).map(field => (
          <Controller
            key={field.name}
            control={control}
            name={field.name}
            rules={{ validate: field.validate }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomInput
                label={field.label}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={'secure' in field ? field.secure : false}
                keyboardType={'keyboard' in field ? field.keyboard : 'default'}
                autoCapitalize={field.name === 'email' ? 'none' : 'sentences'}
                left={<CustomInput.Icon icon={field.icon} />}
                error={errors[field.name]?.message as string}
              />
            )}
          />
        ))}

        <CustomButton
          title="Create Account"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
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
