import React, { useState } from 'react';
import { Portal, Snackbar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CustomButton,
  CustomInput,
  FormScrollView,
  FormIntro,
  formScreenStyles,
} from '@/components/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateProfile } from '@/redux/slices/authSlice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { validateEmail, validatePhone, validateName, validateCompany, withRequiredCheck } from '@/utils/validators';
import type { ProfileStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
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
    <>
      <FormScrollView
        centerContent
        style={[formScreenStyles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={formScreenStyles.content}>
        <FormIntro
          icon="account-edit-outline"
          title={t('form.editProfileTitle')}
          description={t('form.editProfileHint')}
        />
        {(['name', 'email', 'phone', 'company'] as const).map(field => (
          <Controller key={field} control={control} name={field}
            rules={{
              validate:
                field === 'name'
                  ? withRequiredCheck((v: string) => validateName(v, t('auth.fullName')), 'validation.nameRequired')
                  : field === 'email'
                    ? withRequiredCheck(validateEmail, 'validation.emailRequired')
                    : field === 'phone'
                      ? withRequiredCheck(validatePhone, 'validation.phoneRequired')
                      : withRequiredCheck(validateCompany, 'validation.companyRequired'),
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label={t(field === 'name' ? 'auth.fullName' : field === 'email' ? 'auth.email' : field === 'phone' ? 'auth.phone' : 'auth.company')}
                value={value}
                onChangeText={onChange}
                keyboardType={field === 'email' ? 'email-address' : field === 'phone' ? 'phone-pad' : 'default'}
                autoCapitalize={field === 'email' ? 'none' : 'sentences'}
                required
                error={errors[field]?.message as string}
              />
            )} />
        ))}
        <CustomButton
          title={t('profile.saveChanges')}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
          style={formScreenStyles.submit}
        />
      </FormScrollView>
      <Portal>
        <Snackbar visible={success} onDismiss={() => setSuccess(false)}>{t('profile.updated')}</Snackbar>
      </Portal>
    </>
  );
};
