import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { initializeAuth } from '@/redux/slices/authSlice';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS, APP_NAME } from '@/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import type { RootStackParamList } from '@/types/navigation';
import { spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isInitialized, isAuthenticated } = useAppSelector(state => state.auth);
  const { colors } = useAppTheme();
  const { t, directionStyle } = useLocalization();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!isInitialized) return;

    const navigate = async () => {
      await new Promise<void>(resolve => setTimeout(resolve, 400));

      if (isAuthenticated) {
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }),
        );
        return;
      }

      const onboardingComplete = await storage.getItem<boolean>(
        STORAGE_KEYS.ONBOARDING_COMPLETE,
      );

      if (!onboardingComplete) {
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: 'Onboarding' }] }),
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Auth', params: { screen: 'Login' } }],
          }),
        );
      }
    };

    navigate();
  }, [isInitialized, isAuthenticated, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}>🏢</Text>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>{t('common.appTagline')}</Text>
      </View>
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
      <Text
        style={[
          styles.credit,
          typography.caption,
          directionStyle,
          {
            color: colors.onPrimary,
            bottom: Math.max(insets.bottom, spacing.md) + spacing.sm,
          },
        ]}>
        Developed By Ahmad Mustafah
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  loader: {
    position: 'absolute',
    bottom: 80,
  },
  credit: {
    position: 'absolute',
    start: spacing.lg,
    end: spacing.lg,
    textAlign: 'center',
    opacity: 0.78,
  },
});
