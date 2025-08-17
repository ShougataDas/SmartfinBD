import React, { useState, useRef } from "react";
import { View, ScrollView, StyleSheet, Dimensions, Image } from "react-native";
import { Button, Text, Surface, Card } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";

import { theme, spacing } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";

const { width: screenWidth } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
}

const onboardingData: OnboardingSlide[] = [
  {
    id: "1",
    title: "স্বাগতম SmartFin BD তে",
    subtitle: "আপনার আর্থিক সাফল্যের সঙ্গী",
    description:
      "বাংলাদেশের প্রথম AI চালিত ব্যক্তিগত আর্থিক পরামর্শদাতা। আপনার আর্থিক লক্ষ্য অর্জনে আমরা আছি পাশে।",
    icon: "bank",
    color: theme.colors.primary,
  },
  {
    id: "2",
    title: "স্মার্ট বিনিয়োগ পরামর্শ",
    subtitle: "বিশেষজ্ঞ পরামর্শ পান",
    description:
      "সঞ্চয়পত্র, DPS, মিউচুয়াল ফান্ড, স্টক মার্কেট - সব ধরনের বিনিয়োগে পান ব্যক্তিগতকৃত পরামর্শ।",
    icon: "chart-line",
    color: theme.colors.secondary,
  },
  {
    id: "3",
    title: "AI চ্যাটবট সহায়তা",
    subtitle: "২৪/৭ আর্থিক পরামর্শ",
    description:
      "যেকোনো সময় আপনার আর্থিক প্রশ্নের উত্তর পান আমাদের বুদ্ধিমান চ্যাটবট থেকে। বাংলা ও ইংরেজি দুই ভাষায়।",
    icon: "robot",
    color: theme.colors.tertiary,
  },
  {
    id: "4",
    title: "নিরাপদ ও সুরক্ষিত",
    subtitle: "আপনার তথ্য সুরক্ষিত",
    description:
      "ব্যাংক-গ্রেড নিরাপত্তা ব্যবস্থা। আপনার ব্যক্তিগত ও আর্থিক তথ্য সম্পূর্ণ সুরক্ষিত থাকবে।",
    icon: "shield-check",
    color: theme.colors.primary,
  },
];

export const OnboardingScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);
  const { setOnboardingCompleted } = useAuthStore();

  // Create animated styles for each pagination dot individually
  const paginationStyle0 = useAnimatedStyle(() => {
    const inputRange = [-screenWidth, 0, screenWidth];
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1.2, 0.8],
      "clamp"
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      "clamp"
    );
    return {
      transform: [{ scale: withSpring(scale) }],
      opacity: withSpring(opacity),
    };
  });

  const paginationStyle1 = useAnimatedStyle(() => {
    const inputRange = [0, screenWidth, 2 * screenWidth];
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1.2, 0.8],
      "clamp"
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      "clamp"
    );
    return {
      transform: [{ scale: withSpring(scale) }],
      opacity: withSpring(opacity),
    };
  });

  const paginationStyle2 = useAnimatedStyle(() => {
    const inputRange = [screenWidth, 2 * screenWidth, 3 * screenWidth];
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1.2, 0.8],
      "clamp"
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      "clamp"
    );
    return {
      transform: [{ scale: withSpring(scale) }],
      opacity: withSpring(opacity),
    };
  });

  const paginationStyle3 = useAnimatedStyle(() => {
    const inputRange = [2 * screenWidth, 3 * screenWidth, 4 * screenWidth];
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1.2, 0.8],
      "clamp"
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      "clamp"
    );
    return {
      transform: [{ scale: withSpring(scale) }],
      opacity: withSpring(opacity),
    };
  });

  const paginationStyles = [
    paginationStyle0,
    paginationStyle1,
    paginationStyle2,
    paginationStyle3,
  ];

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    } else {
      setOnboardingCompleted();
    }
  };

  const handleSkip = () => {
    setOnboardingCompleted();
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    const index = Math.round(offsetX / screenWidth);
    setCurrentIndex(index);
  };

  const renderSlide = (item: OnboardingSlide, index: number) => (
    <View key={item.id} style={styles.slide}>
      <Surface style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Icon name={item.icon} size={80} color="white" />
      </Surface>

      <View style={styles.textContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          {item.title}
        </Text>
        <Text variant="titleMedium" style={styles.subtitle}>
          {item.subtitle}
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          {item.description}
        </Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {onboardingData.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.paginationDot,
            paginationStyles[index],
            {
              backgroundColor:
                index === currentIndex
                  ? theme.colors.primary
                  : theme.colors.outline,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingData.map(renderSlide)}
      </ScrollView>

      {renderPagination()}

      <View style={styles.buttonContainer}>
        {currentIndex < onboardingData.length - 1 ? (
          <View style={styles.navigationButtons}>
            <Button mode="text" onPress={handleSkip} style={styles.skipButton}>
              এড়িয়ে যান
            </Button>
            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.nextButton}
              icon="arrow-right"
            >
              পরবর্তী
            </Button>
          </View>
        ) : (
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.getStartedButton}
            icon="rocket-launch"
          >
            শুরু করুন
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: screenWidth,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    elevation: 8,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    color: theme.colors.onBackground,
    marginBottom: spacing.md,
  },
  subtitle: {
    textAlign: "center",
    color: theme.colors.primary,
    marginBottom: spacing.lg,
    fontWeight: "600",
  },
  description: {
    textAlign: "center",
    color: theme.colors.onSurfaceVariant,
    lineHeight: 24,
    paddingHorizontal: spacing.sm,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: spacing.xs,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
    marginLeft: spacing.md,
  },
  getStartedButton: {
    width: "100%",
    paddingVertical: spacing.sm,
  },
});
