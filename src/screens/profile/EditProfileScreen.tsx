import React, { useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput } from '@/components/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateProfile } from '@/redux/slices/authSlice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { validateEmail, validatePhone, validateName, validateCompany } from '@/utils/validators';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '', phone: user?.phone || '', company: user?.company || '' },
  });

  const onSubmit = async (data: { name: string; email: string; phone: string; company: string }) => {
    setLoading(true);
    const result = await dispatch(updateProfile(data));
    setLoading(false);
    if (updateProfile.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => navigation.goBack(), 1500);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="titleLarge" style={{ color: colors.text, marginBottom: spacing.lg }}>Edit Profile</Text>
        {(['name', 'email', 'phone', 'company'] as const).map(field => (
          <Controller key={field} control={control} name={field}
            rules={{ validate: field === 'name' ? (v: string) => validateName(v) : field === 'email' ? validateEmail : field === 'phone' ? validatePhone : validateCompany }}
            render={({ field: { onChange, value } }) => (
              <CustomInput label={field.charAt(0).toUpperCase() + field.slice(1)} value={value} onChangeText={onChange} error={errors[field]?.message as string} />
            )} />
        ))}
        <CustomButton title="Save Changes" onPress={handleSubmit(onSubmit)} loading={loading} fullWidth />
      </ScrollView>
      <Snackbar visible={success} onDismiss={() => setSuccess(false)}>Profile updated successfully!</Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({ scroll: { padding: spacing.md, paddingBottom: spacing.xxl } });
