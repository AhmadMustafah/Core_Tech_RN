import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Text } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '@/components/common';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { RootStackParamList } from '@/types/navigation';
import { spacing, borderRadius } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: '📊',
    title: 'Manage Your Business',
    description:
      'Track sales, purchases, inventory, and customers all in one powerful mobile app.',
  },
  {
    id: '2',
    icon: '📦',
    title: 'Inventory Control',
    description:
      'Monitor stock levels, get low stock alerts, and manage products with ease.',
  },
  {
    id: '3',
    icon: '💼',
    title: 'Grow Your Business',
    description:
      'Generate invoices, manage suppliers, and make data-driven business decisions.',
  },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth', params: { screen: 'Login' } }],
      }),
    );
  };

  const handleSkip = async () => {
    await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth', params: { screen: 'Login' } }],
      }),
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CustomButton
        title="Skip"
        variant="text"
        onPress={handleSkip}
        style={styles.skipButton}
      />

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.description, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex ? colors.primary : colors.border,
                  width: index === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <CustomButton
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    alignSelf: 'flex-end',
    marginTop: spacing.xl,
    marginRight: spacing.md,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: borderRadius.full,
  },
});
