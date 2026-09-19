import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput, FormScrollView } from '@/components/common';
import { supplierService } from '@/services/supplierService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { validateEmail, validatePhone, validateName, validateOptionalText } from '@/utils/validators';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AddSupplier' | 'EditSupplier'>;

interface SupplierForm { name: string; email: string; phone: string; address: string; company: string; }

export const SupplierFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const isEdit = route.name === 'EditSupplier';
  const supplierId = isEdit ? (route.params as { supplierId: string }).supplierId : null;
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<SupplierForm>();

  React.useEffect(() => {
    if (isEdit && supplierId) {
      supplierService.getById(supplierId).then(s => {
        setValue('name', s.name); setValue('email', s.email); setValue('phone', s.phone);
        setValue('address', s.address || ''); setValue('company', s.company || '');
      });
    }
  }, [isEdit, supplierId, setValue]);

  const onSubmit = async (data: SupplierForm) => {
    setLoading(true);
    try {
      if (isEdit && supplierId) await supplierService.update(supplierId, data);
      else await supplierService.create(data);
      navigation.goBack();
    } finally { setLoading(false); }
  };

  const fields = [
    { name: 'name' as const, label: t('customer.name'), validate: (v: string) => validateName(v), required: true },
    { name: 'email' as const, label: t('customer.email'), validate: validateEmail, required: true },
    { name: 'phone' as const, label: t('customer.phone'), validate: validatePhone, required: true },
    { name: 'company' as const, label: t('customer.company'), validate: (v: string) => validateOptionalText(v, 'Company', 100), required: false },
    { name: 'address' as const, label: t('customer.address'), validate: (v: string) => validateOptionalText(v, 'Address', 200), required: false },
  ];

  return (
    <FormScrollView
      centerContent
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}>
        {fields.map(f => (
          <Controller key={f.name} control={control} name={f.name} rules={{ validate: f.validate }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label={f.label}
                value={value}
                onChangeText={onChange}
                required={f.required}
                keyboardType={f.name === 'email' ? 'email-address' : f.name === 'phone' ? 'phone-pad' : 'default'}
                autoCapitalize={f.name === 'email' ? 'none' : 'sentences'}
                error={errors[f.name]?.message as string}
              />
            )} />
        ))}
        <CustomButton
          title={isEdit ? t('common.update') : t('supplier.add')}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
          style={styles.submit}
        />
    </FormScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  submit: { marginTop: spacing.sm },
});
