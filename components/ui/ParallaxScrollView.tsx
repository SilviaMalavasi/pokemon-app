import type { PropsWithChildren, ReactElement } from "react";
import Animated, { interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from "react-native-reanimated";

import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import styles from "@/style/base/ParallaxScrollViewStyle";

const HEADER_HEIGHT = 150;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: string;
  headerTitle: string;
}>;

export default function ParallaxScrollView({ children, headerImage, headerBackgroundColor, headerTitle }: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
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
        ref={scrollRef}
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
            }}
          >
            <ThemedView style={[styles.headerImageCont, { backgroundColor: headerBackgroundColor }]}>
              {headerImage}
            </ThemedView>
            <ThemedText
              type="title"
              style={styles.headerTitle}
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
