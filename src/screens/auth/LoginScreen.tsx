import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { CustomButton, CustomInput, PasswordInput } from '@/components/common';
import { useAppDispatch } from '@/redux/hooks';
import { login as loginAction } from '@/redux/slices/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/hooks/useAppTheme';
import { validateEmail, validateLoginPassword } from '@/utils/validators';
import { APP_NAME } from '@/constants';
import type { AuthStackParamList } from '@/types/navigation';
import type { LoginRequest } from '@/types';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏢</Text>
          <Text variant="headlineMedium" style={{ color: colors.text, fontWeight: '700' }}>
            Welcome Back
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginTop: 4 }}>
            Sign in to {APP_NAME}
          </Text>
        </View>

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
              label="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={100}
              left={<CustomInput.Icon icon="email-outline" />}
              error={errors.email?.message as string}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ validate: validateLoginPassword }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoComplete="current-password"
              error={errors.password?.message as string}
            />
          )}
        />

        <CustomButton
          title="Forgot Password?"
          variant="text"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotButton}
        />

        <CustomButton
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          fullWidth
        />

        <View style={styles.footer}>
          <Text style={{ color: colors.textSecondary }}>Don't have an account? </Text>
          <CustomButton
            title="Register"
            variant="text"
            onPress={() => navigation.navigate('Register')}
            style={styles.registerLink}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  errorBox: {
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
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
    marginLeft: -spacing.sm,
  },
});
