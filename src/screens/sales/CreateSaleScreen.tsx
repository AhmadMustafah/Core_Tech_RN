import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CustomButton,
  CustomInput,
  FormScrollView,
  FormIntro,
  FormErrorBanner,
  formScreenStyles,
  AppSelect,
} from '@/components/common';
import { saleService } from '@/services/saleService';
import { productService } from '@/services/productService';
import { customerService } from '@/services/customerService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency } from '@/utils/formatters';
import type { Customer, Product, SaleItem } from '@/types';
import type { SalesStackParamList } from '@/types/navigation';
import { PAYMENT_STATUS_KEYS } from '@/localization';
import { spacing } from '@/theme';
import { validatePositiveNumber, requiredField, withRequiredCheck } from '@/utils/validators';

type Props = NativeStackScreenProps<SalesStackParamList, 'CreateSale'>;

export const CreateSaleScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'partial'>('pending');
  const [loading, setLoading] = useState(false);
  const [discountError, setDiscountError] = useState<string | undefined>();
  const [taxError, setTaxError] = useState<string | undefined>();
  const [customerError, setCustomerError] = useState<string | undefined>();
  const [paymentError, setPaymentError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    setListsLoading(true);
    Promise.all([customerService.getAll(), productService.getAll()])
      .then(([nextCustomers, nextProducts]) => {
        setCustomers(nextCustomers);
        setProducts(nextProducts);
      })
      .finally(() => setListsLoading(false));
  }, []));

  const addProduct = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price } : i);
      }
      return [...prev, { productId: product.id, productName: product.name, quantity: 1, price: product.price, discount: 0, tax: 0, total: product.price }];
    });
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
  const totalDiscount = parseFloat(discount) || 0;
  const totalTax = parseFloat(tax) || 0;
  const totalAmount = subtotal - totalDiscount + totalTax;

  const customerOptions = useMemo(
    () => customers.map(c => ({ value: c.id, label: c.name, subtitle: c.company || c.email })),
    [customers],
  );
  const productOptions = useMemo(
    () => products.map(p => ({ value: p.id, label: p.name, subtitle: `${p.sku} · ${formatCurrency(p.price)}` })),
    [products],
  );

  const handleSubmit = async () => {
    setFormError(null);
    const customerCheck = requiredField(selectedCustomer?.id, 'sale.pleaseCustomer');
    const paymentCheck = requiredField(paymentStatus, 'validation.required');
    const discountValidation = withRequiredCheck(
      value => validatePositiveNumber(value, 'Discount', true),
      'validation.numberRequired',
    )(discount);
    const taxValidation = withRequiredCheck(
      value => validatePositiveNumber(value, 'Tax', true),
      'validation.numberRequired',
    )(tax);

    setCustomerError(customerCheck === true ? undefined : customerCheck);
    setPaymentError(paymentCheck === true ? undefined : paymentCheck);
    setDiscountError(discountValidation === true ? undefined : discountValidation);
    setTaxError(taxValidation === true ? undefined : taxValidation);

    if (customerCheck !== true) {
      setFormError(t('sale.pleaseCustomer'));
      return;
    }
    if (items.length === 0) {
      setFormError(t('sale.pleaseProduct'));
      return;
    }
    if (paymentCheck !== true || discountValidation !== true || taxValidation !== true) return;
    if (totalAmount < 0) {
      setFormError(t('sale.totalNegative'));
      return;
    }

    setLoading(true);
    try {
      await saleService.create({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        items,
        subtotal,
        discount: totalDiscount,
        tax: totalTax,
        totalAmount,
        paymentStatus,
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormScrollView style={[formScreenStyles.screen, { backgroundColor: colors.background }]} contentContainerStyle={formScreenStyles.content}>
      <FormIntro
        icon="point-of-sale"
        title={t('form.createSaleTitle')}
        description={t('form.createSaleHint')}
      />
      <FormErrorBanner message={formError} />

      <AppSelect
        label={t('sale.customer')}
        placeholder={t('sale.selectCustomer')}
        icon="account-outline"
        variant="sheet"
        searchable
        required
        loading={listsLoading}
        value={selectedCustomer?.id ?? null}
        error={customerError}
        options={customerOptions}
        onChange={(id) => {
          setSelectedCustomer(customers.find(c => c.id === id) || null);
          setCustomerError(undefined);
        }}
      />

      <AppSelect
        label={t('sale.addProduct')}
        placeholder={t('sale.addProduct')}
        icon="package-variant"
        variant="sheet"
        searchable
        resetOnSelect
        loading={listsLoading}
        value={null}
        options={productOptions}
        onChange={(_, option) => {
          const product = products.find(p => p.id === option?.value);
          if (product) addProduct(product);
        }}
      />

      {items.map((item, index) => (
        <View key={`${item.productId}-${index}`} style={[styles.itemCard, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{item.productName}</Text>
          <Text style={{ color: colors.textSecondary }}>{t('common.qty')}: {item.quantity} • {formatCurrency(item.price)}</Text>
        </View>
      ))}

      <CustomInput
        label={t('common.discount')}
        value={discount}
        onChangeText={text => {
          setDiscount(text);
          setDiscountError(undefined);
        }}
        keyboardType="numeric"
        required
        error={discountError}
      />
      <CustomInput
        label={t('common.tax')}
        value={tax}
        onChangeText={text => {
          setTax(text);
          setTaxError(undefined);
        }}
        keyboardType="numeric"
        required
        error={taxError}
      />

      <AppSelect
        label={t('sale.filterPaymentStatus')}
        placeholder={t('sale.filterPaymentStatus')}
        icon="cash"
        variant="compact"
        required
        value={paymentStatus}
        error={paymentError}
        options={(['paid', 'pending', 'partial'] as const).map(status => ({
          value: status,
          label: t(PAYMENT_STATUS_KEYS[status]),
        }))}
        onChange={value => {
          if (value === 'paid' || value === 'pending' || value === 'partial') {
            setPaymentStatus(value);
            setPaymentError(undefined);
          }
        }}
      />

      <Divider style={{ marginVertical: spacing.md }} />
      <View style={styles.totalRow}><Text variant="titleMedium" style={{ color: colors.text }}>{t('common.total')}</Text><Text variant="titleLarge" style={{ color: colors.primary, fontWeight: '700' }}>{formatCurrency(totalAmount)}</Text></View>

      <CustomButton title={t('sale.create')} onPress={handleSubmit} loading={loading} fullWidth style={{ marginTop: spacing.lg }} />
    </FormScrollView>
  );
};

const styles = StyleSheet.create({
  itemCard: { padding: spacing.md, borderRadius: 8, marginBottom: spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
