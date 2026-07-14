import React, { useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput } from '@/components/common';
import { customerService } from '@/services/customerService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { validateEmail, validatePhone, validateRequired } from '@/utils/validators';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AddCustomer' | 'EditCustomer'>;

interface CustomerForm { name: string; email: string; phone: string; address: string; company: string; }

export const CustomerFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const isEdit = route.name === 'EditCustomer';
  const customerId = isEdit ? (route.params as { customerId: string }).customerId : null;
  const { colors } = useAppTheme();
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
    { name: 'name' as const, label: 'Name', validate: (v: string) => validateRequired(v, 'Name') },
    { name: 'email' as const, label: 'Email', validate: validateEmail },
    { name: 'phone' as const, label: 'Phone', validate: validatePhone },
    { name: 'company' as const, label: 'Company', validate: () => true },
    { name: 'address' as const, label: 'Address', validate: () => true },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="titleLarge" style={{ color: colors.text, marginBottom: spacing.lg }}>{isEdit ? 'Edit Customer' : 'Add Customer'}</Text>
        {fields.map(f => (
          <Controller key={f.name} control={control} name={f.name} rules={{ validate: f.validate }}
            render={({ field: { onChange, value } }) => (
              <CustomInput label={f.label} value={value} onChangeText={onChange} error={errors[f.name]?.message as string}
                keyboardType={f.name === 'email' ? 'email-address' : f.name === 'phone' ? 'phone-pad' : 'default'} />
            )} />
        ))}
        <CustomButton title={isEdit ? 'Update' : 'Add Customer'} onPress={handleSubmit(onSubmit)} loading={loading} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({ scroll: { padding: spacing.md, paddingBottom: spacing.xxl } });
