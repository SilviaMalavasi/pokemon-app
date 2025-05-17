import React, { useState } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import ThemedText from "@/components/base/ThemedText";
import { CardType } from "@/types/PokemonCardType";
import styles from "@/style/CompactCardStyle";
import cardImages from "@/helpers/cardImageMapping";
import { Link } from "expo-router";
import { vw } from "@/helpers/viewport";
import { theme } from "@/style/ui/Theme";
import { useSearchFormContext } from "./context/SearchFormContext"; // Added

function getCardImage(imagePath: string) {
  if (!imagePath) return undefined;
  const filename = imagePath.split("/").pop() || "";
  return cardImages[filename];
}

interface CompactCardProps {
  card: Pick<CardType, "cardId" | "name" | "imagesLarge">;
  onImageLoad?: () => void;
  loading?: boolean;
  disableLink?: boolean; // New prop to control link behavior
}

export default function CompactCard({ card, onImageLoad, loading, disableLink }: CompactCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const imageSource = getCardImage(card.imagesLarge);
  const { setFromCardId } = useSearchFormContext(); // Added

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", minHeight: vw(68) }]}>
        <ActivityIndicator
          size="large"
          color={theme.colors.purple}
        />
      </View>
    );
  }

  const cardContent = (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {imageSource ? (
          <View>
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => {
                setImageLoading(false);
                if (onImageLoad) onImageLoad();
              }}
            />
            {imageLoading && (
              <ActivityIndicator
                style={{ position: "absolute" }}
                size="small"
                color={theme.colors.purple}
              />
            )}
          </View>
        ) : null}
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="h4">
          {card.name}{" "}
          <ThemedText
            type="default"
            style={{ textTransform: "uppercase" }}
            color={theme.colors.purple}
          >
            {card.cardId}
          </ThemedText>
        </ThemedText>
      </View>
    </View>
  );

  if (disableLink) {
    return cardContent;
  }

  // Modified Link to include onPress to set fromCardId
  return (
    <Link
      href={{ pathname: "/cards/[cardId]", params: { cardId: card.cardId } }}
      onPress={() => {
        setFromCardId(true);
      }}
    >
      {cardContent}
    </Link>
  );
}
