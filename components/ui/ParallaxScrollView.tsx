import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  AnimatedRef,
} from "react-native-reanimated";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import { Image } from "expo-image";
import styles from "@/style/ui/ParallaxScrollViewStyle";

const headerHeight = 160;

// Mapping of header image filenames to require statements
const headerImages: Record<string, any> = {
  "advanced-search.webp": require("@/assets/images/advanced-search.webp"),
  "fondo.webp": require("@/assets/images/fondo.webp"),
};

type Props = PropsWithChildren<{
  headerImage: string;
  headerTitle: string;
  scrollRef?: AnimatedRef<Animated.ScrollView>;
}>;

export default function ParallaxScrollView({ children, headerImage, headerTitle, scrollRef }: Props) {
  const internalScrollRef = useAnimatedRef<Animated.ScrollView>();
  const usedScrollRef = scrollRef || internalScrollRef;
  const scrollOffset = useScrollViewOffset(usedScrollRef);
  const bottom = useBottomTabOverflow();
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-headerHeight, 0, headerHeight],
            [-headerHeight / 2, 0, headerHeight * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-headerHeight, 0, headerHeight], [2, 1, 1]),
        },
      ],
    };
  });
  // Get the image source from the mapping
  const headerImageSource = headerImages[headerImage];

  return (
    <Animated.ScrollView
      ref={usedScrollRef}
      scrollEventThrottle={16}
      scrollIndicatorInsets={{ bottom }}
      contentContainerStyle={{ paddingBottom: bottom }}
    >
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerBackground}>
          <Image
            style={styles.headerBackgroundImage}
            source={headerImageSource}
            contentFit="cover"
          />
        </View>
        <View style={styles.headerContainer}>
          <View style={styles.headerImageContainer}>
            <Image
              style={styles.headerImageContainerImage}
              source={require("@/assets/images/header-logo.webp")}
              contentFit="contain"
            />
          </View>
          <View style={styles.headerTitleContainer}>
            <ThemedText
              type="title"
              style={styles.headerTitle}
            >
              {headerTitle}
            </ThemedText>
          </View>
        </View>
      </Animated.View>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}
