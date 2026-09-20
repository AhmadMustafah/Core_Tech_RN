import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CustomButton,
  CustomInput,
  FormScrollView,
  FormIntro,
  formScreenStyles,
} from '@/components/common';
import { customerService } from '@/services/customerService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { validateEmail, validatePhone, validateName, validateOptionalText, withRequiredCheck } from '@/utils/validators';
import type { ProfileStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AddCustomer' | 'EditCustomer'>;

interface CustomerForm { name: string; email: string; phone: string; address: string; company: string; }

const emptyForm: CustomerForm = { name: '', email: '', phone: '', address: '', company: '' };

export const CustomerFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const isEdit = route.name === 'EditCustomer';
  const customerId = isEdit ? (route.params as { customerId: string }).customerId : null;
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<CustomerForm>({
    defaultValues: emptyForm,
  });

  React.useEffect(() => {
    if (isEdit && customerId) {
      customerService.getById(customerId).then(c => {
        setValue('name', c.name); setValue('email', c.email); setValue('phone', c.phone);
        setValue('address', c.address || ''); setValue('company', c.company || '');
      });
    }
  }, [isEdit, customerId, setValue]);

  const onSubmit = async (data: CustomerForm) => {
    setLoading(true);
    try {
      if (isEdit && customerId) await customerService.update(customerId, data);
      else await customerService.create(data);
      navigation.goBack();
    } finally { setLoading(false); }
  };

  const fields = [
    { name: 'name' as const, label: t('customer.name'), validate: withRequiredCheck(v => validateName(v), 'validation.nameRequired'), required: true },
    { name: 'email' as const, label: t('customer.email'), validate: withRequiredCheck(validateEmail, 'validation.emailRequired'), required: true },
    { name: 'phone' as const, label: t('customer.phone'), validate: withRequiredCheck(validatePhone, 'validation.phoneRequired'), required: true },
    { name: 'company' as const, label: t('customer.company'), validate: (v: string) => validateOptionalText(v, 'Company', 100), required: false },
    { name: 'address' as const, label: t('customer.address'), validate: (v: string) => validateOptionalText(v, 'Address', 200), required: false, multiline: true },
  ];

  return (
    <FormScrollView
      centerContent
      style={[formScreenStyles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={formScreenStyles.content}>
        <FormIntro
          icon={isEdit ? 'account-edit-outline' : 'account-plus-outline'}
          title={t(isEdit ? 'form.editCustomerTitle' : 'form.addCustomerTitle')}
          description={t(isEdit ? 'form.editCustomerHint' : 'form.addCustomerHint')}
        />
        {fields.map(f => (
          <Controller key={f.name} control={control} name={f.name} rules={{ validate: f.validate }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label={f.label}
                value={value}
                onChangeText={onChange}
                required={f.required}
                multiline={f.multiline}
                numberOfLines={f.multiline ? 3 : 1}
                keyboardType={f.name === 'email' ? 'email-address' : f.name === 'phone' ? 'phone-pad' : 'default'}
                autoCapitalize={f.name === 'email' ? 'none' : 'sentences'}
                error={errors[f.name]?.message as string}
              />
            )} />
        ))}
        <CustomButton
          title={isEdit ? t('common.update') : t('customer.add')}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
          style={formScreenStyles.submit}
        />
    </FormScrollView>
  );
};
