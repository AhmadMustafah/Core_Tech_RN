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
import { supplierService } from '@/services/supplierService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { validateEmail, validatePhone, validateName, validateOptionalText, withRequiredCheck } from '@/utils/validators';
import type { ProfileStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AddSupplier' | 'EditSupplier'>;

interface SupplierForm { name: string; email: string; phone: string; address: string; company: string; }

const emptyForm: SupplierForm = { name: '', email: '', phone: '', address: '', company: '' };

export const SupplierFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const isEdit = route.name === 'EditSupplier';
  const supplierId = isEdit ? (route.params as { supplierId: string }).supplierId : null;
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<SupplierForm>({
    defaultValues: emptyForm,
  });

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
          icon={isEdit ? 'truck-check-outline' : 'truck-plus-outline'}
          title={t(isEdit ? 'form.editSupplierTitle' : 'form.addSupplierTitle')}
          description={t(isEdit ? 'form.editSupplierHint' : 'form.addSupplierHint')}
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
          title={isEdit ? t('common.update') : t('supplier.add')}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
          style={formScreenStyles.submit}
        />
    </FormScrollView>
  );
};
