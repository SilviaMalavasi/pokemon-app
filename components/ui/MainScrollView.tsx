import type { PropsWithChildren } from "react";
import { View, ScrollView } from "react-native";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import ThemedText from "@/components/base/ThemedText";
import { Image } from "expo-image";
import { vw } from "@/helpers/viewport";
import styles from "@/style/ui/MainScrollViewStyle";
import { theme } from "@/style/ui/Theme";

const headerImages: Record<string, any> = {
  "home-bkg": require("@/assets/images/home.webp"),
  "deck-builder-bkg": require("@/assets/images/deck-builder.webp"),
  "deck-bkg": require("@/assets/images/deck.webp"),
  "advanced-search-bkg": require("@/assets/images/advanced-search.webp"),
  "free-search-bkg": require("@/assets/images/free-search.webp"),
  "search-results-bkg": require("@/assets/images/search-results.webp"),
  "card-bkg": require("@/assets/images/card.webp"),
  "watchlist-bkg": require("@/assets/images/watchlist.webp"),
};

type MainScrollViewProps = PropsWithChildren<{
  headerImage: string;
  headerTitle: string;
  scrollRef?: React.RefObject<ScrollView>;
}>;

export default function MainScrollView({ children, headerImage, headerTitle, scrollRef }: MainScrollViewProps) {
  const bottom = useBottomTabOverflow();
  const headerImageSource = headerImages[headerImage];

  return (
    <ScrollView
      ref={scrollRef}
      scrollIndicatorInsets={{ bottom }}
      contentContainerStyle={{ paddingBottom: bottom, backgroundColor: theme.colors.background }}
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
              fontSize={
                headerTitle && headerTitle.toString().length > 30
                  ? vw(2)
                  : headerTitle && headerTitle.toString().length > 14
                  ? vw(1.8)
                  : undefined
              }
              style={[
                styles.headerTitle,
                headerTitle && headerTitle.toString().length > 30
                  ? { lineHeight: vw(10) }
                  : headerTitle && headerTitle.toString().length > 14
                  ? { lineHeight: vw(9.3) }
                  : null,
              ]}
            >
              {headerTitle}
            </ThemedText>
          </View>
        </View>
      </View>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
}
