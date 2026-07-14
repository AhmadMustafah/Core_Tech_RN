import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OtpVerification: { email: string };
  ResetPassword: { email: string; otp: string };
};

export type InventoryStackParamList = {
  ProductList: undefined;
  ProductDetails: { productId: string };
  AddProduct: undefined;
  EditProduct: { productId: string };
  Categories: undefined;
};

export type SalesStackParamList = {
  SalesList: undefined;
  SaleDetails: { saleId: string };
  CreateSale: undefined;
  InvoicePreview: { saleId: string };
  CustomerSelect: { returnTo: 'CreateSale' };
};

export type PurchaseStackParamList = {
  PurchaseList: undefined;
  PurchaseDetails: { purchaseId: string };
  CreatePurchase: undefined;
  SupplierSelect: { returnTo: 'CreatePurchase' };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
  Notifications: undefined;
  CustomerList: undefined;
  CustomerDetails: { customerId: string };
  AddCustomer: undefined;
  EditCustomer: { customerId: string };
  SupplierList: undefined;
  SupplierDetails: { supplierId: string };
  AddSupplier: undefined;
  EditSupplier: { supplierId: string };
  PrivacyPolicy: undefined;
  AboutApp: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Inventory: NavigatorScreenParams<InventoryStackParamList>;
  Sales: NavigatorScreenParams<SalesStackParamList>;
  Purchases: NavigatorScreenParams<PurchaseStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
