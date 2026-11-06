import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Menu, Button } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput, FormScrollView } from '@/components/common';
import { useAppDispatch } from '@/redux/hooks';
import { markAppDataStale } from '@/redux/slices/dataSyncSlice';
import { productService } from '@/services/productService';
import { getErrorMessage } from '@/services/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import {
  validateProductName,
  validateSku,
  validatePositiveNumber,
  validateInteger,
  validateDescription,
} from '@/utils/validators';
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
  const dispatch = useAppDispatch();
  const isEdit = route.name === 'EditProduct';
  const productId = isEdit ? (route.params as { productId: string }).productId : null;
  const { colors } = useAppTheme();
  const { t, catalogLabel } = useLocalization();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [categoryMenu, setCategoryMenu] = useState(false);
  const [unitMenu, setUnitMenu] = useState(false);
  const [categories, setCategories] = useState<string[]>([...PRODUCT_CATEGORIES]);
  const [units, setUnits] = useState<string[]>([...PRODUCT_UNITS]);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductForm>({
    defaultValues: {
      name: '', sku: '', category: PRODUCT_CATEGORIES[0], unit: PRODUCT_UNITS[0],
      price: '', costPrice: '', stockQuantity: '0', lowStockThreshold: '10', description: '',
    },
  });

  const category = watch('category');
  const unit = watch('unit');

  React.useEffect(() => {
    productService.getCategories().then(items => {
      const names = items.map(item => item.name).filter(Boolean);
      if (names.length) setCategories(names);
    }).catch(() => undefined);
    productService.getUnits().then(items => {
      if (items.length) setUnits(items);
    }).catch(() => undefined);
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
    if (loading) return;
    setFormError(null);
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
      dispatch(markAppDataStale());
      navigation.goBack();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}>
        {formError ? (
          <Text style={{ color: colors.error, marginBottom: spacing.md }}>{formError}</Text>
        ) : null}

        {(['name', 'sku'] as const).map(field => (
          <Controller
            key={field}
            control={control}
            name={field}
            rules={{
              validate: field === 'name' ? validateProductName : validateSku,
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label={field === 'name' ? t('product.name') : t('product.sku')}
                value={value}
                onChangeText={onChange}
                maxLength={field === 'name' ? 100 : 30}
                error={errors[field]?.message as string}
              />
            )}
          />
        ))}

        <Menu visible={categoryMenu} onDismiss={() => setCategoryMenu(false)} anchor={
          <Button mode="outlined" onPress={() => setCategoryMenu(true)} style={styles.menuButton}>
            {t('product.categoryLabel', { value: catalogLabel(category) })}
          </Button>
        }>
          {categories.map(c => (
            <Menu.Item key={c} onPress={() => { setValue('category', c); setCategoryMenu(false); }} title={catalogLabel(c)} />
          ))}
        </Menu>

        <Menu visible={unitMenu} onDismiss={() => setUnitMenu(false)} anchor={
          <Button mode="outlined" onPress={() => setUnitMenu(true)} style={styles.menuButton}>
            {t('product.unitLabel', { value: catalogLabel(unit) })}
          </Button>
        }>
          {units.map(u => (
            <Menu.Item key={u} onPress={() => { setValue('unit', u); setUnitMenu(false); }} title={catalogLabel(u)} />
          ))}
        </Menu>

        <Controller
          control={control}
          name="price"
          rules={{ validate: v => validatePositiveNumber(v, 'Selling price') }}
          render={({ field: { onChange, value } }) => (
            <CustomInput label={t('product.sellingPrice')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.price?.message as string} />
          )}
        />
        <Controller
          control={control}
          name="costPrice"
          rules={{ validate: v => validatePositiveNumber(v, 'Cost price') }}
          render={({ field: { onChange, value } }) => (
            <CustomInput label={t('product.costPrice')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.costPrice?.message as string} />
          )}
        />
        <Controller
          control={control}
          name="stockQuantity"
          rules={{ validate: v => validateInteger(v, 'Stock quantity', 0) }}
          render={({ field: { onChange, value } }) => (
            <CustomInput label={t('product.stockQty')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.stockQuantity?.message as string} />
          )}
        />
        <Controller
          control={control}
          name="lowStockThreshold"
          rules={{ validate: v => validateInteger(v, 'Low stock threshold', 0) }}
          render={({ field: { onChange, value } }) => (
            <CustomInput label={t('product.lowStockThreshold')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.lowStockThreshold?.message as string} />
          )}
        />

        <Controller
          control={control}
          name="description"
          rules={{ validate: validateDescription }}
          render={({ field: { onChange, value } }) => (
            <CustomInput label={t('product.description')} value={value} onChangeText={onChange} multiline numberOfLines={3} maxLength={500} error={errors.description?.message as string} />
          )}
        />

        <CustomButton
          title={isEdit ? t('product.update') : t('product.add')}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
          style={{ marginTop: spacing.md }}
        />
    </FormScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  menuButton: { marginBottom: spacing.md },
});
