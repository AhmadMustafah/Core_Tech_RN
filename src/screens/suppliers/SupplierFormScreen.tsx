import React, { useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput } from '@/components/common';
import { supplierService } from '@/services/supplierService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { validateEmail, validatePhone, validateRequired } from '@/utils/validators';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AddSupplier' | 'EditSupplier'>;

interface SupplierForm { name: string; email: string; phone: string; address: string; company: string; }

export const SupplierFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const isEdit = route.name === 'EditSupplier';
  const supplierId = isEdit ? (route.params as { supplierId: string }).supplierId : null;
  const { colors } = useAppTheme();
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
    { name: 'name' as const, label: 'Name', validate: (v: string) => validateRequired(v, 'Name') },
    { name: 'email' as const, label: 'Email', validate: validateEmail },
    { name: 'phone' as const, label: 'Phone', validate: validatePhone },
    { name: 'company' as const, label: 'Company', validate: () => true },
    { name: 'address' as const, label: 'Address', validate: () => true },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="titleLarge" style={{ color: colors.text, marginBottom: spacing.lg }}>{isEdit ? 'Edit Supplier' : 'Add Supplier'}</Text>
        {fields.map(f => (
          <Controller key={f.name} control={control} name={f.name} rules={{ validate: f.validate }}
            render={({ field: { onChange, value } }) => (
              <CustomInput label={f.label} value={value} onChangeText={onChange} error={errors[f.name]?.message as string} />
            )} />
        ))}
        <CustomButton title={isEdit ? 'Update' : 'Add Supplier'} onPress={handleSubmit(onSubmit)} loading={loading} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({ scroll: { padding: spacing.md, paddingBottom: spacing.xxl } });
