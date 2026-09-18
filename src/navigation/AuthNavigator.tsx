import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';
import { OtpVerificationScreen } from '@/screens/auth/OtpVerificationScreen';
import { ResetPasswordScreen } from '@/screens/auth/ResetPasswordScreen';
import type { AuthStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getStackScreenOptions } from '@/theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  const { colors } = useAppTheme();
  const { t, isRTL } = useLocalization();
  const screenOptions = getStackScreenOptions(colors, isRTL);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: t('screen.register') }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: t('screen.forgotPassword') }} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} options={{ title: t('screen.verifyOtp') }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: t('screen.resetPassword') }} />
    </Stack.Navigator>
  );
};
