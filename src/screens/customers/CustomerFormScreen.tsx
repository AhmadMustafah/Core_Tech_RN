import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput, FormScrollView } from '@/components/common';
import { customerService } from '@/services/customerService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { validateEmail, validatePhone, validateName, validateOptionalText } from '@/utils/validators';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AddCustomer' | 'EditCustomer'>;

interface CustomerForm { name: string; email: string; phone: string; address: string; company: string; }

export const CustomerFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const isEdit = route.name === 'EditCustomer';
  const customerId = isEdit ? (route.params as { customerId: string }).customerId : null;
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<CustomerForm>();

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
    { name: 'name' as const, label: t('customer.name'), validate: (v: string) => validateName(v) },
    { name: 'email' as const, label: t('customer.email'), validate: validateEmail },
    { name: 'phone' as const, label: t('customer.phone'), validate: validatePhone },
    { name: 'company' as const, label: t('customer.company'), validate: (v: string) => validateOptionalText(v, 'Company', 100) },
    { name: 'address' as const, label: t('customer.address'), validate: (v: string) => validateOptionalText(v, 'Address', 200) },
  ];

  return (
    <FormScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
        <Text variant="titleLarge" style={{ color: colors.text, marginBottom: spacing.lg }}>{isEdit ? t('customer.edit') : t('customer.add')}</Text>
        {fields.map(f => (
          <Controller key={f.name} control={control} name={f.name} rules={{ validate: f.validate }}
            render={({ field: { onChange, value } }) => (
              <CustomInput label={f.label} value={value} onChangeText={onChange} error={errors[f.name]?.message as string}
                keyboardType={f.name === 'email' ? 'email-address' : f.name === 'phone' ? 'phone-pad' : 'default'} />
            )} />
        ))}
        <CustomButton title={isEdit ? t('common.update') : t('customer.add')} onPress={handleSubmit(onSubmit)} loading={loading} fullWidth />
    </FormScrollView>
  );
};

const styles = StyleSheet.create({ scroll: { padding: spacing.md, paddingBottom: spacing.xxl } });
