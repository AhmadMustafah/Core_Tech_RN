import React, { useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput } from '@/components/common';
import { authService } from '@/services/authService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { validatePassword, validateConfirmPassword } from '@/utils/validators';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ChangePassword'>;

export const ChangePasswordScreen: React.FC<Props> = () => {
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { control, handleSubmit, watch, formState: { errors } } = useForm<{
    currentPassword: string; newPassword: string; confirmPassword: string;
  }>();
  const newPassword = watch('newPassword');

  const onSubmit = async ({ currentPassword, newPassword: pwd }: { currentPassword: string; newPassword: string }) => {
    setLoading(true); setError(null);
    try {
      await authService.changePassword(currentPassword, pwd);
      setSuccess(true);
    } catch (err) {
      setError(authService.getErrorMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="titleLarge" style={{ color: colors.text, marginBottom: spacing.lg }}>Change Password</Text>
        {error && <Text style={{ color: colors.error, marginBottom: spacing.md }}>{error}</Text>}
        <Controller control={control} name="currentPassword" rules={{ validate: validatePassword }}
          render={({ field: { onChange, value } }) => <CustomInput label="Current Password" value={value} onChangeText={onChange} secureTextEntry error={errors.currentPassword?.message as string} />} />
        <Controller control={control} name="newPassword" rules={{ validate: validatePassword }}
          render={({ field: { onChange, value } }) => <CustomInput label="New Password" value={value} onChangeText={onChange} secureTextEntry error={errors.newPassword?.message as string} />} />
        <Controller control={control} name="confirmPassword" rules={{ validate: v => validateConfirmPassword(newPassword, v) }}
          render={({ field: { onChange, value } }) => <CustomInput label="Confirm Password" value={value} onChangeText={onChange} secureTextEntry error={errors.confirmPassword?.message as string} />} />
        <CustomButton title="Change Password" onPress={handleSubmit(onSubmit)} loading={loading} fullWidth />
      </ScrollView>
      <Snackbar visible={success} onDismiss={() => setSuccess(false)}>Password changed successfully!</Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({ scroll: { padding: spacing.md, paddingBottom: spacing.xxl } });
