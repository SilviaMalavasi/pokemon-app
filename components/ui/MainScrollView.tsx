import type { PropsWithChildren } from "react";
import { View } from "react-native";
import Animated, { useAnimatedRef, AnimatedRef } from "react-native-reanimated";
import ThemedText from "@/components/base/ThemedText";
import { Image } from "expo-image";
import { vw } from "@/helpers/viewport";
import styles from "@/style/ui/MainScrollViewStyle";
import { theme } from "@/style/ui/Theme";

// Mapping of header image filenames to require statements
const headerImages: Record<string, any> = {
  "home-bkg": require("@/assets/images/home.webp"),
  "deck-bkg": require("@/assets/images/deck.webp"),
  "advanced-search-bkg": require("@/assets/images/advanced-search.webp"),
  "free-search-bkg": require("@/assets/images/free-search.webp"),
  "card-bkg": require("@/assets/images/card.webp"),
  "watchlist-bkg": require("@/assets/images/watchlist.webp"),
};

type Props = PropsWithChildren<{
  headerImage: string;
  headerTitle: string;
  scrollRef?: AnimatedRef<Animated.ScrollView>;
}>;

export default function MainScrollView({ children, headerImage, headerTitle, scrollRef }: Props) {
  const internalScrollRef = useAnimatedRef<Animated.ScrollView>();
  const usedScrollRef = scrollRef || internalScrollRef;
  // Get the image source from the mapping
  const headerImageSource = headerImages[headerImage];

  return (
    <Animated.ScrollView
      ref={usedScrollRef}
      scrollEventThrottle={16}
    >
      <View style={styles.header}>
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
              type="h1"
              color={theme.colors.white}
              fontSize={
                headerTitle && headerTitle.toString().length > 25
                  ? vw(2.3)
                  : headerTitle && headerTitle.toString().length > 16
                  ? vw(2.5)
                  : undefined
              }
              style={[
                styles.headerTitle,
                headerTitle && headerTitle.toString().length > 25
                  ? { lineHeight: vw(9.5) }
                  : headerTitle && headerTitle.toString().length > 16
                  ? { lineHeight: vw(10.5) }
                  : null,
              ]}
            >
              {headerTitle}
            </ThemedText>
          </View>
        </View>
      </View>
      <View style={styles.content}>{children}</View>
    </Animated.ScrollView>
  );
}
