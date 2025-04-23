import type { PropsWithChildren, ReactElement } from "react";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  AnimatedRef,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { Colors } from "@/style/Colors";
import styles from "@/style/base/ParallaxScrollViewStyle";

const HEADER_HEIGHT = 150;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: string;
  headerTitle: string;
  scrollRef?: AnimatedRef<Animated.ScrollView>; // <-- use correct type
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  headerTitle,
  scrollRef,
}: Props) {
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
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={usedScrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: headerBackgroundColor,
              marginTop: 32,
            }}
          >
            <LinearGradient
              colors={[Colors.darkGrey, Colors.darkGrey, Colors.mediumGrey]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 1 }}
            ></LinearGradient>
            <ThemedView style={[styles.headerImageCont, { zIndex: 2 }]}>{headerImage}</ThemedView>
            <ThemedText
              type="title"
              style={[styles.headerTitle, { zIndex: 3 }]}
            >
              {headerTitle}
            </ThemedText>
          </ThemedView>
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}
