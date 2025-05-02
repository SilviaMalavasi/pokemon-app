import React, { useState } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import { CardType } from "@/types/PokemonCardType";
import CompactCardStyle from "@/style/CompactCardStyle";
import cardImages from "@/db/cardImages";
import { Link } from "expo-router";
import { vw } from "@/helpers/viewport";
import { theme } from "@/style/ui/Theme";

function getCardImage(imagePath: string) {
  if (!imagePath) return undefined;
  const filename = imagePath.split("/").pop() || "";
  return cardImages[filename];
}

interface CompactCardProps {
  card: Pick<CardType, "cardId" | "name" | "imagesSmall">;
  onImageLoad?: () => void;
  loading?: boolean;
}

export default function CompactCard({ card, onImageLoad, loading }: CompactCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const imageSource = getCardImage(card.imagesSmall);

  if (loading) {
    return (
      <ThemedView
        style={[CompactCardStyle.container, { justifyContent: "center", alignItems: "center", minHeight: vw(68) }]}
      >
        <ActivityIndicator
          size="large"
          color={theme.colors.textAlternative}
        />
      </ThemedView>
    );
  }

  return (
    <Link href={{ pathname: "/cards/[cardId]", params: { cardId: card.cardId } }}>
      <ThemedView style={CompactCardStyle.container}>
        <View style={CompactCardStyle.imageContainer}>
          {imageSource ? (
            <View style={{ position: "relative", justifyContent: "center", alignItems: "center" }}>
              <Image
                source={imageSource}
                style={CompactCardStyle.image}
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
                  color={theme.colors.textAlternative}
                />
              )}
            </View>
          ) : null}
        </View>
        <View style={CompactCardStyle.textContainer}>
          <ThemedText
            type="default"
            style={{ textAlign: "center" }}
          >
            {card.name}
          </ThemedText>
        </View>
      </ThemedView>
    </Link>
  );
}
