import React from "react";
import { View, Image } from "react-native";
import ThemedView from "@/components/base/ThemedView";
import ThemedText from "@/components/base/ThemedText";
import { CardType } from "@/types/PokemonCardType";
import CompactCardStyle from "@/style/CompactCardStyle";
import cardImages from "@/db/cardImages";

function getCardImage(imagePath: string) {
  if (!imagePath) return undefined;
  const filename = imagePath.split("/").pop() || "";
  return cardImages[filename];
}

interface CompactCardProps {
  card: Pick<CardType, "cardId" | "name" | "imagesSmall">;
}

export default function CompactCard({ card }: CompactCardProps) {
  return (
    <ThemedView style={CompactCardStyle.container}>
      {getCardImage(card.imagesSmall) ? (
        <Image
          source={getCardImage(card.imagesSmall)}
          style={CompactCardStyle.image}
          resizeMode="contain"
        />
      ) : null}
      <View style={CompactCardStyle.textContainer}>
        <ThemedText
          type="default"
          style={{ textAlign: "center" }}
        >
          {card.name}
        </ThemedText>
      </View>
    </ThemedView>
  );
}
