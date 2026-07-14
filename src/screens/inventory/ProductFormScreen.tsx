import React, { useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Text, Menu, Button } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput } from '@/components/common';
import { productService } from '@/services/productService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { validateRequired } from '@/utils/validators';
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '@/constants';
import type { InventoryStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<InventoryStackParamList, 'AddProduct' | 'EditProduct'>;

interface ProductForm {
  name: string;
  sku: string;
  category: string;
  unit: string;
  price: string;
  costPrice: string;
  stockQuantity: string;
  lowStockThreshold: string;
  description: string;
}

export const ProductFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const isEdit = route.name === 'EditProduct';
  const productId = isEdit ? (route.params as { productId: string }).productId : null;
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [categoryMenu, setCategoryMenu] = useState(false);
  const [unitMenu, setUnitMenu] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductForm>({
    defaultValues: {
      name: '', sku: '', category: PRODUCT_CATEGORIES[0], unit: PRODUCT_UNITS[0],
      price: '', costPrice: '', stockQuantity: '0', lowStockThreshold: '10', description: '',
    },
  });

  const category = watch('category');
  const unit = watch('unit');

  React.useEffect(() => {
    if (isEdit && productId) {
      productService.getById(productId).then(p => {
        setValue('name', p.name);
        setValue('sku', p.sku);
        setValue('category', p.category);
        setValue('unit', p.unit);
        setValue('price', String(p.price));
        setValue('costPrice', String(p.costPrice));
        setValue('stockQuantity', String(p.stockQuantity));
        setValue('lowStockThreshold', String(p.lowStockThreshold));
        setValue('description', p.description || '');
      });
    }
  }, [isEdit, productId, setValue]);

  const onSubmit = async (data: ProductForm) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        sku: data.sku,
        category: data.category,
        unit: data.unit,
        price: parseFloat(data.price),
        costPrice: parseFloat(data.costPrice),
        stockQuantity: parseInt(data.stockQuantity, 10),
        lowStockThreshold: parseInt(data.lowStockThreshold, 10),
        description: data.description,
      };

      if (isEdit && productId) {
        await productService.update(productId, payload);
      } else {
        await productService.create(payload);
      }
      navigation.goBack();
    } catch (err) {
      // Error handled by form
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text variant="titleLarge" style={{ color: colors.text, marginBottom: spacing.lg }}>
          {isEdit ? 'Edit Product' : 'Add Product'}
        </Text>

        {(['name', 'sku'] as const).map(field => (
          <Controller
            key={field}
            control={control}
            name={field}
            rules={{ validate: v => validateRequired(v, field === 'name' ? 'Name' : 'SKU') }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label={field === 'name' ? 'Product Name' : 'SKU'}
                value={value}
                onChangeText={onChange}
                error={errors[field]?.message as string}
              />
            )}
          />
        ))}

        <Menu visible={categoryMenu} onDismiss={() => setCategoryMenu(false)} anchor={
          <Button mode="outlined" onPress={() => setCategoryMenu(true)} style={styles.menuButton}>
            Category: {category}
          </Button>
        }>
          {PRODUCT_CATEGORIES.map(c => (
            <Menu.Item key={c} onPress={() => { setValue('category', c); setCategoryMenu(false); }} title={c} />
          ))}
        </Menu>

        <Menu visible={unitMenu} onDismiss={() => setUnitMenu(false)} anchor={
          <Button mode="outlined" onPress={() => setUnitMenu(true)} style={styles.menuButton}>
            Unit: {unit}
          </Button>
        }>
          {PRODUCT_UNITS.map(u => (
            <Menu.Item key={u} onPress={() => { setValue('unit', u); setUnitMenu(false); }} title={u} />
          ))}
        </Menu>

        {(['price', 'costPrice', 'stockQuantity', 'lowStockThreshold'] as const).map(field => (
          <Controller
            key={field}
            control={control}
            name={field}
            rules={{ validate: v => validateRequired(v, field) }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label={field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                error={errors[field]?.message as string}
              />
            )}
          />
        ))}

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <CustomInput label="Description" value={value} onChangeText={onChange} multiline numberOfLines={3} />
          )}
        />

        <CustomButton
          title={isEdit ? 'Update Product' : 'Add Product'}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  menuButton: { marginBottom: spacing.md },
});
