import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput, FormScrollView, FormIntro, formScreenStyles, AppSelect } from '@/components/common';
import { productService } from '@/services/productService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import {
  validateProductName,
  validateSku,
  validatePositiveNumber,
  validateInteger,
  validateDescription,
  requiredField,
  withRequiredCheck,
} from '@/utils/validators';
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '@/constants';
import type { InventoryStackParamList } from '@/types/navigation';

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
  const { t, catalogLabel } = useLocalization();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<ProductForm>({
    defaultValues: {
      name: '', sku: '', category: PRODUCT_CATEGORIES[0], unit: PRODUCT_UNITS[0],
      price: '', costPrice: '', stockQuantity: '0', lowStockThreshold: '10', description: '',
    },
  });

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
    <FormScrollView
      style={[formScreenStyles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={formScreenStyles.content}>
        <FormIntro
          icon={isEdit ? 'package-variant-closed' : 'package-variant'}
          title={t(isEdit ? 'form.editProductTitle' : 'form.addProductTitle')}
          description={t(isEdit ? 'form.editProductHint' : 'form.addProductHint')}
        />
        {(['name', 'sku'] as const).map(field => (
          <Controller
            key={field}
            control={control}
            name={field}
            rules={{
              validate:
                field === 'name'
                  ? withRequiredCheck(validateProductName, 'validation.productNameRequired')
                  : withRequiredCheck(validateSku, 'validation.skuRequired'),
            }}
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label={field === 'name' ? t('product.name') : t('product.sku')}
                value={value}
                onChangeText={onChange}
                maxLength={field === 'name' ? 100 : 30}
                required
                error={errors[field]?.message as string}
              />
            )}
          />
        ))}

        <Controller
          control={control}
          name="category"
          rules={{ validate: v => requiredField(v, 'validation.required') }}
          render={({ field: { onChange, value } }) => (
            <AppSelect
              label={t('product.category')}
              placeholder={t('product.category')}
              icon="shape-outline"
              variant="compact"
              required
              value={value}
              error={errors.category?.message as string}
              options={PRODUCT_CATEGORIES.map(c => ({ value: c, label: catalogLabel(c) }))}
              onChange={next => next && onChange(next)}
            />
          )}
        />
        <Controller
          control={control}
          name="unit"
          rules={{ validate: v => requiredField(v, 'validation.required') }}
          render={({ field: { onChange, value } }) => (
            <AppSelect
              label={t('product.unit')}
              placeholder={t('product.unit')}
              icon="ruler"
              variant="compact"
              required
              value={value}
              error={errors.unit?.message as string}
              options={PRODUCT_UNITS.map(u => ({ value: u, label: catalogLabel(u) }))}
              onChange={next => next && onChange(next)}
            />
          )}
        />

        <Controller
          control={control}
          name="price"
          rules={{ validate: withRequiredCheck(v => validatePositiveNumber(v, 'Selling price'), 'validation.numberRequired') }}
          render={({ field: { onChange, value } }) => (
            <CustomInput label={t('product.sellingPrice')} value={value} onChangeText={onChange} keyboardType="numeric" required error={errors.price?.message as string} />
          )}
        />
        <Controller
          control={control}
          name="costPrice"
          rules={{ validate: withRequiredCheck(v => validatePositiveNumber(v, 'Cost price'), 'validation.numberRequired') }}
          render={({ field: { onChange, value } }) => (
            <CustomInput label={t('product.costPrice')} value={value} onChangeText={onChange} keyboardType="numeric" required error={errors.costPrice?.message as string} />
          )}
        />
        <Controller
          control={control}
          name="stockQuantity"
          rules={{ validate: withRequiredCheck(v => validateInteger(v, 'Stock quantity', 0), 'validation.integerRequired') }}
          render={({ field: { onChange, value } }) => (
            <CustomInput label={t('product.stockQty')} value={value} onChangeText={onChange} keyboardType="numeric" required error={errors.stockQuantity?.message as string} />
          )}
        />
        <Controller
          control={control}
          name="lowStockThreshold"
          rules={{ validate: withRequiredCheck(v => validateInteger(v, 'Low stock threshold', 0), 'validation.integerRequired') }}
          render={({ field: { onChange, value } }) => (
            <CustomInput label={t('product.lowStockThreshold')} value={value} onChangeText={onChange} keyboardType="numeric" required error={errors.lowStockThreshold?.message as string} />
          )}
        />

        <Controller
          control={control}
          name="description"
          rules={{ validate: validateDescription }}
          render={({ field: { onChange, value } }) => (
            <CustomInput label={t('product.description')} value={value} onChangeText={onChange} multiline numberOfLines={3} maxLength={500} optional error={errors.description?.message as string} />
          )}
        />

        <CustomButton
          title={isEdit ? t('product.update') : t('product.add')}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
          style={formScreenStyles.submit}
        />
    </FormScrollView>
  );
};
