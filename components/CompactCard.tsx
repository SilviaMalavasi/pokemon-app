import React, { useState } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import { CardType } from "@/types/PokemonCardType";
import CompactCardStyle from "@/style/CompactCardStyle";
import cardImages from "@/db/cardImages";
import { Link } from "expo-router";
import { Colors } from "@/style/base/Colors";

function getCardImage(imagePath: string) {
  if (!imagePath) return undefined;
  const filename = imagePath.split("/").pop() || "";
  return cardImages[filename];
}

interface CompactCardProps {
  card: Pick<CardType, "cardId" | "name" | "imagesSmall">;
  onImageLoad?: () => void;
}

export default function CompactCard({ card, onImageLoad }: CompactCardProps) {
  const [loading, setLoading] = useState(true);
  const imageSource = getCardImage(card.imagesSmall);

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
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => {
                  setLoading(false);
                  if (onImageLoad) onImageLoad();
                }}
              />
              {loading && (
                <ActivityIndicator
                  style={{ position: "absolute" }}
                  size="small"
                  color={Colors.highlight}
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
