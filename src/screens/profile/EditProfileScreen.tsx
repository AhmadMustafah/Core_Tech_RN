import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput, FormCard, FormIntro, FormScrollView } from '@/components/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateProfile } from '@/redux/slices/authSlice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { validateEmail, validatePhone, validateName, validateCompany } from '@/utils/validators';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      company: user?.company || '',
    },
  });

  const onSubmit = async (data: { name: string; email: string; phone: string; company: string }) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    const result = await dispatch(updateProfile(data));
    setLoading(false);
    if (updateProfile.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => navigation.goBack(), 1500);
      return;
    }
    setError((result.payload as string) || t('auth.formError'));
  };

  return (
    <FormScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <FormIntro icon="account-edit-outline" description={t('form.editProfileHint')} />
      {error ? <Text style={{ color: colors.error, marginBottom: spacing.md }}>{error}</Text> : null}
      <FormCard title={t('form.identitySection')}>
        <Controller
          control={control}
          name="name"
          rules={{ validate: v => validateName(v, t('auth.fullName')) }}
          render={({ field: { onChange, value } }) => (
            <CustomInput label={t('auth.fullName')} value={value} onChangeText={onChange} error={errors.name?.message as string} />
          )}
        />
        <Controller
          control={control}
          name="company"
          rules={{ validate: validateCompany }}
          render={({ field: { onChange, value } }) => (
            <CustomInput label={t('auth.company')} value={value} onChangeText={onChange} error={errors.company?.message as string} />
          )}
        />
      </FormCard>
      <FormCard title={t('form.contactSection')}>
        <Controller
          control={control}
          name="email"
          rules={{ validate: validateEmail }}
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label={t('auth.email')}
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message as string}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          rules={{ validate: validatePhone }}
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label={t('auth.phone')}
              value={value}
              onChangeText={onChange}
              keyboardType="phone-pad"
              error={errors.phone?.message as string}
            />
          )}
        />
      </FormCard>
      <CustomButton title={t('profile.saveChanges')} onPress={handleSubmit(onSubmit)} loading={loading} fullWidth />
      <Snackbar visible={success} onDismiss={() => setSuccess(false)}>{t('profile.updated')}</Snackbar>
    </FormScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
});
